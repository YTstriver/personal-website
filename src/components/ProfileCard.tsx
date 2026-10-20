import { memo, useEffect, useRef, type CSSProperties } from "react";
import "./ProfileCard.css";

export interface ProfileCardProps {
  avatarUrl: string;
  signatureUrl?: string;
  name: string;
  /** Stop tilt and reset the card when its chapter is no longer active. */
  enabled?: boolean;
  enableTilt?: boolean;
  className?: string;
  style?: CSSProperties;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const round = (value: number) => Math.round(value * 1000) / 1000;

// Adapted from the official React Bits TS/CSS Profile Card. See the adjacent license.
function ProfileCardComponent({
  avatarUrl,
  signatureUrl,
  name,
  enabled = true,
  enableTilt = true,
  className = "",
  style,
}: ProfileCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const shell = shellRef.current;
    if (!wrap || !shell) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = true;
    let rafId: number | null = null;
    let previousTime = 0;
    let currentX = 50;
    let currentY = 50;
    let targetX = 50;
    let targetY = 50;
    let interacting = false;

    const canAnimate = () => enabled && enableTilt && inView && !document.hidden && !reducedMotion.matches;

    const paint = (x: number, y: number) => {
      const centerX = x - 50;
      const centerY = y - 50;
      const properties: Record<string, string> = {
        "--pointer-x": `${round(x)}%`,
        "--pointer-y": `${round(y)}%`,
        "--pointer-from-top": `${y / 100}`,
        "--pointer-from-left": `${x / 100}`,
        "--rotate-x": `${round(-centerX / 5)}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      };
      for (const [key, value] of Object.entries(properties)) wrap.style.setProperty(key, value);
    };

    const cancel = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      previousTime = 0;
      wrap.dataset.animating = "false";
    };

    const reset = () => {
      cancel();
      currentX = targetX = currentY = targetY = 50;
      interacting = false;
      wrap.dataset.interacting = "false";
      paint(50, 50);
    };

    const step = (time: number) => {
      rafId = null;
      if (!canAnimate()) {
        reset();
        return;
      }
      const dt = previousTime === 0 ? 1 / 60 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      // Retain the original frame-rate-independent exponential smoothing.
      const progress = 1 - Math.exp(-dt / 0.14);
      currentX += (targetX - currentX) * progress;
      currentY += (targetY - currentY) * progress;
      const settled = Math.abs(targetX - currentX) < 0.025 && Math.abs(targetY - currentY) < 0.025;
      if (settled) {
        currentX = targetX;
        currentY = targetY;
      }
      paint(currentX, currentY);
      if (settled) {
        cancel();
        if (!interacting) wrap.dataset.interacting = "false";
      } else {
        rafId = requestAnimationFrame(step);
      }
    };

    const setTarget = (x: number, y: number) => {
      targetX = clamp(x);
      targetY = clamp(y);
      if (rafId !== null) return;
      previousTime = 0;
      wrap.dataset.animating = "true";
      rafId = requestAnimationFrame(step);
    };

    const move = (event: PointerEvent) => {
      if (!canAnimate() || event.pointerType === "touch") return;
      const rect = shell.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      interacting = true;
      wrap.dataset.interacting = "true";
      setTarget((event.clientX - rect.left) / rect.width * 100, (event.clientY - rect.top) / rect.height * 100);
    };

    const leave = () => {
      interacting = false;
      if (canAnimate()) setTarget(50, 50);
      else reset();
    };

    const syncAvailability = () => {
      wrap.dataset.motion = canAnimate() ? "enabled" : "static";
      if (!canAnimate()) reset();
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAvailability();
    });
    observer.observe(wrap);
    shell.addEventListener("pointerenter", move);
    shell.addEventListener("pointermove", move);
    shell.addEventListener("pointerleave", leave);
    shell.addEventListener("pointercancel", leave);
    document.addEventListener("visibilitychange", syncAvailability);
    reducedMotion.addEventListener("change", syncAvailability);
    reset();
    syncAvailability();

    return () => {
      cancel();
      observer.disconnect();
      shell.removeEventListener("pointerenter", move);
      shell.removeEventListener("pointermove", move);
      shell.removeEventListener("pointerleave", leave);
      shell.removeEventListener("pointercancel", leave);
      document.removeEventListener("visibilitychange", syncAvailability);
      reducedMotion.removeEventListener("change", syncAvailability);
    };
  }, [enabled, enableTilt]);

  return (
    <div ref={wrapRef} className={`profile-card ${className}`.trim()} style={style} data-enabled={enabled}>
      <div className="profile-card__behind" aria-hidden="true" />
      <div ref={shellRef} className="profile-card__shell">
        <section className="profile-card__card" aria-label={`${name}人物闪卡`}>
          <div className="profile-card__inside">
            <div className="profile-card__portrait-layer">
              <img className="profile-card__portrait" src={avatarUrl} alt={`${name}的人物形象`} loading="lazy" decoding="async" draggable={false} />
            </div>
            {signatureUrl && (
              <img className="profile-card__signature" src={signatureUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(ProfileCardComponent);
