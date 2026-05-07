import { BarChart3, Palette, Shield, Zap } from "lucide-react";

const items = [
  {
    icon: Zap,
    title: "Days, Not Months",
    body: "Concept to launch at a pace that redefines fast. Because waiting isn't a strategy.",
  },
  {
    icon: Palette,
    title: "Obsessively Crafted",
    body: "Every detail considered. Every element refined. Design so precise, it feels inevitable.",
  },
  {
    icon: BarChart3,
    title: "Built to Convert",
    body: "Layouts informed by data. Decisions backed by performance. Results you can measure.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    body: "Enterprise-grade protection comes standard. SSL, DDoS mitigation, compliance. All included.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="services" className="mx-auto w-full max-w-7xl px-6 py-28 md:px-10 lg:px-16">
      <div className="text-center">
        <span className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium font-body text-white">
          Why Us
        </span>
        <h2 className="mt-6 text-4xl font-heading italic leading-[0.9] tracking-tight text-white md:text-5xl lg:text-6xl">
          The difference is everything.
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, body }) => (
          <article key={title} className="liquid-glass rounded-2xl p-6">
            <div className="liquid-glass-strong flex h-10 w-10 items-center justify-center rounded-full">
              <Icon className="h-4 w-4 text-white" />
            </div>
            <h3 className="mt-6 text-xl font-heading italic text-white">{title}</h3>
            <p className="mt-3 text-sm font-body font-light leading-relaxed text-white/60">
              {body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
