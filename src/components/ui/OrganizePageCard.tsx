import React, { useRef, useEffect, useState } from 'react';
import { OrganizePageItem } from '../../services/organizeEngine';
import { Trash2, Copy, RotateCw, ArrowLeft, ArrowRight, Move, FileText, Maximize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { renderPageToCanvas } from '../../services/pdfDocumentCache';

interface OrganizePageCardProps {
  pageItem: OrganizePageItem;
  index: number;
  totalCount: number;
  sourceFileBuffer?: ArrayBuffer;
  fileKey?: string;
  onDelete: (id: string) => void;
  onDuplicate: (index: number) => void;
  onRotate: (id: string) => void;
  onMoveEarlier: (index: number) => void;
  onMoveLater: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onPreview?: (pageNumber: number) => void;
}

export const OrganizePageCard: React.FC<OrganizePageCardProps> = ({
  pageItem,
  index,
  totalCount,
  sourceFileBuffer,
  fileKey = 'organize_source_file',
  onDelete,
  onDuplicate,
  onRotate,
  onMoveEarlier,
  onMoveLater,
  onDragStart,
  onDragOver,
  onDrop,
  onPreview,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    if (!sourceFileBuffer || !canvasRef.current) return;

    const pageNum = pageItem.originalIndex + 1;
    const handle = renderPageToCanvas({
      key: fileKey,
      arrayBuffer: sourceFileBuffer.slice(0),
      pageNumber: pageNum,
      canvas: canvasRef.current,
      scale: 0.30,
    });

    handle.promise.then(success => {
      if (success) {
        setHasRendered(true);
      }
    });

    return () => {
      handle.cancel();
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [sourceFileBuffer, pageItem.originalIndex, fileKey]);

  const rotation = ((pageItem.rotation || 0) % 360 + 360) % 360;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={e => onDrop(e, index)}
      className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#0D0D0D] dark:hover:border-white shadow-sm hover:shadow-md transition-all duration-250 ease-apple cursor-grab active:cursor-grabbing select-none"
    >
      {/* Header with Sequence #, Source Label & Card Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-[#C7C9CC]/40 dark:border-[#262626] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Move size={12} className="text-[#5A5D61] opacity-60 group-hover:opacity-100 transition-opacity" />
          <span>#{index + 1}</span>
          {pageItem.isDuplicate && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]">
              {isAr ? 'نسخة مكررة' : 'Copy'}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Move Earlier */}
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveEarlier(index)}
            title={isAr ? 'تحريك للأمام' : 'Move Earlier'}
            aria-label="Move Earlier"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowLeft size={11} className="rtl:rotate-180" />
          </button>

          {/* Move Later */}
          <button
            type="button"
            disabled={index === totalCount - 1}
            onClick={() => onMoveLater(index)}
            title={isAr ? 'تحريك للخلف' : 'Move Later'}
            aria-label="Move Later"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowRight size={11} className="rtl:rotate-180" />
          </button>

          {/* Duplicate Page */}
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            title={isAr ? 'تكرار هذه الصفحة' : 'Duplicate Page'}
            aria-label="Duplicate Page"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <Copy size={11} />
          </button>

          {/* Rotate Page */}
          <button
            type="button"
            onClick={() => onRotate(pageItem.id)}
            title={isAr ? 'تدوير +90°' : 'Rotate +90°'}
            aria-label="Rotate Page"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <RotateCw size={11} />
          </button>

          {/* Delete Page */}
          <button
            type="button"
            disabled={totalCount <= 1}
            onClick={() => onDelete(pageItem.id)}
            title={isAr ? 'حذف الصفحة' : 'Delete Page'}
            aria-label="Delete Page"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#DC2626] hover:text-white dark:hover:bg-[#DC2626] hover:border-[#DC2626] transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Rendered Thumbnail Canvas */}
      <div
        onClick={() => onPreview && onPreview(pageItem.pageNumber || pageItem.originalIndex + 1)}
        className={`flex items-center justify-center p-2.5 my-2 bg-[#F5F0E6]/50 dark:bg-[#0D0D0D] rounded-lg border border-[#C7C9CC]/40 dark:border-[#262626] min-h-[160px] overflow-hidden ${onPreview ? 'cursor-pointer hover:bg-[#F5F0E6]/80 dark:hover:bg-[#141414]' : ''}`}
      >
        <div
          className="relative max-w-[120px] max-h-[150px] shadow-sm rounded border border-[#C7C9CC] dark:border-[#333333] overflow-hidden flex items-center justify-center bg-white dark:bg-[#1F1F1F] transition-transform duration-200"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full block ${hasRendered ? 'opacity-100' : 'hidden'}`}
          />

          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(pageItem.pageNumber || pageItem.originalIndex + 1);
              }}
              title="High-Res Preview"
              aria-label={`Preview page ${pageItem.originalIndex + 1}`}
              className="absolute bottom-1 right-1 p-1 rounded bg-black/75 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow"
            >
              <Maximize2 size={11} />
            </button>
          )}

          {!hasRendered && (
            <div className="w-20 h-28 p-2 flex flex-col justify-between items-center text-center">
              <FileText size={24} className="text-[#0D0D0D]/40 dark:text-[#F5F0E6]/40 mt-3" />
              <span className="text-[8.5px] font-mono text-[#5A5D61] dark:text-[#A0A2A6]">
                Page {pageItem.originalIndex + 1}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-1 text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
        <span className="font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
          {isAr ? `المصدر: صفحة ${pageItem.originalIndex + 1}` : `Source: Page ${pageItem.originalIndex + 1}`}
        </span>
        {rotation > 0 && (
          <span className="font-mono font-bold text-[10px] text-[#0D0D0D] dark:text-[#F5F0E6]">
            +{rotation}°
          </span>
        )}
      </div>
    </div>
  );
};
