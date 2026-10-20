// Adapted from React Bits DepthCarousel (https://reactbits.dev/components/depth-carousel).
// Vertical portfolio variant; see DepthCarousel.LICENSE.md for the upstream license.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap } from 'gsap';
import './DepthCarousel.css';

export interface DepthCarouselItem { id?: string; image?: string; alt?: string; caption?: string; }
export interface DepthCarouselProps {
  items?: DepthCarouselItem[];
  startIndex?: number;
  onChange?: (index: number) => void;
  onActivate?: (index: number, trigger: HTMLButtonElement) => void;
  enabled?: boolean;
  className?: string;
}

const DEFAULT_ITEMS: DepthCarouselItem[] = [];
const CARD_WIDTH = 520;
const CARD_HEIGHT = CARD_WIDTH * 9 / 16;
const DEPTH = 200;
const SPREAD = 70;
const PERSPECTIVE = 1400;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrap = (value: number, count: number) => ((value % count) + count) % count;

interface Config { count: number; enabled: boolean; }
interface Fit { scale: number; tail: number; }

export default function DepthCarousel({
  items = DEFAULT_ITEMS, startIndex = 0, onChange, onActivate, enabled = true, className = ''
}: DepthCarouselProps) {
  const count = items.length;
  const initial = clamp(startIndex, 0, Math.max(0, count - 1));
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const posRef = useRef(initial);
  const focusRef = useRef(initial);
  const fitRef = useRef<Fit>({ scale: 0.6, tail: 0 });
  const onChangeRef = useRef(onChange);
  const [active, setActive] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const configRef = useRef<Config>({ count, enabled });

  // Original position rail, with a vertical depth stack instead of a horizontal one.
  const layout = useCallback((position: number) => {
    const cfg = configRef.current;
    if (!cfg.count) return;
    const fit = fitRef.current;
    cardRefs.current.forEach((card, i) => {
      if (!card || i >= cfg.count) return;
      let distance = wrap(i - position, cfg.count);
      if (distance > cfg.count / 2) distance -= cfg.count;
      const back = Math.max(0, distance);
      const visible = distance >= -1 && distance <= 2.5;
      let opacity = distance < 0 ? Math.max(0, 1 + distance) : Math.min(1, Math.max(0, (2.5 - distance) * 2));
      if (!visible) opacity = 0;
      const brightness = Math.max(0.5, 1 - back * 0.12);
      const blur = Math.min(2, back * 0.75);
      // Outgoing covers stay inside the stage instead of zooming beyond the column.
      const y = SPREAD * distance * (distance < 0 ? 0.55 : 1);
      const z = -DEPTH * back;
      const rotation = -8 * clamp(back, 0, 1);
      card.style.top = `calc(50% - ${fit.tail / 2}px)`;
      card.style.transform = `translate(-50%, -50%) scale(${fit.scale}) translateY(${y.toFixed(2)}px) translateZ(${z.toFixed(2)}px) rotateX(${rotation.toFixed(2)}deg)`;
      card.style.opacity = opacity.toFixed(3);
      card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(2)}px)`;
      card.style.zIndex = String(Math.round(2000 - distance * 20));
      card.style.pointerEvents = cfg.enabled && visible && opacity > 0.05 ? 'auto' : 'none';
      const overlay = overlayRefs.current[i];
      if (overlay) overlay.style.opacity = clamp(back * 0.12, 0, 0.5).toFixed(3);
    });
    const root = rootRef.current;
    if (root) {
      root.style.setProperty('--dc-tail', `${fit.tail}px`);
      root.style.setProperty('--dc-card-width', `${CARD_WIDTH * fit.scale}px`);
    }
  }, []);

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const { width, height } = root.getBoundingClientRect();
    const cfg = configRef.current;
    const rearCount = Math.min(2, Math.floor(cfg.count / 2));
    const tailFor = (scale: number) => {
      let bottom = CARD_HEIGHT * scale / 2;
      for (let i = 1; i <= rearCount; i++) {
        const projection = PERSPECTIVE / (PERSPECTIVE + DEPTH * i * scale);
        bottom = Math.max(bottom, (SPREAD * i + CARD_HEIGHT * 0.51) * scale * projection);
      }
      return Math.max(0, bottom - CARD_HEIGHT * scale / 2);
    };
    // Desktop: 16px between the cover and the 24px selection rail.
    // The rail's offset is reflected in the card center in CSS.
    const sideSpace = window.matchMedia('(min-width: 761px)').matches ? 40 : 52;
    let low = 0;
    let high = Math.min(1, Math.max(0, width - sideSpace) / CARD_WIDTH);
    const availableHeight = Math.max(1, height - 92);
    for (let i = 0; i < 18; i++) {
      const mid = (low + high) / 2;
      if (CARD_HEIGHT * mid + tailFor(mid) <= availableHeight) low = mid;
      else high = mid;
    }
    fitRef.current = { scale: low, tail: tailFor(low) };
    layout(posRef.current);
  }, [layout]);

  useLayoutEffect(() => {
    configRef.current = { count, enabled };
    onChangeRef.current = onChange;
  }, [count, enabled, onChange]);

  useLayoutEffect(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
    const index = clamp(startIndex, 0, Math.max(0, count - 1));
    posRef.current = index;
    focusRef.current = index;
    // Reset selection together with a changed external item source.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(index);
    setBusy(false);
    onChangeRef.current?.(index);
    measure();
  }, [items, count, startIndex, measure]);

  useLayoutEffect(() => {
    // Disabled chapters immediately finish at their selected cover.
    tweenRef.current?.kill();
    tweenRef.current = null;
    posRef.current = focusRef.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBusy(false);
    measure();
  }, [enabled, measure]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => () => { tweenRef.current?.kill(); }, []);

  const select = useCallback((raw: number) => {
    const cfg = configRef.current;
    if (!cfg.enabled || !cfg.count) return;
    const index = wrap(raw, cfg.count);
    let delta = wrap(index - posRef.current, cfg.count);
    if (delta > cfg.count / 2) delta -= cfg.count;
    tweenRef.current?.kill();
    focusRef.current = index;
    setActive(index);
    onChangeRef.current?.(index);
    if (Math.abs(delta) < 0.001) {
      posRef.current = index;
      setBusy(false);
      layout(index);
      return;
    }
    const target = posRef.current + delta;
    const proxy = { position: posRef.current };
    setBusy(true);
    tweenRef.current = gsap.to(proxy, {
      position: target, duration: 0.65, ease: 'power3.out',
      onUpdate: () => { posRef.current = proxy.position; layout(proxy.position); },
      onComplete: () => {
        posRef.current = index;
        tweenRef.current = null;
        setBusy(false);
        layout(index);
      }
    });
  }, [layout]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'ArrowUp') { event.preventDefault(); select(focusRef.current - 1); }
    else if (event.key === 'ArrowDown') { event.preventDefault(); select(focusRef.current + 1); }
    else if (event.key === 'Home') { event.preventDefault(); select(0); }
    else if (event.key === 'End') { event.preventDefault(); select(count - 1); }
  };

  return (
    <div ref={rootRef} className={`depth-carousel ${className}`.trim()}
      style={{ '--dc-perspective': `${PERSPECTIVE}px`, '--dc-tail': '0px' } as CSSProperties}
      role="group" aria-roledescription="carousel" aria-label="视频作品轮播"
      tabIndex={enabled && count ? 0 : -1} onKeyDown={onKeyDown}>
      <div className="depth-carousel__stage">
        {items.map((item, i) => (
          <button key={item.id || `${item.image}-${i}`} type="button" className="depth-carousel__card"
            ref={element => { cardRefs.current[i] = element; }}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            aria-label={`查看作品 ${i + 1}：${item.caption || item.alt || ''}`}
            aria-hidden={active !== i}
            aria-pressed={active === i} tabIndex={-1} disabled={!enabled}
            onClick={() => select(i)}>
            {item.image && !failedImages.has(item.image) ?
              <img className="depth-carousel__img" src={item.image} alt={item.alt || ''} draggable={false}
                loading="lazy" decoding="async" onError={() => setFailedImages(previous => new Set(previous).add(item.image!))} /> :
              <span className="depth-carousel__placeholder">{item.caption || '封面待上传'}</span>}
            <span className="depth-carousel__tint" aria-hidden="true" ref={element => { overlayRefs.current[i] = element; }} />
          </button>
        ))}
      </div>
      {onActivate && items[active] && <button type="button" className="depth-carousel__play" disabled={!enabled || busy}
        aria-label={`播放：${items[active].caption || '作品'}`} onClick={event => onActivate(focusRef.current, event.currentTarget)}>
        <svg viewBox="0 0 24 24" width="25" height="25" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>
      </button>}
      {count > 1 && <>
        <button type="button" className="depth-carousel__arrow depth-carousel__arrow--prev"
          aria-label="上一个作品" disabled={!enabled} onClick={() => select(focusRef.current - 1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className="depth-carousel__arrow depth-carousel__arrow--next"
          aria-label="下一个作品" disabled={!enabled} onClick={() => select(focusRef.current + 1)}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="depth-carousel__dots" role="group" aria-label="选择视频作品">
          {items.map((item, i) => <button key={item.id || i} type="button"
            className={`depth-carousel__dot${i === active ? ' is-active' : ''}`} disabled={!enabled}
            aria-current={i === active ? 'true' : undefined} aria-label={`切换到作品 ${i + 1}：${item.caption || ''}`}
            onClick={() => select(i)} />)}
        </div>
      </>}
      <span className="depth-carousel__status" aria-live="polite">{count ? `${active + 1} / ${count} ${items[active]?.caption || ''}` : '暂无作品'}</span>
    </div>
  );
}
