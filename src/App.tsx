import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Film,
  PlaneTakeoff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Aurora from "./components/Aurora";
import ColorBends from "./components/ColorBends";
import DecryptedText from "./components/DecryptedText";
import FloatingLines from "./components/FloatingLines";
import SplitText from "./components/SplitText";
import ViewportVideo from "./components/ViewportVideo";

type Locale = "zh" | "en";

type Localized = {
  en: string;
  zh: string;
};

type WorkItem = {
  category: Localized;
  embedSrc?: string;
  id: string;
  link: string;
  mediaSrc: string;
  mediaType: "embed" | "image" | "video";
  posterSrc?: string;
  previewTime?: number;
  summary: Localized;
  title: Localized;
  year: string;
};

type UrbanEscapeItem =
  | {
      id: string;
      mediaType: "video";
      posterSrc?: string;
      previewTime: number;
      src: string;
      summary: Localized;
      title: Localized;
      year: string;
    }
  | {
      embedSrc: string;
      id: string;
      mediaType: "embed";
      summary: Localized;
      title: Localized;
      year: string;
    };

type PhotoArchiveItem = {
  caption: Localized;
  id: string;
  src: string;
  tag: Localized;
  title: Localized;
  year: string;
};

const BlenderMarkIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height={size}
    viewBox="0 0 24 24"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.51 13.214c.046-.8.438-1.506 1.03-2.006a3.424 3.424 0 0 1 2.212-.79c.85 0 1.631.3 2.211.79.592.5.983 1.206 1.028 2.005.045.823-.285 1.586-.865 2.153a3.389 3.389 0 0 1-2.374.938 3.393 3.393 0 0 1-2.376-.938c-.58-.567-.91-1.33-.865-2.152M7.35 14.831c.006.314.106.922.256 1.398a7.372 7.372 0 0 0 1.593 2.757 8.227 8.227 0 0 0 2.787 2.001 8.947 8.947 0 0 0 3.66.76 8.964 8.964 0 0 0 3.657-.772 8.285 8.285 0 0 0 2.785-2.01 7.428 7.428 0 0 0 1.592-2.762 6.964 6.964 0 0 0 .25-3.074 7.123 7.123 0 0 0-1.016-2.779 7.764 7.764 0 0 0-1.852-2.043h.002L13.566 2.55l-.02-.015c-.492-.378-1.319-.376-1.86.002-.547.382-.609 1.015-.123 1.415l-.001.001 3.126 2.543-9.53.01h-.013c-.788.001-1.545.518-1.695 1.172-.154.665.38 1.217 1.2 1.22V8.9l4.83-.01-8.62 6.617-.034.025c-.813.622-1.075 1.658-.563 2.313.52.667 1.625.668 2.447.004L7.414 14s-.069.52-.063.831zm12.09 1.741c-.97.988-2.326 1.548-3.795 1.55-1.47.004-2.827-.552-3.797-1.538a4.51 4.51 0 0 1-1.036-1.622 4.282 4.282 0 0 1 .282-3.519 4.702 4.702 0 0 1 1.153-1.371c.942-.768 2.141-1.183 3.396-1.185 1.256-.002 2.455.41 3.398 1.175.48.391.87.854 1.152 1.367a4.28 4.28 0 0 1 .522 1.706 4.236 4.236 0 0 1-.239 1.811 4.54 4.54 0 0 1-1.035 1.626"
      fill="currentColor"
    />
  </svg>
);

const content = {
  en: {
    aboutBody:
      "I focus on Blender motion, short-form visual storytelling, and commercial edits. This portfolio is built like a film sequence: atmosphere first, detail after.",
    aboutTitle: "Crafting moving images with rhythm, contrast, and story.",
    contactBody:
      "Exploring the boundary between architecture and digital narratives.",
    contactButton: "Email Me",
    contactTitle: "Exploring expression between architecture and digital space.",
    footer: "All rights reserved.",
    heroActionPrimary: "View Works",
    heroActionSecondary: "Contact",
    heroKicker: "Visual Director / Motion Creator",
    heroLocation: "Shanghai, China",
    heroMeta: "[EN] PERSONAL VIDEO PORTFOLIO",
    heroScroll: "Scroll",
    heroSubtitle: "Personal Video Portfolio",
    heroTitle: "YT striver",
    heroWriter: "",
    langLabel: "Language",
    navCta: "Book a Call",
    processItems: [
      {
        body: "Mood, tempo, color script, and visual references are shaped before touching the timeline.",
        title: "Concept Build",
      },
      {
        body: "3D layout, camera language, lighting rhythm, and key motion beats are designed for impact.",
        title: "Production",
      },
      {
        body: "Edit, sound sync, grading, and final polish to make every frame feel intentional.",
        title: "Post & Delivery",
      },
    ],
    processTitle: "From idea sketch to final frame.",
    sectionAbout: "Story",
    sectionContact: "Contact",
    sectionProcess: "Process",
    sectionWorks: "Works",
    stats: [
      { label: "Visual Projects", value: "12+" },
      { label: "Max Output", value: "4K" },
      { label: "Main Direction", value: "Blender" },
      { label: "Updated", value: "Now" },
    ],
    transitionQuote: "Light fades.\nThe pulse remains.",
    worksTitle: "Selected moving-image projects.",
  },
  zh: {
    aboutBody:
      "我主要做 Blender 动效、短片叙事和商业影像剪辑。这个站点按“电影节奏”来设计：先给氛围，再看细节。",
    aboutTitle: "用节奏、反差与叙事去塑造每一帧。",
    contactBody:
      "以BIM为专业底座，延伸至三维创作、影像叙事与AI生成领域，持续构建属于自己的视觉体系。",
    contactButton: "邮件联系",
    contactTitle: "在建筑与数字之间探索表达的边界。",
    footer: "保留所有权利。",
    heroActionPrimary: "查看作品",
    heroActionSecondary: "联系我",
    heroKicker: "视觉导演 / 动效创作者",
    heroLocation: "中国 · 上海",
    heroMeta: "个人视频作品集",
    heroScroll: "下滑",
    heroSubtitle: "个人视频作品集",
    heroTitle: "小杨同学",
    heroWriter: "",
    langLabel: "语言",
    navCta: "合作咨询",
    processItems: [
      {
        body: "先做情绪、节奏、色彩和视觉参考，明确作品的气质与叙事方向。",
        title: "概念构建",
      },
      {
        body: "完成 3D 场景、镜头语言、光影节奏与关键动作设计，确保画面冲击力。",
        title: "制作执行",
      },
      {
        body: "进行剪辑、声音节拍同步、调色与细节抛光，让成片更完整。",
        title: "后期交付",
      },
    ],
    processTitle: "从灵感草图到最终成片。",
    sectionAbout: "简介",
    sectionContact: "联系",
    sectionProcess: "流程",
    sectionWorks: "作品",
    stats: [
      { label: "作品数量", value: "12+" },
      { label: "最高输出", value: "4K" },
      { label: "核心方向", value: "Blender" },
      { label: "持续更新", value: "当前" },
    ],
    transitionQuote: "光线落下，\n节奏仍在。",
    worksTitle: "Blender小白成长中",
  },
} as const;

const works: WorkItem[] = [
  {
    category: {
      en: "Urban Escape Plan",
      zh: "城市逃离计划",
    },
    id: "02",
    link: "#",
    mediaSrc: "/videos/地铁站.mp4",
    mediaType: "video",
    posterSrc: "/images/posters/metro-station.jpg",
    previewTime: 10,
    summary: {
      en: "Urban transit sequence focused on pacing, city motion, and documentary mood.",
      zh: "地铁站城市节奏段落，突出通勤动线、空间转换与纪录片氛围。",
    },
    title: {
      en: "Metro Station",
      zh: "地铁站",
    },
    year: "",
  },
  {
    category: {
      en: "Blender Visual",
      zh: "Blender 视觉实验",
    },
    id: "01",
    link: "#",
    mediaSrc: "/videos/方块领域.mp4",
    mediaType: "video",
    posterSrc: "/images/posters/cubic-domain.jpg",
    previewTime: 9,
    summary: {
      en: "A kinetic cube world synced with electronic rhythm and accelerated light pulses.",
      zh: "以电子节拍驱动的方块世界动效，强调速度感与光线冲击。",
    },
    title: {
      en: "Cubic Domain",
      zh: "方块领域",
    },
    year: "",
  },
  {
    category: {
      en: "Urban Escape Plan",
      zh: "城市逃离计划",
    },
    id: "03",
    link: "#",
    mediaSrc: "/videos/迷失竹林.mp4",
    mediaType: "video",
    posterSrc: "/images/posters/lost-in-bamboo.jpg",
    previewTime: 9,
    summary: {
      en: "A bamboo-forest drift with ambient pace, travel solitude, and natural textures.",
      zh: "迷失竹林段落以慢节奏旅行质感为主，强调自然纹理与独处感。",
    },
    title: {
      en: "Lost in Bamboo",
      zh: "迷失竹林",
    },
    year: "",
  },
  {
    category: {
      en: "Urban Escape Plan",
      zh: "城市逃离计划",
    },
    id: "04",
    link: "#",
    mediaSrc: "/videos/迷失雪山.mp4",
    mediaType: "video",
    posterSrc: "/images/posters/lost-in-snow-mountain.jpg",
    previewTime: 4,
    summary: {
      en: "Snow-mountain sequence with sparse rhythm, scale contrast, and long-lens calm.",
      zh: "迷失雪山段落以稀疏节奏与尺度反差构建高海拔静谧感。",
    },
    title: {
      en: "Lost in Snow Mountain",
      zh: "迷失雪山",
    },
    year: "",
  },
];

