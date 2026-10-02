import React from 'react';
import { useApp } from '../../context/AppContext';
import { PdfPageItem } from '../../types/tools';
import { PageThumbnail } from '../ui/PageThumbnail';
import { VirtualizedPageGrid } from '../ui/VirtualizedPageGrid';
import { Code2, Sparkles, CheckCircle2, FileText, Layers } from 'lucide-react';

interface PdfToHtmlWorkspaceProps {
  pages: PdfPageItem[];
  filename: string;
}

export const PdfToHtmlWorkspace: React.FC<PdfToHtmlWorkspaceProps> = ({
  pages,
  filename,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
            <Code2 size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'معاينة صفحات المستند الجاهزة للاستخراج' : 'Ready for HTML Text-Layer Extraction'}
            </h3>
            <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] truncate max-w-md" title={filename}>
              {filename} • {pages.length} {isAr ? 'صفحة' : 'page(s)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>{isAr ? 'نصوص نقية 100%' : '100% Text Layer'}</span>
          </span>
        </div>
      </div>

      {/* 2. Grid of Page Cards (Virtualized) */}
      <VirtualizedPageGrid
        items={pages}
        estimateRowHeight={270}
        renderItem={(page, idx) => (
          <PageThumbnail
            key={`${page.sourceFileIndex}-${page.originalIndex}-${idx}`}
            page={page}
            index={idx}
          />
        )}
      />

      {/* 3. Footer Guarantee Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <Sparkles size={14} className="text-blue-500" />
          <span>{isAr ? 'إحداثيات دقيقة (Absolute Positioning)' : 'Subpixel Coordinate Accuracy'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <FileText size={14} className="text-emerald-500" />
          <span>{isAr ? 'ملف HTML مفرد ومستقل' : 'Self-Contained Single File'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <Layers size={14} className="text-purple-500" />
          <span>{isAr ? 'طبقة Retina بصرية فائقة الدقة (4.5x)' : 'High-DPI Retina Visual Layer (4.5x)'}</span>
        </div>
      </div>
    </div>
  );
};
