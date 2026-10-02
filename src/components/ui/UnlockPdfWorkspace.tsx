import React from 'react';
import { useApp } from '../../context/AppContext';
import { Unlock, ShieldCheck, Key, FileCheck, CheckCircle2, Lock } from 'lucide-react';

interface UnlockPdfWorkspaceProps {
  hasPasswordEntered: boolean;
  filename: string;
  totalPages: number;
}

export const UnlockPdfWorkspace: React.FC<UnlockPdfWorkspaceProps> = ({
  hasPasswordEntered,
  filename,
  totalPages,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  return (
    <div className="flex flex-col items-center justify-center min-h-[440px] p-8 max-w-xl mx-auto w-full text-center space-y-6">
      {/* 1. Animated Cryptographic Vault Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-[#F5F0E6] dark:bg-[#1A1A1A] border-2 border-[#0D0D0D] dark:border-[#333333] flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
          {hasPasswordEntered ? (
            <Unlock size={44} className="text-[#0D0D0D] dark:text-[#F5F0E6] animate-pulse" />
          ) : (
            <Lock size={44} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-[#0D0D0D] border border-[#0D0D0D] dark:border-white flex items-center justify-center text-[#0D0D0D] dark:text-white shadow-sm">
          {hasPasswordEntered ? <CheckCircle2 size={16} /> : <Key size={16} />}
        </div>
      </div>

      {/* 2. Headline & Dynamic Status */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#0D0D0D] dark:text-[#F5F0E6] tracking-tight">
          {isAr ? 'فك حماية وتشفير مستند PDF' : 'PDF Decryption & Security Unlock'}
        </h3>
        <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6] max-w-md mx-auto leading-relaxed">
          {hasPasswordEntered
            ? (isAr
                ? 'تم إدخال مفتاح فك التشفير. اضغط على زر "فك قفل PDF" لتوليد نسخة مفتوحة بالكامل بدون كلمات مرور.'
                : 'Decryption key ready. Click "Unlock PDF" to strip all encryption and permissions permanently.')
            : (isAr
                ? 'المستند محمي ومشفر. يرجى إدخال كلمة المرور في اللوحة الجانبية للترخيص بفك التشفير.'
                : 'This document is password-protected. Enter the password in the sidebar to authorize decryption.')}
        </p>
      </div>

      {/* 3. Document Details Card */}
      <div className="w-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-2xl p-5 shadow-xs text-xs space-y-3.5 text-left rtl:text-right">
        <div className="flex items-center justify-between border-b border-[#C7C9CC]/40 dark:border-[#262626] pb-3">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-2">
            <FileCheck size={16} />
            <span>{isAr ? 'الملف الهدف:' : 'Target Document:'}</span>
          </span>
          <span className="font-mono text-xs font-semibold text-[#0D0D0D] dark:text-white truncate max-w-[200px]" title={filename}>
            {filename}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr ? 'عدد الصفحات القابلة للفتح:' : 'Pages to Decrypt:'}
          </span>
          <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
            {totalPages} {isAr ? 'صفحات' : 'page(s)'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr ? 'حالة التشفير المستهدفة:' : 'Target Security Status:'}
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            <span>{isAr ? 'إزالة تامة لكافة القيود' : '100% Open & Unrestricted'}</span>
          </span>
        </div>
      </div>

      {/* 4. Privacy & Zero-Knowledge Guarantee */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] text-[11px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
        <ShieldCheck size={14} className="text-[#0D0D0D] dark:text-white" />
        <span>{isAr ? 'معالجة مشفرة آمنة دون تخزين' : 'Zero Data Retention Decryption Pipeline'}</span>
      </div>
    </div>
  );
};
