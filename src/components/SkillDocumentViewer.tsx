import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { StudioSkillFolderItem } from '../data/studioSkillFolders';
import './SkillDocumentViewer.css';

function LoadedDocumentImage({ image, closing }: { image: StudioSkillFolderItem; closing: boolean }) {
  const element = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const node = element.current;
    if (!node || closing) return;
    let cancelled = false;
    let decoding = false;
    const reveal = async () => {
      if (decoding || !node.complete || !node.naturalWidth) return;
      decoding = true;
      try { await node.decode(); } catch { /* Older browsers can reject decode for an already loaded image. */ }
      if (!cancelled && node.isConnected && node.complete && node.naturalWidth) setReady(true);
    };
    node.addEventListener('load', reveal);
    // A cached image can finish before the listener is registered.
    if (node.complete) void reveal();
    return () => { cancelled = true; node.removeEventListener('load', reveal); };
  }, [image.src, closing]);

  return <img ref={element} src={image.src} alt={image.alt} className="skill-document-viewer__image"
    data-ready={ready ? '' : undefined} aria-busy={!ready} decoding="async" draggable={false} />;
}

export default function SkillDocumentViewer({ items, index, onChange, onClose, anchor, returnFocus }: {
  items: StudioSkillFolderItem[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
  anchor: RefObject<HTMLDivElement | null>;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [closing, setClosing] = useState(false);
  const image = items[index];
  const step = (amount: number) => onChange((index + amount + items.length) % items.length);

  useEffect(() => {
    const node = dialog.current;
    const area = anchor.current;
    const trigger = returnFocus.current;
    if (!node || !area) return;
    const scrollPosition = { left: window.scrollX, top: window.scrollY };
    const keepPosition = () => {
      if (window.scrollX !== scrollPosition.left || window.scrollY !== scrollPosition.top) {
        window.scrollTo({ ...scrollPosition, behavior: 'auto' });
      }
    };
    const place = () => {
      const box = area.getBoundingClientRect();
      node.style.left = `${box.left}px`;
      node.style.top = `${Math.max(12, box.top)}px`;
      node.style.width = `${box.width}px`;
      node.style.height = `${Math.min(box.height, innerHeight - Math.max(12, box.top) - 12)}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(area);
    window.addEventListener('resize', place);
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const stableGutter = getComputedStyle(document.documentElement).getPropertyValue('scrollbar-gutter').includes('stable');
    if (scrollbarWidth && !stableGutter) document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
    node.showModal();
    closeButton.current?.focus({ preventScroll: true });
    keepPosition();
    window.addEventListener('scroll', keepPosition, { passive: true });
    window.dispatchEvent(new Event('studiomediachange'));
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', keepPosition);
      if (node.open) node.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (trigger?.isConnected && !trigger.closest('[inert]')) trigger.focus({ preventScroll: true });
      keepPosition();
      window.dispatchEvent(new Event('studiomediachange'));
    };
  }, [anchor, returnFocus]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onClose, 240);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);

  return createPortal(<dialog ref={dialog} className="studio-media-dialog skill-document-viewer" data-closing={closing ? '' : undefined}
    aria-label={`${image.label}，放大图片`} onCancel={event => { event.preventDefault(); setClosing(true); }}
    onClick={event => { if (event.target === event.currentTarget) setClosing(true); }}
    onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); event.stopPropagation();
        if (!closing) step(event.key === 'ArrowRight' ? 1 : -1);
      }
    }}>
    <button ref={closeButton} className="skill-document-viewer__close" type="button" aria-label="关闭放大图片" onClick={() => setClosing(true)}><X size={20} strokeWidth={1.5} /></button>
    <div className="skill-document-viewer__stage" onClick={event => { if (event.target === event.currentTarget) setClosing(true); }}>
      <LoadedDocumentImage key={image.id} image={image} closing={closing} />
    </div>
    <nav className="skill-document-viewer__navigation" aria-label="证书图片翻页">
      <button type="button" aria-label="上一张图片" disabled={closing} onClick={() => step(-1)}><ArrowLeft size={18} strokeWidth={1.5} /></button>
      <span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
      <button type="button" aria-label="下一张图片" disabled={closing} onClick={() => step(1)}><ArrowRight size={18} strokeWidth={1.5} /></button>
    </nav>
  </dialog>, document.body);
}
