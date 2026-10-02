import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw, ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react';
import { renderPageToCanvas, RenderHandle } from '../../services/pdfDocumentCache';

interface PageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPageNumber: number;
  totalPages: number;
  fileKey: string;
  arrayBuffer?: ArrayBuffer;
  rotations?: Record<number, number>;
  onRotatePage?: (pageNumber: number, deg: number) => void;
  isArabic?: boolean;
}

export const PageDetailModal: React.FC<PageDetailModalProps> = ({
  isOpen,
  onClose,
  initialPageNumber,
  totalPages,
  fileKey,
  arrayBuffer,
  rotations = {},
  onRotatePage,
  isArabic = false,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPageNumber);
  const [zoomScale, setZoomScale] = useState<number>(2.2);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRenderHandleRef = useRef<RenderHandle | null>(null);

  // Sync initial page
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(initialPageNumber);
    }
  }, [isOpen, initialPageNumber]);

  // Page rotation
  const pageRotation = rotations[currentPage] || 0;

  // Render high-res single page
  const renderCurrentPage = useCallback(() => {
    if (!canvasRef.current || !isOpen || !arrayBuffer) return;

    if (activeRenderHandleRef.current) {
      activeRenderHandleRef.current.cancel();
      activeRenderHandleRef.current = null;
    }

    setIsLoading(true);

    const handle = renderPageToCanvas({
      key: fileKey,
      arrayBuffer: arrayBuffer.slice(0),
      pageNumber: currentPage,
      canvas: canvasRef.current,
      scale: zoomScale,
      rotation: pageRotation,
    });

    activeRenderHandleRef.current = handle;

    handle.promise.then(success => {
      if (success) {
        setIsLoading(false);
      }
    });
  }, [fileKey, arrayBuffer, currentPage, zoomScale, pageRotation, isOpen]);

  useEffect(() => {
    if (isOpen) {
      renderCurrentPage();
    }

    return () => {
      if (activeRenderHandleRef.current) {
        activeRenderHandleRef.current.cancel();
        activeRenderHandleRef.current = null;
      }
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [isOpen, renderCurrentPage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(totalPages, p + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalPages, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#141414] rounded-2xl shadow-2xl border border-[#C7C9CC] dark:border-[#262626] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#C7C9CC]/50 dark:border-[#262626] bg-[#F5F0E6]/50 dark:bg-[#1A1A1A]">
          {/* Left / Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              aria-label="Previous Page"
              className="p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] font-mono px-2">
              {isArabic ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              aria-label="Next Page"
              className="p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Center Tools: Zoom & Rotate */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomScale(s => Math.max(1.2, Number((s - 0.4).toFixed(1))))}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white hover:bg-[#0D0D0D] hover:text-white transition-colors text-xs"
            >
              <ZoomOut size={15} />
            </button>

            <span className="text-[11px] font-mono font-bold text-[#5A5D61] dark:text-[#A0A2A6] px-1">
              {Math.round(zoomScale * 50)}%
            </span>

            <button
              type="button"
              onClick={() => setZoomScale(s => Math.min(3.2, Number((s + 0.4).toFixed(1))))}
              title="Zoom In"
              aria-label="Zoom In"
              className="p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white hover:bg-[#0D0D0D] hover:text-white transition-colors text-xs"
            >
              <ZoomIn size={15} />
            </button>

            <button
              type="button"
              onClick={() => setZoomScale(2.2)}
              title="Reset Zoom"
              aria-label="Reset Zoom"
              className="p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white hover:bg-[#0D0D0D] hover:text-white transition-colors"
            >
              <Maximize2 size={14} />
            </button>

            {onRotatePage && (
              <button
                type="button"
                onClick={() => onRotatePage(currentPage, 90)}
                title={isArabic ? 'تدوير الصفحة +90°' : 'Rotate Page +90°'}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white hover:bg-[#0D0D0D] hover:text-white transition-colors text-xs font-semibold ml-2"
              >
                <RotateCw size={14} />
                <span>+90°</span>
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close high-res preview"
            className="p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#222222] text-[#0D0D0D] dark:text-white hover:bg-[#0D0D0D] hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body / High-Res Viewport */}
        <div className="relative flex-1 overflow-auto p-6 flex items-center justify-center bg-[#F5F0E6]/30 dark:bg-[#0A0A0A] min-h-[420px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#C7C9CC] dark:border-[#333333] shadow-lg text-xs font-semibold text-[#0D0D0D] dark:text-white">
                <Loader2 size={16} className="animate-spin text-[#0D0D0D] dark:text-white" />
                <span>{isArabic ? 'جاري العرض بدقة فائقة...' : 'Rendering high-res preview...'}</span>
              </div>
            </div>
          )}

          <div className="shadow-2xl rounded-lg overflow-hidden border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1A1A1A] max-w-full">
            <canvas ref={canvasRef} className="max-w-full h-auto block" />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-[#C7C9CC]/50 dark:border-[#262626] bg-[#F5F0E6]/30 dark:bg-[#141414] text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
          <span>
            {isArabic
              ? 'عرض فائق الدقة (On-Demand High-Res) • استهلاك الذاكرة صفر بعد الإغلاق'
              : 'On-Demand High-Res Engine (scale: 2.2x) • Zero persistent RAM footprint'}
          </span>
          <span className="font-mono">
            {isArabic ? 'استخدم الأسهم ◄ ► أو Esc' : 'Use ◄ ► arrows or Esc'}
          </span>
        </div>
      </div>
    </div>
  );
};
