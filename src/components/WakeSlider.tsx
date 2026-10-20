// Adapted from React Bits WakeSlider: https://www.reactbits.dev/micro/wake-slider.
// See WakeSlider.LICENSE.md for upstream source links and the original license.

import { useCallback, useEffect, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { cancelFrame, frame, useMotionValue, useMotionValueEvent, useSpring, useVelocity } from 'motion/react';
import './WakeSlider.css';

export interface WakeSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const BARS = 26;
const REST = 8 / 28;
const SETTLE = 9.23;
const FULL_SPEED = 320;
const MIN_REACH = 1.5;
const REACH = 6;
const SKEW = 0.6;
const FLAT = 0.002;
const GLIDE = 0.3;
const SMOOTHING = 100;
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const cleanVolume = (value: number) => Number.isFinite(value) ? Math.round(clamp(value)) : 0;
const smoothstep = (value: number) => value * value * (3 - 2 * value);

export default function WakeSlider({ value, onChange, disabled = false, className = '' }: WakeSliderProps) {
  const volume = cleanVolume(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const barEls = useRef<(HTMLSpanElement | null)[]>([]);
  const pointerId = useRef<number | null>(null);
  const latest = useRef(volume);
  const lastAmp = useRef(0);

  // Upstream uses a critically damped head and a second spring to smooth its speed.
  const target = useMotionValue(volume);
  const w0 = SETTLE / GLIDE;
  const head = useSpring(target, { stiffness: w0 * w0, damping: 2 * w0, mass: 1 });
  const rawSpeed = useVelocity(head);
  const wv = 2000 / SMOOTHING;
  const speed = useSpring(rawSpeed, { stiffness: wv * wv, damping: 2.5 * wv, mass: 1 });

  const paint = useCallback((force = false) => {
    if (document.hidden) return;
    const position = (head.get() / 100) * (BARS - 1);
    const velocity = disabled ? 0 : speed.get();
    const amp = smoothstep(clamp(Math.abs(velocity) / FULL_SPEED, 0, 1));
    const direction = Math.sign(velocity) || 1;
    const reach = MIN_REACH + (REACH - MIN_REACH) * amp;
    const behind = reach * (1 + SKEW);
    const ahead = reach * (1 - 0.5 * SKEW);
    const lit = Math.round(position);
    const flat = !force && amp < FLAT && lastAmp.current < FLAT;

    for (let index = 0; index < BARS; index++) {
      const bar = barEls.current[index];
      if (!bar) continue;
      const on = index <= lit ? 'true' : 'false';
      if (bar.dataset.on !== on) bar.dataset.on = on;
      if (flat) continue;
      const distance = index - position;
      const radius = distance * direction < 0 ? behind : ahead;
      const lift = Math.abs(distance) < radius ? amp * Math.cos(Math.PI * distance / (2 * radius)) ** 2 : 0;
      bar.style.transform = `scaleY(${REST + lift * (1 - REST)})`;
    }
    lastAmp.current = amp;
  }, [disabled, head, speed]);

  const run = useCallback(() => paint(), [paint]);
  const schedule = useCallback(() => {
    if (!document.hidden) frame.render(run, false, true);
  }, [run]);
  useMotionValueEvent(head, 'change', schedule);
  useMotionValueEvent(speed, 'change', schedule);

  useLayoutEffect(() => {
    latest.current = volume;
    if (disabled || document.hidden) {
      target.jump(volume);
      head.jump(volume);
      speed.jump(0);
    } else target.set(volume);
    paint(true);
  }, [volume, disabled, target, head, speed, paint]);

  useEffect(() => {
    const syncVisibility = () => {
      target.jump(latest.current);
      head.jump(latest.current);
      speed.jump(0);
      cancelFrame(run);
      if (!document.hidden) paint(true);
    };
    document.addEventListener('visibilitychange', syncVisibility);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      cancelFrame(run);
      head.stop();
      speed.stop();
    };
  }, [target, head, speed, run, paint]);

  const commit = (next: number) => {
    const clean = cleanVolume(next);
    if (clean === latest.current) return;
    latest.current = clean;
    onChange(clean);
  };

  const commitFromX = (x: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = clamp((x - rect.left) / rect.width, 0, 1);
    commit((getComputedStyle(track).direction === 'rtl' ? 1 - ratio : ratio) * 100);
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !event.isPrimary || event.button !== 0 || pointerId.current !== null) return;
    event.preventDefault();
    pointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    rootRef.current?.removeAttribute('data-instant');
    handleRef.current?.focus({ preventScroll: true });
    commitFromX(event.clientX);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== pointerId.current) return;
    pointerId.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const jumps: Record<string, number> = {
      ArrowRight: latest.current + 1,
      ArrowUp: latest.current + 1,
      ArrowLeft: latest.current - 1,
      ArrowDown: latest.current - 1,
      PageUp: latest.current + 10,
      PageDown: latest.current - 10,
      Home: 0,
      End: 100,
    };
    if (!(event.key in jumps)) return;
    event.preventDefault();
    const next = cleanVolume(jumps[event.key]);
    // Keyboard navigation stays precise and still, matching upstream behavior.
    rootRef.current?.setAttribute('data-instant', 'true');
    target.jump(next);
    head.jump(next);
    speed.jump(0);
    commit(next);
    paint(true);
  };

  return (
    <div ref={rootRef} className={`wake-slider ${className}`} aria-disabled={disabled || undefined}>
      <div ref={trackRef} className="wake-slider__track"
        onPointerDown={startDrag}
        onPointerMove={event => { if (event.pointerId === pointerId.current) commitFromX(event.clientX); }}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag}>
        {Array.from({ length: BARS }, (_, index) => (
          <span key={index} className="wake-slider__bar" aria-hidden="true"
            ref={element => { barEls.current[index] = element; }} />
        ))}
        <button ref={handleRef} type="button" role="slider" className="wake-slider__handle"
          tabIndex={disabled ? -1 : 0} aria-label="背景音乐音量" aria-orientation="horizontal"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={volume} aria-valuetext={`${volume}%`}
          aria-disabled={disabled || undefined} onKeyDown={keyDown} />
      </div>
    </div>
  );
}
