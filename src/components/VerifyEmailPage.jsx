import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmailPage({ token, onSuccess, onError }) {
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    (async () => {
      try {
        await api.verifyEmail(token);
        setStatus('success');
        if (onSuccess) setTimeout(onSuccess, 2000);
      } catch (err) {
        console.error('Email verification failed:', err);
        setStatus('error');
        if (onError) onError(err);
      }
    })();
  }, [token, onSuccess, onError]);

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F1EA' }}>
      <div style={{ maxWidth: '500px' }}>
        {status === 'verifying' && (
          <>
            <Loader size={48} style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your account.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle size={48} color="#4CAF50" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: '#4CAF50' }}>Email verified!</h2>
            <p>Your account is now active. You can log in with your email and password.</p>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '20px' }}>Redirecting to login...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle size={48} color="#f44336" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: '#f44336' }}>Verification failed</h2>
            <p>The verification link may be expired or invalid.</p>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '20px' }}>Please try signing up again or contacting support.</p>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
