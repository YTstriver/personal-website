import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import handler from '../api/site-views.js';
import { readSiteViews, shanghaiDay } from './site-views.js';

const config = { token: 'test-only-secret', projectId: 'test-project', teamId: 'test-team' };
const now = new Date('2026-10-06T03:04:05.000Z');
const hourlyResponse = (rows, url) => {
  const since = url.searchParams.get('since');
  const until = new Date((Math.floor(Date.parse(url.searchParams.get('until')) / 3_600_000) + 1) * 3_600_000).toISOString();
  return Response.json({ data: rows, query: { since, until } });
};
const response = (pageviews, url) => url?.pathname.endsWith('/aggregate')
  ? hourlyResponse([{ timestamp: url.searchParams.get('since'), pageviews }], url)
  : Response.json({ data: { pageviews } });

test('Asia/Shanghai changes date precisely at UTC 16:00, including year boundary', () => {
  assert.equal(shanghaiDay(new Date('2026-10-05T15:59:59.999Z')).day, '2026-10-05');
  assert.equal(shanghaiDay(new Date('2026-10-05T16:00:00.000Z')).day, '2026-10-06');
  assert.equal(new Date(shanghaiDay(now).start).toISOString(), '2026-10-05T16:00:00.000Z');
  assert.equal(shanghaiDay(new Date('2026-12-31T16:00:00.000Z')).day, '2027-01-01');
});

test('uses lifetime count without dates and Shanghai hourly aggregate with paired dates', async () => {
  const requests = [];
  const result = await readSiteViews(config, { now, fetcher: async (url, options) => {
    requests.push({ url, options });
    return response(url.searchParams.has('since') ? 7 : 42, url);
  } });
  assert.deepEqual(result, { total: 42, today: 7, status: 'ready', day: '2026-10-06', updatedAt: now.toISOString() });
  assert.equal(requests.length, 2);
  for (const { url, options } of requests) {
    assert.equal(url.origin, 'https://api.vercel.com');
    assert.equal(url.searchParams.get('projectId'), config.projectId);
    assert.equal(url.searchParams.get('teamId'), config.teamId);
    assert.equal(options.headers.Authorization, `Bearer ${config.token}`);
    assert.equal(options.redirect, 'error');
  }
  assert.equal(requests[0].url.pathname, '/v1/query/web-analytics/visits/count');
  assert.equal(requests[0].url.searchParams.has('since'), false);
  assert.equal(requests[0].url.searchParams.has('until'), false);
  assert.equal(requests[1].url.pathname, '/v1/query/web-analytics/visits/aggregate');
  assert.equal(requests[1].url.searchParams.get('since'), '2026-10-05T16:00:00.000Z');
  assert.equal(requests[1].url.searchParams.get('until'), now.toISOString());
  assert.equal(requests[1].url.searchParams.get('by'), 'hour');
  assert.equal(requests[1].url.searchParams.get('filter'), "environment eq 'production'");
  assert.equal(requests[1].url.searchParams.get('limit'), '100');
  assert.equal(JSON.stringify(result).includes(config.token), false);
});

test('real zero is ready; absent configuration is null and does not call upstream', async () => {
  const zero = await readSiteViews(config, { now, fetcher: async url => response(0, url) });
  assert.equal(zero.status, 'ready');
  assert.equal(zero.total, 0);
  assert.equal(zero.today, 0);
  const unavailable = await readSiteViews({}, { now, fetcher: () => { throw new Error('must not fetch'); } });
  assert.equal(unavailable.status, 'unavailable');
  assert.equal(unavailable.total, null);
  assert.equal(unavailable.today, null);
});

test('Shanghai midnight includes its current partial hour, even with a same-hour window', async () => {
  const midnightNow = new Date('2026-10-07T16:02:00.000Z');
  const result = await readSiteViews(config, { now: midnightNow, fetcher: async url => {
    if (url.pathname.endsWith('/count')) return response(3);
    assert.equal(url.searchParams.get('since'), '2026-10-07T16:00:00.000Z');
    assert.equal(url.searchParams.get('until'), midnightNow.toISOString());
    return hourlyResponse([{ timestamp: '2026-10-07T16:00:00.000Z', pageviews: 3 }], url);
  } });
  assert.equal(result.day, '2026-10-08');
  assert.equal(result.today, 3);
});

test('an empty hourly result is real zero; a full Shanghai day sums all 24 buckets', async () => {
  const empty = await readSiteViews(config, { now, fetcher: async url => url.pathname.endsWith('/count') ? response(0) : hourlyResponse([], url) });
  assert.equal(empty.today, 0);
  const lateNow = new Date('2026-10-06T15:59:59.999Z');
  const hours = Array.from({ length: 24 }, (_, index) => ({ timestamp: new Date(Date.parse('2026-10-05T16:00:00.000Z') + index * 3_600_000).toISOString(), pageviews: 1 }));
  const result = await readSiteViews(config, { now: lateNow, fetcher: async url => url.pathname.endsWith('/count') ? response(24) : hourlyResponse(hours, url) });
  assert.equal(result.today, 24);
});

test('UTC-day rounding cannot silently masquerade as a Shanghai hourly result', async () => {
  await assert.rejects(readSiteViews(config, { now, fetcher: async url => {
    if (url.pathname.endsWith('/count')) return response(0);
    return Response.json({ data: [], query: { since: '2026-10-05T00:00:00.000Z', until: '2026-10-06T00:00:00.000Z' } });
  } }), /invalid_analytics_response/);
});

