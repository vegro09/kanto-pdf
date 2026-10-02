import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SignaturePosition } from '../../services/signEngine';
import * as pdfjsLib from 'pdfjs-dist';
import { Feather, Move, CheckCircle2 } from 'lucide-react';

interface SignPdfWorkspaceProps {
  activePageIndex: number;
  signatureDataUrl?: string | null;
  position: SignaturePosition;
  onPositionChange: (pos: SignaturePosition) => void;
  onSelectPage: (pageIndex: number) => void;
  totalPages: number;
}

export const SignPdfWorkspace: React.FC<SignPdfWorkspaceProps> = ({
  activePageIndex,
  signatureDataUrl,
  position,
  onPositionChange,
  onSelectPage,
  totalPages,
}) => {
  const { uploadedFiles, lang } = useApp();
  const isAr = lang === 'ar';

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Viewport dimensions (A4 Aspect Ratio: 540 x 764 px)
  const viewportWidth = 540;
  const viewportHeight = 764;

  const activeFile = uploadedFiles[0];

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
        console.warn('Interactive PDF page preview notice:', err);
      } finally {
        if (!isCancelled) setIsLoadingPage(false);
      }
    }

    renderPage();
    return () => {
      isCancelled = true;
    };
  }, [activeFile, activePageIndex]);

  // Convert percentages to pixel positions within the viewport
  const sigPixelX = (viewportWidth * position.xPercent) / 100;
  const sigPixelY = (viewportHeight * position.yPercent) / 100;
  const sigPixelWidth = (viewportWidth * position.widthPercent) / 100;
  const sigPixelHeight = (viewportHeight * position.heightPercent) / 100;

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      dragStartOffsetRef.current = {
        x: clickX - sigPixelX,
        y: clickY - sigPixelY,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left - dragStartOffsetRef.current.x;
    const currentY = e.clientY - rect.top - dragStartOffsetRef.current.y;

    const maxPixelX = viewportWidth - sigPixelWidth;
    const maxPixelY = viewportHeight - sigPixelHeight;

    const clampedX = Math.max(0, Math.min(maxPixelX, currentX));
    const clampedY = Math.max(0, Math.min(maxPixelY, currentY));

    const newXPercent = Math.round((clampedX / viewportWidth) * 100);
    const newYPercent = Math.round((clampedY / viewportHeight) * 100);

    onPositionChange({
      ...position,
      xPercent: newXPercent,
      yPercent: newYPercent,
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Top Page Selector Bar */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#C7C9CC] dark:border-[#262626] shadow-xs">
          <span className="text-[11px] font-bold px-2 text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr ? 'الصفحة المعروضة:' : 'Previewing Page:'}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectPage(i)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  activePageIndex === i
                    ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] shadow-xs'
                    : 'text-[#5A5D61] dark:text-[#A0A2A6] hover:bg-[#F5F0E6] dark:hover:bg-[#262626]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main 2-Layer Interactive Document Preview Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
        className="relative bg-white dark:bg-[#0D0D0D] rounded-xl shadow-lg border border-[#C7C9CC] dark:border-[#333333] overflow-hidden cursor-default"
      >
        {/* Underlayer: Rendered PDF Canvas */}
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

        {/* Interactive Draggable Signature Badge Overlay */}
        {signatureDataUrl ? (
          <div
            onPointerDown={handlePointerDown}
            style={{
              left: `${sigPixelX}px`,
              top: `${sigPixelY}px`,
              width: `${sigPixelWidth}px`,
              height: `${sigPixelHeight}px`,
            }}
            className="absolute cursor-move border-2 border-dashed border-emerald-600 dark:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors p-1.5 flex flex-col justify-between group shadow-sm z-20"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-black/80 px-1 py-0.5 rounded shadow-xs">
              <span className="flex items-center gap-1">
                <Move size={10} />
                <span>{isAr ? 'اسحب لوضع التوقيع' : 'Drag to Place'}</span>
              </span>
              <span className="font-mono text-[8px]">
                X:{position.xPercent}% Y:{position.yPercent}%
              </span>
            </div>

            {/* Transparent PNG Signature Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden py-0.5">
              <img
                src={signatureDataUrl}
                alt="Signature"
                className="max-h-full max-w-full object-contain pointer-events-none drop-shadow-xs"
              />
            </div>
          </div>
        ) : (
          /* Empty Signature Placeholder Prompt */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none bg-black/5 dark:bg-white/5 backdrop-blur-[1px]">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#1E1E1E] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-white mb-3 shadow-sm">
              <Feather size={22} />
            </div>
            <span className="font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'قم برسم أو رفع توقيعك في الشريط الجانبي' : 'Draw or Type Signature in Sidebar'}
            </span>
            <span className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] mt-1 max-w-xs">
              {isAr
                ? 'سيظهر التوقيع كطبقة شفافة تفاعلية يمكنك سحبها إلى أي مكان على الصفحة'
                : 'Your signature will appear as an interactive transparent layer ready to drag & position anywhere.'}
            </span>
          </div>
        )}
      </div>

      {/* Helpful Coordinate & Placement Feedback */}
      {signatureDataUrl && (
        <div className="flex items-center gap-3 text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 size={13} />
            <span>{isAr ? 'خلفية شفافة 100%' : '100% Transparent PNG'}</span>
          </div>
          <span>•</span>
          <div className="font-mono text-[11px]">
            {isAr
              ? `الموضع: ${position.xPercent}% أفقي × ${position.yPercent}% عمودي`
              : `Placement: ${position.xPercent}% X × ${position.yPercent}% Y`}
          </div>
        </div>
      )}
    </div>
  );
};
