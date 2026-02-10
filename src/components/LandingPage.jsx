import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, GaugeCircle, Dices, BarChart3, Ghost, ClipboardList, QrCode, Timer, Bell, Layout, Settings, Heart, BookOpen, Star, GraduationCap, Users, MessageSquare, Trophy, MoreVertical, LogIn, UserPlus, HelpCircle
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../i18n';
import api from '../services/api';
import ParentPortal from './ParentPortal';
import StudentPortal from './StudentPortal';
// --- THE LOGO COMPONENT ---
import ClassABCLogo from './ClassABCLogo';
import GoogleLoginButton from './GoogleLoginButton';
import './LandingPage.css';
import useWindowSize from '../hooks/useWindowSize';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';

// Small motion-enabled card wrapper. Uses motion values to create a subtle
// tilt + scale on pointer move. Respects prefers-reduced-motion.
function MotionCard({ children, className, style, ...props }) {
  const shouldReduce = useReducedMotion();
  // Dev override: set `VITE_FORCE_MOTION=true` when running the dev server to force animations.
  const forceMotion = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FORCE_MOTION === 'true';

  // Hooks must run unconditionally. Call all hooks first, then return early if reduced-motion is set.
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Slightly snappier springs for a faster response and quicker settle
  // Softer springs for a smoother, forward pop feel
  const sx = useSpring(mx, { stiffness: 300, damping: 24 });
  const sy = useSpring(my, { stiffness: 300, damping: 24 });

  // Amplify amount when developer forces motion for easier debugging.
  const amplify = forceMotion ? 3 : 1;
  // Slightly stronger tilt and pop when not forced; amplified more when forced for debugging
  const rotateY = useTransform(sx, (v) => v * 7 * amplify); // degrees
  const rotateX = useTransform(sy, (v) => -v * 7 * amplify);
  const scale = useTransform(sx, (v) => 1 + Math.min(0.16 * amplify, Math.abs(v) * 0.09 * amplify));

  // Respect prefers-reduced-motion unless developer explicitly forces motion.
  if (shouldReduce && !forceMotion) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const handlePointerLeave = () => {
    setHovered(false);
    mx.set(0);
    my.set(0);
  };

  // Wrap the motion.div in a parent that provides `perspective` so rotateX/rotateY are visually apparent.
  const wrapperStyle = { perspective: '900px', display: 'inline-block' };

  return (
    <div style={wrapperStyle}>
      <motion.div
        className={className}
        style={{
          ...style,
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          pointerEvents: 'auto'
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={() => {
          setHovered(true);
          mx.set(0); my.set(0);
        }}
        whileHover={{ scale: forceMotion ? 1.22 : 1.08 }}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Motion-enabled button to animate hover/press with same spring behavior.
function MotionButton({ children, className, style, ...props }) {
  const shouldReduce = useReducedMotion();
  // Hooks first
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Softer springs for smoother hover/settle
  const sx = useSpring(mx, { stiffness: 220, damping: 24 });
  const sy = useSpring(my, { stiffness: 220, damping: 24 });

  const rotateY = useTransform(sx, (v) => v * 6);
  const rotateX = useTransform(sy, (v) => -v * 6);
  const scale = useTransform(sx, (v) => 1 + Math.min(0.025, Math.abs(v) * 0.025));

  if (shouldReduce) {
    return (
      <button className={className} style={style} {...props}>
        {children}
      </button>
    );
  }

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      className={className}
      style={{ ...style, rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.06 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Check if running in Capacitor (mobile app)
const isCapacitorApp = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

export default function LandingPage({ onLoginSuccess, classes, setClasses, refreshClasses, showSearchGuide, openModal }) {

  // For Capacitor app, default to showing role selection modal
  const [modalMode, setModalMode] = useState(isCapacitorApp ? 'role' : null); // 'role', 'login', 'signup', 'student-login'
  const [modalHistory, setModalHistory] = useState([]); // Track navigation history for swipe-back
  const [portalView, setPortalView] = useState(null); // 'parent' or 'student'
  const isMobile = useWindowSize(768);

  // Navigate with history tracking for swipe-back
  const navigateModal = (newMode) => {
    if (newMode !== modalMode) {
      setModalHistory(prev => [...prev, newMode]);
      setModalMode(newMode);
      window.history.pushState(
        { ...window.history.state, landingModal: newMode },
        '',
        window.location.hash
      );
    }
  };

  // Go back in modal history
  const goBackModal = () => {
    if (modalHistory.length > 0) {
      const newHistory = modalHistory.slice(0, -1);
      const previousMode = newHistory.length > 0 ? newHistory[newHistory.length - 1] : null;
      setModalHistory(newHistory);
      setModalMode(previousMode);
      window.history.pushState(
        { ...window.history.state, landingModal: previousMode },
        '',
        window.location.hash
      );
    }
  };

  // Listen for browser back events on landing page
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;

      if (state && state.landingModal) {
        // Handle modal navigation back
        goBackModal();
      } else if (modalMode) {
        // Close modal if no modal state in history
        setModalMode(null);
        setModalHistory([]);
        window.history.replaceState(
          { ...window.history.state, landingModal: null },
          '',
          window.location.hash
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modalMode, modalHistory]);

  // Use theme from ThemeContext
  const { isDark, switchTheme } = useTheme();

  // Teacher Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student/Parent Access State
  const [accessCode, setAccessCode] = useState('');
  const [studentData, setStudentData] = useState(null);

  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Translation hook must be called unconditionally at top-level
  const { t } = useTranslation();

  React.useEffect(() => {
    if (openModal === 'signup') navigateModal('signup');
    if (openModal === 'login') navigateModal('login');
  }, [openModal]);

  // Handle QR code auto-login from URL hash
  React.useEffect(() => {
    const hash = window.location.hash;
    
    // Check for parent-login/{code}
    const parentMatch = hash.match(/#\/parent-login\/([^/]+)/);
    if (parentMatch && parentMatch[1]) {
      setAccessCode(parentMatch[1]);
      // Auto-trigger parent login
      const handleParentAutoLogin = async () => {
        try {
          const data = await api.getStudentByParentCode(parentMatch[1]);
          if (data) {
            setPortalView('parent');
            setStudentData(data);
            // Clear hash after successful login
            window.location.hash = '';
          } else {
            setError('Invalid Parent Access Code');
            setModalMode('role');
          }
        } catch (err) {
          setError('Connection error. Please try again.');
          setModalMode('role');
        }
      };
      handleParentAutoLogin();
      return;
    }

    // Check for student-login/{code}
    const studentMatch = hash.match(/#\/student-login\/([^/]+)/);
    if (studentMatch && studentMatch[1]) {
      const code = studentMatch[1];
      setAccessCode(code);
      // Auto-trigger student login
      const cleanCode = code.replace(/[^0-9]/g, '');
      if (cleanCode.length === 5) {
        const handleStudentAutoLogin = async () => {
          try {
            let foundStudent = null;
            let foundClass = null;

            // Check local classes first
            if (classes && classes.length > 0) {
              for (const c of classes) {
                const s = c.students?.find(stud => String(stud.accessCode) === cleanCode);
                if (s) {
                  foundStudent = s;
                  foundClass = c;
                  break;
                }
              }
            }

            // If not found locally, ask the API
            if (!foundStudent) {
              const remoteData = await api.getStudentByCode(cleanCode, 'student');
              if (remoteData) {
                foundStudent = {
                  id: remoteData.studentId,
                  name: remoteData.studentName,
                  accessCode: cleanCode
                };
                if (remoteData.classData) {
                  foundClass = remoteData.classData;
                  if (setClasses) {
                    setClasses([remoteData.classData]);
                  }
                }
              }
            }

            if (foundStudent && foundClass) {
              const sessionData = {
                studentId: String(foundStudent.id),
                studentName: foundStudent.name,
                accessCode: cleanCode,
                classId: String(foundClass.id)
              };
              localStorage.setItem('classABC_student_portal', JSON.stringify(sessionData));
              setModalMode(null);
              setPortalView('student');
              // Clear hash after successful login
              window.location.hash = '';
            } else {
              setError('Invalid Student Access Code');
              setModalMode('role');
            }
          } catch (err) {
            setError('Connection error. Please try again.');
            setModalMode('role');
          }
        };
        handleStudentAutoLogin();
      }
    }
  }, [classes, setClasses]);

  // Listen for guide action events
  React.useEffect(() => {
    const handleGuideAction = (e) => {
      const action = e.detail;
      console.log('Guide action received:', action);
      switch(action) {
        case 'signup':
          setModalMode('signup');
          break;
        case 'login':
          setModalMode('role');
          break;
        case 'home':
        case 'dashboard':
        case 'settings':
        case 'attendance':
        case 'assignments':
        case 'luckydraw':
        case 'road':
        case 'whiteboard':
        case 'timer':
        case 'buzzer':
        case 'codes':
        case 'inbox':
        case 'reports':
          // These require logged-in user, just show login role selection
          setModalMode('role');
          break;
        default:
          console.log('Unknown action:', action);
      }
    };

    window.addEventListener('guide-action', handleGuideAction);
    return () => window.removeEventListener('guide-action', handleGuideAction);
  }, []);

  // --- 1. TEACHER AUTH HANDLERS ---
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match. Please check again New Teacher.');
    try {
      await api.register({ email, password, name, title });
      navigateModal('verify-email-info');
      setError('');
    } catch (err) { setError(err.message); }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.login({ email, password });
      if (resp.token) {
        api.setToken(resp.token);
        onLoginSuccess({ ...resp.user, token: resp.token });
      }
    } catch (err) { setError(err.message); }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const resp = await api.loginWithGoogle();
      if (resp?.token) {
        api.setToken(resp.token);
        onLoginSuccess({ ...resp.user, token: resp.token });
      }
    } catch (err) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      await api.forgotPassword(resetEmail);
      setResetSuccess(true);
      setError('');
    } catch (err) {
      setError('Could not send reset email. ' + (err.message || 'Please try again.'));
    }
  };

  // --- 2. STUDENT LOGIN HANDLER (THE FIX) ---
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    // Normalize code input
    const cleanCode = accessCode.replace(/[^0-9]/g, '');

    if (cleanCode.length < 5) return setError('Enter 5-digit code.');
    setLoading(true);

    try {
      // Step A: Check local classes prop first (Fastest)
      let foundStudent = null;
      let foundClass = null;

      if (classes && classes.length > 0) {
        for (const c of classes) {
          const s = c.students?.find(stud => String(stud.accessCode) === cleanCode);
          if (s) {
            foundStudent = s;
            foundClass = c;
            break;
          }
        }
      }

      // Step B: If not found locally, ask the API (Crucial for fresh devices)
      if (!foundStudent) {
        const remoteData = await api.getStudentByCode(cleanCode, 'student');
        if (remoteData) {
          foundStudent = {
            id: remoteData.studentId,
            name: remoteData.studentName,
            accessCode: cleanCode
          };
          // CRITICAL FIX: The API returns the FULL class data. 
          // We must update the global state so StudentPortal can see assignments.
          if (remoteData.classData) {
            foundClass = remoteData.classData;
            // Inject this class into the global app state
            if (setClasses) {
              setClasses([remoteData.classData]);
            }
          }
        }
      }

      if (foundStudent && foundClass) {
        // Step C: Save Session & Switch View
        const sessionData = {
          studentId: String(foundStudent.id),
          studentName: foundStudent.name,
          accessCode: cleanCode,
          classId: String(foundClass.id)
        };

        localStorage.setItem('classABC_student_portal', JSON.stringify(sessionData));
        setLoading(false);
        setModalMode(null); // Close modal
        setPortalView('student'); // Switch to Portal Component
      } else {
        setError('Invalid student code or class not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. RENDER PORTALS BASED ON STATE ---
  if (portalView === 'parent') {
    return <ParentPortal onBack={() => { setPortalView(null); setStudentData(null); }} initialStudentData={studentData} />;
  }

  if (portalView === 'student') {
    return (
      <StudentPortal
        onBack={() => { setPortalView(null); setModalMode('student-login'); }}
        classes={classes}
        setClasses={setClasses}
        refreshClasses={refreshClasses}
      />
    );
  }

  // Only show full landing page content if not in Capacitor app
  if (!isCapacitorApp) {
    return (
      <div style={{ ...modernStyles.container, ...(isDark ? modernStyles.containerDark : {}) }}>
        <div style={{ ...modernStyles.meshBackground, ...(isDark ? modernStyles.meshBackgroundDark : {}) }}></div>

        {/* --- NAVBAR --- */}
        <nav style={{ ...modernStyles.nav, ...(isMobile ? modernStyles.navMobile : {}), ...(isDark ? modernStyles.navDark : {}) }}>
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', position: 'relative' }}>
              <button
                onClick={switchTheme}
                style={{ padding: '8px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.15)' : '#F1F5F9', color: isDark ? '#e5e5e5' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <div style={{ ...modernStyles.logo, flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
                <ClassABCLogo />
              </div>
              <LanguageSelector />
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: isDark ? 'rgba(255,255,255,0.15)' : '#F1F5F9', color: isDark ? '#e5e5e5' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Menu"
                >
                  <MoreVertical size={20} />
                </button>
                {showMobileMenu && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    background: isDark ? '#18181b' : '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                    padding: '8px',
                    minWidth: '180px',
                    zIndex: 1000
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={() => { navigateModal('role'); setShowMobileMenu(false); }}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textAlign: 'left',
                          color: isDark ? '#e5e5e5' : '#1A1A1A',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <LogIn size={18} />
                        <span>{t('auth.login')}</span>
                      </button>
                      <button
                        onClick={() => { navigateModal('signup'); setShowMobileMenu(false); }}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textAlign: 'left',
                          color: isDark ? '#e5e5e5' : '#1A1A1A',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <UserPlus size={18} />
                        <span>{t('nav.signup')}</span>
                      </button>
                      <button
                        onClick={() => { showSearchGuide(); setShowMobileMenu(false); }}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          textAlign: 'left',
                          color: isDark ? '#e5e5e5' : '#1A1A1A',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <HelpCircle size={18} />
                        <span>{t('nav.help')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={modernStyles.logo}>
                <ClassABCLogo />
              </div>
              <div style={modernStyles.navActions}>
                <button
                  onClick={switchTheme}
                  style={{ ...modernStyles.themeToggle, ...(isDark ? modernStyles.themeToggleDark : {}) }}
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <LanguageSelector />
                <button className="lp-nav-link" onClick={showSearchGuide} style={{ ...modernStyles.loginLink, ...(isDark ? modernStyles.loginLinkDark : {}) }}>{t('nav.help')}</button>
                <button className="lp-nav-link" onClick={() => navigateModal('role')} style={{ ...modernStyles.loginLink, ...(isDark ? modernStyles.loginLinkDark : {}) }}>{t('nav.login')}</button>
                <button className="lp-signup-btn" onClick={() => navigateModal('signup')} style={{ ...modernStyles.signupBtn, ...(isDark ? modernStyles.signupBtnDark : {}) }}>{t('nav.signup')}</button>
              </div>
            </>
          )}
        </nav>

        {/* --- HERO SECTION --- */}
        <section style={{ ...modernStyles.heroSection, ...(isMobile ? modernStyles.heroSectionMobile : {}) }}>
        <div style={modernStyles.heroContent}>
          <div style={{ ...modernStyles.tagBadge, ...(isDark ? modernStyles.tagBadgeDark : {}) }}>
            <Star size={14} fill="#4CAF50" color="#4CAF50" />
            {t('hero.tag')}
          </div>
          <h1 style={{ ...modernStyles.heroTitle, ...(isMobile ? modernStyles.heroTitleMobile : {}), ...(isDark ? modernStyles.heroTitleDark : {}) }}>
            {t('hero.title.line1')} <br />
            <span style={modernStyles.gradientText}>{t('hero.title.gradient')}</span>
          </h1>
          <p style={{ ...modernStyles.heroSubText, ...(isMobile ? modernStyles.heroSubTextMobile : {}) }}>{t('hero.subtext')}</p>
          <div style={modernStyles.heroBtnGroup}>
            <MotionButton className="lp-cta" onClick={() => navigateModal('signup')} style={{ ...modernStyles.mainCta, ...(isDark ? modernStyles.mainCtaDark : {}) }}>
              {t('cta.create_class')} <ArrowRight size={18} />
            </MotionButton>
          </div>
        </div>

        {/* --- LIVE APP SIMULATOR --- */}
        <div style={{ ...modernStyles.mockupWrapper, ...(isMobile ? modernStyles.mockupWrapperMobile : {}) }}>
          <div style={{ ...modernStyles.appWindow, ...(isDark ? modernStyles.appWindowDark : {}) }}>
            <div style={{ ...modernStyles.appSidebar, ...(isDark ? modernStyles.appSidebarDark : {}) }}>
              <div style={{ ...modernStyles.sidebarIconActive, ...(isDark ? modernStyles.sidebarIconActiveDark : {}) }}><Layout size={20} /></div>
              <div style={{ ...modernStyles.sidebarIcon, ...(isDark ? modernStyles.sidebarIconDark : {}) }}><Trophy size={20} /></div>
              <div style={{ ...modernStyles.sidebarIcon, ...(isDark ? modernStyles.sidebarIconDark : {}) }}><Settings size={20} /></div>
            </div>
            <div style={{ ...modernStyles.appContent, ...(isDark ? modernStyles.appContentDark : {}) }}>
              <div style={{ ...modernStyles.appHeader, ...(isDark ? modernStyles.appHeaderDark : {}) }}>
                <span style={{ fontWeight: 800, ...(isDark ? { color: '#fff' } : {}) }}>Class 4-B</span>
                <div style={{ ...modernStyles.eggRoadBar, ...(isDark ? modernStyles.eggRoadBarDark : {}) }}>
                  <div style={{ ...modernStyles.eggFill, ...(isDark ? modernStyles.eggFillDark : {}) }}></div>
                  <span style={modernStyles.eggText}>🥚 Progess 85%</span>
                </div>
              </div>
              <div style={{ ...modernStyles.appGrid, ...(isMobile ? modernStyles.appGridMobile : {}) }}>
                {['Pablo', 'Marie', 'Albert', 'Frida', 'Leo', 'Ada'].map((name, i) => (
                  <MotionCard key={i} className="lp-app-card" style={{ ...modernStyles.appCard, ...(isDark ? modernStyles.appCardDark : {}) }}>
                    <div style={{ ...modernStyles.appAvatar, ...(isDark ? modernStyles.appAvatarDark : {}) }}>{name[0]}</div>
                    <div style={{ ...modernStyles.appName, ...(isDark ? modernStyles.appNameDark : {}) }}>{name}</div>
                    <div style={modernStyles.appScore}>+{(i + 2) * 3}</div>
                  </MotionCard>
                ))}
              </div>
              <div style={{ ...modernStyles.appFab, ...(isDark ? modernStyles.appFabDark : {}) }}><Dices size={20} /></div>
            </div>
          </div>
          <div style={modernStyles.blob1}></div>
          <div style={modernStyles.blob2}></div>
        </div>
      </section>

      {/* --- GAMES SECTION --- */}
      <section style={{
        padding: isMobile ? '56px 20px 64px' : '80px 24px 96px',
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
          <h2 style={{
            fontSize: isMobile ? 28 : 36,
            fontWeight: 900,
            margin: 0,
            marginBottom: 12,
            ...(isDark ? { color: '#fff' } : { color: '#0f172a' }),
          }}>
            {t('landing.games.title')}
          </h2>
          <p style={{
            fontSize: isMobile ? 15 : 17,
            margin: 0,
            maxWidth: 560,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
            ...(isDark ? { color: '#94a3b8' } : { color: '#64748b' }),
          }}>
            {t('landing.games.subtitle')}
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: isMobile ? 20 : 24,
          alignItems: 'stretch',
        }}>
          {[
            { id: 'tornado', emoji: '🌪️', gradient: 'linear-gradient(135deg, #4ECDC4, #95E1D3)', nameKey: 'games.tornado', descKey: 'games.tornado.desc' },
            { id: 'faceoff', emoji: '⚡', gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', nameKey: 'games.faceoff', descKey: 'games.faceoff.desc' },
            { id: 'memory', emoji: '🧠', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', nameKey: 'games.memorymatch', descKey: 'games.memorymatch.desc' },
            { id: 'quiz', emoji: '🎯', gradient: 'linear-gradient(135deg, #0EA5E9, #06B6D4)', nameKey: 'games.quiz', descKey: 'games.quiz.desc' },
            { id: 'motorace', emoji: '🏍️', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', nameKey: 'games.motorace', descKey: 'games.motorace.desc' },
          ].map((game) => (
            <MotionCard
              key={game.id}
              className="lp-game-card"
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
                background: isDark ? 'rgba(24,24,27,0.8)' : '#fff',
                boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{
                aspectRatio: '16/10',
                background: game.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{ fontSize: 64, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>{game.emoji}</span>
              </div>
              <div style={{ padding: '20px 18px' }}>
                <h3 style={{
                  margin: '0 0 8px',
                  fontSize: 18,
                  fontWeight: 800,
                  ...(isDark ? { color: '#fff' } : { color: '#0f172a' }),
                }}>
                  {t(game.nameKey)}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.45,
                  ...(isDark ? { color: '#94a3b8' } : { color: '#64748b' }),
                }}>
                  {t(game.descKey)}
                </p>
              </div>
            </MotionCard>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <div style={{ ...modernStyles.bentoGrid, ...(isMobile ? modernStyles.bentoGridMobile : {}) }}>
        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, background: 'linear-gradient(135deg, #F0FDF4 0%, #fff 100%)', ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxGreen, ...(isDark ? modernStyles.iconBoxGreenDark : {}) }}><GaugeCircle size={28} color="#16A34A" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.meter.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.meter.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxOrange, ...(isDark ? modernStyles.iconBoxOrangeDark : {}) }}><Dices size={28} color="#EA580C" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.lucky.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.lucky.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxBlue, ...(isDark ? modernStyles.iconBoxBlueDark : {}) }}><BarChart3 size={28} color="#2563EB" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.reports.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.reports.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxPurple, ...(isDark ? modernStyles.iconBoxPurpleDark : {}) }}><Ghost size={28} color="#7C3AED" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.avatars.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.avatars.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxBlue, ...(isDark ? modernStyles.iconBoxBlueDark : {}) }}><ClipboardList size={28} color="#F59E42" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.studio.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.studio.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxGreen, ...(isDark ? modernStyles.iconBoxGreenDark : {}) }}><QrCode size={28} color="#0EA5E9" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.codes.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.codes.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxOrange, ...(isDark ? modernStyles.iconBoxOrangeDark : {}) }}><Timer size={28} color="#16A34A" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.timer.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.timer.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxBlue, ...(isDark ? modernStyles.iconBoxBlueDark : {}) }}><Bell size={28} color="#F59E42" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.buzzer.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.buzzer.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxPurple, ...(isDark ? modernStyles.iconBoxPurpleDark : {}) }}><Layout size={28} color="#7C3AED" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.whiteboard.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.whiteboard.desc')}</p>
        </MotionCard>

        <MotionCard className="lp-bento-card" style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxGreen, ...(isDark ? modernStyles.iconBoxGreenDark : {}) }}><MessageSquare size={28} color="#16A34A" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.grading.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.grading.desc')}</p>
        </MotionCard>

        <div style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxOrange, ...(isDark ? modernStyles.iconBoxOrangeDark : {}) }}><Users size={28} color="#EA580C" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.mgmt.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.mgmt.desc')}</p>
        </div>

        <div style={{ ...modernStyles.bentoCard, ...(isDark ? modernStyles.bentoCardDark : {}) }}>
          <div style={{ ...modernStyles.iconBoxBlue, ...(isDark ? modernStyles.iconBoxBlueDark : {}) }}><Settings size={28} color="#2563EB" /></div>
          <h3 style={{ ...(isDark ? modernStyles.bentoTitleDark : {}) }}>{t('features.settings.title')}</h3>
          <p style={{ ...modernStyles.bentoText, ...(isDark ? modernStyles.bentoTextDark : {}) }}>{t('features.settings.desc')}</p>
        </div>
      </div>

      {/* --- FOOTER CTA --- */}
      <section style={{ ...modernStyles.ctaSection, ...(isDark ? modernStyles.ctaSectionDark : {}) }}>
        <h2 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '20px', ...(isDark ? { color: '#fff' } : {}) }}>{t('cta.ready')}</h2>
        <MotionButton className="lp-cta" onClick={() => navigateModal('signup')} style={{ ...modernStyles.mainCta, ...(isDark ? modernStyles.mainCtaDark : {}) }}>
          {t('cta.join_today')}
        </MotionButton>
      </section>

      {/* --- MODAL SYSTEM --- */}
      {modalMode && (
        <div style={{ ...modernStyles.overlay, ...(isDark ? modernStyles.overlayDark : {}) }} className="modal-overlay-in">
          <div style={{ ...modernStyles.modernModal, ...(isMobile ? modernStyles.modernModalMobile : {}), ...(isDark ? modernStyles.modernModalDark : {}) }} className="animated-modal-content modal-animate-center">
            <div style={modernStyles.modalHeader}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px' }}>
                  {modalMode === 'role' ? t('modal.who') :
                    modalMode === 'student-login' ? t('role.student') :
                      modalMode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}
                </h2>
              </div>
              <div onClick={() => setModalMode(null)} style={modernStyles.closeBtn}><X size={20} /></div>
            </div>

            {/* 1. ROLE SELECTION */}
            {modalMode === 'role' && (
                <motion.div style={modernStyles.roleGrid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}>
                <motion.div onClick={() => { setError(''); navigateModal('login'); }} className="lp-role-option" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...modernStyles.roleOption, ...(isDark ? modernStyles.roleOptionDark : {}) }}>
                  <div style={{ ...modernStyles.roleIcon, background: isDark ? 'rgba(22, 163, 74, 0.2)' : '#E8F5E9' }}><GraduationCap color="#4CAF50" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.teacher')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.teacher.desc')}</p>
                  </div>
                </motion.div>
                <motion.div onClick={() => setPortalView('parent')} className="lp-role-option" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...modernStyles.roleOption, ...(isDark ? modernStyles.roleOptionDark : {}) }}>
                  <div style={{ ...modernStyles.roleIcon, background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FFF1F2' }}><Heart color="#FF5252" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.parent')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.parent.desc')}</p>
                  </div>
                </motion.div>
                <motion.div onClick={() => { setError(''); navigateModal('student-login'); }} className="lp-role-option" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...modernStyles.roleOption, ...(isDark ? modernStyles.roleOptionDark : {}) }}>
                  <div style={{ ...modernStyles.roleIcon, background: isDark ? 'rgba(20, 184, 166, 0.2)' : '#E0F2F1' }}><BookOpen color="#009688" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.student')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.student.desc')}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 2. STUDENT LOGIN FORM */}
            {modalMode === 'student-login' && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                onSubmit={handleStudentLogin}
                style={{ ...modernStyles.authForm, ...(isMobile ? modernStyles.authFormMobile : {}) }}
              >
                {error && <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="lp-error-banner"
                  style={modernStyles.errorBanner}
                >
                  {error}
                </motion.div>}
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '10px', ...(isDark ? { color: '#a1a1aa' } : {}) }}>{t('student.instructions')}</p>
                <motion.input
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  type="text"
                  maxLength={5}
                  placeholder="0 0 0 0 0"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  style={{
                    ...modernStyles.modernInput,
                    ...(isMobile ? modernStyles.modernInputMobile : {}),
                    ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}),
                    textAlign: 'center',
                    fontSize: isMobile ? '20px' : '24px',
                    letterSpacing: isMobile ? '3px' : '5px',
                    fontWeight: 'bold',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <MotionButton className="lp-cta" type="submit" disabled={loading} style={{ ...modernStyles.mainCtaPrimary, ...(isMobile ? { ...modernStyles.mainCtaMobile, width: '100%' } : {}) }}>
                  {loading ? t('student.verifying') : t('student.enter')}
                </MotionButton>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { setError(''); navigateModal('role'); }}
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', cursor: 'pointer', ...(isDark ? { color: '#a1a1aa' } : {}) }}
                >{t('nav.back')}</motion.p>
              </motion.form>
            )}

            {/* 3. TEACHER AUTH FORMS */}
            {(modalMode === 'signup' || modalMode === 'login') && (
              <form onSubmit={modalMode === 'signup' ? handleSignup : handleTeacherLogin} style={{ ...modernStyles.authForm, ...(isMobile ? modernStyles.authFormMobile : {}) }}>
                {error && <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="lp-error-banner"
                  style={modernStyles.errorBanner}
                >
                  {error}
                </motion.div>}
                {modalMode === 'login' && (
                  <>
                    <GoogleLoginButton
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      text={googleLoading ? t('student.verifying') : t('auth.google_signin')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginTop: '12px', marginBottom: '4px' }}>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                      <span style={{ fontSize: '13px', color: '#64748B', ...(isDark ? { color: '#a1a1aa' } : {}) }}>{t('auth.or')}</span>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                    </div>
                  </>
                )}
                {modalMode === 'signup' && (
                  <>
                    <GoogleLoginButton
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      text={googleLoading ? t('student.verifying') : t('auth.google_signup')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginTop: '12px', marginBottom: '4px' }}>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                      <span style={{ fontSize: '13px', color: '#64748B', ...(isDark ? { color: '#a1a1aa' } : {}) }}>{t('auth.or')}</span>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                    </div>
                  </>
                )}
                {modalMode === 'signup' && (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                    <select
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      style={{
                        ...modernStyles.modernInput,
                        ...(isMobile ? modernStyles.modernInputMobile : {}),
                        ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}),
                        width: '90px',
                        minWidth: '90px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">--</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                    <input
                      placeholder={t('auth.fullname')}
                      style={{
                        ...modernStyles.modernInput,
                        ...(isMobile ? modernStyles.modernInputMobile : {}),
                        ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}),
                        flex: 1,
                        minWidth: 0,
                        boxSizing: 'border-box'
                      }}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <input type="email" placeholder={t('auth.email')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), width: '100%', boxSizing: 'border-box' }} onChange={e => setEmail(e.target.value)} required />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <input type="password" placeholder={t('auth.password')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), flex: isMobile ? '1' : 1, minWidth: '100%', boxSizing: 'border-box' }} onChange={e => setPassword(e.target.value)} required />
                </div>
                {modalMode === 'signup' && <input type="password" placeholder={t('auth.confirm')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), width: '100%', boxSizing: 'border-box' }} onChange={e => setConfirmPassword(e.target.value)} required />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <MotionButton className="lp-cta" type="submit" style={{
                    ...(modalMode === 'signup' ? { ...modernStyles.mainCtaPrimary, ...(isDark ? modernStyles.mainCtaPrimaryDark : {}), width: '100%' } : { ...modernStyles.mainCtaSecondary, ...(isDark ? modernStyles.mainCtaSecondaryDark : {}), width: 'auto' }),
                    ...(isMobile ? { ...modernStyles.mainCtaMobile, flex: '1' } : {})
                  }}>
                    {modalMode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}
                  </MotionButton>
                  {modalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setError(''); setResetEmail(email); navigateModal('forgot-password'); }}
                      style={{
                        fontSize: '13px',
                        color: '#64748B',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        ...(isDark ? { color: '#a1a1aa' } : {}),
                        marginTop: isMobile ? '8px' : '0'
                      }}
                    >
                      {t('auth.forgot')}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '14px', color: '#64748B', ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                  <span>{modalMode === 'signup' ? t('auth.already') : t('auth.newhere')}</span>
                  <motion.button
                    type="button"
                    onClick={() => { setError(''); navigateModal(modalMode === 'signup' ? 'login' : 'signup'); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: isDark ? '#fafafa' : '#2D2D30',
                      color: isDark ? '#09090b' : '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {modalMode === 'signup' ? (
                      <>
                        {t('auth.login')} <ArrowRight size={14} />
                      </>
                    ) : (
                      <>
                        <GraduationCap size={14} /> {t('auth.create_account')}
                      </>
                    )}
                  </motion.button>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { setError(''); setModalMode('role'); }}
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', cursor: 'pointer', marginTop: '12px', ...(isDark ? { color: '#a1a1aa' } : {}) }}
                >{t('nav.back')}</motion.p>
              </form>
            )}

            {/* 4. FORGOT PASSWORD FORM */}
            {modalMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} style={{ ...modernStyles.authForm, ...(isMobile ? modernStyles.authFormMobile : {}) }}>
                {error && <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="lp-error-banner"
                  style={modernStyles.errorBanner}
                >
                  {error}
                </motion.div>}

                {resetSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    style={{ padding: 32, textAlign: 'center' }}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 0-20 0v-2a10 10 0 0 1 20 0v-2a10 10 0 1 1 20 0v2a10 10 0 1 0-20 0v-2a10 10 0 0 1 20 0v-2a10 10 0 0 1 20 0v2a10 10 0 1 0-20 0v-2a10 10 0 0 1 20 0v2z" />
                        <polyline points="22 12 18 12 2 7 12" />
                        <polyline points="22 6 18 12 2 7 12" />
                      </svg>
                    </div>
                    <h3 style={{ color: '#16A34A', marginBottom: 12, fontSize: '20px' }}>Check your email!</h3>
                    <p style={{ fontSize: '16px', color: '#64748B', marginBottom: 24, ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                      We've sent a password reset link to <strong>{resetEmail}</strong>
                    </p>
                    <MotionButton
                      type="button"
                      onClick={() => { setResetSuccess(false); setResetEmail(''); navigateModal('login'); }}
                      style={{ ...modernStyles.mainCtaSecondary, ...(isDark ? modernStyles.mainCtaSecondaryDark : {}) }}
                    >
                      Login
                    </MotionButton>
                  </motion.div>
                ) : (
                  <>
                    <p style={{ fontSize: '14px', color: '#64748B', marginBottom: 20, ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                      Enter your email and we'll send you a link to reset your password.
                    </p>
                    <input
                      type="email"
                      placeholder={t('auth.email')}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ ...modernStyles.mainCtaAccent, ...(isDark ? modernStyles.mainCtaAccentDark : {}), width: 'auto', minWidth: '140px' }}
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => { setError(''); setResetEmail(''); navigateModal('login'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          ...modernStyles.mainCtaGhost,
                          ...(isDark ? modernStyles.mainCtaGhostDark : {}),
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          gap: '4px',
                          boxShadow: 'none'
                        }}
                      >
                        <ArrowLeft size={12} /> Login
                      </motion.button>
                    </div>
                  </>
                )}
              </form>
            )}

            {modalMode === 'verify-email-info' && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <h2 style={{ color: '#4CAF50', marginBottom: 16 }}>{t('auth.account_created') || 'Account Created!'}</h2>
                <p style={{ fontSize: 16, marginBottom: 16, ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                  {t('auth.verify_msg') || 'Please check your email and click the verification link to activate your account.'}<br />
                  {t('auth.verify_block') || 'You will not be able to log in until your email is verified.'}
                </p>
                <button onClick={() => { setError(''); navigateModal('login'); }} style={{ ...modernStyles.mainCta, marginTop: 16, ...(isDark ? modernStyles.mainCtaDark : {}) }}>{t('auth.goto_login') || 'Go to Login'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    );
  }

  // For Capacitor app: show only the modal (no landing page content)
  return (
    <div style={{ ...modernStyles.container, alignItems: 'center', justifyContent: 'center', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      <div style={modernStyles.meshBackground}></div>

      {/* --- FULLSCREEN MODAL FOR CAPACITOR (no overlay, no close button) --- */}
      <div style={{
        ...modernStyles.modernModal,
        ...(isMobile ? modernStyles.modernModalMobile : {}),
        ...(isDark ? modernStyles.modernModalDark : {}),
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        borderRadius: 0,
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Modal header - no close button for Capacitor */}
        <div style={{ ...modernStyles.modalHeader, marginBottom: '30px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            {/* Language selector only on role selection */}
            {modalMode === 'role' && <LanguageSelector />}
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: '20px', ...(isDark ? { color: '#f4f4f5' } : {}) }}>
              {modalMode === 'role' ? t('modal.who') :
                modalMode === 'student-login' ? t('role.student') :
                  modalMode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}
            </h2>
          </div>
        </div>

            {/* 1. ROLE SELECTION */}
            {modalMode === 'role' && (
                <motion.div style={modernStyles.roleGrid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}>
                <motion.div onClick={() => { setError(''); navigateModal('login'); }} className="lp-role-option" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...modernStyles.roleOption, ...(isDark ? modernStyles.roleOptionDark : {}) }}>
                  <div style={{ ...modernStyles.roleIcon, background: isDark ? 'rgba(22, 163, 74, 0.2)' : '#E8F5E9' }}><GraduationCap color="#4CAF50" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.teacher')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.teacher.desc')}</p>
                  </div>
                </motion.div>
                <motion.div onClick={() => setPortalView('parent')} className="lp-role-option" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...modernStyles.roleOption, ...(isDark ? modernStyles.roleOptionDark : {}) }}>
                  <div style={{ ...modernStyles.roleIcon, background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FFF1F2' }}><Heart color="#FF5252" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.parent')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.parent.desc')}</p>
                  </div>
                </motion.div>
                <motion.div onClick={() => { setError(''); navigateModal('student-login'); }} className="lp-role-option" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...modernStyles.roleOption, ...(isDark ? modernStyles.roleOptionDark : {}) }}>
                  <div style={{ ...modernStyles.roleIcon, background: isDark ? 'rgba(20, 184, 166, 0.2)' : '#E0F2F1' }}><BookOpen color="#009688" /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{t('role.student')}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>{t('role.student.desc')}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 2. STUDENT LOGIN FORM */}
            {modalMode === 'student-login' && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                onSubmit={handleStudentLogin}
                style={{ ...modernStyles.authForm, ...(isMobile ? modernStyles.authFormMobile : {}) }}
              >
                {error && <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="lp-error-banner"
                  style={modernStyles.errorBanner}
                >
                  {error}
                </motion.div>}
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '10px', ...(isDark ? { color: '#a1a1aa' } : {}) }}>{t('student.instructions')}</p>
                <motion.input
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  type="text"
                  maxLength={5}
                  placeholder="0 0 0 0 0"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  style={{
                    ...modernStyles.modernInput,
                    ...(isMobile ? modernStyles.modernInputMobile : {}),
                    ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}),
                    textAlign: 'center',
                    fontSize: isMobile ? '20px' : '24px',
                    letterSpacing: isMobile ? '3px' : '5px',
                    fontWeight: 'bold',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
                <MotionButton className="lp-cta" type="submit" disabled={loading} style={{ ...modernStyles.mainCtaPrimary, ...(isMobile ? { ...modernStyles.mainCtaMobile, width: '100%' } : {}) }}>
                  {loading ? t('student.verifying') : t('student.enter')}
                </MotionButton>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { setError(''); navigateModal('role'); }}
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', cursor: 'pointer', ...(isDark ? { color: '#a1a1aa' } : {}) }}
                >{t('nav.back')}</motion.p>
              </motion.form>
            )}

            {/* 3. TEACHER AUTH FORMS */}
            {(modalMode === 'signup' || modalMode === 'login') && (
              <form onSubmit={modalMode === 'signup' ? handleSignup : handleTeacherLogin} style={{ ...modernStyles.authForm, ...(isMobile ? modernStyles.authFormMobile : {}) }}>
                {error && <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="lp-error-banner"
                  style={modernStyles.errorBanner}
                >
                  {error}
                </motion.div>}
                {modalMode === 'login' && (
                  <>
                    <GoogleLoginButton
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      text={googleLoading ? t('student.verifying') : t('auth.google_signin')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginTop: '12px', marginBottom: '4px' }}>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                      <span style={{ fontSize: '13px', color: '#64748B', ...(isDark ? { color: '#a1a1aa' } : {}) }}>{t('auth.or')}</span>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                    </div>
                  </>
                )}
                {modalMode === 'signup' && (
                  <>
                    <GoogleLoginButton
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      text={googleLoading ? t('student.verifying') : t('auth.google_signup')}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginTop: '12px', marginBottom: '4px' }}>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                      <span style={{ fontSize: '13px', color: '#64748B', ...(isDark ? { color: '#a1a1aa' } : {}) }}>{t('auth.or')}</span>
                      <span style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0' }} />
                    </div>
                  </>
                )}
                {modalMode === 'signup' && (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                    <select
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      style={{
                        ...modernStyles.modernInput,
                        ...(isMobile ? modernStyles.modernInputMobile : {}),
                        ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}),
                        width: '90px',
                        minWidth: '90px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">--</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                    <input
                      placeholder={t('auth.fullname')}
                      style={{
                        ...modernStyles.modernInput,
                        ...(isMobile ? modernStyles.modernInputMobile : {}),
                        ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}),
                        flex: 1,
                        minWidth: 0,
                        boxSizing: 'border-box'
                      }}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <input type="email" placeholder={t('auth.email')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), width: '100%', boxSizing: 'border-box' }} onChange={e => setEmail(e.target.value)} required />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <input type="password" placeholder={t('auth.password')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), flex: isMobile ? '1' : 1, minWidth: '100%', boxSizing: 'border-box' }} onChange={e => setPassword(e.target.value)} required />
                </div>
                {modalMode === 'signup' && <input type="password" placeholder={t('auth.confirm')} style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), width: '100%', boxSizing: 'border-box' }} onChange={e => setConfirmPassword(e.target.value)} required />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                  <MotionButton className="lp-cta" type="submit" style={{
                    ...(modalMode === 'signup' ? { ...modernStyles.mainCtaPrimary, ...(isDark ? modernStyles.mainCtaPrimaryDark : {}), width: '100%' } : { ...modernStyles.mainCtaSecondary, ...(isDark ? modernStyles.mainCtaSecondaryDark : {}), width: 'auto' }),
                    ...(isMobile ? { ...modernStyles.mainCtaMobile, flex: '1' } : {})
                  }}>
                    {modalMode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}
                  </MotionButton>
                  {modalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setError(''); setResetEmail(email); navigateModal('forgot-password'); }}
                      style={{
                        fontSize: '13px',
                        color: '#64748B',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        ...(isDark ? { color: '#a1a1aa' } : {}),
                        marginTop: isMobile ? '8px' : '0'
                      }}
                    >
                      {t('auth.forgot')}
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '14px', color: '#64748B', ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                  <span>{modalMode === 'signup' ? t('auth.already') : t('auth.newhere')}</span>
                  <motion.button
                    type="button"
                    onClick={() => { setError(''); navigateModal(modalMode === 'signup' ? 'login' : 'signup'); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: isDark ? '#fafafa' : '#2D2D30',
                      color: isDark ? '#09090b' : '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {modalMode === 'signup' ? (
                      <>
                        {t('auth.login')} <ArrowRight size={14} />
                      </>
                    ) : (
                      <>
                        <GraduationCap size={14} /> {t('auth.create_account')}
                      </>
                    )}
                  </motion.button>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { setError(''); setModalMode('role'); }}
                  whileHover={{ scale: 1.05 }}
                  style={{ textAlign: 'center', fontSize: '13px', color: '#94A3B8', cursor: 'pointer', marginTop: '12px', ...(isDark ? { color: '#a1a1aa' } : {}) }}
                >{t('nav.back')}</motion.p>
              </form>
            )}

            {/* 4. FORGOT PASSWORD FORM */}
            {modalMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} style={{ ...modernStyles.authForm, ...(isMobile ? modernStyles.authFormMobile : {}) }}>
                {error && <motion.div
                  key={error}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                  className="lp-error-banner"
                  style={modernStyles.errorBanner}
                >
                  {error}
                </motion.div>}

                {resetSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                    style={{ padding: 32, textAlign: 'center' }}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 0-20 0v-2a10 10 0 0 1 20 0v-2a10 10 0 1 1 20 0v2a10 10 0 1 0-20 0v-2a10 10 0 0 1 20 0v-2a10 10 0 0 1 20 0v2a10 10 0 1 0-20 0v-2a10 10 0 0 1 20 0v2z" />
                        <polyline points="22 12 18 12 2 7 12" />
                        <polyline points="22 6 18 12 2 7 12" />
                      </svg>
                    </div>
                    <h3 style={{ color: '#16A34A', marginBottom: 12, fontSize: '20px' }}>Check your email!</h3>
                    <p style={{ fontSize: '16px', color: '#64748B', marginBottom: 24, ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                      We've sent a password reset link to <strong>{resetEmail}</strong>
                    </p>
                    <MotionButton
                      type="button"
                      onClick={() => { setResetSuccess(false); setResetEmail(''); navigateModal('login'); }}
                      style={{ ...modernStyles.mainCtaSecondary, ...(isDark ? modernStyles.mainCtaSecondaryDark : {}) }}
                    >
                      Login
                    </MotionButton>
                  </motion.div>
                ) : (
                  <>
                    <p style={{ fontSize: '14px', color: '#64748B', marginBottom: 20, ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                      Enter your email and we'll send you a link to reset your password.
                    </p>
                    <input
                      type="email"
                      placeholder={t('auth.email')}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{ ...modernStyles.modernInput, ...(isMobile ? modernStyles.modernInputMobile : {}), ...(isDark ? { background: '#27272a', borderColor: 'rgba(255,255,255,0.1)', color: '#f4f4f5' } : {}), width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ ...modernStyles.mainCtaAccent, ...(isDark ? modernStyles.mainCtaAccentDark : {}), width: 'auto', minWidth: '140px' }}
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => { setError(''); setResetEmail(''); navigateModal('login'); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          ...modernStyles.mainCtaGhost,
                          ...(isDark ? modernStyles.mainCtaGhostDark : {}),
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          gap: '4px',
                          boxShadow: 'none'
                        }}
                      >
                        <ArrowLeft size={12} /> Login
                      </motion.button>
                    </div>
                  </>
                )}
              </form>
            )}

            {modalMode === 'verify-email-info' && (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <h2 style={{ color: '#4CAF50', marginBottom: 16 }}>{t('auth.account_created') || 'Account Created!'}</h2>
                <p style={{ fontSize: 16, marginBottom: 16, ...(isDark ? { color: '#a1a1aa' } : {}) }}>
                  {t('auth.verify_msg') || 'Please check your email and click the verification link to activate your account.'}<br />
                  {t('auth.verify_block') || 'You will not be able to log in until your email is verified.'}
                </p>
                <button onClick={() => { setError(''); navigateModal('login'); }} style={{ ...modernStyles.mainCta, marginTop: 16, ...(isDark ? modernStyles.mainCtaDark : {}) }}>{t('auth.goto_login') || 'Go to Login'}</button>
              </div>
            )}
        </div>
    </div>
  );
}

