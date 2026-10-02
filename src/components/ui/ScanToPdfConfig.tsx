import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScanFilterMode, ScannedPageItem } from '../../types/tools';
import { Sliders, Sparkles, Image as ImageIcon, CheckCircle2, FileText } from 'lucide-react';

interface ScanToPdfConfigProps {
  scannedPages: ScannedPageItem[];
  filterMode: ScanFilterMode;
  onFilterModeChange: (mode: ScanFilterMode) => void;
  threshold: number;
  onThresholdChange: (val: number) => void;
  pageSize: 'original' | 'a4_fit';
  onPageSizeChange: (size: 'original' | 'a4_fit') => void;
}

export const ScanToPdfConfig: React.FC<ScanToPdfConfigProps> = ({
  scannedPages,
  filterMode,
  onFilterModeChange,
  threshold,
  onThresholdChange,
  pageSize,
  onPageSizeChange,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const filterOptions: { id: ScanFilterMode; titleEn: string; titleAr: string; descEn: string; descAr: string }[] = [
    {
      id: 'bw_threshold',
      titleEn: 'B&W Document Scan',
      titleAr: 'مسح مستندات أبيض وأسود',
      descEn: 'Pure white paper background (#FFF) with high-contrast sharp black text.',
      descAr: 'تبييض خلفية الورق بالكامل مع إبراز النصوص بدقة وسواد فائق.',
    },
    {
      id: 'color_clean',
      titleEn: 'Color Document Clean',
      titleAr: 'مسح ملون مع إزالة الظلال',
      descEn: 'Removes lighting shadows & lifts paper white while keeping colored inks.',
      descAr: 'إزالة ظلال الإضاءة وتبييض الورق مع الحفاظ على الألوان والأختام.',
    },
    {
      id: 'grayscale_enhanced',
      titleEn: 'Enhanced Grayscale',
      titleAr: 'تدرج رمادي عالي التباين',
      descEn: 'Smooth continuous tones with boosted contrast and clean highlights.',
      descAr: 'تدرجات رمادية ناعمة مع تباين محسن للمستندات والصور.',
    },
    {
      id: 'original',
      titleEn: 'Original Photo',
      titleAr: 'الصورة الأصلية بدون فلتر',
      descEn: 'Retains exact raw camera colors and ambient exposure.',
      descAr: 'الحفاظ على ألوان وإضاءة الكاميرا الأصلية بدون تعديل.',
    },
  ];

  return (
    <div className="space-y-6 text-xs text-[#0D0D0D] dark:text-[#F5F0E6]">
      {/* 1. Document Stats Card */}
      <div className="p-4 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded-xl border border-[#C7C9CC] dark:border-[#333333] space-y-3">
        <div className="flex items-center justify-between border-b border-[#C7C9CC]/40 dark:border-[#262626] pb-2.5">
          <span className="font-bold flex items-center gap-1.5 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <FileText size={15} />
            <span>{isAr ? 'الصفحات الملتقطة:' : 'Captured Pages:'}</span>
          </span>
          <span className="font-mono text-xs font-bold text-[#0D0D0D] dark:text-white">
            {scannedPages.length} {isAr ? 'صفحة' : 'page(s)'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#5A5D61] dark:text-[#A0A2A6] flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>{isAr ? 'الفلتر النشط:' : 'Active Filter:'}</span>
          </span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {filterMode === 'bw_threshold'
              ? (isAr ? 'أبيض وأسود نقي' : 'B&W High Contrast')
              : filterMode === 'color_clean'
              ? (isAr ? 'ملون نقي' : 'Clean Color')
              : filterMode === 'grayscale_enhanced'
              ? (isAr ? 'رمادي ناعم' : 'Enhanced Grayscale')
              : (isAr ? 'أصلي' : 'Original')}
          </span>
        </div>
      </div>

      {/* 2. Scanner Filter Selector */}
      <div className="space-y-2.5">
        <label className="block font-bold text-[11px] uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6]">
          {isAr ? 'نوع فلتر الماسح الضوئي' : 'Scanner Filter Effect'}
        </label>
        <div className="space-y-2">
          {filterOptions.map(opt => {
            const isSelected = filterMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFilterModeChange(opt.id)}
                className={`w-full text-start p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1F1F1F] shadow-xs'
                    : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:bg-[#F5F0E6]/50 dark:hover:bg-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0D0D0D] dark:text-white">
                    {isAr ? opt.titleAr : opt.titleEn}
                  </span>
                  {isSelected && (
                    <CheckCircle2 size={14} className="text-[#0D0D0D] dark:text-white" />
                  )}
                </div>
                <p className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] mt-1 leading-relaxed">
                  {isAr ? opt.descAr : opt.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Threshold Slider (Active when not original) */}
      {filterMode !== 'original' && (
        <div className="p-3.5 bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
              <Sliders size={14} />
              <span>{isAr ? 'عتبة تبييض الورق (Threshold):' : 'Paper Whitening Threshold:'}</span>
            </span>
            <span className="font-mono font-bold text-xs text-[#0D0D0D] dark:text-white">
              {threshold}
            </span>
          </div>

          <input
            type="range"
            min={80}
            max={220}
            step={2}
            value={threshold}
            onChange={e => onThresholdChange(Number(e.target.value))}
            className="w-full h-1.5 bg-[#E5E1D8] dark:bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#0D0D0D] dark:accent-white"
          />

          <div className="flex justify-between text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
            <span>{isAr ? 'نصوص أدكن (80)' : 'Darker Ink (80)'}</span>
            <span>{isAr ? 'افتراضي (140)' : 'Default (140)'}</span>
            <span>{isAr ? 'ورق أنصع (220)' : 'Whiter Paper (220)'}</span>
          </div>
        </div>
      )}

      {/* 4. Page Sizing Mode */}
      <div className="space-y-2">
        <label className="block font-bold text-[11px] uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6]">
          {isAr ? 'أبعاد صفحات PDF' : 'PDF Page Sizing'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPageSizeChange('original')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              pageSize === 'original'
                ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1F1F1F] font-bold text-[#0D0D0D] dark:text-white'
                : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] text-[#5A5D61] dark:text-[#A0A2A6]'
            }`}
          >
            <div className="text-xs flex items-center justify-center gap-1.5">
              <ImageIcon size={14} />
              <span>{isAr ? 'أبعاد الكاميرا الأصلية' : 'Camera Native'}</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onPageSizeChange('a4_fit')}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              pageSize === 'a4_fit'
                ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1F1F1F] font-bold text-[#0D0D0D] dark:text-white'
                : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] text-[#5A5D61] dark:text-[#A0A2A6]'
            }`}
          >
            <div className="text-xs flex items-center justify-center gap-1.5">
              <FileText size={14} />
              <span>{isAr ? 'ملاءمة A4 قياسي' : 'Fit Standard A4'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
