// Adapted from React Bits ParticleText (https://reactbits.dev/text-animations/particle-text).
// See ParticleText.LICENSE.md for the upstream license.

import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import './ParticleText.css';

export interface ParticleTextProps {
  text?: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'mount' | 'hover' | 'click';
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  align?: 'left' | 'center';
  startDelay?: number;
  maxParticles?: number;
  active?: boolean;
  exitDuration?: number;
  onExitComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

type Rgb = { r: number; g: number; b: number };
type Target = { x: number; y: number; alpha: number };
type Particle = {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  seed: number;
  depth: number;
  delay: number;
  alpha: number;
  startAlpha: number;
  exitX: number;
  exitY: number;
};

const hexToRgb = (hex: string): Rgb | null => {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
};

const mixRgb = (from: Rgb, to: Rgb, amount: number): Rgb => ({
  r: Math.round(from.r + (to.r - from.r) * amount),
  g: Math.round(from.g + (to.g - from.g) * amount),
  b: Math.round(from.b + (to.b - from.b) * amount)
});

const rgbToCss = (rgb: Rgb): string => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const resolveFontSize = (
  value: number | string,
  container: HTMLElement,
  fontWeight: number | string,
  fontFamily: string
): number => {
  if (typeof value === 'number') return value;

  const probe = document.createElement('span');
  probe.textContent = 'M';
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.fontSize = value;
  probe.style.fontWeight = String(fontWeight);
  probe.style.fontFamily = fontFamily;
  container.appendChild(probe);
  const size = parseFloat(window.getComputedStyle(probe).fontSize) || 96;
  probe.remove();
  return size;
};

const waitForFonts = async (font: string): Promise<void> => {
  if (!('fonts' in document)) return;

  try {
    await document.fonts.load(font);
  } catch {
    // The browser can still render an available fallback font.
  }

  await document.fonts.ready;
};

const ParticleText = ({
  text = 'React Bits',
  particleSize = 2,
  density = 4,
  color = '#ffffff',
  highlightColor = '#8b5cf6',
  scatter = 180,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 40,
  repelRadius = 120,
  idleDrift = 0.7,
  trigger = 'mount',
  fontSize = 'clamp(3rem, 12vw, 8rem)',
  fontWeight = 800,
  fontFamily = 'inherit',
  glow = true,
  align = 'center',
  startDelay = 0,
  maxParticles = 3200,
  active = true,
  exitDuration = 480,
  onExitComplete,
  className = '',
  style
}: ParticleTextProps) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackRef = useRef<HTMLSpanElement | null>(null);
  const activeRef = useRef(active);
  const exitCompleteRef = useRef(onExitComplete);
  const activityRef = useRef<((next: boolean) => void) | null>(null);

