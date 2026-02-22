import { useState, useEffect } from 'react';
import { Plus, LogOut, X, Edit2, Trash2, Upload, Edit3, Zap, FileText, BookOpen, MoreVertical } from 'lucide-react';
import { boringAvatar } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import useIsTouchDevice from '../hooks/useIsTouchDevice';
import useWindowSize from '../hooks/useWindowSize';
import { useTranslation } from '../i18n';
import { useTheme } from '../ThemeContext';

// Internal CSS for animations and layout stability
const internalCSS = `
  @keyframes pulse-border {
    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
  }
  @media (max-width: 480px) {
    .class-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
    }
  }
  @media (min-width: 481px) and (max-width: 640px) {
    .class-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  @media (min-width: 641px) and (max-width: 768px) {
    .class-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  .class-card-hover:hover {
    transform: translateY(-5px);
    border-color: #4CAF50 !important;
  }
  .add-card-hover:hover {
    background-color: #F0FDF4 !important;
    border-color: #4CAF50 !important;
    color: #4CAF50 !important;
    animation: pulse-border 2s infinite;
  }
  .avatar-trigger-hover:hover {
    opacity: 0.98;
    /* avoid scaling which can cause mouseleave/mouseenter flicker */
    transform: translateY(-2px);
    border-color: #4CAF50 !important;
    box-shadow: 0 8px 20px rgba(16,24,40,0.06);
  }
  .theme-item:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    z-index: 5;
  }
  .btn-primary {
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
  }
  .btn-danger {
    transition: all 0.2s ease;
  }
  .btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  }
  .btn-secondary {
    transition: all 0.2s ease;
  }
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    background: #E5E7EB;
  }
  .hover-show { opacity: 0; transition: opacity 160ms ease; pointer-events: none; }
  .avatar-trigger-hover:hover .hover-show { opacity: 1; }
  /* Logout button styles */
  .logout-btn { background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border: 2px solid #FECACA; padding: 11px 18px; border-radius: 14px; display: inline-flex; align-items: center; gap: 8px; color: #DC2626; cursor: pointer; transition: all 160ms ease; font-weight: 700; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1); }
  .logout-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.25); background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-color: #F87171; }

  /* Tab button hover effect */
  .tab-button:hover:not(:active) {
    transform: translateY(-2px);
  }

  /* Fix dark mode borders for modal */
  @media (prefers-color-scheme: dark) {
    .game-modal-container {
      border: none !important;
      background-image: none !important;
    }
    button[data-hamburger-btn="true"] {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
    }
  }

  /* Nav avatar button border in dark mode */
  @media (prefers-color-scheme: dark) {
    button[style*="background: transparent"],
    button[style*="background: transparent"] * {
      border-color: #4a4a4a !important;
    }
  }

  /* Game card hover effect */
  .game-card:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12) !important;
  }

  /* Class card hover effect */
  .class-card-modal:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
  }

  /* Start button hover effect */
  .start-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
  }

  /* Mobile responsive adjustments for tabbed modal */
  @media (max-width: 640px) {
    .game-modal-container {
      width: 95vw !important;
      max-width: 95vw !important;
      padding: 16px !important;
    }
    .tab-button {
      padding: 12px 8px !important;
      fontSize: 13px !important;
      minHeight: 44px !important;
    }
    .game-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px !important;
    }
    .game-card {
      padding: 16px 8px !important;
      minHeight: 90px !important;
    }
    .class-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px !important;
    }
    .class-card-modal {
      padding: 12px 8px !important;
      minHeight: 100px !important;
    }
    .class-card-avatar {
      width: 40px !important;
      height: 40px !important;
    }
  }

  @media (min-width: 641px) {
    .game-modal-container {
      width: 550px !important;
    }
  }
`;

