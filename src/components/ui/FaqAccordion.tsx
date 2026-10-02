import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ items }) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    [items[0]?.id || '']: true,
  });

  const toggle = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4 w-full">
      {items.map(item => {
        const isOpen = !!openIds[item.id];
        return (
          <div
            key={item.id}
            className="rounded-[20px] border border-[#C7C9CC] dark:border-[#262626] bg-white dark:bg-[#141414] transition-colors duration-250 ease-apple overflow-hidden shadow-xs"
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
              id={`faq-question-${item.id}`}
              className="w-full p-6 flex items-center justify-between text-start font-bold text-sm sm:text-base text-[#0D0D0D] dark:text-[#F5F0E6] hover:bg-[#F5F0E6] dark:hover:bg-[#1A1A1A] transition-colors duration-250 ease-apple gap-4"
            >
              <span>{item.question}</span>
              <div className={`p-1.5 rounded-xl border border-[#C7C9CC]/50 dark:border-[#333333] bg-[#F5F0E6] dark:bg-[#1F1F1F] text-[#0D0D0D] dark:text-[#F5F0E6] shrink-0 transition-transform duration-250 ease-apple ${isOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={16} strokeWidth={2} />
              </div>
            </button>

            {isOpen && (
              <div
                id={`faq-answer-${item.id}`}
                role="region"
                aria-labelledby={`faq-question-${item.id}`}
                className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[#383B3F] dark:text-[#B8BAC0] leading-relaxed border-t border-[#C7C9CC]/40 dark:border-[#262626] bg-[#F5F0E6]/40 dark:bg-[#0D0D0D]"
              >
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
