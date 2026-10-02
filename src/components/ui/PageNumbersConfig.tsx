import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck } from 'lucide-react';
import { PageNumberPosition, PageNumberFormat } from '../../services/pageNumbersEngine';

interface PageNumbersConfigProps {
  position: PageNumberPosition;
  onPositionChange: (pos: PageNumberPosition) => void;
  format: PageNumberFormat;
  onFormatChange: (fmt: PageNumberFormat) => void;
  fontSize: number;
  onFontSizeChange: (sz: number) => void;
  margin: number;
  onMarginChange: (m: number) => void;
  startNumber: number;
  onStartNumberChange: (n: number) => void;
  excludeFirstPage: boolean;
  onExcludeFirstPageChange: (ex: boolean) => void;
  pageCount?: number;
}

export const PageNumbersConfig: React.FC<PageNumbersConfigProps> = ({
  position,
  onPositionChange,
  format,
  onFormatChange,
  fontSize,
  onFontSizeChange,
  margin,
  onMarginChange,
  startNumber,
  onStartNumberChange,
  excludeFirstPage,
  onExcludeFirstPageChange,
  pageCount: _pageCount,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const positionOptions: { id: PageNumberPosition; labelEn: string; labelAr: string }[] = [
    { id: 'top-left', labelEn: 'Top Left', labelAr: 'أعلى اليسار' },
    { id: 'top-center', labelEn: 'Top Center', labelAr: 'أعلى الوسط' },
    { id: 'top-right', labelEn: 'Top Right', labelAr: 'أعلى اليمين' },
    { id: 'bottom-left', labelEn: 'Bottom Left', labelAr: 'أسفل اليسار' },
    { id: 'bottom-center', labelEn: 'Bottom Center', labelAr: 'أسفل الوسط' },
    { id: 'bottom-right', labelEn: 'Bottom Right', labelAr: 'أسفل اليمين' },
  ];

  const formatOptions: { id: PageNumberFormat; sampleEn: string; sampleAr: string }[] = [
    { id: 'page_x_of_y', sampleEn: 'Page 1 of 5', sampleAr: 'صفحة 1 من 5' },
    { id: 'x_of_y', sampleEn: '1 of 5', sampleAr: '1 من 5' },
    { id: 'page_x', sampleEn: 'Page 1', sampleAr: 'صفحة 1' },
    { id: 'standard', sampleEn: '1, 2, 3...', sampleAr: '1، 2، 3...' },
    { id: 'roman', sampleEn: 'I, II, III...', sampleAr: 'I، II، III...' },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Position Selector Grid */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center justify-between">
          <span>{isAr ? 'موقع رقم الصفحة على الورقة:' : 'Numbering Placement Position:'}</span>
          <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] font-mono">
            Dynamic (x, y)
          </span>
        </label>

        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-[#F5F0E6]/50 dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626]">
          {positionOptions.map(pos => {
            const isSelected = position === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => onPositionChange(pos.id)}
                className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all text-center ${
                  isSelected
                    ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] shadow-xs'
                    : 'bg-white/80 dark:bg-[#1F1F1F] text-[#383B3F] dark:text-[#C7C9CC] hover:bg-white dark:hover:bg-[#262626]'
                }`}
              >
                {isAr ? pos.labelAr : pos.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Numbering Format Selector */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          {isAr ? 'صيغة ونمط الترقيم:' : 'Numbering Text Format:'}
        </label>

        <div className="grid grid-cols-1 gap-1.5">
          {formatOptions.map(fmt => {
            const isSelected = format === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => onFormatChange(fmt.id)}
                className={`p-2.5 rounded-xl border text-left rtl:text-right font-medium text-[11px] flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1C1C1C] text-[#0D0D0D] dark:text-white shadow-xs font-bold'
                    : 'border-[#C7C9CC] dark:border-[#2C2F33] bg-white dark:bg-[#141414] text-[#5A5D61] dark:text-[#A0A2A6] hover:border-[#0D0D0D] dark:hover:border-white'
                }`}
              >
                <span>{isAr ? fmt.sampleAr : fmt.sampleEn}</span>
                {isSelected && <span className="text-[10px] font-mono font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sliders & Advanced Options */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-3">
        {/* Font Size */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'حجم الخط:' : 'Font Size:'}
            </span>
            <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
              {fontSize} pt
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={18}
            step={1}
            value={fontSize}
            onChange={e => onFontSizeChange(Number(e.target.value))}
            className="w-full accent-[#0D0D0D] dark:accent-white"
          />
        </div>

        {/* Margin */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'الهامش عن الحافة:' : 'Edge Margin:'}
            </span>
            <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
              {margin} pt
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={60}
            step={1}
            value={margin}
            onChange={e => onMarginChange(Number(e.target.value))}
            className="w-full accent-[#0D0D0D] dark:accent-white"
          />
        </div>

        {/* Start Number & Exclude Cover */}
        <div className="pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] text-[11px]">
              {isAr ? 'البدء من الرقم:' : 'Start Numbering From:'}
            </span>
            <input
              type="number"
              min={1}
              max={9999}
              value={startNumber}
              onChange={e => onStartNumberChange(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 p-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono font-bold text-center text-xs"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={excludeFirstPage}
              onChange={e => onExcludeFirstPageChange(e.target.checked)}
              className="rounded accent-[#0D0D0D] dark:accent-white"
            />
            <span className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0]">
              {isAr ? 'استثناء صفحة الغلاف الأولى من الترقيم' : 'Exclude first page (cover page)'}
            </span>
          </label>
        </div>
      </div>

      {/* 4. Dynamic Math Coordinate Guarantee Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'حساب إحداثيات ديناميكي لكل صفحة:' : 'Dynamic Per-Page Coordinate Math:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'تُحسب إحداثيات (x, y) ديناميكياً بناءً على العرض والارتفاع الفعلي لكل صفحة مع قياس عرض النص بالبكسل لضمان توسط الرقم تماماً.'
            : 'Coordinates (x, y) are computed per page based on its unique width/height and exact text width, ensuring perfect centering.'}
        </p>
      </div>
    </div>
  );
};
