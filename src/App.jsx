import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from './services/api';
import LandingPage from './components/LandingPage';
import TeacherPortal from './components/TeacherPortal';
import ProfileModal from './components/ProfileModal';
import ClassDashboard from './components/ClassDashboard';
import EggRoad from './components/EggRoad';
import SettingsPage from './components/SettingsPage';
import SetupWizard from './components/SetupWizard';
import LuckyDrawModal from './components/LuckyDrawModal';
import StudentCard from './components/StudentCard';
import BehaviorModal from './components/BehaviorModal';
import VerifyEmailPage from './components/VerifyEmailPage';
import { LogOut } from 'lucide-react';
import PasswordResetPage from './components/PasswordResetPage';
import ConfirmAccountPage from './components/ConfirmAccountPage';
import SearchableGuide from './components/SearchableGuide';
import AssignmentsPage from "./components/AssignmentsPage";
import ErrorBoundary from './components/ErrorBoundary';
import './components/ModalAnimations.css';
// --- INITIAL DATA ---

import { fallbackInitialsDataUrl } from './utils/avatar';

const MOCK_CLASS = {
  id: 'demo-class',
  name: 'Demo Class',
  students: [
    { id: 1, name: 'Emma Watson', gender: 'girl', score: 15, avatar: fallbackInitialsDataUrl('Emma Watson') },
    { id: 2, name: 'Liam Johnson', gender: 'boy', score: 8, avatar: fallbackInitialsDataUrl('Liam Johnson') },
    { id: 3, name: 'Olivia Smith', gender: 'girl', score: 22, avatar: fallbackInitialsDataUrl('Olivia Smith') },
    { id: 4, name: 'Noah Brown', gender: 'boy', score: 5, avatar: fallbackInitialsDataUrl('Noah Brown') },
    { id: 5, name: 'Ava Davis', gender: 'girl', score: 12, avatar: fallbackInitialsDataUrl('Ava Davis') }
  ],
  theme: 'ocean',
  createdAt: Date.now()
};

const INITIAL_STUDENTS = [
  { id: 1, name: 'Pablo Picasso', gender: 'boy', score: 0, avatar: fallbackInitialsDataUrl('Pablo Picasso') },
  { id: 2, name: 'Marie Curie', gender: 'girl', score: 0, avatar: fallbackInitialsDataUrl('Marie Curie') }
];

const INITIAL_BEHAVIORS = [
  { id: 1, label: 'Helped Friend', pts: 1, type: 'wow', icon: '🤝' },
  { id: 2, label: 'Great Work', pts: 2, type: 'wow', icon: '🌟' },
  { id: 3, label: 'On Task', pts: 1, type: 'wow', icon: '📖' },
  { id: 4, label: 'Kindness', pts: 1, type: 'wow', icon: '❤️' },
  { id: 5, label: 'Noisy', pts: -1, type: 'nono', icon: '📢' },
  { id: 6, label: 'Disruptive', pts: -2, type: 'nono', icon: '⚠️' }
];

// Note: this file now centralizes app state and delegates UI to components in `/src/components`.
// The large in-file LandingPage/TeacherPortal implementations were replaced with
// imports so each component can be maintained separately.

// ==========================================
// 3. MAIN APP (THE TRAFFIC CONTROLLER)
// ==========================================
function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('classABC_logged_in');
    const token = localStorage.getItem('classABC_pb_token') || localStorage.getItem('classABC_token');
    if (stored && token) {
      return JSON.parse(stored);
    }
    return null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [classes, setClasses] = useState([]);
  const [behaviors, setBehaviors] = useState(() => JSON.parse(localStorage.getItem('classABC_behaviors')) || INITIAL_BEHAVIORS);
  const [activeClassId, setActiveClassId] = useState(null);
  const [view, setView] = useState('portal'); // 'portal' | 'dashboard' | 'egg' | 'settings' | 'setup'

  // 1. Add state to track if we are in the assignment studio
  const [isAssignmentStudioOpen, setIsAssignmentStudioOpen] = useState(false);

  const [showGuide, setShowGuide] = useState(false);

  const saveTimeoutRef = useRef(null);

  // Check for email verification token in URL
  const verificationToken = useMemo(() => {
    const hash = window.location.hash;
    const match = hash.match(/confirm-verification\/([^/]+)/);
    return match ? match[1] : null;
  }, []);

  if (verificationToken) {
    return <VerifyEmailPage
      token={verificationToken}
      onSuccess={() => {
        window.location.hash = '';
        window.location.reload();
      }}
      onError={() => {
        window.location.hash = '';
      }}
    />;
  }

