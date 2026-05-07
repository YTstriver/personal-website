import { Button } from "../ui/button";
import { HlsVideo } from "../HlsVideo";

const CTA_VIDEO_URL =
  "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

export function CtaFooterSection() {
  return (
    <section id="pricing" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 z-0">
        <HlsVideo src={CTA_VIDEO_URL} />
      </div>

      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[200px]"
        style={{ background: "linear-gradient(to bottom, black, transparent)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[200px]"
        style={{ background: "linear-gradient(to top, black, transparent)" }}
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 py-28 text-center md:px-10 lg:px-16">
        <h2 className="mx-auto max-w-5xl text-5xl font-heading italic leading-[0.85] text-white md:text-6xl lg:text-7xl">
          Your next website starts here.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-sm font-body font-light text-white/60 md:text-base">
          Book a free strategy call. See what AI-powered design can do. No
          commitment, no pressure. Just possibilities.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="glass-strong" size="lg" className="px-6 py-3">
            Book a Call
          </Button>
          <Button variant="white" size="lg" className="px-6 py-3">
            View Pricing
          </Button>
        </div>

        <footer className="mt-32 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-xs font-body text-white/40">(c) Studio. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs font-body text-white/40">
              <a href="#" className="transition hover:text-white/80">
                Privacy
              </a>
              <a href="#" className="transition hover:text-white/80">
                Terms
              </a>
              <a href="#" className="transition hover:text-white/80">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
