import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { STUDIO_SCROLL, STUDIO_TIMELINE, STUDIO_VIDEO, type StudioCueId } from "../data/studioTimeline";
import "./StudioBackground.css";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const frameDuration = 1 / STUDIO_VIDEO.fps;
const lastFrameTime = (STUDIO_VIDEO.frameCount - 1) / STUDIO_VIDEO.fps;
const playbackStallMilliseconds = 2500;

function getDeviceSettings() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
}

export default function StudioBackground() {
  const [mobile, setMobile] = useState(getDeviceSettings);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 760px)");
    const update = () => setMobile(getDeviceSettings());
    phone.addEventListener("change", update);
    return () => {
      phone.removeEventListener("change", update);
    };
  }, []);

  useLayoutEffect(() => {
    const videoElement = videoRef.current;
    const reverseVideoElement = reverseVideoRef.current;
    const layerElement = layerRef.current;
    const stillElement = stillRef.current;
    if (!videoElement || !reverseVideoElement || !layerElement || !stillElement) return;
    const forwardVideo: HTMLVideoElement = videoElement;
    const reverseVideo: HTMLVideoElement = reverseVideoElement;
    let video = forwardVideo;
    const layer: HTMLDivElement = layerElement;
    const still: HTMLImageElement = stillElement;
    const wasPlaying = layer.dataset.phase === "playing";
    const preservedIndex = STUDIO_TIMELINE.findIndex(cue => cue.id === (wasPlaying ? layer.dataset.targetCue : layer.dataset.cue));
    const preservedProgress = wasPlaying ? (Number(layer.dataset.direction) < 0 ? 1 : 0) : Number(layer.dataset.progress) || 0;
    // StrictMode can restart setup before the opening has decoded any frame.
    // Preserve that initial playback rather than seeking past it to the pose.
    const openingPending = wasPlaying && preservedIndex === 0 && layer.dataset.display === "still"
      && video.currentTime === 0 && Number(layer.dataset.decodedTime || 0) === 0;

    let raf = 0;
    let disposed = false;
    let frameCallback = 0;
    let frameOwner = video;
    let generation = 0;
    let playRequested = false;
    let seekGoal: number | null = null;
    let needsSeek = false;
    let finalSeek = false;
    let reverseFailed = false;
    let reverseWarmTime: number | null = null;
    let lastProgressAt = performance.now();
    let seekPending = false;
    let seekPresented = false;
    let failed = false;
    let layoutDirty = true;
    let presentedIndex = -1;
    let targetIndex = 0;
    let transitionOtherIndex = 0;
    let confirmedTime = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? video.currentTime : -1;
    let targetTime = STUDIO_TIMELINE[0].fallbackFrame / STUDIO_VIDEO.fps;
    let playing = true;
    let revealing = false;
    let revealSeconds = 0;
    let direction = 1;
    let oppositeWheelDistance = 0;
    let lastOppositeWheelTime = 0;
    let directSeek = false;
    let anchorY = window.scrollY;
    let lastScrollY = window.scrollY;
    let stillUrl = "";
    const timelineTime = (owner: HTMLVideoElement, time: number) => owner === reverseVideo ? lastFrameTime - time : time;
    const mediaTime = (time: number) => video === reverseVideo ? lastFrameTime - time : time;
    const primeReverse = () => {
      if (disposed || video !== forwardVideo || reverseFailed || reverseWarmTime === null
        || reverseVideo.readyState < HTMLMediaElement.HAVE_METADATA || reverseVideo.seeking) return;
      const time = clamp(Math.round((lastFrameTime - reverseWarmTime) * STUDIO_VIDEO.fps) / STUDIO_VIDEO.fps,
        0, Math.min(lastFrameTime, (reverseVideo.duration || STUDIO_VIDEO.duration) - frameDuration));
      if (Math.abs(reverseVideo.currentTime - time) < frameDuration / 2) return;
      reverseVideo.pause();
      reverseVideo.currentTime = time + frameDuration / 20;
    };
    const warmReverse = (time: number) => {
      if (video !== forwardVideo || reverseFailed || disposed || document.hidden) return;
      reverseWarmTime = time;
      const source = asset(mobile ? STUDIO_VIDEO.reverseMobile : STUDIO_VIDEO.reverseDesktop);
      if (reverseVideo.getAttribute("src") !== source) {
        // Start only after entering a chapter. Buffer its mirrored pose while
        // forward playback runs, so the first return needs no cold range seek.
        reverseVideo.preload = "auto";
        reverseVideo.src = source;
        reverseVideo.load();
      }
      primeReverse();
    };
    const cancelFrame = () => {
      if (frameCallback) frameOwner.cancelVideoFrameCallback(frameCallback);
      frameCallback = 0;
    };
    const showVideo = () => {
      layer.dataset.playbackSource = video === reverseVideo ? "reverse" : "forward";
      layer.dataset.display = "video";
    };
    const mediaOpen = () => Boolean(document.querySelector(".studio-media-dialog[open]"));
    let ranges: { start: number; end: number; readingHeight: number }[] = [];
    const sections = STUDIO_TIMELINE.map(cue =>
      document.querySelector<HTMLElement>(`.studio-main [data-studio-cue="${cue.id}"]`),
    );
    const preloadedStills = STUDIO_TIMELINE.map(cue => {
      const image = new Image();
      image.src = asset(cue.still);
      return image;
    });
    const pose = (index: number) => STUDIO_TIMELINE[index].fallbackFrame / STUDIO_VIDEO.fps;
    const notify = (index = Math.max(0, presentedIndex)) => window.dispatchEvent(new CustomEvent("studiochapterchange", {
      detail: STUDIO_TIMELINE[index].chapterId,
    }));
    const showStill = (index: number) => {
      const url = asset(STUDIO_TIMELINE[index].still);
      if (url !== stillUrl) { still.src = url; stillUrl = url; }
      layer.dataset.display = "still";
    };
    const setPanes = (index: number) => sections.forEach((section, i) => {
      if (!section) return;
      section.dataset.studioActive = String(i === index);
      section.inert = playing || i !== index;
    });
    const indexAt = (y: number) => {
      let index = 0;
      for (let i = 1; i < ranges.length; i += 1) {
        if (y >= ranges[i].start - 0.5) index = i;
      }
      return index;
    };
    const pin = (y: number) => {
      anchorY = clamp(y, 0, Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
      lastScrollY = anchorY;
      if (Math.abs(window.scrollY - anchorY) > 0.5) window.scrollTo({ top: anchorY, behavior: "auto" });
    };
    const measure = () => {
      const viewport = window.innerHeight;
      const heights = sections.map(section => {
        const reading = section?.querySelector<HTMLElement>('[data-studio-phase="reading"]');
        return reading ? Math.max(reading.offsetHeight, reading.scrollHeight) : viewport;
      });
      // Phones need a shorter gesture to leave a settled chapter. The measured
      // content overflow is still added below, so longer pages remain readable.
      const phone = window.matchMedia('(max-width: 600px)').matches;
      const readingDistance = phone ? clamp(viewport * 0.3, 180, 280)
        : clamp(viewport * STUDIO_SCROLL.readingViewportFraction,
          STUDIO_SCROLL.minimumReadingDistance, STUDIO_SCROLL.maximumReadingDistance);
      const oldRange = ranges[playing ? targetIndex : Math.max(0, presentedIndex)];
      const oldProgress = oldRange ? clamp((window.scrollY - oldRange.start) / Math.max(1, oldRange.end - oldRange.start), 0, 1) : 0;
      sections.forEach((section, i) => {
        const overflow = Math.max(0, heights[i] - viewport);
        section?.style.setProperty("--studio-scene-height", `${readingDistance + overflow + (i === sections.length - 1 ? viewport : 0)}px`);
      });
      const y = window.scrollY;
      const starts = sections.map(section => (section?.getBoundingClientRect().top ?? 0) + y);
      ranges = sections.map((section, i) => ({
        start: starts[i],
        end: starts[i + 1] ?? starts[i] + (section?.offsetHeight ?? viewport) - viewport,
        readingHeight: heights[i],
      }));
      // Resize preserves the semantic chapter and reading progress; it never
      // becomes a new scroll navigation request or restarts the animation.
      if (oldRange) {
        const range = ranges[playing ? targetIndex : Math.max(0, presentedIndex)];
        pin(Math.min(range.start + oldProgress * (range.end - range.start), Math.max(range.start, range.end - 2)));
      }
      if (playing && revealing) updateReading(targetIndex);
      layer.dataset.readingDistance = readingDistance.toFixed(2);
      layoutDirty = false;
    };
    const updateReading = (index = Math.max(0, presentedIndex)) => {
      const range = ranges[index];
      const offset = clamp(window.scrollY - range.start, 0, Math.max(0, range.readingHeight - window.innerHeight));
      sections[index]?.style.setProperty("--studio-reading-top", `${-offset}px`);
      layer.dataset.progress = clamp((window.scrollY - range.start) / Math.max(1, range.end - range.start), 0, 1).toFixed(4);
    };
    const showPane = (index: number) => {
      const cue = STUDIO_TIMELINE[index];
      layer.dataset.cue = cue.id;
      layer.dataset.chapter = cue.chapterId;
      setPanes(index);
      updateReading(index);
      notify(index);
    };
    const finish = (useStill = false) => {
      if (!playing) return;
      playing = false;
      video.pause();
      playRequested = false;
      cancelFrame();
      revealing = false;
      presentedIndex = targetIndex;
      const cue = STUDIO_TIMELINE[presentedIndex];
      layer.dataset.phase = "hold";
      layer.dataset.revealing = "false";
      layer.dataset.contentProgress = "1";
      layer.dataset.targetCue = cue.id;
      layer.dataset.targetTime = targetTime.toFixed(4);
      document.documentElement.dataset.studioPlaying = "false";
      if (useStill || failed || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) showStill(presentedIndex);
      else showVideo();
      sections[presentedIndex]?.style.setProperty("--studio-reveal-progress", "1");
      showPane(presentedIndex);
      if (presentedIndex > 0) warmReverse(targetTime);
    };
    const updateReveal = () => {
      if (!playing || directSeek || failed || confirmedTime < 0 || !revealSeconds) return;
      const progress = clamp(1 - Math.abs(targetTime - confirmedTime) / revealSeconds, 0, 1);
      if (!progress) return;
      const opacity = progress * progress * (3 - 2 * progress);
      sections[targetIndex]?.style.setProperty("--studio-reveal-progress", opacity.toFixed(4));
      layer.dataset.contentProgress = opacity.toFixed(4);
      if (!revealing) {
        revealing = true;
        layer.dataset.revealing = "true";
        // Preview the destination pane, while the committed pose and scroll
        // lock still belong to playback. A reversal can cancel this preview.
        showPane(targetIndex);
      }
    };
    const queue = () => {
      if (!disposed && !raf && !document.hidden) raf = window.requestAnimationFrame(tick);
    };
    const watchFrame = () => {
      if (!video.requestVideoFrameCallback || frameCallback || !playing) return;
      const owner = video, currentGeneration = generation;
      frameOwner = owner;
      frameCallback = owner.requestVideoFrameCallback((_now, metadata) => {
        if (disposed || owner !== video || currentGeneration !== generation) return;
        frameCallback = 0;
        if (document.hidden || mediaOpen()) return;
        if (needsSeek) { watchFrame(); return; }
        const time = timelineTime(owner, metadata.mediaTime);
        if (seekPending || directSeek || finalSeek) {
          // The compositor may present a seek frame before firing seeked.
          // Remember it, but commit the destination only after both signals.
          if (seekGoal !== null && Math.abs(time - seekGoal) < frameDuration / 2) {
            seekPresented = true;
            confirmedTime = time;
            layer.dataset.decodedTime = time.toFixed(6);
            lastProgressAt = performance.now();
            if (!seekPending && (directSeek || finalSeek)) finish();
          }
          watchFrame();
          return;
        }
        if (Math.abs(time - confirmedTime) >= frameDuration / 2) lastProgressAt = performance.now();
        confirmedTime = time;
        layer.dataset.decodedTime = confirmedTime.toFixed(6);
        showVideo();
        updateReveal();
        settleOrContinue();
        watchFrame();
      });
    };
    const play = () => {
      if (!playing || directSeek || finalSeek || needsSeek || seekPending || playRequested || document.hidden || mediaOpen()) return;
      const owner = video, currentGeneration = generation;
      playRequested = true;
      owner.playbackRate = STUDIO_SCROLL.playbackRate;
      watchFrame();
      void owner.play().catch(() => {
        if (disposed || currentGeneration !== generation || owner !== video || !playing || document.hidden || mediaOpen()) return;
        layer.dataset.playbackFallback = "play-rejected";
        finish(true);
      }).finally(() => {
        if (currentGeneration === generation && owner === video) playRequested = false;
      });
    };
    const settleOrContinue = () => {
      if (!playing || seekPending || needsSeek || finalSeek || directSeek) return;
      const reached = video === reverseVideo ? confirmedTime <= targetTime + frameDuration / 2
        : confirmedTime >= targetTime - frameDuration / 2;
      if (!reached) return;
      video.pause();
      if (Math.abs(confirmedTime - targetTime) < frameDuration / 2) finish();
      else {
        // Native playback runs continuously; only arrival needs an exact seek.
        finalSeek = true;
        seekGoal = targetTime;
        needsSeek = true;
        queue();
      }
    };
    const start = (index: number, scrollDirection: number, immediate = false) => {
      const restoringStill = immediate && index === presentedIndex && layer.dataset.display === "still";
      targetIndex = index;
      targetTime = pose(index);
      direction = scrollDirection;
      oppositeWheelDistance = 0;
      lastOppositeWheelTime = 0;
      directSeek = immediate;
      const fromTime = layer.dataset.display === "still" && presentedIndex >= 0
        ? pose(presentedIndex) : Math.max(0, confirmedTime);
      cancelFrame();
      forwardVideo.pause();
      reverseVideo.pause();
      generation += 1;
      playRequested = false;
      video = !immediate && targetTime < fromTime - frameDuration / 2 ? reverseVideo : forwardVideo;
      seekPending = false;
      seekPresented = false;
      finalSeek = false;
      seekGoal = immediate ? targetTime : fromTime;
      needsSeek = true;
      if (video === reverseVideo) {
        const source = asset(mobile ? STUDIO_VIDEO.reverseMobile : STUDIO_VIDEO.reverseDesktop);
        if (reverseVideo.getAttribute("src") !== source) {
          reverseVideo.src = source;
          reverseVideo.load();
        }
      }
      playing = true;
      revealing = restoringStill;
      revealSeconds = Math.min(STUDIO_SCROLL.maximumContentRevealSeconds,
        Math.abs(targetTime - fromTime) * STUDIO_SCROLL.contentRevealFraction);
      lastProgressAt = performance.now();
      delete layer.dataset.playbackFallback;
      layer.dataset.targetCue = STUDIO_TIMELINE[index].id;
      layer.dataset.navigationMode = immediate ? "direct" : "play";
      layer.dataset.targetTime = targetTime.toFixed(4);
      layer.dataset.direction = String(scrollDirection);
      layer.dataset.phase = "playing";
      layer.dataset.revealing = String(restoringStill);
      layer.dataset.contentProgress = restoringStill ? "1" : "0";
      sections[index]?.style.setProperty("--studio-reveal-progress", restoringStill ? "1" : "0");
      if (presentedIndex >= 0) {
        layer.dataset.cue = STUDIO_TIMELINE[presentedIndex].id;
        layer.dataset.chapter = STUDIO_TIMELINE[presentedIndex].chapterId;
      }
      document.documentElement.dataset.studioPlaying = "true";
      setPanes(restoringStill ? index : -1);
      notify(presentedIndex >= 0 ? presentedIndex : index);
      if (index > 0) warmReverse(targetTime);
      if (failed || (video === reverseVideo && reverseFailed)) {
        showStill(index);
        finish(true);
      } else if (confirmedTime < 0 && video === forwardVideo && video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA && (immediate || presentedIndex >= 0)) {
        // A loading/error fallback never pairs an old pose with new content.
        showStill(index);
        finish();
      } else { watchFrame(); queue(); }
    };
    const crossBoundary = (requested: number) => {
      const next = clamp(presentedIndex + Math.sign(requested - presentedIndex), 0, sections.length - 1);
      transitionOtherIndex = next;
      const forward = next > presentedIndex, range = ranges[next];
      // Discard fling overshoot. Every arrival gets its full reading distance;
      // scroll input during playback cannot queue a tour of later chapters.
      pin(forward ? range.start : Math.max(range.start, range.end - 2));
      start(next, forward ? 1 : -1);
    };
    const reverse = () => {
      if (presentedIndex < 0 || directSeek) return;
      const next = targetIndex === presentedIndex ? transitionOtherIndex : presentedIndex;
      const range = ranges[next], backDirection = -direction;
      pin(backDirection > 0 ? range.start : Math.max(range.start, range.end - 2));
      start(next, backDirection);
    };
    const readPosition = () => {
      if (mediaOpen()) return;
      if (layoutDirty) measure();
      const requested = indexAt(Math.max(0, window.scrollY));
      if (failed) {
        if (requested !== presentedIndex || playing) start(requested, 1, true);
      } else if (!playing && requested !== presentedIndex) crossBoundary(requested);
      if (!playing) updateReading();
    };

    function tick(now: number) {
      raf = 0;
      if (document.hidden) return;
      if (mediaOpen()) { video.pause(); return; }
      readPosition();
      if (!playing || failed) return;
      // A stalled load or missing frame callback must never trap touch scrolling.
      // This is a progress deadline, so long, healthy transitions still play fully.
      if (now - lastProgressAt >= playbackStallMilliseconds) {
        layer.dataset.playbackFallback = "stalled";
        finish(true);
        return;
      }
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) { queue(); return; }
      if (needsSeek && !video.seeking && seekGoal !== null) {
        needsSeek = false;
        const time = clamp(Math.round(mediaTime(seekGoal) * STUDIO_VIDEO.fps) / STUDIO_VIDEO.fps,
          0, Math.min(lastFrameTime, (video.duration || STUDIO_VIDEO.duration) - frameDuration));
        seekPending = true;
        seekPresented = false;
        watchFrame();
        // MP4 timestamps are rounded to microseconds. Seeking to the exact
        // rational N/60 can otherwise decode N-1; stay just inside frame N.
        video.currentTime = time + frameDuration / 20;
      } else if (!seekPending && !video.seeking) {
        // Browsers without RVFC still use continuous playback and the media clock.
        if (!video.requestVideoFrameCallback) {
          const time = timelineTime(video, video.currentTime);
          if (Math.abs(time - confirmedTime) >= frameDuration / 2) lastProgressAt = now;
          confirmedTime = time;
          layer.dataset.decodedTime = time.toFixed(6);
          showVideo();
          updateReveal();
          if (directSeek || finalSeek) finish();
          else settleOrContinue();
        }
        if (video.paused) play();
      }
      queue();
    }

    const onSeeked = (event: Event) => {
      if (event.currentTarget !== video || video.seeking || needsSeek || seekGoal === null
        || Math.abs(timelineTime(video, video.currentTime) - seekGoal) >= frameDuration / 2) return;
      seekPending = false;
      lastProgressAt = performance.now();
      if (directSeek || finalSeek) {
        if (seekPresented) finish();
      } else {
        // Keep the old video visible until the new stream presents its first frame.
        play();
      }
      queue();
    };
    const onLoaded = (event: Event) => {
      if (event.currentTarget !== video) return;
      lastProgressAt = performance.now();
      queue();
    };
    const onError = (event: Event) => {
      if (event.currentTarget === reverseVideo) reverseFailed = true;
      else failed = true;
      if (event.currentTarget !== video) return;
      seekPending = false;
      finish(true);
    };
    const onLayout = () => { layoutDirty = true; queue(); };
    const onScroll = () => {
      if (mediaOpen()) return;
      if (layoutDirty) measure();
      const y = window.scrollY, delta = y - lastScrollY;
      if (Math.abs(delta) < 0.5) return;
      lastScrollY = y;
      if (playing && !failed) {
        if (Math.sign(delta) !== direction) reverse();
        pin(anchorY);
      } else readPosition();
      queue();
    };
    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX) || !event.deltaY || mediaOpen()) return;
      const pixels = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1);
      if (!playing) {
        const discrete = event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL
          || (Math.abs(event.deltaY) >= 80 && Number.isInteger(event.deltaY));
        if (!discrete || (event.target instanceof Element && event.target.closest('input, textarea, select, [data-native-scroll]'))) return;
        if (layoutDirty) measure();
        const range = ranges[Math.max(0, presentedIndex)];
        const measuredOverflow = Math.max(0, range.readingHeight - window.innerHeight);
        const overflow = measuredOverflow > 8 ? measuredOverflow : 0;
        const offset = window.scrollY - range.start;
        // Read long content at native speed. Only shorten the settled-pose padding
        // for discrete mouse wheels; one event enters exactly the adjacent cue.
        if (overflow > 0 && offset < overflow - 1 && (pixels > 0 || offset > 0)) return;
        event.preventDefault();
        const next = clamp(presentedIndex + Math.sign(pixels), 0, sections.length - 1);
        if (next !== presentedIndex) crossBoundary(next);
        return;
      }
      // In-flight playback owns vertical input and cannot queue later chapters.
      if (failed) return;
      event.preventDefault();
      if (Math.sign(event.deltaY) === direction) {
        oppositeWheelDistance = 0;
        return;
      }
      // Trackpad tail jitter must not cancel a pane that is already fading in.
      // A normal wheel step reverses immediately; small deliberate movements
      // accumulate across a short gesture instead of repeatedly hiding content.
      const now = performance.now();
      if (now - lastOppositeWheelTime > 140) oppositeWheelDistance = 0;
      lastOppositeWheelTime = now;
      oppositeWheelDistance += Math.abs(pixels);
      if (oppositeWheelDistance >= 18) reverse();
    };
    const onTouchStart = () => {
      if (failed || mediaOpen() || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
      // iOS may defer preload until a gesture. A muted inline play unlocks loading;
      // the timeline remains responsible for all subsequent playback and seeking.
      const owner = video;
      void owner.play().then(() => { if (owner === video && needsSeek) owner.pause(); queue(); }).catch(() => queue());
    };
    const onNavigate = (event: Event) => {
      if (layoutDirty) measure();
      const id = (event as CustomEvent<StudioCueId>).detail;
      const index = STUDIO_TIMELINE.findIndex(cue => cue.id === id);
      const next = index >= 0 ? index : indexAt(window.scrollY);
      pin(ranges[next].start);
      // Directory/deep links/Top bypass playback and remain directly addressable.
      start(next, Math.sign(next - presentedIndex) || 1, true);
    };
    const onReset = () => {
      if (raf) cancelAnimationFrame(raf);
      cancelFrame();
      raf = 0;
      frameCallback = 0;
      forwardVideo.pause();
      reverseVideo.pause();
      video = forwardVideo;
      reverseWarmTime = null;
      seekPending = false;
      presentedIndex = -1;
      transitionOtherIndex = 0;
      confirmedTime = -1;
      failed = Boolean(video.error);
      stillUrl = asset(STUDIO_VIDEO.poster);
      still.src = stillUrl;
      layer.dataset.display = "still";
      layer.dataset.cue = STUDIO_TIMELINE[0].id;
      layer.dataset.chapter = STUDIO_TIMELINE[0].chapterId;
      delete layer.dataset.decodedTime;
      sections.forEach(section => section?.style.setProperty("--studio-reading-top", "0px"));
      targetIndex = 0;
      playing = true;
      layoutDirty = true;
      measure();
      pin(0);
      // A restored document retains its media position. Seek to the beginning
      // under the opening poster, then resume ordinary forward frame playback.
      start(0, 1);
    };
    const onVisibility = () => {
      video.pause();
      lastProgressAt = performance.now();
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        cancelFrame();
      } else { watchFrame(); play(); queue(); }
    };
    const onMediaChange = () => {
      lastProgressAt = performance.now();
      if (mediaOpen()) { video.pause(); cancelFrame(); }
      else { watchFrame(); play(); queue(); }
    };
    const resizeObserver = new ResizeObserver(onLayout);
    sections.forEach(section => {
      const reading = section?.querySelector<HTMLElement>('[data-studio-phase="reading"]');
      if (reading) resizeObserver.observe(reading);
    });
    [forwardVideo, reverseVideo].forEach(owner => {
      owner.addEventListener("loadeddata", onLoaded);
      owner.addEventListener("seeked", onSeeked);
      owner.addEventListener("error", onError);
    });
    reverseVideo.addEventListener("loadedmetadata", primeReverse);
    reverseVideo.addEventListener("seeked", primeReverse);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("resize", onLayout, { passive: true });
    window.addEventListener("studionavigate", onNavigate);
    window.addEventListener("studioreset", onReset);
    window.addEventListener("studiomediachange", onMediaChange);
    document.addEventListener("visibilitychange", onVisibility);
    document.documentElement.dataset.studioStatic = "false";
    measure();
    const initial = preservedIndex >= 0 ? preservedIndex : 0;
    if (preservedIndex >= 0) {
      const range = ranges[initial];
      pin(Math.min(range.start + preservedProgress * (range.end - range.start), Math.max(range.start, range.end - 2)));
    } else pin(0);
    layer.dataset.cue = STUDIO_TIMELINE[initial].id;
    layer.dataset.chapter = STUDIO_TIMELINE[initial].chapterId;
    pin(window.scrollY);
    start(initial, 1, preservedIndex >= 0 && !openingPending);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      generation += 1;
      cancelFrame();
      forwardVideo.pause();
      reverseVideo.pause();
      resizeObserver.disconnect();
      [forwardVideo, reverseVideo].forEach(owner => {
        owner.removeEventListener("loadeddata", onLoaded);
        owner.removeEventListener("seeked", onSeeked);
        owner.removeEventListener("error", onError);
      });
      reverseVideo.removeEventListener("loadedmetadata", primeReverse);
      reverseVideo.removeEventListener("seeked", primeReverse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("studionavigate", onNavigate);
      window.removeEventListener("studioreset", onReset);
      window.removeEventListener("studiomediachange", onMediaChange);
      document.removeEventListener("visibilitychange", onVisibility);
      delete document.documentElement.dataset.studioStatic;
      delete document.documentElement.dataset.studioPlaying;
      preloadedStills.length = 0;
    };
  }, [mobile]);

  return (
    <div aria-hidden="true" className="studio-background" data-display="still" id="studio-background" ref={layerRef}>
      <img alt="" className="studio-background-still" ref={stillRef} src={asset(STUDIO_VIDEO.poster)} />
      <video className="studio-background-video studio-background-video--forward" disablePictureInPicture muted playsInline
        poster={asset(STUDIO_VIDEO.poster)} preload="auto"
        ref={videoRef} src={asset(mobile ? STUDIO_VIDEO.mobile : STUDIO_VIDEO.desktop)} tabIndex={-1} />
      <video className="studio-background-video studio-background-video--reverse" disablePictureInPicture muted playsInline
        preload="none" ref={reverseVideoRef} tabIndex={-1} />
    </div>
  );
}
