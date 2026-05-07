import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";

type SplitBy = "words" | "letters";
type Direction = "top" | "bottom";

interface BlurTextProps {
  className?: string;
  delay?: number;
  direction?: Direction;
  splitBy?: SplitBy;
  text: string;
}

export function BlurText({
  className,
  delay = 200,
  direction = "bottom",
  splitBy = "words",
  text,
}: BlurTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const segments = useMemo(() => {
    if (splitBy === "letters") {
      return text.split("");
    }
    const words = text.split(" ");
    return words.map((word, index) =>
      index < words.length - 1 ? `${word}\u00A0` : word
    );
  }, [splitBy, text]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const startY = direction === "bottom" ? 50 : -50;
  const midY = direction === "bottom" ? -5 : 5;

  return (
    <span ref={containerRef} className={cn("inline", className)}>
      {segments.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          className="inline-block whitespace-pre"
          initial={{ filter: "blur(10px)", opacity: 0, y: startY }}
          animate={
            isVisible
              ? {
                  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                  opacity: [0, 0.5, 1],
                  y: [startY, midY, 0],
                }
              : { filter: "blur(10px)", opacity: 0, y: startY }
          }
          transition={{
            delay: (index * delay) / 1000,
            duration: 1.05,
            ease: "easeOut",
            times: [0, 0.5, 1],
          }}
        >
          {segment}
        </motion.span>
      ))}
    </span>
  );
}
