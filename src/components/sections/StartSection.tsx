import { Button } from "../ui/button";
import { HlsVideo } from "../HlsVideo";

const START_VIDEO_URL =
  "https://stream.mux.com/9JXDljEVWYwWu01PUkAemafDugK89o01BR6zqJ3aS9u00A.m3u8";

export function StartSection() {
  return (
    <section id="process" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 z-0">
        <HlsVideo src={START_VIDEO_URL} />
      </div>
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[200px]"
        style={{ background: "linear-gradient(to bottom, black, transparent)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[200px]"
        style={{ background: "linear-gradient(to top, black, transparent)" }}
      />

      <div className="relative z-20 mx-auto flex min-h-[500px] w-full max-w-4xl flex-col items-center justify-center px-6 py-24 text-center md:px-10">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium font-body text-white">
          How It Works
        </span>
        <h2 className="mt-6 text-4xl font-heading italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
          You dream it. We ship it.
        </h2>
        <p className="mt-6 max-w-2xl text-sm font-body font-light text-white/60 md:text-base">
          Share your vision. Our AI handles the rest--wireframes, design, code,
          launch. All in days, not quarters.
        </p>
        <Button variant="glass-strong" size="lg" className="mt-8 px-6 py-3">
          Get Started
        </Button>
      </div>
    </section>
  );
}
