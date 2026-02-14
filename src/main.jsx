import React, { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './glassmorphism.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n'
import ThemeProvider, { useTheme } from './ThemeContext'
import './global-polyfill';

// Apply dark mode immediately before React renders
if (typeof window !== 'undefined') {
  const applyTheme = () => {
    // Check user preference first, then fall back to system preference
    const userPreference = localStorage.getItem('theme-preference');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = userPreference ? userPreference === 'dark' : systemPrefersDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Force override inline styles with dark mode
    if (isDark) {
      const style = document.getElementById('dark-mode-override') || document.createElement('style');
      style.id = 'dark-mode-override';
      style.textContent = `
        /* CRITICAL: EXCLUDE PointAnimation using data attributes - HIGHEST PRIORITY */
        [data-point-animation="true"] {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
          color: white !important;
          border-color: #FFA500 !important;
        }

        [data-point-animation-backdrop="true"] {
          background: rgba(0,0,0,0.5) !important;
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
      if (!document.getElementById('dark-mode-override')) {
        document.head.appendChild(style);
      }
    } else {
      const style = document.getElementById('dark-mode-override');
      if (style) style.remove();
    }

  };
  applyTheme();

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    applyTheme();

  });
}

function GlobalGlassEffect({ children }) {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const target = e.target.closest('button, .card');
      if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    const handlePointerDown = (e) => {
      const target = e.target.closest('button, .card');
      if (target) {
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty('--mouse-x', `${x}px`);
        target.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return children;
}

function GlobalKeyHandler({ children }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      // Only handle plain Enter (no modifier keys)
      if (e.key !== 'Enter' || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
      const active = document.activeElement;
      if (!active) return;
      const tag = (active.tagName || '').toLowerCase();
      // Ignore multi-line text areas
      if (tag === 'textarea') return;
      if (active.isContentEditable) return;

      // Prefer a button marked inside the same dialog (role="dialog")
      let container = active.closest && active.closest('[role="dialog"]');
      let submitBtn = null;
      try {
        if (container) submitBtn = container.querySelector('[data-enter-submit]:not([disabled])');
        if (!submitBtn) submitBtn = document.querySelector('[data-enter-submit]:not([disabled])');
      } catch (err) {
        // ignore any DOM errors
      }
      if (submitBtn) {
        e.preventDefault();
        submitBtn.click();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <GlobalGlassEffect>
          <GlobalKeyHandler>
            <App />
          </GlobalKeyHandler>
        </GlobalGlassEffect>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
