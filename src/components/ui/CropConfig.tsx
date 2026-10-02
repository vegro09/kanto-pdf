import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { CropBoxRegion } from '../../services/cropEngine';

interface CropConfigProps {
  cropBox: CropBoxRegion;
  onCropBoxChange: (box: CropBoxRegion) => void;
  applyToAllPages: boolean;
  onApplyToAllPagesChange: (val: boolean) => void;
  activePageIndex: number;
  totalPages: number;
}

export const CropConfig: React.FC<CropConfigProps> = ({
  cropBox,
  onCropBoxChange,
  applyToAllPages,
  onApplyToAllPagesChange,
  activePageIndex: _activePageIndex,
  totalPages,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const presets: {
    id: string;
    labelEn: string;
    labelAr: string;
    box: CropBoxRegion;
  }[] = [
    {
      id: 'bottom_half',
      labelEn: 'Keep Bottom Half (50%)',
      labelAr: 'الاحتفاظ بالنصف السفلي (50%)',
      box: { xPercent: 0, yPercent: 50, widthPercent: 100, heightPercent: 50 },
    },
    {
      id: 'top_half',
      labelEn: 'Keep Top Half (50%)',
      labelAr: 'الاحتفاظ بالنصف العلوي (50%)',
      box: { xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 50 },
    },
    {
      id: 'inset_5',
      labelEn: 'Trim 5% Margins',
      labelAr: 'اقتصاص هوامش 5%',
      box: { xPercent: 5, yPercent: 5, widthPercent: 90, heightPercent: 90 },
    },
    {
      id: 'inset_10',
      labelEn: 'Trim 10% Margins',
      labelAr: 'اقتصاص هوامش 10%',
      box: { xPercent: 10, yPercent: 10, widthPercent: 80, heightPercent: 80 },
    },
    {
      id: 'full_page',
      labelEn: 'Full Page (100%)',
      labelAr: 'كامل الصفحة (100%)',
      box: { xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100 },
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Quick Crop Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'نماذج وقوالب القص السريعة:' : 'Quick Crop Presets:'}
          </label>
          <button
            type="button"
            onClick={() =>
              onCropBoxChange({
                xPercent: 0,
                yPercent: 0,
                widthPercent: 100,
                heightPercent: 100,
              })
            }
            className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white flex items-center gap-1"
          >
            <RotateCcw size={10} />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {presets.map(preset => {
            const isMatch =
              Math.abs(cropBox.xPercent - preset.box.xPercent) < 0.5 &&
              Math.abs(cropBox.yPercent - preset.box.yPercent) < 0.5 &&
              Math.abs(cropBox.widthPercent - preset.box.widthPercent) < 0.5 &&
              Math.abs(cropBox.heightPercent - preset.box.heightPercent) < 0.5;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onCropBoxChange(preset.box)}
                className={`p-2.5 rounded-xl border text-left rtl:text-right font-medium text-[11px] flex items-center justify-between transition-all ${
                  isMatch
                    ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1C1C1C] text-[#0D0D0D] dark:text-white shadow-xs font-bold'
                    : 'border-[#C7C9CC] dark:border-[#2C2F33] bg-white dark:bg-[#141414] text-[#5A5D61] dark:text-[#A0A2A6] hover:border-[#0D0D0D] dark:hover:border-white'
                }`}
              >
                <span>{isAr ? preset.labelAr : preset.labelEn}</span>
                {isMatch && <span className="text-[10px] font-mono font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Numeric Dimension Controls */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
          {isAr ? 'الضبط الدقيق للإحداثيات (%):' : 'Fine-Tune Coordinates (%):'}
        </label>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block mb-0.5">
              X ({isAr ? 'من اليسار' : 'Left'}):
            </span>
            <input
              type="number"
              min={0}
              max={95}
              value={cropBox.xPercent}
              onChange={e =>
                onCropBoxChange({
                  ...cropBox,
                  xPercent: Math.max(0, Math.min(95, Number(e.target.value) || 0)),
                })
              }
              className="w-full p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono font-bold text-center text-xs"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block mb-0.5">
              Y ({isAr ? 'من الأعلى' : 'Top'}):
            </span>
            <input
              type="number"
              min={0}
              max={95}
              value={cropBox.yPercent}
              onChange={e =>
                onCropBoxChange({
                  ...cropBox,
                  yPercent: Math.max(0, Math.min(95, Number(e.target.value) || 0)),
                })
              }
              className="w-full p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono font-bold text-center text-xs"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block mb-0.5">
              {isAr ? 'العرض (%):' : 'Width (%):'}
            </span>
            <input
              type="number"
              min={5}
              max={100}
              value={cropBox.widthPercent}
              onChange={e =>
                onCropBoxChange({
                  ...cropBox,
                  widthPercent: Math.max(5, Math.min(100 - cropBox.xPercent, Number(e.target.value) || 100)),
                })
              }
              className="w-full p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono font-bold text-center text-xs"
            />
          </div>

          <div>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block mb-0.5">
              {isAr ? 'الارتفاع (%):' : 'Height (%):'}
            </span>
            <input
              type="number"
              min={5}
              max={100}
              value={cropBox.heightPercent}
              onChange={e =>
                onCropBoxChange({
                  ...cropBox,
                  heightPercent: Math.max(5, Math.min(100 - cropBox.yPercent, Number(e.target.value) || 100)),
                })
              }
              className="w-full p-1.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono font-bold text-center text-xs"
            />
          </div>
        </div>

        {/* Apply to All Pages Toggle */}
        <div className="pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={applyToAllPages}
              onChange={e => onApplyToAllPagesChange(e.target.checked)}
              className="rounded accent-[#0D0D0D] dark:accent-white"
            />
            <span className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0]">
              {isAr
                ? `تطبيق القص على كافة الصفحات (${totalPages} صفحة)`
                : `Apply crop to all ${totalPages} page(s)`}
            </span>
          </label>
        </div>
      </div>

      {/* 3. Structural Metadata & Vector Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'قص هيكلي بالبيانات الوصفية بدون تنقيط:' : 'Structural Metadata CropBox (No Rasterization):'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'يتم تطبيق القص مباشرة عبر تعديل مصفوفة CropBox في ملف PDF مع عكس محور Y. تبقى كافة النصوص قابلة للتحديد وتحتفظ المتجهات بكامل دقتها الأصلية.'
            : 'Cropping modifies page CropBox metadata directly with Y-axis inversion. Text remains 100% selectable and vectors retain original sharpness.'}
        </p>
      </div>
    </div>
  );
};
