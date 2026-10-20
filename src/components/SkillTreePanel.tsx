import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { studioSkillFolders } from '../data/studioSkillFolders';
import SkillDocumentViewer from './SkillDocumentViewer';
import './SkillTreePanel.css';

const FolderFloat = lazy(() => import('./FolderFloat'));
const SkillMasonryGallery = lazy(() => import('./SkillMasonryGallery'));
const folderPreviews = Object.fromEntries(studioSkillFolders.map(folder => [folder.id,
  folder.items.slice(0, 3).map(item => ({ label: item.label, value: item.id, src: item.thumbnailSrc || item.src, alt: item.alt }))]));
const compactPreviews = Object.fromEntries(Object.entries(folderPreviews).map(([id, items]) => [id, items.slice(0, 2)]));

export default function SkillTreePanel() {
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(studioSkillFolders[0].id);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [width, setWidth] = useState(() => innerWidth <= 760 ? innerWidth - 96 : Math.min(innerWidth * .30, 520));
  const folder = studioSkillFolders.find(item => item.id === selectedId);

  useLayoutEffect(() => {
    const node = panel.current;
    if (!node) return;
    const measure = () => setWidth(Math.round(node.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let connected = true;
    const synchronize = () => {
      if (!connected) return;
      const sceneActive = panel.current?.closest<HTMLElement>('[data-studio-cue]')?.dataset.studioActive === 'true';
      const enabled = sceneActive && document.documentElement.dataset.studioPlaying !== 'true';
      if (sceneActive) setGalleryReady(true);
      setActive(enabled);
      if (!enabled) setZoomIndex(null);
    };
    const reset = () => { setSelectedId(studioSkillFolders[0].id); setZoomIndex(null); };
    queueMicrotask(synchronize);
    window.addEventListener('studiochapterchange', synchronize);
    window.addEventListener('studioreset', reset);
    return () => {
      connected = false;
      window.removeEventListener('studiochapterchange', synchronize);
      window.removeEventListener('studioreset', reset);
    };
  }, []);

  const selectFolder = (id: string) => { setSelectedId(id); setZoomIndex(null); };

  return <div ref={panel} className="skill-folders" data-folder={selectedId ?? 'none'} data-zoomed={zoomIndex !== null || undefined}>
    <section className="skill-folders__contents" aria-label={folder ? `${folder.title}内容` : '选择技能文件夹'}>
      {folder ? <>
        <header className="skill-folders__contents-head">
          <h3>{folder.title}</h3>
          <button type="button" aria-label="收起文件夹内容" onClick={() => setSelectedId(null)}><X size={15} strokeWidth={1.5} /></button>
        </header>
        {galleryReady ? <Suspense fallback={<div className="skill-folders__empty">正在展开收藏…</div>}>
          <SkillMasonryGallery key={folder.id} items={folder.items} kind={folder.kind}
            columns={folder.id === 'software' || folder.id === 'bim' ? 4 : 3}
            layout={folder.id === 'projects' ? 'projects' : folder.id === 'bim' ? 'bim' : undefined}
            enabled={active && zoomIndex === null}
            visible={active}
            onSelect={folder.kind === 'documents' ? (index, trigger) => {
              returnFocus.current = trigger;
              setZoomIndex(index);
            } : undefined} />
        </Suspense> : <div className="skill-folders__empty" aria-hidden="true" />}
      </> : <p className="skill-folders__empty">选择下方文件夹，展开我的技能收藏。</p>}
    </section>
    <div className="skill-folders__board" aria-label="技能文件夹">
      {studioSkillFolders.map((item, index) => {
        const cellWidth = width / (index < 2 ? 2 : 3);
        const compactIcons = width < 340 && index >= 2;
        const previews = compactIcons ? compactPreviews[item.id] : folderPreviews[item.id];
        const sizeScale = width < 340 ? .95 : .85;
        const folderWidth = Math.min(index < 2 ? 154 : 128, cellWidth * (index < 2 ? .64 : .75)) * sizeScale;
        const folderHeight = folderWidth * .69;
        const itemSize = compactIcons ? Math.max(18, Math.min(28, (cellWidth - 44) / 2))
          : Math.max(18, Math.min(46, (cellWidth - 56) / 3));
        const spread = (previews.length * itemSize + (previews.length - 1) * 12) / 2 + 1;
        return <div key={item.id} className="skill-folders__slot" data-folder-id={item.id}>
        <span className="skill-folders__serial" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <Suspense fallback={<div className="skill-folders__loading">{item.title}</div>}>
          <FolderFloat
            label={item.title} sublabel={`${item.items.length} ${item.kind === 'documents' ? '份资料' : '个技能'}`}
            items={previews}
            folderColor={item.tone} frontColor={item.tone} labelColor="#fff5e8" paperColor="#efe2cb"
            itemColor="transparent" itemTextColor="#351d12"
            width={folderWidth} height={folderHeight} itemSize={itemSize} radius={10}
            spread={spread} lift={Math.max(20, folderWidth * .21)}
            tilt={7} trigger="hover" closeOnSelect={false}
            selected={selectedId === item.id} enabled={active && zoomIndex === null}
            onClick={() => { if (selectedId === item.id) setSelectedId(null); else selectFolder(item.id); }}
            onSelect={(_, previewIndex) => {
              selectFolder(item.id);
              if (item.kind === 'documents') {
                returnFocus.current = panel.current?.querySelector<HTMLButtonElement>(`[data-folder-id="${item.id}"] .folder-float__trigger`) ?? null;
                setZoomIndex(previewIndex);
              }
            }}
          />
        </Suspense>
      </div>; })}
    </div>
    {folder?.kind === 'documents' && zoomIndex !== null && <SkillDocumentViewer
      key={folder.id} items={folder.items} index={zoomIndex} onChange={setZoomIndex}
      anchor={panel} returnFocus={returnFocus} onClose={() => setZoomIndex(null)} />}
  </div>;
}
