import { useLayoutEffect } from "react";
import StudioBackground from "./StudioBackground";
import StudioPortfolio, { type StudioPortfolioProps, type StudioChapterId } from "./StudioPortfolio";
import { type StudioCueId } from "../data/studioTimeline";

function navigateToCue(id: StudioCueId) {
  const reading = document.getElementById(`studio-${id}-reading`);
  const scene = reading?.closest<HTMLElement>("[data-studio-cue]");
  if (!scene) return;
  const top = scene.getBoundingClientRect().top + window.scrollY;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  window.scrollTo({ top: Math.min(top, maxScroll), behavior: "auto" });
  window.history.replaceState(null, "", `#studio-${id}-reading`);
  window.dispatchEvent(new CustomEvent("studionavigate", { detail: id }));
}

export default function StudioExperience({ catalog }: Pick<StudioPortfolioProps, "catalog">) {
  useLayoutEffect(() => {
    document.documentElement.dataset.studioExperience = "true";
    const restoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const resetEntry = () => {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    resetEntry();
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      resetEntry();
      window.dispatchEvent(new Event("studioreset"));
    };
    const restoreReading = () => {
      const cue = window.location.hash.match(/^#studio-(welcome|me|skills|bim|blender|travel|photo|end)(?:-reading)?$/)?.[1];
      if (cue) navigateToCue(cue as StudioCueId);
    };
    window.addEventListener("hashchange", restoreReading);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("hashchange", restoreReading);
      window.removeEventListener("pageshow", onPageShow);
      window.history.scrollRestoration = restoration;
      delete document.documentElement.dataset.studioExperience;
    };
  }, []);

  const navigate = (id: StudioChapterId | "skills") => {
    navigateToCue(id);
  };

  return (
    <>
      <StudioBackground />
      <StudioPortfolio catalog={catalog} onNavigate={navigate} onReturnTop={() => navigateToCue("welcome")} />
    </>
  );
}
