// Adapted from React Bits Circular Gallery TS/CSS; see SkillCircularGallery.LICENSE.md.
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './SkillCircularGallery.css';

export interface SkillCircularGalleryItem {
  id: string;
  label: string;
  src: string;
  alt: string;
}

interface SkillCircularGalleryProps {
  items: SkillCircularGalleryItem[];
  kind: 'documents' | 'icons';
  enabled?: boolean;
  onSelect?: (index: number, returnFocusElement: HTMLElement) => void;
  className?: string;
}

interface GalleryController {
  step: (direction: number) => void;
  goTo: (index: number) => void;
  setEnabled: (enabled: boolean) => void;
}

// The upstream subdivided planes, wave displacement, circular arc and inertia are retained.
const vertex = `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5)
      * (0.006 + min(abs(uSpeed), 0.4) * 0.15);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uLoaded;
  uniform float uBorderRadius;
  varying vec2 vUv;
  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, vec2(0.0))) - r;
  }
  void main() {
    vec4 color = texture2D(tMap, vUv);
    float d = roundedBoxSDF(vUv - 0.5, vec2(0.5), uBorderRadius);
    float alpha = color.a * (1.0 - smoothstep(-0.002, 0.002, d)) * uLoaded;
    // Premultiplied output preserves the source PNG alpha and smooth antialiased edges.
    gl_FragColor = vec4(color.rgb * alpha, alpha);
  }
`;

const wrap = (value: number, size: number) => ((value + size / 2) % size + size) % size - size / 2;

