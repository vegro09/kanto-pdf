import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export const UseCasesSection: React.FC = () => {
  const { lang, selectToolById } = useApp();
  const isAr = lang === 'ar';

  const useCases = [
    {
      icon: User,
      titleEn: 'For Individuals',
      titleAr: 'للأفراد والاستخدام الفوري',
      subEn: 'Instant one-off tasks with zero accounts needed. Everything processes in local memory and disappears when you close the tab.',
      subAr: 'معالجة فورية للمستندات دون الحاجة لإنشاء حساب. تتم المعالجة بالكامل في الذاكرة المؤقتة لجهازك وتُمحى فور إغلاق التبويب.',
      ctaEn: 'Start with Merge or Split',
      ctaAr: 'ابدأ بالدمج أو التقسيم',
      toolId: 'merge-pdf'
    },
    {
      icon: Users,
      titleEn: 'For Teams & Businesses',
      titleAr: 'للشركات وفرق العمل',
      subEn: 'Standardize on a zero-data-retention PDF suite. Guarantee client confidentiality with ISO-compliant local processing.',
      subAr: 'اعتمد بيئة عمل موحدة تضمن سرية بيانات عملائك وتطابق معايير ISO دون أي مخاطر لتسريب المستندات خارجياً.',
      ctaEn: 'Explore Business Security',
      ctaAr: 'استعرض أدوات الأمان المؤسسي',
      toolId: 'protect-pdf'
    },
    {
      icon: ShieldCheck,
      titleEn: 'Built for Sovereign Privacy',
      titleAr: 'أمان سيادي مبني على WebAssembly',
      subEn: 'Pure client-side WebAssembly architecture. Open your browser network tab — observe 0 bytes transmitted during document execution.',
      subAr: 'هندسة برمجية مستقلة مبنية على WebAssembly. افتح تبويب الشبكة في متصفحك للتأكد من عدم نقل أي بايت إلى خوادم خارجية.',
      ctaEn: 'Verify Privacy Sandbox',
      ctaAr: 'تحقق من العزل الأمني',
      toolId: 'redact-pdf'
    }
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          {isAr ? 'صُممت لتناسب أسلوب عملك' : 'Work Your Way'}
        </h2>
        <p className="text-xs sm:text-sm text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'سواء كنت بحاجة لتعديل سريع لمستند شخصي أو معالجة وثائق سرية لشركتك، كانتو تقدم لك أعلى درجات الأمان'
            : 'Engineered for individual speed and enterprise confidentiality with 100% in-browser isolation.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {useCases.map((uc, idx) => {
          const Icon = uc.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-[20px] border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] flex flex-col justify-between space-y-6 transition-all duration-250 ease-apple hover:border-[#0D0D0D] dark:hover:border-white hover:-translate-y-0.5 shadow-sm"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center justify-center mb-6 border border-[#C7C9CC]/50">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-[#0D0D0D] dark:text-[#F5F0E6] mb-2">
                  {isAr ? uc.titleAr : uc.titleEn}
                </h3>
                <p className="text-xs text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
                  {isAr ? uc.subAr : uc.subEn}
                </p>
              </div>

              <button
                type="button"
                onClick={() => selectToolById(uc.toolId)}
                className="pt-4 border-t border-[#C7C9CC]/40 dark:border-[#262626] flex items-center justify-between text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6] hover:underline text-start"
              >
                <span>{isAr ? uc.ctaAr : uc.ctaEn}</span>
                <ArrowRight size={14} strokeWidth={2} className="rtl:rotate-180" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
