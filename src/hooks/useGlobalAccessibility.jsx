import { useEffect, useRef } from 'react';

/**
 * Global Accessibility System
 * Provides centralized keyboard accessibility across the entire application
 * without requiring individual component modifications
 */

// Global state management
const accessibilityState = {
  focusHistory: [],
  modalStack: [],
  activeDropdown: null,
  trapRef: null
};

/**
 * Trap focus within a specific element (for modals, dropdowns)
 * Called automatically when a modal or dropdown opens
 */
export function trapFocus(container) {
  if (!container) return;

  // Store previous focused element
  const previousActiveElement = document.activeElement;
  accessibilityState.focusHistory.push(previousActiveElement);

  // Get all focusable elements
  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const focusableElements = Array.from(container.querySelectorAll(focusableSelector)).filter(
    el => el.offsetParent !== null || el.getClientRects().length > 0
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  // Focus first element after a small delay
  setTimeout(() => firstElement.focus(), 50);

  // Handle tab key to keep focus within container
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  accessibilityState.trapRef = { container, handleKeyDown };
}

/**
 * Release focus trap and restore previous focus
 * Called automatically when a modal or dropdown closes
 */
export function releaseFocus() {
  if (accessibilityState.trapRef) {
    const { container, handleKeyDown } = accessibilityState.trapRef;
    container.removeEventListener('keydown', handleKeyDown);
    accessibilityState.trapRef = null;
  }

  // Restore previous focus
  const previousElement = accessibilityState.focusHistory.pop();
  if (previousElement && document.body.contains(previousElement)) {
    setTimeout(() => previousElement.focus(), 50);
  }
}

/**
 * React hook for global accessibility features
 * Installs event listeners for keyboard navigation, focus management, etc.
 */
export function useGlobalAccessibility() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Prevent body scroll when modal is open
    const preventBodyScroll = () => {
      if (accessibilityState.modalStack.length > 0) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };

    // Handle Escape key globally
    const handleEscapeKey = (e) => {
      if (e.key !== 'Escape') return;

      // Close active dropdown first
      if (accessibilityState.activeDropdown) {
        const dropdown = accessibilityState.activeDropdown;
        if (typeof dropdown.onClose === 'function') {
          dropdown.onClose();
        }
        accessibilityState.activeDropdown = null;
        return;
      }

      // Close topmost modal
      if (accessibilityState.modalStack.length > 0) {
        const modal = accessibilityState.modalStack[accessibilityState.modalStack.length - 1];
        if (typeof modal.onClose === 'function') {
          modal.onClose();
        }
        accessibilityState.modalStack.pop();
        preventBodyScroll();
        releaseFocus();
      }
    };

    // Handle Enter key for focused elements
    const handleEnterKey = (e) => {
      if (e.key !== 'Enter') return;
      if (e.target.tagName !== 'BUTTON' && !e.target.closest('[role="button"]')) return;

      // Trigger click on Enter for buttons and button-like elements
      e.target.click();
    };

    // Handle arrow keys for list/grid navigation
    const handleArrowKeys = (e) => {
      const key = e.key;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;

      // Check if target is in a list or grid
      const parent = e.target.closest('[role="listbox"], [role="grid"], [role="menu"]');
      if (!parent) return;

      const items = Array.from(parent.querySelectorAll('[role="option"], [role="gridcell"], [role="menuitem"]'));
      if (items.length === 0) return;

      const currentIndex = items.indexOf(e.target);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      const isVertical = key === 'ArrowUp' || key === 'ArrowDown';
      const isHorizontal = key === 'ArrowLeft' || key === 'ArrowRight';

      if (isVertical) {
        if (key === 'ArrowUp') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
      } else if (isHorizontal) {
        if (key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        } else {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        }
      }

      e.preventDefault();
      items[nextIndex].focus();
      if (typeof items[nextIndex].click === 'function') {
        items[nextIndex].click();
      }
    };

    // Make sure all buttons are focusable and have appropriate ARIA
    const enhanceButtons = () => {
      document.querySelectorAll('button:not([aria-label]), [role="button"]:not([aria-label])').forEach(btn => {
        const text = btn.textContent?.trim();
        if (text && !btn.hasAttribute('aria-label')) {
          btn.setAttribute('aria-label', text);
        }
        if (!btn.hasAttribute('tabindex')) {
          btn.setAttribute('tabindex', '0');
        }
      });
    };

    // Add event listeners
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleEnterKey);
    document.addEventListener('keydown', handleArrowKeys);

    // Run initial enhancement
    enhanceButtons();
    // Enhance buttons periodically (for dynamically added content)
    const enhanceInterval = setInterval(enhanceButtons, 2000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('keydown', handleEnterKey);
      document.removeEventListener('keydown', handleArrowKeys);
      clearInterval(enhanceInterval);
      document.body.style.overflow = '';
    };
  }, []);
}

