const COUNT_URL = 'https://api.vercel.com/v1/query/web-analytics/visits/count';
const AGGREGATE_URL = 'https://api.vercel.com/v1/query/web-analytics/visits/aggregate';
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function shanghaiDay(now = new Date()) {
  // Modern Asia/Shanghai uses UTC+8 without daylight-saving changes.
  const day = new Date(now.getTime() + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
  const start = Date.parse(`${day}T00:00:00+08:00`);
  return { day, start, end: start + DAY_MS };
}

export function unavailableViews(now = new Date()) {
  return { total: null, today: null, status: 'unavailable', day: shanghaiDay(now).day, updatedAt: now.toISOString() };
}

export async function readSiteViews(config, { now = new Date(), fetcher = fetch } = {}) {
  if (!config.token || !config.projectId) return unavailableViews(now);

  const { day, start } = shanghaiDay(now);
  const query = async (endpoint, parameters = {}) => {
    const url = new URL(endpoint);
    url.searchParams.set('projectId', config.projectId);
    if (config.teamId) url.searchParams.set('teamId', config.teamId);
    // These endpoints and all parameters are selected here, never by a request.
    for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
    const response = await fetcher(url, {
      headers: { Authorization: `Bearer ${config.token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error('analytics_unavailable');
    return response.json();
  };
  const count = async () => {
    // A lifetime count must omit both date parameters; ranged counts use UTC days.
    const payload = await query(COUNT_URL);
    const value = payload?.data?.pageviews;
    if (!Number.isSafeInteger(value) || value < 0) throw new Error('invalid_analytics_response');
    return value;
  };
  const todayCount = async () => {
    // Shanghai midnight is an exact UTC hour. Hour buckets preserve that boundary.
    const until = (Math.floor(now.getTime() / HOUR_MS) + 1) * HOUR_MS;
    const payload = await query(AGGREGATE_URL, {
      by: 'hour', since: new Date(start).toISOString(), until: now.toISOString(),
      filter: "environment eq 'production'", limit: '100',
    });
    if (!Array.isArray(payload?.data) || Date.parse(payload?.query?.since) !== start || Date.parse(payload?.query?.until) !== until) {
      throw new Error('invalid_analytics_response');
    }
    const hours = new Set();
    let value = 0;
    for (const row of payload.data) {
      const timestamp = typeof row?.timestamp === 'string' ? Date.parse(row.timestamp) : NaN;
      if (!Number.isFinite(timestamp) || timestamp % HOUR_MS !== 0 || timestamp < start || timestamp > now.getTime() || hours.has(timestamp) || !Number.isSafeInteger(row.pageviews) || row.pageviews < 0) {
        throw new Error('invalid_analytics_response');
      }
      hours.add(timestamp);
      value += row.pageviews;
      if (!Number.isSafeInteger(value)) throw new Error('invalid_analytics_response');
    }
    return value;
  };

  const [total, today] = await Promise.all([count(), todayCount()]);
  if (today > total) throw new Error('inconsistent_analytics_response');
  return { total, today, status: 'ready', day, updatedAt: now.toISOString() };
}