export default function SkillCircularGallery({
  items,
  kind,
  enabled = true,
  onSelect,
  className = '',
}: SkillCircularGalleryProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const activateRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<GalleryController | null>(null);
  const latestRef = useRef({ enabled, onSelect });
  const selectedRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fallback, setFallback] = useState(false);
  const currentIndex = Math.min(selectedIndex, Math.max(0, items.length - 1));
  const currentItem = items[currentIndex];

  useLayoutEffect(() => {
    latestRef.current = { enabled, onSelect };
    controllerRef.current?.setEnabled(enabled);
  }, [enabled, onSelect]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !items.length) return;

    let disposed = false;
    let frame = 0;
    let visible = true;
    let active = latestRef.current.enabled;
    let failed = false;
    let width = 1;
    let height = 1;
    let worldWidth = 1;
    let worldHeight = 1;
    let cycleWidth = 1;
    let index = 0;
    let time = 0;
    let current = 0;
    let target = 0;
    let lastFrameTime = 0;
    let pointer: { id: number; x: number; start: number; moved: boolean } | null = null;
    let snapTimeout: ReturnType<typeof setTimeout> | undefined;
    const sources = items.map(() => ({ aspect: kind === 'icons' ? 1 : 1.3, center: 0, width: 1, height: 1 }));
    const images: HTMLImageElement[] = [];
    const textures: Texture[] = [];
    const programs: Program[] = [];
    const cards: { itemIndex: number; copy: number; mesh: Mesh; program: Program }[] = [];
    let renderer: Renderer;

    const announce = (nextIndex: number) => {
      if (disposed || index === nextIndex && selectedRef.current === nextIndex) return;
      index = nextIndex;
      selectedRef.current = nextIndex;
      setSelectedIndex(nextIndex);
    };
    const showFallback = () => {
      if (!disposed) {
        failed = true;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        setFallback(true);
      }
    };
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    } catch {
      queueMicrotask(showFallback);
      return () => { disposed = true; };
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'skill-circular-gallery__canvas';
    viewport.appendChild(canvas);
    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 20;
    const scene = new Transform();
    const geometry = new Plane(gl, { heightSegments: 20, widthSegments: 32 });

    const canAnimate = () => !disposed && !failed && active && visible && !document.hidden && !gl.isContextLost();
    const nearest = (position: number) => {
      let closest = 0;
      let distance = Infinity;
      sources.forEach((source, candidate) => {
        const delta = Math.abs(wrap(source.center - position, cycleWidth));
        if (delta < distance) { distance = delta; closest = candidate; }
      });
      return closest;
    };
    const align = (nextIndex: number, direction = 0) => {
      let distance = wrap(sources[nextIndex].center - target, cycleWidth);
      if (direction > 0 && distance <= 0) distance += cycleWidth;
      if (direction < 0 && distance >= 0) distance -= cycleWidth;
      target += distance;
    };
    const positionCards = (speed: number) => {
      const halfWidth = worldWidth / 2;
      const bend = worldHeight * 0.13;
      const radius = (halfWidth * halfWidth + bend * bend) / (2 * bend);
      cards.forEach(({ itemIndex, copy, mesh, program }) => {
        const source = sources[itemIndex];
        const x = wrap(source.center + copy * cycleWidth - current, cycleWidth * 2);
        const effectiveX = Math.min(Math.abs(x), halfWidth);
        const arc = radius - Math.sqrt(Math.max(0, radius * radius - effectiveX * effectiveX));
        mesh.position.x = x;
        mesh.position.y = -arc;
        mesh.rotation.z = -Math.sign(x) * Math.asin(Math.min(1, effectiveX / radius));
        mesh.scale.set(source.width, source.height, 1);
        mesh.visible = Math.abs(x) < halfWidth + source.width;
        program.uniforms.uTime.value = time;
        program.uniforms.uSpeed.value = speed;
      });
    };
    const tick = (stamp: number) => {
      frame = 0;
      if (!canAnimate()) return;
      const elapsed = Math.min(40, Math.max(1, stamp - (lastFrameTime || stamp - 16.67)));
      lastFrameTime = stamp;
      const previous = current;
      current += (target - current) * (1 - Math.pow(0.92, elapsed / 16.67));
      time += elapsed * 0.0016;
      if (Math.abs(target - current) < 0.0001) current = target;
      positionCards(current - previous);
      renderer.render({ scene, camera });
      if (!pointer) announce(nearest(current));
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      if (canAnimate() && !frame) { lastFrameTime = 0; frame = requestAnimationFrame(tick); }
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastFrameTime = 0;
    };
    const resize = () => {
      const bounds = viewport.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      width = bounds.width;
      height = bounds.height;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      worldHeight = 2 * Math.tan(camera.fov * Math.PI / 360) * camera.position.z;
      worldWidth = worldHeight * width / height;
      const oldCenter = sources[index].center;
      const widestAspect = Math.max(...sources.map(source => source.aspect));
      const cardHeight = Math.min(worldHeight * (kind === 'icons' ? 0.69 : 0.76), worldWidth * 0.72 / widestAspect);
      const gap = worldHeight * 14 / height;
      let edge = 0;
      sources.forEach(source => {
        source.height = cardHeight;
        source.width = cardHeight * source.aspect;
        source.center = edge + source.width / 2;
        edge += source.width + gap;
      });
      const origin = sources[0].center;
      sources.forEach(source => { source.center -= origin; });
      cycleWidth = Math.max(edge, worldWidth * 0.2);
      current += sources[index].center - oldCenter;
      target += sources[index].center - oldCenter;
      positionCards(0);
      if (!disposed && !failed && visible && !document.hidden && !gl.isContextLost()) {
        renderer.render({ scene, camera });
      }
      resume();
    };

    items.forEach((item, itemIndex) => {
      const texture = new Texture(gl, { generateMipmaps: true, premultiplyAlpha: false });
      textures.push(texture);
      for (let copy = 0; copy < 2; copy += 1) {
        const program = new Program(gl, {
          vertex, fragment, transparent: true, depthTest: false, depthWrite: false,
          uniforms: { tMap: { value: texture }, uTime: { value: 0 }, uSpeed: { value: 0 }, uLoaded: { value: 0 }, uBorderRadius: { value: kind === 'icons' ? 0 : 0.025 } },
        });
        programs.push(program);
        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);
        cards.push({ itemIndex, copy, mesh, program });
      }
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (disposed) return;
        texture.image = image;
        sources[itemIndex].aspect = kind === 'icons' ? 1 : image.naturalWidth / Math.max(1, image.naturalHeight);
        cards.filter(card => card.itemIndex === itemIndex).forEach(card => { card.program.uniforms.uLoaded.value = 1; });
        resize();
      };
      image.onerror = showFallback;
      images.push(image);
      image.src = item.src;
    });

    const selectAt = (clientX: number, clientY: number) => {
      if (kind !== 'documents') return;
      const bounds = viewport.getBoundingClientRect();
      const x = ((clientX - bounds.left) / width - 0.5) * worldWidth;
      const y = (0.5 - (clientY - bounds.top) / height) * worldHeight;
      const hit = [...cards].reverse().find(({ mesh }) => {
        if (!mesh.visible) return false;
        const dx = x - mesh.position.x;
        const dy = y - mesh.position.y;
        const cosine = Math.cos(mesh.rotation.z);
        const sine = Math.sin(mesh.rotation.z);
        return Math.abs(dx * cosine + dy * sine) <= mesh.scale.x / 2 && Math.abs(-dx * sine + dy * cosine) <= mesh.scale.y / 2;
      });
      if (hit && activateRef.current) {
        align(hit.itemIndex);
        latestRef.current.onSelect?.(hit.itemIndex, activateRef.current);
      }
    };
    const pointerDown = (event: PointerEvent) => {
      if (!canAnimate() || !event.isPrimary || event.button !== 0) return;
      if (snapTimeout) clearTimeout(snapTimeout);
      pointer = { id: event.pointerId, x: event.clientX, start: target, moved: false };
      viewport.setPointerCapture(event.pointerId);
      viewport.dataset.dragging = 'true';
    };
    const pointerMove = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const distance = event.clientX - pointer.x;
      if (Math.abs(distance) > 6) pointer.moved = true;
      target = pointer.start - distance * worldWidth / width;
      resume();
    };
    const pointerEnd = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const pick = event.type === 'pointerup' && !pointer.moved;
      pointer = null;
      delete viewport.dataset.dragging;
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      align(nearest(target));
      if (pick) selectAt(event.clientX, event.clientY);
    };
    const horizontalWheel = (event: WheelEvent) => {
      if (!canAnimate() || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
      target += event.deltaX * unit * worldWidth / width;
      if (snapTimeout) clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => { align(nearest(target)); resume(); }, 150);
      resume();
    };
    const cancelDrag = () => {
      const pointerId = pointer?.id;
      pointer = null;
      delete viewport.dataset.dragging;
      if (pointerId !== undefined && viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId);
    };
    const visibilityChange = () => { if (document.hidden) { cancelDrag(); stop(); } else resume(); };
    const contextLost = (event: Event) => { event.preventDefault(); stop(); showFallback(); };
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume(); else { cancelDrag(); stop(); }
    });
    intersection.observe(viewport);
    viewport.addEventListener('pointerdown', pointerDown);
    viewport.addEventListener('pointermove', pointerMove);
    viewport.addEventListener('pointerup', pointerEnd);
    viewport.addEventListener('pointercancel', pointerEnd);
    viewport.addEventListener('lostpointercapture', pointerEnd);
    viewport.addEventListener('wheel', horizontalWheel, { passive: false });
    document.addEventListener('visibilitychange', visibilityChange);
    canvas.addEventListener('webglcontextlost', contextLost);
    const controller: GalleryController = {
      step: direction => { if (active && items.length > 1) { align((nearest(target) + direction + items.length) % items.length, direction); resume(); } },
      goTo: nextIndex => { if (active) { align(nextIndex); resume(); } },
      setEnabled: nextEnabled => {
        active = nextEnabled;
        if (active) resume();
        else {
          stop();
          if (snapTimeout) clearTimeout(snapTimeout);
          cancelDrag();
        }
      },
    };
    controllerRef.current = controller;
    queueMicrotask(() => { if (!disposed) { setFallback(false); selectedRef.current = 0; setSelectedIndex(0); } });
    resize();

    return () => {
      disposed = true;
      stop();
      if (snapTimeout) clearTimeout(snapTimeout);
      observer.disconnect();
      intersection.disconnect();
      if (controllerRef.current === controller) controllerRef.current = null;
      viewport.removeEventListener('pointerdown', pointerDown);
      viewport.removeEventListener('pointermove', pointerMove);
      viewport.removeEventListener('pointerup', pointerEnd);
      viewport.removeEventListener('pointercancel', pointerEnd);
      viewport.removeEventListener('lostpointercapture', pointerEnd);
      viewport.removeEventListener('wheel', horizontalWheel);
      document.removeEventListener('visibilitychange', visibilityChange);
      canvas.removeEventListener('webglcontextlost', contextLost);
      cancelDrag();
      images.forEach(image => { image.onload = null; image.onerror = null; });
      cards.forEach(card => card.mesh.setParent(null));
      geometry.remove();
      programs.forEach(program => program.remove());
      textures.forEach(texture => gl.deleteTexture(texture.texture));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, [items, kind]);

  const changeIndex = (next: number, direction = 0) => {
    if (!enabled || !items.length) return;
    if (!fallback && controllerRef.current) {
      if (direction) controllerRef.current.step(direction);
      else controllerRef.current.goTo(next);
    } else {
      selectedRef.current = next;
      setSelectedIndex(next);
    }
  };
  const selectCurrent = () => {
    if (enabled && kind === 'documents' && currentItem && activateRef.current) onSelect?.(currentIndex, activateRef.current);
  };

  return (
    <div
      className={`skill-circular-gallery skill-circular-gallery--${kind} ${className}`}
      data-fallback={fallback || undefined}
      aria-label="技能素材画廊"
      onKeyDown={event => {
        if (!enabled) return;
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
          event.preventDefault(); event.stopPropagation();
          if (event.key === 'Home') changeIndex(0);
          else if (event.key === 'End') changeIndex(items.length - 1);
          else {
            const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
            changeIndex((currentIndex + direction + items.length) % items.length, direction);
          }
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation();
          if (kind === 'documents' && event.target === viewportRef.current) {
            event.preventDefault(); selectCurrent();
          }
        }
      }}
    >
      <div
        ref={viewportRef}
        className="skill-circular-gallery__viewport"
        tabIndex={enabled && items.length ? 0 : -1}
        role="region"
        aria-roledescription="轮播画廊"
        aria-label={kind === 'documents' ? '左右拖动浏览，点击图片放大；方向键切换' : '左右拖动或使用方向键浏览图标'}
      >
        {fallback && currentItem && (
          kind === 'documents' ? <button type="button" className="skill-circular-gallery__fallback" onClick={selectCurrent} disabled={!enabled} aria-label={`放大${currentItem.label}`}><img src={currentItem.src} alt={currentItem.alt} /></button>
            : <div className="skill-circular-gallery__fallback"><img src={currentItem.src} alt={currentItem.alt} /></div>
        )}
      </div>
      <div className="skill-circular-gallery__controls">
        <button type="button" className="skill-circular-gallery__arrow" disabled={!enabled || items.length < 2} aria-label="上一张技能素材" onClick={() => changeIndex((currentIndex - 1 + items.length) % items.length, -1)}><span aria-hidden="true">←</span></button>
        <div className="skill-circular-gallery__caption">
          {kind === 'documents' ? <button ref={activateRef} type="button" className="skill-circular-gallery__activate" disabled={!enabled || !currentItem} aria-label={`放大${currentItem?.label ?? '技能素材'}`} onClick={selectCurrent}>{currentItem?.label}<span aria-hidden="true">↗</span></button> : <span className="skill-circular-gallery__label">{currentItem?.label}</span>}
          <span className="skill-circular-gallery__count" aria-live="polite" aria-atomic="true">{items.length ? `${String(currentIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}` : '暂无素材'}</span>
        </div>
        <button type="button" className="skill-circular-gallery__arrow" disabled={!enabled || items.length < 2} aria-label="下一张技能素材" onClick={() => changeIndex((currentIndex + 1) % items.length, 1)}><span aria-hidden="true">→</span></button>
      </div>
    </div>
  );
}
