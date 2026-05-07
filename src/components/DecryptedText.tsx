import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type RevealDirection = "center" | "end" | "start";
type AnimateOn = "click" | "hover" | "inViewHover" | "view";
type ClickMode = "once" | "toggle";

type DecryptedTextProps = {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: RevealDirection;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: AnimateOn;
  clickMode?: ClickMode;
};

const styles = {
  srOnly: {
    border: 0,
    clip: "rect(0,0,0,0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    width: "1px",
  } as const,
  wrapper: {
    display: "inline-block",
    whiteSpace: "pre-wrap",
  } as const,
};

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "click");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const viewEnteredRef = useRef(false);

  const availableChars = useMemo(() => {
    if (useOriginalCharsOnly) {
      return Array.from(new Set(text.split(""))).filter((char) => char !== " ");
    }
    return characters.split("");
  }, [characters, text, useOriginalCharsOnly]);

  const shuffleText = useCallback(
    (originalText: string, currentRevealed: Set<number>) => {
      return originalText
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (currentRevealed.has(index)) return originalText[index] ?? char;
          const randomIndex = Math.floor(Math.random() * availableChars.length);
          return availableChars[randomIndex] ?? char;
        })
        .join("");
    },
    [availableChars]
  );

  const computeOrder = useCallback(
    (len: number) => {
      const order: number[] = [];
      if (len <= 0) return order;

      if (revealDirection === "start") {
        for (let index = 0; index < len; index += 1) order.push(index);
        return order;
      }

      if (revealDirection === "end") {
        for (let index = len - 1; index >= 0; index -= 1) order.push(index);
        return order;
      }

      const middle = Math.floor(len / 2);
      let offset = 0;
      while (order.length < len) {
        if (offset % 2 === 0) {
          const idx = middle + offset / 2;
          if (idx >= 0 && idx < len) order.push(idx);
        } else {
          const idx = middle - Math.ceil(offset / 2);
          if (idx >= 0 && idx < len) order.push(idx);
        }
        offset += 1;
      }
      return order.slice(0, len);
    },
    [revealDirection]
  );

  const fillAllIndices = useCallback(() => {
    const indices = new Set<number>();
    for (let index = 0; index < text.length; index += 1) indices.add(index);
    return indices;
  }, [text.length]);

  const removeRandomIndices = useCallback((set: Set<number>, count: number) => {
    const items = Array.from(set);
    for (let index = 0; index < count && items.length > 0; index += 1) {
      const randomIndex = Math.floor(Math.random() * items.length);
      items.splice(randomIndex, 1);
    }
    return new Set(items);
  }, []);

  const encryptInstantly = useCallback(() => {
    const emptySet = new Set<number>();
    setRevealedIndices(emptySet);
    setDisplayText(shuffleText(text, emptySet));
    setIsDecrypted(false);
  }, [shuffleText, text]);

  const triggerDecrypt = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length);
      pointerRef.current = 0;
      setRevealedIndices(new Set());
    } else {
      setRevealedIndices(new Set());
    }
    setDirection("forward");
    setIsAnimating(true);
  }, [computeOrder, sequential, text.length]);

  const triggerReverse = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length).slice().reverse();
      pointerRef.current = 0;
      const all = fillAllIndices();
      setRevealedIndices(all);
      setDisplayText(shuffleText(text, all));
    } else {
      const all = fillAllIndices();
      setRevealedIndices(all);
      setDisplayText(shuffleText(text, all));
    }
    setDirection("reverse");
    setIsAnimating(true);
  }, [computeOrder, fillAllIndices, sequential, shuffleText, text]);

  useEffect(() => {
    if (!isAnimating) return;
    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>) => {
      const textLength = text.length;
      if (revealDirection === "start") return revealedSet.size;
      if (revealDirection === "end") return textLength - 1 - revealedSet.size;

      const middle = Math.floor(textLength / 2);
      const offset = Math.floor(revealedSet.size / 2);
      const nextIndex =
        revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

      if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
        return nextIndex;
      }

      for (let index = 0; index < textLength; index += 1) {
        if (!revealedSet.has(index)) return index;
      }
      return 0;
    };

    intervalRef.current = window.setInterval(() => {
      setRevealedIndices((prevRevealed) => {
        if (sequential) {
          if (direction === "forward") {
            if (prevRevealed.size < text.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const nextRevealed = new Set(prevRevealed);
              nextRevealed.add(nextIndex);
              setDisplayText(shuffleText(text, nextRevealed));
              return nextRevealed;
            }

            if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
            setIsAnimating(false);
            setIsDecrypted(true);
            return prevRevealed;
          }

          if (pointerRef.current < orderRef.current.length) {
            const idxToRemove = orderRef.current[pointerRef.current];
            pointerRef.current += 1;
            const nextRevealed = new Set(prevRevealed);
            nextRevealed.delete(idxToRemove);
            setDisplayText(shuffleText(text, nextRevealed));
            if (nextRevealed.size === 0) {
              if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
              setIsAnimating(false);
              setIsDecrypted(false);
            }
            return nextRevealed;
          }

          if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
          setIsAnimating(false);
          setIsDecrypted(false);
          return prevRevealed;
        }

        if (direction === "forward") {
          setDisplayText(shuffleText(text, prevRevealed));
          currentIteration += 1;
          if (currentIteration >= maxIterations) {
            if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
            setIsAnimating(false);
            setDisplayText(text);
            setIsDecrypted(true);
          }
          return prevRevealed;
        }

        let currentSet = prevRevealed;
        if (currentSet.size === 0) {
          currentSet = fillAllIndices();
        }

        const removeCount = Math.max(1, Math.ceil(text.length / Math.max(1, maxIterations)));
        const nextSet = removeRandomIndices(currentSet, removeCount);
        setDisplayText(shuffleText(text, nextSet));
        currentIteration += 1;
        if (nextSet.size === 0 || currentIteration >= maxIterations) {
          if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
          setIsAnimating(false);
          setIsDecrypted(false);
          setDisplayText(shuffleText(text, new Set<number>()));
          return new Set<number>();
        }
        return nextSet;
      });
    }, speed);

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [
    direction,
    fillAllIndices,
    isAnimating,
    maxIterations,
    removeRandomIndices,
    revealDirection,
    sequential,
    shuffleText,
    speed,
    text,
  ]);

  const handleClick = () => {
    if (animateOn !== "click") return;

    if (clickMode === "once") {
      if (isDecrypted) return;
      setDirection("forward");
      triggerDecrypt();
      return;
    }

    if (isDecrypted) {
      triggerReverse();
    } else {
      setDirection("forward");
      triggerDecrypt();
    }
  };

  const triggerHoverDecrypt = useCallback(() => {
    if (isAnimating) return;
    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(text);
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, text]);

  const resetToPlainText = useCallback(() => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsDecrypted(true);
    setDirection("forward");
  }, [text]);

  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            viewEnteredRef.current = false;
            return;
          }

          if (!viewEnteredRef.current) {
            viewEnteredRef.current = true;
            if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
            setIsAnimating(false);
            setRevealedIndices(new Set());
            setDisplayText(text);
            setIsDecrypted(false);
            setDirection("forward");
            triggerDecrypt();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const node = containerRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [animateOn, text, triggerDecrypt]);

  useEffect(() => {
    if (animateOn === "click") {
      encryptInstantly();
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection("forward");
  }, [animateOn, encryptInstantly, text]);

  const animateProps =
    animateOn === "hover" || animateOn === "inViewHover"
      ? {
          onMouseEnter: triggerHoverDecrypt,
          onMouseLeave: resetToPlainText,
        }
      : animateOn === "click"
        ? {
            onClick: handleClick,
          }
        : {};

  return (
    <motion.span
      className={parentClassName}
      ref={containerRef}
      style={styles.wrapper}
      {...animateProps}
    >
      <span style={styles.srOnly}>{displayText}</span>
      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted);
          return (
            <span
              key={`${char}-${index}`}
              className={isRevealedOrDone ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
