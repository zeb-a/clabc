import React, { useState } from 'react';
import api from '../services/api';
import ReportsPage from './ReportsPage'; 
import InlineHelpButton from './InlineHelpButton';
import { Lock, LogOut } from 'lucide-react';

export default function ParentPortal({ onBack, initialStudentData }) {
  const [accessCode, setAccessCode] = useState('');
  const [studentData, setStudentData] = useState(initialStudentData || null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Calls API to find student by parent code
      const data = await api.getStudentByParentCode(accessCode);
      if (data) {
        setStudentData(data);
      } else {
        setError('Invalid Access Code.');
      }
    } catch {
      setError('Connection error.');
    }
  };

  if (studentData) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {studentData.studentName}
              </h2>
              <p style={{ color: '#64748B', margin: 0, fontWeight: 600 }}>Student Progress Report</p>
            </div>
            <InlineHelpButton pageId="parent-portal" />
          </div>

          {/* BIGGER ANIMATED LOGOUT BUTTON */}
          <button 
            onClick={() => setStudentData(null)} 
            className="logout-btn-animated"
            style={styles.bigLogoutBtn}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <div style={styles.reportContainer}>
          {/* Passes studentId and parentView flag to existing ReportsPage */}
          <ReportsPage 
            activeClass={studentData.classData} 
            studentId={studentData.studentId} 
            isParentView={true} 
          />
        </div>

        {/* Animation Styles */}
        <style>{`
          .logout-btn-animated {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .logout-btn-animated:hover {
            transform: translateY(-2px);
            background: #FFF1F2 !important;
            color: #EF4444 !important;
            box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.1);
          }
          .logout-btn-animated:active {
            transform: translateY(0);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.iconCircle}><Lock color="#FF5252" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <h2 style={{ fontWeight: 900, marginBottom: '10px', fontSize: '24px' }}>Parent Access</h2>
            <p style={{ color: '#64748B', marginBottom: '30px' }}>Enter your 5-digit parent code</p>
          </div>
          <InlineHelpButton pageId="parent-portal" />
        </div>
        
        <form onSubmit={handleLogin}>
          <input
            style={styles.codeInput}
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
            placeholder="00000"
            maxLength={5}
          />
          {error && <p style={styles.errorText}>{error}</p>}
          <button type="submit" style={styles.submitBtn}>Enter Portal</button>
          <button type="button" onClick={onBack} style={styles.cancelBtn}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' },
  loginCard: { 
    background: '#fff', 
    padding: '50px', 
    borderRadius: '32px', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.05)', 
    textAlign: 'center', 
    width: '420px', 
    border: '1px solid #E2E8F0' 
  },
  iconCircle: { width: '70px', height: '70px', background: '#FFF1F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' },
  codeInput: { 
    fontSize: '40px', 
    textAlign: 'center', 
    letterSpacing: '8px', 
    width: '100%', 
    padding: '16px', 
    borderRadius: '16px', 
    border: '2px solid #F1F5F9', 
    background: '#F8FAFC', 
    marginBottom: '20px', 
    fontWeight: '900', 
    outline: 'none' 
  },
  submitBtn: { width: '100%', background: '#2D2D30', color: '#fff', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '17px' },
  cancelBtn: { width: '100%', background: 'none', border: 'none', color: '#64748B', marginTop: '20px', cursor: 'pointer', fontWeight: '700' },
  bigLogoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 28px',
    borderRadius: '16px',
    background: '#fff',
    border: '1px solid #E2E8F0',
    fontWeight: '800',
    cursor: 'pointer',
    color: '#64748B',
    fontSize: '15px'
  },
  reportContainer: { 
    maxWidth: '1000px', 
    margin: '0 auto', 
    background: '#fff', 
    borderRadius: '32px', 
    border: '1px solid #E2E8F0', 
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
  },
  errorText: { color: '#EF4444', fontSize: '14px', fontWeight: 700, marginBottom: '15px' }
};