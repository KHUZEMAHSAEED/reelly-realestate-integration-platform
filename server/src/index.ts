import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { reellyClient } from './reellyClient.js';
import { BitrixDealContext } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory simulated Bitrix24 deals database
const BITRIX_DEALS: Record<string, BitrixDealContext & { attachedProjects?: any[]; activityLog?: any[] }> = {
  '101': {
    deal_id: '101',
    title: 'Sheikh Mohammed Al-Qasimi - Waterfront Penthouse Acquisition',
    opportunity: 35000000,
    currency: 'AED',
    stage_id: 'PREPARATION_PROPOSAL',
    location_preference: 'Dubai Harbour / Jumeirah Bay',
    bedrooms_preference: 4,
    contact_name: 'Sheikh Mohammed Al-Qasimi',
    contact_phone: '+971 50 882 1990',
    contact_email: 'office@alqasimi-holdings.ae',
    assigned_agent_name: 'Rashid Khan (Private Client Advisor)',
    attachedProjects: [],
    activityLog: [
      { id: 'act-1', date: new Date().toISOString(), type: 'NOTE', text: 'Client requested ultra-high floor with sea or marina views and private elevator access.' }
    ]
  },
  '102': {
    deal_id: '102',
    title: 'Dr. Sarah Al-Mansoor - High-Yield Creek Harbour Portfolios',
    opportunity: 7000000,
    currency: 'AED',
    stage_id: 'UNIT_SELECTION',
    location_preference: 'Dubai Creek Harbour',
    bedrooms_preference: 2,
    contact_name: 'Dr. Sarah Al-Mansoor',
    contact_phone: '+971 55 412 8831',
    contact_email: 'sarah.mansoor@meduae.org',
    assigned_agent_name: 'Elena Rostova (Senior Investment Consultant)',
    attachedProjects: [],
    activityLog: [
      { id: 'act-2', date: new Date().toISOString(), type: 'NOTE', text: 'Targeting minimum 7.5% net expected ROI with flexible post-handover payment plan.' }
    ]
  },
  '103': {
    deal_id: '103',
    title: 'Alexander Petrov - Branded Bugatti / Downtown Trophy Asset',
    opportunity: 45000000,
    currency: 'AED',
    stage_id: 'VIP_PRESENTATION',
    location_preference: 'Business Bay / Downtown Dubai',
    bedrooms_preference: 3,
    contact_name: 'Alexander Petrov',
    contact_phone: '+971 52 911 3400',
    contact_email: 'alexander.p@globalcapital.ch',
    assigned_agent_name: 'Tariq Al-Hashemi (Managing Director)',
    attachedProjects: [],
    activityLog: [
      { id: 'act-3', date: new Date().toISOString(), type: 'NOTE', text: 'Interested in automotive branded residences with private vehicular lifts.' }
    ]
  }
};

// 1. Health Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Reelly API v2.0 BFF Gateway & Bitrix24 Real Estate CRM Engine',
    timestamp: new Date().toISOString()
  });
});

// 2. Reelly API Key Management & Diagnostics
app.get('/api/settings/reelly-key', (_req: Request, res: Response) => {
  const status = reellyClient.getApiKeyStatus();
  res.json({
    ...status,
    hasEnvKey: !!process.env.REELYY_API_KEY
  });
});

app.post('/api/settings/reelly-key', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string is required' });
  }
  reellyClient.setApiKey(apiKey.trim());
  res.json({
    success: true,
    message: 'API Key successfully updated for Reelly API v2.0 engine',
    status: reellyClient.getApiKeyStatus()
  });
});

app.post('/api/settings/test-connection', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  const result = await reellyClient.testConnection(apiKey);
  res.json(result);
});

// 3. Projects Catalog & Search
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const {
      limit,
      offset,
      language,
      country,
      region,
      developer,
      status,
      sale_status,
      search,
      min_price,
      max_price
    } = req.query;

    const data = await reellyClient.getProjects({
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      language: language ? String(language) : undefined,
      country: country ? String(country) : undefined,
      region: region ? String(region) : undefined,
      developer: developer ? String(developer) : undefined,
      status: status ? String(status) : undefined,
      sale_status: sale_status ? String(sale_status) : undefined,
      search: search ? String(search) : undefined,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch projects' });
  }
});

// 4. Single Project Detail
app.get('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const language = req.query.language ? String(req.query.language) : 'en-us';
    const project = await reellyClient.getProjectById(id, language);

    if (!project) {
      return res.status(404).json({ error: `Project with ID ${id} not found` });
    }

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch project details' });
  }
});

