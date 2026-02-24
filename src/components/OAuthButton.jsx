import React from 'react';
import { useToast } from './Toast';

/**
 * OAuth Login Button Component
 * Renders a styled button for OAuth login with official logos
 */
export function OAuthButton({ provider, onClick, loading, disabled, style, ...props }) {
  const { addToast } = useToast();

  const handleClick = async (e) => {
    // Show starting toast
    addToast(`Connecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`, 'info');

    try {
      // Call the original onClick handler
      if (onClick) {
        await onClick(e);
      }
      // Success toast (can be removed if you handle this elsewhere)
      // addToast('Login successful!', 'success');
    } catch (error) {
      // Error toast
      addToast('Login failed. Please try again.', 'error');
    }
  };
  // Official SVG logos for each provider
  const providerConfig = {
    github: {
      name: 'GitHub',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      bgColor: '#ffffff',
      hoverColor: '#F8F9FA',
      textColor: '#3C4043',
      borderColor: '#DADCE0'
    },
    azure: {
      name: 'Microsoft',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
          <rect x="13" y="1" width="10" height="10" fill="#7fba00"/>
          <rect x="1" y="13" width="10" height="10" fill="#00a4ef"/>
          <rect x="13" y="13" width="10" height="10" fill="#ffb900"/>
        </svg>
      ),
      bgColor: '#ffffff',
      hoverColor: '#F8F9FA',
      textColor: '#3C4043',
      borderColor: '#DADCE0'
    }
  };

  const config = providerConfig[provider] || providerConfig.github;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        width: '100%',
        padding: '14px 20px',
        borderRadius: '14px',
        border: `1px solid ${config.borderColor}`,
        backgroundColor: config.bgColor,
        color: config.textColor,
        fontSize: '15px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.7 : 1,
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
        ...style
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = config.hoverColor;
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = config.bgColor;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      {...props}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: config.textColor }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          Connecting...
        </span>
      ) : (
        <>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {config.icon}
          </span>
          <span>Continue with {config.name}</span>
        </>
      )}
    </button>
  );
}

export default OAuthButton;
