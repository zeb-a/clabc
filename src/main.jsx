import React, { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n'
import './global-polyfill';

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
      <GlobalKeyHandler>
        <App />
      </GlobalKeyHandler>
    </LanguageProvider>
  </StrictMode>,
)
