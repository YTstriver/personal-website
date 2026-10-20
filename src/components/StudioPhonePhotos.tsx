import type { StudioPhotoItem } from './StudioPortfolio';

export default function StudioPhonePhotos({ items, enabled, onActivate }: {
  items: StudioPhotoItem[];
  enabled: boolean;
  onActivate: (index: number, trigger: HTMLElement) => void;
}) {
  const columns = items.length > 18 ? 4 : 3;
  return <div className={`studio-phone-photos${columns === 4 ? ' studio-phone-photos--expanded' : ''}`} style={{ gridTemplateRows: `repeat(${Math.max(1, Math.ceil(items.length / columns))}, minmax(0, 1fr))` }} role="group" aria-label="旅拍照片">
    {items.map((item, index) => <button
      key={item.id}
      type="button"
      className="studio-phone-photos__item"
      disabled={!enabled}
      aria-label={`查看照片 ${index + 1}：${item.title}`}
      onClick={event => onActivate(index, event.currentTarget)}
    >
      <img src={item.thumbnail || item.src} alt="" loading="lazy" decoding="async" draggable={false} />
    </button>)}
  </div>;
}