// --- MODERN 2026 STYLES ---
const modernStyles = {
  container: { background: '#fff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1A1A1A', overflowX: 'hidden', paddingTop: 0 },
  containerDark: { background: '#09090b', color: '#f4f4f5', paddingTop: 0 },
  meshBackground: { position: 'fixed', inset: 0, background: 'radial-gradient(at 0% 0%, rgba(76, 175, 80, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.08) 0, transparent 50%)', zIndex: -1 },
  nav: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(252, 252, 252, 0.68)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(0,0,0,0.04)' },
  navDark: { background: 'rgba(24, 24, 27, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  // logoTag: { background: '#1A1A1A', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '8px', marginLeft: '8px', fontWeight: 700 },
  navActions: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' },
  themeToggle: { background: 'none', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', color: '#64748B', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  themeToggleDark: { background: 'rgba(255,255,255,0.1)', color: '#f4f4f5' },
  loginLink: { background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px', padding: '8px 12px', borderRadius: '8px' },
  loginLinkDark: { color: '#f4f4f5' },
  signupBtn: { background: '#2D2D30', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' },
  signupBtnDark: { background: '#fafafa', color: '#09090b' },
  heroSection: { display: 'flex', alignItems: 'center', gap: '60px', padding: '38px 60px', maxWidth: '1400px', margin: '0 auto', minHeight: '520px' },
  heroContent: { flex: 1 },
  tagBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#15803D', padding: '8px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: 700, marginBottom: '25px', boxShadow: '0 4px 10px rgba(76, 175, 80, 0.1)' },
  tagBadgeDark: { background: 'rgba(22, 163, 74, 0.2)', color: '#4ade80' },
  heroTitle: { fontSize: '72px', fontWeight: 950, lineHeight: 1, letterSpacing: '-2px', margin: 0, color: '#09090bff' },
  heroTitleDark: { color: '#fafafaff' },
  gradientText: { background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubText: { fontSize: '18px', color: '#64748B', maxWidth: '520px', margin: '30px 0', lineHeight: 1.6 },
  heroSubTextDark: { color: '#a1a1aa' },
  heroBtnGroup: { display: 'flex', gap: '15px' },
  mockupWrapper: { flex: 1.2, position: 'relative', display: 'flex', justifyContent: 'center' },
  appWindow: { width: '100%', maxWidth: '650px', height: '400px', background: '#fff', borderRadius: '24px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)', display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 },
  appWindowDark: { background: '#18181b', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' },
  appSidebar: { width: '70px', background: '#F8FAFC', borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: '20px' },
  appSidebarDark: { background: '#27272a', borderRight: '1px solid rgba(255,255,255,0.1)' },
  sidebarIconActive: { color: '#16A34A', background: '#DCFCE7', padding: '10px', borderRadius: '12px' },
  sidebarIconActiveDark: { background: 'rgba(22, 163, 74, 0.2)', color: '#4ade80' },
  sidebarIcon: { color: '#94A3B8', padding: '10px' },
  sidebarIconDark: { color: '#a1a1aa' },
  appContent: { flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' },
  appContentDark: { background: '#18181b' },
  appHeader: { padding: '15px 25px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  appHeaderDark: { borderBottom: '1px solid rgba(255,255,255,0.1)' },
  eggRoadBar: { background: '#F0FDF4', padding: '6px 15px', borderRadius: '20px', width: '200px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' },
  eggRoadBarDark: { background: 'rgba(22, 163, 74, 0.15)' },
  eggFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '85%', background: '#4CAF50', opacity: 0.2 },
  eggFillDark: { background: '#4ade80', opacity: 0.3 },
  eggText: { fontSize: '11px', fontWeight: 800, color: '#15803D', zIndex: 1, width: '100%', textAlign: 'center' },
  appGrid: { padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', overflow: 'hidden' },
  appCard: { border: '1px solid #E2E8F0', borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  appCardDark: { background: '#27272a', border: '1px solid rgba(255,255,255,0.1)' },
  appAvatar: { width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748B' },
  appAvatarDark: { background: 'rgba(255,255,255,0.05)', color: '#a1a1aa' },
  appName: { fontSize: '12px', fontWeight: 700 },
  appNameDark: { color: '#f4f4f5' },
  appScore: { background: '#DCFCE7', color: '#15803D', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' },
  appFab: { position: 'absolute', bottom: '20px', right: '20px', width: '50px', height: '50px', background: '#2D2D30', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
  appFabDark: { background: '#fafafa', color: '#09090b' },
  blob1: { position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, #BBF7D0 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, opacity: 0.6 },
  blob2: { position: 'absolute', bottom: '-50px', left: '0px', width: '250px', height: '250px', background: 'radial-gradient(circle, #BFDBFE 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, opacity: 0.6 },
  section: { padding: '100px 60px', maxWidth: '1300px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '60px' },
  sectionTitle: { fontSize: '42px', fontWeight: 900, marginBottom: '15px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' },
  bentoCard: { background: '#fff', border: '1px solid #E2E8F0', padding: '40px', borderRadius: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', cursor: 'default' },
  bentoCardDark: { background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' },
  bentoTitleDark: { color: '#f4f4f5' },
  bentoTextDark: { color: '#a1a1aa' },
  iconBoxGreen: { width: '60px', height: '60px', background: '#DCFCE7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxGreenDark: { background: 'rgba(22, 163, 74, 0.2)' },
  iconBoxOrange: { width: '60px', height: '60px', background: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxOrangeDark: { background: 'rgba(234, 88, 12, 0.2)' },
  iconBoxBlue: { width: '60px', height: '60px', background: '#DBEAFE', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxBlueDark: { background: 'rgba(37, 99, 235, 0.2)' },
  iconBoxPurple: { width: '60px', height: '60px', background: '#F3E8FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  iconBoxPurpleDark: { background: 'rgba(124, 58, 237, 0.2)' },
  bentoText: { fontSize: '15px', fontWeight: 600, color: '#64748B', lineHeight: 1.6, marginTop: '10px' },
  ctaSection: { textAlign: 'center', padding: '0 20px 100px' },
  ctaSectionDark: { color: '#f4f4f5' },
  mainCta: { width: '100%', background: '#2D2D30', color: '#fff', border: 'none', padding: '18px 36px', borderRadius: '16px', fontSize: '20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center',justifyContent: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  mainCtaDark: { background: '#fafafa', color: '#09090b' },
  // Different button styles for 2026 design
  mainCtaPrimary: { width: '100%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' },
  mainCtaPrimaryDark: { background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' },
  mainCtaSecondary: { background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' },
  mainCtaSecondaryDark: { background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' },
  mainCtaAccent: { background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)' },
  mainCtaAccentDark: { background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' },
  mainCtaGhost: { background: 'transparent', border: '2px solid #2D2D30', color: '#2D2D30', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' },
  mainCtaGhostDark: { border: '2px solid #fafafa', color: '#fafafa' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  overlayDark: { background: 'rgba(0,0,0,0.7)' },
  modernModal: { width: '480px', background: '#fff', borderRadius: '32px', padding: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' },
  modernModalDark: { background: '#18181b', border: '1px solid rgba(255,255,255,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  closeBtn: { padding: '12px', background: '#F1F5F9', borderRadius: '50%', cursor: 'pointer', color: '#1A1A1A', fontWeight: 'bold', fontSize: '18px' },
  closeBtnDark: { background: 'rgba(255,255,255,0.2)', color: '#f4f4f5' },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  roleOption: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderRadius: '20px', background: '#fff', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' },
  roleOptionDark: { background: '#18181b', borderColor: 'rgba(255,255,255,0.1)' },
  roleIcon: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  modernInput: { padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', outline: 'none', color: '#1A1A1A' },
  modernInputDark: { background: '#27272a', border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f5' },
  errorBanner: {
    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
    color: '#DC2626',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'center',
    border: '2px solid #FCA5A5',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
    position: 'relative',
    overflow: 'hidden'
  },
  logoMobile: { maxWidth: '240px' },
  // Mobile specific variants
  navMobile: { padding: '12px 16px', flexWrap: 'wrap' },
  signupBtnMobile: { padding: '8px 12px', borderRadius: '8px', fontSize: '13px' },
  heroSectionMobile: { flexDirection: 'column', padding: '25px 20px', minHeight: 'auto' },
  heroTitleMobile: { fontSize: '34px', lineHeight: 1.05 },
  heroSubTextMobile: { fontSize: '15px', maxWidth: '100%', margin: '12px 0' },
  mockupWrapperMobile: { display: 'none' },
  appGridMobile: { gridTemplateColumns: 'repeat(2, 1fr)' },
  bentoGridMobile: { gridTemplateColumns: 'repeat(1, 1fr)' },
  bentoCardMobile: { padding: '20px', borderRadius: '18px' },
  modernModalMobile: {
    width: 'calc(100% - 32px)',
    maxWidth: '400px',
    padding: '24px 20px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  authFormMobile: { maxWidth: '100%', width: '100%', boxSizing: 'border-box' },
  modernInputMobile: {
    padding: '14px 12px',
    borderRadius: '12px',
    fontSize: '15px',
    width: '100%',
    boxSizing: 'border-box'
  },
  mainCtaMobile: { padding: '12px 18px', fontSize: '14px' },
};