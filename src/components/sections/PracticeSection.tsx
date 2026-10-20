import { ArrowDownRight, Boxes, Film, Workflow } from "lucide-react";
import TrueFocus from "../TrueFocus";

type Locale = "zh" | "en";

type PracticeSectionProps = {
  lang: Locale;
};

const capabilities = [
  {
    id: "architecture",
    icon: Boxes,
    index: "01",
    title: { zh: "建筑数字化", en: "Digital Architecture" },
    body: {
      zh: "以 BIM 协同、空间逻辑与工程表达为基础，把复杂信息整理成清晰、有秩序的视觉内容。",
      en: "Grounded in BIM coordination and spatial logic, turning complex project information into clear visual narratives.",
    },
    tags: ["BIM", "CIM", "Spatial Logic"],
  },
  {
    id: "motion",
    icon: Workflow,
    index: "02",
    title: { zh: "三维与动态视觉", en: "3D & Motion" },
    body: {
      zh: "从镜头、光影到运动节奏，用 Blender 构建空间情绪，让抽象概念拥有可感知的形态。",
      en: "Building spatial atmosphere through camera, light, and motion rhythm in Blender so abstract ideas become tangible.",
    },
    tags: ["Blender", "Motion", "Look Dev"],
  },
  {
    id: "story",
    icon: Film,
    index: "03",
    title: { zh: "影像与 AI 叙事", en: "Film & AI Narrative" },
    body: {
      zh: "将真实拍摄、剪辑与生成式探索并置，在纪录质感和数字想象之间寻找新的叙事语言。",
      en: "Combining live footage, editing, and generative exploration to find a new language between documentary and imagination.",
    },
    tags: ["Editing", "Color", "Generative AI"],
  },
] as const;

export function PracticeSection({ lang }: PracticeSectionProps) {
  return (
    <section className="practice-section reveal-left" id="practice" aria-labelledby="practice-title">
      <div className="practice-atmosphere" aria-hidden="true" />
      <div className="container practice-container">
        <header className="practice-heading reveal">
          <div className="practice-heading-copy">
            <span className="section-label">
              {lang === "zh" ? "关于 · 方法 · 合作" : "About · Method · Collaboration"}
            </span>
            <h2 id="practice-title">
              {lang === "zh" ? (
                <TrueFocus
                  as="span"
                  blurAmount={5}
                  animationDuration={0.65}
                  borderColor="#2898ff"
                  className="practice-title-focus"
                  glowColor="rgba(40, 152, 255, 0.5)"
                  pauseBetweenAnimations={1.45}
                  sentence="从真实结构出发，|抵达有感知的叙事。"
                  separator="|"
                />
              ) : (
                <TrueFocus
                  as="span"
                  blurAmount={5}
                  animationDuration={0.65}
                  borderColor="#2898ff"
                  className="practice-title-focus"
                  glowColor="rgba(40, 152, 255, 0.5)"
                  pauseBetweenAnimations={1.45}
                  sentence="From real structures|to felt narratives."
                  separator="|"
                />
              )}
            </h2>
          </div>
          <div className="practice-heading-note">
            <p>
              {lang === "zh"
                ? "我的工作横跨工程数字化、三维视觉与影像创作。不同媒介背后，始终关注同一件事：如何把复杂世界转化成清晰、准确又有情绪的画面。"
                : "My work moves across digital engineering, 3D visuals, and film. Across every medium, the focus stays the same: translating complexity into images that feel clear, precise, and emotional."}
            </p>
            <a className="practice-inline-link" href="#contact">
              <span>{lang === "zh" ? "讨论一次合作" : "Start a conversation"}</span>
              <ArrowDownRight size={17} />
            </a>
          </div>
        </header>

        <div className="practice-profile-grid">
          <figure className="practice-portrait-panel reveal">
            <img
              src="/images/profile/yt-striver-horseback.jpg"
              alt={lang === "zh" ? "小杨同学在雪山草原骑马" : "YT striver horseback riding beneath snow mountains"}
            />
            <figcaption>
              <span>{lang === "zh" ? "BIM × 动态视觉 × 影像" : "BIM × Motion × Film"}</span>
              <img
                className="practice-portrait-signature"
                src="/images/signature/yt-signature-white-small.png"
                alt=""
              />
            </figcaption>
          </figure>

          <div className="practice-capabilities stagger-up">
            {capabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <article
                  className="practice-capability-card reveal-child"
                  data-capability={capability.id}
                  key={capability.id}
                >
                  <div className="practice-capability-topline">
                    <span>{capability.index}</span>
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <h3>{capability.title[lang]}</h3>
                  <p>{capability.body[lang]}</p>
                  <ul aria-label={lang === "zh" ? `${capability.title.zh}关键词` : `${capability.title.en} keywords`}>
                    {capability.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
        <footer className="practice-footer-note reveal">
          <span>{lang === "zh" ? "可合作方向" : "Available for"}</span>
          <p>
            {lang === "zh"
              ? "BIM / CIM 项目表达 · 三维动态视觉 · 品牌短片 · 旅行与空间影像 · AI 视觉实验"
              : "BIM / CIM communication · 3D motion · Brand films · Travel & spatial stories · AI visual experiments"}
          </p>
        </footer>
      </div>
    </section>
  );
}
