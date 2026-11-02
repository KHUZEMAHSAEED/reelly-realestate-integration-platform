import type {
  ReellyProject,
  ReellyProjectMarker,
  ReellyDeveloper,
  BitrixDealContext,
  ReellyPagination,
  Currency
} from '../types';
import { demoApi, setDemoProjectResolver } from './demoApi';

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string }> = {
  AED: { symbol: 'AED', rate: 1.0, label: 'UAE Dirham' },
  USD: { symbol: '$', rate: 0.27229, label: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.2518, label: 'Euro' },
  GBP: { symbol: '£', rate: 0.2185, label: 'British Pound' }
};

export function formatPrice(amountAed: number | undefined | null, currency: Currency = 'AED'): string {
  if (amountAed === undefined || amountAed === null || isNaN(amountAed)) return 'Price on Request';
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.AED;
  const converted = Math.round(amountAed * conf.rate);

  if (currency === 'AED') {
    return `AED ${converted.toLocaleString()}`;
  }
  return `${conf.symbol}${converted.toLocaleString()}`;
}

// Short form for dense surfaces such as map pins: "AED 2.9M", "$795K"
export function formatPriceCompact(amountAed: number | undefined | null, currency: Currency = 'AED'): string {
  if (!amountAed) return 'POA';
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.AED;
  const value = amountAed * conf.rate;
  const short = value >= 1e6 ? `${(value / 1e6).toFixed(value >= 1e8 ? 0 : 1).replace(/\.0$/, '')}M` : `${Math.round(value / 1e3)}K`;
  return currency === 'AED' ? `AED ${short}` : `${conf.symbol}${short}`;
}

const API_BASE = '/api';

const liveApi = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getProjects(params: Record<string, any> = {}): Promise<ReellyPagination<ReellyProject>> {
    const url = new URL(`${window.location.origin}${API_BASE}/projects`);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.append(k, String(v));
      }
    });
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to load projects: ${res.statusText}`);
    return res.json();
  },

  async getProject(id: string | number): Promise<ReellyProject> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error(`Project #${id} not found`);
    return res.json();
  },

  async getMarkers(): Promise<ReellyPagination<ReellyProjectMarker>> {
    const res = await fetch(`${API_BASE}/markers`);
    if (!res.ok) throw new Error('Failed to load map markers');
    return res.json();
  },

  async getDevelopers(): Promise<ReellyPagination<ReellyDeveloper>> {
    const res = await fetch(`${API_BASE}/developers`);
    if (!res.ok) throw new Error('Failed to load developers');
    return res.json();
  },

  async getBitrixDeals(): Promise<BitrixDealContext[]> {
    const res = await fetch(`${API_BASE}/bitrix/deals`);
    if (!res.ok) throw new Error('Failed to load Bitrix deals');
    return res.json();
  },

  async getBitrixDealContext(dealId: string | number): Promise<BitrixDealContext> {
    const res = await fetch(`${API_BASE}/bitrix/context/${dealId}`);
    if (!res.ok) throw new Error(`Bitrix Deal #${dealId} not found`);
    return res.json();
  },

  async attachProjectToDeal(data: {
    dealId: string | number;
    projectId: string | number;
    unitId?: string | number;
    agentNotes?: string;
  }) {
    const res = await fetch(`${API_BASE}/bitrix/attach-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to attach project to Bitrix deal');
    return res.json();
  },

  async sendProposal(data: {
    dealId: string | number;
    projectId: string | number;
    channel: 'whatsapp' | 'email';
    customMessage?: string;
  }) {
    const res = await fetch(`${API_BASE}/bitrix/send-proposal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to dispatch proposal');
    return res.json();
  },

  async getApiKeyStatus(): Promise<{ isConfigured: boolean; maskedKey: string | null; hasEnvKey: boolean }> {
    const res = await fetch(`${API_BASE}/settings/reelly-key`);
    return res.json();
  },

  async setApiKey(apiKey: string) {
    const res = await fetch(`${API_BASE}/settings/reelly-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    return res.json();
  },

  async testConnection(apiKey?: string) {
    const res = await fetch(`${API_BASE}/settings/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    return res.json();
  }
};

// Backend resolution: the Express BFF serves everything; the Vercel function (api/router.ts) serves the
// catalog only (capabilities.crm === false), so Bitrix CRM calls run in-browser; with no backend at all
// (or VITE_DEMO_MODE=true) the whole app runs on the bundled sample catalog.
type Backend = typeof liveApi;

const CRM_METHODS = new Set<keyof Backend>(['getBitrixDeals', 'getBitrixDealContext', 'attachProjectToDeal', 'sendProposal']);
const FORCE_DEMO = import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.MODE === 'demo';

let demoActive = FORCE_DEMO;

const backendReady: Promise<{ catalog: Backend; crm: Backend }> = (FORCE_DEMO
  ? Promise.resolve(null)
  : fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) })
      .then(res => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : null))
      .catch(() => null)
).then(health => {
  const catalog = health ? liveApi : demoApi;
  const crm = health && health.capabilities?.crm !== false ? liveApi : demoApi;
  demoActive = !health;
  if (catalog === liveApi && crm === demoApi) {
    setDemoProjectResolver(id => liveApi.getProject(id).catch(() => undefined));
  }
  return { catalog, crm };
});

export const isDemoMode = () => demoActive;

export const api = new Proxy({} as Backend, {
  get: (_target, method: keyof Backend) =>
    async (...args: unknown[]) => {
      const { catalog, crm } = await backendReady;
      const backend = CRM_METHODS.has(method) ? crm : catalog;
      return (backend[method] as (...a: unknown[]) => unknown)(...args);
    }
});
