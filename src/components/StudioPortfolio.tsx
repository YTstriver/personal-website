import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
  Fragment,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import SiteAnalytics from "./SiteAnalytics";
import BlurText from "./BlurText";
import ParticleText from "./ParticleText";
import StudioMusic from "./StudioMusic";
import StudioChapterNav from "./StudioChapterNav";
import StudioTopButton from "./StudioTopButton";
import FlipCard from "./FlipCard";
import SkillTreePanel from "./SkillTreePanel";
import StudioContactLinks from "./StudioContactLinks";
import StudioFooter from "./StudioFooter";
import { useStudioPhoneLayout } from "../hooks/useStudioPhoneLayout";
import "./StudioPortfolio.css";
import "./StudioEnding.css";
import "./StudioPhone.css";

const DepthCarousel = lazy(() => import("./DepthCarousel"));
const DriftWall = lazy(() => import("./DriftWall"));
const StudioPhonePhotos = lazy(() => import("./StudioPhonePhotos"));

export type StudioChapterId = "me" | "bim" | "blender" | "travel" | "photo" | "end";

export type StudioVideoItem = {
  id: string;
  title: string;
  summary: string;
  src: string;
  poster?: string;
  embedSrc?: string;
};

export type StudioPhotoItem = {
  id: string;
  title: string;
  src: string;
  thumbnail?: string;
};

export type StudioAbout = {
  name?: string;
  title?: string;
  intro?: string;
  skills?: string[];
  strengths?: string[];
  qualifications?: string[];
  practiceQualification?: string;
  professionalTitle?: string;
};

export type StudioPortfolioProps = {
  catalog: {
    about?: StudioAbout;
    bim: StudioVideoItem[];
    blender: StudioVideoItem[];
    travel: StudioVideoItem[];
    photos: StudioPhotoItem[];
    contacts: { label: string; href: string }[];
  };
  onNavigate?: (chapter: StudioChapterId | "skills") => void;
  onReturnTop: () => void;
  onActiveChapterChange?: (chapter: StudioChapterId) => void;
};

// Chapter metadata is also used by the sibling background controller.
// eslint-disable-next-line react-refresh/only-export-components
export const STUDIO_CHAPTERS: ReadonlyArray<{
  id: StudioChapterId;
  label: string;
  title: string;
}> = [
  { id: "me", label: "我", title: "关于我" },
  { id: "bim", label: "BIM", title: "BIM工程案例分享" },
  { id: "blender", label: "blender", title: "Blender学习计划" },
  { id: "travel", label: "旅行", title: "城市逃离计划" },
  { id: "photo", label: "影像", title: "光影行纪档案" },
  { id: "end", label: "end", title: "联系" },
];

type OpenMedia = { kind: "video"; item: StudioVideoItem } | { kind: "photo"; index: number };

function Chapter({ id, children, footer }: { id: StudioChapterId; children: ReactNode; footer?: ReactNode }) {
  return (
    <section id={`studio-${id}`} className={`studio-chapter studio-chapter--${id} studio-scene`} data-studio-chapter={id} data-studio-cue={id} aria-labelledby={`studio-${id}-heading`}>
      <div id={`studio-${id}-reading`} className="studio-reading" data-studio-phase="reading">
        <div className="studio-reading-content">{children}</div>
        {footer}
      </div>
    </section>
  );
}

function ChapterHeader({ id, title, description }: { id: StudioChapterId | "skills"; title: string; description?: string }) {
  const phone = useStudioPhoneLayout();
  const [animation, setAnimation] = useState(() => {
    const motion = id !== "end" && !phone;
    const background = document.getElementById("studio-background");
    const active = motion && (document.documentElement.dataset.studioPlaying !== "true" || background?.dataset.revealing === "true")
      && background?.dataset.cue === id;
    return { motion, active, present: active };
  });

  const finishExit = useCallback(() => {
    setAnimation(current => current.active || !current.present ? current : { ...current, present: false });
  }, []);

  useEffect(() => {
    let connected = true;
    const synchronize = () => {
      if (!connected) return;
      const background = document.getElementById("studio-background");
      const motion = id !== "end" && !phone;
      const playing = document.documentElement.dataset.studioPlaying === "true";
      const visible = !playing || background?.dataset.revealing === "true";
      const active = motion && visible && background?.dataset.cue === id;
      setAnimation(current => {
        const present = motion && visible && (active || current.present);
        return current.motion === motion && current.active === active && current.present === present
          ? current : { motion, active, present };
      });
    };
    queueMicrotask(synchronize);
    window.addEventListener("studiochapterchange", synchronize);
    return () => {
      connected = false;
      window.removeEventListener("studiochapterchange", synchronize);
    };
  }, [id, phone]);

  return (
    <header className="studio-chapter-header">
      <h2 id={`studio-${id}-heading`} aria-label={title} className={id !== "end" && !phone ? "studio-particle-heading" : undefined}>
        <span className="studio-sr-only">{title}</span>
        <span aria-hidden="true">
          {animation.motion && !phone ? animation.present ? <ParticleText
            text={title}
            active={animation.active}
            exitDuration={480}
            onExitComplete={finishExit}
            className="studio-particle-title"
            fontSize="1em"
            fontWeight={650}
            align="left"
            color="#351d12"
            highlightColor="#8d5431"
            density={2}
            particleSize={1.65}
            scatter={65}
            gatherDuration={1100}
            startDelay={450}
            stagger={180}
            pointerRepel={0}
            idleDrift={0}
            glow={false}
          /> : <span className="studio-particle-title" style={{ display: "block" }} /> : title}
        </span>
      </h2>
      {description && <p>{description}</p>}
    </header>
  );
}

