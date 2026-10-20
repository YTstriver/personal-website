// Adapted from React Bits BlurText (https://reactbits.dev/text-animations/blur-text).
// See BlurText.LICENSE.md for the upstream license.
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";

type AnimateBy = "words" | "letters";
type Direction = "top" | "bottom";
type Snapshot = Record<string, number | string>;

interface BlurTextProps {
  active?: boolean;
  animationFrom?: Snapshot;
  animationTo?: Snapshot[];
  animateBy?: AnimateBy;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  direction?: Direction;
  easing?: unknown;
  onAnimationComplete?: () => void;
  retrigger?: boolean;
  rootMargin?: string;
  splitBy?: AnimateBy;
  stepDuration?: number;
  startDelay?: number;
  text?: string;
  threshold?: number;
}

const buildKeyframes = (from: Snapshot, steps: Snapshot[]) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);
  const keyframes: Record<string, Array<number | string | undefined>> = {};

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });

  return keyframes;
};

export function BlurText({
  active = true,
  animationFrom,
  animationTo,
  animateBy = "words",
  as = "p",
  className = "",
  delay = 200,
  direction = "top",
  easing = (t: number) => t,
  onAnimationComplete,
  retrigger = true,
  rootMargin = "0px",
  splitBy,
  stepDuration = 0.35,
  startDelay = 0,
  text = "",
  threshold = 0.1,
}: BlurTextProps) {
  const resolvedAnimateBy = splitBy ?? animateBy;
  const elements = useMemo(
    () => (resolvedAnimateBy === "words" ? text.split(" ") : text.split("")),
    [resolvedAnimateBy, text]
  );
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (retrigger) {
          setInView(entry.isIntersecting);
          return;
        }

        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [retrigger, rootMargin, threshold]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from(
    { length: stepCount },
    (_, index) => (stepCount === 1 ? 0 : index / (stepCount - 1))
  );

  const displayMode = as === "span" ? "inline-flex" : "flex";
  const shouldAnimate = inView && active;

  const animatedSegments = elements.map((segment, index) => {
    const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
    const spanTransition: {
      delay: number;
      duration: number;
      ease?: unknown;
      times: number[];
    } = {
      duration: totalDuration,
      times,
      delay: (startDelay + index * delay) / 1000,
    };
    spanTransition.ease = easing;

    return (
      <motion.span
        className="blur-text-segment inline-block will-change-[transform,filter,opacity]"
        key={`${segment}-${index}`}
        initial={fromSnapshot}
        animate={shouldAnimate ? (animateKeyframes as never) : (fromSnapshot as never)}
        transition={spanTransition as never}
        onAnimationComplete={
          index === elements.length - 1 && onAnimationComplete ? onAnimationComplete : undefined
        }
      >
        {segment === " " ? "\u00A0" : segment}
        {resolvedAnimateBy === "words" && index < elements.length - 1 && "\u00A0"}
      </motion.span>
    );
  });

  const sharedProps = {
    className: cn("blur-text", className),
    style: { display: displayMode, flexWrap: "wrap" } as const,
  };
  const bindRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  switch (as) {
    case "span":
      return (
        <span {...sharedProps} ref={bindRef}>
          {animatedSegments}
        </span>
      );
    case "h1":
      return (
        <h1 {...sharedProps} ref={bindRef}>
          {animatedSegments}
        </h1>
      );
    case "h2":
      return (
        <h2 {...sharedProps} ref={bindRef}>
          {animatedSegments}
        </h2>
      );
    case "h3":
      return (
        <h3 {...sharedProps} ref={bindRef}>
          {animatedSegments}
        </h3>
      );
    case "div":
      return (
        <div {...sharedProps} ref={bindRef}>
          {animatedSegments}
        </div>
      );
    default:
      return (
        <p {...sharedProps} ref={bindRef}>
          {animatedSegments}
        </p>
      );
  }
}

export default BlurText;
