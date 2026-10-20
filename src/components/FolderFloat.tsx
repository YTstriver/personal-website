// Adapted from React Bits FolderFloat; see FolderFloat.LICENSE.md.

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent
} from 'react';
import Matter from 'matter-js';
import './FolderFloat.css';

const { Bodies, Body, Composite, Engine } = Matter;

export type FolderFloatItem = string | { label: string; value: string; src?: string; alt?: string };
export type FolderFloatTrigger = 'hover' | 'click';

export interface FolderFloatProps {
  items?: FolderFloatItem[];
  label?: string;
  sublabel?: string;
  trigger?: FolderFloatTrigger;
  defaultOpen?: boolean;
  open?: boolean;
  selected?: boolean;
  enabled?: boolean;
  onClick?: () => void;
  itemSize?: number;
  closeOnSelect?: boolean;
  physics?: boolean;
  drift?: number;
  onSelect?: (value: string, index: number) => void;
  onOpenChange?: (open: boolean) => void;
  folderColor?: string;
  frontColor?: string;
  paperColor?: string;
  itemColor?: string;
  itemTextColor?: string;
  labelColor?: string;
  width?: number;
  height?: number;
  radius?: number;
  spread?: number;
  lift?: number;
  tilt?: number;
  flapAngle?: number;
  restAngle?: number;
  openDuration?: number;
  stagger?: number;
  bounce?: number;
  className?: string;
}

type Entry = { label: string; value: string; src?: string; alt?: string };
type Size = { w: number; h: number };
type Zone = { left: number; right: number; top: number; bottom: number };
type Drag = { i: number; id: number; dx: number; dy: number; sx: number; sy: number; moved: boolean };
interface World {
  engine: Matter.Engine | null;
  bodies: Matter.Body[];
  sizes: Size[];
  raf: number;
  last: number;
  t0: number;
  drag: Drag | null;
  zone: Zone | null;
  live: boolean;
}
interface Latest {
  onSelect?: FolderFloatProps['onSelect'];
  onOpenChange?: FolderFloatProps['onOpenChange'];
  drift: number;
  reduce: boolean;
  open: boolean;
}

const DEFAULT_ITEMS: FolderFloatItem[] = [];
const GAP = 12;
const DRAG_MIN = 4;
const ZONE_PAD = 8;

const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};

const layout = (list: Entry[], spread: number, lift: number, tilt: number, itemSize: number) => {
  const rows: { items: { i: number; pw: number }[]; width: number }[] = [];
  let row: { i: number; pw: number }[] = [];
  let width = 0;
  list.forEach((_item, i) => {
    const pw = itemSize;
    if (row.length && width + GAP + pw > spread * 2) {
      rows.push({ items: row, width });
      row = [];
      width = 0;
    }
    row.push({ i, pw });
    width += (row.length > 1 ? GAP : 0) + pw;
  });
  if (row.length) rows.push({ items: row, width });
  const pos: { x: number; y: number; r: number }[] = [];
  rows.forEach((r, ri) => {
    let x = -r.width / 2;
    const shift = (ri % 2 ? 1 : -1) * Math.min(16, spread * 0.1);
    r.items.forEach(({ i, pw }) => {
      const j = jitter(i);
      pos[i] = { x: x + pw / 2 + shift + (j - 0.5) * 6, y: -lift - ri * (itemSize + GAP) - j * 6, r: tilt * (j * 2 - 1) };
      x += pw + GAP;
    });
  });
  return pos;
};

