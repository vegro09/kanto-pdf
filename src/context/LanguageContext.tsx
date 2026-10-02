import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Translations } from '../i18n/translations';

export type SupportedLanguage = 'en' | 'ar';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isRtl?: boolean;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', isRtl: false },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
];

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  isRtl: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations | string) => string;
  dictionary: Translations;
  languageOptions: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): SupportedLanguage => {
    // 1. Check URL path
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts[0] && (parts[0] === 'ar' || parts[0] === 'en')) {
      return parts[0] as SupportedLanguage;
    }
    // 2. Check localStorage
    try {
      const saved = localStorage.getItem('kanto_language');
      if (saved === 'ar' || saved === 'en') {
        return saved as SupportedLanguage;
      }
    } catch {
      // localStorage may be disabled
    }
    // 3. Check browser language
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('ar')) return 'ar';
    return 'en';
  };

  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(getInitialLanguage);
  const isRtl = currentLanguage === 'ar';

  const applyDirectionAndLang = useCallback((lang: SupportedLanguage) => {
    const isLangRtl = lang === 'ar';
    document.documentElement.dir = isLangRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('kanto_language', lang);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    applyDirectionAndLang(currentLanguage);
  }, [currentLanguage, applyDirectionAndLang]);

  const setLanguage = useCallback(
    (newLang: SupportedLanguage) => {
      setCurrentLanguageState(newLang);
      applyDirectionAndLang(newLang);
    },
    [applyDirectionAndLang]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(currentLanguage === 'en' ? 'ar' : 'en');
  }, [currentLanguage, setLanguage]);

  const t = useCallback(
    (key: keyof Translations | string): string => {
      const dict = (translations[currentLanguage] || translations['en']) as unknown as Record<string, string>;
      if (dict && dict[key]) {
        return dict[key];
      }
      const fallback = (translations['en'] as unknown as Record<string, string>)[key];
      return fallback || String(key);
    },
    [currentLanguage]
  );

  const dictionary = translations[currentLanguage] || translations['en'];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        isRtl,
        setLanguage,
        toggleLanguage,
        t,
        dictionary,
        languageOptions: LANGUAGE_OPTIONS,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
