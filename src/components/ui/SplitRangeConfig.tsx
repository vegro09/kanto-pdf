import React from 'react';
import { SplitRange } from '../../services/splitEngine';
import { Layers, FileText, AlertCircle, Sparkles } from 'lucide-react';

interface SplitRangeConfigProps {
  splitMode: 'ranges' | 'interval';
  setSplitMode: (mode: 'ranges' | 'interval') => void;
  rangeInput: string;
  setRangeInput: (val: string) => void;
  intervalValue: number;
  setIntervalValue: (val: number) => void;
  totalDocPages: number;
  activeRanges: SplitRange[];
  validationError?: string;
  isArabic?: boolean;
}

export const SplitRangeConfig: React.FC<SplitRangeConfigProps> = ({
  splitMode,
  setSplitMode,
  rangeInput,
  setRangeInput,
  intervalValue,
  setIntervalValue,
  totalDocPages,
  activeRanges,
  validationError,
  isArabic = false,
}) => {
  const handleSplitInHalf = () => {
    const mid = Math.ceil(totalDocPages / 2);
    setRangeInput(`1-${mid}, ${mid + 1}-${totalDocPages}`);
  };

  const handleExtractAllIndividual = () => {
    setSplitMode('interval');
    setIntervalValue(1);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Mode Selector Tabs */}
      <div>
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block mb-1.5">
          {isArabic ? 'طريقة التقسيم' : 'Split Method'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSplitMode('ranges')}
            className={`p-2.5 rounded-lg border font-semibold text-center transition-colors duration-250 ease-apple flex items-center justify-center gap-1.5 ${
              splitMode === 'ranges'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D]'
                : 'bg-[#F5F0E6] dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#F5F0E6] border-[#C7C9CC] dark:border-[#333333] hover:bg-white'
            }`}
          >
            <Layers size={14} />
            <span>{isArabic ? 'نطاقات مخصصة' : 'Custom Ranges'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitMode('interval')}
            className={`p-2.5 rounded-lg border font-semibold text-center transition-colors duration-250 ease-apple flex items-center justify-center gap-1.5 ${
              splitMode === 'interval'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D]'
                : 'bg-[#F5F0E6] dark:bg-[#1A1A1A] text-[#0D0D0D] dark:text-[#F5F0E6] border-[#C7C9CC] dark:border-[#333333] hover:bg-white'
            }`}
          >
            <FileText size={14} />
            <span>{isArabic ? 'كل عدد صفحات' : 'Every N Pages'}</span>
          </button>
        </div>
      </div>

      {/* 2. Custom Ranges Mode Controls */}
      {splitMode === 'ranges' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isArabic ? 'تحديد النطاقات (مفصولة بفواصل)' : 'Specify Ranges (comma-separated)'}
            </label>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] font-mono">
              Total: {totalDocPages} pages
            </span>
          </div>

          <input
            type="text"
            value={rangeInput}
            onChange={e => setRangeInput(e.target.value)}
            placeholder="e.g. 1-3, 4-6, 7-10"
            className="w-full kanto-input text-xs font-mono font-bold"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={handleSplitInHalf}
              className="px-2 py-1 rounded bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] dark:border-[#333333] text-[10px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white transition-colors"
            >
              {isArabic ? 'تقسيم إلى نصفين' : 'Split in Half'}
            </button>
            <button
              type="button"
              onClick={handleExtractAllIndividual}
              className="px-2 py-1 rounded bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] dark:border-[#333333] text-[10px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#0D0D0D] hover:text-white transition-colors"
            >
              {isArabic ? 'فصل كل صفحة منفردة' : 'Extract Each Page (1 by 1)'}
            </button>
          </div>

          {/* Inline Validation Error Banner */}
          {validationError && (
            <div className="p-2.5 rounded-lg bg-[#F5F0E6] dark:bg-[#261E1A] border border-[#0D0D0D] dark:border-[#5C2E2E] text-[11px] text-[#0D0D0D] dark:text-[#FFB4B4] font-semibold flex items-start gap-1.5">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Split by Interval Mode Controls */}
      {splitMode === 'interval' && (
        <div className="space-y-2">
          <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
            {isArabic ? 'تقسيم المستند كل (عدد الصفحات):' : 'Split Document Every (Pages):'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalDocPages - 1}
              value={intervalValue}
              onChange={e => setIntervalValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 kanto-input text-xs font-mono font-bold text-center"
            />
            <span className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
              {isArabic ? `صفحات لكل ملف (إجمالي ${activeRanges.length} ملفات)` : `pages per file (${activeRanges.length} total files)`}
            </span>
          </div>
        </div>
      )}

      {/* 4. Visual Output Plan List */}
      <div className="pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>{isArabic ? 'خطة التقسيم المتوقعة:' : 'Planned Split Output:'}</span>
          </span>
          <span className="font-mono text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {activeRanges.length === 1 ? (isArabic ? 'ملف PDF واحد' : '1 Single PDF') : (isArabic ? `أرشيف ZIP (${activeRanges.length} ملفات)` : `${activeRanges.length} Files in ZIP`)}
          </span>
        </div>

        {activeRanges.length > 0 ? (
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {activeRanges.map((r, i) => (
              <div
                key={r.id}
                className="p-2 rounded bg-[#F5F0E6]/60 dark:bg-[#1F1F1F] border border-[#C7C9CC]/60 dark:border-[#333333] flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                  <span className="w-5 h-5 rounded-full bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] flex items-center justify-center text-[10px] font-mono">
                    {i + 1}
                  </span>
                  <span>{r.label}</span>
                </div>
                <span className="text-[#5A5D61] dark:text-[#A0A2A6] font-mono text-[10px]">
                  {r.pageCount} {r.pageCount === 1 ? 'page' : 'pages'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded text-center text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {isArabic ? 'يرجى إدخال نطاقات صالحة للمعاينة.' : 'Enter valid ranges to preview output.'}
          </div>
        )}
      </div>
    </div>
  );
};
