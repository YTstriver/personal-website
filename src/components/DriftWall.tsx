// Adapted from React Bits DriftWall (https://reactbits.dev/components/drift-wall).
// Pure CSS drift and portfolio-owned photo dialogs; see DriftWall.LICENSE.md.

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import './DriftWall.css';

export interface DriftWallItem { id: string; image: string; title: string; }
export interface DriftWallProps {
  items: DriftWallItem[];
  enabled: boolean;
  onActivate: (index: number, trigger: HTMLElement) => void;
  className?: string;
}
interface Box { width: number; height: number; }
interface Photo { item: DriftWallItem; index: number; }
const wrap = (value: number, count: number) => ((value % count) + count) % count;

export default function DriftWall({ items, enabled, onActivate, className = '' }: DriftWallProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const motionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shiftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canonicalRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedRef = useRef(0);
  const revealedRef = useRef(false);
  const interactiveRef = useRef(enabled);
  const [box, setBox] = useState<Box>({ width: 480, height: 400 });
  const [selected, setSelected] = useState(0);
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const running = enabled && visible;
  const columnCount = Math.max(1, Math.min(items.length, box.width < 420 ? 2 : 3));
  const gap = 10;
  const tileWidth = Math.max(20, box.width / columnCount);
  const tileHeight = Math.max(24, tileWidth * 0.68);
  const unit = tileHeight + gap;
  const columns = useMemo(() => {
    const result: Photo[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => result[index % columnCount].push({ item, index }));
    return result;
  }, [items, columnCount]);

  useLayoutEffect(() => {
    interactiveRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const updateVisible = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', updateVisible);
    return () => {
      document.removeEventListener('visibilitychange', updateVisible);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const next = { width: Math.max(1, rect.width), height: Math.max(1, rect.height) };
      setBox(previous => Math.abs(previous.width - next.width) < 0.5 && Math.abs(previous.height - next.height) < 0.5 ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // CSS animation-play-state pauses the compositor without a zero-speed frame loop.
  useLayoutEffect(() => {
    motionRefs.current.forEach(motion => {
      if (motion) motion.style.animationPlayState = running ? 'running' : 'paused';
    });
  }, [running]);

  const positionCanonical = useCallback((index: number) => {
    if (!items.length) return;
    const next = wrap(index, items.length);
    const column = next % columnCount;
    const row = Math.floor(next / columnCount);
    const motion = motionRefs.current[column];
    const shift = shiftRefs.current[column];
    if (motion && shift) {
      // The unique keyboard/photo-dialog trigger is in the middle repeat.
      // Repeated patterns keep this shift seamless when drifting resumes.
      const phase = new DOMMatrixReadOnly(getComputedStyle(motion).transform).m42;
      const copyHeight = columns[column].length * unit;
      const target = (box.height - unit) / 2;
      shift.style.transform = `translate3d(0, ${target - (2 * copyHeight + row * unit) - phase}px, 0)`;
    }
  }, [items.length, columnCount, columns, unit, box.height]);

  useLayoutEffect(() => {
    shiftRefs.current.forEach(shift => shift?.style.removeProperty('transform'));
    // Recompute the selected original after column/size changes, including while
    // its dialog has paused the wall. Initial staggered layout stays untouched.
    if (revealedRef.current) positionCanonical(selectedRef.current);
  }, [box.width, box.height, positionCanonical]);

  useLayoutEffect(() => {
    // Mouse-driven dialog closure also restores a visible original even when
    // :focus-visible is false and the wall was resized while disabled.
    if (enabled && revealedRef.current) positionCanonical(selectedRef.current);
  }, [enabled, positionCanonical]);

  const reveal = useCallback((index: number, focus = false) => {
    if (!interactiveRef.current || !items.length) return;
    const next = wrap(index, items.length);
    selectedRef.current = next;
    revealedRef.current = true;
    setSelected(next);
    positionCanonical(next);
    if (focus) canonicalRefs.current[next]?.focus({ preventScroll: true });
  }, [items.length, positionCanonical]);

  const activate = useCallback((index: number, trigger: HTMLElement) => {
    if (!interactiveRef.current) return;
    reveal(index);
    onActivate(index, canonicalRefs.current[index] || trigger);
  }, [reveal, onActivate]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactiveRef.current || !items.length) return;
    let next: number | undefined;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = selectedRef.current + 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = selectedRef.current - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    if (next !== undefined) { event.preventDefault(); reveal(next, true); }
  };

  const movePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType !== 'mouse') return;
    const plane = planeRef.current;
    const root = rootRef.current;
    if (!plane || !root) return;
    const rect = root.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    plane.style.setProperty('--dw-turn', `${-5 + x * 2}deg`);
    plane.style.setProperty('--dw-tilt', `${6 - y * 2}deg`);
  };

  const thumbnail = (item: DriftWallItem) => item.image && !failedImages.has(item.image)
    ? <img src={item.image} alt="" loading="lazy" decoding="async" draggable={false}
        onError={() => setFailedImages(previous => new Set(previous).add(item.image))} />
    : <span className="drift-wall__fallback">{item.title || '照片暂不可用'}</span>;

  return (
    <div ref={rootRef} className={`drift-wall ${className}`.trim()} data-mode="drift"
      data-running={running} data-enabled={enabled}
      style={{ '--dw-tile-h': `${tileHeight}px`, '--dw-gap': `${gap}px` } as CSSProperties}
      role="group" aria-label="旅拍照片漂移墙" tabIndex={enabled && items.length ? 0 : -1}
      onKeyDown={onKeyDown} onPointerMove={movePointer}
      onPointerLeave={event => {
        if (event.pointerType !== 'mouse') return;
        planeRef.current?.style.removeProperty('--dw-turn');
        planeRef.current?.style.removeProperty('--dw-tilt');
      }}>
        <div className="drift-wall__viewport">
          <div ref={planeRef} className="drift-wall__plane">
            {columns.map((column, c) => {
              const copyHeight = Math.max(unit, column.length * unit);
              const copies = Math.ceil(box.height / copyHeight) + 5;
              const speed = 14 * (1 + ((c * 0.618 + 0.35) % 1 - 0.5) * 0.35);
              return <div className="drift-wall__col" key={c}>
                <div className="drift-wall__motion" ref={element => { motionRefs.current[c] = element; }}
                  style={{ '--dw-copy-height': `${copyHeight}px`, animationDuration: `${copyHeight / speed}s`,
                    animationDirection: c % 2 ? 'reverse' : 'normal', animationPlayState: running ? 'running' : 'paused',
                    animationDelay: `${-copyHeight / speed * ((c * 0.37) % 1)}s` } as CSSProperties}>
                  <div className="drift-wall__track" ref={element => { shiftRefs.current[c] = element; }}>
                    {Array.from({ length: copies }, (_, copy) => column.map(({ item, index }) =>
                      <button key={`${copy}-${item.id}`} type="button" className="drift-wall__tile" data-photo-index={index}
                        data-canonical={copy === 2} aria-hidden={copy === 2 ? undefined : true}
                        ref={element => { if (copy === 2) canonicalRefs.current[index] = element; }}
                        tabIndex={enabled && copy === 2 ? 0 : -1} aria-disabled={!enabled}
                        aria-label={`查看照片 ${index + 1}：${item.title}`}
                        onFocus={event => { if (event.currentTarget.matches(':focus-visible')) reveal(index); }}
                        onClick={event => activate(index, event.currentTarget)}>
                        <span className="drift-wall__inner">{thumbnail(item)}</span>
                      </button>))}
                  </div>
                </div>
              </div>;
            })}
          </div>
        </div>
      <span className="drift-wall__status" aria-live="polite">{items.length ? `${selected + 1} / ${items.length} ${items[selected]?.title || ''}` : '暂无照片'}</span>
    </div>
  );
}
