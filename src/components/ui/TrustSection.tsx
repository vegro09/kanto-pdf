import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Terminal, CheckCircle } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const badges = [
    { title: 'ISO 32000-1', desc: isAr ? 'معيار PDF القياسي الدولي' : 'Official ISO PDF Spec' },
    { title: 'AES-256 Cryptography', desc: isAr ? 'تشفير أجهزة عسكري' : 'Hardware Grade Encryption' },
    { title: 'W3C WebAssembly', desc: isAr ? 'عزل أمني تام داخل المتصفح' : 'In-Browser Sandbox' },
    { title: 'Zero Telemetry', desc: isAr ? 'بدون تتبع أو خوادم وسيطة' : '0 Bytes Transferred' },
  ];

  return (
    <section className="p-6 sm:p-8 rounded-[20px] border border-[#C7C9CC] dark:border-[#262626] bg-[#F5F0E6] dark:bg-[#141414] space-y-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-[#C7C9CC]/50 dark:border-[#262626]">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#0D0D0D] dark:border-[#333333] bg-[#0D0D0D] text-white text-[11px] font-semibold tracking-wider">
            <ShieldCheck size={13} strokeWidth={2} />
            <span>{isAr ? 'ضمان الأمان والسيادة التقنية' : 'Verifiable Technical Trust'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'كيف تضمن كانتو عدم خروج مستنداتك من جهازك؟' : 'How Kanto PDF Guarantees Zero Data Leaks'}
          </h3>
          <p className="text-xs sm:text-sm text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
            {isAr
              ? 'تعتمد المنصة على مترجم WebAssembly مدمج يعمل مباشرة داخل ذاكرة الرام (RAM) في متصفحك. لا توجد أي خوادم رفع أو قواعد بيانات مركزية تخزن وثائقك.'
              : 'Unlike traditional cloud converters, Kanto compiles cryptographic algorithms directly into your browser WebAssembly runtime. No temporary cloud storage, no remote worker queues.'}
          </p>
        </div>

        {/* Live Verifiable Proof Moment */}
        <div className="p-5 rounded-[16px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#0D0D0D] shrink-0 max-w-sm space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            <Terminal size={15} strokeWidth={2} />
            <span>{isAr ? 'دليل عملي قابل للتحقق الفوري' : 'Live Verifiable Proof'}</span>
          </div>
          <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] font-mono leading-relaxed">
            {isAr
              ? 'افتح أدوات المطور (F12) > تبويب Network أثناء تنفيذ أي عملية — ستلاحظ عدم إرسال أي بايت أو طلبات رفع إلى خوادم خارجية.'
              : 'Open your browser DevTools (F12) > Network Tab during any operation. You will observe 0 bytes uploaded to remote servers.'}
          </p>
        </div>
      </div>

      {/* Reserved Architecture Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((badge, idx) => (
          <div
            key={idx}
            className="p-4 rounded-[16px] border border-[#C7C9CC]/60 dark:border-[#262626] bg-white dark:bg-[#0D0D0D] space-y-1 shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              <CheckCircle size={13} strokeWidth={2} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
              <span>{badge.title}</span>
            </div>
            <p className="text-[10px] text-[#383B3F] dark:text-[#B8BAC0]">
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
