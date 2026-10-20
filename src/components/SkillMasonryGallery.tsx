// Adapted from React Bits Masonry TS/CSS; see SkillMasonryGallery.LICENSE.md.
import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { StudioSkillFolderItem } from '../data/studioSkillFolders';
import './SkillMasonryGallery.css';

interface SkillMasonryGalleryProps {
  items: StudioSkillFolderItem[];
  kind: 'documents' | 'icons';
  enabled?: boolean;
  visible?: boolean;
  columns?: 2 | 3 | 4;
  layout?: 'projects' | 'bim';
  onSelect?: (index: number, returnFocusElement: HTMLElement) => void;
}

export default function SkillMasonryGallery({ items, kind, enabled = true, visible = true, columns, layout: documentLayout, onSelect }: SkillMasonryGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const enteredRef = useRef(new Set<string>());
  const placedLayoutRef = useRef<unknown>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null);
  const tooltipFrameRef = useRef(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [loadedIds, setLoadedIds] = useState<Set<string>>(() => new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(40);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      const height = Math.floor(entry.contentRect.height);
      setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
    });
    observer.observe(container);
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(query.matches);
    query.addEventListener('change', updateMotion);
    return () => { observer.disconnect(); query.removeEventListener('change', updateMotion); };
  }, []);

  useEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    const observer = new ResizeObserver(() => {
      const height = Math.ceil(tooltip.getBoundingClientRect().height);
      setTooltipHeight(previous => previous === height ? previous : height);
    });
    observer.observe(tooltip);
    return () => observer.disconnect();
  }, []);

  // Official Masonry placement: each successive image goes into the shortest column.
  const layout = useMemo(() => {
    if (!size.width || !size.height || !items.length) return { grid: [] };
    // Fit complete material groups within the measured safe area, without cropping or scrolling.
    const width = Math.max(1, size.width - 4);
    const height = Math.max(1, size.height - 4);
    const gap = width < 300 ? 10 : 12;
    const ratioFor = (item: StudioSkillFolderItem) => item.aspectRatio && Number.isFinite(item.aspectRatio) && item.aspectRatio > 0
      ? item.aspectRatio : ratios[item.id] || (kind === 'icons' ? 1 : 1.4);
    if (kind === 'documents' && documentLayout) {
      const count = documentLayout === 'projects' ? 3 : 4;
      const columnWidth = Math.max(1, (width - gap * (count - 1)) / count);
      // Use the widest bottom-row image as the shared baseline, so heights match exactly without cropping.
      const landscapeItems = documentLayout === 'projects' ? items.slice(5, 8) : items.slice(7, 9);
      const landscapeRatio = Math.max(1.415, ...landscapeItems.map(ratioFor));
      const rowHeight = columnWidth / landscapeRatio;
      const portraitHeight = rowHeight * 2 + gap;
      const pitch = documentLayout === 'projects' ? rowHeight + gap : portraitHeight + gap;
      const slots = documentLayout === 'projects'
        ? [{ column: 0, row: 0 }, { column: 1, row: 0 }, { column: 2, row: 0, tall: true },
          { column: 0, row: 1 }, { column: 1, row: 1 }, { column: 2, row: 2 },
          { column: 0, row: 2 }, { column: 1, row: 2 }]
        : [{ column: 0, row: 0, tall: true }, { column: 1, row: 0, tall: true },
          { column: 2, row: 0, tall: true }, { column: 3, row: 0, tall: true },
          { column: 2, row: 1, tall: true }, { column: 1, row: 1, tall: true },
          { column: 0, row: 1, tall: true }, { column: 3, row: 1 }, { column: 3, row: 1, lower: true }];
      const columnHeights = new Array<number>(count).fill(0);
      const rawGrid = items.map((item, index) => {
        const slot = slots[index];
        const column = slot?.column ?? columnHeights.indexOf(Math.min(...columnHeights));
        const y = slot ? slot.row * pitch + ('lower' in slot && slot.lower ? rowHeight + gap : 0) : columnHeights[column];
        const slotHeight = slot && 'tall' in slot && slot.tall ? portraitHeight : rowHeight;
        const ratio = ratioFor(item);
        const imageHeight = Math.min(slotHeight, columnWidth / ratio);
        const imageWidth = imageHeight * ratio;
        columnHeights[column] = Math.max(columnHeights[column], y + slotHeight + gap);
        return { item, index, x: column * (columnWidth + gap) + (columnWidth - imageWidth) / 2, y, width: imageWidth, height: imageHeight };
      });
      const rawHeight = Math.max(...columnHeights) - gap;
      const scale = Math.min(1, height / Math.max(1, rawHeight));
      const offsetX = 2 + (width - width * scale) / 2;
      const offsetY = 2 + (height - rawHeight * scale) / 2;
      return { grid: rawGrid.map(entry => ({ ...entry, x: offsetX + entry.x * scale, y: offsetY + entry.y * scale, width: entry.width * scale, height: entry.height * scale })) };
    }
    const columnOptions = kind === 'icons'
      ? [Math.min(columns ?? 3, items.length)]
      : columns ? [Math.min(columns, items.length)] : [...new Set([2, 3, 4].map(count => Math.min(count, items.length)))];
    const candidates = columnOptions.map(count => {
      const columnWidth = Math.max(1, (width - gap * (count - 1)) / count);
      const columnHeights = new Array<number>(count).fill(0);
      const rawGrid = items.map((item, index) => {
        const column = columnHeights.indexOf(Math.min(...columnHeights));
        const ratio = ratioFor(item);
        const imageHeight = columnWidth / ratio;
        const y = columnHeights[column];
        columnHeights[column] += imageHeight + gap;
        return { item, index, x: column * (columnWidth + gap), y, width: columnWidth, height: imageHeight };
      });
      const rawHeight = Math.max(...columnHeights) - gap;
      const scale = Math.min(1, height / Math.max(1, rawHeight));
      const offsetX = 2 + (width - width * scale) / 2;
      const offsetY = 2 + (height - rawHeight * scale) / 2;
      return {
        effectiveWidth: columnWidth * scale,
        grid: rawGrid.map(entry => ({ ...entry, x: offsetX + entry.x * scale, y: offsetY + entry.y * scale, width: entry.width * scale, height: entry.height * scale })),
      };
    });
    return candidates.reduce((best, candidate) => candidate.effectiveWidth > best.effectiveWidth ? candidate : best);
  }, [items, kind, ratios, size, columns, documentLayout]);

  const activeEntry = enabled ? layout.grid.find(entry => entry.item.id === (hoveredId || focusedId)) : undefined;
  const tooltipWidth = Math.max(1, Math.min(220, size.width - 8));
  const tooltipX = activeEntry ? Math.max(4, Math.min(size.width - tooltipWidth - 4, activeEntry.x + activeEntry.width / 2 - tooltipWidth / 2)) : 4;
  const tooltipY = activeEntry ? Math.max(4, Math.min(size.height - tooltipHeight - 4,
    activeEntry.y >= tooltipHeight + 10 ? activeEntry.y - tooltipHeight - 6 : activeEntry.y + activeEntry.height + 6)) : 4;

  const positionPointerTooltip = useCallback((point?: { clientX: number; clientY: number }) => {
    if (point) pointerRef.current = point;
    if (tooltipFrameRef.current) return;
    tooltipFrameRef.current = requestAnimationFrame(() => {
      tooltipFrameRef.current = 0;
      const container = containerRef.current;
      const tooltip = tooltipRef.current;
      const pointer = pointerRef.current;
      if (!container || !tooltip || !pointer || tooltip.dataset.visible !== 'true') return;
      const bounds = container.getBoundingClientRect();
      const x = (pointer.clientX - bounds.left) * container.clientWidth / Math.max(1, bounds.width);
      const y = (pointer.clientY - bounds.top) * container.clientHeight / Math.max(1, bounds.height);
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      const left = Math.max(4, Math.min(container.clientWidth - tooltipWidth - 4, x + 10));
      const below = y + 14;
      const top = Math.max(4, Math.min(container.clientHeight - tooltipHeight - 4,
        below + tooltipHeight <= container.clientHeight - 4 ? below : y - tooltipHeight - 10));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });
  }, []);

  useLayoutEffect(() => {
    if (!activeEntry) return;
    if (hoveredId && pointerRef.current) positionPointerTooltip();
    else if (tooltipRef.current) {
      tooltipRef.current.style.left = `${tooltipX}px`;
      tooltipRef.current.style.top = `${tooltipY}px`;
    }
  }, [activeEntry, hoveredId, tooltipHeight, tooltipX, tooltipY, positionPointerTooltip]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !layout.grid.length) return;
    if (!visible) {
      enteredRef.current.clear();
      gsap.killTweensOf(list.querySelectorAll('.skill-masonry-gallery__item'));
      layout.grid.forEach(entry => {
        const element = itemRefs.current.get(entry.item.id);
        if (element) gsap.set(element, { x: entry.x, y: entry.y, width: entry.width, height: entry.height, opacity: 0 });
      });
      return;
    }
    const moved = placedLayoutRef.current !== layout;
    if (reducedMotion) {
      const images = list.querySelectorAll('.skill-masonry-gallery__image');
      gsap.killTweensOf(images);
      if (images.length) gsap.set(images, { scale: 1, rotationX: 0, rotationY: 0 });
      const loadedImages = list.querySelectorAll('.skill-masonry-gallery__image img[data-loaded]');
      gsap.killTweensOf(loadedImages);
      if (loadedImages.length) gsap.set(loadedImages, { opacity: 1 });
    }
    layout.grid.forEach((entry, index) => {
      const element = itemRefs.current.get(entry.item.id);
      if (!element) return;
      const destination = { x: entry.x, y: entry.y, width: entry.width, height: entry.height, opacity: 1, filter: 'blur(0px)' };
      const firstAppearance = !enteredRef.current.has(entry.item.id);
      // Loading and the chapter reveal can finish in either order. Reserve
      // each slot now, but animate only when its image can actually be seen.
      if (firstAppearance && !loadedIds.has(entry.item.id)) {
        gsap.set(element, { ...destination, opacity: 0 });
        return;
      }
      if (!reducedMotion && firstAppearance) {
        gsap.fromTo(element, { ...destination, y: entry.y + 18, opacity: 0, filter: 'blur(10px)' }, {
          ...destination, duration: 0.55, delay: index * 0.045, ease: 'power3.out',
          overwrite: 'auto', onComplete: () => { gsap.set(element, { clearProps: 'willChange' }); },
        });
      } else if (!reducedMotion && moved) {
        gsap.to(element, { ...destination, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
      } else if (reducedMotion && firstAppearance) {
        gsap.fromTo(element, { ...destination, opacity: 0 }, { ...destination, duration: .16, overwrite: 'auto' });
      } else if (reducedMotion) {
        gsap.killTweensOf(element);
        gsap.set(element, destination);
      }
      enteredRef.current.add(entry.item.id);
    });
    placedLayoutRef.current = layout;
    // Do not cancel siblings' entrance tweens when another image finishes
    // loading. Explicit targets are cleaned up when this gallery unmounts.
  }, [layout, reducedMotion, visible, loadedIds]);

  useEffect(() => {
    if (!enabled && listRef.current) {
      const images = listRef.current.querySelectorAll('.skill-masonry-gallery__image');
      gsap.killTweensOf(images);
      if (images.length) gsap.set(images, { scale: 1, rotationX: 0, rotationY: 0 });
    }
  }, [enabled]);

  useEffect(() => {
    const list = listRef.current;
    return () => {
      if (tooltipFrameRef.current) cancelAnimationFrame(tooltipFrameRef.current);
      tooltipFrameRef.current = 0;
      pointerRef.current = null;
      if (list) gsap.killTweensOf(list.querySelectorAll('.skill-masonry-gallery__item, .skill-masonry-gallery__image, .skill-masonry-gallery__image img'));
    };
  }, [items]);

  const hover = (element: HTMLElement, entering: boolean, point?: { clientX: number; clientY: number }) => {
    const image = element.querySelector('.skill-masonry-gallery__image');
    if (!image || !enabled) return;
    const box = element.getBoundingClientRect();
    const x = point ? Math.max(-1, Math.min(1, (point.clientX - box.left) / box.width * 2 - 1)) : 0;
    const y = point ? Math.max(-1, Math.min(1, (point.clientY - box.top) / box.height * 2 - 1)) : 0;
    gsap.to(image, { scale: entering ? reducedMotion ? 1.015 : 1.035 : 1,
      rotationX: entering && !reducedMotion ? -y * 3 : 0, rotationY: entering && !reducedMotion ? x * 4 : 0,
      transformPerspective: 650, duration: reducedMotion ? .12 : .22, ease: 'power2.out', overwrite: 'auto' });
  };

  const hideMouseTooltip = () => {
    pointerRef.current = null;
    setHoveredId(null);
    setFocusedId(null);
  };

  return (
    <div
      ref={containerRef}
      className={`skill-masonry-gallery skill-masonry-gallery--${kind}`}
      data-enabled={enabled}
      aria-label="技能素材瀑布流"
    >
      <div ref={listRef} className="skill-masonry-gallery__list">
        {layout.grid.map(({ item, index }) => {
          const image = (
            <>
              <span className="skill-masonry-gallery__image">
                <img
                  src={kind === 'documents' ? item.src : item.thumbnailSrc || item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onLoad={event => {
                    const loaded = event.currentTarget;
                    loaded.dataset.loaded = 'true';
                    setLoadedIds(previous => previous.has(item.id) ? previous : new Set(previous).add(item.id));
                    if (item.aspectRatio && Number.isFinite(item.aspectRatio) && item.aspectRatio > 0) return;
                    const ratio = loaded.naturalWidth / loaded.naturalHeight;
                    if (Number.isFinite(ratio) && ratio > 0) setRatios(previous => Math.abs((previous[item.id] || 0) - ratio) < 0.001 ? previous : { ...previous, [item.id]: ratio });
                  }}
                  onError={event => {
                    event.currentTarget.dataset.loaded = 'true';
                    setLoadedIds(previous => previous.has(item.id) ? previous : new Set(previous).add(item.id));
                  }}
                />
              </span>
            </>
          );
          const shared = {
            className: 'skill-masonry-gallery__item',
            'data-key': item.id,
            ref: (element: HTMLElement | null) => {
              if (element) itemRefs.current.set(item.id, element);
              else itemRefs.current.delete(item.id);
            },
            onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
              if (enabled) { positionPointerTooltip({ clientX: event.clientX, clientY: event.clientY }); setHoveredId(item.id); }
              hover(event.currentTarget, true, event);
            },
            onMouseMove: (event: React.MouseEvent<HTMLElement>) => {
              if (enabled && hoveredId === item.id) {
                positionPointerTooltip({ clientX: event.clientX, clientY: event.clientY });
                hover(event.currentTarget, true, event);
              }
            },
            onMouseLeave: (event: React.MouseEvent<HTMLElement>) => { pointerRef.current = null; setHoveredId(null); hover(event.currentTarget, false); },
            onFocus: (event: React.FocusEvent<HTMLElement>) => {
              if (enabled && event.currentTarget.matches(':focus-visible')) { pointerRef.current = null; setHoveredId(null); setFocusedId(item.id); }
              hover(event.currentTarget, true);
            },
            onBlur: (event: React.FocusEvent<HTMLElement>) => { setFocusedId(null); hover(event.currentTarget, false); },
          };
          return kind === 'documents' ? (
            <button
              key={item.id}
              {...shared}
              type="button"
              disabled={!enabled}
              aria-label={`放大${item.label}${item.description ? `，${item.description}` : ''}`}
              onClick={event => { if (event.detail > 0) hideMouseTooltip(); if (enabled) onSelect?.(index, event.currentTarget); }}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); }}
            >{image}</button>
          ) : <div key={item.id} {...shared} tabIndex={enabled ? 0 : -1} aria-disabled={!enabled} role="img" aria-label={`${item.label}${item.description ? `，${item.description}` : ''}`} onClick={event => { if (event.detail > 0) hideMouseTooltip(); }}>{image}</div>;
        })}
      </div>
      <div
        ref={tooltipRef}
        className="skill-masonry-gallery__note"
        data-visible={Boolean(activeEntry)}
        style={{ left: tooltipX, top: tooltipY, width: tooltipWidth }}
        aria-hidden="true"
      >
        <span className="skill-masonry-gallery__note-label">{activeEntry?.item.label}</span>
        {activeEntry?.item.description && <span className="skill-masonry-gallery__note-description">{activeEntry.item.description}</span>}
      </div>
      {!items.length && <p className="skill-masonry-gallery__empty">暂无素材</p>}
    </div>
  );
}
