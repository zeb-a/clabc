/* eslint-disable no-unused-vars */
/* eslint-disable no-dupe-keys */
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Dices, Trophy, Settings, Home, UserPlus, Camera, SmilePlus,
  Sliders, ChevronDown, ArrowUpDown,
  CheckSquare, BarChart2, QrCode, ClipboardList, Maximize, Minimize, MessageSquare, Clock, CheckCircle, Siren, Zap, MoreVertical, X, Check, Users,
  Menu, X as CloseIcon
} from 'lucide-react';

import ReportsPage from './ReportsPage';
import StudentCard from './StudentCard';
import BehaviorModal from './BehaviorModal';
import LuckyDrawModal from './LuckyDrawModal';
import AddStudentModal from './AddStudentModal';
import SafeAvatar from './SafeAvatar';
import { PointAnimation } from './PointAnimation';
import { boringAvatar, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import api from '../services/api';
import InboxPage from './InboxPage'; // ⚡ NEW IMPORT: Ensure this file exists
import KidTimer from './KidTimer';
import Whiteboard from './Whiteboard'; // Import the new component
import { Presentation } from 'lucide-react'; // Wide board icon
import AssignmentsPage from './AssignmentsPage'; // Add this line at the top
import AccessCodesPage from './AccessCodesPage'; // Add this line
import SettingsPage from './SettingsPage';
import PointsHistoryView from './PointsHistoryView';
import EggRoad from './EggRoad';
import { useTranslation } from '../i18n';
import { usePageHelp } from '../PageHelpContext';
import { useTheme } from '../ThemeContext';

// Helper function for documentation of clamp usage in inline styles
const clamp = (min, val, max) => val;

// Helper component for Sidebar Icons
const SidebarIcon = ({ icon: Icon, label, onClick, isActive, badge, style, dataNavbarIcon }) => {
  const [hovered, setHovered] = React.useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  // Desktop: icon + text inline, Mobile: icon only with tooltip
  if (isMobile) {
    return (
      <div
        style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', padding: '6px 0', boxSizing: 'border-box' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          onClick={handleClick}
          data-navbar-icon={dataNavbarIcon}
          role="button"
          tabIndex={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 10,
            background: hovered ? '#F8FAFC' : 'transparent',
            boxShadow: hovered ? '0 8px 20px rgba(2,6,23,0.08)' : 'none',
            transform: hovered ? 'translateY(-3px) scale(1.03)' : 'translateY(0) scale(1)',
            transition: 'all 180ms ease',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Icon style={{ ...style, color: isActive ? '#4CAF50' : style?.color || '#636E72' }} />
        </div>
        {badge && (
          <div style={{ position: 'absolute', top: '0', right: '8px', pointerEvents: 'none', zIndex: 2 }}>
            {badge}
          </div>
        )}
        {hovered && (
          <div style={{
            position: 'absolute',
            left: '72px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#2D3436',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            zIndex: 2000,
            whiteSpace: 'nowrap',
            fontSize: '14px',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {label}
          </div>
        )}
      </div>
    );
  } else {
  // Desktop: icon + text inline
  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', padding: '6px 12px', boxSizing: 'border-box' }}
    >
      <div
        onClick={handleClick}
        data-navbar-icon={dataNavbarIcon}
        data-active={isActive ? 'true' : undefined}
        role="button"
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          background: isActive ? '#E8F5E9' : (hovered ? '#F8FAFC' : 'transparent'),
          boxShadow: hovered ? '0 4px 12px rgba(2,6,23,0.06)' : 'none',
          transition: 'all 180ms ease',
          cursor: 'pointer',
          border: isActive ? '1px solid #4CAF50' : 'none',
          position: 'relative',
          zIndex: 1
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Icon style={{ ...style, color: isActive ? '#4CAF50' : style?.color || '#636E72', flexShrink: 0 }} />
        <span style={{
          fontSize: '13px',
          fontWeight: 500,
          color: isActive ? '#2E7D32' : '#374151',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </span>
      </div>
      {badge && (
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          {badge}
        </div>
      )}
    </div>
  );
}
};

// Advanced Animated Hamburger Icon Component
const AnimatedHamburger = ({ isOpen, ...props }) => {
  return (
    <div
      {...props}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...props.style
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top line - becomes \ side of X when open */}
        <line
          x1="5"
          y1="6"
          x2="19"
          y2="6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'translate(0, 6px) rotate(45deg)' : 'translate(0, 0) rotate(0deg)',
            transformOrigin: '12px 6px',
            opacity: 1
          }}
        />
        {/* Middle line - fades out */}
        <line
          x1="5"
          y1="12"
          x2="19"
          y2="12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isOpen ? 0 : 1
          }}
        />
        {/* Bottom line - becomes / side of X when open */}
        <line
          x1="5"
          y1="18"
          x2="19"
          y2="18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'translate(0, -6px) rotate(-45deg)' : 'translate(0, 0) rotate(0deg)',
            transformOrigin: '12px 18px',
            opacity: 1
          }}
        />
      </svg>
    </div>
  );
};

  // Reusable icon button with hover tooltip (for header controls)
