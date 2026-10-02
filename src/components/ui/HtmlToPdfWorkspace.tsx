import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Code2, ShieldCheck, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface HtmlToPdfWorkspaceProps {
  mode: 'url' | 'code';
  url: string;
  htmlContent: string;
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
}

export const HtmlToPdfWorkspace: React.FC<HtmlToPdfWorkspaceProps> = ({
  mode,
  url,
  htmlContent,
  pageSize,
  orientation,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const effectiveUrl = url && url.trim().length > 0 ? url.trim() : 'https://example.com';

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full space-y-6">
      {/* 1. Simulated Browser Window / Code Container */}
      <div className="w-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] rounded-2xl shadow-sm overflow-hidden text-left rtl:text-left">
        {/* Browser Titlebar */}
        <div className="bg-[#F5F0E6] dark:bg-[#1A1A1A] px-4 py-3 border-b border-[#C7C9CC]/60 dark:border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E5E0D6] dark:bg-[#333333]" />
            <div className="w-3 h-3 rounded-full bg-[#E5E0D6] dark:bg-[#333333]" />
            <div className="w-3 h-3 rounded-full bg-[#E5E0D6] dark:bg-[#333333]" />
          </div>

          {/* Address Bar */}
          <div className="flex-1 max-w-md mx-4 bg-white dark:bg-[#0D0D0D] border border-[#C7C9CC]/80 dark:border-[#333333] rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-[#0D0D0D] dark:text-[#F5F0E6] truncate">
            {mode === 'url' ? (
              <>
                <Lock size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">{effectiveUrl}</span>
              </>
            ) : (
              <>
                <Code2 size={13} className="text-blue-500 shrink-0" />
                <span>source.html ({htmlContent.length} chars)</span>
              </>
            )}
          </div>

          <div className="text-[11px] font-bold text-[#5A5D61] dark:text-[#A0A2A6] uppercase tracking-wider">
            {pageSize.toUpperCase()} • {orientation}
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-6 min-h-[260px] max-h-[360px] overflow-y-auto font-mono text-xs">
          {mode === 'url' ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center space-y-4 font-sans">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F0E6] dark:bg-[#1F1F1F] border border-[#C7C9CC] flex items-center justify-center text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
                <Globe size={32} />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="font-bold text-sm text-[#0D0D0D] dark:text-white truncate" dir="ltr">
                  {effectiveUrl}
                </h4>
                <p className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
                  {isAr
                    ? 'سيتم تشغيل متصفح Chromium في الخادم لفتح الرابط، وتنزيل كامل الخطوط والألوان وطباعتها شعاعياً.'
                    : 'Chromium headless engine will load this URL and print full-fidelity vector PDF with selectable text.'}
                </p>
              </div>
            </div>
          ) : (
            <pre className="text-[#0D0D0D] dark:text-[#E5E0D6] leading-relaxed whitespace-pre-wrap break-all text-[11px]">
              {htmlContent || `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Vector PDF</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>`}
            </pre>
          )}
        </div>
      </div>

      {/* 2. Vector Guarantee & Zero Data Retention Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <Sparkles size={14} className="text-blue-500" />
          <span>{isAr ? 'طباعة متجهة نقية (Vector)' : 'Native Vector Rendering'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>{isAr ? 'نصوص قابلة للتحديد والنسخ' : '100% Selectable Text'}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] shadow-xs">
          <ShieldCheck size={14} className="text-amber-500" />
          <span>{isAr ? 'بدون تنقيط (No Rasterization)' : 'Zero Quality Loss'}</span>
        </div>
      </div>
    </div>
  );
};