/**
 * Hook for modals to register with the global accessibility system
 */
export function useModalAccessibility(isOpen, onClose, ariaLabel) {
  useEffect(() => {
    if (isOpen) {
      // Find modal content
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        accessibilityState.modalStack.push({ onClose, modal });
        trapFocus(modal);

        // Set ARIA attributes if not already set
        if (ariaLabel && !modal.hasAttribute('aria-label')) {
          modal.setAttribute('aria-label', ariaLabel);
        }
        if (!modal.hasAttribute('aria-modal')) {
          modal.setAttribute('aria-modal', 'true');
        }
      }
    } else {
      releaseFocus();
      const index = accessibilityState.modalStack.findIndex(m => m.onClose === onClose);
      if (index > -1) {
        accessibilityState.modalStack.splice(index, 1);
      }
    }

    // Prevent body scroll
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose, ariaLabel]);
}

/**
 * Hook for dropdowns to register with the global accessibility system
 */
export function useDropdownAccessibility(isOpen, onClose) {
  useEffect(() => {
    if (isOpen) {
      accessibilityState.activeDropdown = { onClose };

      // Focus first menu item
      const firstItem = document.querySelector('[role="menuitem"], [role="option"]');
      if (firstItem) {
        setTimeout(() => firstItem.focus(), 50);
      }
    } else {
      accessibilityState.activeDropdown = null;
    }
  }, [isOpen, onClose]);
}

/**
 * HOC to wrap components with accessibility features
 * Automatically adds ARIA attributes and keyboard handlers
 */
export function withAccessibility(Component, options = {}) {
  const {
    role,
    ariaLabel,
    ariaDescribedBy,
    isInteractive = true
  } = options;

  return function AccessibleComponent(props) {
    const enhancedProps = { ...props };

    if (isInteractive) {
      enhancedProps.tabIndex = enhancedProps.tabIndex ?? 0;
      enhancedProps.role = enhancedProps.role ?? role ?? 'button';

      if (ariaLabel && !enhancedProps['aria-label']) {
        enhancedProps['aria-label'] = ariaLabel;
      }
      if (ariaDescribedBy && !enhancedProps['aria-describedby']) {
        enhancedProps['aria-describedby'] = ariaDescribedBy;
      }

      // Add keyboard handler
      const originalKeyDown = enhancedProps.onKeyDown;
      enhancedProps.onKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (typeof enhancedProps.onClick === 'function') {
            e.preventDefault();
            enhancedProps.onClick(e);
            return;
          }
        }
        if (originalKeyDown) {
          originalKeyDown(e);
        }
      };
    }

    return <Component {...enhancedProps} />;
  };
}

/**
 * Utility to add ARIA attributes to existing elements dynamically
 */
export function addAriaAttributes(selector, attributes) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    Object.entries(attributes).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  });
}

/**
 * Initialize skip-to-content link
 */
export function initSkipToContent() {
  // Check if skip link already exists
  if (document.querySelector('.skip-to-content')) return;

  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-to-content';
  skipLink.textContent = 'Skip to main content';

  // Add styles if not already in CSS
  if (!document.querySelector('#skip-to-content-styles')) {
    const style = document.createElement('style');
    style.id = 'skip-to-content-styles';
    style.textContent = `
      .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: #6366f1;
        color: white;
        padding: 8px 16px;
        z-index: 99999;
        transition: top 0.2s;
        text-decoration: none;
        font-weight: bold;
      }
      .skip-to-content:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Export state for debugging
 */
export function getAccessibilityState() {
  return { ...accessibilityState };
}
