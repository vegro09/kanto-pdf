import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsList';
import { ToolCard } from '../ui/ToolCard';
import { SmartHeroDropzone } from '../ui/SmartHeroDropzone';
import { UseCasesSection } from '../ui/UseCasesSection';
import { TrustSection } from '../ui/TrustSection';
import { FaqAccordion } from '../ui/FaqAccordion';
import { ToolCategory } from '../../types/tools';

export const CatalogScreen: React.FC = () => {
  const {
    t,
    lang,
    activeCategory,
    setActiveCategory,
  } = useApp();

  const isAr = lang === 'ar';

  const categories: { id: ToolCategory; label: string; count: number }[] = [
    { id: 'all', label: t.cat_all, count: TOOLS_LIST.length },
    { id: 'organize', label: t.cat_organize, count: TOOLS_LIST.filter(t => t.category === 'organize').length },
    { id: 'convert-to', label: t.cat_convert_to, count: TOOLS_LIST.filter(t => t.category === 'convert-to').length },
    { id: 'convert-from', label: t.cat_convert_from, count: TOOLS_LIST.filter(t => t.category === 'convert-from').length },
    { id: 'security', label: t.cat_security, count: TOOLS_LIST.filter(t => t.category === 'security').length },
  ];

  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter(tool => {
      if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }
      return true;
    });
  }, [activeCategory]);

  const faqItems = [
    {
      id: '1',
      question: isAr ? 'هل من الآمن معالجة مستندات تحتوي على بيانات شخصية أو مالية حساسة؟' : 'Is it safe to upload confidential PDFs with personal or financial information?',
      answer: isAr
        ? 'نعم، بكل تأكيد. تعمل كانتو بنظام المعالجة الرملية داخل المتصفح بنسبة 100% (Client-Side Sandbox). لا يتم إرسال ملفاتك أو نصوصها إلى أي خادم خارجي على الإطلاق، وتتم المعالجة عبر ذاكرة RAM المؤقتة لجهازك وتُمحى فوراً.'
        : 'Yes, 100% safe. Kanto PDF executes entirely in your local browser sandbox via WebAssembly and JavaScript. Your documents and bytes are NEVER transferred over the network or saved on any remote server.'
    },
    {
      id: '2',
      question: isAr ? 'هل تعمل أدوات Kanto PDF بدون اتصال بالإنترنت (Offline)؟' : 'Does Kanto PDF work offline without an active internet connection?',
      answer: isAr
        ? 'نعم. بمجرد تحميل صفحة الموقع، تصبح جميع محركات PDF الأساسية (الدمج، التقسيم، الضغط، التوقيع، الحماية) جاهزة للعمل دون الحاجة إلى اتصال نشط بالإنترنت.'
        : 'Yes. Once the web application is loaded in your browser, core engines (Merge, Split, Compress, Sign, Protect, Watermark) run completely offline in your device memory.'
    },
    {
      id: '3',
      question: isAr ? 'كيف تختلف المعالجة المحلية عن منصات PDF السحابية التقليدية؟' : 'How does client-side WebAssembly differ from cloud PDF converters like iLovePDF?',
      answer: isAr
        ? 'المنصات السحابية التقليدية ترفع ملفاتك إلى خوادمها لمعالجتها ثم إعادتها، مما يعرضها لاحتمالات التسريب أو الاحتفاظ غير المصرح به. أما كانتو فتقوم بتشغيل محرك المعالجة داخل متصفحك مباشرة بخصوصية سيادية مطلقة.'
        : 'Traditional cloud services upload your confidential files to third-party servers to process them. Kanto PDF processes documents natively on your CPU inside your browser sandbox, guaranteeing zero data exposure.'
    },
    {
      id: '4',
      question: isAr ? 'هل هناك قيود على حجم الملفات أو عدد الصفحات؟' : 'Are there any hidden file size or page count limits?',
      answer: isAr
        ? 'لا توجد قيود اصطناعية على عدد الصفحات أو الملفات. محرك الدمج والتقسيم يدعم مئات الصفحات بسلاسة تامة بالاعتماد على كفاءة ذاكرة جهازك.'
        : 'There are no arbitrary limits on page counts or document sizes. Our streaming engines effortlessly handle 200+ page documents using optimized memory allocation.'
    },
    {
      id: '5',
      question: isAr ? 'كيف يمكنني نقل المستندات المعالجة إلى هاتفي الذكي مباشرة؟' : 'How does the Mobile QR handoff feature work?',
      answer: isAr
        ? 'بمجرد انتهاء المعالجة، يمكنك الضغط على زر "نقل للهاتف" ومسح رمز QR ضوئياً لنقل الملف المشفر بأمان وبسرعة عبر شبكتك المحلية.'
        : 'After processing, click "Mobile Handoff" to display an encrypted peer transfer QR code to instantly save the processed file onto your smartphone.'
    },
  ];

  return (
    <main className="relative w-full px-6 md:px-12 mx-auto pt-8 pb-28 bg-[#fcfaf8] dark:bg-[#0D0D0D] transition-colors duration-250 ease-apple overflow-hidden">
      {/* CSS-Based Ambient Background Texture: Behind Hero */}
      <div
        aria-hidden="true"
        className="absolute top-2 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[750px] sm:w-[1050px] h-[340px] sm:h-[420px] rounded-full pointer-events-none -z-0 bg-[radial-gradient(ellipse_at_center,rgba(245,240,230,0.85)_0%,rgba(255,255,255,0)_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035)_0%,rgba(13,13,13,0)_70%)]"
      />

      {/* SECTION 1: HERO (Aligned with exact 120px bottom spacing) */}
      <section className="relative z-10 text-center max-w-4xl mx-auto mb-[120px]">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic font-bold tracking-tight text-[#0D0D0D] dark:text-[#F5F0E6] leading-[1.1]">
          <span>{t.hero_title_1}</span>{' '}
          <span className="underline decoration-1 decoration-[#C7C9CC] dark:decoration-[#333333] underline-offset-8">
            {t.hero_title_2}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#383B3F] dark:text-[#B8BAC0] font-medium max-w-2xl mx-auto leading-relaxed mt-4 px-2">
          {isAr
            ? 'أدوات PDF سريعة وآمنة تماماً تعمل بالكامل داخل متصفحك. بدون رفع للملفات وبدون أي تسريب للبيانات.'
            : 'Fast, completely private PDF tools running 100% inside your browser. Zero server uploads, zero data leaks.'}
        </p>

        {/* Smart Universal Auto-Detect Dropzone with exact 48px top margin */}
        <div className="mt-12">
          <SmartHeroDropzone />
        </div>

        {/* Category Filter Navigation (Centered Flex-Wrap: 100% visible, NO horizontal scroll) */}
        <div className="mt-6 w-full max-w-4xl mx-auto px-1">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 py-1 max-w-full">
            {categories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-[10px] sm:rounded-[12px] text-xs font-semibold transition-colors duration-150 flex items-center shrink-0 border ${
                    isActive
                      ? 'bg-[#0D0D0D] text-white border-[#0D0D0D] dark:bg-white dark:text-[#0D0D0D] dark:border-white shadow-xs'
                      : 'bg-white dark:bg-[#141414] text-[#0D0D0D] dark:text-[#F5F0E6] border-[#C7C9CC] dark:border-[#262626] hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`ms-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#0D0D0D]'
                      : 'bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] border border-[#C7C9CC]/40'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: MATHEMATICAL AUTO-FIT MINMAX GRID */}
      <section id="tools-section" className="relative z-10 mb-[120px] w-full">
        <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: WORK YOUR WAY (20px rounded cards, 120px bottom spacing) */}
      <section id="use-cases-section" className="relative z-10 mb-[120px]">
        <UseCasesSection />
      </section>

      {/* SECTION 4: VERIFIABLE TECHNICAL TRUST (20px rounded cards, 120px bottom spacing) */}
      <section id="trust-section" className="relative z-10 mb-[120px]">
        <TrustSection />
      </section>

      {/* SECTION 5: SEMANTIC LONG-TAIL PRIVACY FAQ (20px rounded cards) */}
      <section className="relative z-10 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {t.faq_title}
          </h2>
          <p className="text-xs sm:text-sm text-[#383B3F] dark:text-[#B8BAC0]">
            {isAr ? 'إجابات واضحة ومباشرة حول الأمان ومعالجة المستندات في المتصفح' : 'Clear answers about browser sandbox security, privacy guarantees, and offline usage.'}
          </p>
        </div>

        <FaqAccordion items={faqItems} />
      </section>
    </main>
  );
};
