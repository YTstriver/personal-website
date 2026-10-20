import { useEffect, useState } from 'react';

export type SiteViews = {
  total: number | null;
  today: number | null;
  status: 'loading' | 'ready' | 'unavailable';
};

const empty: SiteViews = { total: null, today: null, status: 'unavailable' };
const shanghaiDate = () => new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);

export function useSiteViews(): SiteViews {
  const [views, setViews] = useState<SiteViews>({ total: null, today: null, status: 'loading' });

  useEffect(() => {
    let stopped = false;
    let displayedDay = shanghaiDate();
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      const currentDay = shanghaiDate();
      if (currentDay !== displayedDay) {
        displayedDay = currentDay;
        setViews({ total: null, today: null, status: 'loading' });
      }
      controller?.abort();
      controller = new AbortController();
      const activeController = controller;
      const timeout = setTimeout(() => activeController.abort(), 7000);
      try {
        const response = await fetch('/api/site-views', {
          credentials: 'omit', signal: activeController.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('unavailable');
        const data = await response.json();
        if (data?.status !== 'ready' || data.day !== shanghaiDate()
          || !Number.isSafeInteger(data.total) || data.total < 0
          || !Number.isSafeInteger(data.today) || data.today < 0 || data.today > data.total) throw new Error('unavailable');
        if (!stopped && controller === activeController) setViews({ total: data.total, today: data.today, status: 'ready' });
      } catch {
        if (!stopped && controller === activeController) setViews(empty);
      } finally {
        clearTimeout(timeout);
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      const nextMidnight = Date.parse(`${shanghaiDate()}T00:00:00+08:00`) + 86_400_000;
      // Refresh at midnight or every five minutes while visible. No tracking
      // identifiers, localStorage counters or synthetic visitor numbers.
      timer = setTimeout(() => {
        if (!document.hidden) void refresh();
        schedule();
      }, Math.min(300_000, Math.max(1000, nextMidnight - Date.now() + 100)));
    };
    const onVisible = () => { if (!document.hidden) void refresh(); };
    void refresh();
    schedule();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      controller?.abort();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return views;
}