  useLayoutEffect(() => {
    activeRef.current = active;
    exitCompleteRef.current = onExitComplete;
    if (activityRef.current) activityRef.current(active);
    else if (!active) exitCompleteRef.current?.();
  }, [active, onExitComplete]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const fallback = fallbackRef.current;
    if (!container || !fallback) return;
    let connected = true;
    const fitFallback = () => {
      if (!connected || container.dataset.ready === 'true') return;
      fallback.style.fontFamily = fontFamily;
      fallback.style.fontWeight = String(fontWeight);
      fallback.style.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      const requestedSize = parseFloat(getComputedStyle(fallback).fontSize);
      const measuredWidth = fallback.getBoundingClientRect().width;
      const availableWidth = Math.max(1, container.clientWidth * 0.96 - 2);
      if (measuredWidth > availableWidth) {
        fallback.style.fontSize = `${requestedSize * availableWidth / measuredWidth}px`;
      }
    };
    fitFallback();
    const observer = new ResizeObserver(fitFallback);
    observer.observe(container);
    void document.fonts?.ready.then(fitFallback);
    return () => {
      connected = false;
      observer.disconnect();
    };
  }, [text, fontSize, fontWeight, fontFamily]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container) return undefined;
    if (!canvas) {
      container.dataset.ready = 'false';
      container.dataset.renderer = 'fallback';
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      container.dataset.ready = 'false';
      container.dataset.renderer = 'fallback';
      return undefined;
    }

    let particles: Particle[] = [];
    let animationFrame: number | null = null;
    let resizeFrame: number | null = null;
    let buildId = 0;
    let gathering = false;
    let exiting = false;
    let exitStart = 0;
    let exitNotified = false;
    let gatherStart = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pendingSize = '';
    let pendingBuild = 0;

    const pointer = {
      active: false,
      x: 0,
      y: 0,
      smoothX: 0,
      smoothY: 0
    };

    const startGather = (fromScatter = true, delay = startDelay): void => {
      if (!particles.length) return;

      const now = performance.now();
      const spread = scatter;

      particles.forEach(particle => {
        if (fromScatter) {
          const angle = particle.seed * Math.PI * 2;
          const distance = spread * (0.35 + particle.depth * 0.75);
          particle.x = particle.targetX + Math.cos(angle) * distance + (particle.depth - 0.5) * spread * 0.55;
          particle.y = particle.targetY + Math.sin(angle) * distance + (particle.seed - 0.5) * spread * 0.55;
          particle.alpha = 0.35;
        }

        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.startAlpha = particle.alpha;
        particle.delay = particle.seed * stagger;
      });

      gatherStart = now + delay;
      gathering = true;
      exiting = false;
      exitNotified = false;
      container.dataset.phase = 'enter';
    };

    const finishExit = (): void => {
      gathering = false;
      exiting = false;
      ctx.clearRect(0, 0, width, height);
      container.dataset.phase = 'hidden';
      container.dataset.animating = 'false';
      if (!exitNotified) {
        exitNotified = true;
        exitCompleteRef.current?.();
      }
    };

    const startExit = (): void => {
      buildId += 1;
      pointer.active = false;
      gathering = false;
      if (!particles.length) {
        finishExit();
        return;
      }
      particles.forEach(particle => {
        const angle = particle.seed * Math.PI * 2;
        const distance = scatter * (0.45 + particle.depth * 0.65);
        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.startAlpha = particle.alpha;
        particle.exitX = particle.x + Math.cos(angle) * distance;
        particle.exitY = particle.y + Math.sin(angle) * distance;
        particle.delay = particle.seed * Math.min(stagger, 70);
      });
      exitStart = performance.now();
      exiting = true;
      exitNotified = false;
      container.dataset.phase = 'exit';
      ensureRenderLoop();
    };

    const drawParticle = (particle: Particle): void => {
      const size = particle.size;
      ctx.fillStyle = particle.color;

      if (size <= 2.1) {
        ctx.fillRect(particle.x - size / 2, particle.y - size / 2, size, size);
        return;
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = (now: number): void => {
      animationFrame = null;
      if (!particles.length) return;
      if (!activeRef.current && !exiting) {
        finishExit();
        return;
      }
      ctx.clearRect(0, 0, width, height);

      if (exiting) {
        let complete = true;
        ctx.shadowBlur = 0;
        particles.forEach(particle => {
          const progress = clamp((now - exitStart - particle.delay) / Math.max(1, exitDuration), 0, 1);
          const eased = easeOutCubic(progress);
          particle.x = particle.startX + (particle.exitX - particle.startX) * eased;
          particle.y = particle.startY + (particle.exitY - particle.startY) * eased;
          particle.alpha = particle.startAlpha * Math.pow(1 - progress, 1.5);
          ctx.globalAlpha = particle.alpha;
          drawParticle(particle);
          if (progress < 1) complete = false;
        });
        ctx.globalAlpha = 1;
        container.dataset.animating = String(!complete);
        if (complete) finishExit();
        else if (!document.hidden) animationFrame = window.requestAnimationFrame(render);
        return;
      }

      if (glow) {
        ctx.shadowBlur = particleSize * 3;
        ctx.shadowColor = highlightColor;
      } else {
        ctx.shadowBlur = 0;
      }

      pointer.smoothX += (pointer.x - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * 0.18;

      let complete = true;
      let unsettled = false;

      particles.forEach(particle => {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        let progress = 1;

        if (gathering) {
          const local = (now - gatherStart - particle.delay) / Math.max(1, gatherDuration);
          progress = clamp(local, 0, 1);
          const eased = easeOutCubic(progress);
          baseX = particle.startX + (particle.targetX - particle.startX) * eased;
          baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (idleDrift > 0) {
          const driftTime = now * 0.001;
          baseX += Math.sin(driftTime * 0.9 + particle.seed * 10) * idleDrift * particle.depth;
          baseY += Math.cos(driftTime * 0.75 + particle.depth * 10) * idleDrift * particle.depth;
        }

        if (pointer.active && pointerRepel > 0 && repelRadius > 0) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
            baseX += (dx / distance) * force;
            baseY += (dy / distance) * force;
          }
        }

        particle.x += (baseX - particle.x) * 0.22;
        particle.y += (baseY - particle.y) * 0.22;
        if (Math.abs(baseX - particle.x) + Math.abs(baseY - particle.y) > 0.08) {
          unsettled = true;
        } else {
          particle.x = baseX;
          particle.y = baseY;
        }

        particle.alpha = gathering ? particle.startAlpha + (1 - particle.startAlpha) * progress : 1;
        ctx.globalAlpha = clamp(particle.alpha, 0, 1);
        drawParticle(particle);
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      // Swap the plain-text fallback only after a complete canvas frame exists.
      container.dataset.ready = 'true';
      container.dataset.renderer = 'canvas';

      if (gathering && complete) {
        gathering = false;
        container.dataset.phase = 'idle';
      }

      const interactive = idleDrift > 0 || (pointer.active && pointerRepel > 0);
      container.dataset.animating = String(gathering || unsettled || interactive);
      if (!document.hidden && (gathering || unsettled || interactive)) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const ensureRenderLoop = (): void => {
      if (particles.length && animationFrame === null && !document.hidden && (activeRef.current || exiting)) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const sampleText = async (): Promise<void> => {
      if (!activeRef.current) return;
      const rect = container.getBoundingClientRect();
      const nextWidth = Math.floor(rect.width);
      const nextHeight = Math.floor(rect.height);
      if (nextWidth <= 0 || nextHeight <= 0) return;
      const nextDpr = Math.min(window.devicePixelRatio || 1, nextWidth <= 760 ? 1.5 : 2);
      const size = `${nextWidth}:${nextHeight}:${nextDpr}`;
      if (pendingSize === size || (particles.length && width === nextWidth && height === nextHeight && dpr === nextDpr)) return;
      const currentBuild = ++buildId;
      pendingSize = size;
      pendingBuild = currentBuild;
      try {
        const computed = window.getComputedStyle(container);
        const resolvedFamily = fontFamily === 'inherit' ? computed.fontFamily || 'sans-serif' : fontFamily;
        let resolvedSize = resolveFontSize(fontSize, container, fontWeight, resolvedFamily);
        let font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;

        await waitForFonts(font);
        if (currentBuild !== buildId || !activeRef.current) return;

        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!offCtx) throw new Error('Text sampling canvas unavailable');

        const content = String(text || ' ');
        const maxTextWidth = nextWidth * 0.96;
        offCtx.font = font;
        let metrics = offCtx.measureText(content);
        const measuredWidth = Math.max(1, metrics.width);
        if (measuredWidth > maxTextWidth) {
          resolvedSize = Math.max(18, resolvedSize * (maxTextWidth / measuredWidth));
          font = `${fontWeight} ${resolvedSize}px ${resolvedFamily}`;
          await waitForFonts(font);
          if (currentBuild !== buildId || !activeRef.current) return;
          offCtx.font = font;
          metrics = offCtx.measureText(content);
        }

        const left = Math.ceil(metrics.actualBoundingBoxLeft || 0);
        const right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width);
        const ascent = Math.ceil(metrics.actualBoundingBoxAscent || resolvedSize * 0.78);
        const descent = Math.ceil(metrics.actualBoundingBoxDescent || resolvedSize * 0.22);
        const padding = Math.max(12, Math.ceil(resolvedSize * 0.08));
        const textWidth = Math.max(1, left + right);
        const textHeight = Math.max(1, ascent + descent);

        offscreen.width = textWidth + padding * 2;
        offscreen.height = textHeight + padding * 2;
        offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
        offCtx.font = font;
        offCtx.textAlign = 'left';
        offCtx.textBaseline = 'alphabetic';
        offCtx.fillStyle = '#ffffff';
        offCtx.fillText(content, padding - left, padding + ascent);

        const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
        const targets: Target[] = [];
        const step = Math.max(2, Math.floor(density));
        const offsetX = align === 'left' ? 2 - padding : nextWidth / 2 - offscreen.width / 2;

        for (let y = 0; y < offscreen.height; y += step) {
          for (let x = 0; x < offscreen.width; x += step) {
            const alpha = imageData.data[(y * offscreen.width + x) * 4 + 3];
            if (alpha > 40) {
              targets.push({
                x: offsetX + x,
                y: nextHeight / 2 - offscreen.height / 2 + y,
                alpha: alpha / 255
              });
            }
          }
        }

        const particleLimit = Math.min(maxParticles, Math.max(1200, Math.floor((nextWidth * nextHeight) / 20)));
        const stride = Math.max(1, Math.ceil(targets.length / particleLimit));
        const baseRgb = hexToRgb(color);
        const highlightRgb = hexToRgb(highlightColor);
        const selected = targets.filter((_, index) => index % stride === 0);

        const nextParticles = selected.map((target, index) => {
          const seed = ((index * 9301 + 49297) % 233280) / 233280;
          const depth = 0.45 + (((index * 233 + 97) % 1000) / 1000) * 0.9;
          const blend = baseRgb && highlightRgb ? clamp(target.x / Math.max(1, nextWidth) + (seed - 0.5) * 0.35, 0, 1) : 0;
          const particleColor = baseRgb && highlightRgb ? rgbToCss(mixRgb(baseRgb, highlightRgb, blend)) : color;
          const angle = seed * Math.PI * 2;
          const distance = scatter * (0.35 + depth * 0.75);
          const startX = target.x + Math.cos(angle) * distance + (seed - 0.5) * scatter * 0.45;
          const startY = target.y + Math.sin(angle) * distance + (depth - 0.9) * scatter * 0.45;

          return {
            x: startX,
            y: startY,
            startX,
            startY,
            targetX: target.x,
            targetY: target.y,
            size: Math.max(0.6, particleSize * (0.75 + target.alpha * 0.45)),
            color: particleColor,
            seed,
            depth,
            delay: seed * stagger,
            alpha: 0.35,
            startAlpha: 0.35,
            exitX: target.x,
            exitY: target.y
          };
        });
        if (!nextParticles.length) throw new Error('No text particles sampled');

        // Keep the previous drawing while fonts and replacement particles build.
        // A resize updates its geometry without restarting the entry animation.
        const continuing = particles.length > 0 && container.dataset.renderer === 'canvas';
        if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
        width = nextWidth;
        height = nextHeight;
        dpr = nextDpr;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        particles = nextParticles;

        pointer.x = width / 2;
        pointer.y = height / 2;
        pointer.smoothX = pointer.x;
        pointer.smoothY = pointer.y;

        if (continuing && !gathering) {
          particles.forEach(particle => {
            particle.x = particle.targetX;
            particle.y = particle.targetY;
            particle.startX = particle.targetX;
            particle.startY = particle.targetY;
            particle.delay = 0;
            particle.alpha = 1;
            particle.startAlpha = 1;
          });
          gathering = false;
          container.dataset.phase = 'idle';
        } else if (!continuing) {
          startGather(false);
        }

        container.dataset.particles = String(particles.length);
        container.dataset.fontSize = String(resolvedSize);
        // Draw synchronously before exposing this renderer; no empty RAF can paint.
        render(performance.now());
      } catch {
        if (currentBuild === buildId && activeRef.current && container.dataset.renderer !== 'canvas') {
          container.dataset.ready = 'false';
          container.dataset.renderer = 'fallback';
        }
      } finally {
        if (pendingBuild === currentBuild) pendingSize = '';
      }
    };

    const queueSample = (): void => {
      if (!activeRef.current) return;
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = null;
        void sampleText();
      });
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!activeRef.current) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
      ensureRenderLoop();
    };

    const handlePointerLeave = (): void => {
      pointer.active = false;
    };

    const handlePointerEnter = (event: PointerEvent): void => {
      handlePointerMove(event);
      if (trigger === 'hover') startGather(true);
    };

    const handleClick = (): void => {
      if (!activeRef.current) return;
      if (trigger === 'click') {
        startGather(true);
        ensureRenderLoop();
      }
    };

    const handleVisibilityChange = (): void => {
      if (document.hidden && animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      } else if (!document.hidden) {
        ensureRenderLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('pointerenter', handlePointerEnter);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('click', handleClick);

    const resizeObserver = new ResizeObserver(queueSample);
    resizeObserver.observe(container);
    window.addEventListener('resize', queueSample, { passive: true });
    const setActivity = (next: boolean): void => {
      if (!next) {
        startExit();
      } else if (particles.length) {
        startGather(false, 0);
        ensureRenderLoop();
      } else {
        void sampleText();
      }
    };
    activityRef.current = setActivity;
    void sampleText();

    return () => {
      buildId += 1;
      if (activityRef.current === setActivity) activityRef.current = null;
      resizeObserver.disconnect();
      window.removeEventListener('resize', queueSample);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('pointerenter', handlePointerEnter);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('click', handleClick);

      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame);
    };
  }, [
    text,
    particleSize,
    density,
    color,
    highlightColor,
    scatter,
    gatherDuration,
    stagger,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
    glow,
    align,
    startDelay,
    maxParticles,
    exitDuration
  ]);

  return (
    <span ref={containerRef} className={`particle-text ${className}`} data-active={active} data-renderer="preparing" style={style}>
      <canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" />
      <span ref={fallbackRef} className="particle-text__fallback">{text}</span>
    </span>
  );
};

export default ParticleText;