const urbanEscapeVideos: UrbanEscapeItem[] = [
  {
    id: "urban-02",
    mediaType: "video",
    previewTime: 4,
    posterSrc: "/images/posters/zhimaling-hike.jpg",
    src: "/videos/止马岭徒步.mp4",
    summary: {
      en: "A hiking route in Zhimaling focused on trail rhythm and natural texture.",
      zh: "止马岭徒步线路，突出步伐节奏与自然地貌肌理。",
    },
    title: {
      en: "Zhimaling Hike",
      zh: "止马岭徒步",
    },
    year: "",
  },
  {
    id: "urban-05",
    mediaType: "video",
    previewTime: 5,
    posterSrc: "/images/posters/xinghua-trip.jpg",
    src: "/videos/兴化之旅.mp4",
    summary: {
      en: "A Xinghua field journey featuring water-town texture and seasonal rhythm.",
      zh: "兴化之行以水乡肌理与季节节奏为核心，呈现平缓而流动的旅程感。",
    },
    title: {
      en: "Xinghua Trip",
      zh: "兴化之行",
    },
    year: "",
  },
  {
    id: "urban-06",
    mediaType: "video",
    previewTime: 1,
    posterSrc: "/images/posters/yangshuo-trip.jpg",
    src: "/videos/阳朔之行.mp4",
    summary: {
      en: "A Yangshuo route focused on river-mountain scale and relaxed travel pacing.",
      zh: "阳朔之行聚焦山水尺度与慢节奏旅行氛围，强调空间呼吸感。",
    },
    title: {
      en: "Yangshuo Trip",
      zh: "阳朔之行",
    },
    year: "",
  },
  {
    id: "urban-07",
    mediaType: "video",
    previewTime: 5,
    posterSrc: "/images/posters/gaochun-trip.jpg",
    src: "/videos/高淳之行.mp4",
    summary: {
      en: "A Gaochun visit capturing lakeside paths, town cadence, and local light.",
      zh: "高淳之行记录湖岸步道与小城节奏，在自然光线中呈现日常诗意。",
    },
    title: {
      en: "Gaochun Trip",
      zh: "高淳之行",
    },
    year: "",
  },
  {
    id: "urban-01",
    mediaType: "video",
    previewTime: 8,
    posterSrc: "/images/posters/huangshan-jiyubei-ridge.jpg",
    src: "/videos/鲫鱼背.mp4",
    summary: {
      en: "A ridge run at Huangshan Jiyubei with wide views and shifting mountain weather.",
      zh: "黄山鲫鱼背山脊行进，展现开阔视野与山间天气变化。",
    },
    title: {
      en: "Huangshan Jiyubei Ridge",
      zh: "黄山鲫鱼背",
    },
    year: "",
  },
  {
    id: "urban-03",
    mediaType: "video",
    previewTime: 8,
    posterSrc: "/images/posters/nanjing-mini-sichuan-tibet-route.jpg",
    src: "/videos/南京小川藏线.mp4",
    summary: {
      en: "Cycle through the rolling route known as Nanjing's mini Sichuan-Tibet line.",
      zh: "骑行穿越起伏山路，记录南京小川藏线的速度与风景变化。",
    },
    title: {
      en: "Nanjing Mini Sichuan-Tibet Route",
      zh: "南京小川藏线",
    },
    year: "",
  },
  {
    id: "urban-04",
    mediaType: "video",
    previewTime: 1,
    posterSrc: "/images/posters/wuxiang-temple-reservoir.jpg",
    src: "/videos/无想寺水库.mp4",
    summary: {
      en: "A calm waterside journey around Wuxiang Temple Reservoir.",
      zh: "在无想寺水库慢行，捕捉水岸空间与静谧氛围。",
    },
    title: {
      en: "Wuxiang Temple Reservoir",
      zh: "无想寺水库",
    },
    year: "",
  },
];

const bimCaseVideos: UrbanEscapeItem[] = [
  {
    id: "bim-01",
    mediaType: "video",
    previewTime: 7,
    posterSrc: "/images/posters/lianyungang-xuwei-medical-rescue-center-bim.jpg",
    src: "/videos/连云港徐圩新区医疗救援中心BIM+技术应用.mp4",
    summary: {
      en: "BIM+ technology deployment for Xuwei New District medical rescue center in Lianyungang.",
      zh: "连云港徐圩新区医疗救援中心项目的 BIM+ 技术应用实践，聚焦施工协同与数字化交付。",
    },
    title: {
      en: "Lianyungang Xuwei Medical Rescue Center",
      zh: "连云港徐圩新区医疗救援中心",
    },
    year: "",
  },
  {
    id: "bim-02",
    mediaType: "video",
    previewTime: 5,
    posterSrc: "/images/posters/nanjing-panyao-fg-bim-integration.jpg",
    src: "/videos/南京潘窑F、G地块施工阶段BIM综合应用与探索.mp4",
    summary: {
      en: "Integrated BIM application and site-stage exploration across Nanjing Panyao F/G plots.",
      zh: "南京潘窑 F、G 地块施工阶段 BIM 综合应用与探索，强调现场落地与多专业协同。",
    },
    title: {
      en: "Nanjing Panyao F/G Plot BIM Integration",
      zh: "南京潘窑F、G地块施工阶段BIM综合应用",
    },
    year: "",
  },
  {
    id: "bim-04",
    mediaType: "video",
    previewTime: 6,
    posterSrc: "/images/posters/airport-3rd-road-community-cim-pilot.jpg",
    src: "/videos/机场三路社区中心智能建造CIM试点项目的应用与探索.mp4",
    summary: {
      en: "Application and pilot exploration of smart construction + CIM at Airport 3rd Road Community Center.",
      zh: "机场三路社区中心智能建造 CIM 试点项目应用与探索，聚焦智能建造与数字孪生实践。",
    },
    title: {
      en: "Airport 3rd Road Community Center CIM Pilot",
      zh: "机场三路社区中心智能建造CIM试点项目",
    },
    year: "",
  },
  {
    id: "bim-03",
    mediaType: "video",
    previewTime: 6,
    posterSrc: "/images/posters/bim-epc-large-complex.jpg",
    src: "/videos/BIM+EPC-在大型综合体项目中的应用与探索.mp4",
    summary: {
      en: "BIM + EPC workflow in a large mixed-use complex, from model governance to execution.",
      zh: "BIM+EPC 在大型综合体项目中的应用与探索，覆盖模型统筹、施工管理与执行联动。",
    },
    title: {
      en: "BIM+EPC in Large Complex Project",
      zh: "BIM+EPC在大型综合体项目中的应用与探索",
    },
    year: "",
  },
];

const photoArchiveItems: PhotoArchiveItem[] = [
  {
    caption: {
      en: "Boardwalk before the mist clears, carrying a calm first-shot rhythm.",
      zh: "晨雾散去前的木栈道，带着章节开场的安静节奏。",
    },
    id: "wuhan-01",
    src: "/photos/wuhan-journey/1.1.jpg",
    tag: {
      en: "Morning Drift",
      zh: "清晨慢行",
    },
    title: {
      en: "Canal Boardwalk",
      zh: "林间水道",
    },
    year: "",
  },
  {
    caption: {
      en: "Dense green layers create a natural frame for depth and direction.",
      zh: "密林层次形成天然取景框，纵深和方向感都很强。",
    },
    id: "wuhan-02",
    src: "/photos/wuhan-journey/2.1.jpg",
    tag: {
      en: "Forest Frame",
      zh: "林海取景",
    },
    title: {
      en: "Emerald Corridor",
      zh: "青绿回廊",
    },
    year: "",
  },
  {
    caption: {
      en: "Highlights on leaves and still water build a soft cinematic contrast.",
      zh: "叶面高光和静水反射形成柔和而干净的电影反差。",
    },
    id: "wuhan-03",
    src: "/photos/wuhan-journey/3.1.jpg",
    tag: {
      en: "Light Texture",
      zh: "光影纹理",
    },
    title: {
      en: "Waterside Trees",
      zh: "水杉岸线",
    },
    year: "",
  },
  {
    caption: {
      en: "A low-perspective composition keeps movement focused and intentional.",
      zh: "低机位构图让人物移动更聚焦，画面叙事更有方向。",
    },
    id: "wuhan-04",
    src: "/photos/wuhan-journey/4.1.jpg",
    tag: {
      en: "Narrative Move",
      zh: "叙事动线",
    },
    title: {
      en: "Trail Axis",
      zh: "步道中轴",
    },
    year: "",
  },
  {
    caption: {
      en: "Wood and water surfaces echo each other with an understated rhythm.",
      zh: "木栈道和水面互相呼应，形成克制但耐看的节奏。",
    },
    id: "wuhan-05",
    src: "/photos/wuhan-journey/5.1.jpg",
    tag: {
      en: "Quiet Rhythm",
      zh: "克制节奏",
    },
    title: {
      en: "Path Reflection",
      zh: "栈桥倒影",
    },
    year: "",
  },
  {
    caption: {
      en: "Open sky and long path expand visual breathing space.",
      zh: "天光拉开画面呼吸，长路径线强化空间延展。",
    },
    id: "wuhan-06",
    src: "/photos/wuhan-journey/6.1.jpg",
    tag: {
      en: "Open Air",
      zh: "天光呼吸",
    },
    title: {
      en: "Skyline Path",
      zh: "天际步道",
    },
    year: "",
  },
  {
    caption: {
      en: "Dense mid-tone greens create a slow and immersive visual atmosphere.",
      zh: "中间调的深绿密度很高，氛围沉浸且不压抑。",
    },
    id: "wuhan-07",
    src: "/photos/wuhan-journey/7.1.jpg",
    tag: {
      en: "Immersive Green",
      zh: "沉浸绿调",
    },
    title: {
      en: "Forest Texture",
      zh: "林地肌理",
    },
    year: "",
  },
  {
    caption: {
      en: "A cleaner edge-light profile makes the scene suitable for title frames.",
      zh: "边缘光更干净，适合做封面和章节标题画面。",
    },
    id: "wuhan-08",
    src: "/photos/wuhan-journey/8.1.jpg",
    tag: {
      en: "Title Frame",
      zh: "封面构图",
    },
    title: {
      en: "Framing Point",
      zh: "构图节点",
    },
    year: "",
  },
  {
    caption: {
      en: "Repetitive vertical lines deliver a clear visual beat.",
      zh: "连续竖向线条把节拍感拉出来，镜头语言更明确。",
    },
    id: "wuhan-09",
    src: "/photos/wuhan-journey/9.1.jpg",
    tag: {
      en: "Vertical Beat",
      zh: "纵向节拍",
    },
    title: {
      en: "Tree Rhythm",
      zh: "树阵节奏",
    },
    year: "",
  },
  {
    caption: {
      en: "Distant depth and gentle contrast complete the chapter's closing mood.",
      zh: "远景纵深与柔和反差收束章节情绪，作为尾镜更完整。",
    },
    id: "wuhan-10",
    src: "/photos/wuhan-journey/10.jpg",
    tag: {
      en: "Closing Frame",
      zh: "章节尾镜",
    },
    title: {
      en: "Final Horizon",
      zh: "远景收束",
    },
    year: "",
  },
];

const worksMotionTokens = [
  {
    icon: BlenderMarkIcon,
    id: "token-01",
    label: {
      en: "Blender Study Plan",
      zh: "Blender学习计划",
    },
  },
  {
    icon: PlaneTakeoff,
    id: "token-02",
    label: {
      en: "Urban Escape Plan",
      zh: "城市逃离计划",
    },
  },
  {
    icon: Building2,
    id: "token-03",
    label: {
      en: "BIM Case Sharing",
      zh: "BIM工程案例分享",
    },
  },
  {
    icon: Film,
    id: "token-04",
    label: {
      en: "Favorite Songs",
      zh: "光影行纪档案",
    },
  },
];

const worksShowcaseChapters = [
  {
    en: "Blender Study Plan",
    zh: "BLENDER学习计划",
  },
  {
    en: "Urban Escape Plan",
    zh: "城市逃离计划",
  },
  {
    en: "BIM Case Sharing",
    zh: "BIM工程案例分享",
  },
  {
    en: "Favorite Songs",
    zh: "光影行纪档案",
  },
] as const;

