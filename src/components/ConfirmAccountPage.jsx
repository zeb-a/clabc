import React, { useState } from 'react';
import api from '../services/api';

export default function ConfirmAccountPage({ token, onSuccess }) {
  const [status, setStatus] = useState('pending'); // pending | ok | error

  React.useEffect(() => {
    (async () => {
      try {
        await api.confirmAccount(token);
        setStatus('ok');
        if (onSuccess) onSuccess();
      } catch {
        setStatus('error');
      }
    })();
  }, [token, onSuccess]);

  if (status === 'ok') return <div style={styles.container}><h2>Account confirmed!</h2><p>You may now log in.</p></div>;
  if (status === 'error') return <div style={styles.container}><h2>Invalid or expired link.</h2></div>;
  return <div style={styles.container}><h2>Confirming...</h2></div>;
}

const styles = {
  container: { maxWidth: 400, margin: '60px auto', background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', textAlign: 'center' }
};
