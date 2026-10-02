import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RelatedTools } from '../ui/RelatedTools';
import { ArrowLeft, Upload, FileText, Lock, Cloud, HardDrive, AlertTriangle, Globe } from 'lucide-react';

export const UploadScreen: React.FC = () => {
  const {
    t,
    lang,
    selectedTool,
    setScreen,
    addFiles,
    errorMessage,
    setErrorMessage,
  } = useApp();

  const isAr = lang === 'ar';
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toolName = (t as unknown as Record<string, string>)[selectedTool.nameKey] || selectedTool.id;
  const toolDesc = (t as unknown as Record<string, string>)[selectedTool.descKey] || '';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await addFiles(files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await addFiles(files);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20 sm:pt-6 sm:pb-24 space-y-8 sm:space-y-10 bg-white dark:bg-[#0D0D0D] transition-colors duration-250 ease-apple">
      {/* Validation Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-[#F5F0E6] dark:bg-[#1A1A1A] border border-[#0D0D0D] dark:border-white text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-250">
          <div className="flex items-center gap-2 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline font-bold hover:opacity-75 shrink-0"
          >
            {isAr ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Top Nav Back Link */}
      <div>
        <button
          onClick={() => {
            setErrorMessage(null);
            setScreen('catalog');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white transition-colors duration-250 ease-apple py-1"
        >
          <ArrowLeft size={14} className="rtl:rotate-180" />
          <span>{t.back_to_tools}</span>
        </button>
      </div>

      {/* Tool Header (Clean Title, One-line Subtitle) */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6] tracking-tight leading-tight">
          {toolName}
        </h1>

        <p className="text-xs sm:text-sm text-[#5A5D61] dark:text-[#A0A2A6] leading-relaxed">
          {toolDesc}
        </p>
      </div>

      {/* Main Upload Dropzone (Clean Single-Action Focus) */}
      <div className="space-y-3">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative p-8 sm:p-12 rounded-xl border-2 text-center transition-all duration-250 ease-apple flex flex-col items-center justify-center min-h-[260px] sm:min-h-[290px] ${
            isDragging
              ? 'bg-[#F5F0E6] dark:bg-[#1A1A1A] border-[#0D0D0D] scale-[1.01]'
              : 'bg-[#F5F0E6]/40 dark:bg-[#141414] border-dashed border-[#C7C9CC] dark:border-[#262626] hover:border-[#0D0D0D] dark:hover:border-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={selectedTool.maxFiles > 1}
            accept={selectedTool.acceptedFileTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload files"
          />

          {/* Central Upload Icon */}
          <div className="w-14 h-14 rounded-xl bg-white dark:bg-[#1F1F1F] border border-[#C7C9CC]/80 dark:border-[#333333] flex items-center justify-center text-[#0D0D0D] dark:text-white mb-5 shadow-sm">
            <Upload size={26} />
          </div>

          {/* Primary Action Button + Compact Cloud Import Circles */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="kanto-shine-cta py-3.5 sm:py-4 px-8 sm:px-10 font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5"
              >
                <FileText size={18} />
                <span>
                  {selectedTool.maxFiles > 1 ? t.select_pdf_files : t.select_pdf_file}
                </span>
              </button>

              {/* Compact Circular Cloud Import Buttons */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={t.cloud_gdrive}
                aria-label={t.cloud_gdrive}
                className="w-11 h-11 rounded-full border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#F5F0E6] dark:hover:bg-[#262626] transition-colors duration-250 ease-apple flex items-center justify-center shadow-sm"
              >
                <Cloud size={17} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={t.cloud_dropbox}
                aria-label={t.cloud_dropbox}
                className="w-11 h-11 rounded-full border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#F5F0E6] dark:hover:bg-[#262626] transition-colors duration-250 ease-apple flex items-center justify-center shadow-sm"
              >
                <HardDrive size={17} />
              </button>
            </div>

            <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
              {t.or_drop_here}
            </p>
          </div>

          {/* Direct URL / HTML Input Link for HTML to PDF */}
          {selectedTool.key === 'htmlToPdf' && (
            <button
              type="button"
              onClick={() => setScreen('workspace')}
              className="mt-3 py-2 px-5 rounded-lg border border-[#0D0D0D] dark:border-white bg-white dark:bg-[#1A1A1A] text-xs font-bold text-[#0D0D0D] dark:text-white hover:bg-[#F5F0E6] dark:hover:bg-[#262626] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Globe size={14} />
              <span>{isAr ? 'إدخال رابط موقع أو كتابة كود مباشرة ←' : 'Enter URL or Paste HTML directly →'}</span>
            </button>
          )}
        </div>

        {/* 2. Quiet Local Privacy Reassurance (Single Line Below Dropzone) */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
          <Lock size={13} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
          <span>
            {isAr
              ? 'معالجة محلية 100% داخل المتصفح — ملفاتك لا تغادر جهازك أبداً'
              : 'Processed 100% locally in browser — files never leave your device'}
          </span>
        </div>
      </div>

      {/* 3. Below-the-Fold Zone: Subordinated SEO Operational Guide */}
      <section className="pt-12 sm:pt-16 border-t border-[#C7C9CC]/40 dark:border-[#262626] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? `دليل الاستخدام: ${toolName}` : `How to use ${toolName}`}
          </h2>
          <span className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] font-mono">
            3 Quick Steps
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#F5F0E6]/40 dark:bg-[#141414] border border-[#C7C9CC]/40 dark:border-[#262626] space-y-1">
            <div className="text-xs font-mono font-bold text-[#5A5D61] dark:text-[#A0A2A6]">01</div>
            <div className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'اختيار الملفات' : 'Step 1: Input'}
            </div>
            <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] leading-relaxed">
              {isAr ? 'اختر المستندات من جهازك أو أسقطها مباشرة في الصندوق.' : 'Choose your files from your local storage or drag them directly into the browser sandbox.'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F5F0E6]/40 dark:bg-[#141414] border border-[#C7C9CC]/40 dark:border-[#262626] space-y-1">
            <div className="text-xs font-mono font-bold text-[#5A5D61] dark:text-[#A0A2A6]">02</div>
            <div className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'الضبط والتخصيص' : 'Step 2: Configure'}
            </div>
            <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] leading-relaxed">
              {isAr ? 'حدد الخيارات المرغوبة مثل النطاقات، مستوى الضغط، أو التشفير.' : 'Adjust custom parameters, page reordering, compression, or encryption parameters.'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F5F0E6]/40 dark:bg-[#141414] border border-[#C7C9CC]/40 dark:border-[#262626] space-y-1">
            <div className="text-xs font-mono font-bold text-[#5A5D61] dark:text-[#A0A2A6]">03</div>
            <div className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
              {isAr ? 'التنزيل الفوري' : 'Step 3: Export'}
            </div>
            <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6] leading-relaxed">
              {isAr ? 'احفظ الملف المعالج فوراً في جهازك أو انقله لهاتفك عبر رمز QR.' : 'Download your finalized file instantly to disk or transfer to mobile via QR code.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Internal SEO Cross-Links to Related Tools */}
      <RelatedTools currentToolId={selectedTool.id} />
    </main>
  );
};
