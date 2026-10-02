import React from 'react';
import { useApp } from '../../context/AppContext';
import { CompressPreset, COMPRESS_PRESETS } from '../../services/compressEngine';
import { Zap, Sparkles, Feather, Check, HardDrive } from 'lucide-react';

interface CompressPresetConfigProps {
  currentPreset: CompressPreset;
  onSelectPreset: (preset: CompressPreset) => void;
  originalSizeBytes: number;
}

export const CompressPresetConfig: React.FC<CompressPresetConfigProps> = ({
  currentPreset,
  onSelectPreset,
  originalSizeBytes,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const presets: {
    id: CompressPreset;
    icon: typeof Zap;
    badgeEn: string;
    badgeAr: string;
  }[] = [
    {
      id: 'extreme',
      icon: Zap,
      badgeEn: 'Max Size Reduction',
      badgeAr: 'أقصى تقليص للحجم',
    },
    {
      id: 'recommended',
      icon: Sparkles,
      badgeEn: 'Recommended • Balanced',
      badgeAr: 'موصى به • توازن مثالي',
    },
    {
      id: 'high_quality',
      icon: Feather,
      badgeEn: 'High Fidelity',
      badgeAr: 'أعلى دقة ووضوح',
    },
  ];

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Original Document Size Indicator */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#0D0D0D] dark:text-[#F5F0E6] font-bold">
          <HardDrive size={15} className="text-[#383B3F] dark:text-[#B8BAC0]" />
          <span>{isAr ? 'حجم الملف الأصلي:' : 'Original Document Size:'}</span>
        </div>
        <span className="font-mono font-bold text-sm text-[#0D0D0D] dark:text-white px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC]/80 dark:border-[#333333]">
          {formatSize(originalSizeBytes)}
        </span>
      </div>

      <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block text-xs tracking-wide">
        {isAr ? 'اختر مستوى الضغط المطلوب:' : 'Select Compression Preset:'}
      </label>

      {/* Preset Cards */}
      <div className="space-y-2.5">
        {presets.map(item => {
          const config = COMPRESS_PRESETS[item.id];
          const isSelected = currentPreset === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPreset(item.id)}
              className={`w-full p-4 text-start rounded-[16px] border transition-all duration-250 ease-apple flex flex-col justify-between gap-2 shadow-xs group ${
                isSelected
                  ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D] dark:border-white ring-2 ring-[#0D0D0D]/10 dark:ring-white/20'
                  : 'bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] border-[#C7C9CC] dark:border-[#2C2F33] hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    isSelected
                      ? 'bg-white/20 text-white dark:bg-black/10 dark:text-[#0D0D0D]'
                      : 'bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6]'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-bold text-sm">
                    {isAr ? config.titleAr : config.titleEn}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    isSelected
                      ? 'bg-white/20 border-white/30 text-white dark:bg-black/20 dark:border-black/30 dark:text-[#0D0D0D]'
                      : 'bg-[#F5F0E6] dark:bg-[#1F1F1F] border-[#C7C9CC] dark:border-[#333333] text-[#383B3F] dark:text-[#B8BAC0]'
                  }`}>
                    {isAr ? item.badgeAr : item.badgeEn}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-[#0D0D0D] dark:bg-[#0D0D0D] dark:text-white flex items-center justify-center font-bold">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${
                isSelected ? 'text-white/80 dark:text-[#0D0D0D]/80' : 'text-[#383B3F] dark:text-[#B8BAC0]'
              }`}>
                {isAr ? config.descAr : config.descEn}
              </p>

              <div className={`flex items-center justify-between pt-2 border-t text-[10px] font-mono ${
                isSelected
                  ? 'border-white/20 dark:border-black/10 text-white/90 dark:text-[#0D0D0D]/90'
                  : 'border-[#C7C9CC]/40 dark:border-[#262626] text-[#383B3F] dark:text-[#B8BAC0]'
              }`}>
                <span>Resolution: {config.targetDpi}</span>
                <span>Expected: {config.expectedReduction}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
