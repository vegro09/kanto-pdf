import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Sparkles, FileType2 } from 'lucide-react';

interface WordConversionConfigProps {
  filename: string;
  pageCount: number;
  totalChars?: number;
}

export const WordConversionConfig: React.FC<WordConversionConfigProps> = ({
  filename,
  pageCount,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4 text-xs">
      {/* Target Format Banner */}
      <div className="p-4 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] flex items-center justify-center font-bold">
            <FileType2 size={20} />
          </div>
          <div>
            <span className="font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6] block">
              Microsoft Word (.docx)
            </span>
            <span className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0]">
              {isAr ? 'متوافق مع Word و Google Docs و Pages' : 'Compatible with Word, Google Docs & Pages'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] text-[#0D0D0D] dark:text-white">
          DOCX XML
        </span>
      </div>

      {/* Document Analysis Summary */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <span>{isAr ? 'اسم المستند:' : 'Document Name:'}</span>
          <span className="font-mono truncate max-w-[170px]" title={filename}>{filename}</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'إجمالي الصفحات:' : 'Total Pages:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{pageCount} page{pageCount > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'دقة الرندرة البصرية:' : 'Rendering Quality:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">High-DPI Retina (2.0x)</span>
        </div>
      </div>

      {/* 100% Visual & RTL Layout Fidelity Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-2 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Sparkles size={14} className="shrink-0" />
          <span>{isAr ? 'ضمان الدقة البصرية 100%:' : '100% Visual & RTL Fidelity:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'تتحول كل صفحة PDF إلى صفحة Word متطابقة بصرياً مع الحفاظ التام على الجداول والمخططات والصور والنصوص العربية دون أي تشويه أو تداخل.'
            : 'Converts every PDF page into a high-resolution Word document page with exact preservation of tables, images, vectors, and complex Arabic typography.'}
        </p>
        <div className="flex items-center gap-2 pt-1 font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
          <span>{isAr ? 'معالجة محلية 100% دون رفع للملفات' : '100% Client-Side In-Browser Conversion'}</span>
        </div>
      </div>
    </div>
  );
};