const heroVideo = "/videos/hero-loop-scrub-hq.mp4";
const heroPoster = "/images/hero_bg.jpeg";
const backgroundMusicSrc = "/audio/kyden-tell-me-if-you-need-me.mp3";
const backgroundMusicVolume = 0.32;
const shouldAutoplayBackgroundMusic = !import.meta.env.DEV;
const SHOWCASE_PAGE_SIZE = 4;
const PHONE_VIEWPORT_MEDIA_QUERY =
  "(max-width: 760px), ((hover: none) and (pointer: coarse) and (max-width: 980px))";
const strictTrafficMode = import.meta.env.VITE_STRICT_TRAFFIC_MODE !== "false";
const ossVideoBaseUrl = (import.meta.env.VITE_OSS_VIDEO_BASE_URL ?? "").trim();
const ossVideoPosterBaseUrl = (import.meta.env.VITE_OSS_VIDEO_POSTER_BASE_URL ?? "").trim();
const ossPhotoBaseUrl = (import.meta.env.VITE_OSS_PHOTO_BASE_URL ?? "").trim();
const viteBaseUrl = (import.meta.env.BASE_URL ?? "/").trim();

const stripLeadingSlash = (value: string) => value.replace(/^\/+/, "");
const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const removeQueryAndHash = (value: string) => value.replace(/[?#].*$/, "");
const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);
const removeVideosPrefix = (value: string) => value.replace(/^\/?videos\//, "");

const encodePathSegment = (segment: string) => {
  if (!segment) return segment;
  try {
    return encodeURIComponent(decodeURIComponent(segment));
  } catch {
    return encodeURIComponent(segment);
  }
};

const encodePathPreservingQueryAndHash = (value: string) => {
  const match = value.match(/^([^?#]*)([?#].*)?$/);
  const pathname = match?.[1] ?? value;
  const suffix = match?.[2] ?? "";
  const encodedPath = pathname
    .split("/")
    .map((segment) => encodePathSegment(segment))
    .join("/");
  return `${encodedPath}${suffix}`;
};

const joinBaseAndPath = (base: string, path: string) => {
  const normalizedBase = stripTrailingSlash(base);
  const normalizedPath = stripLeadingSlash(path);
  const encodedPath = encodePathPreservingQueryAndHash(normalizedPath);
  return `${normalizedBase}/${encodedPath}`;
};

const resolvePublicAssetPath = (assetPath: string) => {
  if (isAbsoluteUrl(assetPath)) return assetPath;
  return joinBaseAndPath(viteBaseUrl, assetPath);
};

const resolveVideoSrc = (sourcePath: string) => {
  if (isAbsoluteUrl(sourcePath)) return sourcePath;
  if (!ossVideoBaseUrl) return resolvePublicAssetPath(sourcePath);
  return joinBaseAndPath(ossVideoBaseUrl, removeVideosPrefix(sourcePath));
};

const resolvePosterFromVideo = (videoPath: string) => {
  if (!ossVideoPosterBaseUrl) return undefined;
  const sanitizedPath = removeQueryAndHash(videoPath);
  const filename = sanitizedPath.split("/").pop();
  if (!filename) return undefined;
  const dotIndex = filename.lastIndexOf(".");
  const basename = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  return joinBaseAndPath(ossVideoPosterBaseUrl, `${basename}.jpg`);
};

const resolvePosterSrc = (videoPath: string, posterPath?: string) => {
  if (posterPath) {
    if (isAbsoluteUrl(posterPath)) return posterPath;
    if (posterPath.startsWith("/")) return resolvePublicAssetPath(posterPath);
    if (ossVideoPosterBaseUrl) return joinBaseAndPath(ossVideoPosterBaseUrl, posterPath);
    return resolvePublicAssetPath(posterPath);
  }
  return resolvePosterFromVideo(videoPath);
};

const resolvePhotoSrc = (sourcePath: string) => {
  if (isAbsoluteUrl(sourcePath)) return sourcePath;
  if (!ossPhotoBaseUrl) return resolvePublicAssetPath(sourcePath);
  return joinBaseAndPath(ossPhotoBaseUrl, stripLeadingSlash(sourcePath));
};

const chunkByPage = <T,>(items: T[], pageSize: number) => {
  if (pageSize <= 0) return [items];
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }
  return pages;
};

export function App() {
  const [activeIntroThemeIndex, setActiveIntroThemeIndex] = useState<number | null>(null);
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const [activeUrbanIndex, setActiveUrbanIndex] = useState(0);
  const [activeBimIndex, setActiveBimIndex] = useState(0);
  const [isShowcasePhase, setIsShowcasePhase] = useState(false);
  const [isUrbanInView, setIsUrbanInView] = useState(false);
  const [isBimInView, setIsBimInView] = useState(false);
  const [isLiteFloatingLines, setIsLiteFloatingLines] = useState(false);
  const [isPhoneViewport, setIsPhoneViewport] = useState(false);
  const [lightboxVideo, setLightboxVideo] = useState<{
    posterSrc?: string;
    src: string;
    title: string;
  } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [isPhotoArchiveDragging, setIsPhotoArchiveDragging] = useState(false);
  const [failedPreviewPosters, setFailedPreviewPosters] = useState<Record<string, true>>({});
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isBackgroundMusicEnabled, setIsBackgroundMusicEnabled] = useState(() => {
    if (typeof window === "undefined") return shouldAutoplayBackgroundMusic;
    const saved = window.localStorage.getItem("portfolio-bgm-enabled");
    if (saved === "true") return true;
    if (saved === "false") return false;
    return shouldAutoplayBackgroundMusic;
  });
  const [lang] = useState<Locale>("zh");
  const activeShowcaseIndexRef = useRef(0);
  const activeUrbanIndexRef = useRef(0);
  const activeBimIndexRef = useRef(0);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const storySectionRef = useRef<HTMLElement>(null);
  const urbanTrackViewportRef = useRef<HTMLDivElement>(null);
  const bimSectionRef = useRef<HTMLElement>(null);
  const bimTrackViewportRef = useRef<HTMLDivElement>(null);
  const musicSectionRef = useRef<HTMLElement>(null);
  const photoBeltStageRef = useRef<HTMLDivElement>(null);
  const worksStageRef = useRef<HTMLElement>(null);
  const worksTrackViewportRef = useRef<HTMLDivElement>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const backgroundMusicFadeRef = useRef<number | null>(null);
  const skipNextBackgroundMusicClickRef = useRef(false);
  const backgroundMusicUnlockPendingRef = useRef(false);

  const t = content[lang];
  // Keep hero loop on same-origin public path: current OSS bucket does not contain hero loop files.
  const heroVideoSrc = resolvePublicAssetPath(heroVideo);
  const heroVideoPoster = resolvePosterSrc(heroVideo, heroPoster) ?? heroPoster;
  const worksPages = chunkByPage(works, SHOWCASE_PAGE_SIZE);
  const showcaseCount = isPhoneViewport ? worksPages.length : works.length;
  const urbanPages = chunkByPage(urbanEscapeVideos, SHOWCASE_PAGE_SIZE);
  const bimPages = chunkByPage(bimCaseVideos, SHOWCASE_PAGE_SIZE);
  const photoBeltItems = isPhoneViewport
    ? photoArchiveItems
    : [...photoArchiveItems, ...photoArchiveItems];
  const isPhotoArchivePaused = isPhotoArchiveDragging || Boolean(lightboxImage);
  const useHeroAutoplayMode = isPhoneViewport;

  const renderVideoPreview = (params: {
    posterSrc?: string;
    previewTime: number;
    title: string;
    videoSrc: string;
  }) => {
    const resolvedVideoSrc = resolveVideoSrc(params.videoSrc);
    const resolvedPosterSrc = resolvePosterSrc(params.videoSrc, params.posterSrc);
    const isPosterBroken = Boolean(
      resolvedPosterSrc && failedPreviewPosters[resolvedPosterSrc]
    );

    if (strictTrafficMode) {
      if (resolvedPosterSrc && !isPosterBroken) {
        return (
          <img
            src={resolvedPosterSrc}
            alt={params.title}
            loading="lazy"
            onError={() =>
              setFailedPreviewPosters((prev) => {
                if (prev[resolvedPosterSrc]) return prev;
                return {
                  ...prev,
                  [resolvedPosterSrc]: true,
                };
              })
            }
          />
        );
      }
      return (
        <div className="video-preview-fallback" aria-hidden="true">
          <span>{lang === "zh" ? "封面待上传" : "Poster pending"}</span>
        </div>
      );
    }

    return (
      <ViewportVideo
        src={resolvedVideoSrc}
        poster={resolvedPosterSrc}
        freezeAt={params.previewTime}
        shouldPlay={false}
        resetOnPause
      />
    );
  };

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setShowBackToTop(currentY > 520);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const liteMedia = window.matchMedia("(max-width: 900px), (prefers-reduced-motion: reduce)");
    const phoneMedia = window.matchMedia(PHONE_VIEWPORT_MEDIA_QUERY);
    const syncViewportModes = () => {
      setIsLiteFloatingLines(liteMedia.matches);
      setIsPhoneViewport(phoneMedia.matches);
    };

    syncViewportModes();

    const addListener = (mediaQuery: MediaQueryList, listener: () => void) => {
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", listener);
        return () => mediaQuery.removeEventListener("change", listener);
      }
      mediaQuery.addListener(listener);
      return () => mediaQuery.removeListener(listener);
    };

    const removeLite = addListener(liteMedia, syncViewportModes);
    const removePhone = addListener(phoneMedia, syncViewportModes);
    return () => {
      removeLite();
      removePhone();
    };
  }, []);

  useEffect(() => {
    if (!isPhoneViewport) return;

    let startX = 0;
    let startY = 0;
    let blockingPullRefresh = false;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      blockingPullRefresh = false;
    };

    const shouldSkipTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest(
          "input, textarea, select, .video-lightbox, .photo-lightbox, .photo-belt-stage, .works-showcase-track"
        )
      );
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || !event.cancelable) return;
      if (shouldSkipTarget(event.target)) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaY) <= Math.abs(deltaX)) return;
      if (Math.abs(deltaY) < 4) return;

      const rootScrollTop = document.scrollingElement?.scrollTop ?? 0;
      const currentTop = Math.max(window.scrollY, rootScrollTop);

      if (currentTop <= 2 && deltaY > 0) {
        blockingPullRefresh = true;
        event.preventDefault();
        return;
      }

      if (blockingPullRefresh) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      blockingPullRefresh = false;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isPhoneViewport]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(".reveal, .reveal-left, .stagger-up");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightboxVideo || lightboxImage ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxImage, lightboxVideo]);

  useEffect(() => {
    if (!lightboxVideo && !lightboxImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxVideo(null);
        setLightboxImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxImage, lightboxVideo]);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title =
      lang === "zh" ? "小杨同学 | 个人作品集" : "YT striver | Video Portfolio";
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("portfolio-bgm-enabled", String(isBackgroundMusicEnabled));
  }, [isBackgroundMusicEnabled]);

  const stopBackgroundMusicFade = () => {
    if (backgroundMusicFadeRef.current !== null) {
      cancelAnimationFrame(backgroundMusicFadeRef.current);
      backgroundMusicFadeRef.current = null;
    }
  };

  const requestBackgroundMusicPlay = () => {
    const bgm = backgroundMusicRef.current;
    if (!bgm) return;
    const playPromise = bgm.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          backgroundMusicUnlockPendingRef.current = false;
        })
        .catch(() => {
          // User gesture is required by some browsers; we retry on interaction.
          backgroundMusicUnlockPendingRef.current = true;
        });
    }
  };

  const fadeBackgroundMusicTo = (
    targetVolume: number,
    durationMs: number,
    onDone?: () => void
  ) => {
    const bgm = backgroundMusicRef.current;
    if (!bgm) {
      onDone?.();
      return;
    }

    stopBackgroundMusicFade();

    const fromVolume = bgm.volume;
    const clampedTarget = Math.min(Math.max(targetVolume, 0), 1);
    if (Math.abs(fromVolume - clampedTarget) < 0.001 || durationMs <= 0) {
      bgm.volume = clampedTarget;
      onDone?.();
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      bgm.volume = fromVolume + (clampedTarget - fromVolume) * eased;

      if (progress < 1) {
        backgroundMusicFadeRef.current = requestAnimationFrame(tick);
      } else {
        backgroundMusicFadeRef.current = null;
        onDone?.();
      }
    };

    backgroundMusicFadeRef.current = requestAnimationFrame(tick);
  };

  const pauseBackgroundMusic = (durationMs = 160) => {
    fadeBackgroundMusicTo(0, durationMs, () => {
      const current = backgroundMusicRef.current;
      if (!current) return;
      current.pause();
      current.volume = 0;
    });
  };

  const resumeBackgroundMusic = (durationMs = 260) => {
    if (!isBackgroundMusicEnabled || lightboxVideo) return;
    requestBackgroundMusicPlay();
    const current = backgroundMusicRef.current;
    if (!current) return;
    if (current.volume < 0.001) {
      current.volume = 0;
    }
    fadeBackgroundMusicTo(backgroundMusicVolume, durationMs);
  };

  const handleToggleBackgroundMusic = () => {
    const nextEnabled = !isBackgroundMusicEnabled;
    setIsBackgroundMusicEnabled(nextEnabled);
    const current = backgroundMusicRef.current;
    if (current) {
      current.muted = !nextEnabled || Boolean(lightboxVideo);
    }

    if (!nextEnabled) {
      backgroundMusicUnlockPendingRef.current = false;
      pauseBackgroundMusic(110);
      return;
    }

    if (lightboxVideo) return;
    backgroundMusicUnlockPendingRef.current = true;
    requestBackgroundMusicPlay();
    if (current) {
      current.muted = false;
      current.volume = Math.min(current.volume, 0.04);
    }
    fadeBackgroundMusicTo(backgroundMusicVolume, 170);
  };

  const handleBackgroundMusicTogglePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (event.button !== 0) return;
    skipNextBackgroundMusicClickRef.current = true;
    handleToggleBackgroundMusic();
  };

  const handleBackgroundMusicToggleClick = () => {
    if (skipNextBackgroundMusicClickRef.current) {
      skipNextBackgroundMusicClickRef.current = false;
      return;
    }
    handleToggleBackgroundMusic();
  };

  useEffect(() => {
    const unlockPlayback = () => {
      if (!isBackgroundMusicEnabled || lightboxVideo) return;
      if (backgroundMusicUnlockPendingRef.current) {
        requestBackgroundMusicPlay();
      }
      resumeBackgroundMusic(180);
    };

    window.addEventListener("pointerdown", unlockPlayback, { passive: true });
    window.addEventListener("keydown", unlockPlayback);
    window.addEventListener("touchstart", unlockPlayback, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockPlayback);
      window.removeEventListener("keydown", unlockPlayback);
      window.removeEventListener("touchstart", unlockPlayback);
      stopBackgroundMusicFade();
    };
  }, [isBackgroundMusicEnabled, lightboxVideo]);

  useEffect(() => {
    const bgm = backgroundMusicRef.current;
    if (!bgm) return;
    bgm.volume = 0;
    bgm.muted = !isBackgroundMusicEnabled;
    backgroundMusicUnlockPendingRef.current = isBackgroundMusicEnabled;
    if (!isBackgroundMusicEnabled) {
      bgm.pause();
    }
  }, []);

  useEffect(() => {
    const bgm = backgroundMusicRef.current;
    if (bgm) {
      bgm.muted = !isBackgroundMusicEnabled || Boolean(lightboxVideo);
    }

    if (!isBackgroundMusicEnabled) {
      backgroundMusicUnlockPendingRef.current = false;
      pauseBackgroundMusic(140);
      return;
    }

    if (lightboxVideo) {
      pauseBackgroundMusic(140);
      return;
    }

    backgroundMusicUnlockPendingRef.current = true;
    resumeBackgroundMusic(220);
  }, [isBackgroundMusicEnabled, lightboxVideo]);

  useEffect(() => {
    activeShowcaseIndexRef.current = activeShowcaseIndex;
  }, [activeShowcaseIndex]);

  useEffect(() => {
    const maxIndex = Math.max(showcaseCount - 1, 0);
    if (activeShowcaseIndexRef.current > maxIndex) {
      activeShowcaseIndexRef.current = maxIndex;
      setActiveShowcaseIndex(maxIndex);
    }
  }, [showcaseCount]);

  useEffect(() => {
    activeUrbanIndexRef.current = activeUrbanIndex;
  }, [activeUrbanIndex]);

  useEffect(() => {
    activeBimIndexRef.current = activeBimIndex;
  }, [activeBimIndex]);

  useEffect(() => {
    const section = worksStageRef.current;
    if (!section) {
      return;
    }

    const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
    const showcaseStart = isPhoneViewport ? 0.22 : 0.2;
    const showcaseSpan = Math.max(1 - showcaseStart, 0.001);

    const syncProgress = () => {
      const rect = section.getBoundingClientRect();
      const scrollableRange = Math.max(section.offsetHeight - window.innerHeight, 1);
      const progress = clamp01(-rect.top / scrollableRange);
      const showcaseProgress = clamp01((progress - showcaseStart) / showcaseSpan);
      const stageLeavingViewport = rect.bottom <= window.innerHeight * 0.18;
      const showcasePhase =
        progress > showcaseStart && (!isPhoneViewport || !stageLeavingViewport);
      section.style.setProperty("--works-stage-progress", progress.toFixed(4));
      section.style.setProperty("--works-showcase-progress", showcaseProgress.toFixed(4));
      section.dataset.phase = showcasePhase ? "showcase" : "intro";
      if (!showcasePhase) {
        setActiveIntroThemeIndex((prev) => (prev === null ? prev : null));
      }
      setIsShowcasePhase((prev) => (prev === showcasePhase ? prev : showcasePhase));
    };

    syncProgress();
    window.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);
    window.addEventListener("load", syncProgress);

    return () => {
      window.removeEventListener("scroll", syncProgress);
      window.removeEventListener("resize", syncProgress);
      window.removeEventListener("load", syncProgress);
    };
  }, [isPhoneViewport]);

  useEffect(() => {
    const section = worksStageRef.current;
    const viewport = worksTrackViewportRef.current;
    if (!section || !viewport) return;

    let wheelBuffer = 0;
    let pointerActive = false;
    let horizontalDrag = false;
    let startX = 0;
    let startY = 0;
    let carryX = 0;
    let stepLock = false;
    let unlockTimer: number | null = null;
    const lockDurationMs = viewport.clientWidth >= 960 ? 460 : 540;
    const maxIndex = Math.max(showcaseCount - 1, 0);

    const stepWorksIndex = (direction: number) => {
      if (direction === 0) return;
      const clampedIndex = Math.min(
        Math.max(activeShowcaseIndexRef.current + direction, 0),
        maxIndex
      );
      activeShowcaseIndexRef.current = clampedIndex;
      setActiveShowcaseIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
    };

    const canStepWorks = (direction: number) => {
      if (direction > 0) return activeShowcaseIndexRef.current < maxIndex;
      if (direction < 0) return activeShowcaseIndexRef.current > 0;
      return false;
    };

    const queueStepWorks = (direction: number) => {
      if (stepLock) return;
      if (!canStepWorks(direction)) {
        wheelBuffer = 0;
        carryX = 0;
        return;
      }

      stepLock = true;
      stepWorksIndex(direction);
      wheelBuffer = 0;
      carryX = 0;

      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        stepLock = false;
        unlockTimer = null;
      }, lockDurationMs);
    };

    const onWheel = (event: WheelEvent) => {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontalIntent) return;
      if (!event.cancelable) return;

      event.preventDefault();
      if (stepLock) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      wheelBuffer += delta;

      if (Math.abs(wheelBuffer) >= 52) {
        queueStepWorks(wheelBuffer > 0 ? 1 : -1);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerActive = true;
      horizontalDrag = false;
      startX = event.clientX;
      startY = event.clientY;
      carryX = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerActive) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!horizontalDrag) {
        if (Math.abs(deltaX) < 10) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
        horizontalDrag = true;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      if (stepLock) return;

      carryX += deltaX;
      startX = event.clientX;
      startY = event.clientY;

      if (Math.abs(carryX) >= 72) {
        queueStepWorks(carryX < 0 ? 1 : -1);
        pointerActive = false;
        horizontalDrag = false;
      }
    };

    const endPointer = () => {
      pointerActive = false;
      horizontalDrag = false;
      carryX = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (section.dataset.phase !== "showcase") return;

      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;

      const rect = section.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.28;
      if (!inViewport) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        queueStepWorks(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        queueStepWorks(-1);
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endPointer, { passive: true });
    window.addEventListener("pointercancel", endPointer, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [showcaseCount]);

  useEffect(() => {
    const section = storySectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setIsUrbanInView((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting));
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const stage = photoBeltStageRef.current;
    if (!stage) return;

    const beginDrag = () => setIsPhotoArchiveDragging(true);
    const endDrag = () => setIsPhotoArchiveDragging(false);

    stage.addEventListener("touchstart", beginDrag, { passive: true });
    stage.addEventListener("touchend", endDrag, { passive: true });
    stage.addEventListener("touchcancel", endDrag, { passive: true });
    stage.addEventListener("pointerdown", beginDrag, { passive: true });
    window.addEventListener("pointerup", endDrag, { passive: true });
    window.addEventListener("pointercancel", endDrag, { passive: true });

    return () => {
      stage.removeEventListener("touchstart", beginDrag);
      stage.removeEventListener("touchend", endDrag);
      stage.removeEventListener("touchcancel", endDrag);
      stage.removeEventListener("pointerdown", beginDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  useEffect(() => {
    const section = bimSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setIsBimInView((prev) => (prev === entry.isIntersecting ? prev : entry.isIntersecting));
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const section = storySectionRef.current;
    const viewport = urbanTrackViewportRef.current;
    if (!section || !viewport) return;

    let wheelBuffer = 0;
    let pointerActive = false;
    let horizontalDrag = false;
    let startX = 0;
    let startY = 0;
    let carryX = 0;
    let stepLock = false;
    let unlockTimer: number | null = null;
    const lockDurationMs = viewport.clientWidth >= 960 ? 460 : 540;
    const maxIndex = Math.max(urbanPages.length - 1, 0);

    const stepUrbanIndex = (direction: number) => {
      if (direction === 0) return;
      const clampedIndex = Math.min(Math.max(activeUrbanIndexRef.current + direction, 0), maxIndex);
      activeUrbanIndexRef.current = clampedIndex;
      setActiveUrbanIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
    };

    const canStepUrban = (direction: number) => {
      if (direction > 0) return activeUrbanIndexRef.current < maxIndex;
      if (direction < 0) return activeUrbanIndexRef.current > 0;
      return false;
    };

    const queueStepUrban = (direction: number) => {
      if (stepLock) return;
      if (!canStepUrban(direction)) {
        wheelBuffer = 0;
        carryX = 0;
        return;
      }

      stepLock = true;
      stepUrbanIndex(direction);
      wheelBuffer = 0;
      carryX = 0;

      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        stepLock = false;
        unlockTimer = null;
      }, lockDurationMs);
    };

    const onWheel = (event: WheelEvent) => {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontalIntent) return;
      if (!event.cancelable) return;

      event.preventDefault();
      if (stepLock) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      wheelBuffer += delta;

      if (Math.abs(wheelBuffer) >= 52) {
        queueStepUrban(wheelBuffer > 0 ? 1 : -1);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerActive = true;
      horizontalDrag = false;
      startX = event.clientX;
      startY = event.clientY;
      carryX = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerActive) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!horizontalDrag) {
        if (Math.abs(deltaX) < 10) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
        horizontalDrag = true;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      if (stepLock) return;

      carryX += deltaX;
      startX = event.clientX;
      startY = event.clientY;

      if (Math.abs(carryX) >= 72) {
        queueStepUrban(carryX < 0 ? 1 : -1);
        pointerActive = false;
        horizontalDrag = false;
      }
    };

    const endPointer = () => {
      pointerActive = false;
      horizontalDrag = false;
      carryX = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;

      const rect = section.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.28;
      if (!inViewport) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        queueStepUrban(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        queueStepUrban(-1);
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endPointer, { passive: true });
    window.addEventListener("pointercancel", endPointer, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const section = bimSectionRef.current;
    const viewport = bimTrackViewportRef.current;
    if (!section || !viewport) return;

    let wheelBuffer = 0;
    let pointerActive = false;
    let horizontalDrag = false;
    let startX = 0;
    let startY = 0;
    let carryX = 0;
    let stepLock = false;
    let unlockTimer: number | null = null;
    const lockDurationMs = viewport.clientWidth >= 960 ? 460 : 540;
    const maxIndex = Math.max(bimPages.length - 1, 0);

    const stepBimIndex = (direction: number) => {
      if (direction === 0) return;
      const clampedIndex = Math.min(Math.max(activeBimIndexRef.current + direction, 0), maxIndex);
      activeBimIndexRef.current = clampedIndex;
      setActiveBimIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
    };

    const canStepBim = (direction: number) => {
      if (direction > 0) return activeBimIndexRef.current < maxIndex;
      if (direction < 0) return activeBimIndexRef.current > 0;
      return false;
    };

    const queueStepBim = (direction: number) => {
      if (stepLock) return;
      if (!canStepBim(direction)) {
        wheelBuffer = 0;
        carryX = 0;
        return;
      }

      stepLock = true;
      stepBimIndex(direction);
      wheelBuffer = 0;
      carryX = 0;

      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        stepLock = false;
        unlockTimer = null;
      }, lockDurationMs);
    };

    const onWheel = (event: WheelEvent) => {
      const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
      if (!horizontalIntent) return;
      if (!event.cancelable) return;

      event.preventDefault();
      if (stepLock) return;

      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      wheelBuffer += delta;

      if (Math.abs(wheelBuffer) >= 52) {
        queueStepBim(wheelBuffer > 0 ? 1 : -1);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerActive = true;
      horizontalDrag = false;
      startX = event.clientX;
      startY = event.clientY;
      carryX = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerActive) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!horizontalDrag) {
        if (Math.abs(deltaX) < 10) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
        horizontalDrag = true;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      if (stepLock) return;

      carryX += deltaX;
      startX = event.clientX;
      startY = event.clientY;

      if (Math.abs(carryX) >= 72) {
        queueStepBim(carryX < 0 ? 1 : -1);
        pointerActive = false;
        horizontalDrag = false;
      }
    };

    const endPointer = () => {
      pointerActive = false;
      horizontalDrag = false;
      carryX = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      const tagName = target?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") return;

      const rect = section.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight * 0.72 && rect.bottom > window.innerHeight * 0.28;
      if (!inViewport) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        queueStepBim(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        queueStepBim(-1);
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewport.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endPointer, { passive: true });
    window.addEventListener("pointercancel", endPointer, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      if (unlockTimer !== null) window.clearTimeout(unlockTimer);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("pointerdown", onPointerDown);
      viewport.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const video = heroVideoRef.current;
    const section = heroSectionRef.current;
    if (!video || !section) {
      return;
    }

    let destroyed = false;
    let rafId = 0;
    let isFrameScheduled = false;
    let targetTime = 0;
    let renderedTime = 0;
    let duration = 0;
    let lastCommitted = -1;
    const tailGuard = 0.03;
    const seekThreshold = 1 / 48;
    const minSeekIntervalMs = 1000 / 24;
    const scrubCurve = 1.15;
    const scrubViewportFactor = 1.08;
    const scrubSpan = 0.9;
    const worksStart = 0;
    const worksEnd = 1;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const clamp01 = (value: number) => clamp(value, 0, 1);

    const getSectionProgress = () => {
      // Use viewport geometry to keep desktop scrub stable across layout/caching differences.
      const rect = section.getBoundingClientRect();
      const virtualRange = Math.max(window.innerHeight * scrubViewportFactor, 1);
      const linearProgress = clamp01(-rect.top / virtualRange);
      return linearProgress ** scrubCurve;
    };

    const getWorksProgress = (sectionProgress: number) =>
      clamp01((sectionProgress - worksStart) / (worksEnd - worksStart));

    const getTargetTime = (sectionProgress: number) => {
      const scrubbedDuration = duration * scrubSpan;
      return clamp(sectionProgress * scrubbedDuration, 0, duration);
    };

    const syncWorksState = (sectionProgress: number) => {
      section.style.setProperty("--scrub-progress", sectionProgress.toFixed(4));
      section.style.setProperty("--works-progress", getWorksProgress(sectionProgress).toFixed(4));
    };

    // Mobile/reduced-motion: do not scrub currentTime on every scroll tick.
    // We keep preload=auto and switch to smooth muted playback for stability.
    if (useHeroAutoplayMode) {
      const safePlay = () => {
        const maybePromise = video.play();
        if (maybePromise && typeof maybePromise.then === "function") {
          maybePromise.catch(() => {
            // Some webviews may still block autoplay until first gesture.
          });
        }
      };

      const onLoadedMetadata = () => {
        if (destroyed) return;
        syncWorksState(0);
        video.currentTime = 0;
        safePlay();
      };

      const onVisibilityChange = () => {
        if (document.hidden) {
          video.pause();
        } else {
          safePlay();
        }
      };

      syncWorksState(0);
      video.loop = true;
      video.pause();
      if (video.readyState >= 1) {
        onLoadedMetadata();
      } else {
        video.addEventListener("loadedmetadata", onLoadedMetadata);
      }
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        destroyed = true;
        document.removeEventListener("visibilitychange", onVisibilityChange);
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.pause();
      };
    }

    let lastSeekAt = 0;
    const commitTime = (nextTime: number, force = false) => {
      const clamped = clamp(nextTime, 0, duration);
      if (Math.abs(clamped - lastCommitted) < seekThreshold) {
        return;
      }

      const now = performance.now();
      const deltaFromCurrent = Math.abs(video.currentTime - clamped);
      const isHighFrequencySeek = now - lastSeekAt < minSeekIntervalMs;
      if (!force && isHighFrequencySeek && deltaFromCurrent < 0.08) {
        return;
      }

      try {
        if (typeof video.fastSeek === "function") {
          const delta = Math.abs(video.currentTime - clamped);
          if (delta > 0.12) {
            video.fastSeek(clamped);
          } else {
            video.currentTime = clamped;
          }
        } else {
          video.currentTime = clamped;
        }
        lastCommitted = clamped;
        lastSeekAt = now;
      } catch {
        // Ignore occasional seek errors during rapid scroll bursts.
      }
    };

    const syncDuration = () => {
      const rawDuration = Number.isFinite(video.duration) ? video.duration : 0;
      duration = Math.max(rawDuration - tailGuard, 0);
      const sectionProgress = getSectionProgress();
      targetTime = getTargetTime(sectionProgress);
      renderedTime = targetTime;
      syncWorksState(sectionProgress);
      commitTime(renderedTime, true);
    };

    const onLoadedMetadata = () => {
      syncDuration();
      video.pause();
    };

    video.loop = false;
    video.pause();
    if (video.readyState >= 1) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata);
    }

    const scheduleFrame = () => {
      if (destroyed || isFrameScheduled) {
        return;
      }
      isFrameScheduled = true;
      rafId = requestAnimationFrame(tick);
    };

    const tick = () => {
      isFrameScheduled = false;
      if (destroyed) {
        return;
      }

      const sectionProgress = getSectionProgress();
      syncWorksState(sectionProgress);
      let shouldContinue = false;

      if (duration > 0) {
        targetTime = getTargetTime(sectionProgress);
        const diff = targetTime - renderedTime;
        const absDiff = Math.abs(diff);
        const damping = absDiff > 0.25 ? 0.52 : absDiff > 0.08 ? 0.4 : 0.28;
        renderedTime += diff * damping;

        if (absDiff < 0.0012) {
          renderedTime = targetTime;
        }

        commitTime(renderedTime);
        shouldContinue = Math.abs(targetTime - renderedTime) > 0.012;
      }

      if (shouldContinue) {
        scheduleFrame();
      }
    };

    const onResize = () => {
      const sectionProgress = getSectionProgress();
      syncWorksState(sectionProgress);
      if (duration <= 0) return;
      targetTime = getTargetTime(sectionProgress);
      renderedTime = targetTime;
      commitTime(renderedTime, true);
    };

    const onScroll = () => {
      const sectionProgress = getSectionProgress();
      syncWorksState(sectionProgress);
      if (duration > 0) {
        targetTime = getTargetTime(sectionProgress);
        renderedTime = targetTime;
        commitTime(renderedTime, true);
      }
      scheduleFrame();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        scheduleFrame();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    scheduleFrame();

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [useHeroAutoplayMode]);

  const openLightboxVideo = (videoSrc: string, title: string, posterSrc?: string) => {
    setLightboxVideo({
      posterSrc: resolvePosterSrc(videoSrc, posterSrc),
      src: resolveVideoSrc(videoSrc),
      title,
    });
  };

  const openVideoLightbox = (work: WorkItem) => {
    if (work.mediaType !== "video") return;
    openLightboxVideo(work.mediaSrc, work.title[lang], work.posterSrc);
  };

  const stackedRevealStep = 2.2;

  const urbanCount = urbanPages.length;
  const bimCount = bimPages.length;

  const jumpToShowcaseIndex = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), showcaseCount - 1);
    activeShowcaseIndexRef.current = clampedIndex;
    setActiveShowcaseIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
  };

  const jumpToUrbanIndex = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), urbanCount - 1);
    activeUrbanIndexRef.current = clampedIndex;
    setActiveUrbanIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
  };

  const jumpToBimIndex = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), bimCount - 1);
    activeBimIndexRef.current = clampedIndex;
    setActiveBimIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
  };

  const scrollToSection = (section: HTMLElement, offset = 96) => {
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  };

  const scrollToWorksTheme = (chapterIndex: number) => {
    const section = worksStageRef.current;
    if (!section) return;

    const isPhone = window.matchMedia(PHONE_VIEWPORT_MEDIA_QUERY).matches;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const scrollableRange = Math.max(section.offsetHeight - window.innerHeight, 1);
    const showcaseProgress =
      chapterIndex === 3 ? (isPhone ? 0.68 : 0.42) : chapterIndex === 0 ? (isPhone ? 0.58 : 0.34) : 0.34;

    window.scrollTo({
      top: sectionTop + scrollableRange * showcaseProgress,
      behavior: "smooth",
    });

    if (chapterIndex === 0) {
      jumpToShowcaseIndex(0);
      if (isPhone) {
        window.setTimeout(() => jumpToShowcaseIndex(0), 260);
      }
    } else if (chapterIndex === 3) {
      jumpToShowcaseIndex(Math.min(showcaseCount - 1, 1));
    }
  };

  const handleThemeTokenClick = (chapterIndex: number) => {
    setActiveIntroThemeIndex(chapterIndex);

    if (chapterIndex === 0) {
      scrollToWorksTheme(0);
      return;
    }

    if (chapterIndex === 1 && storySectionRef.current) {
      scrollToSection(storySectionRef.current);
      return;
    }

    if (chapterIndex === 2 && bimSectionRef.current) {
      scrollToSection(bimSectionRef.current);
      return;
    }

    if (chapterIndex === 3 && musicSectionRef.current) {
      scrollToSection(musicSectionRef.current);
      return;
    }
  };

  const getStackedCardStyle = (
    index: number,
    activeIndex: number,
    itemCount: number
  ): CSSProperties => {
    const offset = index - activeIndex;

    if (offset < 0) {
      return {
        filter: "blur(0.8px) saturate(0.86)",
        opacity: 0,
        pointerEvents: "none",
        transform: "translate3d(-14%, 0, 0)",
        zIndex: 0,
      };
    }

    if (offset > 1) {
      return {
        filter: "blur(0.8px) saturate(0.86)",
        opacity: 0,
        pointerEvents: "none",
        transform: `translate3d(${stackedRevealStep}%, 0, 0)`,
        zIndex: 0,
      };
    }

    const depth = offset;
    const translateX = depth * stackedRevealStep;
    const opacity = depth === 0 ? 1 : 0.94;
    const saturation = depth === 0 ? 1 : 0.9;

    return {
      filter: `blur(${depth * 0.2}px) saturate(${saturation})`,
      opacity,
      pointerEvents: offset === 0 ? "auto" : "none",
      transform: `translate3d(${translateX}%, 0, 0)`,
      zIndex: itemCount - depth,
    };
  };

  const getShowcaseCardStyle = (index: number) =>
    getStackedCardStyle(index, activeShowcaseIndex, showcaseCount);

  const getUrbanCardStyle = (index: number) =>
    getStackedCardStyle(index, activeUrbanIndex, urbanCount);

  const getBimCardStyle = (index: number) =>
    getStackedCardStyle(index, activeBimIndex, bimCount);

  return (
    <main className={`portfolio-page locale-${lang}`}>
      <audio
        ref={backgroundMusicRef}
        src={backgroundMusicSrc}
        loop
        preload="none"
        playsInline
        aria-hidden="true"
      />
      <div className="portfolio-floating-lines-layer" aria-hidden="true">
        <FloatingLines
          linesGradient={["#E945F5", "#2F4BC0", "#E945F5"]}
          animationSpeed={isLiteFloatingLines ? 0.55 : 0.9}
          interactive={!isLiteFloatingLines}
          bendRadius={5}
          bendStrength={-0.5}
          mouseDamping={0.05}
          parallax={!isLiteFloatingLines}
          parallaxStrength={isLiteFloatingLines ? 0 : 0.2}
          lineCount={isLiteFloatingLines ? [3, 4, 3] : [5, 6, 5]}
          mixBlendMode="normal"
        />
      </div>
      <div className="portfolio-content-layer">
      <button
        type="button"
        className={`bgm-toggle ${isBackgroundMusicEnabled ? "enabled" : "muted"}`}
        onPointerDown={handleBackgroundMusicTogglePointerDown}
        onClick={handleBackgroundMusicToggleClick}
        aria-label={
          lang === "zh"
            ? `背景音乐：${isBackgroundMusicEnabled ? "开" : "关"}`
            : `Background music: ${isBackgroundMusicEnabled ? "on" : "off"}`
        }
        aria-pressed={isBackgroundMusicEnabled}
      >
        {isBackgroundMusicEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        <span className="bgm-toggle-label">
          {isBackgroundMusicEnabled ? "ON" : "OFF"}
        </span>
      </button>
      <section className="hero hero-scrub" id="hero" ref={heroSectionRef}>
        <div className="hero-pin">
          <video
            className="hero-bg"
            ref={heroVideoRef}
            muted
            playsInline
            autoPlay={useHeroAutoplayMode}
            loop={useHeroAutoplayMode}
            webkit-playsinline="true"
            x5-playsinline="true"
            x5-video-player-type="h5-page"
            x5-video-player-fullscreen="false"
            preload="auto"
            poster={heroVideoPoster}
            src={heroVideoSrc}
          />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className={`hero-title-container ${lang === "zh" ? "has-avatar" : ""}`}>
              {lang === "zh" ? (
                <div className="hero-title-zh-split" aria-label={t.heroTitle}>
                  <span className="hero-title-avatar-shell" aria-hidden="true">
                    <img className="hero-title-avatar" src="/images/IMG_5449.jpg" alt="" />
                  </span>
                </div>
              ) : (
                <h1 className="hero-title hero-title-en">{t.heroTitle}</h1>
              )}
            </div>
            <p className={`hero-writer ${t.heroWriter ? "" : "hero-writer-placeholder"}`}>
              {t.heroWriter || "\u00A0"}
            </p>
            <p className="hero-meta">{t.heroMeta}</p>
            <p className="hero-by">{lang === "zh" ? "creator by：小楊同學" : "written by: YT striver"}</p>
            <div className="hero-line" />
            <div className="hero-actions subtle">
              <a href="#works" className="hero-cta ghost">
                {t.heroActionPrimary}
              </a>
              <a href="#contact" className="hero-cta ghost">
                {t.heroActionSecondary}
              </a>
            </div>
          </div>

          <div className="scroll-indicator">
            <span>{t.heroScroll}</span>
            <div className="scroll-line" />
          </div>
        </div>
      </section>

      <section className="hero-works-stage" id="works" ref={worksStageRef} aria-label="works stage">
        <div className="hero-works-pin">
          <div className="works-aurora-bg" aria-hidden="true">
            <div className="works-aurora-frame">
              <Aurora
                colorStops={["#5227FF", "#7cff67", "#5227FF", "#ffffff"]}
                amplitude={0.82}
                blend={0.42}
              />
            </div>
          </div>

          <div className="works-intro-layer">
            <p className="works-intro-kicker">Classification</p>
            <SplitText
              tag="h2"
              text={lang === "zh" ? "动态视觉场域" : "Motion Orbit"}
              className="works-intro-title"
              delay={56}
              duration={0.72}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 24 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.12}
              rootMargin="-80px"
              textAlign="center"
            />
            <div className="works-intro-orbits">
              {worksMotionTokens.map((token, index) => {
                const Icon = token.icon;
                return (
                  <button
                    key={token.id}
                    className="works-orbit-token"
                    data-active={index === activeIntroThemeIndex ? "true" : "false"}
                    type="button"
                    onClick={() => handleThemeTokenClick(index)}
                  >
                    <span className="works-orbit-icon">
                      <Icon size={18} />
                    </span>
                    <span>{token.label[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="works-showcase-layer">
            <div className="works-showcase-head">
              <h2>{lang === "zh" ? "BLENDER学习计划" : "Blender Study Plan"}</h2>
              <p>{t.worksTitle}</p>
              <ul className="works-showcase-categories">
                {worksShowcaseChapters.map((chapter, index) => (
                  <li
                    key={`${chapter.en}-${index}`}
                    data-active={index === 0 ? "true" : "false"}
                  >
                    <button
                      className="works-showcase-category-chip"
                      type="button"
                      onClick={() => handleThemeTokenClick(index)}
                    >
                      <span>{chapter[lang]}</span>
                      <em>{String(index + 1).padStart(2, "0")}</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="works-showcase-track works-showcase-flip-track" ref={worksTrackViewportRef}>
              <button
                className="works-showcase-nav works-showcase-nav-side is-prev"
                type="button"
                onClick={() => jumpToShowcaseIndex(activeShowcaseIndexRef.current - 1)}
                disabled={activeShowcaseIndex <= 0}
                aria-label={lang === "zh" ? "上一条作品" : "Previous work"}
              >
                <ChevronLeft size={18} />
              </button>
              <ul className="works-showcase-list works-showcase-stack">
                {isPhoneViewport
                  ? worksPages.map((page, pageIndex) => (
                      <li
                        key={`works-page-${pageIndex}`}
                        className="works-showcase-card works-showcase-flip-card works-showcase-page"
                        data-active={pageIndex === activeShowcaseIndex ? "true" : "false"}
                        style={getShowcaseCardStyle(pageIndex)}
                        aria-hidden={pageIndex !== activeShowcaseIndex}
                      >
                        <div className="works-showcase-grid">
                          {page.map((work) => (
                            <article key={work.id} className="works-showcase-grid-item">
                              <figure
                                className={
                                  work.mediaType === "embed"
                                    ? "works-showcase-media is-embed"
                                    : "works-showcase-media"
                                }
                              >
                                {work.mediaType === "video" ? (
                                  <button
                                    className="video-preview-trigger"
                                    onClick={() => openVideoLightbox(work)}
                                    type="button"
                                    aria-label={
                                      lang === "zh"
                                        ? `打开《${work.title.zh}》并播放原声`
                                        : `Open ${work.title.en} with sound`
                                    }
                                  >
                                    {renderVideoPreview({
                                      videoSrc: work.mediaSrc,
                                      posterSrc: work.posterSrc,
                                      previewTime: work.previewTime ?? 0,
                                      title: work.title[lang],
                                    })}
                                    <span className="video-preview-hint">
                                      {lang === "zh"
                                        ? "点击放大并播放原声"
                                        : "Click to expand with sound"}
                                    </span>
                                  </button>
                                ) : work.mediaType === "embed" ? (
                                  <iframe
                                    src={work.embedSrc}
                                    title={work.title[lang]}
                                    loading="lazy"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                  />
                                ) : (
                                  <img src={work.mediaSrc} alt={work.title[lang]} loading="lazy" />
                                )}
                              </figure>
                              <div className="works-showcase-info">
                                <div className="works-showcase-meta">
                                  <span>[{work.title[lang]}]</span>
                                </div>
                                <h3>{work.title[lang]}</h3>
                                <p>{work.summary[lang]}</p>
                                {work.mediaType === "embed" ? (
                                  <p className="works-player-tip">
                                    {lang === "zh"
                                      ? "可在播放器设置中选择最高可用清晰度（受账号与片源限制）。"
                                      : "Choose the highest available quality in player settings (depends on account and source)."}
                                  </p>
                                ) : null}
                              </div>
                            </article>
                          ))}
                        </div>
                      </li>
                    ))
                  : works.map((work, index) => (
                      <li
                        key={work.id}
                        className="works-showcase-card works-showcase-flip-card"
                        data-active={index === activeShowcaseIndex ? "true" : "false"}
                        style={getShowcaseCardStyle(index)}
                        aria-hidden={index !== activeShowcaseIndex}
                      >
                        <figure
                          className={
                            work.mediaType === "embed"
                              ? "works-showcase-media is-embed"
                              : "works-showcase-media"
                          }
                        >
                          {work.mediaType === "video" ? (
                            <button
                              className="video-preview-trigger"
                              onClick={() => openVideoLightbox(work)}
                              type="button"
                              aria-label={
                                lang === "zh"
                                  ? `打开《${work.title.zh}》并播放原声`
                                  : `Open ${work.title.en} with sound`
                              }
                            >
                              {renderVideoPreview({
                                videoSrc: work.mediaSrc,
                                posterSrc: work.posterSrc,
                                previewTime: work.previewTime ?? 0,
                                title: work.title[lang],
                              })}
                              <span className="video-preview-hint">
                                {lang === "zh" ? "点击放大并播放原声" : "Click to expand with sound"}
                              </span>
                            </button>
                          ) : work.mediaType === "embed" ? (
                            <iframe
                              src={work.embedSrc}
                              title={work.title[lang]}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          ) : (
                            <img src={work.mediaSrc} alt={work.title[lang]} loading="lazy" />
                          )}
                        </figure>
                        <div className="works-showcase-info">
                          <div className="works-showcase-meta">
                            <span>[{work.title[lang]}]</span>
                          </div>
                          <h3>{work.title[lang]}</h3>
                          <p>{work.summary[lang]}</p>
                          {work.mediaType === "embed" ? (
                            <p className="works-player-tip">
                              {lang === "zh"
                                ? "可在播放器设置中选择最高可用清晰度（受账号与片源限制）。"
                                : "Choose the highest available quality in player settings (depends on account and source)."}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
              </ul>
              <button
                className="works-showcase-nav works-showcase-nav-side is-next"
                type="button"
                onClick={() => jumpToShowcaseIndex(activeShowcaseIndexRef.current + 1)}
                disabled={activeShowcaseIndex >= showcaseCount - 1}
                aria-label={lang === "zh" ? "下一条作品" : "Next work"}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div
              className="works-showcase-controls"
              role="group"
              aria-label={lang === "zh" ? "作品翻页控制" : "Showcase paging controls"}
            >
              <div
                className="works-showcase-dots"
                aria-label={lang === "zh" ? "作品分页" : "Showcase pagination"}
              >
                {isPhoneViewport
                  ? worksPages.map((_, index) => (
                      <button
                        key={`works-dot-page-${index}`}
                        className="works-showcase-dot"
                        data-active={index === activeShowcaseIndex ? "true" : "false"}
                        type="button"
                        onClick={() => jumpToShowcaseIndex(index)}
                        aria-label={
                          lang === "zh"
                            ? `切换到第 ${index + 1} 页作品`
                            : `Switch to showcase page ${index + 1}`
                        }
                      />
                    ))
                  : works.map((work, index) => (
                      <button
                        key={`works-dot-${work.id}`}
                        className="works-showcase-dot"
                        data-active={index === activeShowcaseIndex ? "true" : "false"}
                        type="button"
                        onClick={() => jumpToShowcaseIndex(index)}
                        aria-label={
                          lang === "zh"
                            ? `切换到第 ${index + 1} 条作品`
                            : `Switch to work ${index + 1}`
                        }
                      />
                    ))}
              </div>
            </div>
            <p className="works-showcase-gesture-tip">
              {lang === "zh"
                ? isLiteFloatingLines
                  ? "左右滑动即可浏览，点击视频可放大播放。"
                  : "可点分页圆点或横向拖拽翻页。"
                : isLiteFloatingLines
                  ? "Swipe horizontally to browse. Tap video to expand."
                  : "Use page dots or horizontal drag to browse."}
            </p>
          </div>
        </div>
      </section>

      <section className="story-section reveal-left" id="story" ref={storySectionRef}>
        <div className="container story-showcase-container">
          <div className="works-showcase-head story-showcase-head">
            <h2>{lang === "zh" ? "城市逃离计划" : "Urban Escape Plan"}</h2>
            <p>
              {lang === "zh"
                ? "无想·拾野——寻找生活的意义"
                : "Wuxiang · Wild Fragments — Finding the Meaning of Life"}
            </p>
            <ul className="works-showcase-categories story-showcase-categories">
              {worksShowcaseChapters.map((chapter, index) => (
                <li
                  key={`story-${chapter.en}-${index}`}
                  data-active={index === 1 ? "true" : "false"}
                >
                  <button
                    className="works-showcase-category-chip"
                    type="button"
                    onClick={() => handleThemeTokenClick(index)}
                  >
                    <span>{chapter[lang]}</span>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="works-showcase-track works-showcase-flip-track story-showcase-track"
            ref={urbanTrackViewportRef}
          >
            <button
              className="works-showcase-nav works-showcase-nav-side is-prev"
              type="button"
              onClick={() => jumpToUrbanIndex(activeUrbanIndexRef.current - 1)}
              disabled={activeUrbanIndex <= 0}
              aria-label={lang === "zh" ? "上一页城市作品" : "Previous urban page"}
            >
              <ChevronLeft size={18} />
            </button>
            <ul className="works-showcase-list works-showcase-stack story-showcase-list">
              {urbanPages.map((page, pageIndex) => (
                <li
                  key={`urban-page-${pageIndex}`}
                  className="works-showcase-card works-showcase-flip-card works-showcase-page"
                  data-active={pageIndex === activeUrbanIndex ? "true" : "false"}
                  style={getUrbanCardStyle(pageIndex)}
                  aria-hidden={pageIndex !== activeUrbanIndex}
                >
                  <div className="works-showcase-grid">
                    {page.map((video) => (
                      <article key={video.id} className="works-showcase-grid-item">
                        <figure
                          className={
                            video.mediaType === "embed"
                              ? "works-showcase-media is-embed"
                              : "works-showcase-media"
                          }
                        >
                          {video.mediaType === "embed" ? (
                            <iframe
                              src={video.embedSrc}
                              title={video.title[lang]}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          ) : (
                            <button
                              className="video-preview-trigger"
                              onClick={() =>
                                openLightboxVideo(video.src, video.title[lang], video.posterSrc)
                              }
                              type="button"
                              aria-label={
                                lang === "zh"
                                  ? `打开《${video.title.zh}》并播放原声`
                                  : `Open ${video.title.en} with sound`
                              }
                            >
                              {renderVideoPreview({
                                videoSrc: video.src,
                                posterSrc: video.posterSrc,
                                previewTime: video.previewTime,
                                title: video.title[lang],
                              })}
                              <span className="video-preview-hint">
                                {lang === "zh" ? "点击放大并播放原声" : "Click to expand with sound"}
                              </span>
                            </button>
                          )}
                        </figure>
                        <div className="works-showcase-info">
                          <div className="works-showcase-meta">
                            <span>[{lang === "zh" ? "城市逃离计划" : "Urban Escape Plan"}]</span>
                          </div>
                          <h3>{video.title[lang]}</h3>
                          <p>{video.summary[lang]}</p>
                          {video.mediaType === "embed" ? (
                            <p className="works-player-tip">
                              {lang === "zh"
                                ? "B 站移动端 iframe 方案：界面更简洁，但清晰度与功能受 B 站策略限制。"
                                : "Bilibili mobile iframe mode: cleaner UI, but quality/features depend on Bilibili policies."}
                            </p>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <button
              className="works-showcase-nav works-showcase-nav-side is-next"
              type="button"
              onClick={() => jumpToUrbanIndex(activeUrbanIndexRef.current + 1)}
              disabled={activeUrbanIndex >= urbanPages.length - 1}
              aria-label={lang === "zh" ? "下一页城市作品" : "Next urban page"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div
            className="works-showcase-controls"
            role="group"
            aria-label={lang === "zh" ? "城市逃离计划翻页控制" : "Urban showcase paging controls"}
          >
            <div
              className="works-showcase-dots"
              aria-label={lang === "zh" ? "城市作品分页" : "Urban showcase pagination"}
            >
              {urbanPages.map((_, index) => (
                <button
                  key={`urban-page-dot-${index}`}
                  className="works-showcase-dot"
                  data-active={index === activeUrbanIndex ? "true" : "false"}
                  type="button"
                  onClick={() => jumpToUrbanIndex(index)}
                  aria-label={
                    lang === "zh"
                      ? `切换到第 ${index + 1} 页城市作品`
                      : `Switch to urban page ${index + 1}`
                  }
                />
              ))}
            </div>
          </div>
          <p className="works-showcase-gesture-tip">
            {lang === "zh"
              ? isLiteFloatingLines
                ? "左右滑动即可浏览，点击视频可放大播放。"
                : "可点分页圆点或横向拖拽翻页。"
              : isLiteFloatingLines
                ? "Swipe horizontally to browse. Tap video to expand."
                : "Use page dots or horizontal drag to browse."}
          </p>
        </div>
      </section>

      <section className="story-section reveal-left" id="bim" ref={bimSectionRef}>
        <div className="container story-showcase-container">
          <div className="works-showcase-head story-showcase-head">
            <h2>{lang === "zh" ? "BIM工程案例分享" : "BIM Case Sharing"}</h2>
            <p>
              {lang === "zh"
                ? "工程数字化应用与探索"
                : "Applied digital engineering workflows and project exploration"}
            </p>
            <ul className="works-showcase-categories story-showcase-categories">
              {worksShowcaseChapters.map((chapter, index) => (
                <li
                  key={`bim-${chapter.en}-${index}`}
                  data-active={index === 2 ? "true" : "false"}
                >
                  <button
                    className="works-showcase-category-chip"
                    type="button"
                    onClick={() => handleThemeTokenClick(index)}
                  >
                    <span>{chapter[lang]}</span>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="works-showcase-track works-showcase-flip-track story-showcase-track"
            ref={bimTrackViewportRef}
          >
            <ul className="works-showcase-list works-showcase-stack story-showcase-list">
              {bimPages.map((page, pageIndex) => (
                <li
                  key={`bim-page-${pageIndex}`}
                  className="works-showcase-card works-showcase-flip-card works-showcase-page"
                  data-active={pageIndex === activeBimIndex ? "true" : "false"}
                  style={getBimCardStyle(pageIndex)}
                  aria-hidden={pageIndex !== activeBimIndex}
                >
                  <div className="works-showcase-grid">
                    {page.map((video) => (
                      <article key={video.id} className="works-showcase-grid-item">
                        <figure
                          className={
                            video.mediaType === "embed"
                              ? "works-showcase-media is-embed"
                              : "works-showcase-media"
                          }
                        >
                          {video.mediaType === "embed" ? (
                            <iframe
                              src={video.embedSrc}
                              title={video.title[lang]}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          ) : (
                            <button
                              className="video-preview-trigger"
                              onClick={() =>
                                openLightboxVideo(video.src, video.title[lang], video.posterSrc)
                              }
                              type="button"
                              aria-label={
                                lang === "zh"
                                  ? `打开《${video.title.zh}》并播放原声`
                                  : `Open ${video.title.en} with sound`
                              }
                            >
                              {renderVideoPreview({
                                videoSrc: video.src,
                                posterSrc: video.posterSrc,
                                previewTime: video.previewTime,
                                title: video.title[lang],
                              })}
                              <span className="video-preview-hint">
                                {lang === "zh" ? "点击放大并播放原声" : "Click to expand with sound"}
                              </span>
                            </button>
                          )}
                        </figure>
                        <div className="works-showcase-info">
                          <div className="works-showcase-meta">
                            <span>[{lang === "zh" ? "BIM工程案例分享" : "BIM Case Sharing"}]</span>
                          </div>
                          <h3>{video.title[lang]}</h3>
                          <p>{video.summary[lang]}</p>
                          {video.mediaType === "embed" ? (
                            <p className="works-player-tip">
                              {lang === "zh"
                                ? "B 站移动端 iframe 方案：界面更简洁，但清晰度与功能受 B 站策略限制。"
                                : "Bilibili mobile iframe mode: cleaner UI, but quality/features depend on Bilibili policies."}
                            </p>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="works-showcase-controls"
            role="group"
            aria-label={lang === "zh" ? "BIM案例翻页控制" : "BIM showcase paging controls"}
          >
            <div
              className="works-showcase-dots"
              aria-label={lang === "zh" ? "BIM案例分页" : "BIM showcase pagination"}
            >
              {bimPages.map((_, index) => (
                <button
                  key={`bim-page-dot-${index}`}
                  className="works-showcase-dot"
                  data-active={index === activeBimIndex ? "true" : "false"}
                  type="button"
                  onClick={() => jumpToBimIndex(index)}
                  aria-label={
                    lang === "zh"
                      ? `切换到第 ${index + 1} 页BIM案例`
                      : `Switch to BIM page ${index + 1}`
                  }
                />
              ))}
            </div>
          </div>
          <p className="works-showcase-gesture-tip">
            {lang === "zh"
              ? isLiteFloatingLines
                ? "左右滑动即可浏览，点击视频可放大播放。"
                : "可点分页圆点或横向拖拽翻页。"
              : isLiteFloatingLines
                ? "Swipe horizontally to browse. Tap video to expand."
                : "Use page dots or horizontal drag to browse."}
          </p>
        </div>
      </section>

      <section className="story-section reveal-left photo-archive-section" id="music" ref={musicSectionRef}>
        <div className="container story-showcase-container photo-archive-container">
          <div className="works-showcase-head story-showcase-head">
            <h2>{lang === "zh" ? "光影行纪档案" : "Light Journey Archive"}</h2>
            <p>
              {lang === "zh"
                ? "漫游手记 · 用光影与构图，重构旅途里的叙事瞬间。"
                : "Travel notes rebuilt with light and composition to capture narrative moments."}
            </p>
            <ul className="works-showcase-categories story-showcase-categories">
              {worksShowcaseChapters.map((chapter, index) => (
                <li
                  key={`music-${chapter.en}-${index}`}
                  data-active={index === 3 ? "true" : "false"}
                >
                  <button
                    className="works-showcase-category-chip"
                    type="button"
                    onClick={() => handleThemeTokenClick(index)}
                  >
                    <span>{chapter[lang]}</span>
                    <em>{String(index + 1).padStart(2, "0")}</em>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="photo-archive-panel">
            <div
              className={`photo-belt-stage ${isPhotoArchiveDragging ? "is-dragging" : ""}`}
              ref={photoBeltStageRef}
              role="list"
              aria-label={lang === "zh" ? "武汉照片档案" : "Wuhan photo archive"}
            >
              <div className={`photo-belt-track ${isPhotoArchivePaused ? "is-paused" : ""}`}>
                {photoBeltItems.map((photo, index) => (
                  <article
                    key={`${photo.id}-${index}`}
                    role="listitem"
                    className="photo-belt-item"
                  >
                    <button
                      className="photo-belt-trigger"
                      type="button"
                      onClick={() => {
                        setLightboxVideo(null);
                        setLightboxImage({
                          src: resolvePhotoSrc(photo.src),
                          title: photo.title[lang],
                        });
                      }}
                      aria-label={
                        lang === "zh"
                          ? `查看《${photo.title.zh}》大图`
                          : `Open enlarged view of ${photo.title.en}`
                      }
                    >
                      <figure className="photo-belt-media">
                        <img
                          src={resolvePhotoSrc(photo.src)}
                          alt={photo.title[lang]}
                          loading={index < (isPhoneViewport ? 2 : 8) ? "eager" : "lazy"}
                        />
                      </figure>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-bg" aria-hidden="true">
          <div className="contact-colorbends-shell">
            <ColorBends
              rotation={90}
              speed={0.2}
              colors={["#5227FF", "#FF9FFC", "#7cff67"]}
              transparent
              autoRotate={0}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              parallax={0.5}
              noise={0.15}
              iterations={1}
              intensity={1.5}
              bandWidth={6}
            />
          </div>
        </div>
        <div className="contact-overlay" />
        <div className="contact-content reveal">
          <span className="section-label">{t.sectionContact}</span>
          <h2 className="contact-manifesto-line contact-manifesto-line-primary">
            <DecryptedText
              text={
                lang === "zh"
                  ? "在建筑与数字之间探索表达的边界。"
                  : "Exploring expression boundaries between architecture and digital."
              }
              speed={30}
              maxIterations={14}
              sequential
              revealDirection="center"
              className="contact-decrypt-char"
              encryptedClassName="contact-decrypt-char contact-decrypt-char-encrypted"
              parentClassName="contact-decrypt-parent"
              wrapperDisplay="inline"
              animateOn="view"
            />
          </h2>
          <p className="contact-manifesto-line">
            <DecryptedText
              text={
                lang === "zh"
                  ? "以BIM为专业底座，延伸至三维创作、影像叙事与AI生成领域，持续构建属于自己的视觉体系。记录学习、行走与思考，在现实结构与虚拟空间之间，寻找秩序与美感的平衡。"
                  : "Rooted in BIM and extending into 3D creation, visual storytelling, and AI-generated expression, while documenting learning and travel to balance order and aesthetics between real and virtual space."
              }
              speed={24}
              maxIterations={12}
              sequential
              revealDirection="start"
              className="contact-decrypt-char"
              encryptedClassName="contact-decrypt-char contact-decrypt-char-encrypted"
              parentClassName="contact-decrypt-parent"
              wrapperDisplay="inline"
              animateOn="view"
            />
          </p>
          <div className="contact-direct-info" aria-label={lang === "zh" ? "联系方式" : "Contact details"}>
            <div className="contact-direct-row">
              <span className="contact-direct-label">{lang === "zh" ? "邮箱" : "Email"}</span>
              <div className="contact-direct-values">
                <a className="contact-direct-link" href="mailto:706060166@qq.com">
                  706060166@qq.com
                </a>
                <a className="contact-direct-link" href="mailto:yt706548@gmail.com">
                  yt706548@gmail.com
                </a>
              </div>
            </div>
            <div className="contact-direct-row">
              <span className="contact-direct-label">{lang === "zh" ? "电话" : "Phone"}</span>
              <a className="contact-direct-link contact-direct-link-phone" href="tel:18951310366">
                18951310366
              </a>
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={lang === "zh" ? "返回顶部" : "Back to top"}
      >
        <ChevronUp size={16} />
        <span>TOP</span>
      </button>

      {lightboxVideo ? (
        <div
          className="video-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "zh" ? "视频播放窗口" : "Video player window"}
          onClick={() => setLightboxVideo(null)}
        >
          <div className="video-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <div className="video-lightbox-head">
              <p className="video-lightbox-title">{lightboxVideo.title}</p>
              <button
                className="video-lightbox-close"
                onClick={() => setLightboxVideo(null)}
                type="button"
              >
                <X size={16} />
                <span>{lang === "zh" ? "关闭" : "Close"}</span>
              </button>
            </div>
            <div className="video-lightbox-player">
              <video
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={lightboxVideo.posterSrc ?? resolvePosterFromVideo(lightboxVideo.src)}
                key={lightboxVideo.src}
              >
                <source src={lightboxVideo.src} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      ) : null}

      {lightboxImage ? (
        <div
          className="video-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lang === "zh" ? "照片查看窗口" : "Photo viewer"}
          onClick={() => setLightboxImage(null)}
        >
          <div className="video-lightbox-panel photo-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <div className="video-lightbox-head">
              <p className="video-lightbox-title">{lightboxImage.title}</p>
              <button
                className="video-lightbox-close"
                onClick={() => setLightboxImage(null)}
                type="button"
              >
                <X size={16} />
                <span>{lang === "zh" ? "关闭" : "Close"}</span>
              </button>
            </div>
            <figure className="photo-lightbox-body">
              <img src={lightboxImage.src} alt={lightboxImage.title} />
            </figure>
          </div>
        </div>
      ) : null}

      <footer className="footer">
        <p>
          {lang === "zh" ? "小杨同学" : "YT striver"} · {t.footer}
        </p>
      </footer>
      </div>
    </main>
  );
}
