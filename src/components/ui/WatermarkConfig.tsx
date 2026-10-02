import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck } from 'lucide-react';

interface WatermarkConfigProps {
  watermarkText: string;
  onWatermarkTextChange: (text: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  rotation: number;
  onRotationChange: (deg: number) => void;
  color: string;
  onColorChange: (color: string) => void;
  pageCount: number;
}

export const WatermarkConfig: React.FC<WatermarkConfigProps> = ({
  watermarkText,
  onWatermarkTextChange,
  fontSize,
  onFontSizeChange,
  opacity,
  onOpacityChange,
  rotation,
  onRotationChange,
  color,
  onColorChange,
  pageCount,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const textPresets = isAr
    ? [
        { label: 'سري للغاية', text: 'سري للغاية' },
        { label: 'مسودة', text: 'مسودة عمل' },
        { label: 'نسخة طبق الأصل', text: 'نسخة طبق الأصل' },
        { label: 'CONFIDENTIAL', text: 'CONFIDENTIAL' },
      ]
    : [
        { label: 'CONFIDENTIAL', text: 'CONFIDENTIAL' },
        { label: 'DRAFT', text: 'DRAFT' },
        { label: 'COPY', text: 'COPY — DO NOT SHARE' },
        { label: 'سري للغاية', text: 'سري للغاية' },
      ];

  const colorPalette = [
    { label: 'Crimson Red', hex: '#DC2626' },
    { label: 'Charcoal Black', hex: '#1F2937' },
    { label: 'Deep Blue', hex: '#1E3A8A' },
    { label: 'Emerald Green', hex: '#059669' },
    { label: 'Slate Gray', hex: '#64748B' },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Watermark Text Input & Quick Presets */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center justify-between">
          <span>{isAr ? 'نص العلامة المائية:' : 'Watermark Text:'}</span>
          <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] font-mono">
            {isAr ? 'عربي / إنجليزي مدعوم 100%' : 'Unicode & Arabic Ready'}
          </span>
        </label>

        <input
          type="text"
          value={watermarkText}
          onChange={e => onWatermarkTextChange(e.target.value)}
          placeholder={isAr ? 'أدخل نص العلامة المائية...' : 'Enter watermark text...'}
          className="w-full px-3 py-2.5 rounded-xl border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-white font-medium text-xs focus:outline-hidden focus:border-[#0D0D0D] dark:focus:border-white shadow-xs"
        />

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {textPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onWatermarkTextChange(preset.text)}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
                watermarkText === preset.text
                  ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent shadow-xs'
                  : 'bg-[#F5F0E6]/60 dark:bg-[#1A1A1A] border-[#C7C9CC] dark:border-[#2C2F33] text-[#383B3F] dark:text-[#B8BAC0] hover:border-[#0D0D0D]/40'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Typography & Color Controls */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-3">
        {/* Font Size Slider */}
        <div>
          <div className="flex justify-between font-semibold text-[11px] mb-1">
            <span className="text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'حجم الخط:' : 'Font Size:'}
            </span>
            <span className="font-mono text-[#0D0D0D] dark:text-white font-bold">{fontSize} pt</span>
          </div>
          <input
            type="range"
            min="20"
            max="80"
            step="2"
            value={fontSize}
            onChange={e => onFontSizeChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#0D0D0D] dark:accent-white"
          />
        </div>

        {/* Opacity Slider */}
        <div>
          <div className="flex justify-between font-semibold text-[11px] mb-1">
            <span className="text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'درجة الشفافية (Opacity):' : 'Opacity:'}
            </span>
            <span className="font-mono text-[#0D0D0D] dark:text-white font-bold">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={Math.round(opacity * 100)}
            onChange={e => onOpacityChange(parseInt(e.target.value, 10) / 100)}
            className="w-full accent-[#0D0D0D] dark:accent-white"
          />
        </div>

        {/* Color Palette */}
        <div>
          <span className="text-[11px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] block mb-1.5">
            {isAr ? 'لون العلامة المائية:' : 'Watermark Color:'}
          </span>
          <div className="flex items-center gap-2">
            {colorPalette.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onColorChange(c.hex)}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c.hex
                    ? 'border-[#0D0D0D] dark:border-white scale-110 shadow-xs'
                    : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Rotation Angle Selector */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'زاوية التدوير (Rotation):' : 'Rotation Angle:'}
          </span>
          <span className="font-mono text-[11px] font-bold text-[#0D0D0D] dark:text-white">
            {rotation}°
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: '45° (Diagonal)', angle: 45 },
            { label: '-45° (Reverse)', angle: -45 },
            { label: '0° (Horizontal)', angle: 0 },
          ].map(opt => (
            <button
              key={opt.angle}
              type="button"
              onClick={() => onRotationChange(opt.angle)}
              className={`py-2 rounded-xl border text-center font-bold text-[10px] transition-all ${
                rotation === opt.angle
                  ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D] shadow-xs'
                  : 'bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] border-[#C7C9CC] dark:border-[#2C2F33] hover:bg-[#F5F0E6]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Batch Stamping Guarantee Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'تطبيق تلقائي على كافة الصفحات:' : '100% Batch Stamping Guarantee:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? `سيتم وسم جميع صفحات المستند (${pageCount} صفحة) في المركز تماماً مع الحفاظ التام على النصوص العربية.`
            : `Watermark is automatically center-anchored and stamped across all ${pageCount} pages with zero WinAnsi encoding crashes.`}
        </p>
      </div>
    </div>
  );
};
