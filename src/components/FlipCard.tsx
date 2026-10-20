// Adapted from React Bits Flip Card; see FlipCard.LICENSE.md.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, useSpring, useTransform, type AnimationPlaybackControls, type MotionStyle } from 'motion/react';
import './FlipCard.css';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  name: string;
  enabled?: boolean;
  className?: string;
}

interface Grip { id: number; x: number; base: number; moved: boolean; slop: number; history: { time: number; degrees: number }[]; }
const TILT_SPRING = { stiffness: 240, damping: 24, mass: .6 };
const LIFT_SPRING = { stiffness: 320, damping: 26 };
const FLIP_SPRING = { stiffness: 170, damping: 20, restDelta: .05 };
const snap = (degrees: number) => Math.round(degrees / 180) * 180;
const isBack = (degrees: number) => Math.abs(Math.round(degrees / 180)) % 2 === 1;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function FlipCard({ front, back, name, enabled = true, className = '' }: FlipCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const grip = useRef<Grip | null>(null);
  const spin = useRef<AnimationPlaybackControls | null>(null);
  const target = useRef(0);
  const [flipped, setFlipped] = useState(false);
  const [dragging, setDragging] = useState(false);
  const turn = useMotionValue(0);
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const lift = useSpring(1, LIFT_SPRING);
  const sheen = useSpring(0, LIFT_SPRING);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const turnY = useTransform([turn, tiltY], ([t, y]: number[]) => t + y);
  const transform = useMotionTemplate`perspective(1100px) scale(${lift}) rotateX(${tiltX}deg) rotateY(${turnY}deg)`;
  const facing = useTransform(turn, degrees => Math.abs(Math.cos(degrees * Math.PI / 180)));
  const spread = useTransform(facing, value => .08 + .92 * value);
  const shade = useTransform(facing, value => .1 + .9 * value * value);
  const gxPct = useMotionTemplate`${gx}%`;
  const gyPct = useMotionTemplate`${gy}%`;

  const rest = () => { tiltX.set(0); tiltY.set(0); lift.set(1); sheen.set(0); gx.set(50); gy.set(50); };
  const settle = (degrees: number, velocity = 0) => {
    spin.current?.stop();
    target.current = degrees;
    if (!enabled || document.hidden) turn.jump(degrees);
    else spin.current = animate(turn, degrees, { type: 'spring', ...FLIP_SPRING, velocity });
    setFlipped(isBack(degrees));
  };
  const flip = () => settle(isBack(target.current) ? target.current - 180 : target.current + 180);

  useEffect(() => {
    const stop = () => {
      spin.current?.stop();
      spin.current = null;
      turn.jump(target.current);
      tiltX.jump(0); tiltY.jump(0); lift.jump(1); sheen.jump(0); gx.jump(50); gy.jump(50);
      const pointer = grip.current;
      grip.current = null;
      if (pointer && rootRef.current?.hasPointerCapture(pointer.id)) rootRef.current.releasePointerCapture(pointer.id);
      setDragging(false);
    };
    const synchronize = () => { if (!enabled || document.hidden) stop(); };
    queueMicrotask(synchronize);
    document.addEventListener('visibilitychange', synchronize);
    return () => {
      document.removeEventListener('visibilitychange', synchronize);
      spin.current?.stop();
      tiltX.jump(0); tiltY.jump(0); lift.jump(1); sheen.jump(0); gx.jump(50); gy.jump(50);
    };
  }, [enabled, turn, tiltX, tiltY, lift, sheen, gx, gy]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.button !== 0 || grip.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    spin.current?.stop();
    grip.current = { id: event.pointerId, x: event.clientX, base: turn.get(), moved: false, slop: event.pointerType === 'touch' ? 8 : 4, history: [] };
    lift.set(1.015);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = grip.current;
    if (pointer && pointer.id === event.pointerId) {
      const distance = event.clientX - pointer.x;
      if (!pointer.moved) {
        if (Math.abs(distance) < pointer.slop) return;
        pointer.moved = true;
        setDragging(true);
        tiltX.set(0); tiltY.set(0); sheen.set(0);
      }
      const degrees = pointer.base + distance / event.currentTarget.getBoundingClientRect().width * 180;
      turn.set(degrees);
      const now = performance.now();
      pointer.history.push({ time: now, degrees });
      while (pointer.history.length > 2 && now - pointer.history[0].time > 90) pointer.history.shift();
      return;
    }
    if (!enabled || event.pointerType === 'touch') return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = clamp((event.clientX - box.left) / box.width, 0, 1);
    const y = clamp((event.clientY - box.top) / box.height, 0, 1);
    tiltX.set((.5 - y) * 10);
    tiltY.set((x - .5) * 10);
    gx.set(x * 100);
    gy.set(y * 100);
    sheen.set(1);
  };
  const release = (event: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const pointer = grip.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    grip.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    if (event.pointerType === 'touch' || !rootRef.current?.matches(':hover')) rest();
    if (!pointer.moved) {
      if (cancelled) settle(target.current);
      else flip();
      return;
    }
    const here = turn.get();
    const first = pointer.history[0], last = pointer.history.at(-1);
    const velocity = !cancelled && first && last && last.time > first.time && performance.now() - last.time < 60
      ? (last.degrees - first.degrees) / (last.time - first.time) * 1000 : 0;
    settle(cancelled ? target.current : clamp(snap(here + velocity * .16), snap(here) - 180, snap(here) + 180), velocity);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!enabled || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    if (!event.repeat && !grip.current) flip();
  };

  const rotorStyle = {
    transform,
    '--fc-gx': gxPct,
    '--fc-gy': gyPct,
    '--fc-sheen': sheen,
  } as MotionStyle;

  return <div ref={rootRef} className={`flip-card ${className}`.trim()} role="button"
    tabIndex={enabled ? 0 : -1} aria-disabled={!enabled || undefined} aria-pressed={flipped}
    aria-label={`${name}人物卡片，${flipped ? '骑马照片与签名，翻回卡通头像' : '卡通头像，翻看骑马照片与签名'}`}
    data-flipped={flipped} data-dragging={dragging} data-enabled={enabled}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove}
    onPointerUp={event => release(event, false)} onPointerCancel={event => release(event, true)} onLostPointerCapture={event => release(event, true)}
    onPointerEnter={event => { if (enabled && event.pointerType !== 'touch') lift.set(1.015); }}
    onPointerLeave={() => { if (!grip.current) rest(); }} onKeyDown={onKeyDown}
    onClick={event => { if (enabled && !grip.current && event.detail === 0) flip(); }} onDragStart={event => event.preventDefault()}>
    <motion.span className="flip-card__shadow" aria-hidden="true" style={{ scaleX: spread, opacity: shade }} />
    <motion.div className="flip-card__rotor" style={rotorStyle}>
      <div className="flip-card__face flip-card__face--front" aria-hidden={flipped} inert={flipped}>{front}<span className="flip-card__glare" aria-hidden="true" /></div>
      <div className="flip-card__face flip-card__face--back" aria-hidden={!flipped} inert={!flipped}>{back}<span className="flip-card__glare" aria-hidden="true" /></div>
    </motion.div>
  </div>;
}
