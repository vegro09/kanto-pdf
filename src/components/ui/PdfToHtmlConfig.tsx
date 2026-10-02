import React from 'react';
import { useApp } from '../../context/AppContext';
import { Code2, CheckCircle2, Sparkles, Layers, FileText, Cpu } from 'lucide-react';

interface PdfToHtmlConfigProps {
  pageCount: number;
  filename: string;
}

export const PdfToHtmlConfig: React.FC<PdfToHtmlConfigProps> = ({
  pageCount,
  filename,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6 text-xs text-[#0D0D0D] dark:text-[#F5F0E6]">
      {/* 1. Document Overview Card */}
      <div className="p-4 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded-xl border border-[#C7C9CC] dark:border-[#333333] space-y-3">
        <div className="flex items-center justify-between border-b border-[#C7C9CC]/40 dark:border-[#262626] pb-2.5">
          <span className="font-bold flex items-center gap-1.5 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <FileText size={15} />
            <span>{isAr ? 'المستند المصدر:' : 'Source Document:'}</span>
          </span>
          <span className="font-mono text-xs font-semibold text-[#0D0D0D] dark:text-white truncate max-w-[170px]" title={filename}>
            {filename}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#5A5D61] dark:text-[#A0A2A6] flex items-center gap-1.5">
            <Layers size={14} />
            <span>{isAr ? 'عدد الصفحات المستخرجة:' : 'Pages to Extract:'}</span>
          </span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
            {pageCount} {isAr ? 'صفحات' : 'page(s)'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#5A5D61] dark:text-[#A0A2A6] flex items-center gap-1.5">
            <Code2 size={14} />
            <span>{isAr ? 'صيغة التصدير:' : 'Output Format:'}</span>
          </span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            Standalone .HTML
          </span>
        </div>
      </div>

      {/* 2. Extraction Algorithm Details */}
      <div className="p-4 bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-xl space-y-3">
        <div className="font-bold text-[11px] uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6] flex items-center gap-1.5">
          <Cpu size={13} />
          <span>{isAr ? 'خوارزمية الاستخراج الشعاعي' : 'Extraction Architecture'}</span>
        </div>

        <div className="space-y-2 text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isAr
                ? 'استخراج طبقات النصوص بدقة مع الإحداثيات المطلقة (Absolute Positioning).'
                : 'Extracts exact TextContent glyph matrices into absolute-positioned HTML elements.'}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isAr
                ? 'دعم النصوص العربية والأجنبية مع خاصية dir="auto" لمنع عكس الحروف.'
                : 'Native Arabic & RTL language support with dir="auto" attribute.'}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              {isAr
                ? 'طبقة بصرية Retina فائقة الدقة (4.5x) مع نصوص شفافة متوافقة مع محركات البحث.'
                : 'High-DPI Retina visual canvas (4.5x) with transparent selectable text overlay.'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Pure Text Guarantee Badge */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
        <Sparkles size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          {isAr
            ? 'نصوص قابلة للتحديد، والنسخ، والتعديل بالكامل في أي متصفح ويب.'
            : '100% Selectable, searchable, and editable text in all web browsers.'}
        </span>
      </div>
    </div>
  );
};
