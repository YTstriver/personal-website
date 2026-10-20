// Shared content and media resolution for the studio experience and retained legacy view.
export type Locale = "zh" | "en";

export type Localized = {
  en: string;
  zh: string;
};

export type WorkItem = {
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

export type UrbanEscapeItem =
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

export type PhotoArchiveItem = {
  caption: Localized;
  id: string;
  src: string;
  tag: Localized;
  title: Localized;
  year: string;
};

export const works: WorkItem[] = [
  {
    category: {
      en: "Blender Visual",
      zh: "Blender 视觉实验",
    },
    id: "00",
    link: "#",
    mediaSrc: "/videos/医院长廊.mp4",
    mediaType: "video",
    posterSrc: "/images/posters/hospital-corridor.jpg",
    previewTime: 9,
    summary: {
      en: "Hospital corridor sequence shaped by controlled camera rhythm and cinematic light contrast.",
      zh: "医院长廊段落以镜头节奏与光影反差为核心，突出空间纵深与叙事氛围。",
    },
    title: {
      en: "Hospital Corridor",
      zh: "医院长廊",
    },
    year: "",
  },
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
];

export const urbanEscapeVideos: UrbanEscapeItem[] = [
  {
    id: "urban-00",
    mediaType: "video",
    previewTime: 7,
    posterSrc: "/images/posters/wannan-sichuan-tibet-route.jpg",
    src: "/videos/皖南川藏线.mp4",
    summary: {
      en: "A self-driving route through Southern Anhui mountain roads, focused on road rhythm and deep green scenery.",
      zh: "自驾穿行皖南山路，记录道路节奏、林间速度与山野绿意。",
    },
    title: {
      en: "Southern Anhui Sichuan-Tibet Route",
      zh: "皖南川藏线",
    },
    year: "",
  },
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
  {
    id: "urban-08",
    mediaType: "video",
    previewTime: 6,
    posterSrc: "/images/posters/hello-shenzhen.jpg",
    src: "/videos/你好，深圳.mp4",
    summary: {
      en: "A Shenzhen journey through the city and along the coast.",
      zh: "记录深圳的城市风景与海岸行走。",
    },
    title: {
      en: "Hello, Shenzhen",
      zh: "你好，深圳",
    },
    year: "",
  },
];

export const bimCaseVideos: UrbanEscapeItem[] = [
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

export const photoArchiveItems: PhotoArchiveItem[] = [
  {
    caption: {
      en: "Boardwalk before the mist clears, carrying a calm first-shot rhythm.",
      zh: "晨雾散去前的木栈道，带着章节开场的安静节奏。",
    },
    id: "wuhan-01",
    src: "1.1.jpg",
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
    src: "2.1.jpg",
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
    src: "3.1.jpg",
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
    src: "4.1.jpg",
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
    src: "5.1.jpg",
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
    src: "6.1.jpg",
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
    src: "7.1.jpg",
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
    src: "8.1.jpg",
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
    src: "9.1.jpg",
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
    src: "10.png",
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
  {
    caption: {
      en: "Liudaowan visual note with open field rhythm and broad spatial breathing.",
      zh: "六道湾画面记录，强调开阔动线与空间呼吸感。",
    },
    id: "wuhan-11",
    src: "六道湾1.jpg",
    tag: {
      en: "Travel Note",
      zh: "旅途手记",
    },
    title: {
      en: "Liudaowan 1",
      zh: "六道湾1",
    },
    year: "",
  },
  {
    caption: {
      en: "Second Liudaowan frame focusing on continuity, terrain rhythm, and route flow.",
      zh: "六道湾第二组画面，突出地形节奏与路线延续感。",
    },
    id: "wuhan-12",
    src: "六道湾2.jpg",
    tag: {
      en: "Travel Note",
      zh: "旅途手记",
    },
    title: {
      en: "Liudaowan 2",
      zh: "六道湾2",
    },
    year: "",
  },
  {
    caption: {
      en: "Metasequoia scene with layered foliage and quiet light transition.",
      zh: "落羽杉层次画面，突出林木纹理与安静光影过渡。",
    },
    id: "wuhan-13",
    src: "落羽杉.jpg",
    tag: {
      en: "Forest Texture",
      zh: "林地肌理",
    },
    title: {
      en: "Dawn Redwood",
      zh: "落羽杉",
    },
    year: "",
  },
  {
    caption: {
      en: "Lotus pond foreground and museum facade form a quiet layered frame.",
      zh: "荷花池前景与博物馆立面形成层次清晰的静态构图。",
    },
    id: "wuhan-14",
    src: "大运河博物馆荷花池.JPG",
    tag: {
      en: "Lotus Frame",
      zh: "荷池取景",
    },
    title: {
      en: "Grand Canal Lotus Pond",
      zh: "大运河荷花池",
    },
    year: "",
  },
  {
    caption: {
      en: "An aerial view that opens the museum complex into its urban-water context.",
      zh: "鸟瞰视角展开博物馆建筑群与城市水系的空间关系。",
    },
    id: "wuhan-15",
    src: "大运河博物馆鸟瞰.jpg",
    tag: {
      en: "Aerial View",
      zh: "高空视角",
    },
    title: {
      en: "Grand Canal Museum Aerial",
      zh: "大运河博物馆鸟瞰",
    },
    year: "",
  },
  {
    caption: {
      en: "People explore the clear shallows between rocks along the shore.",
      zh: "海边礁石与清浅水面之间，留下嬉戏的身影。",
    },
    id: "shenzhen-01",
    src: "海边嬉戏.JPG",
    tag: { en: "Coastal Life", zh: "海岸日常" },
    title: { en: "Seaside Moments", zh: "海边嬉戏" },
    year: "",
  },
  {
    caption: {
      en: "An open lawn meets the city skyline at Lianhuashan Park.",
      zh: "莲花山公园的开阔草坪，与远处城市天际线相映。",
    },
    id: "shenzhen-02",
    src: "莲花山公园.JPG",
    tag: { en: "City Park", zh: "城市绿地" },
    title: { en: "Lianhuashan Park", zh: "莲花山公园" },
    year: "",
  },
  {
    caption: {
      en: "Branches frame the translucent water and quiet beach at Xiyong.",
      zh: "枝叶之间，溪涌的玻璃海与沙滩缓缓展开。",
    },
    id: "shenzhen-03",
    src: "溪涌玻璃海.JPG",
    tag: { en: "Clear Water", zh: "澄澈海色" },
    title: { en: "Xiyong Glass Sea", zh: "溪涌玻璃海" },
    year: "",
  },
  {
    caption: {
      en: "Blue water, coastal hills, and clouds open across Xiaomeisha Bay.",
      zh: "小梅沙的蓝色海面，连接岸边山峦与晴空白云。",
    },
    id: "shenzhen-04",
    src: "小梅沙.JPG?v=ddfe43782e151a3be9138aba46b976c6",
    tag: { en: "Bay View", zh: "海湾风景" },
    title: { en: "Xiaomeisha", zh: "小梅沙" },
    year: "",
  },
  {
    caption: {
      en: "Distant mountains and clouds stretch beyond a calm blue sea.",
      zh: "平静的蓝色海面之外，是远山与舒展的白云。",
    },
    id: "shenzhen-05",
    src: "IMG_7223.JPG",
    tag: { en: "Sea Horizon", zh: "海上远眺" },
    title: { en: "Mountains and Sea", zh: "远山与海" },
    year: "",
  },
  {
    caption: {
      en: "A rocky islet and a passing wake punctuate the blue water.",
      zh: "海上礁石与划过水面的船迹，构成安静的海景。",
    },
    id: "shenzhen-06",
    src: "IMG_7224.JPG",
    tag: { en: "Coastal Detail", zh: "海岸细节" },
    title: { en: "Rocky Islet", zh: "海上礁石" },
    year: "",
  },
  {
    caption: {
      en: "Small boats dot the bay beneath clouds and a distant marina.",
      zh: "云影下的海湾，点缀着小船与远处排列的桅杆。",
    },
    id: "shenzhen-07",
    src: "IMG_7225.JPG",
    tag: { en: "Bay Rhythm", zh: "海湾节奏" },
    title: { en: "Boats in the Bay", zh: "海湾帆影" },
    year: "",
  },
  {
    caption: {
      en: "Red flags and white lamps stand against sunlit green foliage.",
      zh: "红色国旗与白色灯球，映衬着晴日里的浓绿树荫。",
    },
    id: "shenzhen-08",
    src: "IMG_7226.JPG",
    tag: { en: "Color Note", zh: "色彩记录" },
    title: { en: "Flags and Greenery", zh: "绿荫与国旗" },
    year: "",
  },
  {
    caption: {
      en: "Shenzhen's skyline rises beyond green trees and flowers beneath a bright, cloud-filled sky.",
      zh: "晴空与白云之下，深圳的城市天际线在绿树和花丛之外展开。",
    },
    id: "shenzhen-09",
    src: "深圳城市天际线.JPG",
    tag: { en: "City Skyline", zh: "城市天际线" },
    title: { en: "Shenzhen Skyline", zh: "深圳城市天际线" },
    year: "",
  },
];

export const strictTrafficMode = import.meta.env.VITE_STRICT_TRAFFIC_MODE !== "false";
const ossVideoBaseUrl = (import.meta.env.VITE_OSS_VIDEO_BASE_URL ?? "").trim();
const ossVideoPosterBaseUrl = (import.meta.env.VITE_OSS_VIDEO_POSTER_BASE_URL ?? "").trim();
const ossPhotoBaseUrl = (
  import.meta.env.VITE_OSS_PHOTO_BASE_URL ?? "https://media.ytstriver.top/%E7%85%A7%E7%89%87"
).trim();
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

export const resolvePublicAssetPath = (assetPath: string) => {
  if (isAbsoluteUrl(assetPath)) return assetPath;
  // Vite's local static server preserves %2B; a literal + is valid in a pathname.
  // Leave query/hash encoding and the separate OSS resolver unchanged.
  return joinBaseAndPath(viteBaseUrl, assetPath).replace(/^[^?#]*/, (pathname) => pathname.replace(/%2B/gi, "+"));
};

export const resolveVideoSrc = (sourcePath: string) => {
  if (isAbsoluteUrl(sourcePath)) return sourcePath;
  if (!ossVideoBaseUrl) return resolvePublicAssetPath(sourcePath);
  return joinBaseAndPath(ossVideoBaseUrl, removeVideosPrefix(sourcePath));
};

export const resolvePosterFromVideo = (videoPath: string) => {
  if (!ossVideoPosterBaseUrl) return undefined;
  const sanitizedPath = removeQueryAndHash(videoPath);
  const filename = sanitizedPath.split("/").pop();
  if (!filename) return undefined;
  const dotIndex = filename.lastIndexOf(".");
  const basename = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  return joinBaseAndPath(ossVideoPosterBaseUrl, `${basename}.jpg`);
};

export const resolvePosterSrc = (videoPath: string, posterPath?: string) => {
  if (posterPath) {
    if (isAbsoluteUrl(posterPath)) return posterPath;
    if (posterPath.startsWith("/")) return resolvePublicAssetPath(posterPath);
    if (ossVideoPosterBaseUrl) return joinBaseAndPath(ossVideoPosterBaseUrl, posterPath);
    return resolvePublicAssetPath(posterPath);
  }
  return resolvePosterFromVideo(videoPath);
};

export const resolvePhotoSrc = (sourcePath: string) => {
  if (isAbsoluteUrl(sourcePath)) return sourcePath;
  if (!ossPhotoBaseUrl) return resolvePublicAssetPath(sourcePath);
  return joinBaseAndPath(ossPhotoBaseUrl, stripLeadingSlash(sourcePath));
};

export const resolveOptimizedPhotoSrc = (photoId: string, size: "thumb" | "large") => {
  // The Xiaomeisha photo was replaced in OSS; refresh both local display sizes.
  const revision = photoId === "shenzhen-04" ? "?v=ddfe43782e151a3be9138aba46b976c6" : "";
  return resolvePublicAssetPath(`/photos/optimized/${size}/${photoId}.jpg${revision}`);
};