// Load classes and behaviors (for both logged in users and when accessed via student portal)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // restore token into api layer if present
    const token = localStorage.getItem('classABC_pb_token') || localStorage.getItem('classABC_token');
    if (token) api.setToken(token);


    let mounted = true;

// Load classes from PocketBase (try to use user email if available, otherwise load publically accessible data)
    (async () => {
      try {
        let remote = [];
        if (user) {
          // If user is logged in, load their classes
          remote = await api.getClasses(user.email);
        } else {
          // If no user is logged in (student portal access), we should attempt to load the latest classes
          // We'll try to get the email from localStorage to load the appropriate classes
          const storedUser = localStorage.getItem('classABC_logged_in');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              remote = await api.getClasses(parsedUser.email);
            } catch {
              console.warn('Could not parse stored user, falling back to localStorage');
              // Fallback to localStorage
              const key = `classABC_data_${'anonymous'}`;
              const localClasses = JSON.parse(localStorage.getItem(key)) || [];
              if (localClasses.length > 0 && mounted) {
                setClasses(localClasses);
              }
            }
          } else {
            // No stored user, try to load from localStorage fallback
            const key = `classABC_data_${'anonymous'}`;
            const localClasses = JSON.parse(localStorage.getItem(key)) || [];
            if (localClasses.length > 0 && mounted) {
              setClasses(localClasses);
            }
          }
        }

        if (mounted && Array.isArray(remote)) {
          if (remote.length > 0) {
            setClasses(remote);
          } else if (user && !localStorage.getItem('classABC_demo_shown')) {
            // New user with no classes - show demo class
            setClasses([MOCK_CLASS]);
            localStorage.setItem('classABC_demo_shown', 'true');
          }
        }
      } catch {
            // backend not available — load from localStorage fallback
            const userEmail = user?.email || 'anonymous';
            const key = `classABC_data_${userEmail}`;
            const localClasses = JSON.parse(localStorage.getItem(key)) || [];
            if (mounted) setClasses(localClasses);
          }
    })();

    // Load behaviors from PocketBase
    (async () => {
      try {
        const remote = await api.getBehaviors();
        if (mounted && Array.isArray(remote)) {
          setBehaviors(remote.length > 0 ? remote : INITIAL_BEHAVIORS);
        }
      } catch (e) {
        // backend not available — load from localStorage fallback
        const localBehaviors = JSON.parse(localStorage.getItem('classABC_behaviors')) || INITIAL_BEHAVIORS;
        if (mounted) setBehaviors(localBehaviors);
        console.warn('Loading behaviors from localStorage due to API error:', e.message);
      }
    })();

    return () => { mounted = false; };
  }, [user]);

  // persist behaviors and classes per user (localStorage + backend when available)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    localStorage.setItem('classABC_behaviors', JSON.stringify(behaviors));
    const token = localStorage.getItem('classABC_pb_token') || localStorage.getItem('classABC_token');

    if (user && token && (behaviors.length > 0 || classes.length > 0)) {
      // Debounce saves to avoid duplicate records
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Note: behaviors are saved via saveClasses (as behaviorsForTasks), not separately
          await api.saveClasses(user.email, classes, behaviors);
        } catch (e) {
          console.error('Save failed:', e.message);
        }
      }, 1000); // Wait 1 second before saving

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [behaviors, classes, user]);

  const onLoginSuccess = (u) => {
    api.setToken(u.token);
    localStorage.setItem('classABC_pb_token', u.token);
    localStorage.setItem('classABC_logged_in', JSON.stringify(u));
    // Clear old localStorage data to avoid mixing with PocketBase
    localStorage.removeItem(`classABC_data_${u.email}`);
    localStorage.removeItem('classABC_behaviors');
    setUser(u);
  };

  const onLogout = () => {
    localStorage.removeItem('classABC_logged_in');
    // clear any persisted auth token
    api.setToken(null);
    localStorage.removeItem('classABC_pb_token');
    localStorage.removeItem('classABC_token');
    setUser(null);
    setClasses([]);
    setActiveClassId(null);
    setView('portal');
  };

  const onAddClass = (newClass) => {
    setClasses(prev => {
      const next = [...prev, newClass];
      // persist to localStorage only, backend save via effect
      try {
        if (user && user.email) {
          const key = `classABC_data_${user.email}`;
          localStorage.setItem(key, JSON.stringify(next));
        }
      // eslint-disable-next-line no-unused-vars, no-empty
      } catch (e) { }
      return next;
    });
  };

  const onSelectClass = (classId) => {
    setActiveClassId(classId);
    setView('dashboard');
  };

  const updateClasses = (updater) => {
    // Accept either functional updater or direct value
    setClasses(prev => {
      const next = (typeof updater === 'function' ? updater(prev) : updater);
      try {
        if (user && user.email) {
          const key = `classABC_data_${user.email}`;
          localStorage.setItem(key, JSON.stringify(next));
        }
      // eslint-disable-next-line no-unused-vars, no-empty
      } catch (e) { }
      return next;
    });
  };

    const activeClass = classes.find(c => c.id === activeClassId) || null;

  // Function to manually refresh classes from backend
  const refreshClasses = async () => {
    try {
      let userEmail = user?.email;

      // If no user is logged in, try to get the email from localStorage
      if (!user) {
        const storedUser = localStorage.getItem('classABC_logged_in');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userEmail = parsedUser.email;
          } catch {
            console.warn('Could not parse stored user for refresh');
            return;
          }
        }
      }

      if (userEmail) {
        const remoteClasses = await api.getClasses(userEmail);
        if (remoteClasses && Array.isArray(remoteClasses)) {
          setClasses(remoteClasses);
        }
      }
    } catch (error) {
      console.warn('Could not refresh classes:', error.message);
    }
  };

  // --- THIS BLOCK MUST BE HERE (ABOVE THE MAIN RETURN) ---
  if (isAssignmentStudioOpen) {
    console.log("App.jsx: Rendering AssignmentsPage now!");
    return (
    
      <AssignmentsPage
        activeClass={activeClass}
        onBack={() => setIsAssignmentStudioOpen(false)}
        onPublish={async (assignmentData) => {
          const newAsn = { 
            ...assignmentData, 
            id: Date.now(),
            // Ensure consistent formatting of assignedTo array
            assignedTo: Array.isArray(assignmentData.assignedTo) ? 
              assignmentData.assignedTo.map(id => String(id)) : 
              (assignmentData.assignedTo || 'all'),  // Store who it's assigned to
            assignedToAll: assignmentData.assignedToAll !== undefined ? assignmentData.assignedToAll : true  // Default to all
          };


          // Compute new classes array and persist both in state and backend
          let newClasses;
          setClasses(prevClasses => {
            newClasses = prevClasses.map(c => {
              if (String(c.id) === String(activeClass.id)) {
                return {
                  ...c,
                  assignments: [...(c.assignments || []), newAsn],
                  submissions: c.submissions || [],
                  student_submissions: c.student_submissions || [],
                  studentAssignments: [
                    ...(c.studentAssignments || []),
                    ...(c.students || []).filter(s => {
                      if (newAsn.assignedToAll) return true;
                      if (Array.isArray(newAsn.assignedTo) && newAsn.assignedTo.includes(String(s.id))) return true;
                      return false;
                    }).map(s => ({
                      id: Date.now() + '_' + s.id,
                      assignmentId: newAsn.id,
                      studentId: s.id,
                      classId: c.id,
                      status: 'assigned',
                      answers: {},
                      assignedAt: new Date().toISOString()
                    }))
                  ]
                };
              }
              return c;
            });
            console.log("Teacher just updated classes. New assignments:", newClasses.find(c => c.id === activeClass.id)?.assignments);
            return newClasses;
          });

          // Wait for state update to flush, then save the same newClasses to backend
          setTimeout(async () => {
            try {
              console.log("Saving assignments to backend...");
              await api.saveClasses(user.email, newClasses, behaviors);
              console.log("Assignment successfully saved to backend");
            } catch (error) {
              console.error("Error saving assignment to backend:", error);
            }
          }, 0);

          // Simulate a notification to students that a new assignment is available
          // This would trigger updates in the student portals
          console.log("Assignment published successfully:", newAsn.title);
          console.log("Assigned to:", newAsn.assignedTo, "Assigned to all:", newAsn.assignedToAll);

          setIsAssignmentStudioOpen(false);
        }}

      />
    );
  }

  // Handle /reset/:token and /confirm/:token
  const hashRoute = getHashRoute();
  if (hashRoute.page === 'reset') {
    return <PasswordResetPage token={hashRoute.token} onSuccess={() => { window.location.hash = ''; }} />;
  }
  if (hashRoute.page === 'confirm') {
    return <ConfirmAccountPage token={hashRoute.token} onSuccess={() => { window.location.hash = ''; }} />;
  }

      // Landing page (no user logged in)
  if (!user) {
    return (
      <>
        <LandingPage
          onLoginSuccess={onLoginSuccess}
          classes={classes}
          setClasses={setClasses}
          refreshClasses={refreshClasses}
          showSearchGuide={() => setShowGuide(true)}
          openModal={(action) => {
            // Handle guide action clicks - close guide and set modal mode
            setShowGuide(false);
            // The LandingPage component will handle the actual modal rendering based on its internal state
            // We need to communicate this back to LandingPage
            window.dispatchEvent(new CustomEvent('guide-action', { detail: action }));
          }}
        />
    {showGuide && (
      <SearchableGuide
        onClose={() => setShowGuide(false)}
        onTriggerAction={(action) => {
          setShowGuide(false);
          window.dispatchEvent(new CustomEvent('guide-action', { detail: action }));
        }}
      />
    )}
  </>
  );
  }

  // Profile modal

  // Profile modal
  if (showProfile) {
    return <ProfileModal user={user} onSave={async (data) => {
      try {
        const result = await api.updateProfile({ ...data, id: user.id });
        if (result && result.user) {
          setUser(u => ({ ...u, ...result.user }));
          localStorage.setItem('classABC_logged_in', JSON.stringify({ ...user, ...result.user }));
        } else {
          setUser(u => ({ ...u, ...data }));
          localStorage.setItem('classABC_logged_in', JSON.stringify({ ...user, ...data }));
        }
        setShowProfile(false);
      } catch (err) {
        let msg = 'Failed to update profile.';
        if (err?.body) {
          try {
            const body = typeof err.body === 'string' ? JSON.parse(err.body) : err.body;
            if (body.error === 'not_found') msg = 'User not found. Please log in again.';
            else msg = body.error || body.message || 'Failed to update profile.';
          } catch {
            msg = typeof err.body === 'string' ? err.body : err.message || 'Failed to update profile.';
          }
        } else if (err?.message) {
          msg = err.message;
        }
        alert(msg);
      }
    }} onClose={() => setShowProfile(false)} />;
  }

  // Portal (list of classes)
  if (view === 'portal') {
    return (
      <>
      <TeacherPortal
        user={user}
        classes={classes}
        onSelectClass={onSelectClass}
        onAddClass={(c) => onAddClass(c)}
        onLogout={onLogout}
        onEditProfile={() => setShowProfile(true)}
        updateClasses={setClasses}
      />
    </>
    );
  }

  // Dashboard for a selected class
  if (view === 'dashboard' && activeClass) {
    return (
      <>
        <ClassDashboard
          user={user}
          activeClass={activeClass}
          behaviors={behaviors}
          onBack={() => { setActiveClassId(null); setView('portal'); }}
          onOpenEggRoad={() => setView('egg')}
          onOpenSettings={() => setView('settings')}
          updateClasses={updateClasses}
          onUpdateBehaviors={(next) => setBehaviors(next)}
          onOpenAssignments={() => setIsAssignmentStudioOpen(true)}
        />
      </>
    );
  }

  if (view === 'egg' && activeClass) {
    return (
      <>
        <EggRoad
          classData={activeClass}
          onBack={() => setView('dashboard')}
          onResetProgress={() => {
            // Reset all students' points to 0
            const updated = (prev) => prev.map(c =>
              c.id === activeClass.id
                ? { ...c, students: c.students.map(s => ({ ...s, score: 0 })) }
                : c
            );
            setClasses(updated);
          }}
        />
      </>
    );
  }

  if (view === 'settings' && activeClass) {
    return (
      <>
        <SettingsPage
          activeClass={activeClass}
          behaviors={behaviors}
          onBack={() => setView('dashboard')}
          onUpdateBehaviors={(next) => setBehaviors(next)}
          onUpdateStudents={(nextStudents) => updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, students: nextStudents } : c))}
        />
      </>
    );
  }

  if (view === 'setup') {
    return (
      <SetupWizard onComplete={(newStudents, className) => {
        const newClass = { id: Date.now(), name: className || 'New Class', students: newStudents };
        onAddClass(newClass);
        setView('portal');
      }} />
    );
  }
  // 2. In your render logic:

  // Fallback to portal
  return (
    <TeacherPortal classes={classes} onSelectClass={onSelectClass} onAddClass={onAddClass} onLogout={onLogout} />
  );
}