export default function TeacherPortal({ user, classes, onSelectClass, onAddClass, onLogout, onEditProfile, updateClasses, onOpenTorenado, onOpenLessonPlanner, openGamesModal }) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const isMobile = useWindowSize(768);
  const isTouchDevice = useIsTouchDevice();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTorenadoModal, setShowTorenadoModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [torenadoSelectedClass, setTorenadoSelectedClass] = useState(null);
  const [torenadoPlayers, setTorenadoPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(2);
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [activeTab, setActiveTab] = useState('game');

  // Open games modal when requested
  useEffect(() => {
    if (openGamesModal) {
      const existingGame = localStorage.getItem('selected_game_type');
      if (!existingGame) {
        localStorage.setItem('selected_game_type', 'tornado');
      }
      setTorenadoSelectedClass(null);
      setTorenadoPlayers([]);
      setActiveTab('game');
      setShowTorenadoModal(true);
    }
  }, [openGamesModal]);

  // --- Add Class State ---
  const [newClassName, setNewClassName] = useState('');
  const [newClassAvatar, setNewClassAvatar] = useState(null);
  const [showAvatarSelectorNew, setShowAvatarSelectorNew] = useState(false);

  // --- Edit Class State ---
  const [hoveredClassId, setHoveredClassId] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingClassName, setEditingClassName] = useState('');
  const [editingClassAvatar, setEditingClassAvatar] = useState(null);
  const [showAvatarSelectorEdit, setShowAvatarSelectorEdit] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Diverse seeds to generate distinct looking avatars
  const avatarSeeds = [
    'Daisy', 'Sky', 'Rock', 'Jazz', 'Ocean', 
    'Mars', 'Luna', 'Pixel', 'Sonic', 'Zap', 
    'Coco', 'Lemon', 'Ruby', 'Aqua', 'Bear',
    'Fox', 'Owl', 'Tiger', 'Lion', 'Wolf'
  ];

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;

    const newClass = {
      id: Date.now(),
      name: newClassName,
      students: [],
      avatar: newClassAvatar || boringAvatar(newClassName || 'class'),
      stats: { stars: 0, eggs: 0 }
    };

    onAddClass(newClass);
    resetAddModal();
  };

  const resetAddModal = () => {
    setNewClassName('');
    setNewClassAvatar(null);
    setShowAvatarSelectorNew(false);
    setShowAddModal(false);
  };

  const handleEditClass = (cls) => {
    setEditingClassId(cls.id);
    setEditingClassName(cls.name);
    setEditingClassAvatar(null);
    setShowAvatarSelectorEdit(false);
  };

  const handleSaveEdit = (classId) => {
    const updated = (classes || []).map(c =>
      c.id === classId
        ? { ...c, name: editingClassName, avatar: editingClassAvatar || c.avatar }
        : c
    );
    updateClasses(updated);
    setEditingClassId(null);
  };

  const handleDeleteClass = (classId) => {
    const updated = (classes || []).filter(c => c.id !== classId);
    updateClasses(updated);
    setDeleteConfirmId(null);
  };

  // --- TORENADO GAME HANDLERS ---
  const handleTorenadoStartGame = () => {
    if (!torenadoSelectedClass) return;

    const selectedGameType = localStorage.getItem('selected_game_type');
    if (selectedGameType === 'quiz' || selectedGameType === 'motorace' || selectedGameType === 'liveworksheet') {
      localStorage.setItem('torenado_players', JSON.stringify([]));
      localStorage.setItem('torenado_config', JSON.stringify({ classId: torenadoSelectedClass.id }));
      setShowTorenadoModal(false);
      if (onOpenTorenado) onOpenTorenado();
      else window.location.hash = 'torenado';
      return;
    }

    const selectedStudents = torenadoSelectedClass.students || [];
    let players = [];

    if (isTeamMode) {
      // Team mode - assign students to teams
      const teams = [];
      for (let i = 0; i < playerCount; i++) {
        teams.push({
          id: i,
          name: `Team ${i + 1}`,
          color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i],
          students: []
        });
      }

      selectedStudents.forEach((student, index) => {
        const teamIndex = index % playerCount;
        teams[teamIndex].students.push(student.name);
      });

      players = teams.map(team => ({
        id: team.id,
        name: team.name,
        color: team.color,
        members: team.students
      }));
    } else {
      // Individual mode - use selected students
      if (torenadoPlayers.length === 0) {
        // If no students selected, use first 2
        const studentList = selectedStudents.slice(0, 2).map(student => ({
          id: student.id,
          name: student.name,
          color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][selectedStudents.indexOf(student) % 4]
        }));
        players = studentList;
      } else {
        // Use selected students
        players = torenadoPlayers.map(p => ({
          id: p.id,
          name: p.name,
          color: p.color
        }));
      }
    }

    setTorenadoPlayers(players);
    setShowTorenadoModal(false);

    // Store in localStorage for TornadoGameWrapper
    localStorage.setItem('torenado_players', JSON.stringify(players));
    localStorage.setItem('torenado_config', JSON.stringify({
      playerCount: playerCount,
      isTeamMode: isTeamMode,
      classId: torenadoSelectedClass.id
    }));

    // Navigate to torenado view
    if (onOpenTorenado) {
      onOpenTorenado();
    } else {
      window.location.hash = 'torenado';
    }
  };

  const toggleStudentForTorenado = (studentId) => {
    if (isTeamMode) return; // In team mode, all students are automatically assigned

    setTorenadoPlayers(prev => {
      const isSelected = prev.some(p => p.id === studentId);
      if (isSelected) {
        return prev.filter(p => p.id !== studentId);
      } else {
        if (prev.length >= 4) return prev; // Max 4 players - disable further selections
        const student = torenadoSelectedClass.students.find(s => s.id === studentId);
        return [...prev, {
          id: student.id,
          name: student.name,
          color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][prev.length]
        }];
      }
    });
  };

  // Helper: Content for Modal
  const renderModalContent = (
    mode, // 'add' or 'edit'
    nameValue, setNameValue,
    avatarValue, setAvatarValue,
    showSelector, setShowSelector,
    onSave,
    currentClassId
  ) => {
    const activeAvatar = avatarValue || boringAvatar(nameValue || (mode === 'add' ? t('teacher_portal.add_new_class') : t('teacher_portal.class_name')));

    return (
      <div style={{ marginTop: 45, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {showSelector ? (
          // --- AVATAR SELECTION GRID (Visual Only) ---
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4B5563', textAlign: 'center' }}>
              {t('teacher_portal.change')}
            </h4>
            <div className="avatar-grid-scroll" style={styles.themeGrid}>
              {avatarSeeds.map(seed => (
                <div
                  key={seed}
                  onClick={() => { setAvatarValue(boringAvatar(seed)); setShowSelector(false); }}
                  className="theme-item"
                  style={{
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px', borderRadius: '16px', transition: 'all 0.2s',
                    border: '2px solid #E5E7EB', backgroundColor: '#FFFFFF'
                  }}
                >
                  <SafeAvatar src={boringAvatar(seed)} name={seed} style={{ width: 64, height: 64, borderRadius: '16px', border: '2px solid #E5E7EB' }} />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSelector(false)}
              className="btn-secondary"
              style={{ ...styles.cancelBtn, marginTop: 16 }}
            >
              {t('general.cancel')}
            </button>
          </div>
        ) : (
          // --- STANDARD FORM LAYOUT (Better Distribution) ---
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Top Section: Avatar + Name */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
              {/* Avatar Trigger */}
              <div style={{ width: 90, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  onClick={() => setShowSelector(true)}
                  className="avatar-trigger-hover"
                  style={{
                    width: 90, height: 90, borderRadius: 20, overflow: 'hidden',
                    background: '#F3F4F6', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '3px solid #E5E7EB',
                    transition: 'all 0.2s'
                  }}>
                  <SafeAvatar
                    src={activeAvatar}
                    name={nameValue}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid #E5E7EB' }}
                  />
                </div>
                <button onClick={() => setShowSelector(true)} style={styles.textBtn}>{t('teacher_portal.change')}</button>
              </div>

              {/* Class Name Input */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <label style={styles.label}>{t('teacher_portal.class_name')}</label>
                <input
                  style={styles.largeInput}
                  placeholder={mode === 'add' ? t('teacher_portal.name_placeholder') : ""}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  autoFocus={mode === 'add'}
                />
              </div>
            </div>

            {/* Middle Section: Large Dropzone to fill whitespace */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
               <label style={styles.label}>{t('teacher_portal.upload_photo')}</label>
               <label
                  htmlFor={`upload-${mode}-${currentClassId || 'new'}`}
                  style={styles.largeDropzone}
               >
                  <div style={{ background: '#F3F4F6', padding: 12, borderRadius: '50%', marginBottom: 8 }}>
                    <Upload size={20} color="#6B7280" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>{t('teacher_portal.click_upload')}</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('teacher_portal.file_types')}</span>
               </label>
               <input
                  id={`upload-${mode}-${currentClassId || 'new'}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setAvatarValue(reader.result);
                    reader.readAsDataURL(file);
                  }}
                  style={{ display: 'none' }}
                />
            </div>

            {/* Bottom Section: Action Button */}
            <div>
              <button
                onClick={onSave}
                className="btn-primary"
                style={{
                  ...styles.saveBtn,
                  ...(isDark
                    ? {
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 45%, #065f46 100%)',
                        borderColor: '#16a34a',
                        boxShadow: '0 8px 22px rgba(22,163,74,0.55)',
                      }
                    : {}),
                  opacity: nameValue.trim() ? 1 : 0.6,
                  cursor: nameValue.trim() ? 'pointer' : 'not-allowed',
                }}
                disabled={!nameValue.trim()}
              >
                {mode === 'add' ? t('teacher_portal.create') : t('teacher_portal.save')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const classToEdit = classes ? classes.find(c => c.id === editingClassId) : null;
  const classToDelete = classes ? classes.find(c => c.id === deleteConfirmId) : null;

  // Helper functions for game selection display
  const getSelectedGameName = () => {
    const type = localStorage.getItem('selected_game_type');
    const names = {
      'tornado': t('games.tornado'),
      'faceoff': t('games.faceoff'),
      'memorymatch': t('games.memorymatch'),
      'quiz': t('games.quiz'),
      'motorace': t('games.motorace'),
      'horserace': t('games.horserace'),
      'liveworksheet': t('games.liveworksheet')
    };
    return names[type] || t('games.choose');
  };

  const getSelectedGameEmoji = () => {
    const type = localStorage.getItem('selected_game_type');
    const emojis = {
      'tornado': '🌪️',
      'faceoff': '⚡',
      'memorymatch': '🧠',
      'quiz': '🎯',
      'motorace': '🏍️',
      'horserace': '🐴',
      'liveworksheet': '📄'
    };
    return emojis[type] || '🎮';
  };

  const getSelectedGameColor = () => {
    const type = localStorage.getItem('selected_game_type');
    const colors = {
      'tornado': 'linear-gradient(135deg, #3B82F6, #10B981)',
      'faceoff': 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
      'memorymatch': 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      'quiz': 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
      'motorace': 'linear-gradient(135deg, #F97316, #EA580C)',
      'horserace': 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      'liveworksheet': 'linear-gradient(135deg, #EC4899, #8B5CF6)'
    };
    return colors[type] || 'linear-gradient(135deg, #667eea, #764ba2)';
  };

  return (
    <div style={{ ...styles.container, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}>
      <style>{internalCSS}</style>

      {/* --- NAV --- */}
      <nav className="safe-area-top" style={{ ...styles.nav }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={(e) => { e.stopPropagation(); onEditProfile && onEditProfile(); }} title={t('teacher_portal.edit_profile')} style={styles.navAvatarBtn}>
                <SafeAvatar
                  src={user.avatar}
                  name={user.name || user.email}
                  style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }}
                />
              </button>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>
                {user.title ? `${user.title} ` : ''}{user.name || user.email}
              </div>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{
                background: 'transparent',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                border: 'none',
                padding: '12px',
                borderRadius: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                outline: 'none'
              }}
              data-hamburger-btn="true"
            >
              <MoreVertical size={24} color="#374151" />
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
                {onOpenLessonPlanner && (
                  <button
                    onClick={onOpenLessonPlanner}
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      color: '#000',
                      padding: '14px 20px',
                      borderRadius: '16px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
                    }}
                    title="Lesson Planner"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    <BookOpen size={18} />
                    <span>Lesson Planner</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const existingGame = localStorage.getItem('selected_game_type');
                    if (!existingGame) {
                      localStorage.setItem('selected_game_type', 'tornado');
                    }
                    setTorenadoSelectedClass(null);
                    setTorenadoPlayers([]);
                    setActiveTab('class');
                    setShowTorenadoModal(true);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    color: '#8B5CF6',
                    padding: '14px 20px',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textShadow: 'none'
                  }}
                  title={t('teacher_portal.play_games')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.25)';
                  }}
                >
                  <Zap size={18} />
                  <span>{t('games.title')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setLogoutConfirm(true)}
                  title={t('teacher_portal.logout')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#EF4444',
                    padding: '14px 20px',
                    borderRadius: '16px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.15)';
                  }}
                >
                  <LogOut size={18} />
                  <span>{t('teacher_portal.logout')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <main style={{ ...styles.main, paddingTop: isMobile ? '100px' : '120px' }}>
        <div style={{ ...styles.header }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>{t('teacher_portal.my_classes')}</h2>
        </div>

        <div className="class-grid" style={{
          ...styles.grid,
          ...styles.grid,
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : styles.grid.gridTemplateColumns,
          gap: isMobile ? '8px' : styles.grid.gap
        }}>
          {/* --- EXISTING CLASSES --- */}
          {(classes || []).map((cls) => (
            <div
              key={cls.id}
              className="class-card-hover"
              title={t('teacher_portal.click_open').replace('{name}', cls.name).replace('{count}', cls.students.length)}
              onClick={() => {
                if (!hoveredClassId && !isMobile) return;
                onSelectClass(cls.id);
              }}
              onMouseEnter={() => setHoveredClassId(cls.id)}
              onMouseLeave={() => setHoveredClassId(null)}
              style={{
                ...styles.classCard,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
            >
              {/* Edit/Delete Icons */}
              <button
                onClick={(e) => { e.stopPropagation(); handleEditClass(cls); }}
                style={{
                  ...styles.iconBtn,
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  opacity: (hoveredClassId === cls.id || isTouchDevice) ? 1 : 0,
                  pointerEvents: (hoveredClassId === cls.id || isTouchDevice) ? 'auto' : 'none',
                  transition: 'opacity 0.2s ease',
                  zIndex: 10
                }}
                title={t('teacher_portal.edit')}
              >
                <Edit2 size={18} />
              </button>
              {cls.id !== 'demo-class' && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(cls.id); }}
                  style={{
                    ...styles.iconBtn,
                    color: '#FF6B6B',
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    opacity: (hoveredClassId === cls.id || isTouchDevice) ? 1 : 0,
                    pointerEvents: (hoveredClassId === cls.id || isTouchDevice) ? 'auto' : 'none',
                    transition: 'opacity 0.2s ease',
                    zIndex: 10
                  }}
                  title="Delete class"
                >
                  <Trash2 size={18} />
                </button>
              )}

              {/* Demo Badge */}
              {cls.id === 'demo-class' && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                  zIndex: 10
                }}>
                  DEMO
                </div>
              )}

              {/* Class Card Visuals */}
              <div style={styles.classIcon}>
                <div style={{ width: '85%', height: 110, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SafeAvatar
                    src={cls.avatar || boringAvatar(cls.name || 'class')}
                    name={cls.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                  />
                </div>
              </div>
              <h3 style={{ margin: '10px 0 5px' }}>{cls.name}</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t('teacher_portal.students_count').replace('{count}', cls.students.length)}</p>
            </div>
          ))}

          {/* --- ADD CLASS CARD --- */}
          <div
            className="add-card-hover"
            title={t('teacher_portal.add_new_class')}
            onClick={() => setShowAddModal(true)}
            style={{
              ...styles.classCard,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #CBD5E1',
              backgroundColor: '#F8FAFC',
              boxShadow: 'none',
              color: '#64748B',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ background: 'white', padding: 12, borderRadius: '50%', marginBottom: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <Plus size={32} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{t('teacher_portal.add_new_class')}</span>
          </div>
        </div>
      </main>

      {/* --- ADD CLASS MODAL --- */}
      {showAddModal && (
        <div style={styles.overlay} className="modal-overlay-in">
          <div style={styles.standardModal} className="animated-modal-content modal-animate-center">
            <div style={styles.modalTitleAbs}>{t('teacher_portal.create_new_class')}</div>
            <button onClick={resetAddModal} style={styles.modalCloseAbs} data-close-btn="true">
              <X size={20} />
            </button>
            {renderModalContent(
              'add',
              newClassName, setNewClassName,
              newClassAvatar, setNewClassAvatar,
              showAvatarSelectorNew, setShowAvatarSelectorNew,
              handleCreateClass,
              null
            )}
          </div>
        </div>
      )}

      {/* --- EDIT CLASS MODAL --- */}
      {editingClassId && classToEdit && (
        <div style={styles.editOverlay} onClick={() => setEditingClassId(null)} className="modal-overlay-in">
          <div style={styles.standardModal} onClick={(e) => e.stopPropagation()} className="animated-modal-content modal-animate-center">
            <div style={styles.modalTitleAbs}>{t('teacher_portal.edit_class')}</div>
            <button onClick={() => setEditingClassId(null)} style={styles.modalCloseAbs} data-close-btn="true">
              <X size={20} />
            </button>
            {renderModalContent(
              'edit',
              editingClassName, setEditingClassName,
              editingClassAvatar || classToEdit.avatar, setEditingClassAvatar,
              showAvatarSelectorEdit, setShowAvatarSelectorEdit,
              () => handleSaveEdit(editingClassId),
              editingClassId
            )}
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      {deleteConfirmId && classToDelete && (
        <div style={styles.editOverlay} onClick={() => setDeleteConfirmId(null)} className="modal-overlay-in">
          <div style={styles.deleteModal} onClick={(e) => e.stopPropagation()} className="animated-modal-content modal-animate-center">
            <div style={styles.deleteModalTitle}>{t('teacher_portal.delete_class')}</div>
            <button onClick={() => setDeleteConfirmId(null)} style={styles.modalCloseAbs} data-close-btn="true">
              <X size={20} />
            </button>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 16, overflow: 'hidden' }}>
                <SafeAvatar src={classToDelete.avatar || boringAvatar(classToDelete.name || 'class')} name={classToDelete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ marginBottom: 20, color: isDark ? '#E5E7EB' : '#4B5563', fontSize: '1rem', lineHeight: 1.5 }}>
                {t('teacher_portal.delete_confirm').replace('{name}', classToDelete.name)}<br />
                <span style={{ fontSize: '0.85rem', color: '#FCA5A5' }}>{t('teacher_portal.cannot_undo')}</span>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleDeleteClass(deleteConfirmId)}
                  className="btn-danger"
                  style={{
                    ...styles.deleteConfirmBtn,
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #EF4444',
                    ...(isDark
                      ? {
                          background: 'linear-gradient(135deg, #f97373 0%, #ef4444 40%, #991b1b 100%)',
                          boxShadow: '0 8px 22px rgba(239,68,68,0.6)',
                        }
                      : {}),
                  }}
                >
                  {t('teacher_portal.delete')}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-secondary"
                  style={{
                    ...styles.cancelBtn,
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #D1D5DB',
                    ...(isDark
                      ? {
                          background: '#020617',
                          borderColor: '#4b5563',
                          color: '#E5E7EB',
                        }
                      : {}),
                  }}
                >
                  {t('general.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT CONFIRM MODAL --- */}
      {logoutConfirm && (
        <div style={styles.editOverlay} onClick={() => setLogoutConfirm(false)}>
          <div style={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteModalTitle}>{t('teacher_portal.sure_logout')}</div>
            <button onClick={() => setLogoutConfirm(false)} style={styles.modalCloseAbs} data-close-btn="true">
              <X size={20} />
            </button>
            <div style={{ marginTop: 50, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', borderRadius: 20, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={40} color="#DC2626" />
              </div>
              <p style={{ marginBottom: 30, color: '#4B5563', fontSize: '1.1rem', lineHeight: 1.5 }}>
                {t('teacher_portal.sure_logout')}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setLogoutConfirm(false); onLogout(); }} className="btn-danger" style={{ ...styles.deleteConfirmBtn, flex: 1, padding: '14px 16px', background: '#DC2626', border: '2px solid #DC2626' }}>{t('teacher_portal.yes')}</button>
                <button onClick={() => setLogoutConfirm(false)} className="btn-secondary" style={{ ...styles.cancelBtn, flex: 1, padding: '14px 16px', border: '2px solid #D1D5DB' }}>{t('teacher_portal.no')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MOBILE MENU MODAL --- */}
      {showMobileMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            style={{
              background: 'white',
              height: '100%',
              width: '280px',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowMobileMenu(false)} style={{ alignSelf: 'flex-end', padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#374151" />
            </button>

            {onOpenLessonPlanner && (
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onOpenLessonPlanner();
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))',
                  border: '2px solid #4CAF50',
                  color: '#4CAF50',
                  padding: '16px',
                  borderRadius: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)'
                }}
              >
                <BookOpen size={20} />
                <span>Lesson Planner</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowMobileMenu(false);
                const existingGame = localStorage.getItem('selected_game_type');
                if (!existingGame) {
                  localStorage.setItem('selected_game_type', 'tornado');
                }
                setTorenadoSelectedClass(null);
                setTorenadoPlayers([]);
                setActiveTab('class');
                setShowTorenadoModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                border: '2px solid #8B5CF6',
                color: '#8B5CF6',
                padding: '16px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
              }}
            >
              <Zap size={20} />
              <span>{t('games.title')}</span>
            </button>

            <button
              onClick={() => {
                setShowMobileMenu(false);
                setLogoutConfirm(true);
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                border: '2px solid #EF4444',
                color: '#EF4444',
                padding: '16px',
                borderRadius: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
              }}
            >
              <LogOut size={20} />
              <span>{t('teacher_portal.logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* --- TORENADO GAME MODAL --- */}
      {showTorenadoModal && (
        <div style={styles.editOverlay} onClick={() => setShowTorenadoModal(false)} className="modal-overlay-in">
          <div
            style={{
              ...styles.gameModalContainer,
              ...(isDark
                ? {
                    background: 'linear-gradient(145deg, #020617 0%, #111827 60%, #1e293b 100%)',
                    borderColor: 'rgba(148,163,184,0.8)',
                    boxShadow: '0 25px 60px -12px rgba(15,23,42,0.9)',
                  }
                : {}),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowTorenadoModal(false)} style={styles.torenadoModalCloseAbs} data-close-btn="true">
              <X size={20} />
            </button>

            {/* Tab Navigation */}
            <div style={styles.tabContainer}>
              <button
                onClick={() => setActiveTab('game')}
                style={{
                  ...styles.tabButton,
                  background: activeTab === 'game' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: activeTab === 'game' ? 'white' : '#6B7280',
                  borderColor: activeTab === 'game' ? '#667eea' : '#E5E7EB',
                  boxShadow: activeTab === 'game' ? '0 4px 15px rgba(102, 126, 234, 0.35)' : '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                🎮 Choose Game
              </button>
              <button
                onClick={() => setActiveTab('class')}
                style={{
                  ...styles.tabButton,
                  background: activeTab === 'class' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                  color: activeTab === 'class' ? 'white' : '#6B7280',
                  borderColor: activeTab === 'class' ? '#667eea' : '#E5E7EB',
                  boxShadow: activeTab === 'class' ? '0 4px 15px rgba(102, 126, 234, 0.35)' : '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                📚 Choose Class
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ ...styles.tabContent, overflowY: 'auto', overflowX: 'hidden' }}>
              {activeTab === 'game' ? (
                /* --- GAME SELECTION TAB --- */
                <div style={{ ...styles.gameGrid, paddingTop: '5px' }}>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'tornado');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'tornado'
                        ? 'linear-gradient(135deg, #3B82F6, #10B981)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'tornado' ? '#10B981' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'tornado' ? '0 4px 15px rgba(16, 185, 129, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🌪️</span>
                    <span style={styles.gameCardText}>{t('games.tornado')}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'faceoff');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'faceoff'
                        ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'faceoff' ? '#FF6B6B' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'faceoff' ? '0 4px 15px rgba(255, 107, 107, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>⚡</span>
                    <span style={styles.gameCardText}>{t('games.faceoff')}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'memorymatch');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'memorymatch'
                        ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'memorymatch' ? '#8B5CF6' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'memorymatch' ? '0 4px 15px rgba(139, 92, 246, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🧠</span>
                    <span style={styles.gameCardText}>{t('games.memorymatch')}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'quiz');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'quiz'
                        ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'quiz' ? '#0EA5E9' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'quiz' ? '0 4px 15px rgba(14, 165, 233, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🎯</span>
                    <span style={styles.gameCardText}>{t('games.quiz')}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'motorace');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'motorace'
                        ? 'linear-gradient(135deg, #F97316, #EA580C)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'motorace' ? '#F97316' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'motorace' ? '0 4px 15px rgba(249, 115, 22, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🏍️</span>
                    <span style={styles.gameCardText}>{t('games.motorace')}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'horserace');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'horserace'
                        ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'horserace' ? '#8B5CF6' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'horserace' ? '0 4px 15px rgba(139, 92, 246, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🐴</span>
                    <span style={styles.gameCardText}>{t('games.horserace')}</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'spelltheword');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'spelltheword'
                        ? 'linear-gradient(135deg, #EC4899, #F59E0B)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'spelltheword' ? '#EC4899' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'spelltheword' ? '0 4px 15px rgba(236, 72, 153, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>🔤</span>
                    <span style={styles.gameCardText}>Spell the Word</span>
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_game_type', 'liveworksheet');
                      setTorenadoSelectedClass(null);
                      setTorenadoPlayers([]);
                      setActiveTab('class'); // Auto-switch to class tab
                    }}
                    style={{
                      ...styles.gameCard,
                      background: localStorage.getItem('selected_game_type') === 'liveworksheet'
                        ? 'linear-gradient(135deg, #EC4899, #8B5CF6)'
                        : 'white',
                      borderColor: localStorage.getItem('selected_game_type') === 'liveworksheet' ? '#EC4899' : '#E5E7EB',
                      boxShadow: localStorage.getItem('selected_game_type') === 'liveworksheet' ? '0 4px 15px rgba(236, 72, 153, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  >
                    <span style={{ fontSize: '36px' }}>📄</span>
                    <span style={styles.gameCardText}>{t('games.liveworksheet')}</span>
                  </button>
                </div>
              ) : (
                /* --- CLASS SELECTION TAB --- */
                <div style={styles.classGrid}>
                  {classes.map(cls => {
                    const selectedGameType = localStorage.getItem('selected_game_type');
                    const studentCount = cls.students?.length || 0;
                    const minPlayers = {
                      'tornado': 2,
                      'faceoff': 2,
                      'memorymatch': 2,
                      'quiz': 0,
                      'motorace': 1,
                      'horserace': 2,
                      'liveworksheet': 0
                    }[selectedGameType] || 2;
                    const hasEnoughPlayers = studentCount >= minPlayers;

                    return (
                      <div
                        key={cls.id}
                        onClick={() => hasEnoughPlayers && setTorenadoSelectedClass(cls)}
                        style={{
                          ...styles.classCardInModal,
                          borderColor: torenadoSelectedClass?.id === cls.id ? '#667eea' : '#E5E7EB',
                          background: torenadoSelectedClass?.id === cls.id
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
                            : !hasEnoughPlayers ? '#F8FAFC' : 'white',
                          boxShadow: torenadoSelectedClass?.id === cls.id
                            ? '0 4px 15px rgba(102, 126, 234, 0.25)'
                            : '0 2px 6px rgba(0,0,0,0.06)',
                          cursor: hasEnoughPlayers ? 'pointer' : 'not-allowed',
                          opacity: !hasEnoughPlayers ? 0.6 : 1
                        }}
                      >
                        <SafeAvatar
                          src={cls.avatar || boringAvatar(cls.name || 'class')}
                          name={cls.name}
                          style={{
                            ...styles.classCardAvatar,
                            opacity: !hasEnoughPlayers ? 0.5 : 1
                          }}
                        />
                        <div style={styles.classCardInfo}>
                          <div style={{
                            ...styles.classNameText,
                            color: torenadoSelectedClass?.id === cls.id ? '#667eea' : '#374151'
                          }}>
                            {cls.name}
                          </div>
                          <div style={{
                            ...styles.studentCountText,
                            color: !hasEnoughPlayers ? '#EF4444' : '#6B7280'
                          }}>
                            {studentCount} students
                          </div>
                          {!hasEnoughPlayers && (
                            <div style={{
                              fontSize: '9px',
                              fontWeight: '600',
                              color: '#EF4444',
                              marginTop: '2px',
                              textAlign: 'center'
                            }}>
                              {minPlayers > 0
                                ? `Need ${minPlayers}+ players`
                                : 'Not available'
                              }
                            </div>
                          )}
                        </div>
                        {torenadoSelectedClass?.id === cls.id && hasEnoughPlayers && (
                          <div style={styles.checkmarkBadge}>✓</div>
                        )}
                        {(!hasEnoughPlayers || torenadoSelectedClass?.id !== cls.id) && !hasEnoughPlayers && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#EF4444',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            !
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Start Button - Only show when class is selected */}
            {torenadoSelectedClass && activeTab === 'class' && (
              <div style={styles.startButtonContainer}>
                <button
                  onClick={handleTorenadoStartGame}
                  style={styles.startButton}
                >
                  {localStorage.getItem('selected_game_type') === 'tornado' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🌪️</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'faceoff' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>⚡</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'memorymatch' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🧠</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'quiz' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🎯</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'motorace' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🏍️</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'horserace' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🐴</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'spelltheword' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🔤</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {localStorage.getItem('selected_game_type') === 'liveworksheet' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>📄</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {!localStorage.getItem('selected_game_type') && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '28px' }}>🎮</span> continue <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#F4F1EA', overflowX: 'hidden', boxSizing: 'border-box' },
  nav: { display: 'flex', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #ddd', boxSizing: 'border-box', minHeight: '50px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 },
  logoutBtn: { background: '#FEF2F2', border: '1px solid #FECACA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 8, color: '#DC2626', fontWeight: 600, transition: 'all 0.2s', fontSize: '12px' },
  navAvatarBtn: { background: 'transparent', border: '2px solid #E5E7EB', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '10px' },
  avatarHint: { display: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', marginTop: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(184px, 1fr))', gap: '14px', maxWidth: '100%', padding: '8px 16px 16px' }, 

  // Card Styles
  classCard: { background: 'white', padding: '23px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.06)', minHeight: '195px', display: 'flex', flexDirection: 'column' },
  iconBtn: { background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4CAF50', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  classIcon: { marginBottom: 6, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' },

  // Modal System
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(3px)' },

  // Standard Modal (Optimized height for distribution)
  standardModal: {
    background: 'white',
    padding: '32px',
    borderRadius: '24px',
    width: '480px',
    maxWidth: '90vw',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto', // Allow content to drive height
    minHeight: '420px' // Ensure enough height for the dropzone
  },

  // Absolute Header Elements
  modalTitleAbs: { position: 'absolute', top: 24, left: 32, fontSize: '20px', fontWeight: 'bold', color: '#111827' },
  modalCloseAbs: { position: 'absolute', top: 20, right: 20, background: '#F3F4F6', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' },

  // Form Elements
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: 6, textAlign: 'left' },
  largeInput: { width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', background: '#F9FAFB' },
  
  // Large Dropzone
  largeDropzone: {
    flex: 1, // Fills vertical space
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'white', border: '2px dashed #E5E7EB', borderRadius: '16px',
    cursor: 'pointer', transition: 'all 0.2s', minHeight: '120px'
  },

  textBtn: {
    background: 'none', border: 'none', color: '#4CAF50', fontSize: '12px',
    fontWeight: '600', cursor: 'pointer', padding: '6px 0',
  },

  // Buttons
  saveBtn: { width: '100%', padding: '16px', background: '#4CAF50', color: 'white', border: '2px solid #4CAF50', borderRadius: '16px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(76, 175, 80, 0.2)' },
  cancelBtn: { width: '100%', padding: '14px', background: '#F3F4F6', color: '#374151', border: '2px solid #D1D5DB', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '14px', background: '#EF4444', color: 'white', border: '2px solid #EF4444', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' },

  // Delete Modal (Compact - no minHeight constraint)
  deleteModal: {
    background: 'white',
    padding: '32px',
    borderRadius: '24px',
    width: '480px',
    maxWidth: '90vw',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    height: 'auto'
  },

  deleteModalTitle: { position: 'absolute', top: 24, left: 32, fontSize: '20px', fontWeight: 'bold', color: '#111827' },

  // Torenado Modal Close Button (positioned at top right)
  torenadoModalCloseAbs: { position: 'absolute', top: 12, right: 16, background: '#F3F4F6', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', zIndex: 1000 },

  // Game Modal Container (tabbed interface)
  gameModalContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '24px',
    width: '550px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    border: 'none',
    overflow: 'hidden'
  },

  // Tab Container
  tabContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    paddingTop: '8px'
  },

  // Tab Button
  tabButton: {
    flex: '0.4',
    padding: '14px 12px',
    fontSize: '14px',
    fontWeight: '700',
    border: '2px solid',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    minHeight: '48px',
    boxSizing: 'border-box',
    userSelect: 'none'
  },

  // Tab Content Area
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    overflowY: 'auto'
  },

  // Game Grid
  gameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    paddingBottom: '8px'
  },

  // Game Card
  gameCard: {
    padding: '20px 12px',
    borderRadius: '16px',
    border: '2px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '100px',
    userSelect: 'none'
  },

  // Game Card Text
  gameCardText: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151'
  },

  // Class Grid in Modal
  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '12px',
    maxHeight: '350px',
    overflowY: 'auto',
    paddingBottom: '8px',
    paddingRight: '4px'
  },

  // Selected Game Indicator
  selectedGameIndicator: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#F8FAFC',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid #E5E7EB'
  },

  // Class Card in Modal
  classCardInModal: {
    padding: '16px 12px',
    borderRadius: '14px',
    border: '2px solid #E5E7EB',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    minHeight: '110px',
    userSelect: 'none'
  },

  // Class Card Avatar
  classCardAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    objectFit: 'cover'
  },

  // Class Card Info
  classCardInfo: {
    textAlign: 'center',
    width: '100%'
  },

  // Class Name Text
  classNameText: {
    fontSize: '12px',
    fontWeight: '700',
    marginBottom: '2px'
  },

  // Student Count Text
  studentCountText: {
    fontSize: '10px',
    color: '#6B7280',
    fontWeight: '500'
  },

  // Checkmark Badge
  checkmarkBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
  },

  // Start Button Container
  startButtonContainer: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #E5E7EB'
  },

  // Start Button
  startButton: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },

  // Avatar Selector Grid
  themeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
    overflowY: 'auto', flex: 1, padding: '4px'
  },
};