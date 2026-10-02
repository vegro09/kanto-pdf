import React from 'react';
import { OrganizePageItem } from '../../services/organizeEngine';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface OrganizeConfigProps {
  pages: OrganizePageItem[];
  sourcePageCount: number;
  onResetOriginal: () => void;
}

export const OrganizeConfig: React.FC<OrganizeConfigProps> = ({
  pages,
  sourcePageCount,
  onResetOriginal,
}) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const duplicates = pages.filter(p => p.isDuplicate).length;
  const rotated = pages.filter(p => (p.rotation || 0) % 360 !== 0).length;
  const uniqueSourcesInDeck = new Set(pages.map(p => p.originalIndex)).size;
  const deletedFromOriginal = Math.max(0, sourcePageCount - uniqueSourcesInDeck);

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Summary Metrics Deck */}
      <div className="p-3.5 rounded-[14px] bg-white dark:bg-[#141414] border border-[#C7C9CC] dark:border-[#262626] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0D0D0D] dark:text-[#F5F0E6] flex items-center gap-1.5">
            <Layers size={14} />
            <span>{isAr ? 'ملخص تنظيم المستند:' : 'Organization Summary:'}</span>
          </span>
          <span className="font-mono text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
            {pages.length} {isAr ? 'صفحات نهائية' : 'output pages'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] border border-[#C7C9CC]/40 dark:border-[#333333]">
            <div className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'الصفحات الأصلية' : 'Source Pages'}
            </div>
            <div className="font-mono font-bold text-sm text-[#0D0D0D] dark:text-white">
              {sourcePageCount}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] border border-[#C7C9CC]/40 dark:border-[#333333]">
            <div className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'الصفحات الناتجة' : 'Output Pages'}
            </div>
            <div className="font-mono font-bold text-sm text-[#0D0D0D] dark:text-white">
              {pages.length}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] border border-[#C7C9CC]/40 dark:border-[#333333]">
            <div className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'صفحات مكررة (+)' : 'Duplicates (+)'}
            </div>
            <div className="font-mono font-bold text-sm text-[#0D0D0D] dark:text-white">
              {duplicates}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-[#F5F0E6]/50 dark:bg-[#1A1A1A] border border-[#C7C9CC]/40 dark:border-[#333333]">
            <div className="text-[10px] text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'صفحات محذوفة (-)' : 'Deleted (-)'}
            </div>
            <div className="font-mono font-bold text-sm text-[#0D0D0D] dark:text-white">
              {deletedFromOriginal}
            </div>
          </div>
        </div>

        {rotated > 0 && (
          <div className="pt-2 border-t border-[#C7C9CC]/40 dark:border-[#262626] flex items-center justify-between text-[11px]">
            <span className="text-[#5A5D61] dark:text-[#A0A2A6]">
              {isAr ? 'صفحات بتدوير مخصص:' : 'Rotated Pages:'}
            </span>
            <span className="font-mono font-bold text-[#0D0D0D] dark:text-white">
              {rotated}
            </span>
          </div>
        )}
      </div>

      {/* 2. Reset Button */}
      <button
        type="button"
        onClick={onResetOriginal}
        className="w-full py-2.5 px-3 rounded-xl border border-[#C7C9CC] dark:border-[#333333] bg-white dark:bg-[#141414] hover:bg-[#F5F0E6] dark:hover:bg-[#1F1F1F] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all text-[#0D0D0D] dark:text-[#F5F0E6]"
      >
        <RefreshCw size={13} />
        <span>{isAr ? 'استعادة الترتيب الأصلي' : 'Restore Original Sequence'}</span>
      </button>

      {/* 3. Non-Destructive Fresh Document Reconstruction Guarantee Shield */}
      <div className="p-3.5 rounded-[14px] bg-[#F5F0E6]/60 dark:bg-[#181818] border border-[#C7C9CC]/80 dark:border-[#333333] space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          <ShieldCheck size={14} className="shrink-0" />
          <span>{isAr ? 'بناء نظيف غير متلف (Non-Destructive):' : 'Fresh Clean Document Architecture:'}</span>
        </div>
        <p className="text-[#383B3F] dark:text-[#B8BAC0]">
          {isAr
            ? 'يتم إنشاء مستند PDF جديد بالكامل ونسخ الصفحات إليه بشكل مستقل، مما يمنع تلف الملفات أو تصادم الفهارس عند تكرار الصفحات.'
            : 'Constructs a brand-new PDF context via pdf-lib and copies target indices sequentially, completely eliminating corruption or index collisions.'}
        </p>
      </div>
    </div>
  );
};
