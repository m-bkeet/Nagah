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
