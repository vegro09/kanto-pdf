import React, { useRef, useEffect, useState } from 'react';
import { PdfPageItem } from '../../types/tools';
import { useApp } from '../../context/AppContext';
import { renderPageToCanvas } from '../../services/pdfDocumentCache';
import { RotateCw, Trash2, RotateCcw, Move, FileText, Maximize2 } from 'lucide-react';

interface PageThumbnailProps {
  page: PdfPageItem;
  index: number;
  splitGroup?: { index: number; label: string; startPage: number; endPage: number };
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onPreview?: (pageNumber: number) => void;
}

export const PageThumbnail: React.FC<PageThumbnailProps> = ({
  page,
  index,
  splitGroup,
  onDragStart,
  onDragOver,
  onDrop,
  onPreview,
}) => {
  const { t, rotatePage, deletePage, restorePage, uploadedFiles, selectedTool, actionParams } = useApp();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasRenderedCanvas, setHasRenderedCanvas] = useState(false);

  const fileItem = uploadedFiles[page.sourceFileIndex || 0];

  useEffect(() => {
    if (!fileItem?.arrayBuffer || !canvasRef.current) return;

    const fileKey = `${fileItem.name || 'file'}_${page.sourceFileIndex || 0}`;
    const handle = renderPageToCanvas({
      key: fileKey,
      arrayBuffer: fileItem.arrayBuffer.slice(0),
      pageNumber: page.originalIndex + 1,
      canvas: canvasRef.current,
      scale: 0.28,
    });

    handle.promise.then(success => {
      if (success) {
        setHasRenderedCanvas(true);
      }
    });

    return () => {
      handle.cancel();
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [fileItem, page.originalIndex, page.sourceFileIndex]);

  // Group styles derived from Kanto 4-color palette
  const groupBadgeColors = [
    'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-[#0D0D0D]',
    'bg-[#3D2B1F] text-white dark:bg-[#E8DFC8] dark:text-[#3D2B1F] border-[#3D2B1F]',
    'bg-[#2D4A35] text-white dark:bg-[#8AAB7E] dark:text-[#2D4A35] border-[#2D4A35]',
    'bg-[#5A5D61] text-white dark:bg-[#C7C9CC] dark:text-[#0D0D0D] border-[#5A5D61]',
  ];

  const groupCardBorders = [
    'border-[#0D0D0D] dark:border-white shadow-sm ring-1 ring-[#0D0D0D]/10',
    'border-[#3D2B1F] dark:border-[#E8DFC8] shadow-sm ring-1 ring-[#3D2B1F]/10',
    'border-[#2D4A35] dark:border-[#8AAB7E] shadow-sm ring-1 ring-[#2D4A35]/10',
    'border-[#5A5D61] dark:border-[#C7C9CC] shadow-sm ring-1 ring-[#5A5D61]/10',
  ];

  const currentGroupColor = splitGroup ? groupBadgeColors[splitGroup.index % groupBadgeColors.length] : '';
  const currentGroupBorder = splitGroup ? groupCardBorders[splitGroup.index % groupCardBorders.length] : 'border-[#C7C9CC] dark:border-[#262626]';

  return (
    <div
      draggable={!page.isDeleted}
      onDragStart={e => onDragStart && onDragStart(e, index)}
      onDragOver={e => onDragOver && onDragOver(e, index)}
      onDrop={e => onDrop && onDrop(e, index)}
      className={`group relative flex flex-col justify-between p-3.5 rounded-lg border transition-all duration-250 ease-apple select-none ${
        page.isDeleted
          ? 'bg-[#F5F0E6]/40 dark:bg-[#1A1A1A] border-dashed border-[#C7C9CC] opacity-50'
          : `bg-white dark:bg-[#141414] ${currentGroupBorder} hover:border-[#0D0D0D] dark:hover:border-white cursor-grab active:cursor-grabbing`
      }`}
    >
      {/* Top Bar with Page Number, Split Group Badge, and Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-[#C7C9CC]/40 dark:border-[#262626] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Move size={12} className="opacity-40 group-hover:opacity-100 transition-opacity duration-250 ease-apple" />
          <span>{t.page_label} {page.pageNumber}</span>
        </div>

        {splitGroup && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentGroupColor} flex items-center gap-1`}>
            <FileText size={10} />
            <span>Part {splitGroup.index + 1}</span>
          </span>
        )}

        <div className="flex items-center gap-1">
          {!page.isDeleted ? (
            <>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  rotatePage(page.pageNumber, 90);
                }}
                title={t.rotate_page}
                aria-label={`${t.rotate_page} ${page.pageNumber}`}
                className="p-1 rounded-lg border border-[#C7C9CC] bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors duration-250 ease-apple"
              >
                <RotateCw size={12} />
              </button>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  deletePage(page.pageNumber);
                }}
                title={t.delete_page}
                aria-label={`${t.delete_page} ${page.pageNumber}`}
                className="p-1 rounded-lg border border-[#C7C9CC] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors duration-250 ease-apple"
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                restorePage(page.pageNumber);
              }}
              title="Restore Page"
              aria-label={`Restore page ${page.pageNumber}`}
              className="p-1 rounded-lg border border-[#C7C9CC] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] font-semibold hover:bg-[#0D0D0D] hover:text-white transition-colors duration-250 ease-apple flex items-center gap-1 text-[10px]"
            >
              <RotateCcw size={10} />
              <span>Restore</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Canvas / Paper Sheet */}
      <div
        onClick={() => onPreview && onPreview(page.pageNumber)}
        className={`flex items-center justify-center p-2.5 my-2 bg-[#F5F0E6]/50 dark:bg-[#0D0D0D] rounded-lg border border-[#C7C9CC]/40 dark:border-[#262626] min-h-[160px] overflow-hidden ${onPreview ? 'cursor-pointer hover:bg-[#F5F0E6]/80 dark:hover:bg-[#141414]' : ''}`}
      >
        <div
          style={{ transform: `rotate(${page.rotation}deg)` }}
          className="relative max-w-[110px] max-h-[150px] shadow-sm rounded border border-[#C7C9CC] dark:border-[#333333] overflow-hidden transition-transform duration-250 ease-apple flex items-center justify-center bg-white dark:bg-[#1F1F1F]"
        >
          <canvas
            ref={canvasRef}
            className={`max-w-full max-h-full block ${hasRenderedCanvas ? 'opacity-100' : 'hidden'}`}
          />

          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(page.pageNumber);
              }}
              title="High-Res Preview"
              aria-label={`Preview page ${page.pageNumber}`}
              className="absolute bottom-1 right-1 p-1 rounded bg-black/75 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow"
            >
              <Maximize2 size={11} />
            </button>
          )}

          {/* Vector Sheet Fallback */}
          {!hasRenderedCanvas && (
            <div className="w-24 h-32 p-2.5 flex flex-col justify-between">
              <div>
                <div className="h-1.5 w-1/2 bg-[#0D0D0D]/60 dark:bg-[#F5F0E6]/60 rounded mb-1.5" />
                <div className="space-y-1">
                  <div className="h-1 w-full bg-[#0D0D0D]/20 dark:bg-[#F5F0E6]/20 rounded" />
                  <div className="h-1 w-4/5 bg-[#0D0D0D]/20 dark:bg-[#F5F0E6]/20 rounded" />
                  <div className="h-1 w-3/4 bg-[#0D0D0D]/20 dark:bg-[#F5F0E6]/20 rounded" />
                </div>
              </div>
              <div className="text-[8px] font-mono text-center text-[#5A5D61] opacity-60">
                {page.pageNumber}
              </div>
            </div>
          )}

          {/* Live Signature Overlay for Sign PDF */}
          {selectedTool.key === 'sign' && actionParams.signatureDataUrl && (() => {
            const isTarget =
              (actionParams.signaturePlacementMode === 'all') ||
              (actionParams.signaturePlacementMode === 'last' && page.pageNumber === uploadedFiles[0]?.pageCount) ||
              ((!actionParams.signaturePlacementMode || actionParams.signaturePlacementMode === 'current') &&
                (actionParams.signatureTargetPage || 1) === page.pageNumber);

            if (!isTarget) return null;

            const pos = actionParams.signaturePosition || {
              xPercent: 62,
              yPercent: 78,
              widthPercent: 28,
              heightPercent: 12,
            };

            return (
              <div
                style={{
                  left: `${pos.xPercent}%`,
                  top: `${pos.yPercent}%`,
                  width: `${pos.widthPercent}%`,
                  height: `${pos.heightPercent}%`,
                }}
                className="absolute z-10 pointer-events-none border border-dashed border-[#0D0D0D] dark:border-white bg-[#0D0D0D]/5 dark:bg-white/5 rounded flex items-center justify-center p-0.5 animate-in fade-in zoom-in-95 duration-200"
              >
                <img
                  src={actionParams.signatureDataUrl}
                  alt="Signature"
                  className="w-full h-full object-contain filter drop-shadow-xs"
                />
              </div>
            );
          })()}

          {/* Live Redaction Overlays for Redact PDF */}
          {selectedTool.key === 'redact' && actionParams.redactionBoxes && (
            <>
              {actionParams.redactionBoxes
                .filter(box => box.pageNumber === page.pageNumber)
                .map(box => (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.xPercent}%`,
                      top: `${box.yPercent}%`,
                      width: `${box.widthPercent}%`,
                      height: `${box.heightPercent}%`,
                      backgroundColor: box.color === 'white' ? '#FFFFFF' : '#000000',
                    }}
                    className="absolute z-10 pointer-events-none border border-red-500/80 shadow-xs animate-in fade-in zoom-in-95 duration-150"
                  />
                ))}
            </>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] pt-1">
        <span>{page.rotation > 0 ? `${page.rotation}°` : '0°'}</span>
        {splitGroup && (
          <span className="text-[10px] font-mono text-[#0D0D0D] dark:text-[#F5F0E6] font-semibold">
            {splitGroup.label}
          </span>
        )}
        {page.isDeleted && (
          <span className="text-[#0D0D0D] dark:text-[#F5F0E6] font-bold text-[10px] uppercase">
            Marked For Deletion
          </span>
        )}
      </div>
    </div>
  );
};
