import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, ShieldCheck, Table2 } from 'lucide-react';

interface ExcelConversionConfigProps {
  filename: string;
  pageCount: number;
}

export const ExcelConversionConfig: React.FC<ExcelConversionConfigProps> = ({
  filename,
  pageCount,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Target Format Header */}
      <div className="p-4 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] flex items-center justify-center font-bold">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <span className="font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6] block">
              Microsoft Excel (.xlsx)
            </span>
            <span className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0]">
              {isAr ? 'متوافق مع Excel و Google Sheets و Numbers' : 'Compatible with Excel, Google Sheets & Numbers'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] text-[#0D0D0D] dark:text-white">
          XLSX SHEET
        </span>
      </div>

      {/* 2. Spreadsheet Analysis Summary */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <span>{isAr ? 'اسم المستند:' : 'Document Name:'}</span>
          <span className="font-mono truncate max-w-[170px]" title={filename}>{filename}</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'عدد أوراق العمل المتولدة:' : 'Generated Sheets:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{pageCount} sheet{pageCount > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'نمط المعالجة:' : 'Extraction Engine:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">Spatial Grid Mapping</span>
        </div>
      </div>

      {/* 3. Spatial Parsing & Editable Cells Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-2 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <Table2 size={14} className="shrink-0" />
          <span>{isAr ? 'خلايا قابلة للتعديل والحساب:' : '100% Editable Table Cells:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'يقوم المحرك بتحليل الإحداثيات المكانية (X, Y) لكل نص في ملف PDF، وتحويلها إلى صفوف وأعمدة وخلايا مجدولة قابلة للتحرير والتعديل الفوري.'
            : 'Extracts spatial coordinates to reconstruct rows, columns, numbers, and currencies into fully editable spreadsheet cells.'}
        </p>
        <div className="flex items-center gap-2 pt-1 font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
          <span>{isAr ? 'معالجة محلية 100% داخل متصفحك' : '100% Client-Side In-Browser Conversion'}</span>
        </div>
      </div>
    </div>
  );
};
