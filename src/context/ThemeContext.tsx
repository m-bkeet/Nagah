import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Moon, Sun } from 'lucide-react';

export interface ThemeConfig {
  id: string;
  name: string;
  nameEn: string;
  category: 'dark' | 'light';
  description: string;
  isDefault?: boolean;
  isDark: boolean;
  colors: {
    bgMain: string;
    bgMainGradientStart: string;
    bgMainGradientMid: string;
    bgMainGradientEnd: string;
    bgHeader: string;
    bgSidebar: string;
    bgCard: string;
    bgCardHover: string;
    border: string;
    borderHover: string;
    accent: string;
    accentHover: string;
    accentLight: string;
    accentText: string;
    accentGlow: string;
    secondaryAccent: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    goldTone: string;
    glowShadow: string;
  };
  previewColors: [string, string, string, string];
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'dark_mode',
    name: 'الوضع الملكي الليلي',
    nameEn: 'Royal Dark Mode',
    category: 'dark',
    description: 'وضع ليلي ملكي مريح للعين يجمع بين درجات الفخامة الداكنة، والبنفسجي الملكي، والتذهيب الفاخر مع تباين عالي الجودة.',
    isDefault: true,
    isDark: true,
    colors: {
      bgMain: '#080a14',
      bgMainGradientStart: '#0c0f1f',
      bgMainGradientMid: '#121026',
      bgMainGradientEnd: '#080a14',
      bgHeader: 'rgba(15, 17, 34, 0.95)',
      bgSidebar: 'rgba(15, 17, 34, 0.98)',
      bgCard: 'rgba(20, 22, 44, 0.85)',
      bgCardHover: 'rgba(36, 32, 68, 0.9)',
      border: 'rgba(124, 58, 237, 0.35)',
      borderHover: 'rgba(245, 158, 11, 0.7)',
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      accentLight: 'rgba(124, 58, 237, 0.2)',
      accentText: '#c084fc',
      accentGlow: 'rgba(124, 58, 237, 0.45)',
      secondaryAccent: '#fbbf24',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      goldTone: '#fbbf24',
      glowShadow: '0 0 25px rgba(124, 58, 237, 0.3)'
    },
    previewColors: ['#080a14', '#121026', '#7c3aed', '#fbbf24']
  },
  {
    id: 'night_charcoal_gold',
    name: 'الفحم الملكي والتذهيب',
    nameEn: 'Charcoal & Gold Night',
    category: 'dark',
    description: 'خلفية فحمية داكنة مع لمسات ذهب عتيق ونصوص ساطعة عالية القراءة.',
    isDefault: false,
    isDark: true,
    colors: {
      bgMain: '#0f1117',
      bgMainGradientStart: '#141722',
      bgMainGradientMid: '#181c28',
      bgMainGradientEnd: '#0f1117',
      bgHeader: 'rgba(18, 21, 32, 0.95)',
      bgSidebar: 'rgba(15, 17, 26, 0.98)',
      bgCard: 'rgba(24, 28, 42, 0.9)',
      bgCardHover: 'rgba(32, 38, 56, 0.95)',
      border: 'rgba(217, 119, 6, 0.3)',
      borderHover: 'rgba(245, 158, 11, 0.7)',
      accent: '#d97706',
      accentHover: '#b45309',
      accentLight: 'rgba(217, 119, 6, 0.2)',
      accentText: '#fbbf24',
      accentGlow: 'rgba(245, 158, 11, 0.4)',
      secondaryAccent: '#38bdf8',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      goldTone: '#f59e0b',
      glowShadow: '0 0 25px rgba(245, 158, 11, 0.25)'
    },
    previewColors: ['#0f1117', '#181c28', '#d97706', '#fbbf24']
  },
  {
    id: 'light_mode',
    name: 'الوضع الملكي النهاري',
    nameEn: 'Royal Light Mode',
    category: 'light',
    description: 'تصميم ملكي رفيع بنقاء الحرير الأبيض واللمسات البنفسجية والذهبية المشرقة، بألوان مشبعة وحيوية وخلفيات خالية تماماً من الكتمة والقتامة.',
    isDefault: false,
    isDark: false,
    colors: {
      bgMain: '#faf7ff',
      bgMainGradientStart: '#ffffff',
      bgMainGradientMid: '#f5f0ff',
      bgMainGradientEnd: '#fffaf0',
      bgHeader: 'rgba(255, 255, 255, 0.98)',
      bgSidebar: 'rgba(252, 250, 255, 0.98)',
      bgCard: '#ffffff',
      bgCardHover: '#faf5ff',
      border: 'rgba(167, 139, 250, 0.4)',
      borderHover: 'rgba(124, 58, 237, 0.7)',
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      accentLight: 'rgba(124, 58, 237, 0.12)',
      accentText: '#6d28d9',
      accentGlow: 'rgba(124, 58, 237, 0.25)',
      secondaryAccent: '#d97706',
      textPrimary: '#1e1b4b',
      textSecondary: '#334155',
      textMuted: '#64748b',
      goldTone: '#d97706',
      glowShadow: '0 4px 20px rgba(124, 58, 237, 0.08)'
    },
    previewColors: ['#ffffff', '#faf7ff', '#7c3aed', '#d97706']
  },
  {
    id: 'day_rose_gold',
    name: 'الوردي والذهب الفاخر',
    nameEn: 'Rose Gold Luxury Day',
    category: 'light',
    description: 'لوحة نهارية راقية بدرجات الورد الناعم والذهب الشامبانيا مع نصوص واضحة وعميقة.',
    isDefault: false,
    isDark: false,
    colors: {
      bgMain: '#fdf8f6',
      bgMainGradientStart: '#ffffff',
      bgMainGradientMid: '#fff1f2',
      bgMainGradientEnd: '#fef3c7',
      bgHeader: 'rgba(255, 255, 255, 0.98)',
      bgSidebar: 'rgba(255, 248, 248, 0.98)',
      bgCard: '#ffffff',
      bgCardHover: '#fff1f2',
      border: 'rgba(244, 63, 94, 0.25)',
      borderHover: 'rgba(225, 29, 72, 0.6)',
      accent: '#e11d48',
      accentHover: '#be123c',
      accentLight: 'rgba(225, 29, 72, 0.1)',
      accentText: '#be123c',
      accentGlow: 'rgba(244, 63, 94, 0.2)',
      secondaryAccent: '#d97706',
      textPrimary: '#1c1917',
      textSecondary: '#44403c',
      textMuted: '#78716c',
      goldTone: '#d97706',
      glowShadow: '0 4px 20px rgba(225, 29, 72, 0.08)'
    },
    previewColors: ['#ffffff', '#fff1f2', '#e11d48', '#d97706']
  },
  {
    id: 'day_ivory_champagne',
    name: 'العاج والشمبانيا الذهبي',
    nameEn: 'Ivory & Champagne Day',
    category: 'light',
    description: 'تدرجات العاج الملكي والشمبانيا مع إطارات ذهبية ونصوص عالية التباين.',
    isDefault: false,
    isDark: false,
    colors: {
      bgMain: '#faf8f2',
      bgMainGradientStart: '#ffffff',
      bgMainGradientMid: '#fefce8',
      bgMainGradientEnd: '#fffbeb',
      bgHeader: 'rgba(255, 255, 255, 0.98)',
      bgSidebar: 'rgba(254, 252, 246, 0.98)',
      bgCard: '#ffffff',
      bgCardHover: '#fefce8',
      border: 'rgba(217, 119, 6, 0.25)',
      borderHover: 'rgba(180, 83, 9, 0.6)',
      accent: '#b45309',
      accentHover: '#92400e',
      accentLight: 'rgba(217, 119, 6, 0.1)',
      accentText: '#92400e',
      accentGlow: 'rgba(217, 119, 6, 0.2)',
      secondaryAccent: '#0284c7',
      textPrimary: '#1c1917',
      textSecondary: '#44403c',
      textMuted: '#78716c',
      goldTone: '#b45309',
      glowShadow: '0 4px 20px rgba(217, 119, 6, 0.08)'
    },
    previewColors: ['#ffffff', '#fefce8', '#b45309', '#0284c7']
  }
];

interface ThemeContextType {
  themeConfig: ThemeConfig;
  currentThemeId: string;
  setThemeId: (id: string) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem('nagah_theme_id') || 'dark_mode';
  });

  const themeConfig = useMemo(() => {
    return AVAILABLE_THEMES.find(t => t.id === currentThemeId) || AVAILABLE_THEMES[0];
  }, [currentThemeId]);

  const setThemeId = useCallback((id: string) => {
    setCurrentThemeId(id);
    localStorage.setItem('nagah_theme_id', id);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const nextId = currentThemeId === 'dark_mode' ? 'light_mode' : 'dark_mode';
    setThemeId(nextId);
  }, [currentThemeId, setThemeId]);

  // Apply theme attributes and variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    root.setAttribute('data-theme', themeConfig.id);
    root.setAttribute('data-color-mode', themeConfig.isDark ? 'dark' : 'light');
    
    if (themeConfig.isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    }
  }, [themeConfig]);

  const value = useMemo(() => ({
    themeConfig,
    currentThemeId,
    setThemeId,
    toggleDarkMode
  }), [themeConfig, currentThemeId, setThemeId, toggleDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
