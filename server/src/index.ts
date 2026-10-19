import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { reellyClient } from './reellyClient.js';
import { BitrixDealContext } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Security Cloaking: Disable X-Powered-By to prevent server stack fingerprinting
app.disable('x-powered-by');

// 2. Security Headers (OWASP Top 10 hardening)
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  // Allow framing by Bitrix24 portal domains while guarding against generic clickjacking
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *.bitrix24.com *.bitrix24.eu *.bitrix24.de *.bitrix24.ru https://*.bitrix24.com;");
  next();
});

// 3. Strict CORS Origin Policy
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.bitrix24.com')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Cross-Origin Request Blocked by Security Policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept']
}));

// Body parsing with payload size limits to prevent body-inflation DoS
app.use(express.json({ limit: '256kb' }));

// 4. In-Memory Token Bucket / Sliding-Window Rate Limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

function createRateLimiter(windowMs: number, maxRequests: number, endpointName = 'General') {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const key = `${endpointName}:${ip}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: `Too many requests to ${endpointName}. Rate limit exceeded. Retry in ${retryAfterSec}s.`
      });
    }

    record.count++;
    next();
  };
}

// Clean up stale rate-limiter records periodically
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetAt) rateLimitMap.delete(k);
  }
}, 5 * 60 * 1000);

// Rate limiter tiers
const generalApiLimiter = createRateLimiter(60 * 1000, 180, 'API Catalog');
const sensitiveSettingsLimiter = createRateLimiter(60 * 1000, 20, 'Settings & Credentials');
const proposalDispatchLimiter = createRateLimiter(60 * 1000, 30, 'Proposal Dispatch');

const JWT_API_KEY_REGEX = /^[A-Za-z0-9._-]+$/;

function getSafeDeal(dealId: unknown) {
  if (dealId === undefined || dealId === null) return null;
  const safeId = String(dealId).trim();
  // Prototype pollution defense
  if (['__proto__', 'constructor', 'prototype'].includes(safeId)) {
    return null;
  }
  if (!Object.prototype.hasOwnProperty.call(BITRIX_DEALS, safeId)) {
    return null;
  }
  return BITRIX_DEALS[safeId];
}

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
app.get('/api/settings/reelly-key', sensitiveSettingsLimiter, (_req: Request, res: Response) => {
  const status = reellyClient.getApiKeyStatus();
  res.json({
    ...status,
    hasEnvKey: !!process.env.REELYY_API_KEY
  });
});

app.post('/api/settings/reelly-key', sensitiveSettingsLimiter, (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (apiKey === undefined || apiKey === null || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string is required' });
  }
  const cleanKey = apiKey.trim();

  // Strict validation: Eliminate CRLF injection, control characters, and file tampering
  if (cleanKey.length > 0) {
    if (cleanKey.length > 1024) {
      return res.status(400).json({ error: 'API key exceeds maximum length of 1024 characters' });
    }
    if (!JWT_API_KEY_REGEX.test(cleanKey)) {
      return res.status(400).json({ error: 'Invalid API key format. Key may only contain alphanumeric characters, hyphens, dots, and underscores.' });
    }
  }

  reellyClient.setApiKey(cleanKey);

  // Persist to server/.env safely
  try {
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf-8');
    }
    if (content.includes('REELYY_API_KEY=')) {
      content = content.replace(/REELYY_API_KEY=.*/g, `REELYY_API_KEY=${cleanKey}`);
    } else {
      content += `\nREELYY_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envPath, content, 'utf-8');
  } catch (e) {
    console.warn('[Settings] Failed to persist key to server/.env:', e);
  }

  res.json({
    success: true,
    message: cleanKey ? 'API Key successfully updated for Reelly API v2.0 engine and persisted to server/.env' : 'API Key cleared. Engine running in Offline Mock Mode.',
    status: reellyClient.getApiKeyStatus()
  });
});

