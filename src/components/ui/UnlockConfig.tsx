import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EncryptionType } from '../../services/unlockEngine';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface UnlockConfigProps {
  encryptionType: EncryptionType;
  passwordValue: string;
  onPasswordChange: (val: string) => void;
  onSubmitUnlock?: () => void;
  pageCount: number;
  filename: string;
  authError?: string | null;
}

export const UnlockConfig: React.FC<UnlockConfigProps> = ({
  encryptionType,
  passwordValue,
  onPasswordChange,
  onSubmitUnlock,
  pageCount,
  filename,
  authError,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Status Banner according to Encryption Type */}
      {encryptionType === 'open_password' && (
        <div className="p-4 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6]">
              <Lock size={18} className="text-[#0D0D0D] dark:text-white" />
              <span>{isAr ? 'المستند محمي بكلمة مرور' : 'Password-Protected PDF'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] text-[#0D0D0D] dark:text-white">
              AES ENCRYPTED
            </span>
          </div>

          <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
            {isAr
              ? 'يرجى إدخال كلمة مرور فتح المستند لفك التشفير وحفظ نسخة جديدة غير مقيدة نهائياً.'
              : 'Enter the document password below to decrypt and produce an unlocked, unrestricted PDF.'}
          </p>
        </div>
      )}

      {encryptionType === 'owner_restrictions' && (
        <div className="p-4 rounded-[16px] bg-[#F5F0E6] dark:bg-[#1C1C1C] border border-[#C7C9CC] dark:border-[#333333] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0D0D0D] dark:text-[#F5F0E6]">
              <Unlock size={18} className="text-[#0D0D0D] dark:text-white" />
              <span>{isAr ? 'قيود أذونات التعديل والطباعة' : 'Permissions Restricted'}</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC] dark:border-[#333333] text-[#0D0D0D] dark:text-white">
              OWNER PASS
            </span>
          </div>

          <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
            {isAr
              ? 'المستند محمي بقيود المالك (منع الطباعة أو النسخ أو التعديل). سيقوم كانتو بإزالة كافة القيود مباشرة دون طلب كلمة مرور.'
              : 'This document has printing/editing restrictions. Kanto will strip all restrictions directly without requiring a password.'}
          </p>
        </div>
      )}

      {encryptionType === 'none' && (
        <div className="p-4 rounded-[16px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC] dark:border-[#2C2F33] space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            <CheckCircle2 size={16} />
            <span>{isAr ? 'المستند غير مقيد ومفتوح بالفعل' : 'Document Is Already Unlocked'}</span>
          </div>
          <p className="text-[11px] text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed">
            {isAr
              ? 'هذا الملف لا يحتوي على أي كلمات مرور أو قيود أذونات. يمكنك حفظه مباشرة كنسخة نظيفة ومحسّنة.'
              : 'This PDF has no password protection or permissions restrictions. Processing will output a clean, standardized document.'}
          </p>
        </div>
      )}

      {/* 2. Password Input Box (Shown when Open Password is required) */}
      {encryptionType === 'open_password' && (
        <div className="space-y-2 p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626]">
          <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block text-xs">
            {isAr ? 'أدخل كلمة مرور المستند:' : 'Enter Document Password:'}
          </label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordValue}
              onChange={e => onPasswordChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && passwordValue.trim()) {
                  onSubmitUnlock?.();
                }
              }}
              placeholder={isAr ? 'كلمة المرور...' : 'Document password...'}
              className="w-full kanto-input text-xs font-mono pr-9"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A5D61] hover:text-[#0D0D0D] dark:text-[#A0A2A6] dark:hover:text-white transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {authError && (
            <div className="p-2 rounded-lg bg-[#F5F0E6] dark:bg-[#2A1515] border border-[#0D0D0D] dark:border-[#552020] text-xs font-semibold text-[#0D0D0D] dark:text-[#FFB4B4] flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Document Analysis Summary */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <span>{isAr ? 'اسم المستند:' : 'Document Name:'}</span>
          <span className="font-mono truncate max-w-[170px]" title={filename}>{filename}</span>
        </div>
        {pageCount > 0 && (
          <div className="flex items-center justify-between text-[#383B3F] dark:text-[#B8BAC0]">
            <span>{isAr ? 'إجمالي الصفحات:' : 'Total Pages:'}</span>
            <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">{pageCount}</span>
          </div>
        )}
      </div>

      {/* 4. Privacy Guarantee */}
      <div className="p-3 rounded-xl bg-[#F5F0E6]/60 dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] flex items-center gap-2 text-[11px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6]">
        <ShieldCheck size={16} className="shrink-0 text-[#0D0D0D] dark:text-[#C7C9CC]" />
        <span>
          {isAr
            ? 'تتم المعالجة وفك التشفير محلياً في الذاكرة دون إرسال كلمات المرور عبر الإنترنت'
            : 'Zero Data Exposure: Decrypted in local browser memory with 0 network transmission'}
        </span>
      </div>
    </div>
  );
};