const IconButton = React.forwardRef(({ title, onClick, children, style }, ref) => {
  const [hovered, setHovered] = React.useState(false);
  const [tooltipPos, setTooltipPos] = React.useState({ left: 0, top: 0 });
  const localRef = React.useRef(null);

  // support forwarded ref while keeping a local ref for measurements
  const setRefs = (el) => {
    localRef.current = el;
    if (!ref) return;
    if (typeof ref === 'function') ref(el); else ref.current = el;
  };

  const baseStyle = {
    background: '#fff',
    color: '#475569',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E2E8F0',
    width: 48,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 180ms ease',
    ...style
  };

  const hoverStyle = hovered ? { background: '#F8FAFC', transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(2,6,23,0.08)' } : {};

  const handleMouseEnter = () => {
    const el = localRef.current;
    if (el && el.getBoundingClientRect) {
      const rect = el.getBoundingClientRect();
      setTooltipPos({ left: rect.left + rect.width / 2, top: rect.bottom + 8 });
    }
    setHovered(true);
  };

  const handleMouseLeave = () => setHovered(false);

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        ref={setRefs}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ ...baseStyle, ...hoverStyle }}
      >
        {children}
      </button>
      {hovered && (
        <div style={{
          position: 'fixed',
          left: tooltipPos.left,
          top: tooltipPos.top,
          transform: 'translateX(-50%)',
          background: '#2D3436',
          color: 'white',
          padding: '6px 10px',
          borderRadius: 8,
          zIndex: 99999,
          whiteSpace: 'nowrap',
          fontSize: 12,
          pointerEvents: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
        }}>{title}</div>
      )}
    </div>
  );
});
export default function ClassDashboard({
  activeClass,
  behaviors,
  onBack,
  onOpenEggRoad,
  onOpenSettings,
  updateClasses,
  refreshClasses,
  onOpenAssignments,
  onOpenGames
}) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  // Handler to merge imported behaviors from another class into the active class.
  // Listens for the custom event dispatched by BehaviorModal when the user requests an import.
  useEffect(() => {
    const handler = (e) => {
      const { sourceBehaviors } = e.detail || {};
      if (!sourceBehaviors || !Array.isArray(sourceBehaviors) || !activeClass) return;
      // Merge: only add behaviors that don't already exist (by id or label)
      updateClasses(prev => prev.map(c => {
        if (c.id !== activeClass.id) return c;
        const existingKeys = new Set((c.behaviors || []).map(b => b.id || b.label));
        const toAdd = sourceBehaviors.filter(sb => !(existingKeys.has(sb.id) || existingKeys.has(sb.label)));
        if (toAdd.length === 0) return c;
        return { ...c, behaviors: [...(c.behaviors || []), ...toAdd] };
      }));
    };
    window.addEventListener('behavior-import:request', handler);
    return () => window.removeEventListener('behavior-import:request', handler);
  }, [activeClass, updateClasses]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentAvatar, setEditStudentAvatar] = useState(null);
  const [editSelectedSeed, setEditSelectedSeed] = useState(null);
  const [showEditAvatarPicker, setShowEditAvatarPicker] = useState(false);
  const [hoveredEditChar, setHoveredEditChar] = useState(null);
  const [deleteConfirmStudentId, setDeleteConfirmStudentId] = useState(null);
  const editFileInputRef = useRef(null);
  const editAvatarSectionRef = useRef(null);

  const getEditDropdownPosition = useCallback(() => {
    if (!editAvatarSectionRef.current) return { top: 0, left: 0 };

    const rect = editAvatarSectionRef.current.getBoundingClientRect();
    return {
      top: rect.top - 200,
      left: rect.left + rect.width / 2 - 275
    };
  }, []);
  // TEMPORARY: default to visible so we can verify the aside and chevron are rendered.
  // Change this back to `false` after verifying in the browser.
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [sidebarVisible, setSidebarVisible] = useState(true); // Always visible by default
  const [displaySize, setDisplaySize] = useState(isMobile ? 'compact' : 'spacious');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showClassBehaviorModal, setShowClassBehaviorModal] = useState(false);
  const [showMultiSelectBehaviorModal, setShowMultiSelectBehaviorModal] = useState(false);
  // Animations for awarded students: id -> { type }
  const [animatingStudents, setAnimatingStudents] = useState({});

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep track of viewport width to switch sidebar to a compact tab bar on small screens
  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      // Automatically adjust display size based on viewport
      if (width <= 374) {
        setDisplaySize('compact');
      } else if (width <= 480) {
        setDisplaySize('regular');
      } else if (width <= 768) {
        setDisplaySize('regular');
      } else if (width <= 1024) {
        setDisplaySize('regular');
      } else {
        setDisplaySize('spacious');
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const triggerAnimationForIds = (ids = [], points = 1) => {
    if (prefersReducedMotion) return;
    const map = {
      1: { type: 'small', dur: 800 },
      2: { type: 'medium', dur: 1200 },
      3: { type: 'large', dur: 1600 },
      5: { type: 'confetti', dur: 2200 }
    };
    const { type, dur } = map[points] || { type: 'small', dur: 900 };
    setAnimatingStudents((prev) => {
      const copy = { ...prev };
      ids.forEach((id) => { copy[id] = { type }; });
      return copy;
    });
    // Clear after duration
    setTimeout(() => {
      setAnimatingStudents((prev) => {
        const copy = { ...prev };
        ids.forEach((id) => { delete copy[id]; });
        return copy;
      });
    }, dur);
  };
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showPoint, setShowPoint] = useState({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' });
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [absentStudents, setAbsentStudents] = useState(new Set());

  useEffect(() => {
    const newAbsent = new Set();
    activeClass.students?.forEach(s => {
      if (s.attendance === 'absent' && s.attendanceDate === today) {
        newAbsent.add(s.id);
      }
    });
    setAbsentStudents(newAbsent);
  }, [activeClass.students, today]);

  const [showCodesPage, setShowCodesPage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Toggle Function
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  // ... existing states ...
  const [showSortMenu, setShowSortMenu] = useState(false); // ⚡ NEW: Toggle for sort menu
  const [sortBy, setSortBy] = useState('score'); // ⚡ NEW: default to 'score' (highest points)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false); // ⚡ NEW: Toggle for 3-dot menu in header
  const headerMenuBtnRef = useRef(null);
  const headerMenuRef = useRef(null);

  // Refs for menu buttons + menus so we can detect outside clicks and position menus
  const sortBtnRef = useRef(null);
  const gridBtnRef = useRef(null);
  const sortMenuRef = useRef(null);
  const gridMenuRef = useRef(null);
  // Refs for sidebar and its toggle chevron so outside clicks can hide the aside
  const sidebarRef = useRef(null);
  const chevronRef = useRef(null);

  // ⚡ NEW: Helper to get students in the correct order (memoized for performance)
  const sortedStudents = useMemo(() => {
    if (!activeClass || !activeClass.students) return [];
    const students = [...activeClass.students]; // Create a copy to sort safely

    if (sortBy === 'name') {
      return students.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'score') {
      // Sort by score (Highest first), fallback to 0 if undefined
      return students.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    return students;
  }, [activeClass?.students, sortBy]);
  // Sync state if user presses 'Esc' key
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Close menus when clicking outside of the buttons/menus
  useEffect(() => {
    const onDocClick = (e) => {
      const target = e.target;

      // If clicking inside the header menu container (mobile 3-dot menu), keep it open
      if (headerMenuRef.current && headerMenuRef.current.contains(target)) return;

      // If clicking on the 3-dot menu button, toggle it (the onClick handles this)
      if (headerMenuBtnRef.current && headerMenuBtnRef.current.contains(target)) return;

      // If clicking inside the sort menu (desktop), keep it open
      if (sortMenuRef.current && sortMenuRef.current.contains(target)) return;

      // If clicking on the sort menu button, toggle it (the onClick handles this)
      if (sortBtnRef.current && sortBtnRef.current.contains(target)) return;

      // If clicking inside the grid menu (desktop), keep it open
      if (gridMenuRef.current && gridMenuRef.current.contains(target)) return;

      // If clicking on the grid menu button, toggle it (the onClick handles this)
      if (gridBtnRef.current && gridBtnRef.current.contains(target)) return;

      // If no menus are open, nothing to do
      if (!showHeaderMenu && !showSortMenu && !showGridMenu) return;

      // Close all menus
      setShowSortMenu(false);
      setShowGridMenu(false);
      setShowHeaderMenu(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showHeaderMenu, showSortMenu, showGridMenu]);

  // Hide the sidebar/aside when clicking anywhere outside it (but not when clicking the chevron toggle)
  // Applies on both mobile and desktop
  useEffect(() => {
    const onAnyClick = (e) => {
      const target = e.target;
      // Only consider hiding when aside is currently visible
      if (!sidebarVisible) return;
      // If click inside the sidebar, do nothing
      if (sidebarRef.current && sidebarRef.current.contains(target)) return;
      // If click on the chevron/toggle button, do nothing (the button's onClick handles toggling)
      if (chevronRef.current && chevronRef.current.contains(target)) return;
      // Otherwise hide the sidebar
      setSidebarVisible(false);
    };
    document.addEventListener('click', onAnyClick);
    return () => document.removeEventListener('click', onAnyClick);
  }, [sidebarVisible]);
  // --- BUZZER STATE ---
  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [buzzerState, setBuzzerState] = useState('idle'); // 'idle', 'counting', 'buzzing'
  const [buzzerCount, setBuzzerCount] = useState(5);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // Multi-select mode for student cards
  const [multiSelectedStudents, setMultiSelectedStudents] = useState(new Set()); // Students selected in multi-select mode
  const [showHistory, setShowHistory] = useState(false); // Points history modal
  const audioCtxRef = useRef(null);
  const mainOscRef = useRef(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const startBuzzerSequence = () => {
    initAudio();
    setBuzzerState('counting');
    setBuzzerCount(5);
  };

  const stopBuzzer = () => {
    if (mainOscRef.current) {
      mainOscRef.current.stop();
      mainOscRef.current = null;
    }
    setBuzzerState('idle');
  };
  // --- SUBMISSIONS & MESSAGES STATE ---
  const [viewMode, setViewMode] = useState('students'); // 'students', 'reports', 'assignments', etc.
  const viewModeRef = useRef('students');
  const { setPageId } = usePageHelp();

    // Sync viewModeRef.current with viewMode whenever viewMode changes
    useEffect(() => {
      viewModeRef.current = viewMode;
    }, [viewMode]);
  // Sync dashboard sub-view to help bubble (page-relevant help)
  useEffect(() => {
    const map = {
      students: 'class-dashboard',
      assignments: 'assignments',
      messages: 'inbox',
      codes: 'access-codes',
      settings: 'settings',
      reports: 'class-dashboard',
      timer: 'class-dashboard',
      whiteboard: 'whiteboard',
      luckyDraw: 'class-dashboard',
      eggroad: 'class-dashboard'
    };
    setPageId(map[viewMode] || 'class-dashboard');
  }, [viewMode, setPageId]);

  // Use existing state declarations from earlier in the file (isLuckyDrawOpen, showWhiteboard, buzzerState)
  const modalRef = useRef(null);

  // Special handler for buzzer since it calls a function instead of just setting state
  const startBuzzerWithHistory = () => {
    startBuzzerSequence();
    window.history.pushState(
      { ...window.history.state, dashboardModal: 'buzzer' },
      '',
      window.location.hash
    );
  };

  // Custom setViewMode that tracks history
  const setViewModeWithHistory = (newMode) => {
    if (newMode !== viewModeRef.current) {
      // Push to browser history for swipe-back support
      window.history.pushState(
        { ...window.history.state, dashboardViewMode: newMode },
        '',
        window.location.hash
      );
      viewModeRef.current = newMode;
      setViewMode(newMode);
    }
  };

  // Track modal states in browser history for swipe-back
  const openModalWithHistory = (modalType, setOpenFn) => {
    setOpenFn(true);
    window.history.pushState(
      { ...window.history.state, dashboardModal: modalType },
      '',
      window.location.hash
    );
  };

  const closeModal = () => {
    setIsLuckyDrawOpen(false);
    setShowWhiteboard(false);
    setShowHistory(false);
    setBuzzerState('idle');
    window.history.replaceState(
      { ...window.history.state, dashboardModal: null },
      '',
      window.location.hash
    );
  };

  // Initialize browser history with students viewMode
  useEffect(() => {
    if (!window.history.state || !window.history.state.dashboardViewMode) {
      window.history.replaceState(
        { ...window.history.state, dashboardViewMode: 'students', dashboardModal: null },
        '',
        window.location.hash
      );
    }
  }, []);

  // Listen for custom event from App.jsx when swipe-back happens on dashboard
  useEffect(() => {
    const handleDashboardViewModeChange = (event) => {
      const newViewMode = event.detail;
      // Map 'dashboard' to 'students' for consistency
      const actualViewMode = newViewMode === 'dashboard' ? 'students' : newViewMode;
      viewModeRef.current = actualViewMode;
      setViewMode(actualViewMode);
    };

    const handleModalClose = () => {
      closeModal();
    };

    window.addEventListener('dashboardViewModeChange', handleDashboardViewModeChange);
    window.addEventListener('modalClose', handleModalClose);
    return () => {
      window.removeEventListener('dashboardViewModeChange', handleDashboardViewModeChange);
      window.removeEventListener('modalClose', handleModalClose);
    };
  }, []);
  const [submissions, setSubmissions] = useState([]);
  const [, setLoadingSubmissions] = useState(false);

  // 1. Fetch fresh data from PocketBase
  const fetchFreshSubmissions = async () => {
    if (!activeClass || !activeClass.id) return;
    setLoadingSubmissions(true);
    try {
      const data = await api.pbRequest(
        `/collections/submissions/records?filter=(class_id='${activeClass.id}')&sort=-created`
      );
      setSubmissions(data.items || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // 2. Handle Grading (Passed to InboxPage)
  const handleGradeSubmit = async (submissionId, gradeValue) => {
    try {
      // First, get the submission to find the student ID and previous grade
      const submission = await api.pbRequest(`/collections/submissions/records/${submissionId}`);
      const previousGrade = Number(submission.grade) || 0;

      // Update the submission with grade and status
      await api.pbRequest(`/collections/submissions/records/${submissionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ grade: gradeValue, status: 'graded' })
      });

      // Add only the difference to the student's total score (for regrading)
      if (submission.student_id && gradeValue) {
        const newGrade = Number(gradeValue);
        const pointsToAdd = newGrade - previousGrade;

        // Only update if there's a difference
        if (pointsToAdd !== 0) {
          updateClasses((prev) =>
            prev.map((c) =>
              c.id === activeClass.id
                ? {
                    ...c,
                    students: c.students.map((s) =>
                      s.id.toString() === submission.student_id.toString()
                        ? { ...s, score: (Number(s.score) || 0) + pointsToAdd }
                        : s
                    )
                  }
                : c
            )
          );
        }
      }

      // Refresh local data so the UI updates instantly
      await fetchFreshSubmissions();
    } catch (err) {
      console.error("Grade submit failed", err);
      alert("Failed to save grade. Check console.");
    }
  };

  const generate5DigitCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  useEffect(() => {
    if (!showGridMenu) return;
    const t = setTimeout(() => setShowGridMenu(false), 2000);
    return () => clearTimeout(t);
  }, [showGridMenu]);
  // Handle Countdown Logic
  useEffect(() => {
    let timer;
    if (buzzerState === 'counting') {
      if (buzzerCount > 0) {
        // --- LOUDER COUNTDOWN "BEEP" ---
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'square'; // Harsher, more audible wave
        osc.frequency.value = 1200; // Piercing high pitch
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime); // Louder volume
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.2);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.2);
        timer = setTimeout(() => setBuzzerCount(buzzerCount - 1), 1000);
      } else {
        // --- EXTREME CONTINUOUS ALARM ---
        setBuzzerState('buzzing');

        // Dual oscillators create a "beating" effect that is physically harder to ignore
        const osc1 = audioCtxRef.current.createOscillator();
        const osc2 = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.value = 180; // Low buzz
        osc2.frequency.value = 184; // Slight offset creates jarring vibration

        const lfo = audioCtxRef.current.createOscillator();
        const lfoGain = audioCtxRef.current.createGain();
        lfo.frequency.value = 8; // Faster "wah-wah" modulation
        lfoGain.gain.value = 40;
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        gain.gain.value = 0.4; // Significantly Louder

        osc1.start();
        osc2.start();
        lfo.start();
        mainOscRef.current = { stop: () => { osc1.stop(); osc2.stop(); lfo.stop(); } };
      }
    }
    return () => clearTimeout(timer);
  }, [buzzerState, buzzerCount]);
  const ensureCodesAndOpen = () => {
    const currentAccessCodes = typeof activeClass.Access_Codes === 'object' && activeClass.Access_Codes !== null
      ? activeClass.Access_Codes
      : {};

    let needsUpdate = false;
    const updatedCodesObject = { ...currentAccessCodes };

    activeClass.students.forEach(s => {
      if (!updatedCodesObject[s.id]) {
        needsUpdate = true;
        updatedCodesObject[s.id] = {
          parentCode: generate5DigitCode(),
          studentCode: generate5DigitCode()
        };
      }
    });

    if (needsUpdate) {
      updateClasses(prev => prev.map(c =>
        c.id === activeClass.id ? { ...c, Access_Codes: updatedCodesObject } : c
      ));
    }
    setShowCodesPage(true);
  };

  // --- STUDENT MANAGEMENT HANDLERS ---
  const handleEditStudent = useCallback((student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name || '');
    setEditStudentAvatar(student.avatar || null);
    setEditSelectedSeed(null);
  }, []);

  const handleSaveStudentEdit = () => {
    if (!editStudentName.trim()) return;
    const finalAvatar =
      editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : undefined);

    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) =>
              s.id === editingStudentId ? { ...s, name: editStudentName, avatar: finalAvatar } : s
            )
          }
          : c
      )
    );

    setEditingStudentId(null);
    setEditStudentName('');
    setEditStudentAvatar(null);
    setEditSelectedSeed(null);
  };

  const handleDeleteStudent = useCallback((student) => {
    updateClasses((prev) =>
      prev.map((c) => {
        if (c.id === activeClass.id) {
          const updatedCodes = { ...(c.Access_Codes || {}) };
          delete updatedCodes[student.id];
          return {
            ...c,
            students: c.students.filter((s) => s.id !== student.id),
            Access_Codes: updatedCodes
          };
        }
        return c;
      })
    );
    setDeleteConfirmStudentId(null);
  }, [activeClass?.id, updateClasses]);

  const getMarkedAbsentStudents = () => {
    return sortedStudents.filter(s => absentStudents.has(s.id));
  };

  const handleGivePoint = (behavior) => {
    if (!selectedStudent) return;
    const today = new Date().toISOString().split('T')[0];
    if (selectedStudent.attendance === 'absent' && selectedStudent.attendanceDate === today) {
      return;
    }
    setShowPoint({ visible: true, student: selectedStudent, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              if (s.id === selectedStudent.id) {
                const newLog = {
                  label: behavior.label,
                  pts: behavior.pts,
                  type: behavior.type,
                  timestamp: new Date().toISOString()
                };
                return {
                  ...s,
                  score: s.score + behavior.pts,
                  history: [...(s.history || []), newLog]
                };
              }
              return s;
            })
          }
          : c
      )
    );
    // Trigger animation for the single winner
    try { triggerAnimationForIds([selectedStudent.id], behavior.pts); } catch (e) { /* ignore */ }
    setSelectedStudent(null);
  };

  const handleGivePointsToClass = (behavior) => {
    const presentStudents = activeClass.students.filter(s => !absentStudents.has(s.id));

    setShowPoint({ visible: true, student: { name: t('dashboard.whole_class'), students: presentStudents }, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? { ...c, students: c.students.map((s) => {
              if (absentStudents.has(s.id)) return s;
              return {
                ...s,
                score: s.score + behavior.pts,
                history: [...(s.history || []), {
                  label: behavior.label,
                  pts: behavior.pts,
                  type: behavior.type,
                  timestamp: new Date().toISOString()
                }]
              };
            })
          }
        : c
      )
    );
    setShowClassBehaviorModal(false);
    // Trigger animation for present students only
    try { triggerAnimationForIds(presentStudents.map(s => s.id), behavior.pts); } catch (e) { console.warn('triggerAnimationForIds failed', e); }
  };

  // Function to give points to multiple selected students via behavior modal
  const handleGivePointsToMultiSelect = (behavior) => {
    const selectedStudentsArray = Array.from(multiSelectedStudents)
      .map(id => sortedStudents.find(s => s.id === id))
      .filter(Boolean);

    if (selectedStudentsArray.length === 0) return;

    // 1. Trigger the animation for the selected students
    setShowPoint({
      visible: true,
      student: { name: `${selectedStudentsArray.length} Selected`, students: selectedStudentsArray },
      points: behavior.pts,
      behaviorEmoji: behavior.icon || '⭐'
    });

    // 2. Update only the selected students
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              // Check if this student is in our selected array
              const isSelected = selectedStudentsArray.find(sel => sel.id === s.id);
              if (isSelected) {
                return {
                  ...s,
                  score: s.score + behavior.pts,
                  history: [...(s.history || []), {
                    label: behavior.label,
                    pts: behavior.pts,
                    type: behavior.type,
                    timestamp: new Date().toISOString()
                  }]
                };
              }
              return s;
            })
          }
          : c
      )
    );

    // Clear selections and close modal
    setMultiSelectedStudents(new Set());
    setIsMultiSelectMode(false);
    setShowMultiSelectBehaviorModal(false);

    // Trigger animation for selected students
    try { triggerAnimationForIds(selectedStudentsArray.map(s => s.id), behavior.pts); } catch (e) { console.warn('triggerAnimationForIds failed', e); }
  };

  // --- SURGICAL ADDITION FOR LUCKY DRAW MULTI-WINNERS ---
  const handleGivePointsToMultiple = (studentsArray, points = 1) => {

    // 1. Trigger the animation for the whole group
    setShowPoint({
      visible: true,
      student: { name: `${studentsArray.length} Winners`, students: studentsArray },
      points: points,
      behaviorEmoji: '🎉'
    });

    // 2. Update all selected students in the database/state at once
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              // Check if this student is in our winners array
              const isWinner = studentsArray.find(w => w.id === s.id);
              if (isWinner) {
                return {
                  ...s,
                  score: s.score + points,
                  history: [...(s.history || []), {
                    label: 'Lucky Draw Winner',
                    pts: points,
                    type: 'wow',
                    timestamp: new Date().toISOString()
                  }]
                };
              }
              return s;
            })
          }
          : c
      )
    );
    // Trigger animation for winners
    try { triggerAnimationForIds(studentsArray.map(w => w.id), points); } catch (e) { console.warn('triggerAnimationForIds failed', e); }
  };

    if (!activeClass) return <div style={{ ...styles.layout, overflowX: 'hidden' }}>{t('dashboard.no_students')}</div>;
    // Sum up all points from all students safely
  const totalClassPoints = activeClass?.students?.reduce((acc, s) => acc + (Number(s.score) || 0), 0) || 0;
  // --- CONDITIONAL RENDERS FOR SUB-PAGES ---

  return (
    <>
      <div style={{ ...styles.layout, overflowX: 'hidden' }}>
        <style>{`
          @keyframes pulseChevron { 
            0% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-4px) scale(1.08); }
            100% { transform: translateY(0) scale(1); }
          }
        `}</style>
        {/* --- SIDEBAR --- */}
        <nav
          ref={sidebarRef}
          className="safe-area-top"
          style={(() => {
            if (isMobile) {
              // On mobile: render a narrow left aside with tighter spacing so bottom icons remain visible
              return {
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                width: '72px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '6px',
                background: '#EEF2FF',
                transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.25s ease',
                boxShadow: sidebarVisible ? '0 0 20px rgba(0,0,0,0.06)' : 'none',
                outline: '3px solid rgba(99,102,241,0.12)',
                borderRight: '1px solid rgba(0,0,0,0.04)',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: 16
              };
            }
            // Default (desktop): wider sidebar with icon + text
              return {
                width: '210px',
                background: '#EEF2FF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '4px',
                borderRight: '1px solid rgba(0,0,0,0.06)',
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                zIndex: 99999,
                transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease',
                boxShadow: sidebarVisible ? '0 0 20px rgba(0,0,0,0.1)' : 'none',
                outline: '3px solid rgba(99,102,241,0.08)',
                boxSizing: 'border-box',
                marginTop: '7px',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingBottom: 16
              };
          })()}
        >
          {/* User Initial Circle */}


          <SidebarIcon
            icon={Home}
            label={t('nav.back')}
            onClick={() => { onBack(); setViewMode('students'); if (isMobile) setSidebarVisible(false); }}
            style={styles.icon}
          />

          <SidebarIcon
            icon={ClipboardList}
            label={t('dashboard.assignments')}
            onClick={() => {
              closeModal();
              setViewModeWithHistory('assignments');
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'assignments'}
          />

          <SidebarIcon
            icon={MessageSquare}
            label={t('dashboard.inbox_grading')}
            onClick={() => {
              closeModal();
              setViewModeWithHistory('messages');
              fetchFreshSubmissions();
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'messages'}
            style={styles.icon}
            badge={(
              <>
                {submissions.filter(s => s.status === 'submitted').length > 0 && (
                  <span style={styles.badge}>
                    {submissions.filter(s => s.status === 'submitted').length}
                  </span>
                )}
              </>
            )}
          />

          <SidebarIcon
            icon={Dices}
            label={t('dashboard.lucky_draw')}
            onClick={() => {
              closeModal();
              openModalWithHistory('luckyDraw', setIsLuckyDrawOpen);
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={isLuckyDrawOpen}
            style={styles.icon}
            dataNavbarIcon="lucky-draw"
          />

          <SidebarIcon
            icon={Trophy}
            label={t('dashboard.road')}
            onClick={() => {
              closeModal();
              setViewModeWithHistory('eggroad');
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'eggroad'}
            style={styles.icon}
            dataNavbarIcon="egg-road"
          />

          <SidebarIcon
            icon={CheckSquare}
            label={t('dashboard.attendance_mode')}
            onClick={() => {
              closeModal();
              if (!isAttendanceMode) {
                setViewMode('students');
                setIsAttendanceMode(true);
              } else {
                setIsAttendanceMode(false);
              }
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={isAttendanceMode}
            style={styles.icon}
            dataNavbarIcon="attendance"
          />



          <SidebarIcon
            icon={QrCode}
            label={t('dashboard.access_codes')}
            onClick={() => {
              closeModal();
              ensureCodesAndOpen();
              setViewModeWithHistory('codes');
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'codes'}
            style={styles.icon}
          />

          <SidebarIcon
            icon={BarChart2}
            label={t('dashboard.reports')}
            onClick={() => {
              closeModal();
              setViewModeWithHistory('reports');
              updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isViewingReports: true } : c));
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'reports'}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Clock}
            label={t('dashboard.class_timer')}
            onClick={() => {
              closeModal();
              setViewModeWithHistory('timer');
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'timer'}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Siren}
            label={t('dashboard.attention_buzzer')}
            onClick={() => {
              closeModal();
              startBuzzerWithHistory();
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={buzzerState !== 'idle'}
            style={{ ...styles.icon, color: buzzerState !== 'idle' ? '#FF5252' : '#636E72' }}
          />
          <SidebarIcon
            icon={Presentation}
            label={t('dashboard.whiteboard')}
            onClick={() => {
              closeModal();
              openModalWithHistory('whiteboard', setShowWhiteboard);
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={showWhiteboard}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Settings}
            label={t('dashboard.settings')}
            onClick={() => {
              closeModal();
              setViewModeWithHistory('settings');
              if (isMobile) setSidebarVisible(false);
            }}
            isActive={viewMode === 'settings'}
            style={styles.icon}
            dataNavbarIcon="settings"
          />

        </nav>

          <style>{`
            @keyframes hamburgerPulse {
              0%, 100% { 
                transform: scale(1);
                box-shadow: 0 6px 18px rgba(0,0,0,0.12);
              }
              50% { 
                transform: scale(1.05);
                box-shadow: 0 8px 24px rgba(99,102,241,0.25);
              }
            }
            @keyframes hamburgerGlow {
              0%, 100% {
                box-shadow: 0 6px 18px rgba(0,0,0,0.12), 0 0 0 0 rgba(99,102,241,0);
              }
              50% {
                box-shadow: 0 8px 24px rgba(99,102,241,0.2), 0 0 20px 2px rgba(99,102,241,0.1);
              }
            }
            @keyframes hamburgerIconRotate {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-5deg); }
              75% { transform: rotate(5deg); }
            }
            @keyframes hamburgerFadeIn {
              0% { opacity: 0; transform: translateX(-20px); }
              100% { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          <button
            ref={chevronRef}
            onMouseDown={(e) => e.stopPropagation()} // prevent document listener from firing on click
            onClick={(e) => { e.stopPropagation(); setSidebarVisible(prev => !prev); }}
            style={(() => {
              const baseStyles = {
                position: 'fixed',
                zIndex: 9999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                willChange: 'transform, left',
                color: isDark ? '#E5E7EB' : '#1F2933',
                background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.96)',
                border: isDark
                  ? '1px solid rgba(148,163,184,0.85)'
                  : '1px solid rgba(148,163,184,0.8)',
                boxShadow: isDark
                  ? '0 8px 24px rgba(15,23,42,0.85)'
                  : '0 6px 18px rgba(15,23,42,0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              };

              if (isMobile) {
                return {
                  ...baseStyles,
                  left: sidebarVisible ? '84px' : '6px',
                  top: '5px',
                  borderRadius: '12px',
                  width: '48px',
                  height: '48px',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                };
              }
              return {
                ...baseStyles,
                left: sidebarVisible ? '220px' : '6px',
                top: 6,
                borderRadius: '12px',
                width: '44px',
                height: '48px',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              };
            })()}
          >
            <AnimatedHamburger isOpen={sidebarVisible} />
          </button>

        {/* BUZZER OVERLAY */}
        {buzzerState !== 'idle' && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999, // On top of everything
            background: buzzerState === 'buzzing' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: buzzerState === 'buzzing' ? 'pulseRed 0.5s infinite alternate' : 'none'
          }}>
            <style>{`
      @keyframes pulseRed { from { background: rgba(255, 0, 0, 0.1); } to { background: rgba(255, 0, 0, 0.3); } }
      @keyframes scaleIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `}</style>

            <div style={{
              textAlign: 'center',
              color: 'white',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              {buzzerState === 'counting' ? (
                <>
                  <div style={{ fontSize: '180px', fontWeight: '900', textShadow: '0 0 50px rgba(99, 102, 241, 0.5)' }}>
                    {buzzerCount}
                  </div>
                  <p style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '4px', opacity: 0.8 }}>EYES ON ME</p>
                </>
              ) : (
                <>
                  <Zap size={100} color="#FFD700" style={{ marginBottom: '20px' }} />
                  <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '40px' }}>ATTENTION!</h1>
                  <button
                    onClick={stopBuzzer}
                    style={{
                      padding: '24px 60px',
                      borderRadius: '30px',
                      border: 'none',
                      background: 'white',
                      color: 'red',
                      fontSize: '24px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    I'M LISTENING
                  </button>
                </>
              )}

            </div>

          </div>
        )}
        <main style={{
          ...styles.content,
          marginLeft: sidebarVisible ? (isMobile ? '72px' : '210px') : '0',
          transition: 'margin-left 0.3s ease',
          paddingTop: (viewMode === 'messages' || viewMode === 'codes' || viewMode === 'settings' || viewMode === 'assignments' || viewMode === 'timer' || viewMode === 'reports' || viewMode === 'luckyDraw' || viewMode === 'eggroad' ) ? 0 : `calc(${isMobile ? '60px' : '80px'} + var(--safe-top, 0px))`,
          overflowX: 'hidden',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>

          {/* 1. MESSAGES VIEW */}
          {viewMode === 'messages' ? (
            <div key="messages" className="page-animate-in" style={{ height: '100%' }}>
              <InboxPage
                activeClass={activeClass}
                submissions={submissions}
                onGradeSubmit={handleGradeSubmit} // Uses the grading logic in Dashboard
                onBack={() => setViewMode('students')} // Closes the window
              />
            </div>
          ) /* 2. ⚡ WIDER TIMER VIEW ⚡ */
            : viewMode === 'timer' ? (
              <div key="timer" className="page-animate-in" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                background: '#F4F1EA',
                padding: '40px'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '800px', // Much wider container
                  background: 'white',
                  padding: '60px',
                  borderRadius: '40px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {/* The Updated KidTimer handles the width internally now */}
                  <KidTimer onClose={() => setViewMode('students')} // Now the 'X' will work
                    onComplete={() => ("Time is up! 🎉")} />

                </div>
              </div>
            ) :  /* 3. REPORTS VIEW */
              viewMode === 'reports' ? (
                <div key="reports" className="page-animate-in" style={{ height: '100%' }}>
                  <ReportsPage
                    activeClass={activeClass}
                    onBack={() => setViewMode('students')}
                    updateClasses={updateClasses}
                  />
                </div>
              ) : viewMode === 'assignments' ? (
                <div key="assignments" className="page-animate-in" style={{ height: '100%' }}>
                  <AssignmentsPage
                    activeClass={activeClass}
                    onBack={() => setViewMode('students')}
                    onPublish={(data) => {
                      // This logic replaces the "missing" onOpenAssignments
                      updateClasses(prev => prev.map(c =>
                        c.id === activeClass.id
                          ? { ...c, assignments: [...(c.assignments || []), data] }
                          : c
                      ));
                      // Go back after publishing
                      setViewMode('students');
                    }}
                  />
                </div>
              ) : viewMode === 'codes' ? ( // Add this block
                <AccessCodesPage
                  activeClass={activeClass}
                  onBack={() => setViewMode('students')}
                />
              ) : viewMode === 'settings' ? (
                <div key={`settings-${activeClass.id}`} className="page-animate-in" style={{ height: '100%' }}>
                  <SettingsPage
                    key={`settings-page-${activeClass.id}`}
                    activeClass={activeClass}

                    behaviors={activeClass.behaviors || behaviors}
                    onBack={() => setViewMode('students')}
                    onUpdateBehaviors={(newBehaviorsList) => {
                    // ⚡ FIX: Safely update the class with the new array of cards
                    updateClasses(prevClasses => prevClasses.map(c =>
                      c.id === activeClass.id
                        ? { ...c, behaviors: newBehaviorsList }
                        : c
                    ));
                  }}
                />
                </div>
              ) : viewMode === 'eggroad' ? (
                <div key="eggroad" className="page-animate-in" style={{ height: '100%' }}>
                  <EggRoad
                    classData={activeClass}
                    onBack={() => setViewMode('students')}
                  />
                </div>
              ) : (
                /* 3. STANDARD DASHBOARD VIEW (Default) */

                <>
                  <header
                    className="safe-area-top"
                    style={{
                      ...styles.header,
                      // Use full width of the `main` container; `main` already offsets for the sidebar.
                      width: '100%',
                      marginLeft: 0,
                      paddingRight: isMobile ? '12px' : '20px',
                      boxSizing: 'border-box',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      position: 'fixed',
                      left: 0,
                      right: 0,
                      top: 0,
                      zIndex: 999
                    }}
                  >
                    {/* Left side: Empty or back button */}
                    <div style={{ width: isMobile ? '40px' : '100px' }}></div>

                    {/* Center: Class name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '9px' }}>
                      <h2 style={{ fontSize: isMobile ? '18px' : '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        {activeClass.name}
                      </h2>
                      {activeClass.id === 'demo-class' && (
                        <span style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                        }}>
                          DEMO
                        </span>
                      )}
                      {isAttendanceMode && (
                        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>{t('dashboard.attendance_tip')}</span>
                        </div>
                      )}
                    </div>

                    {/* Right side: Controls */}
                    {isMobile ? (
                      /* Mobile: 3-dot menu */
                      <div style={{ width: '100px', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ position: 'relative' }}>
                          <IconButton
                            ref={headerMenuBtnRef}
                            title={t('dashboard.menu')}
                            onClick={() => setShowHeaderMenu(prev => !prev)}
                          >
                            <MoreVertical size={22} />
                          </IconButton>

                          {showHeaderMenu && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                ...styles.gridMenu,
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                minWidth: '200px'
                              }}
                              ref={headerMenuRef}
                            >
                              {/* Sort */}
                              <div style={{ position: 'relative' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSortMenu(prev => { const next = !prev; if (next) setShowGridMenu(false); return next; });
                                  }}
                                  style={{
                                    ...styles.gridOption,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <ArrowUpDown size={18} />
                                    <span>{t('dashboard.sort_students')}</span>
                                  </div>
                                  <ChevronDown size={14} />
                                </button>

                                {showSortMenu && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: 'absolute',
                                      right: '100%',
                                      top: 0,
                                      marginRight: '8px',
                                      background: 'white',
                                      borderRadius: '12px',
                                      padding: '8px',
                                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                      minWidth: '180px',
                                      zIndex: 100000
                                    }}
                                  >
                                    <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.sort_by')}</div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSortBy('name');
                                        setShowSortMenu(false);
                                        setShowHeaderMenu(false);
                                      }}
                                      style={{
                                        ...styles.gridOption,
                                        background: sortBy === 'name' ? '#EEF2FF' : 'transparent',
                                        color: sortBy === 'name' ? '#6366F1' : '#475569'
                                      }}
                                    >
                                      <span style={{ flex: 1, textAlign: 'left' }}>{t('dashboard.name_az')}</span>
                                      {sortBy === 'name' && <CheckCircle size={14} />}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSortBy('score');
                                        setShowSortMenu(false);
                                        setShowHeaderMenu(false);
                                      }}
                                      style={{
                                        ...styles.gridOption,
                                        background: sortBy === 'score' ? '#EEF2FF' : 'transparent',
                                        color: sortBy === 'score' ? '#6366F1' : '#475569'
                                      }}
                                    >
                                      <span style={{ flex: 1, textAlign: 'left' }}>{t('dashboard.highest_points')}</span>
                                      {sortBy === 'score' && <CheckCircle size={14} />}
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Display Size */}
                              <div style={{ position: 'relative' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowGridMenu(prev => { const next = !prev; if (next) setShowSortMenu(false); return next; });
                                  }}
                                  style={{
                                    ...styles.gridOption,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Sliders size={18} />
                                    <span>{t('dashboard.display_size')}</span>
                                  </div>
                                  <ChevronDown size={14} />
                                </button>

                                {showGridMenu && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      position: 'absolute',
                                      right: '100%',
                                      top: 0,
                                      marginRight: '8px',
                                      background: 'white',
                                      borderRadius: '12px',
                                      padding: '8px',
                                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                      minWidth: '180px',
                                      zIndex: 100000
                                    }}
                                  >
                                    <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.display_size')}</div>
                                    {[
                                      { key: 'compact', label: t('dashboard.compact') },
                                      { key: 'regular', label: t('dashboard.regular') },
                                      { key: 'spacious', label: t('dashboard.spacious') }
                                    ].map(({ key, label }) => (
                                      <button
                                        key={key}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDisplaySize(key);
                                          setShowGridMenu(false);
                                          setShowHeaderMenu(false);
                                        }}
                                        style={{
                                          ...styles.gridOption,
                                          background: displaySize === key ? '#EEF2FF' : 'transparent',
                                          color: displaySize === key ? '#6366F1' : '#475569'
                                        }}
                                      >
                                        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                                        {displaySize === key && <CheckCircle size={14} />}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Fullscreen */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFullscreen();
                                  setShowHeaderMenu(false);
                                }}
                                style={{ ...styles.gridOption, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}
                              >
                                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                                <span style={{ flex: 1, textAlign: 'left' }}>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                              </button>

                              {/* Select Multiple */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsMultiSelectMode(!isMultiSelectMode);
                                  setMultiSelectedStudents(new Set());
                                  setShowHeaderMenu(false);
                                }}
                                style={{
                                  ...styles.gridOption,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '10px 12px',
                                  background: isMultiSelectMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                  color: isMultiSelectMode ? '#fff' : '#475569'
                                }}
                              >
                                <CheckSquare size={18} />
                                <span style={{ flex: 1, textAlign: 'left' }}>Select Multiple</span>
                              </button>

                              {/* Points History */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowHistory(true);
                                  setShowHeaderMenu(false);
                                }}
                                style={{
                                  ...styles.gridOption,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  padding: '10px 12px'
                                }}
                              >
                                <Clock size={18} />
                                <span style={{ flex: 1, textAlign: 'left' }}>{t('dashboard.points_history')}</span>
                              </button>
                          </div>
                        )}
                        </div>
                      </div>
                    ) : (
                      /* Desktop: Individual buttons */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                          <IconButton
                            ref={sortBtnRef}
                            title={t('dashboard.sort_students')}
                            onClick={() => setShowSortMenu(prev => { const next = !prev; if (next) setShowGridMenu(false); return next; })}
                          >
                            <ArrowUpDown size={22} />
                          </IconButton>

                          {showSortMenu && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                ...styles.gridMenu,
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0
                              }}
                              ref={sortMenuRef}
                            >
                              <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.sort_by')}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSortBy('name');
                                  setShowSortMenu(false);
                                }}
                                style={{
                                  ...styles.gridOption,
                                  background: sortBy === 'name' ? '#EEF2FF' : 'transparent',
                                  color: sortBy === 'name' ? '#6366F1' : '#475569'
                                }}
                              >
                                <span>{t('dashboard.name_az')}</span>
                                {sortBy === 'name' && <CheckCircle size={16} />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSortBy('score');
                                  setShowSortMenu(false);
                                }}
                                style={{
                                  ...styles.gridOption,
                                  background: sortBy === 'score' ? '#EEF2FF' : 'transparent',
                                  color: sortBy === 'score' ? '#6366F1' : '#475569'
                                }}
                              >
                                <span>{t('dashboard.highest_points')}</span>
                                {sortBy === 'score' && <CheckCircle size={16} />}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Points History */}
                        <IconButton
                          title={t('dashboard.points_history')}
                          onClick={() => setShowHistory(true)}
                        >
                          <Clock size={22} />
                        </IconButton>

                        <div style={{ position: 'relative' }}>
                          <IconButton
                            ref={gridBtnRef}
                            title={t('dashboard.display_size')}
                            onClick={() => setShowGridMenu(prev => { const next = !prev; if (next) setShowSortMenu(false); return next; })}
                          >
                            <Sliders size={22} />
                          </IconButton>

                          {showGridMenu && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                ...styles.gridMenu,
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0
                              }}
                              ref={gridMenuRef}
                            >
                              <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dashboard.display_size')}</div>
                              {[
                                { key: 'compact', label: t('dashboard.compact') },
                                { key: 'regular', label: t('dashboard.regular') },
                                { key: 'spacious', label: t('dashboard.spacious') }
                              ].map(({ key, label }) => (
                                <button
                                  key={key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDisplaySize(key);
                                    setShowGridMenu(false);
                                  }}
                                  style={{
                                    ...styles.gridOption,
                                    background: displaySize === key ? '#EEF2FF' : 'transparent',
                                    color: displaySize === key ? '#6366F1' : '#475569'
                                  }}
                                >
                                  <span>{label}</span>
                                  {displaySize === key && <CheckCircle size={16} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <IconButton
                          title={isFullscreen ? t('dashboard.exit_fullscreen') : t('dashboard.enter_fullscreen')}
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
                        </IconButton>

                        {/* Select Multiple Button */}
                        <button
                          onClick={() => {
                            setIsMultiSelectMode(!isMultiSelectMode);
                            setMultiSelectedStudents(new Set());
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? 0 : '8px',
                            padding: isMobile ? '10px' : '12px 16px',
                            borderRadius: '12px',
                            background: isMultiSelectMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
                            color: isMultiSelectMode ? '#fff' : '#475569',
                            border: isMultiSelectMode ? 'none' : '1px solid #E2E8F0',
                            fontWeight: 700,
                            fontSize: isMobile ? '11px' : '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isMultiSelectMode ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                            transform: isMultiSelectMode ? 'translateY(-2px)' : 'translateY(0)'
                          }}
                        >
                          <CheckSquare size={isMobile ? 18 : 22} />
                          {!isMobile && <span>Select Multiple</span>}
                        </button>
                      </div>
                    )}

                    {/* Multi-select Action Bar - Shows when students are selected */}
                    {isMultiSelectMode && multiSelectedStudents.size > 0 && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'fixed',
                          bottom: isMobile ? '10px' : '10px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: isMobile ? '8px' : '12px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: '20px',
                          padding: isMobile ? '12px' : '14px 20px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          zIndex: 1000,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          maxWidth: 'calc(100% - 40px)',
                          width: 'auto'
                        }}
                      >
                        {/* Close Button */}
                        <button
                          onClick={() => {
                            setIsMultiSelectMode(false);
                            setMultiSelectedStudents(new Set());
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '6px' : '8px',
                            padding: isMobile ? '10px' : '10px 16px',
                            borderRadius: '12px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: isMobile ? '11px' : '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <X size={isMobile ? 18 : 18} />
                          <span>Close</span>
                        </button>

                        {/* Mark as Absent Button */}
                        <button
                          onClick={() => {
                            const selectedStudentIds = Array.from(multiSelectedStudents);
                            if (selectedStudentIds.length === 0) return;
                            
                            const today = new Date().toISOString().split('T')[0];
                            const allSelectedAbsent = selectedStudentIds.every(id => absentStudents.has(id));
                            const newAbsent = new Set(absentStudents);
                            
                            updateClasses(prev => prev.map(c => {
                              if (c.id !== activeClass.id) return c;
                              return {
                                ...c,
                                students: c.students.map(s => {
                                  if (!multiSelectedStudents.has(s.id)) return s;
                                  if (allSelectedAbsent) {
                                    // Mark as present
                                    newAbsent.delete(s.id);
                                    return { ...s, attendance: 'present', attendanceDate: today };
                                  } else {
                                    // Mark as absent
                                    newAbsent.add(s.id);
                                    return { ...s, attendance: 'absent', attendanceDate: today };
                                  }
                                })
                              };
                            }));
                            setAbsentStudents(newAbsent);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '6px' : '8px',
                            padding: isMobile ? '10px' : '10px 16px',
                            borderRadius: '12px',
                            background: '#EEF2FF',
                            color: '#4F46E5',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: isMobile ? '11px' : '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <Users size={isMobile ? 18 : 18} />
                          <span>
                            {multiSelectedStudents.size > 0
                              ? (Array.from(multiSelectedStudents).every(id => absentStudents.has(id))
                                  ? 'Mark as Present'
                                  : 'Mark as Absent')
                              : 'Mark as Absent'}
                          </span>
                        </button>

                        {/* Give Points Button */}
                        <button
                          onClick={() => {
                            setShowMultiSelectBehaviorModal(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '6px' : '8px',
                            padding: isMobile ? '10px' : '10px 16px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: isMobile ? '11px' : '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            flexShrink: 0
                          }}
                        >
                          <Check size={isMobile ? 18 : 18} />
                          <span>Give Points</span>
                        </button>
                      </div>
                    )}

                  </header>

                  <div className="student-cards-container page-animate-in" style={{
                    display: 'grid',
                    gridTemplateColumns: displaySize === 'compact'
                      ? 'repeat(auto-fill, minmax(120px, 1fr))'
                      : displaySize === 'regular'
                        ? 'repeat(auto-fill, minmax(180px, 1fr))'
                        : 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: displaySize === 'compact' ? '16px' : displaySize === 'regular' ? '20px' : '28px',
                    padding: displaySize === 'compact' ? '16px' : displaySize === 'regular' ? '20px' : '28px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflowX: 'hidden'
                  }}>
                    {/* Whole Class Card - Same structure as StudentCard */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.7) 0%, rgba(168, 85, 247, 0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: displaySize === 'compact' ? '12px' : '24px',
                        padding: displaySize === 'compact' ? '6px' : '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        aspectRatio: '1 / 1',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}
                      onClick={() => setShowClassBehaviorModal(true)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 15px 25px -5px rgba(99, 102, 241, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(99, 102, 241, 0.4)';
                      }}
                    >
                      {displaySize === 'compact' ? (
                        <>
                          {/* ⚡ WHOLE CLASS TEXT (TOP - ARCHED DOWNWARD) ⚡ */}
                          <svg viewBox="0 0 150 35" style={{
                            position: 'absolute',
                            top: '2px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90%',
                            height: '40px',
                            pointerEvents: 'none',
                            zIndex: 10
                          }}>
                            <defs>
                              <path id="wholeClassPathInner" d="M 5,32 Q 75,10 145,32" />
                            </defs>
                            <text fill="#FFFFFF" fontSize="18" fontWeight="900" letterSpacing="1" textAnchor="middle">
                              <textPath href="#wholeClassPathInner" startOffset="50%">{t('dashboard.whole_class')}</textPath>
                            </text>
                          </svg>

                          {/* ⚡ EMOJI (CENTER) ⚡ */}
                          <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            marginTop: '10px'
                          }}>
                            <SmilePlus size={28} />
                          </div>

                          {/* ⚡ TOTAL CLASS POINTS DISPLAY (BOTTOM - CENTERED) ⚡ */}
                          <div style={{
                            padding: '3px 10px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '800',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(12px)',
                            whiteSpace: 'nowrap',
                            position: 'absolute',
                            bottom: '3px',
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}>
                            <Trophy size={12} color="#FFD700" fill="#FFD700" />
                            {totalClassPoints.toLocaleString()}
                          </div>
                        </>
                      ) : (
                        <>
                          <SmilePlus size={40} />
                          <div style={{ marginTop: 10, fontWeight: '900', fontSize: '1rem', color: 'white' }}>{t('dashboard.whole_class')}</div>

                          {/* ⚡ TOTAL CLASS POINTS DISPLAY ⚡ */}
                          <div style={{
                            marginTop: '10px',
                            padding: '4px 12px',
                            background: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '16px',
                            fontSize: '18px',
                            fontWeight: '800',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(12px)'
                          }}>
                            <Trophy size={16} color="#FFD700" fill="#FFD700" />
                            {totalClassPoints.toLocaleString()} {t('dashboard.pts')}
                          </div>
                        </>
                      )}
                    </div>
                    {sortedStudents.map((s) => {
                      const today = new Date().toISOString().split('T')[0];
                      const isAbsentToday = absentStudents.has(s.id) || (s.attendance === 'absent' && s.attendanceDate === today);
                      return (

                        <div
                          key={s.id}
                          onClick={(event) => {
                            if (isMultiSelectMode) {
                              // Multi-select mode: toggle selection
                              const next = new Set(multiSelectedStudents);
                              if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                              setMultiSelectedStudents(next);
                            } else if (isAttendanceMode) {
                              const next = new Set(absentStudents);
                              if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                              setAbsentStudents(next);
                            } else if (event?.ctrlKey || event?.metaKey) {
                              const next = new Set(selectedStudents);
                              if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                              setSelectedStudents(next);
                            } else if (!isAbsentToday) {
                              setSelectedStudent(s);
                            }
                          }}
                          style={{
                            position: 'relative',
                            opacity: isMultiSelectMode
                              ? (multiSelectedStudents.size > 0 && !multiSelectedStudents.has(s.id) ? 0.4 : 1)
                              : (isAttendanceMode ? (isAbsentToday ? 0.4 : 1) : (isAbsentToday ? 0.4 : (selectedStudents.size > 0 && !selectedStudents.has(s.id) ? 0.5 : 1))),
                            transition: 'opacity 0.15s, filter 0.15s',
                            cursor: isMultiSelectMode || isAttendanceMode ? 'pointer' : isAbsentToday ? 'not-allowed' : 'default',
                            filter: isMultiSelectMode && !multiSelectedStudents.has(s.id) ? 'grayscale(1)' : (isAbsentToday ? 'grayscale(1)' : 'grayscale(0)'),
                            pointerEvents: 'auto'
                          }}
                        >
                          {/* Selection Circle - Shows in multi-select mode */}
                          {isMultiSelectMode && (
                            <div
                              style={{
                                position: 'absolute',
                                top: displaySize === 'compact' ? '6px' : '12px',
                                right: displaySize === 'compact' ? '6px' : '12px',
                                width: displaySize === 'compact' ? '24px' : '32px',
                                height: displaySize === 'compact' ? '24px' : '32px',
                                borderRadius: '50%',
                                background: multiSelectedStudents.has(s.id)
                                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                  : 'rgba(255, 255, 255, 0.9)',
                                border: multiSelectedStudents.has(s.id) ? 'none' : '2px solid #E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(10px)'
                              }}
                            >
                              {multiSelectedStudents.has(s.id) && <Check size={displaySize === 'compact' ? 14 : 18} color="white" />}
                            </div>
                          )}
                          <StudentCard
                            student={s}
                            isCompact={displaySize === 'compact'}
                            onClick={() => {
                              if (isAttendanceMode) {
                                const today = new Date().toISOString().split('T')[0];
                                const isAbsent = absentStudents.has(s.id);
                                const next = new Set(absentStudents);
                                if (isAbsent) {
                                  next.delete(s.id);
                                  updateClasses(prev => prev.map(c => 
                                    c.id === activeClass.id 
                                      ? { ...c, students: c.students.map(st => 
                                          st.id === s.id ? { ...st, attendance: 'present', attendanceDate: today } : st
                                        ) }
                                      : c
                                  ));
                                } else {
                                  next.add(s.id);
                                  updateClasses(prev => prev.map(c => 
                                    c.id === activeClass.id 
                                      ? { ...c, students: c.students.map(st => 
                                          st.id === s.id ? { ...st, attendance: 'absent', attendanceDate: today } : st
                                        ) }
                                      : c
                                  ));
                                }
                                setAbsentStudents(next);
                              } else if (!isAbsentToday && !isMultiSelectMode) {
                                setSelectedStudent(s);
                              }
                            }}
                            onEdit={handleEditStudent}
                            onDelete={() => setDeleteConfirmStudentId(s.id)}
                            animating={Boolean(animatingStudents && animatingStudents[s.id])}
                            animationType={animatingStudents && animatingStudents[s.id] ? animatingStudents[s.id].type : undefined}
                            disableActions={isMultiSelectMode}
                            disableClick={isMultiSelectMode}
                          />
                          {selectedStudents.has(s.id) && <div style={{ position: 'absolute', inset: 0, borderRadius: displaySize === 'compact' ? '50%' : '24px', border: '3px solid #4CAF50', pointerEvents: 'none', zIndex: 5 }} />}
                        </div>
                      );
                    })}
                    {/* Add Student Button - Same structure as StudentCard */}
                    <div
                      style={{
                        backgroundColor: 'white',
                        borderRadius: displaySize === 'compact' ? '12px' : '24px',
                        padding: displaySize === 'compact' ? '6px' : '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        position: 'relative',
                        aspectRatio: '1 / 1',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '2px dashed #ddd'
                      }}
                      onClick={(e) => { e.stopPropagation(); setIsAddStudentOpen(true); }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = '#6366F1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = '#ddd';
                      }}
                    >
                      <UserPlus size={displaySize === 'compact' ? 40 : 56} style={{ color: '#6366F1' }} />
                      <div style={{
                        marginTop: displaySize === 'compact' ? '8px' : '12px',
                        fontWeight: '700',
                        fontSize: displaySize === 'compact' ? '12px' : '1rem',
                        color: '#6366F1',
                        textAlign: 'center'
                      }}>{t('dashboard.add_student')}</div>
                    </div>

                  </div>
                </>
              )}
        </main>
        {/* MODALS */}
        {selectedStudent && <BehaviorModal student={selectedStudent} behaviors={activeClass.behaviors || behaviors} onClose={() => setSelectedStudent(null)} onGivePoint={handleGivePoint} />}
        {showClassBehaviorModal && (
          <BehaviorModal
            student={{ name: '', hideName: true }}
            behaviors={activeClass.behaviors || behaviors}
            onClose={() => setShowClassBehaviorModal(false)}
            onGivePoint={handleGivePointsToClass}
          />
        )}
        {showMultiSelectBehaviorModal && (
          <BehaviorModal
            student={{ name: '', hideName: true }}
            behaviors={activeClass.behaviors || behaviors}
            onClose={() => setShowMultiSelectBehaviorModal(false)}
            onGivePoint={handleGivePointsToMultiSelect}
          />
        )}
        {/* {isLuckyDrawOpen && <LuckyDrawModal students={activeClass.students} onClose={() => setIsLuckyDrawOpen(false)} onWinner={(s) => { setIsLuckyDrawOpen(false); setSelectedStudent(s); }} />} */}
        {isLuckyDrawOpen && (
          <LuckyDrawModal
            students={activeClass.students}
            onClose={closeModal}
            onWinner={(winnerData, points = 1) => {
              // Ensure the points chosen in the modal are used when awarding
              if (Array.isArray(winnerData)) {
                handleGivePointsToMultiple(winnerData, points);
              } else {
                // Single winner: award the chosen points as well
                handleGivePointsToMultiple([winnerData], points);
              }
              closeModal();
            }}
            onRequestAddStudents={() => setIsAddStudentOpen(true)}
            onOpenGames={onOpenGames}
          />
        )}

        {/* ⚡ OLD GRADING MODAL IS GONE - CLEANER CODE! ⚡ */}

        {isAddStudentOpen && (
          <AddStudentModal
            onClose={() => setIsAddStudentOpen(false)}
            onSave={(newStudent) => {
              const studentId = Date.now();
              const newCodes = { parentCode: generate5DigitCode(), studentCode: generate5DigitCode() };
              updateClasses((prev) => prev.map((c) => c.id === activeClass.id ? { ...c, students: [...c.students, { ...newStudent, id: studentId, score: 0 }], Access_Codes: { ...(c.Access_Codes || {}), [studentId]: newCodes } } : c));
              setIsAddStudentOpen(false);
            }}
          />
        )}

        {/* EDIT STUDENT MODAL */}
        {editingStudentId && (
          <div style={styles.overlay} className="modal-overlay-in">
            <div style={styles.modal} className="animated-modal-content modal-animate-center">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{t('edit_student.title')}</h3>
                <button style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', padding: 8, borderRadius: 8, transition: 'all 0.2s ease' }} onClick={() => { setEditingStudentId(null); setEditStudentName(''); setEditStudentAvatar(null); setEditSelectedSeed(null); setHoveredEditChar(null); }} onMouseEnter={(e) => e.target.style.transform = 'rotate(90deg) scale(1.1)'} onMouseLeave={(e) => e.target.style.transform = 'rotate(0deg) scale(1)'}><X /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, overflow: 'visible', position: 'relative' }} ref={editAvatarSectionRef}>
                <div
                  style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', border: '3px solid #E2E8F0', position: 'relative', cursor: 'pointer' }}
                  onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)}
                >
                  <SafeAvatar src={editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : boringAvatar(editStudentName || 'anon', 'boy'))} name={editStudentName} alt={editStudentName} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = boringAvatar(editStudentName); }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white', padding: '6px', borderRadius: '50%' }}><Camera size={14} /></div>
                </div>
                <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#64748B', fontWeight: 500, cursor: 'pointer' }} onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)}>
                  {t('edit_student.change_avatar')}
                </div>

                {/* Upload button */}
                <input ref={editFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files && e.target.files[0]; if (!f) return; if (f.size > 1024 * 1024) { alert(t('profile.image_too_large')); return; } const reader = new FileReader(); reader.onload = () => { setEditStudentAvatar(reader.result); setEditSelectedSeed(null); }; reader.readAsDataURL(f); }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
                  <button onClick={() => editFileInputRef.current && editFileInputRef.current.click()} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s ease' }}>
                    {editStudentAvatar ? t('profile.change_photo') : t('profile.upload_photo')}
                  </button>
                  {editStudentAvatar && (
                    <button onClick={() => setEditStudentAvatar(null)} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 500, fontSize: 13, color: '#64748b', transition: 'all 0.2s ease' }}>{t('profile.remove')}</button>
                  )}
                </div>
              </div>

              {/* AVATAR PICKER DROPDOWN - Rendered via portal to escape modal */}
              {showEditAvatarPicker && editAvatarSectionRef.current && (
                <>
                  {createPortal(
                    <div
                      style={{
                        position: 'fixed',
                        ...getEditDropdownPosition(),
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        zIndex: 100001,
                        padding: '16px',
                        minWidth: '550px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="animated-modal-content modal-animate-scale"
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' }}>
                        {AVATAR_OPTIONS.map((char) => (
                          <button
                            key={char.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditSelectedSeed(char.name);
                              setEditStudentAvatar(null);
                              setShowEditAvatarPicker(false);
                            }}
                            onMouseEnter={() => setHoveredEditChar(char.name)}
                            onMouseLeave={() => setHoveredEditChar(null)}
                            style={{
                              background: 'white',
                              border: '2px solid #e9ecef',
                              borderRadius: 10,
                              padding: 8,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 9,
                              color: '#666',
                              fontWeight: 500,
                              outline: 'none',
                              width: '70px',
                              justifySelf: 'center',
                              ...(editSelectedSeed === char.name ? styles.avatarOptionSelected : {}),
                              ...(hoveredEditChar === char.name ? { transform: 'scale(1.15)', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {})
                            }}
                            title={char.label}
                          >
                            <img src={avatarByCharacter(char.name)} alt={char.label} style={{ width: 32, height: 32, borderRadius: 6, ...(hoveredEditChar === char.name ? { transform: 'scale(5)', position: 'absolute', bottom: 'calc(100% - 80px)', left: '50%', marginLeft: '-20px', zIndex: 20 } : {}) }} />
                            <span style={{ fontSize: 8, color: '#999', textTransform: 'capitalize' }}>{char.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
                </>
              )}

              <input autoFocus placeholder={t('edit_student.student_name')} value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: 16, outline: 'none', fontSize: 14, color: '#334155', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }} onFocus={(e) => { e.target.style.borderColor = '#4CAF50'; e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }} />

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                {/* CANCEL BUTTON */}
                <button style={{ padding: '14px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer', flex: 1, transition: 'all 0.2s ease' }} onClick={() => { setEditingStudentId(null); setEditStudentName(''); setEditStudentAvatar(null); setEditSelectedSeed(null); setHoveredEditChar(null); }}>{t('edit_student.cancel')}</button>
                <button
                  data-save-student-btn
                  style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    flex: 1,
                    opacity: editStudentName.trim() ? 1 : 0.5,
                    cursor: editStudentName.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={handleSaveStudentEdit}
                  disabled={!editStudentName.trim()}
                >{t('edit_student.save_changes')}</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmStudentId && (
          <div style={styles.overlay}>
            <div style={{ ...styles.modal, width: 360 }}>
              <h3 style={{ marginBottom: 12 }}>{t('edit_student.delete_confirm')}</h3>
              <p style={{ color: '#666' }}>{t('edit_student.delete_sure')} <strong>'{activeClass.students.find((s) => s.id === deleteConfirmStudentId)?.name}'</strong>?</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setDeleteConfirmStudentId(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white' }}>{t('edit_student.cancel')}</button>
                <button onClick={() => handleDeleteStudent(activeClass.students.find((s) => s.id === deleteConfirmStudentId))} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#FF6B6B', color: 'white' }}>{t('edit_student.delete')}</button>
              </div>
            </div>
          </div>
        )}
        {showWhiteboard && (
          <Whiteboard onClose={closeModal} />
        )}

        {/* Points History Modal */}
        {showHistory && (
          <PointsHistoryView
            activeClass={activeClass}
            onClose={() => setShowHistory(false)}
            refreshClasses={refreshClasses}
          />
        )}

        <PointAnimation isVisible={showPoint.visible} studentAvatar={showPoint.student?.avatar} studentName={showPoint.student?.name} students={showPoint.student?.students} points={showPoint.points} behaviorEmoji={showPoint.behaviorEmoji} onComplete={() => setShowPoint({ visible: false, student: null, points: 0, behaviorEmoji: '⭐' })} />
      </div>

    </>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#F4F1EA', position: 'relative', overflow: 'hidden' },
  icon: { cursor: 'pointer', transition: 'color 0.2s', position: 'relative' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', height: '100vh', overflowY: 'auto', overflowX: 'hidden' },
  avatarOptionSelected: { background: 'white', border: '2px solid #4CAF50', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' },
  // header: { maxWidth: '1200px',padding: '0 20px', background: 'linear-gradient(90deg,#fff,#F8FFF8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 6px 18px rgba(16,24,40,0.06)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  addBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  // actionBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  // gridMenu: { position: 'absolute', top: '50px', right: 0, background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '220px' },
  // gridOption: { display: 'block', width: '100%', textAlign: 'left', padding: '10px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', border: '1px solid #ddd' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: 'white', padding: '24px', borderRadius: '20px', width: '360px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 10000, position: 'relative' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', background: '#FF5252', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  // REPLACE THESE KEYS IN YOUR styles OBJECT:
  // SURGICAL STYLE UPDATES
  header: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 'none',
    marginLeft: '0',
    width: '100%',
    borderRadius: '24px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxSizing: 'border-box',
    zIndex: 10 // Ensure header stays below dropdowns if needed, but above content
  },

  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #6366F1 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    width: '92%', height: '92%',
    fontWeight: '800',
    fontSize: '14px',
    letterSpacing: '0.5px',
    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)'
    , justifyContent: 'center',
  },


  gridMenu: {
    position: 'absolute',
    top: '56px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(8px)',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    zIndex: 99999, // IMPORTANT: Put this on top of everything
    minWidth: '180px',
    border: '1px solid rgba(0,0,0,0.04)'
  },

  gridOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    marginBottom: '6px',
    borderRadius: '10px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontWeight: '800',
    color: '#475569',
    fontSize: '13px',
    transition: 'all 0.16s ease'
  },
}