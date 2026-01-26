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

  // Theme-aware classes - FIXED: White text on dark backgrounds, proper contrast
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
    
    // Text colors - CRITICAL: High contrast for dark mode
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-200' : 'text-slate-600', // Was text-slate-300, now brighter
    textMuted: isDark ? 'text-slate-300' : 'text-slate-500', // Was text-slate-400, now brighter
    textLabel: isDark ? 'text-white/90' : 'text-slate-700', // New: for labels
    
    // Backgrounds
    bgMuted: isDark ? 'bg-slate-800/50' : 'bg-slate-50',
    bgInput: isDark ? 'bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200',
    
    // Sidebar
    sidebar: isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
    sidebarItem: isDark 
      ? 'text-slate-200 hover:bg-slate-800 hover:text-white' // Was text-slate-300
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    sidebarActive: isDark 
      ? 'bg-emerald-500/20 text-emerald-400' 
      : 'bg-emerald-100 text-emerald-700',
    
    // Header
    header: isDark ? 'bg-slate-800/80 border-slate-700 backdrop-blur-xl' : 'bg-white/80 border-slate-200 backdrop-blur-xl',
    
    // Chart area
    chartBg: isDark ? 'bg-slate-800' : 'bg-white',
    chartGrid: isDark ? '#475569' : '#e2e8f0', // Brighter grid for dark
    chartText: isDark ? '#e2e8f0' : '#64748b', // Brighter text for dark

    // Section titles (for blue/gradient backgrounds)
    sectionTitle: isDark ? 'text-white' : 'text-slate-900',
    sectionSubtitle: isDark ? 'text-white/80' : 'text-slate-600',
    
    // Card content text
    cardTitle: isDark ? 'text-white' : 'text-slate-900',
    cardDescription: isDark ? 'text-slate-200' : 'text-slate-600', // Was text-slate-400
    cardValue: isDark ? 'text-white' : 'text-slate-900',
    cardLabel: isDark ? 'text-slate-200' : 'text-slate-500', // Was text-slate-400
    
    // Badge variants
    badgeDefault: isDark ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200',
    
    // Dividers and borders
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    divider: isDark ? 'bg-slate-700' : 'bg-slate-200',
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    themeClasses,
  };
}
