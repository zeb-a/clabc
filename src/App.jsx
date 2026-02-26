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
import AssignmentsPage from "./components/AssignmentsPage";
import ErrorBoundary from './components/ErrorBoundary';
import { PageHelpProvider, usePageHelp } from './PageHelpContext';
import HelpChatBubble from './components/HelpChatBubble';
import LessonPlannerPage from './components/lesson-planner/LessonPlannerPage';
import TornadoGameWrapper from './components/TornadoGameWrapper';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import { ToastProvider } from './components/Toast';
import './components/ModalAnimations.css';
import AboutPage from './components/AboutPage';
import FAQPage from './components/FAQPage';
import { useTheme } from './ThemeContext';
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

// Sync current app view to help context (so bubble shows page-relevant help)
function PageHelpViewSyncer({ view }) {
  const { setPageId } = usePageHelp();
  useEffect(() => {
    const map = {
      portal: 'teacher-portal',
      dashboard: 'class-dashboard',
      settings: 'settings-cards',
      egg: 'class-dashboard',
      'lesson-planner': 'lesson-planner',
      torenado: 'games',
      setup: 'teacher-portal'
    };
    setPageId(map[view] || 'teacher-portal');
  }, [view, setPageId]);
  return null;
}

function LoggedInLayout({ view, children }) {
  return (
    <PageHelpProvider>
      <ToastProvider>
        <PageHelpViewSyncer view={view} />
        {children}
        <HelpChatBubble />
      </ToastProvider>
    </PageHelpProvider>
  );
}

// ==========================================
// 3. MAIN APP (THE TRAFFIC CONTROLLER)
// ==========================================
// Check for password reset token BEFORE any hash manipulation
function getHashRoute() {
  const hash = window.location.hash;
  // PocketBase uses /_/#/auth/reset-password/{TOKEN} format for password reset
  if (hash.startsWith('#/auth/reset-password/')) {
    const token = hash.replace('#/auth/reset-password/', '').split('/')[0];
    return { page: 'reset', token };
  }
  // Also handle confirm-password-reset variant (for backwards compatibility)
  if (hash.startsWith('#/auth/confirm-password-reset/')) {
    const token = hash.replace('#/auth/confirm-password-reset/', '').split('/')[0];
    return { page: 'reset', token };
  }
  // PocketBase uses /_/#/auth/confirm-verification/{TOKEN} format
  if (hash.startsWith('#/auth/confirm-verification/')) {
    const token = hash.replace('#/auth/confirm-verification/', '').split('/')[0];
    return { page: 'confirm', token };
  }
  return { page: null };
}

function getPublicRoute() {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname || '/';
  if (path === '/about') return 'about';
  if (path === '/faq') return 'faq';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'home';
}

