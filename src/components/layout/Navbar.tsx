import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TOOLS_LIST } from '../../data/toolsList';
import { ToolDef } from '../../types/tools';
import { getCategoryAccent } from '../../utils/categoryAccents';
import { getToolIcon } from '../../utils/toolIcons';
import {
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Layers,
  Scissors,
  Minimize2,
  RefreshCw,
  Grid
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    t,
    lang,
    isDarkMode,
    toggleTheme,
    setScreen,
    resetWorkspace,
    selectToolById,
  } = useApp();

  const isAr = lang === 'ar';

  // Mega-menu state: 'convert' | 'all' | null
  const [activeMegaMenu, setActiveMegaMenu] = useState<'convert' | 'all' | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<'convert' | 'all' | null>(null);

  // Close debounce timer ref to prevent flickering when moving diagonally
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Quick lookup helper for tools by ID
  const toolMap = useRef<Record<string, ToolDef>>({});
  if (Object.keys(toolMap.current).length === 0) {
    TOOLS_LIST.forEach(tool => {
      toolMap.current[tool.id] = tool;
    });
  }

  // Close mega-menus on escape or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMegaMenu(null);
        setIsMobileDrawerOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Anti-flicker hover handlers
  const handleMouseEnter = (menu: 'convert' | 'all') => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMegaMenu(menu);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 220); // 220ms safe grace window for diagonal cursor motion
  };

  const handleToggleMenu = (menu: 'convert' | 'all') => {
    setActiveMegaMenu(prev => (prev === menu ? null : menu));
  };

  const handleSelectTool = (toolId: string) => {
    setActiveMegaMenu(null);
    setIsMobileDrawerOpen(false);
    selectToolById(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setActiveMegaMenu(null);
    setIsMobileDrawerOpen(false);
    resetWorkspace();
    setScreen('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert to PDF list (Step C - Column 1)
  const convertToPdfIds = [
    'jpg-to-pdf',
    'word-to-pdf',
    'powerpoint-to-pdf',
    'excel-to-pdf',
    'html-to-pdf'
  ];

  // Convert from PDF list (Step C - Column 2)
  const convertFromPdfIds = [
    'pdf-to-jpg',
    'pdf-to-word',
    'pdf-to-powerpoint',
    'pdf-to-excel',
    'pdf-to-pdfa',
    'pdf-to-html'
  ];

  // All PDF Tools Categorized Columns (Step D)
  const allToolsColumns = [
    {
      titleEn: 'ORGANIZE PDF',
      titleAr: 'تنظيم PDF',
      accentColor: 'text-[#8A6D3B] dark:text-[#EFE8DC]',
      toolIds: ['merge-pdf', 'split-pdf', 'organize-pdf', 'crop-pdf', 'rotate-pdf', 'scan-to-pdf']
    },
    {
      titleEn: 'OPTIMIZE & REPAIR',
      titleAr: 'تحسين وإصلاح',
      accentColor: 'text-[#31708F] dark:text-[#C7C9CC]',
      toolIds: ['compress-pdf', 'repair-pdf', 'pdf-to-pdfa', 'unlock-pdf', 'protect-pdf']
    },
    {
      titleEn: 'CONVERT PDF',
      titleAr: 'تحويل PDF',
      accentColor: 'text-[#3C763D] dark:text-[#A0A2A6]',
      toolIds: [
        'pdf-to-word',
        'pdf-to-excel',
        'pdf-to-powerpoint',
        'pdf-to-jpg',
        'word-to-pdf',
        'excel-to-pdf',
        'powerpoint-to-pdf',
        'jpg-to-pdf'
      ]
    },
    {
      titleEn: 'EDIT & SECURITY',
      titleAr: 'تعديل وأمان',
      accentColor: 'text-[#A94442] dark:text-[#F5F0E6]',
      toolIds: ['edit-pdf', 'pdf-forms', 'sign-pdf', 'redact-pdf', 'watermark-pdf', 'page-numbers', 'html-to-pdf', 'pdf-to-html']
    }
  ];

  // Helper renderer for a tool link item in mega-menu
  const renderToolItem = (toolId: string) => {
    const tool = toolMap.current[toolId];
    if (!tool) return null;

    const accent = getCategoryAccent(tool.category);
    const IconComponent = getToolIcon(tool.icon);
    const name = (t as unknown as Record<string, string>)[tool.nameKey] || tool.id;
    const desc = (t as unknown as Record<string, string>)[tool.descKey] || '';

    return (
      <button
        key={tool.id}
        onClick={() => handleSelectTool(tool.id)}
        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100/90 dark:hover:bg-[#1E1E1E] transition-all duration-150 text-start w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-400"
      >
        <div
          style={{
            backgroundColor: isDarkMode ? accent.darkChipBg : accent.chipBg,
            color: isDarkMode ? accent.darkChipText : accent.chipText,
            borderColor: accent.borderColor,
          }}
          className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs"
        >
          <IconComponent size={16} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 dark:text-[#F5F0E6] group-hover:text-primary transition-colors truncate">
            {name}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-[#888888] truncate leading-tight">
            {desc}
          </div>
        </div>
      </button>
    );
  };

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-[100] w-full bg-white dark:bg-[#0D0D0D] border-b border-gray-100 dark:border-[#262626] transition-colors duration-250"
    >
      <div className="w-full px-6 md:px-12 py-3.5 flex justify-between items-center relative">
        {/* Brand Wordmark (Anchored to Far Left) */}
        <div className="flex items-center justify-start shrink-0">
          <button
            onClick={handleLogoClick}
            aria-label="Kanto PDF Home"
            className="flex items-baseline gap-2 group focus:outline-none"
          >
            <span className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D] dark:text-[#F5F0E6] transition-colors duration-250">
              Kanto
            </span>
            <span className="font-sans font-extrabold tracking-[0.2em] text-xs sm:text-sm uppercase text-[#0D0D0D] dark:text-[#F5F0E6] opacity-90 transition-colors duration-250">
              PDF
            </span>
          </button>
        </div>

        {/* Center Mega-Menu Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold">
          {/* Group 1: Quick Direct Tool Shortcuts */}
          <div className="flex items-center gap-1">
            {/* 1. Merge PDF Direct Link */}
            <button
              onClick={() => handleSelectTool('merge-pdf')}
              className="px-3 py-2 rounded-xl text-gray-700 dark:text-[#C7C9CC] hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#1A1A1A] transition-all flex items-center gap-1.5 font-semibold"
            >
              <Layers size={14} className="text-gray-500 dark:text-gray-400" />
              <span>{isAr ? 'دمج PDF' : 'Merge PDF'}</span>
            </button>

            {/* 2. Split PDF Direct Link */}
            <button
              onClick={() => handleSelectTool('split-pdf')}
              className="px-3 py-2 rounded-xl text-gray-700 dark:text-[#C7C9CC] hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#1A1A1A] transition-all flex items-center gap-1.5 font-semibold"
            >
              <Scissors size={14} className="text-gray-500 dark:text-gray-400" />
              <span>{isAr ? 'تقسيم PDF' : 'Split PDF'}</span>
            </button>

            {/* 3. Compress PDF Direct Link */}
            <button
              onClick={() => handleSelectTool('compress-pdf')}
              className="px-3 py-2 rounded-xl text-gray-700 dark:text-[#C7C9CC] hover:text-black dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#1A1A1A] transition-all flex items-center gap-1.5 font-semibold"
            >
              <Minimize2 size={14} className="text-gray-500 dark:text-gray-400" />
              <span>{isAr ? 'ضغط PDF' : 'Compress PDF'}</span>
            </button>
          </div>

          {/* Vertical Divider separating Quick Shortcuts from Mega-Menu Dropdowns */}
          <div className="h-6 w-px bg-gray-200 dark:bg-[#333333] mx-2 xl:mx-3 shrink-0" aria-hidden="true" />

          {/* Group 2: Distinct Mega-Menu Triggers */}
          <div className="flex items-center gap-2">
            {/* 4. Convert PDF Mega-Menu Trigger (Anchored Relative Container) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('convert')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleToggleMenu('convert')}
                aria-expanded={activeMegaMenu === 'convert'}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMegaMenu === 'convert'
                    ? 'bg-gray-100 dark:bg-[#222222] border-gray-300 dark:border-[#383838] text-black dark:text-white shadow-xs'
                    : 'bg-gray-50/90 dark:bg-[#161616] border-gray-200/90 dark:border-[#262626] text-gray-800 dark:text-[#E6E6E6] hover:bg-gray-100 dark:hover:bg-[#202020] hover:border-gray-300 dark:hover:border-[#333333]'
                }`}
              >
                <RefreshCw size={14} className="text-gray-600 dark:text-gray-400" />
                <span>{isAr ? 'تحويل PDF' : 'Convert PDF'}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    activeMegaMenu === 'convert' ? 'rotate-180 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
              </button>

              {/* "Convert PDF" 2-Column Mega-Menu Floating Panel: Centered Under Button */}
              {activeMegaMenu === 'convert' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100]"
                  onMouseEnter={() => handleMouseEnter('convert')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="bg-white dark:bg-[#141414] border border-gray-200/90 dark:border-[#2A2A2A] rounded-2xl shadow-2xl p-6 w-[560px] animate-in fade-in zoom-in-95 duration-150">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Column 1: CONVERT TO PDF */}
                      <div>
                        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-[#222222]">
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-[#888888]">
                            {isAr ? 'تحويل إلى PDF' : 'CONVERT TO PDF'}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {convertToPdfIds.map(renderToolItem)}
                        </div>
                      </div>

                      {/* Column 2: CONVERT FROM PDF */}
                      <div>
                        <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-[#222222]">
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-[#888888]">
                            {isAr ? 'تحويل من PDF' : 'CONVERT FROM PDF'}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {convertFromPdfIds.map(renderToolItem)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. All PDF Tools Mega-Menu Trigger (Anchored Relative Container) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('all')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleToggleMenu('all')}
                aria-expanded={activeMegaMenu === 'all'}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMegaMenu === 'all'
                    ? 'bg-gray-100 dark:bg-[#222222] border-gray-300 dark:border-[#383838] text-black dark:text-white shadow-xs'
                    : 'bg-gray-50/90 dark:bg-[#161616] border-gray-200/90 dark:border-[#262626] text-gray-800 dark:text-[#E6E6E6] hover:bg-gray-100 dark:hover:bg-[#202020] hover:border-gray-300 dark:hover:border-[#333333]'
                }`}
              >
                <Grid size={14} className="text-gray-700 dark:text-gray-300" />
                <span>{isAr ? 'جميع أدوات PDF' : 'All PDF Tools'}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    activeMegaMenu === 'all' ? 'rotate-180 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
              </button>

              {/* "All PDF Tools" 4-Column Mega-Menu Floating Panel: Anchored right-0 to prevent right overflow */}
              {activeMegaMenu === 'all' && (
                <div
                  className="absolute top-full right-0 rtl:right-auto rtl:left-0 pt-2 z-[100]"
                  onMouseEnter={() => handleMouseEnter('all')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="bg-white dark:bg-[#141414] border border-gray-200/90 dark:border-[#2A2A2A] rounded-2xl shadow-2xl p-6 w-[880px] max-w-[calc(100vw-3rem)] animate-in fade-in zoom-in-95 duration-150">
                    <div className="grid grid-cols-4 gap-5">
                      {allToolsColumns.map((col, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-100 dark:border-[#222222]">
                            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-[#888888]">
                              {isAr ? col.titleAr : col.titleEn}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {col.toolIds.map(renderToolItem)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Right Actions Bar (Dark Mode Toggle & Mobile Menu) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Direct Interface Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-gray-800 dark:text-[#F5F0E6] hover:bg-gray-50 dark:hover:bg-[#1F1F1F] transition-colors shadow-2xs"
          >
            {isDarkMode ? <Sun size={16} className="text-[#F5F0E6]" /> : <Moon size={16} className="text-gray-800" />}
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(prev => !prev)}
            aria-label="Toggle mobile menu"
            className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-gray-800 dark:text-[#F5F0E6] hover:bg-gray-50 dark:hover:bg-[#1F1F1F] transition-colors"
          >
            {isMobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Accordion Sidebar (Drawer) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[150]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 end-0 w-84 max-w-[85vw] bg-white dark:bg-[#121212] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-s border-gray-200 dark:border-[#262626] animate-in slide-in-from-end duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-[#222222]">
                <span className="font-serif italic text-xl font-bold text-gray-900 dark:text-white">
                  Kanto PDF
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick direct links */}
              <div className="space-y-1 mb-4">
                <button
                  onClick={() => handleSelectTool('merge-pdf')}
                  className="w-full text-start p-2.5 rounded-xl font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F1F] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Layers size={16} />
                    {isAr ? 'دمج PDF' : 'Merge PDF'}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleSelectTool('split-pdf')}
                  className="w-full text-start p-2.5 rounded-xl font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F1F] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Scissors size={16} />
                    {isAr ? 'تقسيم PDF' : 'Split PDF'}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleSelectTool('compress-pdf')}
                  className="w-full text-start p-2.5 rounded-xl font-bold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F1F1F] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Minimize2 size={16} />
                    {isAr ? 'ضغط PDF' : 'Compress PDF'}
                  </span>
                  <ArrowRight size={14} className="text-gray-400" />
                </button>
              </div>

              {/* Accordion: Convert PDF */}
              <div className="border-t border-gray-100 dark:border-[#222222] py-2">
                <button
                  onClick={() => setMobileAccordion(prev => (prev === 'convert' ? null : 'convert'))}
                  className="w-full flex items-center justify-between py-2 text-sm font-extrabold text-gray-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <RefreshCw size={16} />
                    {isAr ? 'تحويل PDF' : 'Convert PDF'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileAccordion === 'convert' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileAccordion === 'convert' && (
                  <div className="ps-2 pt-2 space-y-1">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider py-1">
                      {isAr ? 'تحويل إلى PDF' : 'Convert to PDF'}
                    </div>
                    {convertToPdfIds.map(renderToolItem)}

                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider pt-3 pb-1">
                      {isAr ? 'تحويل من PDF' : 'Convert from PDF'}
                    </div>
                    {convertFromPdfIds.map(renderToolItem)}
                  </div>
                )}
              </div>

              {/* Accordion: All PDF Tools */}
              <div className="border-t border-gray-100 dark:border-[#222222] py-2">
                <button
                  onClick={() => setMobileAccordion(prev => (prev === 'all' ? null : 'all'))}
                  className="w-full flex items-center justify-between py-2 text-sm font-extrabold text-gray-900 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Grid size={16} />
                    {isAr ? 'جميع أدوات PDF' : 'All PDF Tools'}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      mobileAccordion === 'all' ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileAccordion === 'all' && (
                  <div className="ps-2 pt-2 space-y-3">
                    {allToolsColumns.map((col, idx) => (
                      <div key={idx}>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider pb-1">
                          {isAr ? col.titleAr : col.titleEn}
                        </div>
                        <div className="space-y-0.5">
                          {col.toolIds.map(renderToolItem)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="pt-6 border-t border-gray-100 dark:border-[#222222]">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] font-bold text-xs text-gray-800 dark:text-[#F5F0E6]"
              >
                <span className="flex items-center gap-2">
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{isDarkMode ? (isAr ? 'الوضع النهاري' : 'Daylight Mode') : (isAr ? 'الوضع الداكن' : 'Dark Mode')}</span>
                </span>
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