// --- STYLES ---
const _modernStyles = {
  container: { height: '100vh', background: '#fff', fontFamily: 'system-ui', overflowY: 'auto' },
  glow: { position: 'fixed', top: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% -20%, #e8f5e9, transparent)', pointerEvents: 'none' },
  nav: { padding: '20px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' },
  badge: { fontSize: '10px', background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '10px', verticalAlign: 'middle' },
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
  anchor: { textDecoration: 'none', color: '#444', fontWeight: '500' },
  loginBtn: { background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  signupBtn: { background: '#1a1a1b', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  hero: { textAlign: 'center', padding: '100px 20px' },
  tagline: { color: '#4CAF50', fontWeight: 'bold', marginBottom: '15px' },
  heroTitle: { fontSize: '75px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-3px' },
  gradientText: { background: 'linear-gradient(90deg, #4CAF50, #2E7D32)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: '20px', color: '#666', maxWidth: '600px', margin: '20px auto' },
  mainCta: { background: '#000', color: '#fff', padding: '18px 35px', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' },
  infoSection: { padding: '80px', background: '#f9f9f9' },
  sectionHeading: { textAlign: 'center', fontSize: '40px', fontWeight: '900', marginBottom: '50px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' },
  infoCard: { background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  iconBg: { width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  howSection: { padding: '80px', display: 'flex', gap: '50px', alignItems: 'center' },
  howContent: { flex: 1 },
  step: { display: 'flex', gap: '20px', marginBottom: '30px' },
  stepNum: { minWidth: '40px', height: '40px', background: '#4CAF50', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  howVisual: { flex: 1, height: '350px', background: '#eee', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mockupCard: { background: '#fff', padding: '20px 40px', borderRadius: '15px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  bentoContainer: { width: '700px', background: '#fff', padding: '50px', borderRadius: '35px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
  bentoCard: { background: '#f5f5f7', padding: '30px', borderRadius: '25px', cursor: 'pointer', textAlign: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px' }
};

const _styles = {
  lobbyContainer: { padding: '60px', background: '#F4F1EA', minHeight: '100vh' },
  heroTitle: { fontSize: '2.5rem', fontWeight: '900' },
  logoutBtn: { padding: '10px 15px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  classCard: { background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', cursor: 'pointer' },
  addClassCard: { border: '2px dashed #ccc', borderRadius: '30px', height: '180px', cursor: 'pointer', background: 'transparent' },
  appLayout: { display: 'flex', height: '100vh', background: '#F4F1EA' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '40px' },
  header: { padding: '20px 40px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  groupBtn: { background: '#4CAF50', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  eggTrack: { width: '200px', height: '12px', background: '#eee', borderRadius: '10px', position: 'relative' },
  eggFill: { height: '100%', background: '#4CAF50', borderRadius: '10px' },
  eggIcon: { position: 'absolute', top: '-15px', fontSize: '1.5rem' },
  eggCounter: { position: 'absolute', top: '15px', fontSize: '10px', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: '40px', right: '40px', width: '60px', height: '60px', borderRadius: '50%', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: 'white', padding: '40px', borderRadius: '30px', width: '400px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  avatarPickerContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  mainAvatarPreview: { width: '100px', height: '100px', borderRadius: '50%', background: '#f0f0f0', position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: '#fff', padding: '5px', borderRadius: '50%', cursor: 'pointer' },
  genderToggle: { display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '5px', marginBottom: '20px' },
  genderActive: { flex: 1, background: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold' },
  genderInactive: { flex: 1, background: 'transparent', border: 'none', padding: '8px', color: '#888' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '15px' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
  bigCardOverlay: { position: 'fixed', inset: 0, background: '#fff', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigCardContent: { textAlign: 'center' },
  bigCardAvatar: { width: '250px', borderRadius: '50%' }
};

function getHashRoute() {
  if (window.location.hash.startsWith('#/reset/')) {
    return { page: 'reset', token: window.location.hash.replace('#/reset/', '') };
  }
  if (window.location.hash.startsWith('#/confirm/')) {
    return { page: 'confirm', token: window.location.hash.replace('#/confirm/', '') };
  }
  return { page: null };
}

export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