function Resume({ about }: { about?: StudioAbout }) {
  const qualifications = about?.qualifications?.length
    ? about.qualifications : [about?.practiceQualification?.trim() || "待补充"];
  const fieldsRef = useRef<HTMLDListElement>(null);
  const [cardEnabled, setCardEnabled] = useState(() => {
    const background = document.getElementById("studio-background");
    return document.documentElement.dataset.studioPlaying !== "true"
      && (!background || background.dataset.cue === "me");
  });

  useEffect(() => {
    let connected = true;
    const synchronize = () => {
      if (!connected) return;
      const background = document.getElementById("studio-background");
      setCardEnabled(document.documentElement.dataset.studioPlaying !== "true"
        && (!background || background.dataset.cue === "me"));
    };
    queueMicrotask(synchronize);
    window.addEventListener("studiochapterchange", synchronize);
    return () => {
      connected = false;
      window.removeEventListener("studiochapterchange", synchronize);
    };
  }, []);

  useLayoutEffect(() => {
    const fields = fieldsRef.current;
    const resume = fields?.parentElement;
    if (!fields || !resume) return;
    let previousHeight = 0;
    const synchronize = () => {
      const height = fields.getBoundingClientRect().height;
      if (height <= 0 || Math.abs(height - previousHeight) < .1) return;
      previousHeight = height;
      resume.style.setProperty("--studio-profile-height", `${height}px`);
    };
    synchronize();
    const observer = new ResizeObserver(synchronize);
    observer.observe(fields);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="studio-resume">
      <FlipCard
        front={<>
          <img className="flip-card__cartoon" src="/images/profile/studio-cartoon-cutout.webp" alt="卡通人物头像" loading="lazy" decoding="async" draggable={false} />
          <span className="flip-card__name" aria-hidden="true">小楊同學</span>
        </>}
        back={<>
          <img className="flip-card__portrait" src="/images/profile/studio-riding.webp" alt="雪山草原骑马照片" loading="lazy" decoding="async" draggable={false} />
          <img className="flip-card__signature" src="/images/signature/studio-profile-signature.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
        </>}
        name={about?.name?.trim() || "小楊同學"}
        enabled={cardEnabled}
        className="studio-flip-card"
      />
      <dl ref={fieldsRef} className="studio-profile-fields">
        <div>
          <dt>执业资格</dt>
          <dd><ul className="studio-profile-qualifications">{qualifications.map(item => {
            const detailStart = item.indexOf("（");
            return <li key={item}>{detailStart < 0 ? item : <>
              <span>{item.slice(0, detailStart)}</span>
              <span className="studio-profile-qualification-detail">{item.slice(detailStart)}</span>
            </>}</li>;
          })}</ul></dd>
        </div>
        <div><dt>职称</dt><dd>{about?.professionalTitle?.trim() || "待补充"}</dd></div>
      </dl>
    </div>
  );
}

function MeStage({ cue, children }: { cue: "welcome" | "me" | "skills"; children: ReactNode }) {
  return (
    <div className={`studio-stage studio-stage--${cue} studio-scene`} data-studio-cue={cue}>
      <div id={`studio-${cue}-reading`} className={`studio-reading${cue === "welcome" ? " studio-reading--welcome" : ""}`} data-studio-phase="reading">
        {cue === "welcome" ? children : <div className="studio-reading-content">{children}</div>}
      </div>
    </div>
  );
}

function WelcomeHeading() {
  const phone = useStudioPhoneLayout();
  const [active, setActive] = useState(() => {
    const background = document.getElementById("studio-background");
    return (document.documentElement.dataset.studioPlaying !== "true" || background?.dataset.revealing === "true")
      && (!background || background.dataset.cue === "welcome");
  });

  useEffect(() => {
    let connected = true;
    const synchronize = () => {
      if (!connected) return;
      const background = document.getElementById("studio-background");
      setActive((document.documentElement.dataset.studioPlaying !== "true" || background?.dataset.revealing === "true")
        && (!background || background.dataset.cue === "welcome"));
    };
    queueMicrotask(synchronize);
    window.addEventListener("studiochapterchange", synchronize);
    return () => {
      connected = false;
      window.removeEventListener("studiochapterchange", synchronize);
    };
  }, []);

  return (
    <h1>
      <span className="studio-sr-only">欢迎来到我的工作室</span>
      <span aria-hidden="true">
        {active && !phone ? ["欢迎来到", "我的工作室"].map((text, index) => (
          <BlurText
            key={text}
            text={text}
            as="span"
            className="studio-blur-line"
            animateBy="letters"
            direction="bottom"
            delay={60}
            startDelay={100 + index * 120}
            stepDuration={0.35}
            animationFrom={{ filter: "blur(10px)", opacity: 0, y: 18 }}
            animationTo={[
              { filter: "blur(4px)", opacity: 0.5, y: -3 },
              { filter: "blur(0px)", opacity: 1, y: 0 },
            ]}
          />
        )) : <>欢迎来到<br />我的工作室</>}
      </span>
    </h1>
  );
}

function MeChapter({ about }: { about?: StudioAbout }) {
  const phone = useStudioPhoneLayout();
  return (
    <section id="studio-me" className="studio-chapter studio-chapter--me" data-studio-chapter="me" aria-labelledby="studio-me-heading">
      <MeStage cue="welcome">
        <div className="studio-welcome">
          <WelcomeHeading />
          <span className="studio-scroll-cue">Welcome<span className="studio-scroll-arrow" aria-hidden="true">↓</span></span>
        </div>
      </MeStage>
      <MeStage cue="me">
        <ChapterHeader id="me" title="关于我" />
        <Resume about={about} />
        {phone && <div className="studio-phone-about-note">
          {about?.title && <p>{about.title}</p>}
          <span>轻触卡片，翻看骑马照片与签名</span>
        </div>}
      </MeStage>
      <MeStage cue="skills">
        <ChapterHeader id="skills" title="技能包" />
        <SkillTreePanel />
      </MeStage>
    </section>
  );
}

function WorkCarousel({ items, enabled, openVideo }: { items: StudioVideoItem[]; enabled: boolean; openVideo: (item: StudioVideoItem, trigger: HTMLElement) => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slides = useMemo(() => items.map(item => ({ id: item.id, image: item.poster, caption: item.title })), [items]);
  const activeIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));
  const selected = items[activeIndex];

  return <div className="studio-video-showcase">
    {selected ? <>
      <Suspense fallback={<div className="depth-carousel studio-carousel-loading" aria-hidden="true">{selected.poster && <img src={selected.poster} alt="" />}</div>}>
      <DepthCarousel
        items={slides}
        onChange={setSelectedIndex}
        onActivate={(index, trigger) => openVideo(items[index], trigger)}
        enabled={enabled}
        startIndex={0}
      />
      </Suspense>
      <div className="studio-gallery-details" aria-live="polite">
        <h3>{selected.title}</h3>
        <p>{selected.summary}</p>
        {/* Reserve each text row for this chapter's longest entry at the current width. */}
        {items.map(item => <Fragment key={item.id}>
          <h3 className="studio-gallery-sizer" aria-hidden="true">{item.title}</h3>
          <p className="studio-gallery-sizer" aria-hidden="true">{item.summary}</p>
        </Fragment>)}
      </div>
      <div className="studio-work-position"><span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><span>上下切换作品</span></div>
    </> : <p className="studio-empty-field">作品待补充</p>}
  </div>;
}

