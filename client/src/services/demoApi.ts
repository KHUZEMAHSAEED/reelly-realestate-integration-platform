// In-browser backend used when the Express BFF is not reachable (e.g. static-only hosting).
// Mirrors the BFF's REST behaviour over the same curated catalog the server falls back to.
import {
  MOCK_PROJECTS,
  MOCK_PROJECT_MARKERS,
  MOCK_DEVELOPERS,
  MOCK_BITRIX_DEALS
} from '../../../server/src/mockData.ts';
import type {
  ReellyProject,
  ReellyProjectMarker,
  ReellyDeveloper,
  BitrixDealContext,
  ReellyPagination
} from '../types';

const STORAGE_KEY = 'reelly-demo-deals-v1';

function paginate<T>(results: T[]): ReellyPagination<T> {
  return { count: results.length, next: null, previous: null, results };
}

function loadDeals(): Record<string, BitrixDealContext> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Storage unavailable (private mode) - fall through to seed data
  }
  return structuredClone(MOCK_BITRIX_DEALS) as Record<string, BitrixDealContext>;
}

const deals = loadDeals();

function persistDeals() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch {
    // Non-critical: demo state simply won't survive a reload
  }
}

function getDeal(dealId: string | number): BitrixDealContext {
  const id = String(dealId);
  if (!Object.prototype.hasOwnProperty.call(deals, id)) {
    throw new Error(`Deal #${id} not found in Bitrix24`);
  }
  return deals[id];
}

// CRM actions resolve projects through the active catalog (live Reelly or the sample set)
let resolveProject = async (id: string | number): Promise<ReellyProject | undefined> =>
  MOCK_PROJECTS.find(p => String(p.id) === String(id));

export function setDemoProjectResolver(resolver: (id: string | number) => Promise<ReellyProject | undefined>) {
  resolveProject = resolver;
}

async function getProjectOrThrow(id: string | number): Promise<ReellyProject> {
  const project = await resolveProject(id);
  if (!project) throw new Error(`Project #${id} not found`);
  return project;
}

const sanitize = (text: unknown, fallback: string) =>
  typeof text === 'string' && text.trim() ? text.trim().slice(0, 500).replace(/[\r\n\t]/g, ' ') : fallback;

export const demoApi = {
  async getHealth() {
    return { status: 'ok', service: 'Reelly Luxe static demo', timestamp: new Date().toISOString() };
  },

  async getProjects(): Promise<ReellyPagination<ReellyProject>> {
    return paginate(MOCK_PROJECTS);
  },

  async getProject(id: string | number): Promise<ReellyProject> {
    const project = MOCK_PROJECTS.find(p => String(p.id) === String(id));
    if (!project) throw new Error(`Project #${id} not found`);
    return project;
  },

  async getMarkers(): Promise<ReellyPagination<ReellyProjectMarker>> {
    return paginate(MOCK_PROJECT_MARKERS);
  },

  async getDevelopers(): Promise<ReellyPagination<ReellyDeveloper>> {
    return paginate(MOCK_DEVELOPERS);
  },

  async getBitrixDeals(): Promise<BitrixDealContext[]> {
    return Object.values(deals);
  },

  async getBitrixDealContext(dealId: string | number): Promise<BitrixDealContext> {
    return getDeal(dealId);
  },

  async attachProjectToDeal(data: {
    dealId: string | number;
    projectId: string | number;
    unitId?: string | number;
    agentNotes?: string;
  }) {
    const deal = getDeal(data.dealId);
    const project = await getProjectOrThrow(data.projectId);
    const unit = project.unit_types?.find(u => String(u.id) === String(data.unitId)) || null;

    deal.attachedProjects = [
      ...(deal.attachedProjects || []),
      {
        attachedAt: new Date().toISOString(),
        projectId: project.id,
        projectName: project.name,
        developer: project.developer.name,
        district: project.district,
        priceFrom: project.price_from,
        currency: project.currency,
        unit,
        agentNotes: sanitize(data.agentNotes, 'Attached directly via Reelly Luxury Portal Integration')
      }
    ].slice(-50);
    deal.activityLog = [
      {
        id: `act-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'PROJECT_ATTACHED',
        text: `Attached "${project.name}" (${unit ? unit.name : 'General Project'}) to Deal timeline by ${deal.assigned_agent_name}`
      },
      ...(deal.activityLog || [])
    ].slice(0, 100);
    persistDeals();

    return {
      success: true,
      message: `Successfully attached ${project.name} to Bitrix24 Deal #${deal.deal_id}`,
      deal: { ...deal }
    };
  },

  async sendProposal(data: {
    dealId: string | number;
    projectId: string | number;
    channel: 'whatsapp' | 'email';
    customMessage?: string;
  }) {
    const deal = getDeal(data.dealId);
    const project = await getProjectOrThrow(data.projectId);
    const channel = data.channel === 'email' ? 'email' : 'whatsapp';
    const recipient = channel === 'whatsapp' ? deal.contact_phone : deal.contact_email;
    const proposalId = `PROP-${Date.now().toString(36).toUpperCase()}`;

    deal.activityLog = [
      {
        id: `act-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'PROPOSAL_SENT',
        text: `Dispatched VIP Luxury Proposal for "${project.name}" via ${channel.toUpperCase()} to ${deal.contact_name} (${recipient}). Proposal ID: ${proposalId}. Notes: ${sanitize(data.customMessage, 'Standard Luxury Packet')}`
      },
      ...(deal.activityLog || [])
    ].slice(0, 100);
    persistDeals();

    return {
      success: true,
      proposalId,
      trackingLink: `https://reelly.portal/proposal/${proposalId}`,
      channel,
      recipient,
      message: `Proposal successfully queued and dispatched to ${deal.contact_name}`,
      deal: { ...deal }
    };
  },

  async getApiKeyStatus() {
    return { isConfigured: false, maskedKey: null, hasEnvKey: false };
  },

  async setApiKey(_apiKey: string) {
    return {
      success: false,
      message: 'This public demo runs on a curated sample catalog. Live Reelly keys are configured on the server deployment.'
    };
  },

  async testConnection(_apiKey?: string) {
    return {
      success: false,
      message: 'Connection tests are disabled in the public demo. Deploy the Node.js BFF to connect a live Reelly API key.'
    };
  }
};
