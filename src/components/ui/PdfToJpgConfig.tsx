import React from 'react';
import { useApp } from '../../context/AppContext';
import { Image as ImageIcon, Archive, ShieldCheck } from 'lucide-react';

interface PdfToJpgConfigProps {
  pageCount: number;
  filename?: string;
  selectedScale: number;
  onScaleChange: (scale: number) => void;
  selectedQuality: number;
  onQualityChange: (quality: number) => void;
}

export const PdfToJpgConfig: React.FC<PdfToJpgConfigProps> = ({
  pageCount,
  selectedScale,
  onScaleChange,
  selectedQuality,
  onQualityChange,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';
  const isMultiPage = pageCount > 1;

  const RESOLUTION_OPTIONS = [
    {
      scale: 3.0,
      title: isAr ? 'دقة فائقة Ultra HD (300 DPI)' : 'Ultra HD (300 DPI)',
      desc: isAr ? 'أعلى وضوح ونقاء للنصوص والطباعة' : 'Highest clarity for print & zoom',
      badge: 'PRO',
    },
    {
      scale: 2.0,
      title: isAr ? 'جودة عالية High-Res (200 DPI)' : 'High Quality (200 DPI)',
      desc: isAr ? 'مثالي للشاشات والمشاركة السريعة' : 'Crisp for retina screens & sharing',
      badge: isAr ? 'موصى به' : 'Recommended',
    },
    {
      scale: 1.5,
      title: isAr ? 'جودة قياسية Standard (150 DPI)' : 'Standard (150 DPI)',
      desc: isAr ? 'حجم ملف أصغر وتحويل فوري' : 'Compact file size & fast export',
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Target Format & Output Mode Summary */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
            {isMultiPage ? <Archive size={14} /> : <ImageIcon size={14} />}
            <span>{isAr ? 'نوع التصدير:' : 'Export Package:'}</span>
          </span>
          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]">
            {isMultiPage ? 'ZIP BUNDLE (.zip)' : 'DIRECT JPEG (.jpg)'}
          </span>
        </div>

        <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] leading-relaxed">
          {isMultiPage
            ? isAr
              ? `سيتم تحويل جميع الصفحات (${pageCount} صفحة) إلى صور JPEG عالية الدقة وتجميعها في ملف مضغوط واحد (.zip) لتجنب تنزيل ملفات متعددة.`
              : `All ${pageCount} pages will be rendered at High-DPI and bundled into a SINGLE clean .zip archive to prevent multiple download prompts.`
            : isAr
            ? 'سيتم تحويل الصفحة مباشرة إلى صورة JPEG عالية النقاء وتنزيلها كملف صورة مستقل.'
            : 'Single page will be converted directly into a standalone High-Resolution JPEG image.'}
        </p>
      </div>

      {/* 2. Resolution & DPI Presets */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
          {isAr ? 'دقة وضوح الصورة (Resolution):' : 'Image Resolution & DPI:'}
        </label>
        <div className="space-y-2">
          {RESOLUTION_OPTIONS.map(opt => {
            const isSelected = selectedScale === opt.scale;
            return (
              <button
                key={opt.scale}
                type="button"
                onClick={() => onScaleChange(opt.scale)}
                className={`w-full text-start p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1A1A1A] shadow-xs'
                    : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#0D0D0D]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                    {opt.title}
                  </span>
                  {opt.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0D0D0D]/10 dark:bg-white/10 text-[#0D0D0D] dark:text-white">
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] mt-0.5">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. JPEG Quality Compression Slider */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'جودة ضغط JPEG:' : 'JPEG Quality Factor:'}
          </span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
            {Math.round(selectedQuality * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.75"
          max="1.0"
          step="0.02"
          value={selectedQuality}
          onChange={e => onQualityChange(parseFloat(e.target.value))}
          className="w-full accent-[#0D0D0D] dark:accent-white cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
          <span>{isAr ? 'أصغر حجماً (75%)' : 'Compact (75%)'}</span>
          <span>{isAr ? 'أقصى نقاء (100%)' : 'Maximum (100%)'}</span>
        </div>
      </div>

      {/* 4. Anti-Spam & Client-Side Privacy Guarantee */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'ضمان التجميع في أرشيف واحد:' : 'Clean ZIP Bundling Guarantee:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'تتم معالجة المستندات متعددة الصفحات وتجميعها بأمان تام داخل المتصفح في ملف ZIP واحد دون إرسال أي صور لخوادم خارجية أو إزعاجك بنوافذ تنزيل متكررة.'
            : 'Multi-page PDFs are automatically bundled into a single ZIP archive client-side without annoying popup spam or external server uploads.'}
        </p>
      </div>
    </div>
  );
};
