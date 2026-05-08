import { useEffect } from 'react';

/**
 * useSystemTheme - Auto-detect and apply system theme preference
 * Syncs with prefers-color-scheme and applies dark class to html element
 */
export function useSystemTheme() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (isDark) => {
      const html = document.documentElement;
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    };

    // Apply initial theme
    applyTheme(mediaQuery.matches);

    // Listen for theme changes
    const handleChange = (e) => applyTheme(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
}