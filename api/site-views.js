import { readSiteViews, shanghaiDay, unavailableViews } from '../server/site-views.js';

export default async function handler(request, response) {
  const started = Date.now();
  const now = new Date();
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'no-store');
  console.info(JSON.stringify({ route: '/api/site-views', event: 'start' }));

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify(unavailableViews(now)));
    return;
  }

  try {
    const result = await readSiteViews({
      token: process.env.SITE_VIEWS_VERCEL_TOKEN,
      projectId: process.env.SITE_VIEWS_PROJECT_ID,
      teamId: process.env.SITE_VIEWS_TEAM_ID,
    }, { now });
    response.statusCode = result.status === 'ready' ? 200 : 503;
    if (result.status === 'ready') {
      // A cached "today" must not survive the Shanghai day boundary.
      const ttl = Math.max(0, Math.min(60, Math.floor((shanghaiDay(now).end - Date.now()) / 1000)));
      response.setHeader('Cache-Control', `public, max-age=0, s-maxage=${ttl}, must-revalidate`);
    }
    response.end(JSON.stringify(result));
    console.info(JSON.stringify({ route: '/api/site-views', event: 'done', status: result.status, ms: Date.now() - started }));
  } catch {
    // Do not expose upstream errors, authorization headers or account metadata.
    response.statusCode = 503;
    response.end(JSON.stringify(unavailableViews(now)));
    console.warn(JSON.stringify({ route: '/api/site-views', event: 'unavailable', ms: Date.now() - started }));
  }
}
