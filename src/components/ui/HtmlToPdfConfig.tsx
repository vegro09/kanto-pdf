import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Code2, Layout, CheckCircle2 } from 'lucide-react';

interface HtmlToPdfConfigProps {
  mode: 'url' | 'code';
  onModeChange: (mode: 'url' | 'code') => void;
  url: string;
  onUrlChange: (url: string) => void;
  htmlContent: string;
  onHtmlContentChange: (code: string) => void;
  pageSize: 'a4' | 'letter' | 'legal';
  onPageSizeChange: (size: 'a4' | 'letter' | 'legal') => void;
  orientation: 'portrait' | 'landscape';
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void;
  printBackground: boolean;
  onPrintBackgroundChange: (val: boolean) => void;
}

export const HtmlToPdfConfig: React.FC<HtmlToPdfConfigProps> = ({
  mode,
  onModeChange,
  url,
  onUrlChange,
  htmlContent,
  onHtmlContentChange,
  pageSize,
  onPageSizeChange,
  orientation,
  onOrientationChange,
  printBackground,
  onPrintBackgroundChange,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const sampleTemplates = [
    {
      name: isAr ? 'فاتورة أنيقة' : 'Invoice Template',
      code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; color: #0f172a; }
    .badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 13px; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
    .total { margin-top: 24px; text-align: right; font-size: 18px; font-weight: bold; color: #0f172a; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">KANTO PDF INVOICE</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Invoice #KANTO-2026-08</div>
    </div>
    <span class="badge">PAID IN FULL</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Vector PDF Engine Pro Subscription</td>
        <td>1</td>
        <td>$49.00</td>
        <td>$49.00</td>
      </tr>
      <tr>
        <td>Enterprise API Access (Zero Data Retention)</td>
        <td>1</td>
        <td>$99.00</td>
        <td>$99.00</td>
      </tr>
    </tbody>
  </table>
  <div class="total">Total: $148.00 USD</div>
</body>
</html>`,
    },
    {
      name: isAr ? 'تقرير ومقال' : 'Article Report',
      code: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
    h1 { color: #0f172a; font-size: 26px; border-left: 4px solid #3b82f6; padding-left: 12px; }
    p { font-size: 14px; }
    .highlight { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
  </style>
</head>
<body>
  <h1>Native Chromium Vector PDF Printing</h1>
  <p>This PDF is rendered directly from HTML code via Headless Chromium, preserving vector text crispness and CSS backgrounds without any rasterization artifacts.</p>
  <div class="highlight">
    <strong>Vector Guarantee:</strong> All text elements remain fully searchable, selectable, and highlightable in any PDF viewer.
  </div>
</body>
</html>`,
    },
  ];

  return (
    <div className="space-y-6 text-xs text-[#0D0D0D] dark:text-[#F5F0E6]">
      {/* 1. Mode Tabs: Enter URL vs Paste HTML */}
      <div className="space-y-2">
        <label className="font-bold block text-[#5A5D61] dark:text-[#A0A2A6]">
          {isAr ? 'طريقة الإدخال:' : 'Input Method:'}
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded-xl border border-[#C7C9CC] dark:border-[#333333]">
          <button
            type="button"
            onClick={() => onModeChange('url')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs transition-all ${
              mode === 'url'
                ? 'bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-white shadow-xs'
                : 'text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white'
            }`}
          >
            <Globe size={15} />
            <span>{isAr ? 'رابط موقع (URL)' : 'Enter URL'}</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('code')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs transition-all ${
              mode === 'code'
                ? 'bg-white dark:bg-[#0D0D0D] text-[#0D0D0D] dark:text-white shadow-xs'
                : 'text-[#5A5D61] dark:text-[#A0A2A6] hover:text-[#0D0D0D] dark:hover:text-white'
            }`}
          >
            <Code2 size={15} />
            <span>{isAr ? 'كود HTML' : 'Paste HTML'}</span>
          </button>
        </div>
      </div>

      {/* 2. URL Input Mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <label className="font-bold flex items-center justify-between">
            <span>{isAr ? 'رابط صفحة الويب (URL):' : 'Webpage URL:'}</span>
            <span className="text-[10px] text-[#5A5D61] font-mono">HTTPS</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={e => onUrlChange(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#0D0D0D] dark:focus:border-white transition-colors"
            />
            <Globe size={15} className="absolute left-3 top-3 text-[#5A5D61]" />
          </div>
          <p className="text-[11px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {isAr
              ? 'يقوم الخادم بزيارة الموقع وتحميل الخطوط والأنماط ثم طباعتها شعاعياً.'
              : 'The server visits the URL, waits for network idle, and prints a true vector PDF.'}
          </p>
        </div>
      )}

      {/* 3. Paste HTML Mode */}
      {mode === 'code' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-bold">
              {isAr ? 'كود HTML المصدري:' : 'HTML Source Code:'}
            </label>
            <div className="flex items-center gap-1.5">
              {sampleTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onHtmlContentChange(tpl.code)}
                  className="px-2 py-1 bg-[#F5F0E6] dark:bg-[#1F1F1F] hover:bg-[#E5E0D6] dark:hover:bg-[#2A2A2A] border border-[#C7C9CC]/60 rounded-md text-[10px] font-semibold text-[#0D0D0D] dark:text-[#F5F0E6] transition-colors"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={htmlContent}
            onChange={e => onHtmlContentChange(e.target.value)}
            placeholder="<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>"
            rows={8}
            className="w-full p-3 bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#0D0D0D] dark:focus:border-white transition-colors resize-y"
          />
        </div>
      )}

      {/* 4. Page Layout & Print Settings */}
      <div className="p-4 bg-[#F5F0E6]/50 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#262626] rounded-xl space-y-4">
        <div className="font-bold text-[11px] uppercase tracking-wider text-[#5A5D61] dark:text-[#A0A2A6] flex items-center gap-1.5">
          <Layout size={13} />
          <span>{isAr ? 'إعدادات تخطيط الصفحة' : 'Page Layout Settings'}</span>
        </div>

        {/* Page Size & Orientation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1.5">
              {isAr ? 'حجم الصفحة:' : 'Page Size:'}
            </label>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(e.target.value as any)}
              className="w-full p-2 bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] rounded-lg text-xs"
            >
              <option value="a4">A4 (210 × 297 mm)</option>
              <option value="letter">Letter (8.5 × 11 in)</option>
              <option value="legal">Legal (8.5 × 14 in)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1.5">
              {isAr ? 'الاتجاه:' : 'Orientation:'}
            </label>
            <select
              value={orientation}
              onChange={e => onOrientationChange(e.target.value as any)}
              className="w-full p-2 bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#333333] rounded-lg text-xs"
            >
              <option value="portrait">{isAr ? 'عمودي (Portrait)' : 'Portrait'}</option>
              <option value="landscape">{isAr ? 'أفقي (Landscape)' : 'Landscape'}</option>
            </select>
          </div>
        </div>

        {/* Print Backgrounds Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={printBackground}
            onChange={e => onPrintBackgroundChange(e.target.checked)}
            className="w-4 h-4 rounded border-[#C7C9CC] text-[#0D0D0D] focus:ring-0"
          />
          <span className="font-semibold text-xs text-[#0D0D0D] dark:text-[#F5F0E6]">
            {isAr ? 'تضمين ألوان وخلفيات CSS (Print Backgrounds)' : 'Print CSS Background Graphics'}
          </span>
        </label>
      </div>

      {/* 5. Vector Guarantee Badge */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
        <CheckCircle2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>
          {isAr
            ? 'طباعة شعاعية بنسبة 100%: النصوص تظل قابلة للتحديد والبحث، دون أي تنقيط للصورة.'
            : '100% Native Vector: Text remains selectable, searchable, and crisp at all zoom levels.'}
        </span>
      </div>
    </div>
  );
};
