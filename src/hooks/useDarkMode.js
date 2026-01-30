import { useState, useEffect } from 'react';

/**
 * Hook to detect and manage dark mode preference
 * Supports both system preference and manual theme switching
 *
 * @returns {boolean} true if dark mode, false otherwise
 */
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // SSR safety: only access window in browser
    if (typeof window === 'undefined') return false;

    // First check localStorage for manual preference
    const stored = localStorage.getItem('classABC_darkMode');
    if (stored !== null) {
      return stored === 'true';
    }

    // Default to light mode
    return false;
  });

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Only update from system if no manual preference is set
    const handler = (e) => {
      const stored = localStorage.getItem('classABC_darkMode');
      if (stored === null) {
        setIsDark(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  return [isDark, (value) => {
    setIsDark(value);
    localStorage.setItem('classABC_darkMode', value.toString());
    // Update document attribute for CSS
    if (typeof document !== 'undefined') {
      if (value) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }];
}

export default useDarkMode;
