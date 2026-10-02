import React from 'react';
import { useApp } from '../../context/AppContext';
import { PdfAnnotation } from '../../services/editEngine';
import { Type, Square, PenTool, Highlighter, ShieldCheck, Trash2 } from 'lucide-react';

interface EditPdfConfigProps {
  activeTool: 'text' | 'rect' | 'draw' | 'highlight' | 'select';
  onActiveToolChange: (tool: 'text' | 'rect' | 'draw' | 'highlight' | 'select') => void;
  activeColor: string;
  onActiveColorChange: (color: string) => void;
  activeFontSize: number;
  onActiveFontSizeChange: (size: number) => void;
  annotations: PdfAnnotation[];
  onClearPageAnnotations: () => void;
  activePageIndex: number;
  totalPages: number;
  onSelectPage: (index: number) => void;
}

const COLOR_PRESETS = [
  { hex: '#0D0D0D', label: 'Black' },
  { hex: '#DC2626', label: 'Red' },
  { hex: '#2563EB', label: 'Blue' },
  { hex: '#059669', label: 'Green' },
  { hex: '#D97706', label: 'Amber' },
  { hex: '#7C3AED', label: 'Purple' },
];

export const EditPdfConfig: React.FC<EditPdfConfigProps> = ({
  activeTool,
  onActiveToolChange,
  activeColor,
  onActiveColorChange,
  activeFontSize,
  onActiveFontSizeChange,
  annotations,
  onClearPageAnnotations,
  activePageIndex,
  totalPages,
  onSelectPage,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const pageAnnotationsCount = annotations.filter(a => a.pageIndex === activePageIndex).length;

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Tool Selection Grid */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
          {isAr ? 'أدوات التحرير والإضافة:' : 'Annotation & Editing Tools:'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onActiveToolChange('text')}
            className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
              activeTool === 'text'
                ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent shadow-xs'
                : 'bg-white dark:bg-[#141414] border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D]'
            }`}
          >
            <Type size={16} />
            <span>{isAr ? 'مربع نص' : 'Text Box'}</span>
          </button>

          <button
            type="button"
            onClick={() => onActiveToolChange('rect')}
            className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
              activeTool === 'rect'
                ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent shadow-xs'
                : 'bg-white dark:bg-[#141414] border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D]'
            }`}
          >
            <Square size={16} />
            <span>{isAr ? 'مستطيل / إطار' : 'Rectangle Box'}</span>
          </button>

          <button
            type="button"
            onClick={() => onActiveToolChange('draw')}
            className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
              activeTool === 'draw'
                ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent shadow-xs'
                : 'bg-white dark:bg-[#141414] border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D]'
            }`}
          >
            <PenTool size={16} />
            <span>{isAr ? 'قلم حر' : 'Freehand Pen'}</span>
          </button>

          <button
            type="button"
            onClick={() => onActiveToolChange('highlight')}
            className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-all ${
              activeTool === 'highlight'
                ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent shadow-xs'
                : 'bg-white dark:bg-[#141414] border-[#C7C9CC] dark:border-[#333333] hover:border-[#0D0D0D]'
            }`}
          >
            <Highlighter size={16} />
            <span>{isAr ? 'تظليل ملون' : 'Highlighter'}</span>
          </button>
        </div>
      </div>

      {/* 2. Color Palette Presets */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'اللون النشط:' : 'Active Color:'}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F5F0E6] dark:bg-[#222222] font-bold">
            {activeColor}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => onActiveColorChange(preset.hex)}
              style={{ backgroundColor: preset.hex }}
              className={`w-7 h-7 rounded-full transition-transform ${
                activeColor.toLowerCase() === preset.hex.toLowerCase()
                  ? 'ring-2 ring-offset-2 ring-[#0D0D0D] dark:ring-white scale-110'
                  : 'opacity-80 hover:opacity-100'
              }`}
              title={preset.label}
            />
          ))}
        </div>
      </div>

      {/* 3. Font Size Slider (When Text is selected) */}
      {activeTool === 'text' && (
        <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'حجم الخط:' : 'Font Size:'}
            </span>
            <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
              {activeFontSize} pt
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="32"
            step="2"
            value={activeFontSize}
            onChange={e => onActiveFontSizeChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#0D0D0D] dark:accent-white cursor-pointer"
          />
        </div>
      )}

      {/* 4. Page Navigation & Annotation Stats */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[#383B3F] dark:text-[#B8BAC0]">
            {isAr ? 'الصفحة الحالية:' : 'Active Page:'}
          </span>
          <select
            value={activePageIndex}
            onChange={e => onSelectPage(parseInt(e.target.value, 10))}
            className="bg-[#F5F0E6] dark:bg-[#222222] border border-[#C7C9CC] dark:border-[#333333] rounded px-2 py-1 text-xs font-bold text-[#0D0D0D] dark:text-white outline-none cursor-pointer"
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i} value={i}>
                Page {i + 1} of {totalPages}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[#C7C9CC]/40 dark:border-[#262626]">
          <span className="text-[#383B3F] dark:text-[#B8BAC0]">
            {isAr ? 'تعديلات الصفحة:' : 'Page Annotations:'}
          </span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
            {pageAnnotationsCount} element{pageAnnotationsCount !== 1 ? 's' : ''}
          </span>
        </div>

        {pageAnnotationsCount > 0 && (
          <button
            type="button"
            onClick={onClearPageAnnotations}
            className="w-full mt-2 py-1.5 px-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors"
          >
            <Trash2 size={12} />
            <span>{isAr ? 'مسح تعديلات هذه الصفحة' : 'Clear Current Page'}</span>
          </button>
        )}
      </div>

      {/* 5. Coordinate Math & Privacy Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-2 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'دقة الإحداثيات والحماية من الأعطال:' : 'Coordinate Math & Arabic Support:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'يقوم النظام بتحويل إحداثيات الشاشة إلى إحداثيات PDF بدقة متناهية مع معالجة النصوص العربية وتشكيل الحروف لمنع أي أخطاء في التشفير.'
            : 'Translates Top-Left DOM coordinates to PDF Bottom-Left origin and renders high-DPI stamps for 100% Arabic text fidelity.'}
        </p>
      </div>
    </div>
  );
};
