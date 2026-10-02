import React from 'react';
import { useApp } from '../../context/AppContext';
import { ImageInputItem } from '../../services/jpgToPdfEngine';
import { Maximize2, FileText, ArrowUp, ArrowDown, Trash2, ShieldCheck } from 'lucide-react';

interface JpgToPdfConfigProps {
  images: ImageInputItem[];
  onReorder: (fromIdx: number, toIdx: number) => void;
  onRemove: (index: number) => void;
  pageSizingMode: 'original' | 'a4_fit';
  onPageSizingModeChange: (mode: 'original' | 'a4_fit') => void;
}

export const JpgToPdfConfig: React.FC<JpgToPdfConfigProps> = ({
  images,
  onReorder,
  onRemove,
  pageSizingMode,
  onPageSizingModeChange,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Page Sizing Strategy */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
          {isAr ? 'نمط وأبعاد الصفحات (Page Sizing):' : 'Page Sizing & Aspect Ratio:'}
        </label>
        <div className="space-y-2">
          {/* Dynamic 1:1 Sizing (Recommended) */}
          <button
            type="button"
            onClick={() => onPageSizingModeChange('original')}
            className={`w-full text-start p-3 rounded-xl border transition-all ${
              pageSizingMode === 'original'
                ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1A1A1A] shadow-xs'
                : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#0D0D0D]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
                <Maximize2 size={14} />
                <span>{isAr ? 'تطابق تلقائي 1:1 (الأبعاد الأصلية)' : 'Dynamic Auto-Fit (1:1 Original)'}</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0D0D0D]/10 dark:bg-white/10 text-[#0D0D0D] dark:text-white">
                {isAr ? 'موصى به' : 'Recommended'}
              </span>
            </div>
            <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] mt-1 leading-relaxed">
              {isAr
                ? 'يتم تخصيص أبعاد كل صفحة لتطابق تماماً أبعاد الصورة بدون أي تمدد أو قص أو هوامش بيضاء.'
                : 'Each PDF page dynamically resizes to match the image dimensions with zero stretching or margins.'}
            </p>
          </button>

          {/* Standard A4 Fit */}
          <button
            type="button"
            onClick={() => onPageSizingModeChange('a4_fit')}
            className={`w-full text-start p-3 rounded-xl border transition-all ${
              pageSizingMode === 'a4_fit'
                ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1A1A1A] shadow-xs'
                : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#0D0D0D]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
                <FileText size={14} />
                <span>{isAr ? 'حجم صفحة قياسي (A4 Page)' : 'Standard A4 Document'}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] mt-1 leading-relaxed">
              {isAr
                ? 'توسيط الصور بنسبتها الصحيحة داخل صفحات A4 قياسية جاهزة للطباعة.'
                : 'Centers images inside standard A4 pages with proportional aspect ratio.'}
            </p>
          </button>
        </div>
      </div>

      {/* 2. Image Queue & Reordering */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'تسلسل وترتيب الصور:' : 'Image Order in PDF:'}
          </span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F5F0E6] dark:bg-[#222222] text-[#0D0D0D] dark:text-white">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="flex items-center justify-between p-2 rounded-lg bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] border border-[#C7C9CC]/50 dark:border-[#333333]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={img.previewUrl}
                  alt={img.name}
                  className="w-7 h-7 object-cover rounded border border-[#C7C9CC] shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-medium text-[11px] truncate text-[#0D0D0D] dark:text-white">
                    {img.name}
                  </div>
                  <div className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] font-mono">
                    {img.width} × {img.height} px
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => onReorder(idx, idx - 1)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => onReorder(idx, idx + 1)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown size={12} />
                </button>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Remove Image"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Aspect Ratio & Distortion-Free Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'ضمان الحفاظ على أبعاد الصور:' : 'Aspect Ratio & Resolution Guarantee:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'يتم تحويل وتجميع الصور بدقة كاملة مع الحفاظ التام على أبعادها الأفقية والعمودية بدون أي تشويه.'
            : 'Multi-image bundles dynamically calculate exact page bounding boxes, preventing any image distortion.'}
        </p>
      </div>
    </div>
  );
};
