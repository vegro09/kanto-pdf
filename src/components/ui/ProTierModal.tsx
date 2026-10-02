import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, Zap, Sparkles } from 'lucide-react';

interface ProTierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProTierModal: React.FC<ProTierModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const proFeatures = [
    {
      titleEn: 'Unlimited Batch Processing',
      descEn: 'Process up to 100+ PDF files simultaneously with zero queue throttling.',
      titleAr: 'معالجة دفعات غير محدودة',
      descAr: 'دمج ومعالجة أكثر من 100 ملف PDF دفعة واحدة دون أي قيود على الطابور.'
    },
    {
      titleEn: 'Multi-Core WebAssembly Accelerator',
      descEn: 'Dedicated WebWorker threading utilizing all available CPU hardware cores.',
      titleAr: 'تسريع العتاد متعدد الأنوية',
      descAr: 'استغلال كامل أنوية معالج جهازك عبر خيوط WebWorker لتسريع فائق.'
    },
    {
      titleEn: 'Arabic & Multilingual OCR Pro',
      descEn: 'High-precision document neural text extraction for complex scanned tables.',
      titleAr: 'محرك OCR متقدم للجداول المعقدة',
      descAr: 'استخراج فائق الدقة للنصوص العربية والإنجليزية من المستندات الممسوحة.'
    },
    {
      titleEn: 'Commercial Offline License',
      descEn: 'Enterprise offline redistribution and sovereign air-gapped workplace deployment.',
      titleAr: 'ترخيص تجاري للعمل دون اتصال',
      descAr: 'ترخيص مؤسسي للاستخدام في الشبكات المعزولة تماماً عن الإنترنت (Air-Gapped).'
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0D0D]/60 backdrop-blur-none"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#141414] rounded-lg border border-[#C7C9CC] dark:border-[#333333] p-8 shadow-none flex flex-col animate-in fade-in zoom-in-95 duration-250 ease-apple">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#C7C9CC]/40 dark:border-[#262626] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] border border-[#C7C9CC]/50 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="pro-modal-title" className="text-xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                  {isAr ? 'كانتو بريميوم (Kanto Pro)' : 'Kanto Pro Edition'}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-[#0D0D0D] dark:border-white bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]">
                  PRO
                </span>
              </div>
              <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
                {isAr ? 'للمحترفين والشركات التي تبحث عن أقصى أداء سيادي' : 'Engineered for high-volume enterprise & sovereign power users'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg border border-[#C7C9CC]/40 hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Pricing card in Warm Cream */}
        <div className="p-5 rounded-lg bg-[#F5F0E6] dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#262626] mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6] uppercase tracking-wider">
              {isAr ? 'الترخيص الدائم مدى الحياة' : 'Lifetime Sovereign License'}
            </div>
            <div className="text-3xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6] mt-0.5">
              $29 <span className="text-xs font-sans text-[#5A5D61] font-normal">{isAr ? '/ تدفع مرة واحدة' : 'one-time purchase'}</span>
            </div>
          </div>
          <div className="text-end text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr ? 'ضمان استرجاع 30 يوماً' : '30-Day Money-Back'}
          </div>
        </div>

        {/* Pro features list */}
        <div className="space-y-3 mb-6">
          {proFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <div className="w-4 h-4 rounded bg-[#0D0D0D] dark:bg-white text-white dark:text-[#0D0D0D] flex items-center justify-center shrink-0 mt-0.5">
                <Check size={11} />
              </div>
              <div>
                <div className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                  {isAr ? feat.titleAr : feat.titleEn}
                </div>
                <div className="text-[#5A5D61] dark:text-[#A0A2A6] text-[11px]">
                  {isAr ? feat.descAr : feat.descEn}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA with the Single Shine Treatment */}
        <div className="space-y-2">
          <button
            onClick={() => {
              alert(isAr ? 'شكراً لاهتمامك بـ Kanto Pro! سيتم إطلاق الدفع قريباً.' : 'Thank you for your interest in Kanto Pro! Payment gateway integration coming soon.');
              onClose();
            }}
            className="kanto-shine-cta w-full py-4 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            <span>{isAr ? 'ترقية حسابي إلى Kanto Pro الآن' : 'Upgrade to Kanto Pro Now'}</span>
          </button>
          <p className="text-[10px] text-center text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr ? 'النسخة المجانية تظل متاحة بالكامل بنسبة 100% دائماً' : 'Core tools remain 100% free and private forever'}
          </p>
        </div>
      </div>
    </div>
  );
};
