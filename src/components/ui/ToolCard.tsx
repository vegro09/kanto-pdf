import React from 'react';
import { ToolDef } from '../../types/tools';
import { useApp } from '../../context/AppContext';
import { getCategoryAccent } from '../../utils/categoryAccents';
import { getToolIcon } from '../../utils/toolIcons';

interface ToolCardProps {
  tool: ToolDef;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { t, selectToolById, isDarkMode } = useApp();
  const accent = getCategoryAccent(tool.category);

  // Tree-shakeable Lucide icon lookup
  const IconComponent = getToolIcon(tool.icon);

  const handleClick = () => {
    selectToolById(tool.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const name = (t as unknown as Record<string, string>)[tool.nameKey] || tool.id;
  const desc = (t as unknown as Record<string, string>)[tool.descKey] || '';

  return (
    <button
      onClick={handleClick}
      data-category={tool.category}
      aria-label={`${name}: ${desc}`}
      className="kanto-tool-card group text-start flex flex-col justify-start min-h-[280px] w-full h-full p-6 md:p-8 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#262626] rounded-2xl hover:bg-gradient-to-tr hover:from-white hover:via-gray-100 hover:to-gray-200 dark:hover:from-[#141414] dark:hover:via-[#1A1A1A] dark:hover:to-[#222222] hover:border-gray-300 dark:hover:border-[#3D4146] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-[#0D0D0D] dark:focus-visible:ring-[#C7C9CC] overflow-hidden"
    >
      {/* Prominent Visual Icon: w-16 h-16 mb-5 */}
      <div
        style={{
          backgroundColor: isDarkMode ? accent.darkChipBg : accent.chipBg,
          color: isDarkMode ? accent.darkChipText : accent.chipText,
          borderColor: accent.borderColor,
        }}
        className="w-16 h-16 mb-5 rounded-2xl border flex items-center justify-center font-bold shrink-0 transition-transform duration-250 group-hover:scale-105 shadow-xs"
      >
        <IconComponent className="w-8 h-8" strokeWidth={2.2} />
      </div>

      {/* Title: text-lg md:text-xl font-bold text-gray-900 mb-3 */}
      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#F5F0E6] mb-3 leading-snug transition-colors">
        {name}
      </h3>

      {/* Description: text-sm text-gray-500 leading-relaxed line-clamp-3 */}
      <p className="text-sm text-gray-500 dark:text-[#A0A2A6] leading-relaxed line-clamp-3">
        {desc}
      </p>
    </button>
  );
};
