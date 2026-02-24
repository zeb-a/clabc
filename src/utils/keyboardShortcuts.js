/**
 * Keyboard Shortcuts Utility for Klasiz.fun
 * Provides convenient keyboard shortcuts without affecting existing functionality
 */

const shortcuts = new Map();

/**
 * Register a keyboard shortcut
 * @param {string} key - Key combination (e.g., 'Ctrl+K', 'Cmd+K', 'Escape')
 * @param {Function} callback - Function to call when shortcut is triggered
 * @param {Object} options - Options for the shortcut
 */
export function registerShortcut(key, callback, options = {}) {
  const {
    description = '',
    preventDefault = true,
    scope = 'global' // 'global', 'input', 'modal'
  } = options;

  shortcuts.set(key, {
    callback,
    description,
    preventDefault,
    scope
  });
}

/**
 * Unregister a keyboard shortcut
 * @param {string} key - Key combination to unregister
 */
export function unregisterShortcut(key) {
  shortcuts.delete(key);
}

/**
 * Get all registered shortcuts
 * @param {string} scope - Optional scope to filter by
 * @returns {Array} Array of shortcuts
 */
export function getShortcuts(scope = null) {
  const allShortcuts = Array.from(shortcuts.entries()).map(([key, value]) => ({
    key,
    ...value
  }));

  if (scope) {
    return allShortcuts.filter(s => s.scope === scope || s.scope === 'global');
  }

  return allShortcuts;
}

/**
 * Check if a key event matches a shortcut
 * @param {KeyboardEvent} event - Keyboard event
 * @param {string} shortcut - Shortcut pattern (e.g., 'Ctrl+K')
 * @returns {boolean} Whether the event matches the shortcut
 */
function matchesShortcut(event, shortcut) {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts.pop();
  const modifiers = parts;

  // Check modifiers
  if (modifiers.includes('ctrl') && !event.ctrlKey) return false;
  if (modifiers.includes('cmd') && !event.metaKey) return false;
  if (modifiers.includes('shift') && !event.shiftKey) return false;
  if (modifiers.includes('alt') && !event.altKey) return false;

  // Check if modifier keys are not pressed when they shouldn't be
  if (!modifiers.includes('ctrl') && event.ctrlKey) return false;
  if (!modifiers.includes('cmd') && event.metaKey) return false;
  if (!modifiers.includes('shift') && event.shiftKey) return false;
  if (!modifiers.includes('alt') && event.altKey) return false;

  // Check main key
  return event.key.toLowerCase() === key.toLowerCase();
}

/**
 * Handle keyboard event
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeydown(event) {
  // Check if we're in an input/textarea
  const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) ||
                    event.target.isContentEditable;

  for (const [key, shortcut] of shortcuts.entries()) {
    // Skip if scope doesn't match
    if (shortcut.scope === 'input' && !isInInput) continue;
    if (shortcut.scope === 'modal' && !isInModal()) continue;
    if (shortcut.scope === 'non-input' && isInInput) continue;

    if (matchesShortcut(event, key)) {
      if (shortcut.preventDefault) {
        event.preventDefault();
      }
      shortcut.callback(event);
      break; // Only trigger the first matching shortcut
    }
  }
}

/**
 * Check if currently in a modal
 * @returns {boolean} Whether we're in a modal
 */
function isModalOpen() {
  return !!document.querySelector('[role="dialog"], .modal, [style*="z-index"][style*="10000"]');
}

function isInModal() {
  return document.activeElement?.closest('[role="dialog"], .modal, [style*="z-index"][style*="10000"]');
}

// Initialize keyboard shortcuts
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', handleKeydown);
}

// Common shortcuts for Klasiz.fun
export const CommonShortcuts = {
  SEARCH: 'Ctrl+K',
  NEW_CLASS: 'Ctrl+N',
  NEW_ASSIGNMENT: 'Ctrl+Shift+A',
  SAVE: 'Ctrl+S',
  ESCAPE: 'Escape',
  HELP: 'F1',
  REFRESH: 'F5',
  FULLSCREEN: 'F11'
};

// Register default shortcuts
registerShortcut('Escape', () => {
  // Close modals or open dropdowns
  const activeModal = document.querySelector('[role="dialog"], .modal');
  if (activeModal) {
    // Find and click close button
    const closeBtn = activeModal.querySelector('button[aria-label*="close"], button[aria-label*="Close"], .close-btn');
    if (closeBtn) {
      closeBtn.click();
    }
  }
}, {
  description: 'Close modal or cancel action',
  preventDefault: true
});

registerShortcut('Ctrl+K', (event) => {
  // Open search (if search component exists)
  const searchInput = document.querySelector('input[placeholder*="search"], input[placeholder*="Search"]');
  if (searchInput) {
    searchInput.focus();
  }
}, {
  description: 'Focus search',
  preventDefault: true
});

registerShortcut('Ctrl+Slash', (event) => {
  // Show keyboard shortcuts help
  console.log('Keyboard Shortcuts:', getShortcuts().map(s => `${s.key}: ${s.description}`).join('\n'));
}, {
  description: 'Show keyboard shortcuts',
  preventDefault: true
});

export default {
  registerShortcut,
  unregisterShortcut,
  getShortcuts,
  CommonShortcuts
};
