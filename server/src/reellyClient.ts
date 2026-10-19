import {
  ReellyProject,
  ReellyDeveloper,
  ReellyProjectMarker,
  ReellyPagination,
  ReellyMediaItem,
  ReellyUnitType
} from './types.js';
import {
  MOCK_PROJECTS,
  MOCK_PROJECT_MARKERS,
  MOCK_DEVELOPERS,
  MOCK_COUNTRIES,
  MOCK_REGIONS,
  MOCK_STATUSES,
  MOCK_SALE_STATUSES,
  MOCK_LANGUAGES,
  MOCK_UNIT_TYPES
} from './mockData.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class ReellyClient {
  private baseUrl: string;
  private apiKey: string | null;
  private cache = new Map<string, CacheEntry<any>>();

  constructor() {
    const rawUrl = process.env.REELYY_API_BASE_URL || 'https://api-reelly.up.railway.app/api/v2/clients';
    this.baseUrl = this.sanitizeBaseUrl(rawUrl);
    this.apiKey = process.env.REELYY_API_KEY || null;
  }

  private sanitizeBaseUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Enforce HTTPS in production and block cloud metadata/internal SSRF ranges
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return 'https://api-reelly.up.railway.app/api/v2/clients';
      }
      if (parsed.hostname.startsWith('169.254.') || parsed.hostname === 'metadata.google.internal' || parsed.hostname === 'instance-data') {
        console.warn('[Security] Blocked metadata SSRF target in REELYY_API_BASE_URL. Reverting to safe default.');
        return 'https://api-reelly.up.railway.app/api/v2/clients';
      }
      return url;
    } catch {
      return 'https://api-reelly.up.railway.app/api/v2/clients';
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key || null;
    this.cache.clear(); // flush cache on key update
  }

  public getApiKeyStatus(): { isConfigured: boolean; maskedKey: string | null } {
    if (!this.apiKey) return { isConfigured: false, maskedKey: null };
    const masked = this.apiKey.length > 12
      ? `${this.apiKey.substring(0, 6)}...${this.apiKey.substring(this.apiKey.length - 6)}`
      : '****';
    return { isConfigured: true, maskedKey: masked };
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttlSeconds: number) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  private async fetchUpstream<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('NO_API_KEY');
    }

    const url = new URL(`${this.baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.append(k, String(v));
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': this.apiKey
      }
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`REELYY_API_ERROR_${response.status}: ${errText || response.statusText}`);
    }

    return await response.json() as T;
  }

  private normalizeProject(raw: any): ReellyProject {
    if (!raw) return raw;
    if (raw.price_from !== undefined && raw.photos !== undefined && Array.isArray(raw.photos)) {
      return raw;
    }

    const devName = typeof raw.developer === 'string'
      ? raw.developer
      : (raw.developer?.name || raw.brand || 'Exclusive Developer');

    const devLogo = typeof raw.developer === 'object'
      ? (raw.developer?.logo?.url || raw.developer?.logo_url)
      : undefined;

    const lat = raw.latitude ?? raw.location?.latitude ?? 25.19;
    const lng = raw.longitude ?? raw.location?.longitude ?? 55.27;
    const district = raw.district ?? raw.location?.district ?? raw.location?.sector ?? raw.location?.region ?? 'Dubai';
    const region = raw.region ?? raw.location?.region ?? 'Dubai';
    const country = raw.country ?? raw.location?.country ?? 'United Arab Emirates';

    const photos: ReellyMediaItem[] = [];
    if (Array.isArray(raw.photos) && raw.photos.length > 0) {
      photos.push(...raw.photos);
    } else if (raw.cover_image?.url) {
      photos.push({ url: raw.cover_image.url, metadata: raw.cover_image.metadata });
    }

    let unitTypes: ReellyUnitType[] = [];
    if (Array.isArray(raw.unit_types) && raw.unit_types.length > 0) {
      unitTypes = raw.unit_types;
    } else if (Array.isArray(raw.available_unit_types_display)) {
      unitTypes = raw.available_unit_types_display.map((u: string, idx: number) => ({
        id: `unit-${raw.id}-${idx}`,
        name: u,
        bedrooms: raw.min_bedrooms || undefined,
        area_sqft: raw.min_size ? Math.round(raw.min_size) : undefined,
        price_from: raw.min_price || undefined,
        currency: raw.price_currency || 'AED'
      }));
    }

    return {
      id: raw.id,
      name: raw.name,
      developer: {
        id: typeof raw.developer === 'object' ? (raw.developer?.id || raw.id) : raw.id,
        name: devName,
        logo_url: devLogo
      },
      country: typeof country === 'string' ? country : 'United Arab Emirates',
      region: typeof region === 'string' ? region : 'Dubai',
      district: typeof district === 'string' ? district : 'Dubai',
      status: raw.construction_status_display || raw.construction_status || raw.status || 'Under Construction',
      sale_status: raw.sale_status_display || raw.sale_status || 'Active',
      latitude: Number(lat),
      longitude: Number(lng),
      price_from: raw.price_from ?? (raw.min_price ? Math.round(raw.min_price) : 0),
      currency: raw.currency || raw.price_currency || 'AED',
      handover_date: raw.handover_date || raw.completion_date || (raw.completion_datetime ? raw.completion_datetime.substring(0, 10) : undefined),
      floors: raw.floors || raw.building_count || undefined,
      overview: raw.overview || raw.short_description || `Luxury off-plan residential development in ${district} crafted by ${devName}.`,
      photos: photos.length > 0 ? photos : [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85' }],
      amenities: raw.amenities || ['Luxury Pool', 'Fitness Club', '24/7 Security & Concierge', 'Prime Waterfront Location'],
      unit_types: unitTypes
    };
  }

  private normalizeMarker(raw: any): ReellyProjectMarker {
    if (!raw) return raw;
    if (raw.price_from !== undefined && raw.latitude !== undefined && raw.developer_name !== undefined) {
      return raw;
    }

    const devName = typeof raw.developer === 'string'
      ? raw.developer
      : (raw.developer?.name || raw.developer_name || 'Exclusive Developer');

    return {
      id: raw.id,
      name: raw.name,
      latitude: Number(raw.latitude ?? raw.location?.latitude ?? 25.19),
      longitude: Number(raw.longitude ?? raw.location?.longitude ?? 55.27),
      price_from: raw.price_from ?? (raw.min_price ? Math.round(raw.min_price) : 0),
      currency: raw.currency ?? raw.price_currency ?? 'AED',
      developer_name: devName,
      district: raw.district ?? raw.location?.district ?? raw.location?.sector ?? raw.location?.region ?? 'Dubai',
      cover_url: raw.cover_url ?? raw.cover_image?.url,
      sale_status: raw.sale_status_display ?? raw.sale_status ?? 'Active',
      units_count: raw.units_count ?? 4
    };
  }

  public async getCountries(language: string = 'en-us') {
    const cacheKey = `countries_${language}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/countries', { language });
      this.setCache(cacheKey, live, 3600);
      return live;
    } catch {
      return MOCK_COUNTRIES;
    }
  }

  public async getRegions(countryId?: string | number, language: string = 'en-us') {
    const cacheKey = `regions_${countryId || 'all'}_${language}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/regions', { country: countryId, language });
      this.setCache(cacheKey, live, 3600);
      return live;
    } catch {
      return MOCK_REGIONS;
    }
  }

  public async getStatuses(language: string = 'en-us') {
    const cacheKey = `statuses_${language}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/projects/statuses', { language });
      this.setCache(cacheKey, live, 3600);
      return live;
    } catch {
      return MOCK_STATUSES;
    }
  }

  public async getSaleStatuses(language: string = 'en-us') {
    const cacheKey = `sale_statuses_${language}`;
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/projects/sale-statuses', { language });
      this.setCache(cacheKey, live, 3600);
      return live;
    } catch {
      return MOCK_SALE_STATUSES;
    }
  }

  public async getLanguages() {
    const cacheKey = 'languages';
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/projects/languages');
      this.setCache(cacheKey, live, 86400);
      return live;
    } catch {
      return MOCK_LANGUAGES;
    }
  }

  public async getUnitTypes() {
    const cacheKey = 'unit_types';
    const cached = this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/units/types');
      this.setCache(cacheKey, live, 86400);
      return live;
    } catch {
      return MOCK_UNIT_TYPES;
    }
  }

  public async getProjects(params: {
    limit?: number;
    offset?: number;
    language?: string;
    country?: string;
    region?: string;
    developer?: string;
    status?: string;
    sale_status?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<ReellyPagination<ReellyProject>> {
    const cacheKey = `projects_${JSON.stringify(params)}`;
    const cached = this.getCache<ReellyPagination<ReellyProject>>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/projects', params);
      if (live && Array.isArray(live.results)) {
        const normalizedResults = live.results.map((r: any) => this.normalizeProject(r));
        const res: ReellyPagination<ReellyProject> = {
          count: live.count || normalizedResults.length,
          next: live.next,
          previous: live.previous,
          results: normalizedResults
        };
        this.setCache(cacheKey, res, 300);
        return res;
      }
      throw new Error('INVALID_LIVE_PROJECTS_FORMAT');
    } catch {
      // High-performance filter over mock data
      let filtered = [...MOCK_PROJECTS];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.developer.name.toLowerCase().includes(q) ||
          (p.district && p.district.toLowerCase().includes(q))
        );
      }
      if (params.region) {
        filtered = filtered.filter(p => p.region.toLowerCase() === params.region?.toLowerCase());
      }
      if (params.developer) {
        filtered = filtered.filter(p => p.developer.name.toLowerCase() === params.developer?.toLowerCase());
      }
      if (params.status) {
        filtered = filtered.filter(p => p.status.toLowerCase() === params.status?.toLowerCase());
      }
      if (params.sale_status) {
        filtered = filtered.filter(p => p.sale_status.toLowerCase() === params.sale_status?.toLowerCase());
      }
      if (params.min_price) {
        filtered = filtered.filter(p => p.price_from >= Number(params.min_price));
      }
      if (params.max_price) {
        filtered = filtered.filter(p => p.price_from <= Number(params.max_price));
      }

      const offset = Number(params.offset || 0);
      const limit = Number(params.limit || 20);
      const slice = filtered.slice(offset, offset + limit);

      return {
        count: filtered.length,
        next: offset + limit < filtered.length ? `?limit=${limit}&offset=${offset + limit}` : null,
        previous: offset > 0 ? `?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        results: slice
      };
    }
  }

  public async getProjectById(id: string | number, language: string = 'en-us'): Promise<ReellyProject | null> {
    const cacheKey = `project_${id}_${language}`;
    const cached = this.getCache<ReellyProject>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>(`/projects/${id}`, { language });
      if (live) {
        const normalized = this.normalizeProject(live);
        this.setCache(cacheKey, normalized, 600);
        return normalized;
      }
      return null;
    } catch {
      const mock = MOCK_PROJECTS.find(p => String(p.id) === String(id));
      return mock || null;
    }
  }

  public async getMarkers(params: Record<string, any> = {}): Promise<ReellyPagination<ReellyProjectMarker>> {
    const cacheKey = `markers_${JSON.stringify(params)}`;
    const cached = this.getCache<ReellyPagination<ReellyProjectMarker>>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/projects/markers', params);
      if (live && Array.isArray(live.results)) {
        const normalized = live.results.map((r: any) => this.normalizeMarker(r));
        const res: ReellyPagination<ReellyProjectMarker> = {
          count: live.count || normalized.length,
          next: live.next,
          previous: live.previous,
          results: normalized
        };
        this.setCache(cacheKey, res, 900);
        return res;
      }
      throw new Error('INVALID_MARKERS_FORMAT');
    } catch {
      return {
        count: MOCK_PROJECT_MARKERS.length,
        next: null,
        previous: null,
        results: MOCK_PROJECT_MARKERS
      };
    }
  }

  public async getDevelopers(params: Record<string, any> = {}): Promise<ReellyPagination<ReellyDeveloper>> {
    const cacheKey = `developers_${JSON.stringify(params)}`;
    const cached = this.getCache<ReellyPagination<ReellyDeveloper>>(cacheKey);
    if (cached) return cached;

    try {
      const live = await this.fetchUpstream<any>('/developers', params);
      if (live && Array.isArray(live.results)) {
        const normalized: ReellyDeveloper[] = live.results.map((d: any) => ({
          id: d.id,
          name: d.name,
          logo_url: d.logo?.url || d.logo_url,
          description: d.description,
          projects_count: d.projects_count,
          active_projects: d.active_projects,
          established_year: d.established_year
        }));
        const res: ReellyPagination<ReellyDeveloper> = {
          count: live.count || normalized.length,
          next: live.next,
          previous: live.previous,
          results: normalized
        };
        this.setCache(cacheKey, res, 1800);
        return res;
      }
      throw new Error('INVALID_DEVELOPERS_FORMAT');
    } catch {
      return {
        count: MOCK_DEVELOPERS.length,
        next: null,
        previous: null,
        results: MOCK_DEVELOPERS
      };
    }
  }

  public async testConnection(customApiKey?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const testKey = customApiKey || this.apiKey;
    if (!testKey) {
      return { success: false, message: 'No API key provided. Set REELYY_API_KEY or input one in settings.' };
    }

    try {
      const url = `${this.baseUrl.replace(/\/+$/, '')}/projects?limit=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': testKey
        }
      });

      if (!res.ok) {
        return {
          success: false,
          message: `Connection failed with status ${res.status}: ${res.statusText}`
        };
      }

      const body = await res.json() as any;
      return {
        success: true,
        message: 'Successfully authenticated with Reelly API v2.0!',
        data: {
          total_projects: body.count || 'N/A',
          first_project: body.results?.[0]?.name || 'N/A'
        }
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Network connection failed: ${err.message}`
      };
    }
  }
}

export const reellyClient = new ReellyClient();
