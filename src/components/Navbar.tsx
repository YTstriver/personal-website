import { ArrowUpRight } from "lucide-react";
import logoIcon from "../assets/logo-icon.png";
import { cn } from "../lib/utils";

const navItems = ["Home", "Services", "Work", "Process", "Pricing"] as const;

const navTargetMap: Record<(typeof navItems)[number], string> = {
  Home: "#home",
  Services: "#services",
  Work: "#work",
  Process: "#process",
  Pricing: "#pricing",
};

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-8 py-3 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <a href="#home" className="inline-flex items-center">
          <img src={logoIcon} alt="Studio logo" className="h-12 w-12 rounded-full" />
        </a>

        <nav className="hidden md:flex">
          <ul className="liquid-glass flex items-center gap-1.5 rounded-full px-1.5 py-1">
            {navItems.map((item) => {
              if (item === "Pricing") {
                return (
                  <li key={item}>
                    <a
                      href={navTargetMap[item]}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium font-body text-black"
                      )}
                    >
                      Get Started
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </li>
                );
              }

              return (
                <li key={item}>
                  <a
                    href={navTargetMap[item]}
                    className="rounded-full px-3 py-2 text-sm font-medium font-body text-white/90 transition hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
