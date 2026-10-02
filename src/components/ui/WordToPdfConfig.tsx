import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, ShieldCheck, Sparkles } from 'lucide-react';

interface WordToPdfConfigProps {
  filename: string;
  filesize: number;
}

export const WordToPdfConfig: React.FC<WordToPdfConfigProps> = ({
  filename,
  filesize,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Target Format Header */}
      <div className="p-4 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] flex items-center justify-center font-bold">
            <FileText size={20} />
          </div>
          <div>
            <span className="font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6] block">
              Adobe PDF (.pdf)
            </span>
            <span className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0]">
              {isAr ? 'متوافق مع جميع برامج وقارئات PDF والمتصفحات' : 'Universal PDF standard compatible with all readers'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] text-[#0D0D0D] dark:text-white">
          PDF 1.7
        </span>
      </div>

      {/* 2. Document Analysis Summary */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <span>{isAr ? 'اسم المستند:' : 'Document Name:'}</span>
          <span className="font-mono truncate max-w-[170px]" title={filename}>{filename}</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'حجم الملف الأصلي:' : 'File Size:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{(filesize / 1024).toFixed(1)} KB</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'تنسيق الصفحة المستهدف:' : 'Page Target:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">A4 Standard (Retina 2.0x)</span>
        </div>
      </div>

      {/* 3. HTML Translation & Render Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-2 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Sparkles size={14} className="shrink-0" />
          <span>{isAr ? 'معالجة وتنسيق المستند بدقة عالية:' : 'High-Fidelity Document Rendering:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'يقوم المحرك بتحليل نصوص وجداول وصور مستند Word وترجمتها إلى تخطيط A4 فائق الدقة، ثم تصديرها إلى ملف PDF ثابت وقابل للطباعة.'
            : 'Parses Word formatting, headings, styled tables, lists, and images into a clean, printable A4 PDF document.'}
        </p>
        <div className="flex items-center gap-2 pt-1 font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
          <span>{isAr ? 'معالجة محلية 100% داخل متصفحك' : '100% Client-Side In-Browser Conversion'}</span>
        </div>
      </div>
    </div>
  );
};
