import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, ChevronUp, Check } from 'lucide-react';

interface LanguageItem {
  code: 'en' | 'ar';
  name: string;
  nativeName: string;
  isRtl?: boolean;
}

const FOOTER_LANGUAGES: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
];

export const Footer: React.FC = () => {
  const { t, selectToolById, lang, setLang, setScreen } = useApp();
  const isAr = lang === 'ar';

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectLanguage = (langCode: LanguageItem['code']) => {
    setLang(langCode);

    // Explicitly update document direction and language attributes
    const targetDir = langCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = targetDir;
    document.documentElement.lang = langCode;

    try {
      localStorage.setItem('kanto_language', langCode);
    } catch {
      // ignore
    }

    setIsLangMenuOpen(false);
  };

  const currentLangObj = FOOTER_LANGUAGES.find(l => l.code === lang) || FOOTER_LANGUAGES[0];

  const productTools = [
    { id: 'merge-pdf', labelEn: 'Merge PDF', labelAr: 'دمج PDF' },
    { id: 'split-pdf', labelEn: 'Split PDF', labelAr: 'تقسيم PDF' },
    { id: 'compress-pdf', labelEn: 'Compress PDF', labelAr: 'ضغط PDF' },
    { id: 'pdf-to-word', labelEn: 'PDF to Word (DOCX)', labelAr: 'تحويل PDF إلى وورد' },
    { id: 'protect-pdf', labelEn: 'Protect PDF (AES-256)', labelAr: 'حماية وتشفير PDF' },
    { id: 'unlock-pdf', labelEn: 'Unlock PDF', labelAr: 'إلغاء قفل PDF' },
    { id: 'repair-pdf', labelEn: 'Repair PDF (Reconstruction)', labelAr: 'إصلاح المستندات التالفة' },
    { id: 'pdf-to-pdfa', labelEn: 'PDF to PDF/A (ISO 19005)', labelAr: 'الأرشفة الرقمية PDF/A' },
  ];

  const solutions = [
    { titleEn: 'Contracts & Legal Teams', titleAr: 'العقود والفرق القانونية' },
    { titleEn: 'Financial Spreadsheets & Data', titleAr: 'التقارير والجداول المالية' },
    { titleEn: 'Academic & Research Publishing', titleAr: 'النشر الأكاديمي والبحثي' },
    { titleEn: 'High-Res Print & Scans', titleAr: 'الطباعة والمسح عالي الدقة' },
    { titleEn: 'Sovereign Air-Gapped Workflows', titleAr: 'بيئات العمل المعزولة والسرية' },
  ];

  const companyArchitecture = [
    { titleEn: 'Client-Side Sandbox Model', titleAr: 'بنية المعالجة في المتصفح' },
    { titleEn: 'WebAssembly Engine Core', titleAr: 'محرك WebAssembly الفائق' },
    { titleEn: 'Zero-Retention Guarantee', titleAr: 'ضمان التخزين الصفري للبيانات' },
    { titleEn: 'ISO 19005 Archival Standard', titleAr: 'معيار الأرشفة الدولية ISO 19005' },
    { titleEn: 'Open Vector Integrity', titleAr: 'معايير النقاء الفيكتوري' },
  ];

  const handleNavPrivacy = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setScreen('privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavTerms = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setScreen('terms');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-gray-900 text-gray-300 border-t border-gray-800 transition-colors duration-250 mt-24">
      {/* Fat Footer Structure: 4 Columns inside fluid container */}
      <div className="w-full px-6 md:px-12 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 sm:py-12 px-2 sm:px-6">
          {/* Column 1: Product / Popular Tools */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2 mb-1">
              {isAr ? 'المنتجات والأدوات' : 'Product & Tools'}
            </h4>
            <div className="flex flex-col gap-2">
              {productTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => selectToolById(tool.id)}
                  className="text-xs text-gray-400 hover:text-white hover:underline transition-colors text-start"
                >
                  {isAr ? tool.labelAr : tool.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Solutions */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2 mb-1">
              {isAr ? 'الحلول ونماذج الاستخدام' : 'Solutions'}
            </h4>
            <div className="flex flex-col gap-2">
              {solutions.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? item.titleAr : item.titleEn}
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Company & Architecture */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2 mb-1">
              {isAr ? 'التقنية والبنية التحتية' : 'Company & Tech'}
            </h4>
            <div className="flex flex-col gap-2">
              {companyArchitecture.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isAr ? item.titleAr : item.titleEn}
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Legal & Security */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-gray-800 pb-2 mb-1">
              {isAr ? 'الأمان والخصوصية' : 'Legal & Security'}
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="/privacy"
                onClick={handleNavPrivacy}
                className="text-xs text-gray-400 hover:text-white hover:underline transition-colors text-start cursor-pointer"
              >
                {isAr ? 'سياسة الخصوصية المحلية' : 'Privacy Policy'}
              </a>
              <a
                href="/terms"
                onClick={handleNavTerms}
                className="text-xs text-gray-400 hover:text-white hover:underline transition-colors text-start cursor-pointer"
              >
                {isAr ? 'شروط الخدمة' : 'Terms of Service'}
              </a>
              <div className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                {isAr ? 'نموذج الأمان والتشفير' : 'Security & Cryptographic Model'}
              </div>
              <div className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                {isAr ? 'الامتثال للوائح حماية البيانات' : 'GDPR & CCPA Compliant'}
              </div>
              <div className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                {isAr ? 'منصة خالية من ملفات التتبع' : 'Cookie-Free & Tracker-Free'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar with Language Switcher Mega-Menu */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 pb-12">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setScreen('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="font-serif italic font-bold text-white text-sm hover:underline"
            >
              Kanto PDF
            </button>
            <span>•</span>
            <span>© {new Date().getFullYear()} {t.footer_rights}</span>
          </div>

          {/* Upward-Opening Multi-Column Language Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangMenuOpen(prev => !prev)}
              aria-expanded={isLangMenuOpen}
              aria-label="Select Language"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              <Globe size={15} className="text-gray-300" />
              <span>{currentLangObj.nativeName}</span>
              <ChevronUp
                size={14}
                className={`transition-transform duration-200 ${
                  isLangMenuOpen ? 'rotate-180 text-white' : 'text-gray-400'
                }`}
              />
            </button>

            {/* Upward Dropdown Panel: absolute bottom-full mb-3 z-50 */}
            {isLangMenuOpen && (
              <div
                className="absolute bottom-full start-0 sm:start-auto sm:end-0 mb-3 z-50 w-64 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150"
                style={{ filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5))' }}
              >
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 pb-2 mb-3 border-b border-gray-700 flex items-center justify-between">
                  <span>{isAr ? 'اختر لغة العرض' : 'Select Display Language'}</span>
                  <span className="text-[10px] text-gray-500">2 Languages</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FOOTER_LANGUAGES.map(item => {
                    const isSelected = lang === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-start transition-all ${
                          isSelected
                            ? 'bg-gray-700 text-white font-bold ring-1 ring-gray-600'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
                        }`}
                      >
                        <span className="truncate">{item.nativeName}</span>
                        {isSelected && <Check size={13} className="text-emerald-400 shrink-0 ms-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 font-medium text-gray-400">
            <button
              onClick={() => { setScreen('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-white hover:underline cursor-pointer"
            >
              {t.footer_sitemap}
            </button>
            <span>•</span>
            <a
              href="/privacy"
              onClick={handleNavPrivacy}
              className="hover:text-white hover:underline cursor-pointer"
            >
              {t.footer_privacy}
            </a>
            <span>•</span>
            <a
              href="/terms"
              onClick={handleNavTerms}
              className="hover:text-white hover:underline cursor-pointer"
            >
              {t.footer_terms}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