function PhotoArchive({ items, enabled, openPhoto }: { items: StudioPhotoItem[]; enabled: boolean; openPhoto: (index: number, trigger: HTMLElement) => void }) {
  const phone = useStudioPhoneLayout();
  const photos = useMemo(() => items.map(photo => ({ id: photo.id, image: photo.thumbnail || photo.src, title: photo.title })), [items]);
  return <div className="studio-photo-archive">
    {items.length ? <>
      <Suspense fallback={<div className="studio-photo-loading" aria-hidden="true">{photos.slice(0, 4).map(photo => <img key={photo.id} src={photo.image} alt="" />)}</div>}>
        {phone ? <StudioPhonePhotos items={items} enabled={enabled} onActivate={openPhoto} />
          : <DriftWall items={photos} enabled={enabled} onActivate={openPhoto} />}
      </Suspense>
      <div className="studio-photo-hint"><span>{items.length} 张照片</span><span>浏览照片 · 点击放大</span></div>
    </> : <p className="studio-empty-field">影像待补充</p>}
  </div>;
}

export default function StudioPortfolio({ catalog, onNavigate, onReturnTop, onActiveChapterChange }: StudioPortfolioProps) {
  const mainRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState<StudioChapterId>("me");
  const [playing, setPlaying] = useState(() => document.documentElement.dataset.studioPlaying === "true");
  const [media, setMedia] = useState<OpenMedia | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const activeChangeRef = useRef(onActiveChapterChange);

  useEffect(() => { activeChangeRef.current = onActiveChapterChange; }, [onActiveChapterChange]);

  useEffect(() => {
    const background = document.getElementById("studio-background");
    if (background) {
      let connected = true;
      const synchronizeChapter = (event?: Event) => {
        if (!connected) return;
        setPlaying(document.documentElement.dataset.studioPlaying === "true");
        const chapter = event ? (event as CustomEvent<StudioChapterId>).detail : background.dataset.chapter;
        if (STUDIO_CHAPTERS.some((item) => item.id === chapter)) setActiveChapter(chapter as StudioChapterId);
      };
      window.addEventListener("studiochapterchange", synchronizeChapter);
      queueMicrotask(() => synchronizeChapter());
      return () => {
        connected = false;
        window.removeEventListener("studiochapterchange", synchronizeChapter);
      };
    }
    const sections = mainRef.current?.querySelectorAll<HTMLElement>("[data-studio-chapter]");
    if (!sections || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver((entries) => {
      const incoming = entries.find((entry) => entry.isIntersecting);
      if (incoming) {
        setActiveChapter((incoming.target as HTMLElement).dataset.studioChapter as StudioChapterId);
      }
    }, { rootMargin: "-35% 0px -60% 0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => { activeChangeRef.current?.(activeChapter); }, [activeChapter]);

  useEffect(() => {
    const resetMedia = () => { returnFocusRef.current = null; setMedia(null); };
    window.addEventListener("studioreset", resetMedia);
    return () => window.removeEventListener("studioreset", resetMedia);
  }, []);

  const mediaOpen = media !== null;
  useEffect(() => {
    if (!mediaOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const main = mainRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    window.dispatchEvent(new Event("studiomediachange"));
    return () => {
      dialog.querySelector("video")?.pause();
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      const trigger = returnFocusRef.current;
      const usable = (node: HTMLElement | null | undefined) => node?.isConnected && !node.closest('[inert], [aria-hidden="true"]') && node.getBoundingClientRect().width > 0;
      if (usable(trigger)) trigger?.focus({ preventScroll: true });
      else {
        const reading = main?.querySelector<HTMLElement>('.studio-scene[data-studio-active="true"] .studio-reading:not([inert])')
          ?? main?.querySelector<HTMLElement>(".studio-reading:not([inert])");
        const photoIndex = trigger?.dataset.photoIndex;
        const matchingPhoto = photoIndex && /^\d+$/.test(photoIndex)
          ? reading?.querySelector<HTMLElement>(`.drift-wall__tile[data-canonical="true"][data-photo-index="${photoIndex}"]`)
          : null;
        const fallback = matchingPhoto ?? reading?.querySelector<HTMLElement>(".depth-carousel__play")
          ?? reading?.querySelector<HTMLElement>('.drift-wall__tile:not([aria-hidden="true"])')
          ?? reading?.querySelector<HTMLElement>('button:not([aria-hidden="true"]), a');
        if (usable(fallback)) fallback?.focus({ preventScroll: true });
        else if (reading) { reading.tabIndex = -1; reading.focus({ preventScroll: true }); }
      }
      window.dispatchEvent(new Event("studiomediachange"));
    };
  }, [mediaOpen]);

  function openVideo(item: StudioVideoItem, trigger: HTMLElement) {
    returnFocusRef.current = trigger;
    setMedia({ kind: "video", item });
  }

  function openPhoto(index: number, trigger: HTMLElement) {
    returnFocusRef.current = trigger;
    setMedia({ kind: "photo", index });
  }

  function stepPhoto(direction: number) {
    if (media?.kind !== "photo" || !catalog.photos.length) return;
    setMedia({ kind: "photo", index: (media.index + direction + catalog.photos.length) % catalog.photos.length });
  }

  const currentPhoto = media?.kind === "photo" ? catalog.photos[media.index] : null;
  const modalTitle = media?.kind === "video" ? media.item.title : currentPhoto?.title;

  return (
    <div className="studio-portfolio">
      <a className="studio-skip-link" href="#studio-me-reading">跳至个人资料</a>
      <StudioMusic suspended={media?.kind === "video"} />
      <StudioChapterNav onNavigate={onNavigate} />
      <StudioTopButton onReturnTop={onReturnTop} />
      <main ref={mainRef} className="studio-main">
        <MeChapter about={catalog.about} />
        <Chapter id="bim">
          <ChapterHeader id="bim" title="BIM工程案例分享" description="工程数字化应用与探索" />
          <WorkCarousel items={catalog.bim} enabled={!playing && activeChapter === "bim"} openVideo={openVideo} />
        </Chapter>
        <Chapter id="blender">
          <ChapterHeader id="blender" title="Blender学习计划" description="三维创作与视觉实验" />
          <WorkCarousel items={catalog.blender} enabled={!playing && activeChapter === "blender"} openVideo={openVideo} />
        </Chapter>
        <Chapter id="travel">
          <ChapterHeader id="travel" title="城市逃离计划" description="走进山川，也走进生活。" />
          <WorkCarousel items={catalog.travel} enabled={!playing && activeChapter === "travel"} openVideo={openVideo} />
        </Chapter>
        <Chapter id="photo">
          <ChapterHeader id="photo" title="光影行纪档案" description="把沿途的光，留在画面里。" />
          <PhotoArchive items={catalog.photos} enabled={!playing && activeChapter === "photo" && !mediaOpen} openPhoto={openPhoto} />
        </Chapter>
        <Chapter id="end" footer={<StudioFooter />}>
          <div className="studio-ending">
            <ChapterHeader id="end" title="谢谢观看" description="在建筑与数字之间探索表达的边界。" />
            <div className="studio-ending__statement">
              <p>以BIM为专业底座，延伸至三维创作、影像叙事与AI生成领域，持续构建属于自己的视觉体系。</p>
              <p>记录学习、行走与思考，在现实结构与虚拟空间之间，寻找秩序与美感的平衡。</p>
            </div>
            <StudioContactLinks contacts={catalog.contacts} />
          </div>
        </Chapter>
      </main>
      {media && createPortal(
        <dialog ref={dialogRef} className={`studio-media-dialog studio-media-dialog--${media.kind}`} aria-labelledby="studio-media-title" onCancel={(event) => { event.preventDefault(); setMedia(null); }} onClick={(event) => { if (event.target === event.currentTarget) setMedia(null); }} onKeyDown={(event) => {
          if (media.kind === "photo" && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); stepPhoto(event.key === "ArrowRight" ? 1 : -1); }
        }}>
          <div className="studio-modal-content">
            <h2 id="studio-media-title" className="studio-sr-only">{modalTitle}</h2>
            <button type="button" className="studio-modal-close" aria-label="关闭" onClick={() => setMedia(null)} autoFocus><span aria-hidden="true">×</span></button>
            {media.kind === "video" ? (
              media.item.embedSrc ? <iframe className="studio-modal-video" src={media.item.embedSrc} title={media.item.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /> : <video className="studio-modal-video" key={media.item.id} src={media.item.src} poster={media.item.poster} controls playsInline autoPlay preload="metadata" />
            ) : currentPhoto && <img className="studio-modal-photo" src={currentPhoto.src} alt={currentPhoto.title} />}
          </div>
          {media.kind === "photo" && catalog.photos.length > 1 && <>
            <div className="studio-photo-pagination">
              <button type="button" onClick={() => stepPhoto(-1)} aria-label="上一张照片">←</button>
              <button type="button" onClick={() => stepPhoto(1)} aria-label="下一张照片">→</button>
            </div>
            <span className="studio-sr-only" role="status" aria-live="polite">第 {media.index + 1} 张，共 {catalog.photos.length} 张：{modalTitle}</span>
          </>}
        </dialog>, document.body,
      )}
      {import.meta.env.PROD && import.meta.env.VITE_WEB_ANALYTICS_ENABLED === "true" && ["ytstriver.top", "www.ytstriver.top"].includes(window.location.hostname) && <SiteAnalytics />}
    </div>
  );
}