const FolderFloat: React.FC<FolderFloatProps> = ({
  items = DEFAULT_ITEMS,
  label = '技能素材',
  sublabel = '',
  trigger = 'hover',
  defaultOpen = false,
  open: controlledOpen,
  selected = false,
  enabled = true,
  onClick,
  itemSize = 48,
  closeOnSelect = true,
  physics = true,
  drift = 0.5,
  onSelect,
  onOpenChange,
  folderColor = '#ae8565',
  frontColor = '#d2b08c',
  paperColor = '#fff9ed',
  itemColor = '#fff8ec',
  itemTextColor = '#493225',
  labelColor = '#493225',
  width = 160,
  height = 118,
  radius = 12,
  spread = 90,
  lift = 32,
  tilt = 8,
  flapAngle = 34,
  restAngle = 16,
  openDuration = 520,
  stagger = 45,
  bounce = 0.3,
  className = ''
}) => {
  const [internalOpen, setOpen] = useState(defaultOpen);
  const open = enabled && (controlledOpen ?? internalOpen);
  const [visible, setVisible] = useState(true);
  const [popped, setPopped] = useState(-1);
  const [live, setLive] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const world = useRef<World>({
    engine: null,
    bodies: [],
    sizes: [],
    raf: 0,
    last: 0,
    t0: 0,
    drag: null,
    zone: null,
    live: false
  });
  const latest = useRef<Latest>({ onSelect, onOpenChange, drift, reduce: false, open });
  useLayoutEffect(() => {
    latest.current.onSelect = onSelect;
    latest.current.onOpenChange = onOpenChange;
    latest.current.drift = drift;
    latest.current.open = open;
  }, [onSelect, onOpenChange, drift, open]);
  const pointerPicked = useRef<number | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const liveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const list: Entry[] = useMemo(() => items.map(item => typeof item === 'string' ? { label: item, value: item } : item), [items]);
  const n = list.length;
  const sub = sublabel || `${n} 份素材`;
  const pos = useMemo(() => layout(list, spread, lift, tilt, itemSize), [list, spread, lift, tilt, itemSize]);

  const stopPhysics = useCallback(() => {
    const w = world.current;
    clearTimeout(liveTimer.current);
    cancelAnimationFrame(w.raf);
    w.raf = 0;
    if (w.engine) {
      w.bodies.forEach((b, i) => {
        const el = pillRefs.current[i];
        if (!el) return;
        el.style.setProperty('--x', `${b.position.x.toFixed(1)}px`);
        el.style.setProperty('--y', `${(b.position.y - w.sizes[i].h / 2).toFixed(1)}px`);
      });
      Composite.clear(w.engine.world, false, true);
      Engine.clear(w.engine);
      w.engine = null;
    }
    w.bodies = [];
    w.drag = null;
    pillRefs.current.forEach(el => el?.removeAttribute('data-drag'));
    w.live = false;
    setLive(false);
  }, []);

  const startPhysics = useCallback(() => {
    const w = world.current;
    if (w.engine || !n || document.hidden || !latest.current.open) return;
    const els = pillRefs.current.slice(0, n);
    if (els.some(el => !el)) return;
    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engine.enableSleeping = false;
    w.engine = engine;
    w.sizes = (els as HTMLButtonElement[]).map(el => ({ w: el.offsetWidth, h: el.offsetHeight }));
    const ys = pos.map(p => p.y);
    const zone = {
      left: -spread - ZONE_PAD,
      right: spread + ZONE_PAD,
      top: Math.min(...ys) - ZONE_PAD,
      bottom: -lift + Math.max(...w.sizes.map(s => s.h))
    };
    w.zone = zone;
    w.bodies = els.map((el, i) => {
      const { w: bw, h: bh } = w.sizes[i];
      const b = Bodies.rectangle(pos[i].x, pos[i].y + bh / 2, bw, bh, {
        chamfer: { radius: Math.min(bh / 2 - 1, 16) },
        restitution: 0.55,
        friction: 0,
        frictionAir: 0.08,
        inertia: Infinity
      });
      (b as Matter.Body & { plugin: { phase: number } }).plugin = { phase: jitter(i) * Math.PI * 2 };
      return b;
    });
    const T = 80;
    const walls = [
      Bodies.rectangle((zone.left + zone.right) / 2, zone.top - T / 2, zone.right - zone.left + 2 * T, T, {
        isStatic: true
      }),
      Bodies.rectangle((zone.left + zone.right) / 2, zone.bottom + T / 2, zone.right - zone.left + 2 * T, T, {
        isStatic: true
      }),
      Bodies.rectangle(zone.left - T / 2, (zone.top + zone.bottom) / 2, T, zone.bottom - zone.top + 2 * T, {
        isStatic: true
      }),
      Bodies.rectangle(zone.right + T / 2, (zone.top + zone.bottom) / 2, T, zone.bottom - zone.top + 2 * T, {
        isStatic: true
      })
    ];
    Composite.add(engine.world, [...w.bodies, ...walls]);
    w.live = true;
    w.last = 0;
    w.t0 = performance.now();
    setLive(true);
    const tick = (now: number) => {
      const s = world.current;
      if (!s.engine) return;
      const dt = s.last ? Math.min(32, now - s.last) : 16;
      s.last = now;
      const t = (now - s.t0) / 1000;
      const k = latest.current.drift * 0.00005 * Math.min(1, t / 2);
      s.bodies.forEach((b, i) => {
        if (s.drag && s.drag.i === i) return;
        const ph = (b as Matter.Body & { plugin: { phase: number } }).plugin.phase;
        Body.applyForce(b, b.position, {
          x: Math.sin(t * 0.9 + ph) * k * b.mass,
          y: Math.cos(t * 1.3 + ph * 1.7) * k * b.mass
        });
      });
      Engine.update(s.engine, dt);
      s.bodies.forEach((b, i) => {
        const el = pillRefs.current[i];
        if (!el) return;
        el.style.setProperty('--x', `${b.position.x.toFixed(1)}px`);
        el.style.setProperty('--y', `${(b.position.y - s.sizes[i].h / 2).toFixed(1)}px`);
      });
      s.raf = requestAnimationFrame(tick);
    };
    w.raf = requestAnimationFrame(tick);
  }, [n, spread, lift, pos]);

  useEffect(() => {
    if (!enabled) queueMicrotask(() => setOpen(false));
  }, [enabled]);

  const set = useCallback(
    (next: boolean) => {
      if (!next) stopPhysics();
      if (latest.current.open === next) return;
      latest.current.open = next;
      if (controlledOpen === undefined) setOpen(next);
      latest.current.onOpenChange?.(next);
    },
    [stopPhysics, controlledOpen]
  );

  useEffect(() => {
    clearTimeout(liveTimer.current);
    if (!open || !physics || !visible || latest.current.reduce) {
      queueMicrotask(stopPhysics);
      return undefined;
    }
    liveTimer.current = setTimeout(startPhysics, openDuration + (n - 1) * stagger + 80);
    return () => { clearTimeout(liveTimer.current); stopPhysics(); };
  }, [open, physics, visible, openDuration, stagger, n, startPhysics, stopPhysics]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      latest.current.reduce = mq.matches;
      if (mq.matches) stopPhysics();
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [stopPhysics]);

  useEffect(() => {
    const root = anchorRef.current?.parentElement;
    let inView = true;
    const synchronize = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? false;
      synchronize();
    });
    if (root) observer.observe(root);
    document.addEventListener('visibilitychange', synchronize);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', synchronize); };
  }, []);

  useEffect(
    () => () => {
      clearTimeout(popTimer.current);
      stopPhysics();
    },
    [stopPhysics, controlledOpen]
  );

  const pick = (item: Entry, i: number) => {
    latest.current.onSelect?.(item.value, i);
    clearTimeout(popTimer.current);
    setPopped(i);
    popTimer.current = setTimeout(() => setPopped(-1), 320);
    if (closeOnSelect) set(false);
  };

  const pointerAt = (e: PointerEvent<HTMLButtonElement>) => {
    const r = anchorRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };
  const down = (e: PointerEvent<HTMLButtonElement>, i: number) => {
    pointerPicked.current = null;
    const w = world.current;
    // Reduced motion stops ambient physics, but deliberate pointer dragging
    // remains available without a continuous animation loop.
    if ((!w.live && !latest.current.reduce) || !latest.current.open || e.button !== 0) return;
    const b = w.bodies[i];
    const p = pointerAt(e);
    const size = { w: e.currentTarget.offsetWidth, h: e.currentTarget.offsetHeight };
    if (!w.live) {
      w.sizes[i] = size;
      w.zone = { left: -spread - ZONE_PAD, right: spread + ZONE_PAD,
        top: Math.min(...pos.map(position => position.y)) - ZONE_PAD, bottom: -lift + itemSize };
    }
    const x = b?.position.x ?? (parseFloat(e.currentTarget.style.getPropertyValue('--x')) || 0);
    const y = b?.position.y ?? (parseFloat(e.currentTarget.style.getPropertyValue('--y')) || 0) + size.h / 2;
    w.drag = {
      i,
      id: e.pointerId,
      dx: x - p.x,
      dy: y - p.y,
      sx: e.clientX,
      sy: e.clientY,
      moved: false
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch { /* A pointer can be released by the browser before this handler. */ }
  };
  const move = (e: PointerEvent<HTMLButtonElement>, i: number) => {
    const w = world.current;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) >= DRAG_MIN) {
      d.moved = true;
      e.currentTarget.setAttribute('data-drag', '');
    }
    if (!d.moved) return;
    const b = w.bodies[i];
    const { w: bw, h: bh } = w.sizes[i];
    const z = w.zone as Zone;
    const p = pointerAt(e);
    const x = Math.min(z.right - bw / 2, Math.max(z.left + bw / 2, p.x + d.dx));
    const y = Math.min(z.bottom - bh / 2, Math.max(z.top + bh / 2, p.y + d.dy));
    if (b) {
      Body.setVelocity(b, { x: (x - b.position.x) * 0.6, y: (y - b.position.y) * 0.6 });
      Body.setPosition(b, { x, y });
    } else {
      e.currentTarget.style.setProperty('--x', `${x.toFixed(1)}px`);
      e.currentTarget.style.setProperty('--y', `${(y - bh / 2).toFixed(1)}px`);
    }
  };
  const up = (e: PointerEvent<HTMLButtonElement>, i: number, item: Entry) => {
    const w = world.current;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    w.drag = null;
    e.currentTarget.removeAttribute('data-drag');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { /* A pointer can be released by the browser before this handler. */ }
    if (e.type === 'pointerup') {
      pointerPicked.current = i;
      if (!d.moved) pick(item, i);
    }
  };

  const hover = trigger === 'hover';

  return (
    <div
      className={`folder-float${className ? ` ${className}` : ''}`}
      data-open={open ? '' : undefined}
      data-live={live ? '' : undefined}
      data-physics={physics ? '' : undefined}
      data-trigger={trigger}
      data-selected={selected ? '' : undefined}
      data-enabled={enabled ? '' : undefined}
      onPointerEnter={hover ? e => { if (enabled && e.pointerType !== 'touch') set(true); } : undefined}
      onFocus={hover ? () => { if (enabled) set(true); } : undefined}
      onBlur={hover ? e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) set(false); } : undefined}
      onPointerLeave={
        hover
          ? () => {
              if (!world.current.drag) set(false);
            }
          : undefined
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          set(false);
        }
      }}
      style={
        {
          '--ff-w': `${width}px`,
          '--ff-item-size': `${itemSize}px`,
          '--ff-h': `${height}px`,
          '--ff-r': `${radius}px`,
          '--ff-back': folderColor,
          '--ff-front': frontColor,
          '--ff-paper': paperColor,
          '--ff-item': itemColor,
          '--ff-item-ink': itemTextColor,
          '--ff-label': labelColor,
          '--ff-spread': `${spread}px`,
          '--ff-lift': `${lift}px`,
          '--ff-cloud-top': `${Math.min(0, ...pos.map(p => p.y)) - ZONE_PAD}px`,
          '--ff-cloud-height': `${-Math.min(0, ...pos.map(p => p.y)) + itemSize + ZONE_PAD}px`,
          '--ff-angle': `${flapAngle}deg`,
          '--ff-rest': `${restAngle}deg`,
          '--ff-open': `${openDuration}ms`,
          '--ff-close': `${Math.round(openDuration * 0.6)}ms`,
          '--ff-stagger': `${stagger}ms`,
          '--ff-n': n,
          '--ff-spring': `cubic-bezier(0.34, ${(1 + bounce * 1.9).toFixed(2)}, 0.64, 1)`
        } as CSSProperties
      }
    >
      <div ref={anchorRef} className="folder-float__items">
        {list.map((item, i) => {
          const p = pos[i];
          return (
            <button
              key={`${item.value}-${i}`}
              ref={el => {
                pillRefs.current[i] = el;
              }}
              type="button"
              className="folder-float__item"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              aria-label={item.label}
              title={item.label}
              disabled={!enabled}
              data-pop={popped === i ? '' : undefined}
              style={
                {
                  '--i': i,
                  '--x': `${p.x.toFixed(1)}px`,
                  '--y': `${p.y.toFixed(1)}px`,
                  '--r': `${p.r.toFixed(2)}deg`
                } as CSSProperties
              }
              onPointerDown={e => down(e, i)}
              onPointerMove={e => move(e, i)}
              onPointerUp={e => up(e, i, item)}
              onPointerCancel={e => up(e, i, item)}
              onLostPointerCapture={e => up(e, i, item)}
              onClick={e => {
                if (e.detail === 0) pick(item, i);
                else if (pointerPicked.current === i) pointerPicked.current = null;
                else if (!world.current.live) pick(item, i);
              }}
            >
              <span className="folder-float__drift">{item.src ? <img src={item.src} alt={item.alt ?? item.label} loading="lazy" decoding="async" draggable={false} /> : <span className="folder-float__item-text">{item.label}</span>}</span>
            </button>
          );
        })}
      </div>
      <div className="folder-float__folder">
        <span className="folder-float__back" aria-hidden="true" />
        <span className="folder-float__paper" aria-hidden="true" />
        <span className="folder-float__front" aria-hidden="true">
          <span className="folder-float__label">{label}</span>
          <span className="folder-float__sub">{sub}</span>
        </span>
        <button
          type="button"
          className="folder-float__trigger"
          aria-expanded={open}
          aria-pressed={selected}
          disabled={!enabled}
          aria-label={`${label}, ${sub}`}
          onClick={() => {
            if (!enabled) return;
            if (trigger === 'click') set(!open);
            else set(true);
            onClick?.();
          }}
        />
      </div>
    </div>
  );
};

export default FolderFloat;
