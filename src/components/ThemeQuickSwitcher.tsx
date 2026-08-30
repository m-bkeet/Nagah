import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeQuickSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { themeConfig, toggleDarkMode } = useTheme();

  return (
    <button
      type="button"
      id="btn-global-theme-switcher"
      onClick={toggleDarkMode}
      className={`group relative w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer shrink-0 border ${
        themeConfig.isDark
          ? 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 hover:border-amber-400/80 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)] hover:shadow-[0_0_14px_rgba(245,158,11,0.25)]'
          : 'bg-white hover:bg-amber-50/90 border-slate-200 hover:border-amber-400/80 text-amber-600 shadow-[0_2px_8px_rgba(245,158,11,0.12)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
      } ${className}`}
      title={themeConfig.isDark ? "التبديل إلى الوضع النهاري (Light Mode)" : "التبديل إلى الوضع الليلي (Dark Mode)"}
      aria-label={themeConfig.isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {themeConfig.isDark ? (
          <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        ) : (
          <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
        )}
      </div>

      {/* Subtle indicator dot */}
      <span
        className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border ${
          themeConfig.isDark
            ? 'bg-amber-400 border-slate-900 shadow-[0_0_6px_#fbbf24]'
            : 'bg-amber-500 border-white shadow-[0_0_6px_#f59e0b]'
        }`}
      />
    </button>
  );
};
