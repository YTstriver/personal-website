import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import "./SplitText.css";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

type SplitTextTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";

type SplitTextProps = {
  tag?: SplitTextTag;
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right" | "start" | "end";
  onLetterAnimationComplete?: () => void;
};

type SplitCollection = {
  chars?: Element[];
  lines?: Element[];
  words?: Element[];
};

export default function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  tag = "p",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(
    () => typeof document !== "undefined" && document.fonts.status === "loaded"
  );

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (fontsLoaded) return;
    let mounted = true;
    document.fonts.ready.then(() => {
      if (mounted) setFontsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [fontsLoaded]);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;

      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: { revert?: () => void } | null;
      };

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert?.();
        } catch {
          // noop
        }
        el._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch?.[2] ?? "px";
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] | undefined;

      const assignTargets = (self: SplitCollection) => {
        if (splitType.includes("chars") && self.chars?.length) targets = self.chars;
        if (!targets && splitType.includes("words") && self.words?.length) targets = self.words;
        if (!targets && splitType.includes("lines") && self.lines?.length) targets = self.lines;
        if (!targets) targets = self.chars || self.words || self.lines || [];
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self: SplitCollection) => {
          assignTargets(self);
          return gsap.fromTo(
            targets || [],
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                toggleActions: "restart none restart reset",
                fastScrollEnd: true,
                anticipatePin: 0.4,
                invalidateOnRefresh: true,
              },
              onComplete: () => onCompleteRef.current?.(),
              willChange: "transform, opacity",
              force3D: true,
            }
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          // noop
        }
        el._rbsplitInstance = null;
      };
    },
    {
      dependencies: [
        text,
        className,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        textAlign,
        fontsLoaded,
      ],
      scope: ref,
    }
  );

  const Tag = tag;
  return (
    <Tag
      ref={ref as never}
      className={`split-parent ${className}`.trim()}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
        willChange: "transform, opacity",
      }}
    >
      {text}
    </Tag>
  );
}
