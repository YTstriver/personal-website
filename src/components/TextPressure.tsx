import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./TextPressure.css";

type TextPressureProps = {
  alpha?: boolean;
  className?: string;
  flex?: boolean;
  fontFamily?: string;
  fontUrl?: string;
  italic?: boolean;
  minFontSize?: number;
  scale?: boolean;
  stroke?: boolean;
  strokeColor?: string;
  text?: string;
  textColor?: string;
  weight?: boolean;
  width?: boolean;
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getAttr = (distance: number, maxDist: number, minVal: number, maxVal: number) => {
  const val = maxVal - Math.abs((maxVal * distance) / maxDist);
  return Math.max(minVal, val + minVal);
};

const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default function TextPressure({
  text = "Compressa",
  fontFamily = "Compressa VF",
  fontUrl = "https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  scale = false,
  textColor = "#FFFFFF",
  strokeColor = "#FF0000",
  className = "",
  minFontSize = 24,
}: TextPressureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const spansRef = useRef<Array<HTMLSpanElement | null>>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const scheduleAnimationRef = useRef<() => void>(() => undefined);

  const [fontSize, setFontSize] = useState(minFontSize);
  const [scaleY, setScaleY] = useState(1);
  const [lineHeight, setLineHeight] = useState(1);

  const chars = text.split("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      scheduleAnimationRef.current();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      cursorRef.current.x = t.clientX;
      cursorRef.current.y = t.clientY;
      scheduleAnimationRef.current();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Keep text in low-opacity state before first interaction.
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
    cursorRef.current.x = -9999;
    cursorRef.current.y = -9999;

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const setSize = useCallback(() => {
    if (!containerRef.current || !titleRef.current) return;

    const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

    let newFontSize = containerW / Math.max(chars.length, 1);
    newFontSize = Math.max(newFontSize, minFontSize);
    newFontSize = Math.min(newFontSize, 260);

    setFontSize(newFontSize);
    setScaleY(1);
    setLineHeight(1);

    requestAnimationFrame(() => {
      if (!titleRef.current) return;
      const textRect = titleRef.current.getBoundingClientRect();
      if (scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        setScaleY(yRatio);
        setLineHeight(yRatio);
      }
    });
  }, [chars.length, minFontSize, scale]);

  useEffect(() => {
    const debouncedSetSize = debounce(() => setSize(), 100);
    debouncedSetSize();
    window.addEventListener("resize", debouncedSetSize);
    return () => window.removeEventListener("resize", debouncedSetSize);
  }, [setSize]);

  useEffect(() => {
    let rafId = 0;
    let settleFrames = 0;

    const schedule = () => {
      settleFrames = 22;
      if (rafId) return;
      rafId = requestAnimationFrame(animate);
    };

    const animate = () => {
      rafId = 0;
      mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
      mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;

          const rect = span.getBoundingClientRect();
          const charCenter = {
            x: rect.x + rect.width / 2,
            y: rect.y + rect.height / 2,
          };

          const d = dist(mouseRef.current, charCenter);
          const pressure = Math.min(Math.max(getAttr(d, maxDist, 0, 1), 0), 1);

          const wdth = width ? Math.floor(getAttr(d, maxDist, 5, 200)) : 100;
          const wght = weight ? Math.floor(getAttr(d, maxDist, 100, 900)) : 400;
          const italVal = italic ? getAttr(d, maxDist, 0, 1).toFixed(2) : "0";
          const alphaValNum = alpha ? 0.28 + pressure * 0.72 : 1;
          const alphaVal = alphaValNum.toFixed(2);

          const newFontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
          if (span.style.fontVariationSettings !== newFontVariationSettings) {
            span.style.fontVariationSettings = newFontVariationSettings;
          }

          if (alpha && span.style.opacity !== alphaVal) {
            span.style.opacity = alphaVal;
          }

          const glowStrength = Math.max(0, (pressure - 0.16) / 0.84);
          const glowShadow =
            glowStrength > 0.02
              ? `0 0 ${(1 + glowStrength * 10).toFixed(1)}px rgba(255,255,255,${(
                  glowStrength * 0.48
                ).toFixed(2)}), 0 0 ${(4 + glowStrength * 26).toFixed(1)}px rgba(225,242,255,${(
                  glowStrength * 0.82
                ).toFixed(2)})`
              : "none";

          if (span.style.textShadow !== glowShadow) {
            span.style.textShadow = glowShadow;
          }

          // Fallback pressure transform for non-variable CJK fonts.
          const scaleValue = 0.96 + pressure * 0.1;
          span.style.transform = `translateY(${(1 - pressure) * 2}px) scale(${scaleValue})`;
        });
      }

      const dx = cursorRef.current.x - mouseRef.current.x;
      const dy = cursorRef.current.y - mouseRef.current.y;
      const isSettling = Math.sqrt(dx * dx + dy * dy) > 0.2;
      settleFrames -= 1;

      if (isSettling || settleFrames > 0) {
        rafId = requestAnimationFrame(animate);
      }
    };

    scheduleAnimationRef.current = schedule;
    schedule();

    return () => {
      scheduleAnimationRef.current = () => undefined;
      cancelAnimationFrame(rafId);
    };
  }, [alpha, italic, weight, width]);

  const styleElement = useMemo(() => {
    const fontFace = fontUrl
      ? `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }
      `
      : "";

    return (
      <style>{`
        ${fontFace}
        .text-pressure-stroke span {
          color: ${textColor};
        }
        .text-pressure-stroke span::after {
          color: transparent;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${strokeColor};
        }
        .text-pressure-title {
          color: ${textColor};
        }
      `}</style>
    );
  }, [fontFamily, fontUrl, strokeColor, textColor]);

  const dynamicClassName = [
    className,
    flex ? "text-pressure-flex" : "",
    stroke ? "text-pressure-stroke" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const titleStyle: CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight: 100,
    lineHeight,
    textTransform: "uppercase",
    transform: `scale(1, ${scaleY})`,
    transformOrigin: "center top",
  };

  return (
    <div
      ref={containerRef}
      className="text-pressure-root"
      style={{ height: "auto", minHeight: "1em", width: "100%" }}
    >
      {styleElement}
      <h1 ref={titleRef} className={`text-pressure-title ${dynamicClassName}`} style={titleStyle}>
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            data-char={char}
            style={{ color: stroke ? undefined : textColor, display: "inline-block" }}
          >
            {char}
          </span>
        ))}
      </h1>
    </div>
  );
}
