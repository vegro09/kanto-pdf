import React from 'react';
import { useApp } from '../../context/AppContext';
import { RedactionBox } from '../../services/redactEngine';
import { ShieldAlert, Trash2, Plus } from 'lucide-react';

interface RedactConfigProps {
  redactions: RedactionBox[];
  onAddRedaction: (box: RedactionBox) => void;
  onRemoveRedaction: (id: string) => void;
  onClearAll: () => void;
  selectedPage: number;
  onSelectPage: (page: number) => void;
  totalPages: number;
  redactionColor: 'black' | 'white';
  onColorChange: (color: 'black' | 'white') => void;
}

export const RedactConfig: React.FC<RedactConfigProps> = ({
  redactions,
  onAddRedaction,
  onRemoveRedaction,
  onClearAll,
  selectedPage,
  onSelectPage,
  totalPages,
  redactionColor,
  onColorChange,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const currentPageRedactions = redactions.filter(r => r.pageNumber === selectedPage);

  const handleAddDefaultBox = () => {
    const newBox: RedactionBox = {
      id: `redact-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      pageNumber: selectedPage,
      xPercent: 15,
      yPercent: 30 + (currentPageRedactions.length * 8) % 50,
      widthPercent: 70,
      heightPercent: 6,
      color: redactionColor,
    };
    onAddRedaction(newBox);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Security Guarantee Banner */}
      <div className="p-3.5 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#0D0D0D] dark:border-white space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6]">
            <ShieldAlert size={18} />
            <span>{isAr ? 'حجب نهائي وإتلاف دائم للبيانات' : 'True Permanent Redaction'}</span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]">
            SECURE
          </span>
        </div>
        <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
          {isAr
            ? 'يتم حذف النصوص والصور والبيانات الوصفية نهائياً من بنية الملف ولا يمكن استرجاعها عبر النسخ أو محركات البحث.'
            : 'Underlying text, pixel vectors, and metadata are permanently obliterated and unrecoverable via copy-paste.'}
        </p>
      </div>

      {/* 2. Target Page & Redaction Style Options */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-3">
        {/* Page selector if multi-page */}
        {totalPages > 1 && (
          <div>
            <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block mb-1">
              {isAr ? 'الصفحة المستهدفة للحجب:' : 'Target Page for Redaction:'}
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedPage}
                onChange={e => onSelectPage(Number(e.target.value))}
                className="w-full kanto-input text-xs font-bold"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p}>
                    {isAr ? `الصفحة ${p} من ${totalPages}` : `Page ${p} of ${totalPages}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Style Color */}
        <div>
          <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block mb-1.5">
            {isAr ? 'لون شريط الحجب:' : 'Redaction Overlay Color:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onColorChange('black')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                redactionColor === 'black'
                  ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D]'
                  : 'bg-white text-[#0D0D0D] border-[#C7C9CC] dark:bg-[#181818] dark:text-[#F5F0E6] dark:border-[#333]'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black border border-gray-400" />
              <span>{isAr ? 'شريط أسود (كلاسيكي)' : 'Solid Black'}</span>
            </button>

            <button
              type="button"
              onClick={() => onColorChange('white')}
              className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                redactionColor === 'white'
                  ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D]'
                  : 'bg-white text-[#0D0D0D] border-[#C7C9CC] dark:bg-[#181818] dark:text-[#F5F0E6] dark:border-[#333]'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400" />
              <span>{isAr ? 'تبييض (Whiteout)' : 'Whiteout'}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Add Redaction Region */}
        <button
          type="button"
          onClick={handleAddDefaultBox}
          className="w-full py-2.5 px-3 rounded-lg bg-[#0D0D0D] hover:bg-black text-white dark:bg-white dark:hover:bg-[#F5F0E6] dark:text-[#0D0D0D] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>{isAr ? `إضافة منطقة حجب على الصفحة ${selectedPage}` : `Add Redaction Box to Page ${selectedPage}`}</span>
        </button>
      </div>

      {/* 3. Active Redactions Deck */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? `المناطق المحجوبة (${redactions.length})` : `Active Redaction Boxes (${redactions.length})`}
          </span>
          {redactions.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-bold text-[#5A5D61] hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>{isAr ? 'مسح الكل' : 'Clear All'}</span>
            </button>
          )}
        </div>

        {redactions.length === 0 ? (
          <div className="text-center py-4 text-[#5A5D61] dark:text-[#A0A2A6] text-xs">
            {isAr
              ? 'لم تقم بتحديد أي مناطق للحجب بعد. اضغط "إضافة منطقة حجب" أو اسحب الماوس فوق المعاينة.'
              : 'No redaction boxes added yet. Click "Add Redaction Box" or drag directly on the page.'}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {redactions.map((box, idx) => (
              <div
                key={box.id}
                className="p-2 rounded-lg bg-[#F5F0E6]/60 dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333] flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">#{idx + 1}</span>
                  <span className="font-semibold text-[#383B3F] dark:text-[#B8BAC0]">
                    {isAr ? `صفحة ${box.pageNumber}` : `Page ${box.pageNumber}`}
                  </span>
                  <span className="text-[10px] font-mono text-[#5A5D61]">
                    ({Math.round(box.widthPercent)}% × {Math.round(box.heightPercent)}%)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveRedaction(box.id)}
                  className="p-1 text-[#5A5D61] hover:text-red-500 transition-colors"
                  title="Remove redaction box"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
