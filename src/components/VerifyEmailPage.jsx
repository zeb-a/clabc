import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage({ token, onSuccess, onError }) {
  const [status, setStatus] = useState('verifying');
  // Prevents double-calls which can cause "invalid token" errors
  const hasCalled = useRef(false);

  useEffect(() => {
    // 1. If no token, show error immediately
    if (!token) {
      console.error('[Verify] No token found in URL');
      setStatus('error');
      return;
    }

    // 2. Prevent the effect from running twice
    if (hasCalled.current) return;
    hasCalled.current = true;

    const doVerify = async () => {
      try {
        console.log('[Verify] Sending token to PocketBase:', token);
        
        // This triggers the POST request in your api.js
        await api.verifyEmail(token);
        
        setStatus('success');
        console.log('[Verify] Status: SUCCESS');

        // Wait 2.5 seconds so user sees the green checkmark
        if (onSuccess) {
          setTimeout(onSuccess, 2500);
        }
      } catch (err) {
        console.error('[Verify] Status: FAILED', err);
        setStatus('error');
        if (onError) onError(err);
      }
    };

    doVerify();
  }, [token, onSuccess, onError]);

  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#F4F1EA',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        {status === 'verifying' && (
          <>
            <Loader size={48} className="animate-spin" style={{ margin: '0 auto 20px', color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#333' }}>Activating Account</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>Verifying your credentials with our servers...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle size={54} color="#4CAF50" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#4CAF50' }}>Verified!</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>Your email is confirmed. Redirecting you to login...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle size={54} color="#f44336" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f44336' }}>Invalid Link</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>The link is expired or has already been used.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{ marginTop: '25px', padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Back to Login
            </button>
          </>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
