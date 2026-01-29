import React, { useState } from 'react';
import api from '../services/api';

export default function PasswordResetPage({ token, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password, confirm);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Could not reset password. ' + (err.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div style={styles.container}><h2>Password reset!</h2><p>You may now log in with your new password.</p></div>;

  return (
    <div style={styles.container}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} />
        <input type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} style={styles.input} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Saving...' : 'Reset Password'}</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 },
  input: { padding: 12, borderRadius: 8, border: '1px solid #eee', fontSize: 16 },
  button: { background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }
};
