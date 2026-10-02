import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Binary } from 'lucide-react';
import { PageNumberPosition, PageNumberFormat } from '../../services/pageNumbersEngine';

interface PageNumbersWorkspaceProps {
  position: PageNumberPosition;
  format: PageNumberFormat;
  fontSize: number;
  margin: number;
  excludeFirstPage: boolean;
  startNumber: number;
  totalPages: number;
}

export const PageNumbersWorkspace: React.FC<PageNumbersWorkspaceProps> = ({
  position,
  format,
  fontSize,
  margin,
  excludeFirstPage,
  startNumber,
  totalPages,
}) => {
  const { lang, uploadedFiles } = useApp();
  const isAr = lang === 'ar';
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({
    width: 595.28,
    height: 841.89,
  });
  const [hasRendered, setHasRendered] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerScale, setContainerScale] = useState<number>(1);

  const activeFile = uploadedFiles[0];

  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!activeFile?.arrayBuffer || !canvasRef.current) return;

      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(activeFile.arrayBuffer.slice(0)),
        });
        const doc = await loadingTask.promise;
        if (isCancelled) {
          doc.destroy();
          return;
        }

        const pageNum = Math.min(Math.max(1, currentPageIndex + 1), doc.numPages);
        const page = await doc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        setPdfDimensions({
          width: unscaledViewport.width,
          height: unscaledViewport.height,
        });

        // Compute fit scale
        const availableWidth = containerRef.current
          ? Math.min(containerRef.current.clientWidth - 48, 650)
          : 560;
        const scale = Math.max(0.4, Math.min(1.2, availableWidth / unscaledViewport.width));
        setContainerScale(scale);

        const viewport = page.getViewport({ scale });
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
        console.warn('Page numbers preview render error:', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [activeFile, currentPageIndex]);

  const currentNum = currentPageIndex + startNumber;
  let formattedText = `${currentNum}`;
  if (isAr) {
    if (format === 'page_x_of_y') formattedText = `صفحة ${currentNum} من ${totalPages}`;
    else if (format === 'x_of_y') formattedText = `${currentNum} من ${totalPages}`;
    else if (format === 'page_x') formattedText = `صفحة ${currentNum}`;
  } else {
    if (format === 'page_x_of_y') formattedText = `Page ${currentNum} of ${totalPages}`;
    else if (format === 'x_of_y') formattedText = `${currentNum} of ${totalPages}`;
    else if (format === 'page_x') formattedText = `Page ${currentNum}`;
  }

  const isExcludedOnThisPage = excludeFirstPage && currentPageIndex === 0;

  // Compute live CSS positioning for preview badge
  const marginScaled = margin * containerScale;

  let positionStyles: React.CSSProperties = {
    position: 'absolute',
    transform: 'none',
  };

  if (position === 'bottom-center') {
    positionStyles = {
      position: 'absolute',
      bottom: `${marginScaled}px`,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  } else if (position === 'bottom-left') {
    positionStyles = {
      position: 'absolute',
      bottom: `${marginScaled}px`,
      left: `${marginScaled}px`,
    };
  } else if (position === 'bottom-right') {
    positionStyles = {
      position: 'absolute',
      bottom: `${marginScaled}px`,
      right: `${marginScaled}px`,
    };
  } else if (position === 'top-center') {
    positionStyles = {
      position: 'absolute',
      top: `${marginScaled}px`,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  } else if (position === 'top-left') {
    positionStyles = {
      position: 'absolute',
      top: `${marginScaled}px`,
      left: `${marginScaled}px`,
    };
  } else if (position === 'top-right') {
    positionStyles = {
      position: 'absolute',
      top: `${marginScaled}px`,
      right: `${marginScaled}px`,
    };
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Top Pagination & Dimension Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] text-xs">
        <div className="flex items-center gap-2">
          <Binary size={15} className="text-[#0D0D0D] dark:text-[#F5F0E6]" />
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'معاينة الترقيم الديناميكي المباشر:' : 'Live Dynamic Numbering Preview:'}
          </span>
          <span className="font-mono text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {pdfDimensions.width.toFixed(0)} × {pdfDimensions.height.toFixed(0)} pt
          </span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/60 dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white transition-colors"
          >
            <ChevronLeft size={14} className="rtl:rotate-180" />
          </button>

          <span className="text-xs font-bold font-mono px-2 text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? `صفحة ${currentPageIndex + 1} من ${totalPages}` : `Page ${currentPageIndex + 1} of ${totalPages}`}
          </span>

          <button
            type="button"
            disabled={currentPageIndex >= totalPages - 1}
            onClick={() => setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/60 dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white transition-colors"
          >
            <ChevronRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* 2-Layer Interactive WYSIWYG Stamping Canvas */}
      <div className="flex items-center justify-center p-6 bg-[#F5F0E6]/40 dark:bg-[#0D0D0D] rounded-2xl border border-[#C7C9CC]/80 dark:border-[#262626] min-h-[460px]">
        <div className="relative shadow-lg rounded-lg border border-[#C7C9CC] dark:border-[#333333] overflow-hidden bg-white dark:bg-[#141414]">
          {/* Layer 1: PDF Canvas */}
          <canvas ref={canvasRef} className="block max-w-full" />

          {/* Layer 2: Floating Live Number Stamp Overlay */}
          {!isExcludedOnThisPage && hasRendered && (
            <div
              style={positionStyles}
              className="pointer-events-none select-none transition-all duration-200"
            >
              <div
                style={{ fontSize: `${fontSize * containerScale}px` }}
                className="px-2 py-0.5 rounded font-mono font-bold text-[#1F1F1F] dark:text-[#E8DFC8] bg-white/70 dark:bg-[#0D0D0D]/70 border border-[#0D0D0D]/20 dark:border-white/20 shadow-xs backdrop-blur-xs whitespace-nowrap"
              >
                {formattedText}
              </div>
            </div>
          )}

          {isExcludedOnThisPage && (
            <div className="absolute inset-0 bg-[#0D0D0D]/20 flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-[#0D0D0D] text-white text-xs font-bold shadow-md">
                {isAr ? 'تم استثناء صفحة الغلاف من الترقيم' : 'Cover page excluded from numbering'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
