import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Global Animated Modal Wrapper
 * Provides smooth, consistent animations for all modals across the app
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {React.ReactNode} children - Modal content
 * @param {function} onClose - Close handler (optional)
 * @param {object} overlayStyle - Custom overlay styles (optional)
 * @param {object} contentStyle - Custom content styles (optional)
 * @param {string} variant - Animation variant: 'center' | 'slideUp' | 'scale' | 'fade'
 * @param {boolean} closeOnClickOverlay - Close modal when clicking overlay (default: true)
 */
export default function AnimatedModal({
  isOpen,
  children,
  onClose,
  overlayStyle,
  contentStyle,
  variant = 'center',
  closeOnClickOverlay = true,
  zIndex = 5000
}) {
  const handleOverlayClick = (e) => {
    if (closeOnClickOverlay && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // Animation variants for different modal styles
  const variants = {
    center: {
      overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25, ease: 'easeInOut' }
      },
      content: {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 },
        transition: {
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1] // Custom spring-like easing
        }
      }
    },
    slideUp: {
      overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25, ease: 'easeInOut' }
      },
      content: {
        initial: { opacity: 0, y: 100, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 100, scale: 0.95 },
        transition: {
          duration: 0.35,
          ease: [0.32, 0.72, 0, 1]
        }
      }
    },
    scale: {
      overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: 'easeInOut' }
      },
      content: {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
        transition: {
          duration: 0.25,
          ease: 'easeOutBack'
        }
      }
    },
    fade: {
      overlay: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.3, ease: 'easeInOut' }
      },
      content: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          duration: 0.3,
          ease: 'easeInOut'
        }
      }
    }
  };

  const animation = variants[variant];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="animated-modal-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex,
            ...animation.overlay.initial,
            ...overlayStyle
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={animation.overlay}
        >
          <motion.div
            className="animated-modal-content"
            style={{
              ...contentStyle
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animation.content}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export animation variants for use in other components
export const modalVariants = {
  center: 'center',
  slideUp: 'slideUp',
  scale: 'scale',
  fade: 'fade'
};