// 5. Interactive Map Markers
app.get('/api/markers', async (req: Request, res: Response) => {
  try {
    const markers = await reellyClient.getMarkers(req.query);
    res.json(markers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch project markers' });
  }
});

// 6. Developers
app.get('/api/developers', async (req: Request, res: Response) => {
  try {
    const developers = await reellyClient.getDevelopers(req.query);
    res.json(developers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch developers' });
  }
});

// 7. Metadata / Lookup Endpoints
app.get('/api/metadata/countries', async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language) : 'en-us';
  const data = await reellyClient.getCountries(lang);
  res.json(data);
});

app.get('/api/metadata/regions', async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language) : 'en-us';
  const country = req.query.country ? String(req.query.country) : undefined;
  const data = await reellyClient.getRegions(country, lang);
  res.json(data);
});

app.get('/api/metadata/statuses', async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language) : 'en-us';
  const data = await reellyClient.getStatuses(lang);
  res.json(data);
});

app.get('/api/metadata/sale-statuses', async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language) : 'en-us';
  const data = await reellyClient.getSaleStatuses(lang);
  res.json(data);
});

app.get('/api/metadata/languages', async (_req: Request, res: Response) => {
  const data = await reellyClient.getLanguages();
  res.json(data);
});

app.get('/api/metadata/unit-types', async (_req: Request, res: Response) => {
  const data = await reellyClient.getUnitTypes();
  res.json(data);
});

// 8. Bitrix24 Real Estate CRM Integration
app.get('/api/bitrix/deals', (_req: Request, res: Response) => {
  res.json(Object.values(BITRIX_DEALS));
});

app.get('/api/bitrix/context/:dealId', (req: Request, res: Response) => {
  const dealId = Array.isArray(req.params.dealId) ? req.params.dealId[0] : req.params.dealId;
  const deal = BITRIX_DEALS[dealId];
  if (!deal) {
    return res.status(404).json({ error: `Deal #${dealId} not found in Bitrix24` });
  }
  res.json(deal);
});

app.post('/api/bitrix/attach-project', async (req: Request, res: Response) => {
  const { dealId, projectId, unitId, agentNotes } = req.body;
  const deal = BITRIX_DEALS[String(dealId)];
  if (!deal) {
    return res.status(404).json({ error: `Deal #${dealId} not found in Bitrix24` });
  }

  const project = await reellyClient.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: `Project #${projectId} not found` });
  }

  const unit = project.unit_types?.find(u => String(u.id) === String(unitId));
  const record = {
    attachedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    developer: project.developer.name,
    district: project.district,
    priceFrom: project.price_from,
    currency: project.currency,
    unit: unit || null,
    agentNotes: agentNotes || 'Attached directly via Reelly Luxury Portal Integration'
  };

  if (!deal.attachedProjects) deal.attachedProjects = [];
  deal.attachedProjects.push(record);

  if (!deal.activityLog) deal.activityLog = [];
  deal.activityLog.unshift({
    id: `act-${Date.now()}`,
    date: new Date().toISOString(),
    type: 'PROJECT_ATTACHED',
    text: `Attached "${project.name}" (${unit ? unit.name : 'General Project'}) to Deal timeline by ${deal.assigned_agent_name}`
  });

  res.json({
    success: true,
    message: `Successfully attached ${project.name} to Bitrix24 Deal #${dealId}`,
    deal
  });
});

app.post('/api/bitrix/send-proposal', async (req: Request, res: Response) => {
  const { dealId, projectId, channel, customMessage } = req.body;
  const deal = BITRIX_DEALS[String(dealId)];
  if (!deal) {
    return res.status(404).json({ error: `Deal #${dealId} not found` });
  }

  const project = await reellyClient.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: `Project #${projectId} not found` });
  }

  const proposalId = `PROP-${Date.now().toString(36).toUpperCase()}`;
  const trackingLink = `https://reelly.portal/proposal/${proposalId}`;

  deal.activityLog = deal.activityLog || [];
  deal.activityLog.unshift({
    id: `act-${Date.now()}`,
    date: new Date().toISOString(),
    type: 'PROPOSAL_SENT',
    text: `Dispatched VIP Luxury Proposal for "${project.name}" via ${channel.toUpperCase()} to ${deal.contact_name} (${channel === 'whatsapp' ? deal.contact_phone : deal.contact_email}). Proposal ID: ${proposalId}. Notes: ${customMessage || 'Standard Luxury Packet'}`
  });

  res.json({
    success: true,
    proposalId,
    trackingLink,
    channel,
    recipient: channel === 'whatsapp' ? deal.contact_phone : deal.contact_email,
    message: `Proposal successfully queued and dispatched to ${deal.contact_name}`,
    deal
  });
});

app.listen(PORT, () => {
  console.log(`[Reelly BFF Server] Running on http://localhost:${PORT}`);
  console.log(`[Reelly BFF Server] API Key status: ${reellyClient.getApiKeyStatus().isConfigured ? 'Configured' : 'Fallback Mock Mode'}`);
});
