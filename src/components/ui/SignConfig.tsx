import React from 'react';
import { useApp } from '../../context/AppContext';
import { SignatureCaptureBox } from './SignatureCaptureBox';
import { SignaturePosition } from '../../services/signEngine';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface SignConfigProps {
  signatureDataUrl?: string | null;
  onSignatureChange: (url: string | null) => void;
  placementMode: 'current' | 'last' | 'all' | 'custom';
  onPlacementModeChange: (mode: 'current' | 'last' | 'all' | 'custom') => void;
  targetPage: number;
  onTargetPageChange: (page: number) => void;
  totalPages: number;
  position: SignaturePosition;
  onPositionChange: (pos: SignaturePosition) => void;
}

export const SignConfig: React.FC<SignConfigProps> = ({
  signatureDataUrl,
  onSignatureChange,
  placementMode,
  onPlacementModeChange,
  targetPage,
  onTargetPageChange,
  totalPages,
  position,
  onPositionChange,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const positionPresets: {
    labelEn: string;
    labelAr: string;
    pos: Partial<SignaturePosition>;
  }[] = [
    { labelEn: 'Bottom-Right', labelAr: 'أسفل اليمين (قياسي)', pos: { xPercent: 62, yPercent: 78 } },
    { labelEn: 'Bottom-Left', labelAr: 'أسفل اليسار', pos: { xPercent: 12, yPercent: 78 } },
    { labelEn: 'Bottom-Center', labelAr: 'أسفل الوسط', pos: { xPercent: 36, yPercent: 78 } },
  ];

  return (
    <div className="space-y-5 text-xs">
      {/* 1. Signature Capture & Method Selector */}
      <div className="space-y-2">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center justify-between text-xs">
          <span>{isAr ? '1. إنشاء / اختيار التوقيع:' : '1. Create or Upload Signature:'}</span>
          {signatureDataUrl && (
            <span className="text-[10px] text-[#0D0D0D] dark:text-white font-mono flex items-center gap-1">
              <CheckCircle2 size={11} />
              <span>{isAr ? 'جاهز للتطبيق' : 'Signature Ready'}</span>
            </span>
          )}
        </label>
        <SignatureCaptureBox
          onSignatureChange={onSignatureChange}
          initialSignatureUrl={signatureDataUrl}
        />
      </div>

      {/* 2. Target Page(s) Selector */}
      <div className="space-y-2 pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626]">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block text-xs">
          {isAr ? '2. الصفحات المستهدفة للتوقيع:' : '2. Target Signing Pages:'}
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'current', titleEn: `Page ${targetPage}`, titleAr: `صفحة ${targetPage}`, page: targetPage },
            { id: 'last', titleEn: `Last Page (${totalPages})`, titleAr: `الأخيرة (${totalPages})`, page: totalPages },
            { id: 'all', titleEn: `All Pages (${totalPages})`, titleAr: `جميع الصفحات (${totalPages})`, page: 1 },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onPlacementModeChange(opt.id as 'current' | 'last' | 'all');
                if (opt.id === 'last') onTargetPageChange(totalPages);
              }}
              className={`p-2.5 rounded-xl border text-center font-bold text-[11px] transition-colors ${
                placementMode === opt.id
                  ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D] shadow-xs'
                  : 'bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] border-[#C7C9CC] dark:border-[#2C2F33] hover:bg-[#F5F0E6]'
              }`}
            >
              {isAr ? opt.titleAr : opt.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Signature Size & Position Controls */}
      <div className="space-y-3 pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626]">
        <div className="flex items-center justify-between">
          <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] text-xs">
            {isAr ? '3. موضع وحجم التوقيع:' : '3. Size & Page Placement:'}
          </label>
        </div>

        {/* Position Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {positionPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onPositionChange({ ...position, ...preset.pos })}
              className="px-2.5 py-1 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] text-[10px] font-semibold transition-colors"
            >
              {isAr ? preset.labelAr : preset.labelEn}
            </button>
          ))}
        </div>

        {/* Sliders for Width, X, Y */}
        <div className="space-y-2 bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] p-3 rounded-xl border border-[#C7C9CC]/60 dark:border-[#2C2F33]">
          <div>
            <div className="flex justify-between font-semibold text-[11px] mb-1">
              <span>{isAr ? 'عرض التوقيع (%):' : 'Signature Width:'}</span>
              <span className="font-mono">{position.widthPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="1"
              value={position.widthPercent}
              onChange={e => {
                const w = parseInt(e.target.value, 10);
                onPositionChange({
                  ...position,
                  widthPercent: w,
                  heightPercent: Math.round(w * 0.4), // proportional aspect ratio
                });
              }}
              className="w-full accent-[#0D0D0D] dark:accent-[#C7C9CC]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between font-semibold text-[10px] mb-1">
                <span>{isAr ? 'أفقي (X):' : 'Horizontal (X):'}</span>
                <span className="font-mono">{position.xPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={100 - position.widthPercent}
                value={position.xPercent}
                onChange={e => onPositionChange({ ...position, xPercent: parseInt(e.target.value, 10) })}
                className="w-full accent-[#0D0D0D] dark:accent-[#C7C9CC]"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[10px] mb-1">
                <span>{isAr ? 'رأسي (Y):' : 'Vertical (Y):'}</span>
                <span className="font-mono">{position.yPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max={100 - position.heightPercent}
                value={position.yPercent}
                onChange={e => onPositionChange({ ...position, yPercent: parseInt(e.target.value, 10) })}
                className="w-full accent-[#0D0D0D] dark:accent-[#C7C9CC]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Stamp Notice */}
      <div className="p-3 rounded-xl bg-[#F5F0E6] dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] flex items-center gap-2 text-[11px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
        <ShieldCheck size={16} className="shrink-0 text-[#0D0D0D] dark:text-[#C7C9CC]" />
        <span>{isAr ? 'يتم ختم التوقيع مباشرة في ذاكرة الرام محلياً' : 'Embedded natively in local RAM with zero data exposure'}</span>
      </div>
    </div>
  );
};
