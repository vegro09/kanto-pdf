import React, { useState } from 'react';
import { OrganizePageItem } from '../../services/organizeEngine';
import { OrganizePageCard } from './OrganizePageCard';
import { VirtualizedPageGrid } from './VirtualizedPageGrid';
import { PageDetailModal } from './PageDetailModal';
import { useApp } from '../../context/AppContext';
import { RotateCw, RefreshCw, Plus, Layers } from 'lucide-react';

interface OrganizePdfWorkspaceProps {
  pages: OrganizePageItem[];
  sourceBuffer?: ArrayBuffer;
  onPagesChange: (newPages: OrganizePageItem[]) => void;
  onResetOriginal: () => void;
}

export const OrganizePdfWorkspace: React.FC<OrganizePdfWorkspaceProps> = ({
  pages,
  sourceBuffer,
  onPagesChange,
  onResetOriginal,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPageNumber, setPreviewPageNumber] = useState(1);

  // 1. Delete Page from State Array
  const handleDelete = (id: string) => {
    if (pages.length <= 1) return;
    const updated = pages.filter(p => p.id !== id);
    onPagesChange(updated);
  };

  // 2. Duplicate Page (Inserts right next to target)
  const handleDuplicate = (index: number) => {
    const target = pages[index];
    if (!target) return;

    const duplicateItem: OrganizePageItem = {
      id: `organize-page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      originalIndex: target.originalIndex,
      rotation: target.rotation || 0,
      isDuplicate: true,
      pageNumber: target.pageNumber,
    };

    const copy = [...pages];
    copy.splice(index + 1, 0, duplicateItem);
    onPagesChange(copy);
  };

  // 3. Rotate Page (+90 deg)
  const handleRotate = (id: string) => {
    const updated = pages.map(p =>
      p.id === id ? { ...p, rotation: ((p.rotation || 0) + 90) % 360 } : p
    );
    onPagesChange(updated);
  };

  // 4. Move Earlier (Left)
  const handleMoveEarlier = (index: number) => {
    if (index <= 0) return;
    const copy = [...pages];
    const [item] = copy.splice(index, 1);
    copy.splice(index - 1, 0, item);
    onPagesChange(copy);
  };

  // 5. Move Later (Right)
  const handleMoveLater = (index: number) => {
    if (index >= pages.length - 1) return;
    const copy = [...pages];
    const [item] = copy.splice(index, 1);
    copy.splice(index + 1, 0, item);
    onPagesChange(copy);
  };

  // 6. Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      const copy = [...pages];
      const [moved] = copy.splice(draggedIdx, 1);
      copy.splice(targetIndex, 0, moved);
      onPagesChange(copy);
    }
    setDraggedIdx(null);
  };

  // 7. Batch Toolbar Actions
  const handleRotateAll = (deg: number = 90) => {
    const updated = pages.map(p => ({
      ...p,
      rotation: ((p.rotation || 0) + deg) % 360,
    }));
    onPagesChange(updated);
  };

  const handleDuplicateLast = () => {
    if (pages.length === 0) return;
    handleDuplicate(pages.length - 1);
  };

  return (
    <div className="space-y-4">
      {/* Interactive Deck Sub-Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] text-xs">
        <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Layers size={15} />
          <span>
            {isAr ? 'ترتيب الصفحات المسحوبة:' : 'Target Output Sequence:'}
          </span>
          <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-[#F5F0E6] dark:bg-[#222222] border border-[#C7C9CC] text-[#0D0D0D] dark:text-white">
            {pages.length} {isAr ? 'صفحة' : 'pages'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleRotateAll(90)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/50 dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] font-semibold hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <RotateCw size={12} />
            <span>{isAr ? 'تدوير الكل +90°' : 'Rotate All +90°'}</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicateLast}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/50 dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] font-semibold hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <Plus size={12} />
            <span>{isAr ? 'تكرار الصفحة الأخيرة' : 'Duplicate Last'}</span>
          </button>

          <button
            type="button"
            onClick={onResetOriginal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1A1A1A] text-[#5A5D61] dark:text-[#A0A2A6] font-semibold hover:text-[#0D0D0D] dark:hover:text-white transition-colors"
          >
            <RefreshCw size={12} />
            <span>{isAr ? 'إعادة الضبط للتسلسل الأصلي' : 'Reset Sequence'}</span>
          </button>
        </div>
      </div>

      {/* Main Drag-and-Drop Page Grid (Virtualized for Enterprise Scale) */}
      <VirtualizedPageGrid
        items={pages}
        estimateRowHeight={270}
        renderItem={(item, idx) => (
          <OrganizePageCard
            key={item.id}
            pageItem={item}
            index={idx}
            totalCount={pages.length}
            sourceFileBuffer={sourceBuffer}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onRotate={handleRotate}
            onMoveEarlier={handleMoveEarlier}
            onMoveLater={handleMoveLater}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onPreview={pageNum => {
              setPreviewPageNumber(pageNum);
              setPreviewModalOpen(true);
            }}
          />
        )}
      />

      {/* On-Demand High-Res Preview Modal */}
      <PageDetailModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        initialPageNumber={previewPageNumber}
        totalPages={pages.length}
        fileKey="organize_source_file"
        arrayBuffer={sourceBuffer}
        rotations={pages.reduce<Record<number, number>>((acc, p) => {
          const num = p.pageNumber || (p.originalIndex + 1);
          acc[num] = p.rotation || 0;
          return acc;
        }, {})}
        onRotatePage={(pageNum) => {
          const target = pages.find(p => p.pageNumber === pageNum) || pages[pageNum - 1];
          if (target) {
            handleRotate(target.id);
          }
        }}
        isArabic={isAr}
      />
    </div>
  );
};