app.delete('/api/settings/reelly-key', sensitiveSettingsLimiter, (_req: Request, res: Response) => {
  reellyClient.setApiKey('');
  try {
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf-8');
      content = content.replace(/REELYY_API_KEY=.*/g, 'REELYY_API_KEY=');
      fs.writeFileSync(envPath, content, 'utf-8');
    }
  } catch (e) {
    console.warn('[Settings] Failed to clear key in server/.env:', e);
  }
  res.json({
    success: true,
    message: 'API Key cleared. Reverted to high-fidelity Offline Mock Mode.',
    status: reellyClient.getApiKeyStatus()
  });
});

app.post('/api/settings/test-connection', sensitiveSettingsLimiter, async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (apiKey !== undefined && apiKey !== null) {
    if (typeof apiKey !== 'string' || (apiKey.trim().length > 0 && (!JWT_API_KEY_REGEX.test(apiKey.trim()) || apiKey.trim().length > 1024))) {
      return res.status(400).json({ success: false, message: 'Invalid API key format submitted for testing.' });
    }
  }
  const result = await reellyClient.testConnection(typeof apiKey === 'string' ? apiKey.trim() : undefined);
  res.json(result);
});

// 3. Projects Catalog & Search
app.get('/api/projects', generalApiLimiter, async (req: Request, res: Response) => {
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
      search: search ? String(search).slice(0, 100) : undefined,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch projects. Please verify query parameters.' });
  }
});

// 4. Single Project Detail
app.get('/api/projects/:id', generalApiLimiter, async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = String(rawId).slice(0, 64);
    const language = req.query.language ? String(req.query.language).slice(0, 10) : 'en-us';
    const project = await reellyClient.getProjectById(id, language);

    if (!project) {
      return res.status(404).json({ error: `Project with ID ${id} not found` });
    }

    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch project details.' });
  }
});

// 5. Interactive Map Markers
app.get('/api/markers', generalApiLimiter, async (req: Request, res: Response) => {
  try {
    const markers = await reellyClient.getMarkers(req.query);
    res.json(markers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch project markers' });
  }
});

// 6. Developers
app.get('/api/developers', generalApiLimiter, async (req: Request, res: Response) => {
  try {
    const developers = await reellyClient.getDevelopers(req.query);
    res.json(developers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

// 7. Metadata / Lookup Endpoints
app.get('/api/metadata/countries', generalApiLimiter, async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language).slice(0, 10) : 'en-us';
  const data = await reellyClient.getCountries(lang);
  res.json(data);
});

app.get('/api/metadata/regions', generalApiLimiter, async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language).slice(0, 10) : 'en-us';
  const country = req.query.country ? String(req.query.country).slice(0, 50) : undefined;
  const data = await reellyClient.getRegions(country, lang);
  res.json(data);
});

app.get('/api/metadata/statuses', generalApiLimiter, async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language).slice(0, 10) : 'en-us';
  const data = await reellyClient.getStatuses(lang);
  res.json(data);
});

app.get('/api/metadata/sale-statuses', generalApiLimiter, async (req: Request, res: Response) => {
  const lang = req.query.language ? String(req.query.language).slice(0, 10) : 'en-us';
  const data = await reellyClient.getSaleStatuses(lang);
  res.json(data);
});

app.get('/api/metadata/languages', generalApiLimiter, async (_req: Request, res: Response) => {
  const data = await reellyClient.getLanguages();
  res.json(data);
});

app.get('/api/metadata/unit-types', generalApiLimiter, async (_req: Request, res: Response) => {
  const data = await reellyClient.getUnitTypes();
  res.json(data);
});

// 8. Bitrix24 Real Estate CRM Integration
app.get('/api/bitrix/deals', generalApiLimiter, (_req: Request, res: Response) => {
  res.json(Object.values(BITRIX_DEALS));
});

app.get('/api/bitrix/context/:dealId', generalApiLimiter, (req: Request, res: Response) => {
  const rawId = Array.isArray(req.params.dealId) ? req.params.dealId[0] : req.params.dealId;
  const deal = getSafeDeal(rawId);
  if (!deal) {
    return res.status(404).json({ error: `Deal #${rawId} not found in Bitrix24` });
  }
  res.json(deal);
});

