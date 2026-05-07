import Hls from "hls.js";
import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

interface HlsVideoProps {
  className?: string;
  poster?: string;
  src: string;
}

export function HlsVideo({ className, poster, src }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    }

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => undefined);
    }

    return () => {
      if (hls) {
        hls.destroy();
      } else {
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
