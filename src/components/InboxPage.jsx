import React, { useState } from 'react';
import { ChevronLeft, CheckCircle, X, Award, MessageSquare } from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';

const InboxPage = ({ submissions, onGradeSubmit, onBack }) => {
  const [selectedSub, setSelectedSub] = useState(null);
  const [grade, setGrade] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const pending = submissions.filter(s => s.status === 'submitted');
  const graded = submissions.filter(s => s.status === 'graded');

  const handleSelect = (sub) => {
    setSelectedSub(sub);
    setGrade(sub.grade || '');
  };

  const submit = async () => {
    await onGradeSubmit(selectedSub.id, grade);
    // Try to update student's total points in parent/class dashboard if possible
    if (selectedSub?.student_id && typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('studentPointsUpdated', { detail: { studentId: selectedSub.student_id, points: Number(grade) } }));
    }
    setSelectedSub(null);
  };

  return (
    <div className="inbox-page safe-area-top" style={{ ...pageStyles.container, paddingTop: 'calc(12px + var(--safe-top, 0px))' }}>
      <style>{`
        .inbox-page .sidebar { width: 160px !important; }
        .inbox-page .workHeader { padding: 12px !important; }
        .inbox-page .badge { font-size: 11px !important; padding: 6px 10px !important; }
        @media (max-width: 768px) {
          .inbox-page .sidebar { display: none !important; }
          .inbox-page .workstation { padding: 16px !important; }
          .inbox-page .closeBtn button { width: 40px; height: 40px; }
        }
      `}</style>
      
      {/* MAIN GRADING AREA */}
      <div style={pageStyles.main}>
        {/* Header with X and ? top right, and nav toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 0 0', minHeight: 48 }}>
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Nav toggle button: show tooltip on desktop, text label on mobile */}
            <button
              onClick={() => setSidebarVisible(v => !v)}
              style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', marginRight: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              title={!isMobile ? 'Show Inbox Nav' : undefined}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="5" width="14" height="2" rx="1" fill="#64748B"/><rect x="3" y="9" width="14" height="2" rx="1" fill="#64748B"/><rect x="3" y="13" width="14" height="2" rx="1" fill="#64748B"/></svg>
              {isMobile && <span style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Inbox</span>}
            </button>
            {/* Help button: tooltip on desktop, text label on mobile */}
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <InlineHelpButton pageId="inbox" />
              {isMobile && <span style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Help</span>}
            </span>
            {/* Close button: tooltip on desktop, text label on mobile */}
            <button
              onClick={onBack}
              style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              title={!isMobile ? 'Close' : undefined}
            >
              <X size={20} />
              {isMobile && <span style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>Close</span>}
            </button>
          </div>
        </div>
        {selectedSub ? (
          <div style={pageStyles.workstation}>
            <header style={pageStyles.workHeader}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{selectedSub.student_name}</h1>
                <p style={{ color: '#666' }}>{selectedSub.assignment_title}</p>
              </div>
              <div style={pageStyles.badge}>{selectedSub.status}</div>
            </header>

            <div style={pageStyles.contentBody}>
              <h3 style={pageStyles.sectionTitle}>Student Responses</h3>
              {Object.entries(selectedSub.answers || {}).map(([, a], i) => (
                <div key={i} style={pageStyles.answerBox}>
                  <div style={pageStyles.qNum}>Question {i + 1}</div>
                  <div style={{ fontSize: '16px', lineHeight: '1.6' }}>{a}</div>
                </div>
              ))}
            </div>

            <footer style={pageStyles.gradingBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  placeholder="Points"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{ width: 60, fontSize: 16, padding: '6px 8px', borderRadius: 8, border: '1px solid #DDD', marginRight: 4, textAlign: 'center' }}
                />
                <button onClick={submit} style={{ background: '#1976D2', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Save Grade">
                  <Award color="#FFF" size={20} />
                </button>
              </div>
            </footer>
          </div>
        ) : (
          <div style={pageStyles.emptyState}>
            <MessageSquare size={48} color="#DDD" />
            <p>Select a submission to start grading</p>
          </div>
        )}
      </div>
      
     {sidebarVisible && !selectedSub && (
      <div style={pageStyles.sidebar}>
        <div style={pageStyles.sidebarHeader}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Inbox</h2>
        </div>
        <div style={pageStyles.scrollArea}>
          <SectionLabel label="Waiting for Review" count={pending.length} color="#FF4757" />
          {pending.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              active={selectedSub?.id === sub.id}
              onClick={() => handleSelect(sub)}
            />
          ))}
          <div style={{ marginTop: '30px' }} />
          <SectionLabel label="Recently Graded" count={graded.length} color="#4CAF50" />
          {graded.map(sub => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              active={selectedSub?.id === sub.id}
              onClick={() => handleSelect(sub)}
              isGraded
            />
          ))}
        </div>
      </div>
     )}

    </div>
  );
};

// Helper Components
const SectionLabel = ({ label, count, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginBottom: '10px' }}>
    <span style={{ fontSize: '12px', fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: '12px', fontWeight: 700, color }}>{count}</span>
  </div>
);

const SubmissionCard = ({ sub, active, onClick, isGraded }) => (
  <div
    onClick={onClick}
    style={{
      ...pageStyles.card,
      borderLeft: active ? '4px solid #4A90E2' : '4px solid transparent',
      background: active ? '#F0F7FF' : 'white',
      opacity: isGraded ? 0.7 : 1
    }}
  >
    <div style={{ fontWeight: 700 }}>{sub.student_name}</div>
    <div style={{ fontSize: '12px', color: '#666' }}>{sub.assignment_title}</div>
    {isGraded && <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '5px' }}>Grade: {sub.grade}</div>}
  </div>
);

const pageStyles = {
  container: { display: 'flex', height: '100%', width: '100%', background: '#F8F9FA', position: 'relative', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, flexDirection: 'row' },
  sidebar: { width: '200px', background: '#FFF', borderRight: '1px solid #EEE', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { 
    padding: '20px', 
    borderBottom: '1px solid #EEE',
    display: 'flex',
    justifyContent: 'space-between', // Pushes Inbox title left, X button right
    alignItems: 'center'
  },
  scrollArea: { flex: 1, overflowY: 'auto', padding: '20px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', background: '#F8F9FA' },
  closeBtn: {
    background: '#F1F5F9',
    color: '#64748B',
    border: 'none',
    padding: '8px',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  }, card: { padding: '15px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' },
  workstation: { display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '800px', margin: '0 auto', width: '100%', padding: '40px' },
  workHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  badge: { padding: '4px 12px', borderRadius: '20px', background: '#E3F2FD', color: '#1976D2', fontSize: '12px', fontWeight: 'bold' },
  contentBody: { flex: 1, overflowY: 'auto', paddingRight: '10px' },
  answerBox: { background: '#FFF', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #EEE' },
  qNum: { fontSize: '12px', fontWeight: 800, color: '#4A90E2', marginBottom: '10px', textTransform: 'uppercase' },
  gradingBar: { background: '#FFF', padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -10px 30px rgba(0,0,0,0.05)', marginTop: '20px', marginBottom: 0 },
  gradeInput: { border: 'none', fontSize: '18px', fontWeight: 700, width: '150px', outline: 'none' },
  submitBtn: { background: '#000', color: '#FFF', padding: '12px 24px', borderRadius: '14px', border: 'none', fontWeight: 700, cursor: 'pointer' },
  emptyState: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }
};

export default InboxPage;