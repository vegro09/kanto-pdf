import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Crop, Move } from 'lucide-react';
import { CropBoxRegion } from '../../services/cropEngine';

interface CropPdfWorkspaceProps {
  cropBox: CropBoxRegion;
  onCropBoxChange: (box: CropBoxRegion) => void;
  activePageIndex: number;
  onActivePageIndexChange: (index: number) => void;
  totalPages: number;
}

type HandleType =
  | 'move'
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

export const CropPdfWorkspace: React.FC<CropPdfWorkspaceProps> = ({
  cropBox,
  onCropBoxChange,
  activePageIndex,
  onActivePageIndexChange,
  totalPages,
}) => {
  const { lang, uploadedFiles } = useApp();
  const isAr = lang === 'ar';

  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({
    width: 595.28,
    height: 841.89,
  });
  const [renderedDimensions, setRenderedDimensions] = useState<{ width: number; height: number }>({
    width: 500,
    height: 700,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropOverlayRef = useRef<HTMLDivElement>(null);

  const activeFile = uploadedFiles[0];

  // Dragging state
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const dragStartRef = useRef<{
    handle: HandleType;
    startX: number;
    startY: number;
    initialBox: CropBoxRegion;
  } | null>(null);

  // 1. Render PDF page to canvas
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

        const pageNum = Math.min(Math.max(1, activePageIndex + 1), doc.numPages);
        const page = await doc.getPage(pageNum);
        const unscaledViewport = page.getViewport({ scale: 1.0 });

        setPdfDimensions({
          width: unscaledViewport.width,
          height: unscaledViewport.height,
        });

        const availableWidth = containerRef.current
          ? Math.min(containerRef.current.clientWidth - 48, 620)
          : 540;
        const scale = Math.max(0.4, Math.min(1.3, availableWidth / unscaledViewport.width));

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;

        if (canvas && !isCancelled) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          setRenderedDimensions({
            width: viewport.width,
            height: viewport.height,
          });

          const ctx = canvas.getContext('2d');
          if (ctx) {
            await page.render({ canvasContext: ctx, viewport }).promise;
          }
        }

        doc.destroy();
      } catch (err) {
        console.warn('Crop workspace preview render error:', err);
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [activeFile, activePageIndex]);

  // 2. Interactive Bounding Box Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent, handle: HandleType) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);

    dragStartRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialBox: { ...cropBox },
    };
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragStartRef.current || !renderedDimensions.width || !renderedDimensions.height) return;

      const { handle, startX, startY, initialBox } = dragStartRef.current;
      const deltaXPixels = e.clientX - startX;
      const deltaYPixels = e.clientY - startY;

      // Convert pixel deltas to percentage
      const deltaXPercent = (deltaXPixels / renderedDimensions.width) * 100;
      const deltaYPercent = (deltaYPixels / renderedDimensions.height) * 100;

      let newX = initialBox.xPercent;
      let newY = initialBox.yPercent;
      let newW = initialBox.widthPercent;
      let newH = initialBox.heightPercent;

      if (handle === 'move') {
        newX = Math.max(0, Math.min(100 - initialBox.widthPercent, initialBox.xPercent + deltaXPercent));
        newY = Math.max(0, Math.min(100 - initialBox.heightPercent, initialBox.yPercent + deltaYPercent));
      } else {
        if (handle.includes('w')) {
          const maxLeft = initialBox.xPercent + initialBox.widthPercent - 5;
          newX = Math.max(0, Math.min(maxLeft, initialBox.xPercent + deltaXPercent));
          newW = initialBox.widthPercent - (newX - initialBox.xPercent);
        }
        if (handle.includes('e')) {
          newW = Math.max(5, Math.min(100 - initialBox.xPercent, initialBox.widthPercent + deltaXPercent));
        }
        if (handle.includes('n')) {
          const maxTop = initialBox.yPercent + initialBox.heightPercent - 5;
          newY = Math.max(0, Math.min(maxTop, initialBox.yPercent + deltaYPercent));
          newH = initialBox.heightPercent - (newY - initialBox.yPercent);
        }
        if (handle.includes('s')) {
          newH = Math.max(5, Math.min(100 - initialBox.yPercent, initialBox.heightPercent + deltaYPercent));
        }
      }

      onCropBoxChange({
        xPercent: Math.round(newX * 10) / 10,
        yPercent: Math.round(newY * 10) / 10,
        widthPercent: Math.round(newW * 10) / 10,
        heightPercent: Math.round(newH * 10) / 10,
      });
    },
    [renderedDimensions, onCropBoxChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsInteracting(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isInteracting) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isInteracting, handlePointerMove, handlePointerUp]);

  // Compute live point measurements
  const cropWidthPts = ((cropBox.widthPercent / 100) * pdfDimensions.width).toFixed(0);
  const cropHeightPts = ((cropBox.heightPercent / 100) * pdfDimensions.height).toFixed(0);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Top Banner & Page Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] text-xs">
        <div className="flex items-center gap-2">
          <Crop size={15} className="text-[#0D0D0D] dark:text-[#F5F0E6]" />
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'منطقة القص المحددة:' : 'Active Crop Region:'}
          </span>
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] border border-[#C7C9CC]/60">
            {cropWidthPts} × {cropHeightPts} pt ({cropBox.widthPercent.toFixed(0)}% × {cropBox.heightPercent.toFixed(0)}%)
          </span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={activePageIndex === 0}
            onClick={() => onActivePageIndexChange(Math.max(0, activePageIndex - 1))}
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/60 dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white transition-colors"
          >
            <ChevronLeft size={14} className="rtl:rotate-180" />
          </button>

          <span className="text-xs font-bold font-mono px-2 text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? `صفحة ${activePageIndex + 1} من ${totalPages}` : `Page ${activePageIndex + 1} of ${totalPages}`}
          </span>

          <button
            type="button"
            disabled={activePageIndex >= totalPages - 1}
            onClick={() => onActivePageIndexChange(Math.min(totalPages - 1, activePageIndex + 1))}
            className="p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/60 dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] disabled:opacity-30 hover:bg-[#0D0D0D] hover:text-white transition-colors"
          >
            <ChevronRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Visual Canvas & Draggable Crop Overlay Area */}
      <div className="flex items-center justify-center p-6 bg-[#F5F0E6]/40 dark:bg-[#0D0D0D] rounded-2xl border border-[#C7C9CC]/80 dark:border-[#262626] min-h-[480px]">
        <div
          ref={cropOverlayRef}
          style={{ width: renderedDimensions.width, height: renderedDimensions.height }}
          className="relative shadow-xl rounded border border-[#C7C9CC] dark:border-[#333333] select-none overflow-hidden bg-white dark:bg-[#141414]"
        >
          {/* Step A: Canvas Layer */}
          <canvas ref={canvasRef} className="block max-w-full" />

          {/* Dimmed excluded margins backdrop */}
          {/* Top Shade */}
          <div
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: `${cropBox.yPercent}%`,
            }}
            className="absolute bg-black/45 backdrop-blur-[0.5px] pointer-events-none"
          />
          {/* Bottom Shade */}
          <div
            style={{
              top: `${cropBox.yPercent + cropBox.heightPercent}%`,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            className="absolute bg-black/45 backdrop-blur-[0.5px] pointer-events-none"
          />
          {/* Left Shade */}
          <div
            style={{
              top: `${cropBox.yPercent}%`,
              left: 0,
              width: `${cropBox.xPercent}%`,
              height: `${cropBox.heightPercent}%`,
            }}
            className="absolute bg-black/45 backdrop-blur-[0.5px] pointer-events-none"
          />
          {/* Right Shade */}
          <div
            style={{
              top: `${cropBox.yPercent}%`,
              left: `${cropBox.xPercent + cropBox.widthPercent}%`,
              right: 0,
              height: `${cropBox.heightPercent}%`,
            }}
            className="absolute bg-black/45 backdrop-blur-[0.5px] pointer-events-none"
          />

          {/* Step B: The Interactive Crop Bounding Box */}
          <div
            style={{
              top: `${cropBox.yPercent}%`,
              left: `${cropBox.xPercent}%`,
              width: `${cropBox.widthPercent}%`,
              height: `${cropBox.heightPercent}%`,
            }}
            className="absolute border-2 border-[#0D0D0D] dark:border-white shadow-2xl cursor-move touch-none"
            onPointerDown={e => handlePointerDown(e, 'move')}
          >
            {/* Center Drag Icon & Dimension Tag */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D0D0D]/85 dark:bg-white/90 text-white dark:text-[#0D0D0D] text-[10px] font-bold font-mono shadow-md backdrop-blur-xs">
                <Move size={11} />
                <span>{cropWidthPts} × {cropHeightPts} pt</span>
              </div>
            </div>

            {/* 8 Resize Handles */}
            {/* NW */}
            <div
              onPointerDown={e => handlePointerDown(e, 'nw')}
              className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-nwse-resize"
            />
            {/* N */}
            <div
              onPointerDown={e => handlePointerDown(e, 'n')}
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-ns-resize"
            />
            {/* NE */}
            <div
              onPointerDown={e => handlePointerDown(e, 'ne')}
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-nesw-resize"
            />
            {/* E */}
            <div
              onPointerDown={e => handlePointerDown(e, 'e')}
              className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-ew-resize"
            />
            {/* SE */}
            <div
              onPointerDown={e => handlePointerDown(e, 'se')}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-nwse-resize"
            />
            {/* S */}
            <div
              onPointerDown={e => handlePointerDown(e, 's')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-ns-resize"
            />
            {/* SW */}
            <div
              onPointerDown={e => handlePointerDown(e, 'sw')}
              className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-nesw-resize"
            />
            {/* W */}
            <div
              onPointerDown={e => handlePointerDown(e, 'w')}
              className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#0D0D0D] dark:border-white rounded-xs shadow-md cursor-ew-resize"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
