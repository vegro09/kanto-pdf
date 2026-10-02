import { ToolCategory } from '../types/tools';

export interface CategoryAccentConfig {
  chipBg: string;
  chipText: string;
  borderColor: string;
  darkChipBg: string;
  darkChipText: string;
  badgeBg: string;
  badgeText: string;
  nameEn: string;
  nameAr: string;
}

export const CATEGORY_ACCENTS: Record<ToolCategory | string, CategoryAccentConfig> = {
  'organize': {
    chipBg: '#EFE8DC',
    chipText: '#0D0D0D',
    borderColor: '#DFD5C4',
    darkChipBg: '#28231C',
    darkChipText: '#F5F0E6',
    badgeBg: '#EFE8DC',
    badgeText: '#0D0D0D',
    nameEn: 'Organize & Edit',
    nameAr: 'تنظيم وتعديل'
  },
  'convert-to': {
    chipBg: '#E2E5E9',
    chipText: '#0D0D0D',
    borderColor: '#C7C9CC',
    darkChipBg: '#1E2328',
    darkChipText: '#F5F0E6',
    badgeBg: '#E2E5E9',
    badgeText: '#0D0D0D',
    nameEn: 'Convert to PDF',
    nameAr: 'تحويل إلى PDF'
  },
  'convert-from': {
    chipBg: '#D3D8DE',
    chipText: '#0D0D0D',
    borderColor: '#B6BCC4',
    darkChipBg: '#252B33',
    darkChipText: '#F5F0E6',
    badgeBg: '#D3D8DE',
    badgeText: '#0D0D0D',
    nameEn: 'Convert from PDF',
    nameAr: 'تحويل من PDF'
  },
  'security': {
    chipBg: '#0D0D0D',
    chipText: '#FFFFFF',
    borderColor: '#0D0D0D',
    darkChipBg: '#FFFFFF',
    darkChipText: '#0D0D0D',
    badgeBg: '#0D0D0D',
    badgeText: '#FFFFFF',
    nameEn: 'Security & Signature',
    nameAr: 'الأمان والتوقيع'
  },
  'all': {
    chipBg: '#EFE8DC',
    chipText: '#0D0D0D',
    borderColor: '#C7C9CC',
    darkChipBg: '#28231C',
    darkChipText: '#F5F0E6',
    badgeBg: '#EFE8DC',
    badgeText: '#0D0D0D',
    nameEn: 'All Tools',
    nameAr: 'كافة الأدوات'
  }
};

export function getCategoryAccent(category: ToolCategory | string): CategoryAccentConfig {
  return CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS['all'];
}
