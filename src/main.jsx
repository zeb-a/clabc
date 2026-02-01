import React, { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './glassmorphism.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n'
import './global-polyfill';

// Apply dark mode immediately before React renders
if (typeof window !== 'undefined') {
  const applyTheme = () => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
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

        /* Apply gentle dark mode to everything EXCEPT PointAnimation */
        *:not([data-point-animation]):not([data-point-animation-backdrop]):not([data-point-animation] *) {
          background-color: #252525 !important;
          color: #e5e5e5 !important;
          border-color: #4a4a4a !important;
        }

        button, .btn {
          background-color: #252525 !important;
          color: #e5e5e5 !important;
        }

        input, textarea, select {
          background-color: #2e2e2e !important;
          color: #e5e5e5 !important;
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

    console.log('[main.jsx] Set data-theme to:', isDark ? 'dark' : 'light');
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
    <LanguageProvider>
      <GlobalGlassEffect>
        <GlobalKeyHandler>
          <App />
        </GlobalKeyHandler>
      </GlobalGlassEffect>
    </LanguageProvider>
  </StrictMode>,
)