app.post('/api/bitrix/attach-project', sensitiveSettingsLimiter, async (req: Request, res: Response) => {
  const { dealId, projectId, unitId, agentNotes } = req.body;
  const deal = getSafeDeal(dealId);
  if (!deal) {
    return res.status(404).json({ error: `Deal #${dealId} not found in Bitrix24` });
  }

  const cleanProjectId = String(projectId || '').slice(0, 64);
  const project = await reellyClient.getProjectById(cleanProjectId);
  if (!project) {
    return res.status(404).json({ error: `Project #${cleanProjectId} not found` });
  }

  const safeNotes = typeof agentNotes === 'string'
    ? agentNotes.trim().slice(0, 500).replace(/[\r\n\t]/g, ' ')
    : 'Attached directly via Reelly Luxury Portal Integration';

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
    agentNotes: safeNotes
  };

  // Memory capping: protect against unbounded array inflation DoS
  if (!deal.attachedProjects) deal.attachedProjects = [];
  deal.attachedProjects.push(record);
  if (deal.attachedProjects.length > 50) {
    deal.attachedProjects = deal.attachedProjects.slice(-50);
  }

  if (!deal.activityLog) deal.activityLog = [];
  deal.activityLog.unshift({
    id: `act-${Date.now()}`,
    date: new Date().toISOString(),
    type: 'PROJECT_ATTACHED',
    text: `Attached "${project.name}" (${unit ? unit.name : 'General Project'}) to Deal timeline by ${deal.assigned_agent_name}`
  });
  if (deal.activityLog.length > 100) {
    deal.activityLog = deal.activityLog.slice(0, 100);
  }

  res.json({
    success: true,
    message: `Successfully attached ${project.name} to Bitrix24 Deal #${dealId}`,
    deal
  });
});

app.post('/api/bitrix/send-proposal', proposalDispatchLimiter, async (req: Request, res: Response) => {
  const { dealId, projectId, channel, customMessage } = req.body;
  const deal = getSafeDeal(dealId);
  if (!deal) {
    return res.status(404).json({ error: `Deal #${dealId} not found` });
  }

  const cleanProjectId = String(projectId || '').slice(0, 64);
  const project = await reellyClient.getProjectById(cleanProjectId);
  if (!project) {
    return res.status(404).json({ error: `Project #${cleanProjectId} not found` });
  }

  // Safe channel resolution & message sanitization
  const safeChannel = channel === 'email' ? 'email' : 'whatsapp';
  const safeMessage = typeof customMessage === 'string'
    ? customMessage.trim().slice(0, 500).replace(/[\r\n\t]/g, ' ')
    : 'Standard Luxury Packet';

  const proposalId = `PROP-${Date.now().toString(36).toUpperCase()}`;
  const trackingLink = `https://reelly.portal/proposal/${proposalId}`;

  // Memory capping: protect against unbounded activityLog inflation DoS
  deal.activityLog = deal.activityLog || [];
  deal.activityLog.unshift({
    id: `act-${Date.now()}`,
    date: new Date().toISOString(),
    type: 'PROPOSAL_SENT',
    text: `Dispatched VIP Luxury Proposal for "${project.name}" via ${safeChannel.toUpperCase()} to ${deal.contact_name} (${safeChannel === 'whatsapp' ? deal.contact_phone : deal.contact_email}). Proposal ID: ${proposalId}. Notes: ${safeMessage}`
  });
  if (deal.activityLog.length > 100) {
    deal.activityLog = deal.activityLog.slice(0, 100);
  }

  res.json({
    success: true,
    proposalId,
    trackingLink,
    channel: safeChannel,
    recipient: safeChannel === 'whatsapp' ? deal.contact_phone : deal.contact_email,
    message: `Proposal successfully queued and dispatched to ${deal.contact_name}`,
    deal
  });
});

// Centralized error handler: Prevents sensitive stack trace leakage
app.use((err: any, _req: Request, res: Response, _next: () => void) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[Reelly BFF Server] Running on http://localhost:${PORT}`);
  console.log(`[Reelly BFF Server] API Key status: ${reellyClient.getApiKeyStatus().isConfigured ? 'Configured' : 'Fallback Mock Mode'}`);
});
