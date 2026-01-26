import { useState, useEffect } from 'react';

export type PartnerTheme = 'light' | 'dark';

export function usePartnerTheme() {
  const [theme, setTheme] = useState<PartnerTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partner-theme') as PartnerTheme;
      return saved || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('partner-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  // Theme-aware classes
  const themeClasses = {
    // Page background
    pageBg: isDark ? 'bg-slate-900' : 'bg-slate-100',
    
    // Card styles
    card: isDark 
      ? 'bg-slate-800 border-slate-700 text-white' 
      : 'bg-white border-slate-200 text-slate-900 shadow-lg',
    cardHover: isDark 
      ? 'hover:border-emerald-500/50' 
      : 'hover:border-emerald-500/50 hover:shadow-xl',
    
    // Text colors
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-300' : 'text-slate-600',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    
    // Backgrounds
    bgMuted: isDark ? 'bg-slate-800/50' : 'bg-slate-50',
    bgInput: isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-slate-200',
    
    // Sidebar
    sidebar: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
    sidebarItem: isDark 
      ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    sidebarActive: isDark 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : 'bg-emerald-100 text-emerald-700',
    
    // Header
    header: isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/80 border-slate-200',
    
    // Chart area
    chartBg: isDark ? 'bg-slate-800' : 'bg-white',
    chartGrid: isDark ? '#374151' : '#e2e8f0',
    chartText: isDark ? '#94a3b8' : '#64748b',
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    themeClasses,
  };
}
