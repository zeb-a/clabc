/* eslint-disable no-unused-vars */
import  { useState, useMemo, useEffect } from 'react';
import {
  Trophy, Star, BookOpen, Ghost, LogOut,
  CheckCircle, AlertCircle, Globe
} from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';
import StudentWorksheetSolver from './StudentWorksheetSolver';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';

const translations = {
  en: {
    logout: "Logout", refresh: "Refresh", points: "Total Points",
    completed: "Completed", todo: "To Do", title: "My Assignments",
    questions: "Questions", done: "Done", open: "Open",
    hideTask: "Hide Task?", hideWarn: "This will remove the assignment from your dashboard. You won't be able to see it again.",
    cancel: "Cancel", yesHide: "Yes, Hide it", noAsn: "No assignments yet!",
    refreshPrompt: 'If your teacher just sent one, click "Refresh".',
    langToggle: "中文"
  },
  zh: {
    logout: "登出", refresh: "刷新", points: "总积分",
    completed: "已完成", todo: "待办", title: "我的作业项目",
    questions: "个问题", done: "完成", open: "开启",
    hideTask: "隐藏任务？", hideWarn: "这将从您的仪表板中删除该作业。您将无法再次看到它。",
    cancel: "取消", yesHide: "是的，隐藏它", noAsn: "暂无作业！",
    refreshPrompt: "如果老师刚发送了作业，请点击“刷新”。",
    langToggle: "English"
  }
};

// Version key to clear stale localStorage data on deployments
const CACHE_VERSION = '2.0';
const CACHE_VERSION_KEY = 'classABC_cache_version';


