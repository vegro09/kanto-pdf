import React from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsList';
import { SEO_METADATA } from '../../data/seoMeta';
import { ToolCard } from './ToolCard';

interface RelatedToolsProps {
  currentToolId: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentToolId }) => {
  const { lang } = useApp();
  const isAr = lang === 'ar';

  const meta = SEO_METADATA[currentToolId];
  const relatedIds = meta?.relatedToolIds || ['merge-pdf', 'split-pdf', 'compress-pdf', 'organize-pdf'];

  const relatedTools = TOOLS_LIST.filter(t => relatedIds.includes(t.id)).slice(0, 4);

  if (relatedTools.length === 0) return null;

  return (
    <section className="space-y-6 pt-10 border-t border-[#C7C9CC]/40 dark:border-[#262626]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif italic font-bold text-[#0D0D0D] dark:text-[#F5F0E6]">
          {isAr ? 'أدوات أخرى موصى بها' : 'Related Sovereign PDF Tools'}
        </h3>
        <span className="text-xs text-[#5A5D61] dark:text-[#A0A2A6]">
          {isAr ? 'دمج، تقسيم، ضغط، وأمان' : 'Frequently used together'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {relatedTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};
