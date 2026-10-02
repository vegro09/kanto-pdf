import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { MergeInputFile } from '../../services/mergeEngine';
import { Trash2, ArrowLeft, ArrowRight, FileText, Move } from 'lucide-react';

interface MergeFileCardProps {
  fileItem: MergeInputFile;
  index: number;
  totalCount: number;
  onRemove: (index: number) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export const MergeFileCard: React.FC<MergeFileCardProps> = ({
  fileItem,
  index,
  totalCount,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const renderFirstPage = async () => {
      if (!fileItem.arrayBuffer || !canvasRef.current) return;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(fileItem.arrayBuffer.slice(0)),
        });
        const doc = await loadingTask.promise;
        if (isCancelled) {
          doc.destroy();
          return;
        }

        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.35 });
        const canvas = canvasRef.current;

        if (canvas && !isCancelled) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
            if (!isCancelled) {
              setHasRendered(true);
            }
          }
        }
        doc.destroy();
      } catch (err) {
        console.warn('Page thumbnail render fallback:', err);
      }
    };

    renderFirstPage();

    return () => {
      isCancelled = true;
    };
  }, [fileItem]);

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={e => onDrop(e, index)}
      className="group relative flex flex-col justify-between p-4 rounded-xl border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#0D0D0D] dark:hover:border-white shadow-sm transition-all duration-250 ease-apple cursor-grab active:cursor-grabbing select-none"
    >
      {/* Header: File Order Index & Controls */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#C7C9CC]/40 dark:border-[#262626] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Move size={13} className="text-[#5A5D61] opacity-60 group-hover:opacity-100 transition-opacity" />
          <span>#{index + 1}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveLeft(index)}
            title="Move Earlier"
            aria-label="Move Earlier in Merge Order"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowLeft size={12} className="rtl:rotate-180" />
          </button>

          <button
            type="button"
            disabled={index === totalCount - 1}
            onClick={() => onMoveRight(index)}
            title="Move Later"
            aria-label="Move Later in Merge Order"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowRight size={12} className="rtl:rotate-180" />
          </button>

          <button
            type="button"
            onClick={() => onRemove(index)}
            title="Remove File"
            aria-label="Remove File from Merge Batch"
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Real Page 1 Rendered Canvas Thumbnail */}
      <div className="flex items-center justify-center p-3 my-2.5 bg-[#F5F0E6]/50 dark:bg-[#0D0D0D] rounded-lg border border-[#C7C9CC]/40 dark:border-[#262626] min-h-[170px] overflow-hidden">
        <div className="relative max-w-[125px] max-h-[160px] shadow-sm rounded border border-[#C7C9CC] dark:border-[#333333] overflow-hidden flex items-center justify-center bg-white dark:bg-[#1F1F1F]">
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full block ${hasRendered ? 'opacity-100' : 'hidden'}`}
          />

          {!hasRendered && (
            <div className="w-24 h-32 p-3 flex flex-col justify-between items-center text-center">
              <FileText size={28} className="text-[#0D0D0D]/40 dark:text-[#F5F0E6]/40 mt-4" />
              <span className="text-[9px] font-mono text-[#5A5D61] dark:text-[#A0A2A6]">
                Rendering...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info: Filename & Page Count */}
      <div className="pt-1.5 space-y-1">
        <div className="font-bold text-xs text-[#0D0D0D] dark:text-[#F5F0E6] truncate" title={fileItem.name}>
          {fileItem.name}
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
          <span className="font-semibold">{fileItem.pageCount} {fileItem.pageCount === 1 ? 'page' : 'pages'}</span>
          <span>{(fileItem.size / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
};
