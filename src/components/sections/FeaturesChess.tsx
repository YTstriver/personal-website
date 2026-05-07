import feature1 from "../../assets/feature-1.gif";
import feature2 from "../../assets/feature-2.gif";
import { Button } from "../ui/button";

export function FeaturesChess() {
  return (
    <section id="work" className="mx-auto w-full max-w-7xl px-6 py-28 md:px-10 lg:px-16">
      <div className="text-center">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium font-body text-white">
          Capabilities
        </span>
        <h2 className="mt-6 text-4xl font-heading italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
          Pro features. Zero complexity.
        </h2>
      </div>

      <div className="mt-20 space-y-20">
        <article className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          <div className="w-full lg:w-1/2">
            <h3 className="text-3xl font-heading italic text-white md:text-4xl">
              Designed to convert. Built to perform.
            </h3>
            <p className="mt-5 text-sm font-body font-light leading-relaxed text-white/60 md:text-base">
              Every pixel is intentional. Our AI studies what works across
              thousands of top sites--then builds yours to outperform them all.
            </p>
            <Button variant="glass-strong" className="mt-7 px-5 py-2.5">
              Learn more
            </Button>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="liquid-glass overflow-hidden rounded-2xl">
              <img
                src={feature1}
                alt="Feature preview one"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </article>

        <article className="flex flex-col items-center gap-10 lg:flex-row-reverse lg:gap-16">
          <div className="w-full lg:w-1/2">
            <h3 className="text-3xl font-heading italic text-white md:text-4xl">
              It gets smarter. Automatically.
            </h3>
            <p className="mt-5 text-sm font-body font-light leading-relaxed text-white/60 md:text-base">
              Your site evolves on its own. AI monitors every click, scroll, and
              conversion--then optimizes in real time. No manual updates. Ever.
            </p>
            <Button variant="glass-strong" className="mt-7 px-5 py-2.5">
              See how it works
            </Button>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="liquid-glass overflow-hidden rounded-2xl">
              <img
                src={feature2}
                alt="Feature preview two"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
