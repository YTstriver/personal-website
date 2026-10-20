// Adapted from React Bits ElasticSlider: https://reactbits.dev/components/elastic-slider.
// See ElasticSlider.LICENSE.md for the original license and source links.

import { useEffect, useRef, type PointerEvent } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import './ElasticSlider.css';

export interface ElasticSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_OVERFLOW = 26;
const clampVolume = (value: number) => Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

// React Bits' sigmoid resistance keeps overdrag bounded without a hard visual stop.
function decay(value: number) {
  return (2 / (1 + Math.exp(-value / MAX_OVERFLOW)) - 1) * MAX_OVERFLOW;
}

export default function ElasticSlider({ value, onChange, disabled = false, className = '' }: ElasticSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const activePointer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const overflow = useMotionValue(0);
  const trackWidth = useMotionValue(152);
  const trackHeight = useMotionValue(6);
  const origin = useMotionValue('left center');
  const scaleX = useTransform(() => 1 + overflow.get() / trackWidth.get());
  const scaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]);
  const volume = clampVolume(value);

  useEffect(() => {
    if (disabled || reducedMotion) {
      activePointer.current = null;
      overflow.jump(0);
      trackHeight.jump(6);
    }
    return () => {
      overflow.stop();
      trackHeight.stop();
    };
  }, [disabled, reducedMotion, overflow, trackHeight]);

  const setHeight = (height: number) => {
    if (disabled || reducedMotion) return;
    animate(trackHeight, height, { duration: 0.18 });
  };

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const { left, right, width } = event.currentTarget.getBoundingClientRect();
    if (width <= 0) return;
    trackWidth.set(width);
    onChange(clampVolume(Math.round((event.clientX - left) / width * 100)));
    if (reducedMotion) return;
    const distance = event.clientX < left ? left - event.clientX : Math.max(0, event.clientX - right);
    origin.set(event.clientX < left ? 'right center' : 'left center');
    overflow.jump(decay(distance));
  };

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !event.isPrimary || event.button !== 0) return;
    // The range is keyboard-only so its browser thumb cannot steal rail capture.
    event.preventDefault();
    inputRef.current?.focus({ preventScroll: true });
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeight(10);
    updateFromPointer(event);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return;
    activePointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (disabled || reducedMotion) {
      overflow.jump(0);
      return;
    }
    animate(overflow, 0, { type: 'spring', bounce: 0.5 });
    setHeight(event.pointerType === 'mouse' && event.currentTarget.matches(':hover') ? 10 : 6);
  };

  return (
    <div
      className={`elastic-slider ${className}`}
      data-disabled={disabled}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHeight(10); }}
      onPointerLeave={() => { if (activePointer.current === null) setHeight(6); }}
      onPointerDown={startDrag}
      onPointerMove={event => { if (activePointer.current === event.pointerId) updateFromPointer(event); }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
    >
      <motion.div
        className="elastic-slider-track"
        aria-hidden="true"
        style={{
          height: reducedMotion ? 6 : trackHeight,
          scaleX: reducedMotion ? 1 : scaleX,
          scaleY: reducedMotion ? 1 : scaleY,
          transformOrigin: origin,
        }}
      >
        <div className="elastic-slider-fill" style={{ width: `${volume}%` }} />
      </motion.div>
      <input
        ref={inputRef}
        className="elastic-slider-input"
        type="range"
        min={0}
        max={100}
        step={1}
        value={volume}
        disabled={disabled}
        aria-label="背景音乐音量"
        aria-valuetext={`${Math.round(volume)}%`}
        onChange={event => onChange(clampVolume(event.currentTarget.valueAsNumber))}
        onFocus={() => setHeight(10)}
        onBlur={() => setHeight(6)}
      />
    </div>
  );
}
