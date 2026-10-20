import { lazy, Suspense } from "react";
import StudioExperience from "./components/StudioExperience";
import type { StudioPortfolioProps, StudioVideoItem } from "./components/StudioPortfolio";
import {
  bimCaseVideos, photoArchiveItems, urbanEscapeVideos, works,
  resolveOptimizedPhotoSrc, resolvePosterSrc, resolveVideoSrc,
  type UrbanEscapeItem,
} from "./data/portfolioCatalog";

// Keep the old design available for local reference without publishing it.
const LegacyPortfolio = import.meta.env.DEV
  ? lazy(() => import("./LegacyPortfolio").then((module) => ({ default: module.App })))
  : null;

function orderItems<T extends { id: string }>(items: readonly T[], firstIds: readonly string[]): T[] {
  const rank = new Map(firstIds.map((id, index) => [id, index]));
  return [...items].sort((a, b) => (rank.get(a.id) ?? firstIds.length) - (rank.get(b.id) ?? firstIds.length));
}

const archiveItem = (item: UrbanEscapeItem): StudioVideoItem => ({
  id: item.id,
  title: item.title.zh,
  summary: item.summary.zh,
  src: item.mediaType === "video" ? resolveVideoSrc(item.src) : item.embedSrc,
  poster: item.mediaType === "video" ? resolvePosterSrc(item.src, item.posterSrc) : undefined,
  embedSrc: item.mediaType === "embed" ? item.embedSrc : undefined,
});

const catalog: StudioPortfolioProps["catalog"] = {
  about: {
    name: "小楊同學",
    title: "数字孪生·工程数字化·视频剪辑·AI",
    qualifications: ["一级建造师", "一级造价师", "BIM高级建模师（建筑、结构、设备）"],
    professionalTitle: "工程师",
    skills: ["BIM 应用", "Blender 建模与动效", "视频剪辑", "摄影与航拍"],
    strengths: ["工程与三维表达", "光影与视觉叙事", "户外与旅行记录"],
  },
  bim: orderItems(bimCaseVideos, ["bim-02"]).map(archiveItem),
  blender: orderItems(works, ["01", "03", "04", "02", "00"]).slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title.zh,
    summary: item.summary.zh,
    src: resolveVideoSrc(item.mediaSrc),
    poster: resolvePosterSrc(item.mediaSrc, item.posterSrc),
    embedSrc: item.embedSrc,
  })),
  travel: orderItems(urbanEscapeVideos, ["urban-02"]).map(archiveItem),
  photos: photoArchiveItems.map((item) => ({
    id: item.id,
    title: item.title.zh,
    src: resolveOptimizedPhotoSrc(item.id, "large"),
    thumbnail: resolveOptimizedPhotoSrc(item.id, "thumb"),
  })),
  contacts: [
    { label: "706060166@qq.com", href: "mailto:706060166@qq.com" },
    { label: "yt706548@gmail.com", href: "mailto:yt706548@gmail.com" },
    { label: "18951310366", href: "tel:18951310366" },
  ],
};

export function App() {
  const legacy = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "legacy";
  return legacy && LegacyPortfolio
    ? <Suspense fallback={null}><LegacyPortfolio /></Suspense>
    : <StudioExperience catalog={catalog} />;
}
