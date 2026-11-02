// Vercel Function: read-only Reelly catalog gateway for the hosted deploy.
// vercel.json rewrites /api/<path> to /api/router?path=<path>, so every endpoint lands here.
// The Reelly key lives in the REELLY_API_KEY environment variable and never reaches the browser.
// Bitrix24 CRM endpoints are intentionally absent: serverless instances keep no shared state,
// so the client runs the CRM workspace in-browser (see client/src/services/demoApi.ts).
import { ReellyClient } from '../server/src/reellyClient.js';

// Reused across invocations on a warm instance so ReellyClient's TTL cache stays useful
let client: ReellyClient | null = null;
let clientKey: string | undefined;

function getClient(): ReellyClient {
  const apiKey = process.env.REELLY_API_KEY;
  if (!client || clientKey !== apiKey) {
    client = new ReellyClient({ apiKey: apiKey || null, baseUrl: process.env.REELLY_API_BASE_URL });
    clientKey = apiKey;
  }
  return client;
}

const json = (data: unknown, status = 200, cacheSeconds = 0) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // CDN-cache catalog responses at the edge; browsers always revalidate
      'Cache-Control': cacheSeconds ? `public, max-age=0, s-maxage=${cacheSeconds}, stale-while-revalidate=60` : 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });

const num = (v: string | null) => (v ? Number(v) : undefined);
const str = (v: string | null, max = 100) => (v ? v.slice(0, max) : undefined);

function resolvePath(url: URL): string {
  const rewritten = url.searchParams.get('path');
  const raw = rewritten ?? url.pathname.replace(/^\/api\/?/, '');
  return raw.replace(/^\/+|\/+$/g, '');
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = resolvePath(url);
  const q = url.searchParams;
  const reelly = getClient();

  try {
    if (path === 'health') {
      return json({
        status: 'ok',
        service: 'Reelly Luxe catalog gateway (Vercel)',
        capabilities: { crm: false },
        timestamp: new Date().toISOString()
      });
    }

    if (path === 'settings/reelly-key') {
      return json({ ...reelly.getApiKeyStatus(), hasEnvKey: Boolean(process.env.REELLY_API_KEY) });
    }

    if (path === 'projects') {
      const data = await reelly.getProjects({
        limit: num(q.get('limit')),
        offset: num(q.get('offset')),
        language: str(q.get('language'), 10),
        country: str(q.get('country')),
        region: str(q.get('region')),
        developer: str(q.get('developer')),
        status: str(q.get('status')),
        sale_status: str(q.get('sale_status')),
        search: str(q.get('search')),
        min_price: num(q.get('min_price')),
        max_price: num(q.get('max_price'))
      });
      return json(data, 200, 300);
    }

    const projectMatch = path.match(/^projects\/([^/]{1,64})$/);
    if (projectMatch) {
      const project = await reelly.getProjectById(projectMatch[1], str(q.get('language'), 10) || 'en-us');
      return project ? json(project, 200, 600) : json({ error: `Project with ID ${projectMatch[1]} not found` }, 404);
    }

    const params = Object.fromEntries([...q].filter(([k]) => k !== 'path'));
    if (path === 'markers') {
      return json(await reelly.getMarkers(params), 200, 900);
    }

    if (path === 'developers') {
      return json(await reelly.getDevelopers(params), 200, 1800);
    }

    return json({ error: 'Not found' }, 404);
  } catch {
    return json({ error: 'Upstream catalog request failed' }, 502);
  }
}

export async function POST(request: Request): Promise<Response> {
  const path = resolvePath(new URL(request.url));
  if (path.startsWith('settings/')) {
    return json({ success: false, message: 'The Reelly API key for this deployment is managed as a Vercel environment variable (REELLY_API_KEY).' }, 403);
  }
  return json({ error: 'Method not allowed' }, 405);
}
