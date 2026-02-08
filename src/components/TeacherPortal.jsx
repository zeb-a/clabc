import { useState } from 'react';
import { Plus, LogOut, X, Edit2, Trash2, Upload, Edit3, Zap } from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';
import { boringAvatar } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import useIsTouchDevice from '../hooks/useIsTouchDevice';
import useWindowSize from '../hooks/useWindowSize';
import { useTranslation } from '../i18n';

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
`;

export default function TeacherPortal({ user, classes, onSelectClass, onAddClass, onLogout, onEditProfile, updateClasses, onOpenTorenado }) {
  const { t } = useTranslation();
  const isMobile = useWindowSize(768);
  const isTouchDevice = useIsTouchDevice();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTorenadoModal, setShowTorenadoModal] = useState(false);
  const [torenadoSelectedClass, setTorenadoSelectedClass] = useState(null);
  const [torenadoPlayers, setTorenadoPlayers] = useState([]);
  const [playerCount, setPlayerCount] = useState(2);
  const [isTeamMode, setIsTeamMode] = useState(false);

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

    console.log('[TeacherPortal] Saving torenado players to localStorage:', players);
    console.log('[TeacherPortal] Saving torenado config:', {
      playerCount: playerCount,
      isTeamMode: isTeamMode,
      classId: torenadoSelectedClass.id
    });

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
                    padding: '8px', borderRadius: '16px', transition: 'all 0.2s'
                  }}
                >
                  <SafeAvatar src={boringAvatar(seed)} name={seed} style={{ width: 64, height: 64, borderRadius: '16px' }} />
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
                    border: '3px solid white',
                    transition: 'all 0.2s'
                  }}>
                  <SafeAvatar
                    src={activeAvatar}
                    name={nameValue}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                opacity: nameValue.trim() ? 1 : 0.6,
                cursor: nameValue.trim() ? 'pointer' : 'not-allowed'
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

  return (
    <div style={{ ...styles.container, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}>
      <style>{internalCSS}</style>

      {/* --- NAV --- */}
      <nav className="safe-area-top" style={{ ...styles.nav }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowTorenadoModal(true)}
            style={{
              ...styles.logoutBtn,
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              border: '2px solid #A78BFA',
              color: '#fff',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
            title="Play Games"
          >
            <Zap size={14} />
            <span style={{ marginLeft: 4, fontWeight: 600 }}>Play Games</span>
          </button>
          <InlineHelpButton pageId="teacher-portal" />
          <button onClick={() => setLogoutConfirm(true)} title={t('teacher_portal.logout')} style={styles.logoutBtn}>
            <LogOut size={14} />
            <span style={{ marginLeft: 4, fontWeight: 600 }}>{t('teacher_portal.logout')}</span>
          </button>
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
            <button onClick={resetAddModal} style={styles.modalCloseAbs}>
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
            <button onClick={() => setEditingClassId(null)} style={styles.modalCloseAbs}>
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
            <button onClick={() => setDeleteConfirmId(null)} style={styles.modalCloseAbs}>
              <X size={20} />
            </button>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 16, overflow: 'hidden' }}>
                <SafeAvatar src={classToDelete.avatar || boringAvatar(classToDelete.name || 'class')} name={classToDelete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ marginBottom: 20, color: '#4B5563', fontSize: '1rem', lineHeight: 1.5 }}>
                {t('teacher_portal.delete_confirm').replace('{name}', classToDelete.name)}<br />
                <span style={{ fontSize: '0.85rem', color: '#EF4444' }}>{t('teacher_portal.cannot_undo')}</span>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleDeleteClass(deleteConfirmId)} className="btn-danger" style={{ ...styles.deleteConfirmBtn, flex: 1, padding: '12px 16px' }}>{t('teacher_portal.delete')}</button>
                <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary" style={{ ...styles.cancelBtn, flex: 1, padding: '12px 16px' }}>{t('general.cancel')}</button>
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
            <button onClick={() => setLogoutConfirm(false)} style={styles.modalCloseAbs}>
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
                <button onClick={() => { setLogoutConfirm(false); onLogout(); }} className="btn-danger" style={{ ...styles.deleteConfirmBtn, flex: 1, padding: '14px 16px', background: '#DC2626' }}>{t('teacher_portal.yes')}</button>
                <button onClick={() => setLogoutConfirm(false)} className="btn-secondary" style={{ ...styles.cancelBtn, flex: 1, padding: '14px 16px' }}>{t('teacher_portal.no')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TORENADO GAME MODAL --- */}
      {showTorenadoModal && (
        <div style={styles.editOverlay} onClick={() => setShowTorenadoModal(false)} className="modal-overlay-in">
          <div style={{ ...styles.deleteModal, maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTorenadoModal(false)} style={styles.torenadoModalCloseAbs}>
              <X size={20} />
            </button>
            <div style={styles.deleteModalTitle}>
              <span>🎮 Choose a Game</span>
            </div>

            {/* Game Selection */}
            <div style={{ marginTop: 20 }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', display: 'block' }}>
                🎯 Select Game Type:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    localStorage.setItem('selected_game_type', 'tornado');
                    setTorenadoSelectedClass(null);
                    setTorenadoPlayers([]);
                  }}
                  style={{
                    flex: 1,
                    padding: '15px 10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: localStorage.getItem('selected_game_type') === 'faceoff'
                      ? '#F3F4F6'
                      : 'linear-gradient(135deg, #3B82F6, #10B981)',
                    color: localStorage.getItem('selected_game_type') === 'faceoff' ? '#6B7280' : '#fff',
                    borderColor: localStorage.getItem('selected_game_type') === 'faceoff' ? '#E5E7EB' : '#059669',
                    boxShadow: localStorage.getItem('selected_game_type') === 'faceoff' ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🌪️</span>
                  <span>Tornado</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('selected_game_type', 'faceoff');
                    setTorenadoSelectedClass(null);
                    setTorenadoPlayers([]);
                  }}
                  style={{
                    flex: 1,
                    padding: '15px 10px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: localStorage.getItem('selected_game_type') === 'faceoff'
                      ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)'
                      : '#F3F4F6',
                    color: localStorage.getItem('selected_game_type') === 'faceoff' ? '#fff' : '#6B7280',
                    borderColor: localStorage.getItem('selected_game_type') === 'faceoff' ? '#FF6B6B' : '#E5E7EB',
                    boxShadow: localStorage.getItem('selected_game_type') === 'faceoff' ? '0 4px 15px rgba(255, 107, 107, 0.3)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>⚡</span>
                  <span>FaceOff</span>
                </button>
              </div>
            </div>

            {/* Only show class selection for Tornado (FaceOff handles this separately) */}
            {localStorage.getItem('selected_game_type') !== 'faceoff' && (
              <>
            {/* Class Selection - Grid of Cards */}
            <div style={{ marginTop: 15 }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', display: 'block' }}>
                📚 Select a Class:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '6px'
              }}>
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    onClick={() => {
                      setTorenadoSelectedClass(cls);
                      setTorenadoPlayers([]);
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: `2px solid ${torenadoSelectedClass?.id === cls.id ? '#8B5CF6' : '#E5E7EB'}`,
                      background: torenadoSelectedClass?.id === cls.id
                        ? 'linear-gradient(135deg, #8B5CF615, #EC489915)'
                        : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: torenadoSelectedClass?.id === cls.id
                        ? '0 3px 10px rgba(139, 92, 246, 0.25)'
                        : '0 1px 3px rgba(0,0,0,0.05)',
                      position: 'relative'
                    }}
                  >
                    <SafeAvatar
                      src={cls.avatar || boringAvatar(cls.name || 'class')}
                      name={cls.name}
                      style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: torenadoSelectedClass?.id === cls.id ? '#8B5CF6' : '#374151',
                        marginBottom: '2px'
                      }}>
                        {cls.name}
                      </div>
                      <div style={{
                        fontSize: '9px',
                        color: '#6B7280',
                        fontWeight: '500'
                      }}>
                        {cls.students?.length || 0}
                      </div>
                    </div>
                    {torenadoSelectedClass?.id === cls.id && (
                      <div style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 6px rgba(139, 92, 246, 0.4)'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Mode Toggle */}
            {torenadoSelectedClass && (
              <div style={{ marginTop: 15 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', display: 'block' }}>
                  🎮 Game Mode:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setIsTeamMode(false); setPlayerCount(2); setTorenadoPlayers([]); }}
                    style={{
                      ...styles.logoutBtn,
                      flex: 1,
                      minWidth: '90px',
                      padding: '10px 12px',
                      fontSize: '13px',
                      background: isTeamMode ? '#F3F4F6' : 'linear-gradient(135deg, #3B82F6, #10B981)',
                      color: isTeamMode ? '#6B7280' : '#fff',
                      border: isTeamMode ? '2px solid #E5E7EB' : '2px solid #059669',
                      boxShadow: isTeamMode ? 'none' : '0 3px 10px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    👤 Individual
                  </button>
                  <button
                    onClick={() => { setIsTeamMode(true); setPlayerCount(2); setTorenadoPlayers([]); }}
                    style={{
                      ...styles.logoutBtn,
                      flex: 1,
                      minWidth: '90px',
                      padding: '10px 12px',
                      fontSize: '13px',
                      background: isTeamMode ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#F3F4F6',
                      color: isTeamMode ? '#fff' : '#6B7280',
                      border: isTeamMode ? '2px solid #A78BFA' : '2px solid #E5E7EB',
                      boxShadow: isTeamMode ? '0 3px 10px rgba(139, 92, 246, 0.3)' : 'none'
                    }}
                  >
                    👥 Teams
                  </button>
                </div>
              </div>
            )}

            {/* Player Count */}
            {torenadoSelectedClass && isTeamMode && (
              <div style={{ marginTop: 15 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', display: 'block' }}>
                  👥 Teams:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      style={{
                        padding: '10px 18px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        border: '2px solid',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: playerCount === count
                          ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                          : 'rgba(255, 255, 255, 0.8)',
                        borderColor: playerCount === count ? '#F59E0B' : '#E5E7EB',
                        color: playerCount === count ? '#fff' : '#4B5563',
                        boxShadow: playerCount === count
                          ? '0 3px 10px rgba(245, 158, 11, 0.3)'
                          : 'none',
                        transform: playerCount === count ? 'scale(1.05)' : 'scale(1)'
                      }}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Student/Team Selection Display */}
            {torenadoSelectedClass && (
              <div style={{ marginTop: 15, maxHeight: '200px', overflowY: 'auto', padding: '8px', background: '#F9FAFB', borderRadius: '10px' }}>
                {isTeamMode ? (
                  <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
                    <p style={{ marginBottom: '8px', fontWeight: '600' }}>
                      Teams:
                    </p>
                    <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      {Array.from({ length: playerCount }).map((_, i) => {
                        const teamMembers = (torenadoSelectedClass.students || []).filter((_, idx) => idx % playerCount === i);
                        const teamColor = ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i];
                        return (
                          <div key={i} style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: teamColor + '20',
                            border: `2px solid ${teamColor}`
                          }}>
                            <strong style={{ color: teamColor, fontSize: '12px' }}>Team {i + 1}</strong>
                            <ul style={{ margin: '6px 0 0 12px', paddingLeft: '16px', fontSize: '11px' }}>
                              {teamMembers.map(student => (
                                <li key={student.id}>{student.name}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '600' }}>
                      Select students (Max 4):
                    </p>
                    <div style={{ display: 'grid', gap: '6px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      {torenadoSelectedClass.students.map(student => {
                        const isSelected = torenadoPlayers.some(p => p.id === student.id);
                        const isMaxReached = torenadoPlayers.length >= 4;
                        return (
                          <button
                            key={student.id}
                            onClick={() => toggleStudentForTorenado(student.id)}
                            disabled={!isSelected && isMaxReached}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '2px solid',
                              cursor: !isSelected && isMaxReached ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease',
                              background: isSelected
                                ? 'linear-gradient(135deg, #10B981, #059669)'
                                : '#fff',
                              borderColor: isSelected ? '#10B981' : '#E5E7EB',
                              color: isSelected ? '#fff' : '#4B5563',
                              opacity: !isSelected && isMaxReached ? '0.5' : '1',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: '500',
                              position: 'relative'
                            }}
                          >
                            {isSelected ? '✓ ' : ''}{student.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            </>
            )}

            {/* FaceOff-specific: Show class selection and start button */}
            {localStorage.getItem('selected_game_type') === 'faceoff' && (
              <div style={{ marginTop: 15 }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', display: 'block' }}>
                  📚 Select a Class:
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '8px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  padding: '6px'
                }}>
                  {classes.map(cls => (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setTorenadoSelectedClass(cls);
                        setTorenadoPlayers([]);
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: `2px solid ${torenadoSelectedClass?.id === cls.id ? '#FF6B6B' : '#E5E7EB'}`,
                        background: torenadoSelectedClass?.id === cls.id
                          ? 'linear-gradient(135deg, #FF6B6B15, #FF8E8E15)'
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: torenadoSelectedClass?.id === cls.id
                          ? '0 3px 10px rgba(255, 107, 107, 0.25)'
                          : '0 1px 3px rgba(0,0,0,0.05)',
                        position: 'relative'
                      }}
                    >
                      <SafeAvatar
                        src={cls.avatar || boringAvatar(cls.name || 'class')}
                        name={cls.name}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: torenadoSelectedClass?.id === cls.id ? '#FF6B6B' : '#374151',
                          marginBottom: '2px'
                        }}>
                          {cls.name}
                        </div>
                        <div style={{
                          fontSize: '9px',
                          color: '#6B7280',
                          fontWeight: '500'
                        }}>
                          {cls.students?.length || 0}
                        </div>
                      </div>
                      {torenadoSelectedClass?.id === cls.id && (
                        <div style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 6px rgba(255, 107, 107, 0.4)'
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Start Button */}
                {torenadoSelectedClass && (
                  <div style={{ marginTop: 15 }}>
                    <button
                      onClick={handleTorenadoStartGame}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                        color: '#fff',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                      }}
                    >
                      ⚡ Start FaceOff
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tornado-specific: Continue with existing setup UI */}
            {localStorage.getItem('selected_game_type') !== 'faceoff' && (
              <>
            {/* Start Button */}
            {torenadoSelectedClass && (
              <div style={{ marginTop: 15 }}>
                <button
                  onClick={handleTorenadoStartGame}
                  disabled={isTeamMode ? false : torenadoPlayers.length < 2}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899, #F59E0B)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                    opacity: isTeamMode ? 1 : torenadoPlayers.length >= 2 ? 1 : 0.5,
                    pointerEvents: isTeamMode ? 'auto' : torenadoPlayers.length >= 2 ? 'auto' : 'none'
                  }}
                >
           🚀 Start Game
                </button>
              </div>
            )}
            </>
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
  navAvatarBtn: { background: 'transparent', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
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
  saveBtn: { width: '100%', padding: '16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(76, 175, 80, 0.2)' },
  cancelBtn: { width: '100%', padding: '14px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' },

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
  torenadoModalCloseAbs: { position: 'absolute', top: 24, right: 24, background: '#F3F4F6', border: 'none', cursor: 'pointer', padding: 8, borderRadius: '50%', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' },

  // Avatar Selector Grid
  themeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
    overflowY: 'auto', flex: 1, padding: '4px'
  },
};