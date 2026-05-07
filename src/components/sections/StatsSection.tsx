import { HlsVideo } from "../HlsVideo";

const STATS_VIDEO_URL =
  "https://stream.mux.com/NcU3HlHeF7CUL86azTTzpy3Tlb00d6iF3BmCdFslMJYM.m3u8";

const stats = [
  { value: "200+", label: "Sites launched" },
  { value: "98%", label: "Client satisfaction" },
  { value: "3.2x", label: "More conversions" },
  { value: "5 days", label: "Average delivery" },
];

export function StatsSection() {
  return (
    <section className="relative isolate overflow-hidden py-28">
      <div className="absolute inset-0 z-0 saturate-0">
        <HlsVideo src={STATS_VIDEO_URL} />
      </div>

      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-[200px]"
        style={{ background: "linear-gradient(to bottom, black, transparent)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[200px]"
        style={{ background: "linear-gradient(to top, black, transparent)" }}
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
        <div className="liquid-glass rounded-3xl p-12 md:p-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <article key={item.label}>
                <p className="text-4xl font-heading italic text-white md:text-5xl lg:text-6xl">
                  {item.value}
                </p>
                <p className="mt-3 text-sm font-body font-light text-white/60">
                  {item.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
