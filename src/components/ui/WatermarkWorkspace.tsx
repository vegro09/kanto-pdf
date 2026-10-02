import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface WatermarkWorkspaceProps {
  watermarkText: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  totalPages: number;
}

export const WatermarkWorkspace: React.FC<WatermarkWorkspaceProps> = ({
  watermarkText,
  fontSize,
  opacity,
  rotation,
  color,
  totalPages,
}) => {
  const { uploadedFiles, lang } = useApp();
  const isAr = lang === 'ar';

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeFile = uploadedFiles[0];

  // Viewport dimensions (A4 Aspect Ratio: 540 x 764 px)
  const viewportWidth = 540;
  const viewportHeight = 764;

  // Render actual PDF page to canvas via pdfjs-dist
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!activeFile || !canvasRef.current) return;
      setIsLoadingPage(true);

      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(activeFile.arrayBuffer.slice(0)),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });
        const doc = await loadingTask.promise;
        if (isCancelled) return;

        const pageNum = Math.min(Math.max(1, activePageIndex + 1), doc.numPages);
        const page = await doc.getPage(pageNum);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const naturalViewport = page.getViewport({ scale: 1.0 });
        const scale = viewportWidth / naturalViewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({
            canvasContext: ctx,
            viewport: scaledViewport,
          }).promise;
        }
      } catch (err) {
        console.warn('Watermark page preview notice:', err);
      } finally {
        if (!isCancelled) setIsLoadingPage(false);
      }
    }

    renderPage();
    return () => {
      isCancelled = true;
    };
  }, [activeFile, activePageIndex]);

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Top Page Selector Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#C7C9CC] dark:border-[#262626] shadow-xs">
          <button
            type="button"
            disabled={activePageIndex === 0}
            onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
            className="p-1 rounded hover:bg-[#F5F0E6] dark:hover:bg-[#262626] disabled:opacity-30"
          >
            <ChevronLeft size={16} className="rtl:rotate-180" />
          </button>

          <span className="text-xs font-bold px-2 text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? `صفحة ${activePageIndex + 1} من ${totalPages}` : `Page ${activePageIndex + 1} of ${totalPages}`}
          </span>

          <button
            type="button"
            disabled={activePageIndex === totalPages - 1}
            onClick={() => setActivePageIndex(prev => Math.min(totalPages - 1, prev + 1))}
            className="p-1 rounded hover:bg-[#F5F0E6] dark:hover:bg-[#262626] disabled:opacity-30"
          >
            <ChevronRight size={16} className="rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* Main 2-Layer Interactive Document Preview Canvas */}
      <div
        style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
        className="relative bg-white dark:bg-[#0D0D0D] rounded-xl shadow-lg border border-[#C7C9CC] dark:border-[#333333] overflow-hidden flex items-center justify-center"
      >
        {/* Underlayer: Rendered PDF Page Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none object-contain"
        />

        {/* Loading Spinner */}
        {isLoadingPage && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center backdrop-blur-xs z-10">
            <div className="w-8 h-8 border-3 border-[#0D0D0D] dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Live Center-Anchored Watermark Text Overlay */}
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            opacity: opacity,
            color: color,
            fontSize: `${fontSize}px`,
          }}
          className="absolute font-bold text-center pointer-events-none z-20 whitespace-nowrap tracking-wider select-none transition-all duration-150"
          dir="auto"
        >
          {watermarkText || (isAr ? 'سري للغاية' : 'CONFIDENTIAL')}
        </div>
      </div>

      {/* Live Preview Summary Bar */}
      <div className="flex items-center gap-2 text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
        <Eye size={14} className="text-[#0D0D0D] dark:text-white" />
        <span>
          {isAr
            ? `معاينة حية للمركز (${rotation}° | شفافية ${Math.round(opacity * 100)}%)`
            : `Live Center-Anchored WYSIWYG (${rotation}° | ${Math.round(opacity * 100)}% Opacity)`}
        </span>
      </div>
    </div>
  );
};
