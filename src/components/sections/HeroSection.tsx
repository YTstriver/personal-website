import { ArrowUpRight, Play } from "lucide-react";
import { motion } from "motion/react";
import { BlurText } from "../BlurText";
import { Button } from "../ui/button";

const HERO_VIDEO_URL = "/videos/hero-loop.mp4";

const PARTNERS = ["Stripe", "Vercel", "Linear", "Notion", "Figma"];

export function HeroSection() {
  return (
    <section id="home" className="relative h-[1000px] overflow-visible">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero_bg.jpeg"
        className="absolute left-0 top-[20%] z-0 h-auto w-full object-contain"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      <div className="absolute inset-0 z-0 bg-black/5" />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[300px]"
        style={{ background: "linear-gradient(to bottom, transparent, black)" }}
      />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-7xl flex-col items-center px-6 pt-[150px] text-center md:px-10 lg:px-16">
        <div className="liquid-glass inline-flex items-center gap-2 rounded-full px-1 py-1">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            New
          </span>
          <span className="pr-3 text-xs font-medium font-body text-white">
            Introducing AI-powered web design.
          </span>
        </div>

        <h1 className="mt-8 max-w-2xl text-6xl font-heading italic leading-[0.8] tracking-[-4px] text-foreground md:text-7xl lg:text-[5.5rem]">
          <BlurText text="The Website Your Brand Deserves" delay={100} direction="bottom" />
        </h1>

        <motion.p
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          className="mt-6 max-w-xl text-sm font-body font-light leading-tight text-white md:text-base"
        >
          Stunning design. Blazing performance. Built by AI, refined by experts.
          This is web design, wildly reimagined.
        </motion.p>

        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
          className="mt-8 flex items-center gap-4"
        >
          <Button variant="glass-strong" size="lg" className="px-5 py-2.5">
            Get Started
            <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="lg" className="px-4 py-2.5">
            <Play className="h-4 w-4 fill-current" />
            Watch the Film
          </Button>
        </motion.div>

        <div className="mt-auto w-full pb-8 pt-16">
          <div className="mx-auto mb-8 inline-flex rounded-full liquid-glass px-3.5 py-1 text-xs font-medium font-body text-white">
            Trusted by the teams behind
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {PARTNERS.map((partner) => (
              <span
                key={partner}
                className="text-2xl font-heading italic text-white md:text-3xl"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