test('invalid, duplicated, out-of-day and overflowing hourly data is rejected', async () => {
  const hour = { timestamp: '2026-10-05T16:00:00.000Z', pageviews: 1 };
  const invalid = [
    null, {}, [null], [{ ...hour, timestamp: 'Others' }],
    [{ ...hour, timestamp: '2026-10-05T15:00:00.000Z' }],
    [{ ...hour, timestamp: '2026-10-06T04:00:00.000Z' }],
    [{ ...hour, timestamp: '2026-10-05T16:01:00.000Z' }],
    [hour, hour], [{ ...hour, pageviews: '1' }], [{ ...hour, pageviews: -1 }],
    [{ ...hour, pageviews: Number.MAX_SAFE_INTEGER }, { timestamp: '2026-10-05T17:00:00.000Z', pageviews: 1 }],
  ];
  for (const rows of invalid) {
    await assert.rejects(readSiteViews(config, { now, fetcher: async url => url.pathname.endsWith('/count') ? response(Number.MAX_SAFE_INTEGER) : hourlyResponse(rows, url) }), /invalid_analytics_response/);
  }
});

test('missing, negative, fractional and inconsistent numbers cannot become real counts', async () => {
  for (const value of [undefined, null, '0', -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(readSiteViews(config, { now, fetcher: async () => response(value) }), /invalid_analytics_response/);
  }
  await assert.rejects(readSiteViews(config, {
    now, fetcher: async url => response(url.searchParams.has('since') ? 10 : 5, url),
  }), /inconsistent_analytics_response/);
});

async function withConfig(fetcher, run, configured = true) {
  const keys = ['SITE_VIEWS_VERCEL_TOKEN', 'SITE_VIEWS_PROJECT_ID', 'SITE_VIEWS_TEAM_ID'];
  const previous = keys.map(key => process.env[key]);
  const originalFetch = globalThis.fetch;
  keys.forEach((key, index) => {
    if (configured) process.env[key] = [config.token, config.projectId, config.teamId][index];
    else delete process.env[key];
  });
  globalThis.fetch = fetcher;
  try { await run(); } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
}

async function request(method = 'GET') {
  const result = { headers: {}, body: '', statusCode: 0 };
  await handler({ method, url: '/api/site-views?projectId=untrusted&token=untrusted' }, {
    setHeader(name, value) { result.headers[name] = value; },
    set statusCode(value) { result.statusCode = value; },
    end(body) { result.body = body; },
  });
  result.data = JSON.parse(result.body);
  return result;
}

test('GET returns only aggregate data and short caching; request cannot select the project', async () => {
  await withConfig(async url => {
    assert.equal(url.searchParams.get('projectId'), config.projectId);
    return response(12, url);
  }, async () => {
    const result = await request();
    assert.equal(result.statusCode, 200);
    assert.match(result.headers['Cache-Control'], /^public, max-age=0, s-maxage=\d+, must-revalidate$/);
    assert.deepEqual(Object.keys(result.data).sort(), ['day', 'status', 'today', 'total', 'updatedAt']);
    assert.equal(result.body.includes('test-only-secret'), false);
    assert.equal(result.body.includes('test-project'), false);
  });
});

test('shared cache expires before the Shanghai midnight boundary', async () => {
  const OriginalDate = globalThis.Date;
  const fixed = Date.parse('2026-10-05T15:59:59.500Z');
  globalThis.Date = class extends OriginalDate {
    constructor(...args) { super(...(args.length ? args : [fixed])); }
    static now() { return fixed; }
  };
  try {
    await withConfig(async url => response(0, url), async () => {
      const result = await request();
      assert.equal(result.headers['Cache-Control'], 'public, max-age=0, s-maxage=0, must-revalidate');
      assert.equal(result.data.day, '2026-10-05');
    });
  } finally { globalThis.Date = OriginalDate; }
});

test('403 does not expose credentials, account details or cache unavailable data', async () => {
  await withConfig(async () => new Response('private-account test-only-secret', { status: 403 }), async () => {
    const result = await request();
    assert.equal(result.statusCode, 503);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.data.status, 'unavailable');
    assert.equal(result.data.total, null);
    assert.equal(result.data.today, null);
    assert.doesNotMatch(result.body, /private-account|test-only-secret|test-project/);
  });
});

test('upstream timeout becomes unavailable with no stale cache', async () => {
  const started = Date.now();
  await withConfig((_url, { signal }) => new Promise((_resolve, reject) => {
    const guard = setTimeout(() => reject(new Error('timeout not enforced')), 6000);
    signal.addEventListener('abort', () => { clearTimeout(guard); reject(signal.reason); }, { once: true });
  }), async () => {
    const result = await request();
    assert.equal(result.statusCode, 503);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.data.total, null);
  });
  assert.ok(Date.now() - started < 5800, 'upstream did not stop within its timeout');
});

test('POST cannot record or mutate any views', async () => {
  await withConfig(() => { throw new Error('must not fetch'); }, async () => {
    const result = await request('POST');
    assert.equal(result.statusCode, 405);
    assert.equal(result.headers.Allow, 'GET');
    assert.equal(result.data.status, 'unavailable');
  });
});

test('actual local HTTP with no configuration yields unavailable, never synthetic numbers', async () => {
  const realFetch = globalThis.fetch;
  await withConfig(() => { throw new Error('upstream must not be reached'); }, async () => {
    const server = createServer(handler);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    try {
      const res = await realFetch(`http://127.0.0.1:${server.address().port}/api/site-views`);
      assert.equal(res.status, 503);
      const body = await res.json();
      assert.equal(body.status, 'unavailable');
      assert.equal(body.total, null);
      assert.equal(body.today, null);
    } finally { server.close(); await once(server, 'close'); }
  }, false);
});
