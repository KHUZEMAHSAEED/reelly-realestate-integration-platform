// Cloudflare Pages Function: read-only Reelly catalog gateway for the static deploy.
// The Reelly key lives in the REELLY_API_KEY secret and never reaches the browser.
// Bitrix24 CRM endpoints are intentionally absent: Workers keep no state between requests,
// so the client runs the CRM workspace in-browser (see src/services/demoApi.ts).
import { ReellyClient } from '../../../server/src/reellyClient.ts';

interface Env {
  REELLY_API_KEY?: string;
  REELLY_API_BASE_URL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

// Reused across requests within an isolate so ReellyClient's TTL cache stays warm
let client: ReellyClient | null = null;
let clientKey: string | undefined;

function getClient(env: Env): ReellyClient {
  if (!client || clientKey !== env.REELLY_API_KEY) {
    client = new ReellyClient({ apiKey: env.REELLY_API_KEY || null, baseUrl: env.REELLY_API_BASE_URL });
    clientKey = env.REELLY_API_KEY;
  }
  return client;
}

const json = (data: unknown, status = 200, cacheSeconds = 0) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheSeconds ? `public, max-age=${cacheSeconds}` : 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });

const num = (v: string | null) => (v ? Number(v) : undefined);
const str = (v: string | null, max = 100) => (v ? v.slice(0, max) : undefined);

export const onRequest = async ({ request, env }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
  const q = url.searchParams;
  const reelly = getClient(env);

  if (request.method !== 'GET') {
    if (path.startsWith('settings/')) {
      return json({ success: false, message: 'The Reelly API key for this deployment is managed as a Cloudflare secret (REELLY_API_KEY).' }, 403);
    }
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    if (path === 'health') {
      return json({
        status: 'ok',
        service: 'Reelly Luxe catalog gateway (Cloudflare Pages)',
        capabilities: { crm: false },
        timestamp: new Date().toISOString()
      });
    }

    if (path === 'settings/reelly-key') {
      return json({ ...reelly.getApiKeyStatus(), hasEnvKey: Boolean(env.REELLY_API_KEY) });
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

    if (path === 'markers') {
      return json(await reelly.getMarkers(Object.fromEntries(q)), 200, 900);
    }

    if (path === 'developers') {
      return json(await reelly.getDevelopers(Object.fromEntries(q)), 200, 1800);
    }

    return json({ error: 'Not found' }, 404);
  } catch {
    return json({ error: 'Upstream catalog request failed' }, 502);
  }
};
