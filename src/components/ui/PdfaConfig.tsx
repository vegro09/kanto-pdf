import React from 'react';
import { useApp } from '../../context/AppContext';
import { Archive, ShieldCheck, CheckCircle2, Check } from 'lucide-react';

interface PdfaConfigProps {
  pdfaLevel: '1b' | '2b' | '3b';
  onPdfaLevelChange: (level: '1b' | '2b' | '3b') => void;
  pageCount: number;
  filename: string;
}

export const PdfaConfig: React.FC<PdfaConfigProps> = ({
  pdfaLevel,
  onPdfaLevelChange,
  pageCount,
  filename,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const conformanceLevels: { id: '1b' | '2b' | '3b'; title: string; iso: string; descEn: string; descAr: string }[] = [
    {
      id: '1b',
      title: 'PDF/A-1b',
      iso: 'ISO 19005-1 Level B',
      descEn: 'Strict visual preservation & full font embedding. Triggers standard PDF/A blue banner in Acrobat.',
      descAr: 'الحفاظ البصري الصارم وتضمين الخطوط بالكامل. يظهر الشريط الأزرق المعتمد في Adobe Acrobat.',
    },
    {
      id: '2b',
      title: 'PDF/A-2b',
      iso: 'ISO 19005-2 Level B',
      descEn: 'Supports transparency layers, embedded JPEG2000 graphics, and modernized vector layers.',
      descAr: 'يدعم طبقات الشفافية والرسومات المتقدمة مع الحفاظ على معايير الأرشفة الرقمية.',
    },
    {
      id: '3b',
      title: 'PDF/A-3b',
      iso: 'ISO 19005-3 Level B',
      descEn: 'Specialized for electronic invoicing (e-Invoicing / Factur-X / ZUGFeRD) and embedded records.',
      descAr: 'مخصص للفواتير الإلكترونية المعتمدة وإرفاق المستندات والبيانات الهيكلية.',
    },
  ];

  return (
    <div className="space-y-6 text-xs text-[#0D0D0D] dark:text-[#F5F0E6]">
      {/* 1. Document Overview Card */}
      <div className="p-4 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded-xl border border-[#C7C9CC] dark:border-[#333333] space-y-3">
        <div className="flex items-center justify-between border-b border-[#C7C9CC]/40 dark:border-[#262626] pb-2.5">
          <span className="font-bold flex items-center gap-1.5 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <Archive size={15} />
            <span>{isAr ? 'المستند المستهدف:' : 'Target Document:'}</span>
          </span>
          <span className="font-mono text-xs font-bold text-[#0D0D0D] dark:text-white">
            {pageCount} {isAr ? 'صفحة' : 'page(s)'}
          </span>
        </div>

        <div className="text-[11px] space-y-1">
          <div className="text-[#5A5D61] dark:text-[#A0A2A6] truncate" title={filename}>
            {filename}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'معيار الامتثال:' : 'Standard:'}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ISO 19005-{pdfaLevel.charAt(0)} ({pdfaLevel.toUpperCase()})
            </span>
          </div>
        </div>
      </div>

      {/* 2. PDF/A Conformance Level Selector */}
      <div className="space-y-2.5">
        <label className="block font-bold text-[11px] uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6]">
          {isAr ? 'مستوى توافق PDF/A الأرشيفي' : 'PDF/A Conformance Standard'}
        </label>
        <div className="space-y-2.5">
          {conformanceLevels.map(lvl => {
            const isSelected = pdfaLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => onPdfaLevelChange(lvl.id)}
                className={`w-full text-start p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1F1F1F] shadow-xs'
                    : 'border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] hover:bg-[#F5F0E6]/50 dark:hover:bg-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#0D0D0D] dark:text-white">
                      {lvl.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#E5E1D8] dark:bg-[#2A2A2A] text-[#5A5D61] dark:text-[#A0A2A6]">
                      {lvl.iso}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 size={15} className="text-[#0D0D0D] dark:text-white" />
                  )}
                </div>
                <p className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] mt-1.5 leading-relaxed">
                  {isAr ? lvl.descAr : lvl.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Archival Guarantee Checklist */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-2.5 text-blue-950 dark:text-blue-200">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <ShieldCheck size={15} className="text-blue-600 dark:text-blue-400" />
          <span>{isAr ? 'ضمانات الأرشفة الرقمية ISO:' : 'ISO Preservation Pipeline Guarantees:'}</span>
        </div>

        <ul className="space-y-1.5 text-[10px] text-blue-800 dark:text-blue-300">
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{isAr ? 'تضمين ملف الألوان القياسي sRGB ICC Profile' : 'Embeds standard sRGB ICC color profile'}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{isAr ? 'مزامنة بيانات XMP وحزمة تعريف pdfaid' : 'Injects valid XMP metadata with pdfaid schema'}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{isAr ? 'تجريد أكواد JavaScript غير المتوافقة' : 'Purges forbidden JavaScript & dynamic actions'}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{isAr ? 'تفعيل وضع القراءة الآمنة في Adobe Acrobat' : 'Triggers Acrobat Blue Archival Status Banner'}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
