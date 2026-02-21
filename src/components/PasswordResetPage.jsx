import React, { useState } from 'react';
import api from '../services/api';

export default function PasswordResetPage({ token, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoToLogin = () => {
    // Call onSuccess if provided, otherwise clear hash manually
    if (onSuccess) {
      onSuccess();
    } else {
      // Clear the reset hash and reload to go to landing page
      window.location.hash = '';
      window.location.reload();
    }
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate password confirmation
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(token, password, confirm);
      setSuccess(true);
      // Do NOT call onSuccess here - let user manually navigate
    } catch (err) {
      let errorMsg = 'Could not reset password. ';
      if (err?.body) {
        try {
          const body = typeof err.body === 'string' ? JSON.parse(err.body) : err.body;
          if (body.error === 'invalid_token') {
            errorMsg = 'Invalid or expired reset token. Please request a new password reset.';
          } else if (body.error === 'invalid_password') {
            errorMsg = 'Password does not meet requirements.';
          } else {
            errorMsg += body.error || body.message || 'Please try again.';
          }
        } catch {
          errorMsg += err.message || 'Please try again.';
        }
      } else if (err?.message) {
        errorMsg += err.message;
      } else {
        errorMsg += 'Please try again.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <svg style={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h2 style={styles.successTitle}>Password Reset Successful!</h2>
      <p style={styles.successMessage}>Your password has been successfully changed. You can now log in with your new password.</p>
      <button onClick={handleGoToLogin} style={styles.button}>Go to Login</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Reset Password</h2>
      <p style={styles.subtitle}>Enter your new password below</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Hidden username field for accessibility */}
        <input type="text" name="username" autoComplete="username" style={styles.hiddenInput} />
        <div style={styles.inputGroup}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            name="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setError('');
            }}
            style={styles.input}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            name="confirm-password"
            placeholder="Confirm your new password"
            value={confirm}
            onChange={e => {
              setConfirm(e.target.value);
              setError('');
            }}
            style={styles.input}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" style={styles.button} disabled={loading || !password || !confirm}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 700, color: '#1a1a1b', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a1b', marginBottom: 6 },
  input: { width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16, boxSizing: 'border-box', transition: 'border-color 0.2s' },
  hiddenInput: { display: 'none' },
  error: { color: '#dc2626', fontSize: 14, padding: 12, background: '#fee2e2', borderRadius: 8, textAlign: 'left' },
  button: { background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%', transition: 'background 0.2s' },
  iconContainer: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  successIcon: { width: 64, height: 64, color: '#4CAF50' },
  successTitle: { fontSize: 24, fontWeight: 700, color: '#1a1a1b', marginBottom: 12 },
  successMessage: { fontSize: 15, color: '#666', lineHeight: 1.5, marginBottom: 24 }
};
