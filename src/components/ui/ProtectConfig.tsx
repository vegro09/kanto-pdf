import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProtectConfigProps {
  userPassword: string;
  onUserPasswordChange: (val: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (val: string) => void;
  allowPrinting: boolean;
  onAllowPrintingChange: (val: boolean) => void;
  allowCopying: boolean;
  onAllowCopyingChange: (val: boolean) => void;
  totalPages: number;
}

export const ProtectConfig: React.FC<ProtectConfigProps> = ({
  userPassword,
  onUserPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  allowPrinting,
  onAllowPrintingChange,
  allowCopying,
  onAllowCopyingChange,
  totalPages: _totalPages,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Compute password strength
  const getStrength = (pwd: string) => {
    if (!pwd || pwd.length === 0) return { score: 0, labelEn: 'None', labelAr: 'لا يوجد', color: 'bg-transparent' };
    if (pwd.length < 6) return { score: 1, labelEn: 'Too Short', labelAr: 'قصيرة جداً', color: 'bg-red-500' };
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score === 2) return { score: 2, labelEn: 'Weak', labelAr: 'ضعيفة', color: 'bg-orange-500' };
    if (score === 3) return { score: 3, labelEn: 'Good', labelAr: 'جيدة', color: 'bg-blue-500' };
    return { score: 4, labelEn: 'Strong', labelAr: 'قوية جداً', color: 'bg-green-600' };
  };

  const strength = getStrength(userPassword);
  const passwordsMatch = userPassword.length > 0 && userPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && userPassword !== confirmPassword;

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Password Credentials Form */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-3">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
          <Lock size={13} />
          <span>{isAr ? 'تعيين كلمة مرور فتح المستند:' : 'Document Open Password:'}</span>
        </label>

        {/* Primary Password Input */}
        <div className="space-y-1">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={userPassword}
              onChange={e => onUserPasswordChange(e.target.value)}
              placeholder={isAr ? 'أدخل كلمة المرور المطلوبة...' : 'Enter password...'}
              className="w-full p-2.5 ltr:pr-9 rtl:pl-9 rounded-xl border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono text-xs text-[#0D0D0D] dark:text-[#F5F0E6] placeholder:text-[#8A8D91] focus:outline-hidden focus:border-[#0D0D0D] dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Strength Bar */}
          {userPassword.length > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#5A5D61] dark:text-[#A0A2A6]">
                  {isAr ? 'قوة كلمة المرور:' : 'Password Strength:'}
                </span>
                <span className="font-bold">{isAr ? strength.labelAr : strength.labelEn}</span>
              </div>
              <div className="w-full h-1.5 bg-[#C7C9CC]/40 dark:bg-[#262626] rounded-full overflow-hidden">
                <div
                  style={{ width: `${(strength.score / 4) * 100}%` }}
                  className={`h-full ${strength.color} transition-all duration-300`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold text-[#383B3F] dark:text-[#B8BAC0] block">
            {isAr ? 'تأكيد كلمة المرور:' : 'Confirm Password:'}
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => onConfirmPasswordChange(e.target.value)}
              placeholder={isAr ? 'أعد كتابة كلمة المرور...' : 'Re-enter password...'}
              className="w-full p-2.5 ltr:pr-9 rtl:pl-9 rounded-xl border border-[#C7C9CC] dark:border-[#333333] bg-[#F5F0E6]/40 dark:bg-[#1F1F1F] font-mono text-xs text-[#0D0D0D] dark:text-[#F5F0E6] placeholder:text-[#8A8D91] focus:outline-hidden focus:border-[#0D0D0D] dark:focus:border-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 ltr:right-2.5 rtl:left-2.5 flex items-center text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Match / Mismatch Feedback */}
          {passwordsMatch && (
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 font-bold pt-0.5">
              <CheckCircle2 size={12} />
              <span>{isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match perfectly'}</span>
            </div>
          )}
          {isMismatch && (
            <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold pt-0.5">
              <AlertCircle size={12} />
              <span>{isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Permission Restrictions Matrix */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <label className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] block">
          {isAr ? 'صلاحيات الاستخدام والقيود:' : 'Permissions & Restrictions:'}
        </label>

        {/* Prevent Printing */}
        <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-[#F5F0E6]/50 dark:hover:bg-[#1F1F1F] transition-colors">
          <input
            type="checkbox"
            checked={!allowPrinting}
            onChange={e => onAllowPrintingChange(!e.target.checked)}
            className="mt-0.5 rounded accent-[#0D0D0D] dark:accent-white"
          />
          <div>
            <span className="font-bold text-[#0D0D0D] dark:text-white block text-[11px]">
              {isAr ? 'حظر ومنع الطباعة' : 'Prevent Printing'}
            </span>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'تعطيل أوامر الطباعة عالية الدقة داخل المستند' : 'Restrict high-resolution printing'}
            </span>
          </div>
        </label>

        {/* Prevent Text Copying */}
        <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-[#F5F0E6]/50 dark:hover:bg-[#1F1F1F] transition-colors">
          <input
            type="checkbox"
            checked={!allowCopying}
            onChange={e => onAllowCopyingChange(!e.target.checked)}
            className="mt-0.5 rounded accent-[#0D0D0D] dark:accent-white"
          />
          <div>
            <span className="font-bold text-[#0D0D0D] dark:text-white block text-[11px]">
              {isAr ? 'منع نسخ النصوص والمحتوى' : 'Prevent Text & Content Copying'}
            </span>
            <span className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'منع تحديد واستخراج النصوص والصور' : 'Block clipboard copy & content extraction'}
            </span>
          </div>
        </label>
      </div>

      {/* 3. Cryptographic Standard Guarantee Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'تشفير أصلي متوافق عبر pdf-lib:' : 'Native pdf-lib Standard Encryption:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'تستخدم الأداة التشفير المعياري الأصلي داخل ملف PDF دون أي مكتبات تشفير خارجية تسبب تلف الفهارس.'
            : 'Employs standard ISO 32000 PDF encryption via native pdfDoc.encrypt() with zero structural corruption.'}
        </p>
      </div>
    </div>
  );
};