function App() {
  // Check for special hash routes FIRST (before any hash manipulation)
  const hashRoute = getHashRoute();

  const { isDark } = useTheme();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const [publicRoute, setPublicRoute] = useState(getPublicRoute);

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('classABC_logged_in');
    const token = localStorage.getItem('classABC_pb_token') || localStorage.getItem('classABC_token');
    if (stored && token) {
      return JSON.parse(stored);
    }
    return null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const [openGamesModal, setOpenGamesModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [behaviors, setBehaviors] = useState(() => JSON.parse(localStorage.getItem('classABC_behaviors')) || INITIAL_BEHAVIORS);
  const [activeClassId, setActiveClassId] = useState(null);
  const initialView = (() => {
    const h = (window.location.hash || '#portal').replace(/^#/, '');
    return ['portal', 'dashboard', 'egg', 'settings', 'setup', 'torenado', 'lesson-planner'].includes(h) ? h : 'portal';
  })();
  const [view, setView] = useState(initialView);
  const [viewHistory, setViewHistory] = useState([initialView]);

  // Track the current index in history to prevent conflicts
  const historyRef = useRef(0);

  // Initialize browser history on mount - sync with hash (only when logged in and not on auth routes)
  useEffect(() => {
    // Don't replace hash if we're on a special auth route (password reset or email verification)
    // or when no user is logged in (public landing pages should stay at clean '/' URLs for SEO/SSO)
    if (hashRoute.page || !user) {
      return;
    }
    window.history.replaceState({ view: initialView, appHistoryIndex: 0 }, '', `#${initialView}`);
  }, [hashRoute.page, initialView, user]);

  // Track public SPA route based on pathname for logged-out pages
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setPublicRoute(getPublicRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate with history tracking for swipe-back
  const navigate = (newView) => {
    const prevView = viewHistory[viewHistory.length - 1];
    // Only push to history if it's a new view (not going back)
    if (newView !== prevView) {
      setViewHistory(prev => [...prev, newView]);
      setView(newView);
      window.history.pushState({ view: newView, appHistoryIndex: ++historyRef.current }, '', `#${newView}`);
    }
    // Reset games modal flag when navigating
    if (openGamesModal) {
      setOpenGamesModal(false);
    }
  };

  const handleTorenadoBack = () => navigate('portal');

  // Listen for browser back events (popstate) - This handles swipe-back
  useEffect(() => {
    if (!user) return;
    const handlePopState = (event) => {
      const state = event.state;

      // Check if this is a dashboard modal close (LuckyDraw, Whiteboard, Buzzer)
      if (state && state.dashboardModal) {
        // Dispatch event to close the modal
        window.dispatchEvent(new CustomEvent('modalClose', { detail: state.dashboardModal }));
        return;
      }

      // Check if this is internal dashboard navigation (dashboardViewMode)
      if (state && state.dashboardViewMode) {
        // This is handled by ClassDashboard internally
        // We need to trigger a re-render to let ClassDashboard see the state change
        // Dispatch a custom event that ClassDashboard can listen to
        window.dispatchEvent(new CustomEvent('dashboardViewModeChange', { detail: state.dashboardViewMode }));
        return;
      }

      // Handle app-level navigation
      if (viewHistory.length > 1) {
        // Pop the current view from history
        const newHistory = viewHistory.slice(0, -1);
        const previousView = newHistory[newHistory.length - 1];

        // Update React state
        setViewHistory(newHistory);
        setView(previousView);

        // Replace the browser history to keep app history in sync
        window.history.replaceState({ view: previousView, appHistoryIndex: --historyRef.current }, '', `#${previousView}`);
      } else {
        // If at root, prevent going back to browser homepage
        window.history.replaceState({ view: 'portal', appHistoryIndex: 0 }, '', '#portal');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewHistory]);

  // 1. Add state to track if we are in the assignment studio
  const [isAssignmentStudioOpen, setIsAssignmentStudioOpen] = useState(false);


  const saveTimeoutRef = useRef(null);

  // Check for email verification token in URL
  const verificationToken = useMemo(() => {
    const hash = window.location.hash;
    // PocketBase uses /_/#/auth/confirm-verification/{TOKEN} format
    const match = hash.match(/auth\/confirm-verification\/([^/]+)/);
    return match ? match[1] : null;
  }, []);

  if (verificationToken) {
    return <VerifyEmailPage
      token={verificationToken}
      onSuccess={async () => {
        // Clear verification token from URL
        window.location.hash = '';
        // Set flag that email was just verified
        localStorage.setItem('email_verified', 'true');
        // Redirect to login view - user will be auto-logged in
        window.location.reload();
      }}
      onError={() => {
        window.location.hash = '';
      }}
    />;
  }

// Load classes and behaviors (for both logged in users and when accessed via student portal)
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
            // Clear demo class and flag when user has real classes
            localStorage.removeItem('classABC_demo_shown');
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
    setViewHistory(['portal']);
  };

  const onAddClass = (newClass) => {
    setClasses(prev => {
      // Remove demo class if it exists when adding first real class
      const filtered = prev.filter(c => c.id !== 'demo-class');
      const next = [...filtered, newClass];

      // Clear the demo_shown flag since user now has real classes
      localStorage.removeItem('classABC_demo_shown');

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

  const handleTornadoBack = () => {
    navigate('portal');
  };

  const onSelectClass = (classId) => {
    setActiveClassId(classId);
    navigate('dashboard');
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
        } else {
          // For student portal (no teacher user), load all classes from PocketBase
          try {
            const res = await api.pbRequest('/collections/classes/records?perPage=500');
            const classes = (res.items || []).map(c => ({
              ...c,
              students: typeof c.students === 'string' ? JSON.parse(c.students || '[]') : (c.students || []),
              tasks: typeof c.tasks === 'string' ? JSON.parse(c.tasks || '[]') : (c.tasks || []),
              assignments: typeof c.assignments === 'string' ? JSON.parse(c.assignments || '[]') : (c.assignments || []),
              submissions: typeof c.submissions === 'string' ? JSON.parse(c.submissions || '[]') : (c.submissions || []),
              studentAssignments: typeof c.studentAssignments === 'string' ? JSON.parse(c.studentAssignments || '[]') : (c.studentAssignments || []),
              student_submissions: typeof c.student_submissions === 'string' ? JSON.parse(c.student_submissions || '[]') : (c.student_submissions || []),
              Access_Codes: typeof c.Access_Codes === 'string' ? JSON.parse(c.Access_Codes || '{}') : (c.Access_Codes || {})
            }));
            if (classes && Array.isArray(classes)) {
              setClasses(classes);
            }
          } catch (e) {
            console.warn('Could not load classes for student portal:', e);
          }
          return;
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
            return newClasses;
          });

          // Wait for state update to flush, then save the same newClasses to backend
          setTimeout(async () => {
            try {
              await api.saveClasses(user.email, newClasses, behaviors);
            } catch (error) {
            }
          }, 0);

          // Simulate a notification to students that a new assignment is available
          // This would trigger updates in the student portals

          setIsAssignmentStudioOpen(false);
        }}

      />
    );
  }

  // Handle /reset/:token and /confirm/:token (using hashRoute computed at component start)
  if (hashRoute.page === 'reset') {
    return <PasswordResetPage token={hashRoute.token} onSuccess={() => {
      // Clear the reset hash and set a flag to open login modal
      window.location.hash = '';
      localStorage.setItem('show_login_modal', 'true');
      window.location.reload();
    }} />;
  }
  if (hashRoute.page === 'confirm') {
    return <ConfirmAccountPage token={hashRoute.token} onSuccess={() => { window.location.hash = ''; }} />;
  }

      // Landing page (no user logged in) — no help bubble here
  if (!user) {
    const navigatePublic = (path) => {
      if (typeof window === 'undefined') return;
      if (window.location.pathname === path) return;
      window.history.pushState({}, '', path);
      setPublicRoute(getPublicRoute());
    };

    if (publicRoute === 'about') {
      return (
        <ToastProvider>
          <AboutPage
            isDark={isDark}
            isMobile={isMobile}
            onBack={() => navigatePublic('/')}
          />
        </ToastProvider>
      );
    }

    if (publicRoute === 'faq') {
      return (
        <ToastProvider>
          <FAQPage
            isDark={isDark}
            isMobile={isMobile}
            onBack={() => navigatePublic('/')}
          />
        </ToastProvider>
      );
    }

    if (publicRoute === 'privacy') {
      return (
        <ToastProvider>
          <PrivacyPolicyPage onClose={() => navigatePublic('/')} />
        </ToastProvider>
      );
    }

    if (publicRoute === 'terms') {
      return (
        <ToastProvider>
          <TermsPage onClose={() => navigatePublic('/')} />
        </ToastProvider>
      );
    }

    return (
      <ToastProvider>
        <LandingPage
          onLoginSuccess={onLoginSuccess}
          classes={classes}
          setClasses={setClasses}
          refreshClasses={refreshClasses}
          showSearchGuide={() => {}}
          openModal={(action) => {
            window.dispatchEvent(new CustomEvent('guide-action', { detail: action }));
          }}
          onShowPrivacy={() => navigatePublic('/privacy')}
          onShowTerms={() => navigatePublic('/terms')}
          onShowAbout={() => navigatePublic('/about')}
          onShowFAQ={() => navigatePublic('/faq')}
        />
      </ToastProvider>
    );
  }

  // Profile modal
  if (showProfile) {
    return (
      <LoggedInLayout view={view}>
        <ProfileModal user={user} onSave={async (data) => {
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
    }} onClose={() => setShowProfile(false)} />
      </LoggedInLayout>
    );
  }

  // Portal (list of classes)
  if (view === 'portal') {
    return (
      <LoggedInLayout view={view}>
      <TeacherPortal
        user={user}
        classes={classes}
        onSelectClass={onSelectClass}
        onAddClass={(c) => onAddClass(c)}
        onLogout={onLogout}
        onEditProfile={() => setShowProfile(true)}
        updateClasses={setClasses}
        onOpenTorenado={() => navigate('torenado')}
        onOpenLessonPlanner={() => navigate('lesson-planner')}
        openGamesModal={openGamesModal}
      />
    </LoggedInLayout>
    );
  }

  // Dashboard for a selected class
  if (view === 'dashboard' && activeClass) {
    return (
      <LoggedInLayout view={view}>
        <ClassDashboard
          user={user}
          activeClass={activeClass}
          behaviors={behaviors}
          onBack={() => { setActiveClassId(null); navigate('portal'); }}
          onOpenEggRoad={() => navigate('egg')}
          onOpenSettings={() => navigate('settings')}
          updateClasses={updateClasses}
          refreshClasses={refreshClasses}
          onUpdateBehaviors={(next) => setBehaviors(next)}
          onOpenAssignments={() => setIsAssignmentStudioOpen(true)}
          onOpenGames={() => {
            navigate('portal');
            setOpenGamesModal(true);
          }}
        />
      </LoggedInLayout>
    );
  }

  if (view === 'egg' && activeClass) {
    return (
      <LoggedInLayout view={view}>
        <EggRoad
          classData={activeClass}
          onBack={() => navigate('dashboard')}
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
      </LoggedInLayout>
    );
  }

  if (view === 'settings' && activeClass) {
    return (
      <LoggedInLayout view={view}>
        <SettingsPage
          activeClass={activeClass}
          behaviors={behaviors}
          onBack={() => navigate('dashboard')}
          onUpdateBehaviors={(next) => setBehaviors(next)}
          onUpdateStudents={(nextStudents) => updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, students: nextStudents } : c))}
        />
      </LoggedInLayout>
    );
  }

  if (view === 'setup') {
    return (
      <LoggedInLayout view={view}>
        <SetupWizard onComplete={(newStudents, className) => {
          const newClass = { id: Date.now(), name: className || 'New Class', students: newStudents };
          onAddClass(newClass);
          navigate('portal');
        }} />
      </LoggedInLayout>
    );
  }

  // Torenado game
  if (view === 'torenado') {
    return (
      <LoggedInLayout view={view}>
        <TornadoGameWrapper onBack={handleTorenadoBack} classes={classes} />
      </LoggedInLayout>
    );
  }

  // Lesson Planner
  if (view === 'lesson-planner') {
    return (
      <LoggedInLayout view={view}>
        <LessonPlannerPage
          user={user}
          classes={classes}
          onBack={() => navigate('portal')}
        />
      </LoggedInLayout>
    );
  }

  // Fallback to portal
  return (
    <LoggedInLayout view={view}>
      <TeacherPortal classes={classes} onSelectClass={onSelectClass} onAddClass={onAddClass} onLogout={onLogout} onOpenLessonPlanner={() => navigate('lesson-planner')} />
    </LoggedInLayout>
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

export default function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
