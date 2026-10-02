import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Printer, Copy, Edit3, KeyRound } from 'lucide-react';

interface ProtectPdfWorkspaceProps {
  hasPasswordEntered: boolean;
  allowPrinting: boolean;
  allowCopying: boolean;
  totalPages: number;
}

export const ProtectPdfWorkspace: React.FC<ProtectPdfWorkspaceProps> = ({
  hasPasswordEntered,
  allowPrinting,
  allowCopying,
  totalPages,
}) => {
  const { lang, uploadedFiles } = useApp();
  const isAr = lang === 'ar';
  const activeFile = uploadedFiles[0];

  return (
    <div className="space-y-6">
      {/* 1. Security Vault Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0D0D0D]/5 dark:bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0D0D0D] dark:bg-white text-white dark:text-[#0D0D0D] flex items-center justify-center shadow-md">
              <Lock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
                  {isAr ? 'تشفير وحماية المستند المعيارية' : 'Standard PDF Cryptographic Vault'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasPasswordEntered
                    ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D] border-transparent'
                    : 'bg-[#F5F0E6] dark:bg-[#222222] text-[#5A5D61] dark:text-[#A0A2A6] border-[#C7C9CC]'
                }`}>
                  {hasPasswordEntered
                    ? (isAr ? 'جاهز للقفل والتشفير' : 'Ready to Seal')
                    : (isAr ? 'بانتظار كلمة المرور' : 'Awaiting Password')}
                </span>
              </div>
              <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] mt-0.5">
                {activeFile?.name || 'document.pdf'} • {totalPages} {isAr ? 'صفحة' : 'pages'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#F5F0E6] dark:bg-[#1F1F1F] px-3 py-1.5 rounded-xl border border-[#C7C9CC]/60 text-[#0D0D0D] dark:text-[#F5F0E6]">
            <KeyRound size={14} />
            <span>256-bit AES / RC4</span>
          </div>
        </div>

        {/* Permissions Protection Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 mt-5 border-t border-[#C7C9CC]/40 dark:border-[#262626]">
          {/* Printing */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F5F0E6]/50 dark:bg-[#1C1C1C] border border-[#C7C9CC]/40 dark:border-[#2C2F33]">
            <Printer size={16} className={allowPrinting ? 'text-[#0D0D0D] dark:text-white' : 'text-[#8A8D91]'} />
            <div className="text-xs">
              <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block">
                {isAr ? 'إمكانية الطباعة:' : 'Printing Permission:'}
              </span>
              <span className="font-bold text-[#0D0D0D] dark:text-white">
                {allowPrinting
                  ? (isAr ? 'مسموح بها' : 'Allowed')
                  : (isAr ? 'محظورة ومقيدة' : 'Restricted (Locked)')}
              </span>
            </div>
          </div>

          {/* Copying */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F5F0E6]/50 dark:bg-[#1C1C1C] border border-[#C7C9CC]/40 dark:border-[#2C2F33]">
            <Copy size={16} className={allowCopying ? 'text-[#0D0D0D] dark:text-white' : 'text-[#8A8D91]'} />
            <div className="text-xs">
              <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block">
                {isAr ? 'نسخ النصوص:' : 'Text Copying:'}
              </span>
              <span className="font-bold text-[#0D0D0D] dark:text-white">
                {allowCopying
                  ? (isAr ? 'مسموح به' : 'Allowed')
                  : (isAr ? 'محظور ومقيد' : 'Restricted (Locked)')}
              </span>
            </div>
          </div>

          {/* Modification */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F5F0E6]/50 dark:bg-[#1C1C1C] border border-[#C7C9CC]/40 dark:border-[#2C2F33]">
            <Edit3 size={16} className="text-[#8A8D91]" />
            <div className="text-xs">
              <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6] block">
                {isAr ? 'تعديل المحتوى:' : 'Modifications:'}
              </span>
              <span className="font-bold text-[#0D0D0D] dark:text-white">
                {isAr ? 'محظور بشكل دائم' : 'Permanently Restricted'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Security Shield Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            <ShieldCheck size={16} />
            <span>{isAr ? 'معالجة محلية داخل المتصفح بنسبة 100%' : '100% Client-Side In-Browser Encryption'}</span>
          </div>
          <p className="text-[#5A5D61] dark:text-[#A0A2A6] text-[11px] leading-relaxed">
            {isAr
              ? 'تتم عملية التشفير بالكامل داخل الذاكرة المحلية لمتصفحك باستخدام تقنيات WebAssembly دون إرسال ملفاتك أو كلمات مرورك إلى أي خادم خارجي.'
              : 'All encryption keys and passwords are processed entirely in your local browser memory via WebAssembly. Zero files or passwords leave your device.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            <Lock size={16} />
            <span>{isAr ? 'توافق قياسي مع كافة مشغلات PDF' : 'Standard PDF Reader Interoperability'}</span>
          </div>
          <p className="text-[#5A5D61] dark:text-[#A0A2A6] text-[11px] leading-relaxed">
            {isAr
              ? 'الملف المشفر يتبع مواصفات ISO 32000 القياسية لملفات PDF ويعمل بسلاسة على Adobe Acrobat وGoogle Chrome وApple Preview وغيرها.'
              : 'Protected files comply strictly with the ISO 32000 PDF standard, prompting for credentials seamlessly in Adobe Acrobat, Chrome, and Apple Preview.'}
          </p>
        </div>
      </div>
    </div>
  );
};
