import { useSiteViews } from '../hooks/useSiteViews';
import { SITE_METADATA } from '../data/siteMetadata';
import './StudioFooter.css';

const numberFormat = new Intl.NumberFormat('zh-CN');
const compactFormat = new Intl.NumberFormat('zh-CN', { notation: 'compact', maximumFractionDigits: 1 });
const formatViews = (value: number | null) => value !== null && Number.isSafeInteger(value) && value >= 0
  ? value >= 10_000 ? compactFormat.format(value) : numberFormat.format(value)
  : '—';

export default function StudioFooter() {
  const { total, today, status } = useSiteViews();
  const statisticsHint = status === 'loading' ? '浏览统计加载中' : status === 'unavailable' ? '浏览统计暂不可用' : undefined;

  return <footer className="studio-footer studio-footer--metadata">
    <dl className="studio-footer__details" aria-label="网站信息">
      <div title={statisticsHint ?? `累计浏览：${numberFormat.format(total!)}`}><dt>累计浏览</dt><dd>{formatViews(total)}</dd></div>
      <div title={statisticsHint ?? `今日浏览：${numberFormat.format(today!)}（北京时间 00:00 起）`}><dt>今日浏览</dt><dd>{formatViews(today)}</dd></div>
      <div><dt>最近更新</dt><dd><time dateTime={SITE_METADATA.lastUpdated}>{SITE_METADATA.lastUpdated}</time></dd></div>
    </dl>
  </footer>;
}
