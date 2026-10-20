export type StudioChapterId = "me" | "bim" | "blender" | "travel" | "photo" | "end";
export type StudioCueId = StudioChapterId | "welcome" | "skills";

export const STUDIO_VIDEO = {
  desktop: "/videos/studio/studio-scroll-1080p.mp4",
  mobile: "/videos/studio/studio-scroll-720p.mp4",
  reverseDesktop: "/videos/studio/studio-reverse-1080p.mp4",
  reverseMobile: "/videos/studio/studio-reverse-720p.mp4",
  poster: "/images/studio/studio-poster.jpg",
  fps: 60,
  duration: 3125 / 60,
  frameCount: 3125,
} as const;

export const STUDIO_SCROLL = {
  readingViewportFraction: 0.6,
  minimumReadingDistance: 320,
  maximumReadingDistance: 600,
  contentRevealFraction: 0.5,
  maximumContentRevealSeconds: 2.4,
  playbackRate: 1.35,
} as const;

// Reading distance is independent of the source clip's duration. Scrolling
// triggers playback between approved poses, then holds the pose for reading.
const cues: {
  id: StudioCueId;
  chapterId: StudioChapterId;
  label: string;
  startFrame: number;
  endFrameExclusive: number;
  fallbackFrame: number;
  navigationFrame?: number;
  still: string;
}[] = [
  { id: "welcome", chapterId: "me", label: "欢迎", startFrame: 0, endFrameExclusive: 240, fallbackFrame: 234, still: "/images/studio/welcome.jpg" },
  { id: "me", chapterId: "me", label: "关于我", startFrame: 240, endFrameExclusive: 479, fallbackFrame: 441, navigationFrame: 441, still: "/images/studio/me.jpg" },
  { id: "skills", chapterId: "me", label: "技能包", startFrame: 479, endFrameExclusive: 719, fallbackFrame: 669, navigationFrame: 669, still: "/images/studio/skills.jpg" },
  { id: "bim", chapterId: "bim", label: "BIM", startFrame: 719, endFrameExclusive: 1437, fallbackFrame: 1242, navigationFrame: 1242, still: "/images/studio/bim.jpg" },
  { id: "blender", chapterId: "blender", label: "blender", startFrame: 1437, endFrameExclusive: 1770, fallbackFrame: 1674, navigationFrame: 1674, still: "/images/studio/blender.jpg" },
  { id: "travel", chapterId: "travel", label: "旅行", startFrame: 1770, endFrameExclusive: 2340, fallbackFrame: 2197, navigationFrame: 2197, still: "/images/studio/travel.jpg" },
  { id: "photo", chapterId: "photo", label: "影像", startFrame: 2340, endFrameExclusive: 2885, fallbackFrame: 2665, navigationFrame: 2665, still: "/images/studio/photo.jpg" },
  // The closing pose is also the final frame of the source movie.
  { id: "end", chapterId: "end", label: "end", startFrame: 2885, endFrameExclusive: 3125, fallbackFrame: 3124, navigationFrame: 3124, still: "/images/studio/end.jpg" },
];

export const STUDIO_TIMELINE = cues.map((cue) => ({
  ...cue,
  navigationFrame: cue.navigationFrame ?? cue.startFrame,
  startTime: cue.startFrame / STUDIO_VIDEO.fps,
  endTime: cue.endFrameExclusive / STUDIO_VIDEO.fps,
  lastFrameTime: (cue.endFrameExclusive - 1) / STUDIO_VIDEO.fps,
}));
