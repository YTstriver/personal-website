import { useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";
import { motion } from "motion/react";
import "./TrueFocus.css";

type TrueFocusProps = {
  sentence: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  as?: "div" | "span";
};

export default function TrueFocus({
  sentence,
  separator = " ",
  manualMode = false,
  blurAmount = 5,
  borderColor = "#d6edff",
  glowColor = "rgba(119, 190, 255, 0.28)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = "",
  as = "div",
}: TrueFocusProps) {
  const words = sentence.split(separator).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const [isInViewport, setIsInViewport] = useState(true);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const Container = as as ElementType;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => setIsInViewport(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (manualMode || !isInViewport || words.length < 2) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => window.clearInterval(interval);
  }, [animationDuration, isInViewport, manualMode, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    const updateFocusRect = () => {
      const container = containerRef.current;
      const activeWord = wordRefs.current[currentIndex];
      if (!container || !activeWord) return;

      const parentRect = container.getBoundingClientRect();
      const activeRect = activeWord.getBoundingClientRect();
      setFocusRect({
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height,
      });
    };

    updateFocusRect();
    const resizeObserver = new ResizeObserver(updateFocusRect);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", updateFocusRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateFocusRect);
    };
  }, [currentIndex, words.length]);

  const handleMouseEnter = (index: number) => {
    if (!manualMode) return;
    setLastActiveIndex(index);
    setCurrentIndex(index);
  };

  const handleMouseLeave = () => {
    if (manualMode && lastActiveIndex !== null) setCurrentIndex(lastActiveIndex);
  };

  const frameIsVisible = isInViewport && focusRect.width > 0;
  const customProperties = {
    "--true-focus-border": borderColor,
    "--true-focus-glow": glowColor,
  } as CSSProperties;

  return (
    <Container className={`true-focus-container ${className}`.trim()} ref={(node: HTMLElement | null) => { containerRef.current = node; }}>
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={`${word}-${index}`}
            ref={(node) => {
              wordRefs.current[index] = node;
            }}
            className={`true-focus-word ${isActive ? "is-active" : ""}`}
            style={{
              ...customProperties,
              filter: isActive ? "blur(0)" : `blur(${blurAmount}px)`,
              transitionDuration: `${animationDuration}s`,
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.span
        aria-hidden="true"
        className="true-focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: frameIsVisible ? 1 : 0,
        }}
        transition={{ duration: animationDuration, ease: [0.22, 1, 0.36, 1] }}
        style={customProperties}
      >
        <span className="true-focus-corner true-focus-corner-top-left" />
        <span className="true-focus-corner true-focus-corner-top-right" />
        <span className="true-focus-corner true-focus-corner-bottom-left" />
        <span className="true-focus-corner true-focus-corner-bottom-right" />
      </motion.span>
    </Container>
  );
}
