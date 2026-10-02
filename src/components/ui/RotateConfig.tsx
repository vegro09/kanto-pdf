import React from 'react';
import { useApp } from '../../context/AppContext';
import { RotateCw, RotateCcw, RefreshCw, ShieldCheck } from 'lucide-react';
import { PdfPageItem } from '../../types/tools';

interface RotateConfigProps {
  pages: PdfPageItem[];
  onRotateAll: (degrees: number) => void;
  onResetAll: () => void;
}

export const RotateConfig: React.FC<RotateConfigProps> = ({
  pages,
  onRotateAll,
  onResetAll,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const validPages = pages.filter(p => !p.isDeleted);
  const rotatedPages = validPages.filter(p => (p.rotation % 360) !== 0);

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Batch Rotation Controls */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center justify-between">
          <span>{isAr ? 'تدوير جماعي لكافة الصفحات:' : 'Batch Rotate All Pages:'}</span>
          <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] font-mono">
            {validPages.length} {isAr ? 'صفحة' : 'pages'}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onRotateAll(90)}
            className="p-2.5 rounded-xl border border-[#C7C9CC] dark:border-[#2C2F33] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <RotateCw size={13} />
            <span>{isAr ? '+90° يميناً (مع عقارب الساعة)' : '+90° Clockwise'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRotateAll(-90)}
            className="p-2.5 rounded-xl border border-[#C7C9CC] dark:border-[#2C2F33] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <RotateCcw size={13} />
            <span>{isAr ? '-90° يساراً (عكس الساعة)' : '-90° Counter-CW'}</span>
          </button>

          <button
            type="button"
            onClick={() => onRotateAll(180)}
            className="p-2.5 rounded-xl border border-[#C7C9CC] dark:border-[#2C2F33] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <RefreshCw size={13} />
            <span>{isAr ? 'قلب 180° رأساً على عقب' : '180° Flip'}</span>
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="p-2.5 rounded-xl border border-[#C7C9CC] dark:border-[#2C2F33] bg-[#F5F0E6]/60 dark:bg-[#1C1C1C] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
          >
            <span>{isAr ? 'إعادة ضبط الزوايا (0°)' : 'Reset All (0°)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Per-Page Rotation Status Deck */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'حالة تدوير الصفحات:' : 'Page Rotation Status:'}
          </span>
          <span className="font-mono text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {rotatedPages.length > 0
              ? `${rotatedPages.length} ${isAr ? 'صفحات معدلة' : 'modified'}`
              : isAr ? 'الوضع الافتراضي' : 'Default Orientation'}
          </span>
        </div>

        <div className="max-h-36 overflow-y-auto space-y-1 pr-0.5">
          {validPages.map(page => {
            const rot = ((page.rotation % 360) + 360) % 360;
            return (
              <div
                key={page.pageNumber}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#F5F0E6]/40 dark:bg-[#1A1A1A] text-[10px] font-medium"
              >
                <span className="font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
                  {isAr ? `صفحة ${page.pageNumber}` : `Page ${page.pageNumber}`}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                    rot !== 0
                      ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]'
                      : 'text-[#5A5D61] dark:text-[#A0A2A6]'
                  }`}
                >
                  {rot > 0 ? `+${rot}°` : '0°'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Structural Metadata Guarantee Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'تدوير هيكلي دائم في ملف PDF:' : 'Permanent Structural Rotation:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'تعديل البيانات الوصفية لزاوية الصفحة مباشرة عبر pdf-lib لضمان استقرار العرض في قارئات Acrobat وChrome.'
            : 'Rotations are permanently embedded into the internal PDF page dictionary metadata (Rotate entry) rather than just CSS.'}
        </p>
      </div>
    </div>
  );
};
