import { useEffect, useRef } from "react";

type ViewportVideoProps = {
  className?: string;
  freezeAt?: number;
  poster?: string;
  preload?: "auto" | "metadata" | "none";
  resetOnPause?: boolean;
  shouldPlay?: boolean;
  src: string;
  threshold?: number;
};

export default function ViewportVideo({
  className,
  freezeAt,
  poster,
  preload = "metadata",
  resetOnPause = false,
  shouldPlay,
  src,
  threshold = 0.12,
}: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const stopAndMaybeReset = () => {
      video.pause();
      if (!resetOnPause) return;
      try {
        video.currentTime = 0;
      } catch {
        // Some streams block seeks before metadata is ready.
      }
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof freezeAt === "number" && Number.isFinite(freezeAt)) {
      let rafId: number | null = null;
      let isCancelled = false;

      const seekToFreezeTime = () => {
        if (isCancelled) return;

        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        const maxTime = duration > 0 ? Math.max(duration - 0.08, 0) : Math.max(freezeAt, 0);
        const targetTime = Math.min(Math.max(freezeAt, 0), maxTime);

        const applySeek = () => {
          if (isCancelled) return;
          if (Math.abs(video.currentTime - targetTime) <= 0.04) {
            video.pause();
            return;
          }

          const onSeeked = () => {
            video.pause();
          };
          video.addEventListener("seeked", onSeeked, { once: true });
          try {
            video.currentTime = targetTime;
          } catch {
            video.removeEventListener("seeked", onSeeked);
            video.pause();
          }
        };

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          applySeek();
          return;
        }

        const onLoadedMetadata = () => {
          applySeek();
        };
        video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
      };

      video.pause();
      rafId = window.requestAnimationFrame(seekToFreezeTime);

      return () => {
        isCancelled = true;
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
        }
        video.pause();
      };
    }

    if (prefersReducedMotion) {
      stopAndMaybeReset();
      return;
    }

    if (typeof shouldPlay === "boolean") {
      if (shouldPlay) {
        const playPromise = video.play();
        if (playPromise) {
          playPromise.catch(() => {
            // Browsers can reject autoplay while a tab is backgrounded.
          });
        }
      } else {
        stopAndMaybeReset();
      }

      return () => {
        stopAndMaybeReset();
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise) {
            playPromise.catch(() => {
              // Browsers can reject autoplay while a tab is backgrounded.
            });
          }
          return;
        }
        stopAndMaybeReset();
      },
      { rootMargin: "180px 0px", threshold }
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      stopAndMaybeReset();
    };
  }, [freezeAt, resetOnPause, shouldPlay, threshold]);

  return (
    <video ref={videoRef} className={className} loop muted playsInline poster={poster} preload={preload}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
