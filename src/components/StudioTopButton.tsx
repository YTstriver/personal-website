// Adapted from React Bits Sling Button; see SlingButton.LICENSE.md.
import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import './StudioTopButton.css';

const SIZE = 36, STROKE = 2, WELL = SIZE / 2 + 3 + STROKE, PAD = SIZE / 2 - STROKE / 2;
const ARM = 20, MAX_PULL = 56, LAUNCH_SPEED = 1200;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const rubberband = (value: number) => value * 9 * .55 / (9 + .55 * Math.abs(value));

interface Grip {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  moved: boolean;
  slop: number;
  distance: number;
  history: { x: number; y: number; time: number }[];
}

export default function StudioTopButton({ onReturnTop }: { onReturnTop: () => void }) {
  const hintId = useId();
  const [held, setHeld] = useState(false);
  const [armed, setArmed] = useState(false);
  const padRef = useRef<HTMLButtonElement>(null);
  const bandRef = useRef<SVGPathElement>(null);
  const hotRef = useRef<SVGPathElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const grip = useRef<Grip | null>(null);
  const direction = useRef({ x: 0, y: 1 });
  const animations = useRef<AnimationPlaybackControls[]>([]);
  const paintFrame = useRef(0);
  const dotTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dotPending = useRef(false);
  const power = useRef(0);
  const skipClick = useRef(false);
  const px = useMotionValue(0), py = useMotionValue(0);
  const transform = useMotionTemplate`translate(${px}px, ${py}px)`;

  const relaxIcon = () => {
    if (!iconRef.current) return;
    iconRef.current.style.transition = 'transform 360ms cubic-bezier(.23, 1, .32, 1)';
    iconRef.current.style.transform = 'rotate(0deg)';
  };
  const launchDots = () => {
    dotPending.current = false;
    clearTimeout(dotTimer.current);
    relaxIcon();
    if (document.hidden) return;
    const base = Math.atan2(-direction.current.y, -direction.current.x);
    dots.current.forEach((dot, index) => {
      if (!dot) return;
      dot.getAnimations().forEach(animation => animation.cancel());
      const lead = index === 0;
      const angle = base + (lead ? 0 : (Math.random() + Math.random() - 1) * Math.PI / 8);
      const x = Math.cos(angle), y = Math.sin(angle);
      const reach = 36 * (lead ? 1 : .3 + Math.random() * .7) * (.85 + .35 * power.current);
      const scale = lead ? 1 : .3 + Math.random() * .5;
      const duration = 300 * (lead ? 1 : .7 + Math.random() * .5), delay = lead ? 0 : Math.random() * 45;
      dot.animate([
        { transform: `translate(${x * WELL}px, ${y * WELL}px) scale(${scale})`, opacity: 1 },
        { opacity: 1, offset: .55 },
        { transform: `translate(${x * (WELL + reach)}px, ${y * (WELL + reach)}px) scale(${scale * .4})`, opacity: 0 },
      ], { duration, delay, easing: 'cubic-bezier(.23, 1, .32, 1)' });
    });
  };
  const paint = () => {
    paintFrame.current = 0;
    const x = px.get(), y = py.get(), distance = Math.hypot(x, y);
    const projected = x * direction.current.x + y * direction.current.y;
    const p = clamp(projected / ARM, 0, 1);
    let path = '';
    if (distance > .5) {
      const a = Math.atan2(y, x), b = Math.acos(clamp((WELL - PAD) / distance, -1, 1));
      path = [a + b, a - b].map(t => {
        const cx = Math.cos(t), cy = Math.sin(t);
        return `M${WELL * cx},${WELL * cy}L${x + PAD * cx},${y + PAD * cy}`;
      }).join('');
    }
    bandRef.current?.setAttribute('d', path);
    hotRef.current?.setAttribute('d', path);
    if (hotRef.current) hotRef.current.style.opacity = String(p);
    if (arcRef.current) {
      arcRef.current.setAttribute('stroke-dasharray', `${p} ${1 - p}`);
      arcRef.current.setAttribute('stroke-dashoffset', String(p / 2));
      arcRef.current.setAttribute('transform', `rotate(${Math.atan2(-direction.current.y, -direction.current.x) * 180 / Math.PI})`);
      arcRef.current.style.opacity = p > .01 ? '1' : '0';
    }
    if (dotPending.current && projected <= SIZE / 4) launchDots();
  };
  const schedulePaint = () => {
    if (!paintFrame.current && !document.hidden) paintFrame.current = requestAnimationFrame(paint);
  };
  useMotionValueEvent(px, 'change', schedulePaint);
  useMotionValueEvent(py, 'change', schedulePaint);

  useEffect(() => {
    const stop = () => {
      animations.current.forEach(animation => animation.stop());
      animations.current = [];
      clearTimeout(dotTimer.current);
      dotPending.current = false;
      const pointer = grip.current;
      grip.current = null;
      if (pointer) skipClick.current = true;
      if (pointer && padRef.current?.hasPointerCapture(pointer.id)) padRef.current.releasePointerCapture(pointer.id);
      px.jump(0); py.jump(0);
      cancelAnimationFrame(paintFrame.current);
      paintFrame.current = 0;
      dots.current.forEach(dot => dot?.getAnimations().forEach(animation => animation.cancel()));
      bandRef.current?.setAttribute('d', '');
      hotRef.current?.setAttribute('d', '');
      if (arcRef.current) arcRef.current.style.opacity = '0';
      if (iconRef.current) {
        iconRef.current.style.transition = 'none';
        iconRef.current.style.transform = 'rotate(0deg)';
      }
    };
    const synchronize = () => {
      if (document.hidden) { stop(); setHeld(false); setArmed(false); }
    };
    document.addEventListener('visibilitychange', synchronize);
    return () => { document.removeEventListener('visibilitychange', synchronize); stop(); };
  }, [px, py]);

  const settle = (vx = 0, vy = 0) => {
    animations.current.forEach(animation => animation.stop());
    animations.current = [
      animate(px, 0, { type: 'spring', duration: .4, bounce: .18, velocity: vx }),
      animate(py, 0, { type: 'spring', duration: .4, bounce: .18, velocity: vy }),
    ];
  };
  const fire = (strength: number) => {
    power.current = clamp(strength - 1, 0, 1);
    dotPending.current = true;
    clearTimeout(dotTimer.current);
    dotTimer.current = setTimeout(launchDots, 150);
    onReturnTop();
  };
  const tap = () => {
    if (grip.current) return;
    direction.current = { x: 0, y: 1 };
    px.jump(0); py.jump(12);
    fire(1);
    settle(0, -LAUNCH_SPEED);
  };
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !event.isPrimary || grip.current) return;
    skipClick.current = false;
    animations.current.forEach(animation => animation.stop());
    clearTimeout(dotTimer.current);
    dotPending.current = false;
    dots.current.forEach(dot => dot?.getAnimations().forEach(animation => animation.cancel()));
    event.currentTarget.focus({ preventScroll: true });
    const x = px.get(), y = py.get(), distance = Math.hypot(x, y);
    const raw = MAX_PULL * Math.min(distance, MAX_PULL * .95) / (MAX_PULL - Math.min(distance, MAX_PULL * .95));
    grip.current = { id: event.pointerId, x: event.clientX, y: event.clientY,
      baseX: distance > .5 ? raw * x / distance : 0, baseY: distance > .5 ? raw * y / distance : 0,
      moved: false, slop: event.pointerType === 'touch' ? 8 : 4, distance: 0, history: [] };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const pointer = grip.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer.moved ||= Math.hypot(dx, dy) > pointer.slop;
    const rx = rubberband(pointer.baseX + dx), ry = pointer.baseY + dy, raw = Math.hypot(rx, ry);
    const distance = MAX_PULL * raw / (MAX_PULL + raw);
    pointer.distance = distance;
    setArmed(distance >= ARM);
    if (raw < .01) { px.set(0); py.set(0); return; }
    const ux = rx / raw, uy = ry / raw;
    direction.current = { x: ux, y: uy };
    px.set(distance * ux); py.set(distance * uy);
    if (iconRef.current) {
      iconRef.current.style.transition = 'none';
      iconRef.current.style.transform = `rotate(${(Math.atan2(-uy, -ux) * 180 / Math.PI + 90) * clamp(distance / 12, 0, 1)}deg)`;
    }
    const time = performance.now();
    pointer.history.push({ x: distance * ux, y: distance * uy, time });
    while (pointer.history.length > 4 || (pointer.history.length > 1 && time - pointer.history[0].time > 80)) pointer.history.shift();
  };
  const release = (id: number, cancelled = false) => {
    const pointer = grip.current;
    if (!pointer || pointer.id !== id) return;
    grip.current = null;
    skipClick.current = pointer.moved || cancelled;
    if (padRef.current?.hasPointerCapture(id)) padRef.current.releasePointerCapture(id);
    setHeld(false); setArmed(false);
    if (!pointer.moved || cancelled) { relaxIcon(); settle(); return; }
    const strength = pointer.distance / ARM, loaded = strength >= 1;
    const first = pointer.history[0], last = pointer.history.at(-1);
    const recent = first && last && last.time > first.time && performance.now() - last.time < 50;
    const vx = recent ? clamp((last.x - first.x) / (last.time - first.time) * 1000, -1500, 1500) : 0;
    const vy = recent ? clamp((last.y - first.y) / (last.time - first.time) * 1000, -1500, 1500) : 0;
    const speed = (loaded ? 1 : .5) * LAUNCH_SPEED * Math.min(strength, 1.5);
    if (loaded) fire(strength); else relaxIcon();
    settle(clamp(vx - direction.current.x * speed, -1800, 1800), clamp(vy - direction.current.y * speed, -1800, 1800));
  };

  return <div className="studio-top">
    <span className="sling-button" data-armed={armed || undefined}>
      <svg className="sling-button__fx" viewBox="-27 -27 54 54" aria-hidden="true">
        <path ref={bandRef} className="sling-button__band" />
        <path ref={hotRef} className="sling-button__band sling-button__band--hot" />
        <circle className="sling-button__well" r={WELL} />
        <circle ref={arcRef} className="sling-button__arc" r={WELL} pathLength="1" strokeDasharray="0 1" style={{ opacity: 0 }} />
      </svg>
      {Array.from({ length: 6 }, (_, index) => <span key={index} ref={element => { dots.current[index] = element; }} className="sling-button__dot" aria-hidden="true" />)}
      <motion.span className="sling-button__move" style={{ transform }}>
        <button ref={padRef} type="button" className="sling-button__pad" aria-label="Top，返回顶部" aria-describedby={hintId} data-held={held || undefined}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={event => release(event.pointerId)} onPointerCancel={event => release(event.pointerId, true)} onLostPointerCapture={event => release(event.pointerId, true)}
          onKeyDown={event => { if (event.key === 'Escape' && grip.current) { event.preventDefault(); release(grip.current.id, true); } }}
          onClick={event => { if (event.detail > 0 && skipClick.current) { skipClick.current = false; return; } tap(); }}>
          <span className="sling-button__face"><span ref={iconRef} className="sling-button__icon"><ArrowUp size={13} strokeWidth={1.8} aria-hidden="true" /></span><span className="sling-button__label">Top</span></span>
        </button>
      </motion.span>
      <span id={hintId} className="studio-sr-only">点击或按 Enter 返回顶部，也可拉动后松开。</span>
    </span>
  </div>;
}
