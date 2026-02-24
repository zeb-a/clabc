import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="toast-container" style={toastContainerStyles}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>,
    document.body
  );
};

const Toast = ({ toast, removeToast }) => {
  const { id, message, type } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#22c55e" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f59e0b" />;
      default:
        return <Info size={20} color="#3b82f6" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#dcfce7';
      case 'error':
        return '#fee2e2';
      case 'warning':
        return '#fef3c7';
      default:
        return '#dbeafe';
    }
  };

  return (
    <div style={{ ...toastStyles, backgroundColor: getBackgroundColor() }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {getIcon()}
        <span style={{ flex: 1, fontSize: '14px', color: '#1f2937' }}>{message}</span>
      </div>
      <button
        onClick={() => removeToast(id)}
        style={closeButtonStyles}
        aria-label="Close toast"
      >
        <X size={16} color="#6b7280" />
      </button>
    </div>
  );
};

// Inline styles to avoid any design conflicts
const toastContainerStyles = {
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 100000,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  pointerEvents: 'none'
};

const toastStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  minWidth: '300px',
  maxWidth: '400px',
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  pointerEvents: 'auto',
  animation: 'slideIn 0.3s ease-out'
};

const closeButtonStyles = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'background-color 0.2s'
};

// Add keyframes for animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

// Convenience functions
export const toast = {
  success: (message, duration) => {
    if (typeof window !== 'undefined' && window.toastContext) {
      window.toastContext.addToast(message, 'success', duration);
    }
  },
  error: (message, duration) => {
    if (typeof window !== 'undefined' && window.toastContext) {
      window.toastContext.addToast(message, 'error', duration);
    }
  },
  warning: (message, duration) => {
    if (typeof window !== 'undefined' && window.toastContext) {
      window.toastContext.addToast(message, 'warning', duration);
    }
  },
  info: (message, duration) => {
    if (typeof window !== 'undefined' && window.toastContext) {
      window.toastContext.addToast(message, 'info', duration);
    }
  }
};
