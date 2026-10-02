import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Upload, Sparkles, FileText, Layers, Scissors, Minimize2, FileType2, Feather, Lock, ArrowRight, X } from 'lucide-react';

export const SmartHeroDropzone: React.FC = () => {
  const { lang, selectToolById, addFiles } = useApp();
  const isAr = lang === 'ar';

  const [isDragging, setIsDragging] = useState(false);
  const [stagedPdfFile, setStagedPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (files: File[]) => {
    if (!files || files.length === 0) return;

    // If multiple PDF files dropped -> default to Merge PDF
    if (files.length > 1 && files.every(f => f.name.toLowerCase().endsWith('.pdf'))) {
      selectToolById('merge-pdf');
      await addFiles(files);
      return;
    }

    const firstFile = files[0];
    const name = firstFile.name.toLowerCase();

    // Auto-detect non-PDF formats
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      selectToolById('word-to-pdf');
      await addFiles([firstFile]);
      return;
    }
    if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
      selectToolById('powerpoint-to-pdf');
      await addFiles([firstFile]);
      return;
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
      selectToolById('excel-to-pdf');
      await addFiles([firstFile]);
      return;
    }
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
      selectToolById('jpg-to-pdf');
      await addFiles([firstFile]);
      return;
    }
    if (name.endsWith('.html') || name.endsWith('.htm') || name.endsWith('.txt')) {
      selectToolById('html-to-pdf');
      await addFiles([firstFile]);
      return;
    }

    // If a single PDF is dropped, open quick intent selector
    if (name.endsWith('.pdf')) {
      setStagedPdfFile(firstFile);
      return;
    }

    // Default fallback
    selectToolById('merge-pdf');
    await addFiles([firstFile]);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleSelectActionForPdf = async (toolId: string) => {
    if (!stagedPdfFile) return;
    const fileToLoad = stagedPdfFile;
    setStagedPdfFile(null);
    selectToolById(toolId);
    await addFiles([fileToLoad]);
  };

  return (
    <div className="w-full max-w-[640px] mx-auto">
      {/* 1. If a single PDF was dropped, show instant Smart Action Picker */}
      {stagedPdfFile ? (
        <div className="p-6 rounded-[20px] border-2 border-[#0D0D0D] dark:border-white bg-[#F5F0E6] dark:bg-[#1A1A1A] shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#C7C9CC]/60 dark:border-[#333333]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] flex items-center justify-center font-bold">
                <FileText size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block truncate max-w-[260px] sm:max-w-md">
                  {stagedPdfFile.name}
                </span>
                <span className="text-[10px] text-[#383B3F] dark:text-[#B8BAC0]">
                  {(stagedPdfFile.size / 1024).toFixed(1)} KB • In-Memory Local Sandbox
                </span>
              </div>
            </div>
            <button
              onClick={() => setStagedPdfFile(null)}
              className="p-1 rounded-md text-[#383B3F] hover:text-[#0D0D0D] dark:hover:text-white"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="pt-4">
            <span className="text-xs font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block mb-3">
              {isAr ? 'اختر الإجراء المطلوب لهذا المستند:' : 'What would you like to do with this document?'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <button
                onClick={() => handleSelectActionForPdf('compress-pdf')}
                className="p-3.5 rounded-[14px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold flex items-center gap-2 transition-colors"
              >
                <Minimize2 size={15} />
                <span>{isAr ? 'ضغط وتقليل الحجم' : 'Compress PDF'}</span>
              </button>

              <button
                onClick={() => handleSelectActionForPdf('split-pdf')}
                className="p-3.5 rounded-[14px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold flex items-center gap-2 transition-colors"
              >
                <Scissors size={15} />
                <span>{isAr ? 'تقسيم واستخراج' : 'Split Pages'}</span>
              </button>

              <button
                onClick={() => handleSelectActionForPdf('pdf-to-word')}
                className="p-3.5 rounded-[14px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold flex items-center gap-2 transition-colors"
              >
                <FileType2 size={15} />
                <span>{isAr ? 'تحويل إلى Word' : 'Convert to Word'}</span>
              </button>

              <button
                onClick={() => handleSelectActionForPdf('merge-pdf')}
                className="p-3.5 rounded-[14px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold flex items-center gap-2 transition-colors"
              >
                <Layers size={15} />
                <span>{isAr ? 'دمج مع ملفات أخرى' : 'Merge with others'}</span>
              </button>

              <button
                onClick={() => handleSelectActionForPdf('sign-pdf')}
                className="p-3.5 rounded-[14px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold flex items-center gap-2 transition-colors"
              >
                <Feather size={15} />
                <span>{isAr ? 'توقيع المستند' : 'Sign & Fill'}</span>
              </button>

              <button
                onClick={() => handleSelectActionForPdf('protect-pdf')}
                className="p-3.5 rounded-[14px] border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#0D0D0D] hover:text-white dark:hover:bg-white dark:hover:text-[#0D0D0D] font-bold flex items-center gap-2 transition-colors"
              >
                <Lock size={15} />
                <span>{isAr ? 'حماية بكلمة مرور' : 'Protect with Password'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Default Smart Dropzone Banner */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-6 sm:p-7 rounded-[20px] border-2 cursor-pointer transition-all duration-250 ease-apple flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm group ${
            isDragging
              ? 'bg-[#F5F0E6] dark:bg-[#222222] border-[#0D0D0D] dark:border-white scale-[1.01]'
              : 'bg-white/90 dark:bg-[#161616]/90 border-[#C7C9CC] dark:border-[#2C2F33] hover:border-[#0D0D0D] dark:hover:border-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.html,.txt"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload document to auto-detect tool"
          />

          <div className="flex items-center gap-3.5 text-center sm:text-start">
            <div className="w-12 h-12 rounded-xl bg-[#F5F0E6] dark:bg-[#222427] border border-[#C7C9CC]/80 dark:border-[#3D4146] text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-250 shadow-xs">
              <Upload size={22} />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-sm sm:text-base text-[#0D0D0D] dark:text-[#F5F0E6]">
                <span>{isAr ? 'إسقاط أي ملف للكشف التلقائي عن الأداة' : 'Drop any file to auto-detect the right tool'}</span>
                <Sparkles size={14} className="text-[#0D0D0D] dark:text-[#D4D7DA]" />
              </div>
              <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] mt-0.5">
                {isAr
                  ? 'يدعم PDF و Word و PowerPoint و Excel والصور • معالجة فورية آمنة 100%'
                  : 'Supports PDF, Word, PowerPoint, Excel, Images • 100% Private in-browser'}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              type="button"
              className="kanto-shine-cta w-full sm:w-auto py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>{isAr ? 'اختيار ملف' : 'Select File'}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
