import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => { },
  switchTheme: () => { },
  isDark: false
});

const ThemeProvider = (props) => {
  const children = props.children;
  const [theme, setTheme] = useState(() => {
    // Check user preference first, then fall back to system preference
    const userPreference = localStorage.getItem('theme-preference');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = userPreference || (systemPrefersDark ? 'dark' : 'light');
    console.log('[ThemeContext] Initial theme:', initialTheme);
    return initialTheme;
  });

  // Apply theme whenever it changes
  useEffect(() => {
    console.log('[ThemeContext] Setting data-theme to:', theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    console.log('[ThemeContext] data-theme is now:', root.getAttribute('data-theme'));

    // Apply dark mode styles
    applyDarkModeStyles(theme === 'dark');
  }, [theme]);

  // Listen for system theme changes (only if no user preference set)
  useEffect(() => {
    const hasUserPreference = localStorage.getItem('theme-preference');
    if (hasUserPreference) return; // Don't listen to system if user has set preference

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      console.log('[ThemeContext] System theme changed to:', newTheme);
      setTheme(newTheme);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Listen for data-theme changes (from other components)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      if (currentTheme && currentTheme !== theme) {
        setTheme(currentTheme);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
  };

  const switchTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme, switchTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext) || { theme: 'light', setTheme: () => { }, switchTheme: () => { }, isDark: false };
  return ctx;
}

// Helper function to apply dark mode styles
function applyDarkModeStyles(isDark) {
  const styleElement = document.getElementById('dark-mode-override');

  if (isDark) {
    const style = styleElement || document.createElement('style');
    style.id = 'dark-mode-override';
    style.textContent = `
      /* Smooth transitions for theme changes */
      * {
        transition: background-color 0.4s cubic-bezier(0.1, 0, 0.1, 1) !important,
                    color 0.2s cubic-bezier(0.2, 0, 0.2, 1) !important,
                    border-color 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important,
                    box-shadow 0.3s cubic-bezier(0.2, 0, 0.2, 1) !important;
      }

      /* CRITICAL: EXCLUDE PointAnimation using data attributes - HIGHEST PRIORITY */
      [data-point-animation="true"] {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
        color: white !important;
        border-color: #FFA500 !important;
      }

      [data-point-animation-backdrop="true"] {
        background: rgba(0,0,0,0.5) !important;
        transition: opacity 0.8s cubic-bezier(0.8, 0, 0.2, 1) !important;
      }

      /* All children of PointAnimation preserve original colors */
      [data-point-animation="true"] * {
        color: white !important;
        background: transparent !important;
        border-color: inherit !important;
      }

      /* Apply gentle dark mode to everything EXCEPT PointAnimation and elements that shouldn't have backgrounds */
      *:not([data-point-animation]):not([data-point-animation-backdrop]):not([data-point-animation] *):not(span):not(em):not(strong):not(code):not(mark):not(i):not(b):not(img):not(a):not(input):not(textarea):not(select):not(svg):not(path):not(circle):not(line):not(polyline):not(polygon):not(rect):not(g) {
        background-color: #252525 !important;
        color: #f0f0f0 !important;
        border-color: #4a4a4a !important;
      }

      /* Readable text: force light color so text is visible on dark backgrounds */
      span, em, strong, code, mark, i, b, p, h1, h2, h3, h4, h5, h6, label, td, th, li {
        color: #f0f0f0 !important;
      }

      /* Transparent background for text/inline/emoji/avatars so no black boxes */
      span:not([class*="card"]):not([class*="btn"]):not([class*="button"]):not([style*="background"]):not([style*="Background"]),
      em, strong, code, mark, i, b,
      img, img.emoji, [class*="emoji"], [data-emoji],
      a:not([class*="btn"]):not([class*="button"]):not([role="button"]) {
        background-color: transparent !important;
      }
      /* Avatar/emoji wrappers (div containing only img) — no black background */
      div:has(> img), [class*="avatar"] {
        background-color: transparent !important;
      }

      /* Icons (SVG): no black background — transparent so icon shape is visible; color from parent */
      svg, svg path, svg circle, svg line, svg polyline, svg polygon, svg rect, svg g {
        background-color: transparent !important;
        background: none !important;
      }

      /* Nav/sidebar: ensure text and icons are clearly visible (light on dark) */
      nav, nav * {
        color: #f0f0f0 !important;
      }
      nav [data-active="true"], nav [data-active="true"] * {
        color: #4CAF50 !important;
      }
      nav svg {
        color: inherit !important;
      }

      button, .btn {
        background-color: #252525 !important;
        color: #f0f0f0 !important;
      }

      input, textarea, select {
        background-color: #2e2e2e !important;
        color: #f0f0f0 !important;
      }

      /* Clearer white borders for modals */
      .modal, [role="dialog"], [style*="borderRadius: 24px"], [style*="border-radius: 24px"],
      .animated-modal-content, [style*="zIndex: 10000"], [style*="zIndex: 100001"] {
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
      }
    `;
    if (!styleElement) {
      document.head.appendChild(style);
    }
  } else {
    if (styleElement) {
      styleElement.remove();
    }
  }
}

export default ThemeProvider;
