import { useEffect, useCallback } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Map of keys to handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 * @param {Array} dependencies - Dependencies array
 */
export function useKeyboardShortcuts(shortcuts = {}, enabled = true, dependencies = []) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target;
      const isInputField = target.tagName === 'INPUT' ||
                         target.tagName === 'TEXTAREA' ||
                         target.isContentEditable;

      // Allow Enter in input fields, but still process other shortcuts
      if (isInputField && e.key !== 'Enter' && e.key !== 'Escape') {
        return;
      }

      const key = e.key.toLowerCase();
      const handler = shortcuts[key];

      if (handler) {
        e.preventDefault();
        e.stopPropagation();
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, ...dependencies]);
}

/**
 * Custom hook for modal keyboard shortcuts (Enter to confirm, Escape to cancel)
 * @param {Function} onConfirm - Handler for Enter key (optional)
 * @param {Function} onCancel - Handler for Escape key
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export function useModalKeyboard(onConfirm = null, onCancel = null, enabled = true) {
  const shortcuts = {
    escape: onCancel,
    enter: onConfirm,
  };

  useKeyboardShortcuts(shortcuts, enabled, [onConfirm, onCancel]);
}
