import {
  ReellyProject,
  ReellyDeveloper,
  ReellyProjectMarker,
  ReellyPagination
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
    this.baseUrl = process.env.REELYY_API_BASE_URL || 'https://api-reelly.up.railway.app/api/v2/clients';
    this.apiKey = process.env.REELYY_API_KEY || null;
  }

  public setApiKey(key: string) {
    this.apiKey = key;
    this.cache.clear(); // flush cache on key update
  }

  public getApiKeyStatus(): { isConfigured: boolean; maskedKey: string | null } {
    if (!this.apiKey) return { isConfigured: false, maskedKey: null };
    const masked = this.apiKey.length > 8
      ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}`
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
      const live = await this.fetchUpstream<ReellyPagination<ReellyProject>>('/projects', params);
      this.setCache(cacheKey, live, 300);
      return live;
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
      const live = await this.fetchUpstream<ReellyProject>(`/projects/${id}`, { language });
      this.setCache(cacheKey, live, 600);
      return live;
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
      const live = await this.fetchUpstream<ReellyPagination<ReellyProjectMarker>>('/projects/markers', params);
      this.setCache(cacheKey, live, 900);
      return live;
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
      const live = await this.fetchUpstream<ReellyPagination<ReellyDeveloper>>('/developers', params);
      this.setCache(cacheKey, live, 1800);
      return live;
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
        headers: { 'X-API-Key': testKey }
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
