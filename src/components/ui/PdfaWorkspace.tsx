import React from 'react';
import { useApp } from '../../context/AppContext';
import { PdfPageItem } from '../../types/tools';
import { PageThumbnail } from '../ui/PageThumbnail';
import { VirtualizedPageGrid } from '../ui/VirtualizedPageGrid';
import { Archive, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface PdfaWorkspaceProps {
  pages: PdfPageItem[];
  filename: string;
  pdfaLevel: '1b' | '2b' | '3b';
}

export const PdfaWorkspace: React.FC<PdfaWorkspaceProps> = ({
  pages,
  filename,
  pdfaLevel,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] text-xs">
        <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Archive size={16} className="text-blue-600 dark:text-blue-400" />
          <span>{isAr ? 'الملف الجاري تحويله لأرشيف PDF/A:' : 'Target Document for PDF/A Conversion:'}</span>
          <span className="font-mono text-[#5A5D61] dark:text-[#A0A2A6]">{filename}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F0E6] dark:bg-[#222222] border border-[#C7C9CC] dark:border-[#333333] text-[11px] font-mono font-bold text-[#0D0D0D] dark:text-white">
            {pages.length} {isAr ? 'صفحة' : 'pages'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300 text-xs font-bold">
            <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
            <span>ISO 19005-{pdfaLevel.charAt(0)} ({pdfaLevel.toUpperCase()})</span>
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

      {/* 3. Footer Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <ShieldCheck size={14} className="text-blue-500" />
          <span>{isAr ? 'معتمد للأرشفة طويلة المدى (ISO 19005)' : 'ISO 19005 Certified Preservation'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <Sparkles size={14} className="text-emerald-500" />
          <span>{isAr ? 'تضمين ملف الألوان sRGB ICC Profile' : 'sRGB ICC OutputIntents Embedded'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <CheckCircle2 size={14} className="text-purple-500" />
          <span>{isAr ? 'متوافق مع شريط القراءة في Adobe Acrobat' : 'Adobe Acrobat Read-Only Banner Verified'}</span>
        </div>
      </div>
    </div>
  );
};
