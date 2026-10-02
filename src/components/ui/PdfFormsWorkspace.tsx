import React from 'react';
import { useApp } from '../../context/AppContext';
import { PdfPageItem, FormFieldItem } from '../../types/tools';
import { PageThumbnail } from '../ui/PageThumbnail';
import { VirtualizedPageGrid } from '../ui/VirtualizedPageGrid';
import { CheckSquare, Sparkles, CheckCircle2, ShieldCheck, Snowflake } from 'lucide-react';

interface PdfFormsWorkspaceProps {
  pages: PdfPageItem[];
  filename: string;
  fields: FormFieldItem[];
}

export const PdfFormsWorkspace: React.FC<PdfFormsWorkspaceProps> = ({
  pages,
  filename,
  fields,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
            <CheckSquare size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'نموذج PDF التفاعلي (AcroForm)' : 'Interactive AcroForm Workspace'}
            </h3>
            <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] truncate max-w-md" title={filename}>
              {filename} • {pages.length} {isAr ? 'صفحة' : 'page(s)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fields.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{fields.length} {isAr ? 'حقول تفاعلية نشطة' : 'Active AcroForm Fields'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <span>{isAr ? 'لا توجد حقول نماذج' : 'Standard Vector PDF'}</span>
            </span>
          )}
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
          <Snowflake size={14} className="text-blue-500" />
          <span>{isAr ? 'تجميد وحفظ النموذج نهائياً (Form Flattening)' : 'Permanent Form Flattening'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <Sparkles size={14} className="text-emerald-500" />
          <span>{isAr ? 'تضمين الخطوط القياسية (Typography)' : 'Standard Typography Appearances'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <ShieldCheck size={14} className="text-purple-500" />
          <span>{isAr ? 'متوافق مع كافة متصفحات الهواتف' : 'Mobile PDF Viewer Certified'}</span>
        </div>
      </div>
    </div>
  );
};
