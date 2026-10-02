import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PdfAnnotation, TextAnnotation, RectAnnotation, DrawingAnnotation, HighlightAnnotation } from '../../services/editEngine';
import { Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface EditPdfWorkspaceProps {
  activePageIndex: number;
  annotations: PdfAnnotation[];
  onAnnotationsChange: (annotations: PdfAnnotation[]) => void;
  activeTool: 'text' | 'rect' | 'draw' | 'highlight' | 'select';
  onActiveToolChange: (tool: 'text' | 'rect' | 'draw' | 'highlight' | 'select') => void;
  activeColor: string;
  activeFontSize: number;
}

export const EditPdfWorkspace: React.FC<EditPdfWorkspaceProps> = ({
  activePageIndex,
  annotations,
  onAnnotationsChange,
  activeTool,
  onActiveToolChange,
  activeColor,
  activeFontSize,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [rectCurrent, setRectCurrent] = useState<{ x: number; y: number } | null>(null);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Page dimensions (Standard A4 ratio 595 x 842 pt scaled to viewport width ~540px)
  const baseWidth = 540;
  const baseHeight = 760;
  const viewportWidth = Math.round(baseWidth * zoomLevel);
  const viewportHeight = Math.round(baseHeight * zoomLevel);

  const pageAnnotations = annotations.filter(a => a.pageIndex === activePageIndex);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    if (activeTool === 'text') {
      const newTextAnn: TextAnnotation = {
        id: `text-${Date.now()}`,
        type: 'text',
        pageIndex: activePageIndex,
        uiX: Math.round(x),
        uiY: Math.round(y),
        width: 160,
        height: 36,
        text: isAr ? 'انقر لكتابة نص هنا' : 'Click to edit text',
        fontSize: activeFontSize,
        fontColor: activeColor,
        isBold: true,
      };
      onAnnotationsChange([...annotations, newTextAnn]);
      setSelectedAnnotationId(newTextAnn.id);
      onActiveToolChange('select');
      return;
    }

    if (activeTool === 'draw') {
      setIsDrawing(true);
      setCurrentDrawPoints([{ x, y }]);
      return;
    }

    if (activeTool === 'rect' || activeTool === 'highlight') {
      setRectStart({ x, y });
      setRectCurrent({ x, y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    if (isDrawing && activeTool === 'draw') {
      setCurrentDrawPoints(prev => [...prev, { x, y }]);
      return;
    }

    if (rectStart && (activeTool === 'rect' || activeTool === 'highlight')) {
      setRectCurrent({ x, y });
    }
  };

  const handlePointerUp = () => {
    if (isDrawing && currentDrawPoints.length > 1) {
      const newDrawAnn: DrawingAnnotation = {
        id: `draw-${Date.now()}`,
        type: 'draw',
        pageIndex: activePageIndex,
        points: currentDrawPoints,
        strokeColor: activeColor,
        strokeWidth: 2.5,
      };
      onAnnotationsChange([...annotations, newDrawAnn]);
      setIsDrawing(false);
      setCurrentDrawPoints([]);
      return;
    }

    if (rectStart && rectCurrent) {
      const minX = Math.min(rectStart.x, rectCurrent.x);
      const minY = Math.min(rectStart.y, rectCurrent.y);
      const width = Math.abs(rectCurrent.x - rectStart.x);
      const height = Math.abs(rectCurrent.y - rectStart.y);

      if (width > 5 && height > 5) {
        if (activeTool === 'rect') {
          const newRectAnn: RectAnnotation = {
            id: `rect-${Date.now()}`,
            type: 'rect',
            pageIndex: activePageIndex,
            uiX: Math.round(minX),
            uiY: Math.round(minY),
            width: Math.round(width),
            height: Math.round(height),
            strokeColor: activeColor,
            strokeWidth: 2,
          };
          onAnnotationsChange([...annotations, newRectAnn]);
        } else if (activeTool === 'highlight') {
          const newHlAnn: HighlightAnnotation = {
            id: `hl-${Date.now()}`,
            type: 'highlight',
            pageIndex: activePageIndex,
            uiX: Math.round(minX),
            uiY: Math.round(minY),
            width: Math.round(width),
            height: Math.round(height),
            color: activeColor || '#FACC15',
          };
          onAnnotationsChange([...annotations, newHlAnn]);
        }
      }
      setRectStart(null);
      setRectCurrent(null);
      onActiveToolChange('select');
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    onAnnotationsChange(annotations.filter(a => a.id !== id));
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
  };

  const handleUpdateText = (id: string, text: string) => {
    onAnnotationsChange(
      annotations.map(a => (a.id === id && a.type === 'text' ? { ...a, text } : a))
    );
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Zoom and Navigation Header */}
      <div className="flex items-center justify-between w-full max-w-[540px] px-2 py-1 bg-white dark:bg-[#141414] rounded-lg border border-[#C7C9CC] dark:border-[#333333] text-xs">
        <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          {isAr ? `الصفحة ${activePageIndex + 1}` : `Page ${activePageIndex + 1}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.15))}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* 2-Layer Interactive Document Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`,
        }}
        className={`relative bg-white dark:bg-[#0D0D0D] shadow-lg rounded-[8px] border border-[#C7C9CC] dark:border-[#333333] overflow-hidden select-none ${
          activeTool === 'draw'
            ? 'cursor-crosshair'
            : activeTool === 'text'
            ? 'cursor-text'
            : activeTool === 'rect' || activeTool === 'highlight'
            ? 'cursor-crosshair'
            : 'cursor-default'
        }`}
      >
        {/* Viewport Layer: Document Sheet Background */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="space-y-4">
            <div className="h-4 bg-[#C7C9CC]/50 dark:bg-white/20 rounded w-1/3" />
            <div className="space-y-2 pt-4">
              <div className="h-2.5 bg-[#C7C9CC]/30 dark:bg-white/10 rounded w-full" />
              <div className="h-2.5 bg-[#C7C9CC]/30 dark:bg-white/10 rounded w-5/6" />
              <div className="h-2.5 bg-[#C7C9CC]/30 dark:bg-white/10 rounded w-4/5" />
            </div>
            <div className="space-y-2 pt-6">
              <div className="h-2.5 bg-[#C7C9CC]/30 dark:bg-white/10 rounded w-11/12" />
              <div className="h-2.5 bg-[#C7C9CC]/30 dark:bg-white/10 rounded w-full" />
              <div className="h-2.5 bg-[#C7C9CC]/30 dark:bg-white/10 rounded w-3/4" />
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#383B3F] dark:text-[#888888] font-mono">
            <span>KANTO PDF VERIFIED DOCUMENT</span>
            <span>Page {activePageIndex + 1}</span>
          </div>
        </div>

        {/* Interactive Layer: Freehand Drawings SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${baseWidth} ${baseHeight}`}>
          {pageAnnotations
            .filter(a => a.type === 'draw')
            .map(ann => {
              const drawAnn = ann as DrawingAnnotation;
              const pathData = drawAnn.points.reduce(
                (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                ''
              );
              return (
                <path
                  key={drawAnn.id}
                  d={pathData}
                  stroke={drawAnn.strokeColor}
                  strokeWidth={drawAnn.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              );
            })}

          {/* Active drawing stroke */}
          {isDrawing && currentDrawPoints.length > 1 && (
            <path
              d={currentDrawPoints.reduce(
                (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                ''
              )}
              stroke={activeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}

          {/* Active drawing rectangle preview */}
          {rectStart && rectCurrent && (
            <rect
              x={Math.min(rectStart.x, rectCurrent.x)}
              y={Math.min(rectStart.y, rectCurrent.y)}
              width={Math.abs(rectCurrent.x - rectStart.x)}
              height={Math.abs(rectCurrent.y - rectStart.y)}
              stroke={activeTool === 'rect' ? activeColor : 'transparent'}
              strokeWidth={2}
              fill={activeTool === 'highlight' ? activeColor : 'transparent'}
              opacity={activeTool === 'highlight' ? 0.4 : 1}
            />
          )}
        </svg>

        {/* Interactive Layer: Rectangles & Highlights */}
        {pageAnnotations
          .filter(a => a.type === 'rect' || a.type === 'highlight')
          .map(ann => {
            if (ann.type === 'rect') {
              const rectAnn = ann as RectAnnotation;
              const isSelected = selectedAnnotationId === rectAnn.id;
              return (
                <div
                  key={rectAnn.id}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedAnnotationId(rectAnn.id);
                  }}
                  style={{
                    left: `${rectAnn.uiX * zoomLevel}px`,
                    top: `${rectAnn.uiY * zoomLevel}px`,
                    width: `${rectAnn.width * zoomLevel}px`,
                    height: `${rectAnn.height * zoomLevel}px`,
                    borderColor: rectAnn.strokeColor,
                    borderWidth: `${rectAnn.strokeWidth}px`,
                  }}
                  className={`absolute border rounded-xs cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                  }`}
                >
                  {isSelected && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteAnnotation(rectAnn.id);
                      }}
                      className="absolute -top-3 -right-3 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs"
                      title="Delete Box"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              );
            }

            if (ann.type === 'highlight') {
              const hlAnn = ann as HighlightAnnotation;
              return (
                <div
                  key={hlAnn.id}
                  style={{
                    left: `${hlAnn.uiX * zoomLevel}px`,
                    top: `${hlAnn.uiY * zoomLevel}px`,
                    width: `${hlAnn.width * zoomLevel}px`,
                    height: `${hlAnn.height * zoomLevel}px`,
                    backgroundColor: hlAnn.color,
                  }}
                  className="absolute opacity-40 pointer-events-none rounded-xs"
                />
              );
            }

            return null;
          })}

        {/* Interactive Layer: Text Annotations */}
        {pageAnnotations
          .filter(a => a.type === 'text')
          .map(ann => {
            const textAnn = ann as TextAnnotation;
            const isSelected = selectedAnnotationId === textAnn.id;
            const isArabicText = /[\u0600-\u06FF]/.test(textAnn.text);

            return (
              <div
                key={textAnn.id}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedAnnotationId(textAnn.id);
                }}
                style={{
                  left: `${textAnn.uiX * zoomLevel}px`,
                  top: `${textAnn.uiY * zoomLevel}px`,
                  width: `${textAnn.width * zoomLevel}px`,
                }}
                className={`absolute group cursor-move ${
                  isSelected ? 'ring-2 ring-blue-500 rounded p-1 bg-white/90 dark:bg-black/90 shadow-md' : 'p-1'
                }`}
              >
                <input
                  type="text"
                  value={textAnn.text}
                  onChange={e => handleUpdateText(textAnn.id, e.target.value)}
                  style={{
                    fontSize: `${textAnn.fontSize * zoomLevel}px`,
                    color: textAnn.fontColor,
                    fontWeight: textAnn.isBold ? 'bold' : 'normal',
                    direction: isArabicText ? 'rtl' : 'ltr',
                    textAlign: isArabicText ? 'right' : 'left',
                  }}
                  className="w-full bg-transparent border-none outline-none font-sans font-medium"
                />
                {isSelected && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteAnnotation(textAnn.id);
                    }}
                    className="absolute -top-2.5 -right-2.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-xs"
                    title="Delete Text Box"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
