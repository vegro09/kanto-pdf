import React from 'react';
import { useApp } from '../../context/AppContext';
import { RepairDiagnosis } from '../../services/repairEngine';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RepairConfigProps {
  diagnosis?: RepairDiagnosis;
  filename: string;
  pageCount: number;
}

export const RepairConfig: React.FC<RepairConfigProps> = ({
  diagnosis,
  filename,
  pageCount,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const isHealthy = !diagnosis || diagnosis.isHealthy;
  const issues = diagnosis?.issues || [];

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Diagnostic Assessment Header */}
      {!isHealthy && issues.length > 0 ? (
        <div className="p-4 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#0D0D0D] dark:border-white space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6]">
              <AlertTriangle size={18} />
              <span>{isAr ? 'تم اكتشاف عيوب هيكلية في الملف' : 'Structural Defects Detected'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]">
              RECOVERABLE
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[#5A5D61] dark:text-[#A0A2A6] block">
              {isAr ? 'تقرير الفحص التقني للبايتات:' : 'Diagnostic Technical Log:'}
            </span>
            <ul className="space-y-1 text-[11px] text-[#0D0D0D] dark:text-[#F5F0E6] pl-1">
              {issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-1.5 font-medium">
                  <span className="text-[#0D0D0D] dark:text-white font-bold">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-[16px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC] dark:border-[#2C2F33] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6]">
              <CheckCircle2 size={18} />
              <span>{isAr ? 'بنية الملف سليمة (لا توجد أضرار)' : 'No Structural Issues Detected'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] text-[#0D0D0D] dark:text-white">
              INTACT
            </span>
          </div>
          <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
            {isAr
              ? 'لم يتم العثور على أي تلف في ترويسة الملف أو جداول الفهرسة. سيقوم كانتو بإعادة تجميع المستند وفق أحدث معايير PDF القياسية.'
              : 'Header offsets, cross-reference tables, and trailers are structurally intact. Processing will standardize and re-compile the document streams.'}
          </p>
        </div>
      )}

      {/* 2. Document Analysis Details */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <span>{isAr ? 'اسم المستند:' : 'Document Name:'}</span>
          <span className="font-mono truncate max-w-[170px]" title={filename}>{filename}</span>
        </div>
        <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
          <span>{isAr ? 'الصفحات القابلة للاسترداد:' : 'Recoverable Pages:'}</span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{pageCount}</span>
        </div>
      </div>

      {/* 2.5 Prominent Corrupted Data Loss Warning Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{isAr ? 'تنبيه بشأن الإصلاح الهيكلي:' : 'Structural Recovery Notice:'}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
          {isAr
            ? 'قد يؤدي إصلاح الملفات التالفة بشدة إلى فقدان بعض البيانات اعتماداً على حجم الضرر.'
            : 'Repairing heavily corrupted files may result in some data loss depending on the damage.'}
        </p>
      </div>

      {/* 3. Security Guarantee */}
      <div className="p-3 rounded-xl bg-[#F5F0E6]/60 dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] flex items-center gap-2 text-[11px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
        <ShieldCheck size={16} className="shrink-0 text-[#0D0D0D] dark:text-[#C7C9CC]" />
        <span>
          {isAr
            ? 'تتم معالجة وإصلاح المستندات محلياً في الذاكرة بأمان 100%'
            : 'Zero-Retention: Byte reconstruction executes in local browser memory'}
        </span>
      </div>
    </div>
  );
};