const StudentPortal = ({ onBack, classes = [], refreshClasses }) => {
  const isMobile = useWindowSize(768);

  // Clear stale localStorage data on version change
  useEffect(() => {
    const currentVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (currentVersion !== CACHE_VERSION) {
      localStorage.removeItem('classABC_completed_assignments');
      localStorage.removeItem('classABC_hidden_assignments');
      localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    }
  }, []);

  const [activeWorksheet, setActiveWorksheet] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // For the modern modal
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('todo');
  const t = translations[lang];

  // 1. SESSION & STORAGE
  const session = useMemo(() => {
    try {
      const saved = localStorage.getItem('classABC_student_portal');
      return saved ? JSON.parse(saved) : null;
    // eslint-disable-next-line no-unused-vars
    } catch (e) { return null; }
  }, []);

  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load completed assignments from backend on mount and when session/classes change
  useEffect(() => {
    const loadCompletedAssignments = async () => {
      if (!session || !classes.length) {
        setIsLoading(false);
        return;
      }

      try {
        const sId = String(session.studentId);
        // Use the same filter as onCompletion - without class_id filter
        // This ensures consistency and finds all submissions even if class_id relation is invalid
        const filterQuery = `student_id='${sId}'`;

        const response = await api.pbRequest(`/collections/submissions/records?filter=${encodeURIComponent(filterQuery)}`);

        const foundClass = classes.find(c => c.students?.some(stud => String(stud.id) === sId));
        if (!foundClass) {
          setIsLoading(false);
          return;
        }

        // Helper to generate assignment ID from title and date (same logic as ensureAssignmentId)
        const generateAssignmentId = (asm) => {
          if (asm.id && asm.id !== undefined && asm.id !== null) {
            return String(asm.id);
          }
          // Generate ID from title and date for consistent identification
          const baseTitle = (asm.title || '').replace(/\s+/g, '_').toLowerCase();
          const dateStr = asm.date ? new Date(asm.date).getTime() : Date.now();
          return `${baseTitle}_${dateStr}`;
        };

        // Generate all possible IDs for each assignment (to match submissions)
        const assignmentIdMap = new Map();
        (foundClass.assignments || []).forEach((asm, idx) => {
          const primaryId = generateAssignmentId(asm);
          assignmentIdMap.set(primaryId, primaryId);

          // Also try matching by title (for old submissions)
          if (asm.title) {
            assignmentIdMap.set(asm.title, primaryId);
            assignmentIdMap.set(`${asm.title}_1`, primaryId);
          }
        });

        // Map submissions to actual assignment IDs
        const completedIds = [];
        response.items?.forEach(item => {
          const subId = String(item.assignment_id);
          if (assignmentIdMap.has(subId)) {
            completedIds.push(assignmentIdMap.get(subId));
          }
        });
        setCompletedAssignments(completedIds);

        // Update localStorage as cache (not as a source of truth)
        localStorage.setItem('classABC_completed_assignments', JSON.stringify(completedIds));
      } catch (error) {
        console.error('Failed to load completed assignments:', error);
        // Clear stale localStorage and use empty array on error
        localStorage.removeItem('classABC_completed_assignments');
        setCompletedAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletedAssignments();
  }, [session, classes]);

  // Clean up invalid completed assignment IDs (IDs that no longer exist in assignments)
  useEffect(() => {
    if (!session || !classes.length) return;

    const sId = String(session.studentId);
    const foundClass = classes.find(c => c.students?.some(stud => String(stud.id) === sId));
    if (!foundClass) return;

    const allAssignmentIds = (foundClass.assignments || []).map(asm => String(asm.id));
    const validCompletedIds = completedAssignments.filter(id => allAssignmentIds.includes(String(id)));

    // Only update if there are invalid IDs
    if (validCompletedIds.length !== completedAssignments.length) {
      setCompletedAssignments(validCompletedIds);
      localStorage.setItem('classABC_completed_assignments', JSON.stringify(validCompletedIds));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes, session]);

  const [hiddenAssignments, setHiddenAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('classABC_hidden_assignments');
      return saved ? JSON.parse(saved) : [];
    // eslint-disable-next-line no-unused-vars
    } catch (e) { return []; }
  });

  // 2. DATA SCANNER (With Sorting & Hiding Logic)
  const { liveClass, studentAssignments, currentStudent } = useMemo(() => {
    if (!session || !classes.length) return { liveClass: null, studentAssignments: [], currentStudent: null };

    const sId = String(session.studentId);
    let foundClass = classes.find(c => c.students?.some(stud => String(stud.id) === sId));
    if (!foundClass) return { liveClass: null, studentAssignments: [], currentStudent: null };

    // Helper function to ensure each assignment has an ID
    const ensureAssignmentId = (asm, idx) => {
      if (!asm.id || asm.id === undefined || asm.id === null) {
        // Generate ID from title and date for consistent identification
        const baseTitle = (asm.title || '').replace(/\s+/g, '_').toLowerCase();
        const dateStr = asm.date ? new Date(asm.date).getTime() : Date.now();
        return { ...asm, id: `${baseTitle}_${dateStr}` };
      }
      return asm;
    };

    const assignments = (foundClass.assignments || [])
      .map((asm, idx) => ensureAssignmentId(asm, idx))
      .filter(asm => {
        if (!asm || hiddenAssignments.includes(asm.id)) return false; // REMOVE HIDDEN ITEMS
        const isGlobal = asm.assignedToAll === true || asm.assignedTo === 'all' || !asm.assignedTo;
        const isSpecific = Array.isArray(asm.assignedTo) && asm.assignedTo.some(id => String(id) === sId);
        return isGlobal || isSpecific;
      })
      .sort((a, b) => {
        // SORTING: Uncompleted first (newest to oldest), then completed (newest to oldest)
        const isCompletedA = completedAssignments.includes(String(a.id));
        const isCompletedB = completedAssignments.includes(String(b.id));

        // Uncompleted assignments always come before completed ones
        if (isCompletedA !== isCompletedB) {
          return isCompletedA ? 1 : -1;
        }

        // Within same completion status, sort by date (newest first)
        const dateA = a.created || a.id;
        const dateB = b.created || b.id;
        return dateB - dateA;
      });

    return {
      liveClass: foundClass,
      studentAssignments: assignments,
      currentStudent: foundClass.students?.find(s => String(s.id) === sId)
    };
  }, [classes, session, hiddenAssignments, completedAssignments]);

  // 3. CORRECT TO-DO CALCULATION (Prevents negative numbers)
  const todoCount = studentAssignments.filter(asm => !completedAssignments.includes(String(asm.id))).length;
  const completedCount = studentAssignments.filter(asm => completedAssignments.includes(String(asm.id))).length;

  // Filter assignments based on active tab
  const filteredAssignments = useMemo(() => {
    return activeTab === 'todo'
      ? studentAssignments.filter(asm => !completedAssignments.includes(String(asm.id)))
      : studentAssignments.filter(asm => completedAssignments.includes(String(asm.id)));
  }, [studentAssignments, completedAssignments, activeTab]);

  const handleHideAssignment = () => {
    if (!deleteTarget) return;
    const newHidden = [...hiddenAssignments, deleteTarget];
    setHiddenAssignments(newHidden);
    localStorage.setItem('classABC_hidden_assignments', JSON.stringify(newHidden));
    setDeleteTarget(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('classABC_student_portal');
    onBack();
  };

  if (activeWorksheet) {
    return (
      <StudentWorksheetSolver
        lang={lang}
        worksheet={activeWorksheet}
        onClose={() => setActiveWorksheet(null)}
        studentName={currentStudent?.name || session.studentName}
        studentId={currentStudent?.id || session.studentId}
        classId={liveClass?.id}
        onCompletion={async () => {
          // Reload completed assignments from backend to ensure consistency
          if (!session || !classes.length) return;

          try {
            const sId = String(session.studentId);
            const foundClass = classes.find(c => c.students?.some(stud => String(stud.id) === sId));
            if (!foundClass) return;

            const filterQuery = `student_id='${sId}'`;
            const response = await api.pbRequest(`/collections/submissions/records?filter=${encodeURIComponent(filterQuery)}`);

            // Helper to generate assignment ID from title and date (same logic as ensureAssignmentId)
            const generateAssignmentId = (asm) => {
              if (asm.id && asm.id !== undefined && asm.id !== null) {
                return String(asm.id);
              }
              const baseTitle = (asm.title || '').replace(/\s+/g, '_').toLowerCase();
              const dateStr = asm.date ? new Date(asm.date).getTime() : Date.now();
              return `${baseTitle}_${dateStr}`;
            };

            // Generate all possible IDs for each assignment (to match submissions)
            const assignmentIdMap = new Map();
            (foundClass.assignments || []).forEach((asm) => {
              const primaryId = generateAssignmentId(asm);
              assignmentIdMap.set(primaryId, primaryId);

              if (asm.title) {
                assignmentIdMap.set(asm.title, primaryId);
                assignmentIdMap.set(`${asm.title}_1`, primaryId);
              }
            });

            // Map submissions to actual assignment IDs
            const completedIds = [];
            response.items?.forEach(item => {
              const subId = String(item.assignment_id);
              if (assignmentIdMap.has(subId)) {
                completedIds.push(assignmentIdMap.get(subId));
              }
            });

            setCompletedAssignments(completedIds);
            localStorage.setItem('classABC_completed_assignments', JSON.stringify(completedIds));
          } catch (error) {
            console.error('Failed to reload completed assignments:', error);
          }
        }}
      />
    );
  }

  return (
    <div className="student-portal" style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .student-portal .topBar { padding: 12px 16px !important; }
        .student-portal h2 { font-size: 18px !important; }
        .student-portal .StatCard { padding: 12px !important; }
        @media (max-width: 768px) {
          .student-portal { padding-bottom: 80px; }
          .student-portal .topBar { flex-direction: column; gap: 8px; align-items: flex-start; }
          .student-portal .scrollArea { padding: 12px !important; }
          .student-portal .workstation { padding: 12px !important; }
        }
      `}</style>
      
      {/* --- MODERN HIDE MODAL --- */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#FEF2F2', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
              <AlertCircle size={40} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>{t.hideTask}</h2>
            <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: '30px' }}>{t.hideWarn}</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '15px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {t.cancel}
              </button>
              <button onClick={handleHideAssignment} style={{ flex: 1, padding: '15px', borderRadius: '16px', border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {t.yesHide}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <div className="safe-area-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>{currentStudent?.name || session.studentName}</h2>
            <span style={{ color: '#64748B', fontSize: '14px', fontWeight: 700 }}>{liveClass?.name || 'Classroom'}</span>
          </div>
          <InlineHelpButton pageId="student-portal" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} style={{ background: '#F1F5F9', border: 'none', padding: '12px 20px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} /> {t.langToggle}
          </button>
          <button onClick={handleLogout} style={{minWidth: isMobile ? '48px' : 'auto', background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: isMobile ? '0' : '8px', padding: isMobile ? '12px' : '12px 24px', }}>
            <LogOut size={isMobile ? 22 : 18} /> {!isMobile && t.logout}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* STATS & TABS */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Total Points Card - 50% smaller */}
          <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star color="#F59E0B" fill="#F59E0B" size={20} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 900 }}>{currentStudent?.score || 0}</div>
              <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.points}</div>
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: '12px', flex: 1, borderBottom: '2px solid #E2E8F0', paddingBottom: '0' }}>
            <button
              onClick={() => setActiveTab('todo')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'todo' ? '#6366F1' : 'transparent',
                color: activeTab === 'todo' ? '#fff' : '#64748B',
                border: 'none',
                borderRadius: activeTab === 'todo' ? '12px 12px 0 0' : '0',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginBottom: activeTab === 'todo' ? '-2px' : '0',
                borderBottom: activeTab === 'todo' ? '2px solid #6366F1' : '2px solid transparent'
              }}
            >
              <BookOpen size={16} /> {t.todo} <span style={{ background: activeTab === 'todo' ? 'rgba(255,255,255,0.3)' : '#E2E8F0', padding: '3px 8px', borderRadius: '8px', fontSize: '11px' }}>{todoCount}</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                padding: '12px 24px',
                background: activeTab === 'completed' ? '#10B981' : 'transparent',
                color: activeTab === 'completed' ? '#fff' : '#64748B',
                border: 'none',
                borderRadius: activeTab === 'completed' ? '12px 12px 0 0' : '0',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginBottom: activeTab === 'completed' ? '-2px' : '0',
                borderBottom: activeTab === 'completed' ? '2px solid #10B981' : '2px solid transparent'
              }}
            >
              <CheckCircle size={16} /> {t.completed} <span style={{ background: activeTab === 'completed' ? 'rgba(255,255,255,0.3)' : '#E2E8F0', padding: '3px 8px', borderRadius: '8px', fontSize: '11px' }}>{completedCount}</span>
            </button>
          </div>
        </div>

        {/* ASSIGNMENTS GRID */}
        {activeTab === 'todo' ? (
          <>
            {filteredAssignments.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px', marginBottom: '60px' }}>
                {filteredAssignments.map((asm) => (
                  <div
                    key={asm.id}
                    onClick={() => setActiveWorksheet(asm)}
                    style={{
                      background: '#fff', padding: '28px', borderRadius: '28px', border: '1px solid #E2E8F0',
                      cursor: 'pointer', position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ width: '65px', height: '65px', background: '#EEF2FF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={32} color="#4F46E5" />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 900 }}>{asm.title}</h4>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: '#64748B' }}>{asm.questions?.length || 0} {t.questions}</span>
                          <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5' }}>
                            {t.open}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#EEF2FF', borderRadius: '16px', border: '2px dashed #A78BFA' }}>
                <CheckCircle size={48} color="#A78BFA" style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#4F46E5', margin: '0 0 10px 0' }}>All caught up!</h3>
                <p style={{ color: '#64748B', fontSize: '14px' }}>You've completed all your assignments.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {filteredAssignments.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {filteredAssignments.map((asm) => (
                  <div
                    key={asm.id}
                    style={{
                      background: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #DCFCE7',
                      position: 'relative', opacity: '0.85'
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(asm.id); }}
                      style={{ position: 'absolute', top: '12px', right: '12px', background: '#FEF2F2', border: 'none', borderRadius: '10px', padding: '6px', cursor: 'pointer', color: '#E11D48', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FEF2F2'}
                    >
                      <Ghost size={14} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '56px', height: '56px', background: '#DCFCE7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={28} color="#10B981" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 900, color: '#1E293B' }}>{asm.title}</h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A' }}>
                          {t.done}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#F8FAFC', borderRadius: '16px', border: '2px dashed #CBD5E1' }}>
                <CheckCircle size={48} color="#CBD5E1" style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#64748B', margin: '0 0 10px 0' }}>No completed assignments yet</h3>
                <p style={{ color: '#94A3B8', fontSize: '14px' }}>Completed assignments will appear here.</p>
              </div>
            )}
          </>
        )}

        {studentAssignments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: '#fff', borderRadius: '32px', border: '2px dashed #E2E8F0' }}>
            <Ghost size={60} color="#CBD5E1" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', color: '#1E293B' }}>{t.noAsn}</h3>
            <p style={{ color: '#64748B' }}>{t.refreshPrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, val, label }) => (
  <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '250px' }}>
    {icon}
    <div>
      <div style={{ fontSize: '32px', fontWeight: 900 }}>{val}</div>
      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  </div>
);

export default StudentPortal;