import { useEffect, useState, type MouseEvent } from "react";
import type { StudioChapterId } from "./StudioPortfolio";
import "./StudioChapterNav.css";

type DirectoryCue = StudioChapterId | "skills";

const entries: ReadonlyArray<{ id: DirectoryCue; label: string; title: string }> = [
  { id: "me", label: "About", title: "关于我" },
  { id: "skills", label: "Skills", title: "技能包" },
  { id: "bim", label: "BIM", title: "BIM工程案例分享" },
  { id: "blender", label: "Blender", title: "Blender学习计划" },
  { id: "travel", label: "Film", title: "城市逃离计划" },
  { id: "photo", label: "Photo", title: "光影行纪档案" },
  { id: "end", label: "end", title: "联系" },
];

const isDirectoryCue = (cue: string | undefined): cue is DirectoryCue => entries.some(entry => entry.id === cue);

function readBackground() {
  const cue = document.getElementById("studio-background")?.dataset.cue;
  return { active: isDirectoryCue(cue) ? cue : "me" as DirectoryCue, visible: isDirectoryCue(cue) };
}

export default function StudioChapterNav({ onNavigate }: { onNavigate?: (cue: DirectoryCue) => void }) {
  const [directory, setDirectory] = useState(readBackground);

  useEffect(() => {
    if (document.getElementById("studio-background")) {
      let connected = true;
      const synchronize = () => {
        if (!connected) return;
        const next = readBackground();
        setDirectory(current => current.active === next.active && current.visible === next.visible ? current : next);
      };
      queueMicrotask(synchronize);
      window.addEventListener("studiochapterchange", synchronize);
      return () => {
        connected = false;
        window.removeEventListener("studiochapterchange", synchronize);
      };
    }

    const scenes = document.querySelectorAll<HTMLElement>(".studio-main [data-studio-cue]");
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      const incoming = entries.find(entry => entry.isIntersecting);
      if (!incoming) return;
      const cue = (incoming.target as HTMLElement).dataset.studioCue;
      setDirectory({ active: isDirectoryCue(cue) ? cue : "me", visible: isDirectoryCue(cue) });
    }, { rootMargin: "-35% 0px -60% 0px", threshold: 0 });
    scenes.forEach(scene => observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  function navigate(event: MouseEvent<HTMLAnchorElement>, cue: DirectoryCue) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (onNavigate) {
      onNavigate(cue);
      return;
    }
    const scene = document.querySelector<HTMLElement>(`[data-studio-cue="${cue}"]`);
    if (scene) window.scrollTo({ top: scene.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    window.history.replaceState(null, "", `#studio-${cue}-reading`);
  }

  const activeIndex = entries.findIndex(entry => entry.id === directory.active);

  return <nav className="studio-chapter-nav" aria-label="章节目录" data-visible={directory.visible} aria-hidden={!directory.visible} inert={!directory.visible}>
    {entries.map((entry, index) => <a
      key={entry.id}
      className="studio-chapter-link"
      data-label={entry.label}
      href={`#studio-${entry.id}-reading`}
      aria-label={`${entry.label}：${entry.title}`}
      aria-current={directory.active === entry.id ? "location" : undefined}
      onClick={event => navigate(event, entry.id)}
    >
      {directory.active === entry.id
        ? <span className="studio-current-label" aria-hidden="true">{entry.label}</span>
        : <span className="studio-nav-dot" data-distance={Math.min(5, Math.abs(index - activeIndex))} aria-hidden="true" />}
    </a>)}
  </nav>;
}
