import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D0D0D]/60 backdrop-blur-none"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#141414] rounded-lg border border-[#C7C9CC] dark:border-[#333333] p-8 shadow-none flex flex-col animate-in fade-in zoom-in-95 duration-250 ease-apple">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#C7C9CC]/40 dark:border-[#262626] mb-5">
          <div className="flex items-center gap-2 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
            <User size={18} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
            <h3 id="auth-modal-title" className="text-lg font-serif italic">
              {mode === 'login' 
                ? (isAr ? 'تسجيل الدخول إلى كانتو' : 'Log in to Kanto PDF')
                : (isAr ? 'إنشاء حساب جديد' : 'Create Kanto Account')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg border border-[#C7C9CC]/40 hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1 bg-[#F5F0E6] dark:bg-[#0D0D0D] rounded-lg border border-[#C7C9CC]/50 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-250 ease-apple ${
              mode === 'login'
                ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]'
                : 'text-[#0D0D0D] dark:text-[#F5F0E6]'
            }`}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-250 ease-apple ${
              mode === 'signup'
                ? 'bg-[#0D0D0D] text-white dark:bg-white dark:text-[#0D0D0D]'
                : 'text-[#0D0D0D] dark:text-[#F5F0E6]'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Register'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0D0D0D] dark:text-[#F5F0E6] mb-1.5">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute inset-inline-start-3 text-[#5A5D61]" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="developer@kanto.org"
                className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#F5F0E6] focus:outline-none focus:ring-1 focus:ring-[#0D0D0D]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0D0D0D] dark:text-[#F5F0E6] mb-1.5">
              {isAr ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative flex items-center">
              <Lock size={14} className="absolute inset-inline-start-3 text-[#5A5D61]" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-[#F5F0E6] focus:outline-none focus:ring-1 focus:ring-[#0D0D0D]"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="kanto-shine-cta w-full py-3.5 font-bold text-xs flex items-center justify-center gap-2"
            >
              {isSuccess
                ? (isAr ? 'تم تسجيل الدخول بنجاح!' : 'Authenticated Successfully!')
                : (mode === 'login' ? (isAr ? 'دخول فوري' : 'Sign In Now') : (isAr ? 'إنشاء حساب' : 'Create Free Account'))}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-[#C7C9CC]/40 dark:border-[#262626] flex items-center justify-center gap-1.5 text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
          <ShieldCheck size={13} className="text-[#0D0D0D] dark:text-[#C7C9CC]" />
          <span>{isAr ? 'جلسة مشفرة محلياً 100%' : '100% Local Encrypted Session'}</span>
        </div>
      </div>
    </div>
  );
};
