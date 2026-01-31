import { useState } from 'react';
import { Plus, LogOut, X, Edit2, Trash2, Upload, Edit3 } from 'lucide-react';
import InlineHelpButton from './InlineHelpButton';
import { boringAvatar } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import useIsTouchDevice from '../hooks/useIsTouchDevice';
import useWindowSize from '../hooks/useWindowSize';

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
  /* Custom scrollbar for avatar grid */
  .avatar-grid-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .avatar-grid-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .avatar-grid-scroll::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  /* Logout button styles */
  .logout-btn { background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border: 2px solid #FECACA; padding: 11px 18px; border-radius: 14px; display: inline-flex; align-items: center; gap: 8px; color: #DC2626; cursor: pointer; transition: all 160ms ease; font-weight: 700; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1); }
  .logout-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.25); background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-color: #F87171; }
`;

export default function TeacherPortal({ user, classes, onSelectClass, onAddClass, onLogout, onEditProfile, updateClasses }) {
  const isMobile = useWindowSize(768);
  const isTouchDevice = useIsTouchDevice();
  const [showAddModal, setShowAddModal] = useState(false);

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

  // Helper: Content for Modal
  const renderModalContent = (
    mode, // 'add' or 'edit'
    nameValue, setNameValue,
    avatarValue, setAvatarValue,
    showSelector, setShowSelector,
    onSave,
    currentClassId
  ) => {
    const activeAvatar = avatarValue || boringAvatar(nameValue || (mode === 'add' ? 'New Class' : 'Class'));

    return (
      <div style={{ marginTop: 45, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {showSelector ? (
          // --- AVATAR SELECTION GRID (Visual Only) ---
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#4B5563', textAlign: 'center' }}>
              Pick an icon
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
              Cancel
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
                <button onClick={() => setShowSelector(true)} style={styles.textBtn}>Change</button>
              </div>

              {/* Class Name Input */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <label style={styles.label}>Class Name</label>
                <input
                  style={styles.largeInput}
                  placeholder={mode === 'add' ? "e.g. 5th Grade Science" : ""}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  autoFocus={mode === 'add'}
                />
              </div>
            </div>

            {/* Middle Section: Large Dropzone to fill whitespace */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 20 }}>
               <label style={styles.label}>Or upload your own photo</label>
               <label
                  htmlFor={`upload-${mode}-${currentClassId || 'new'}`}
                  style={styles.largeDropzone}
               >
                  <div style={{ background: '#F3F4F6', padding: 12, borderRadius: '50%', marginBottom: 8 }}>
                    <Upload size={20} color="#6B7280" />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>Click to upload image</span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>SVG, PNG, JPG</span>
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
              {mode === 'add' ? 'Create Class' : 'Save Changes'}
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
      <nav className="safe-area-top" style={{ ...styles.nav, paddingTop: 'calc(var(--safe-top, 0px) + 16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={(e) => { e.stopPropagation(); onEditProfile && onEditProfile(); }} title="Edit Profile" style={styles.navAvatarBtn}>
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
          <InlineHelpButton pageId="teacher-portal" />
          <button onClick={() => setLogoutConfirm(true)} title="Logout" style={styles.logoutBtn}>
            <LogOut size={14} />
            <span style={{ marginLeft: 4, fontWeight: 600 }}>Logout</span>
          </button>
        </div>
      </nav>

      <main style={{ ...styles.main, paddingTop: isMobile ? '60px' : '80px' }}>
        <div style={{ ...styles.header }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>My Classes</h2>
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
              title={`Click to open ${cls.name} (${cls.students.length} students)`}
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
                title="Edit class"
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
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{cls.students.length} Students</p>
            </div>
          ))}

          {/* --- ADD CLASS CARD --- */}
          <div
            className="add-card-hover"
            title="Add a new class"
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
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Add New Class</span>
          </div>
        </div>
      </main>

      {/* --- ADD CLASS MODAL --- */}
      {showAddModal && (
        <div style={styles.overlay} className="modal-overlay-in">
          <div style={styles.standardModal} className="animated-modal-content modal-animate-center">
            <div style={styles.modalTitleAbs}>Create New Class</div>
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
            <div style={styles.modalTitleAbs}>Edit Class</div>
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
            <div style={styles.deleteModalTitle}>Delete Class?</div>
            <button onClick={() => setDeleteConfirmId(null)} style={styles.modalCloseAbs}>
              <X size={20} />
            </button>
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: 16, overflow: 'hidden' }}>
                <SafeAvatar src={classToDelete.avatar || boringAvatar(classToDelete.name || 'class')} name={classToDelete.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ marginBottom: 20, color: '#4B5563', fontSize: '1rem', lineHeight: 1.5 }}>
                Are you sure you want to delete <b>{classToDelete.name}</b>?<br />
                <span style={{ fontSize: '0.85rem', color: '#EF4444' }}>This cannot be undone.</span>
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleDeleteClass(deleteConfirmId)} className="btn-danger" style={{ ...styles.deleteConfirmBtn, flex: 1, padding: '12px 16px' }}>Delete</button>
                <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary" style={{ ...styles.cancelBtn, flex: 1, padding: '12px 16px' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT CONFIRM MODAL --- */}
      {logoutConfirm && (
        <div style={styles.editOverlay} onClick={() => setLogoutConfirm(false)}>
          <div style={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.deleteModalTitle}>Are you sure?</div>
            <button onClick={() => setLogoutConfirm(false)} style={styles.modalCloseAbs}>
              <X size={20} />
            </button>
            <div style={{ marginTop: 50, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', borderRadius: 20, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={40} color="#DC2626" />
              </div>
              <p style={{ marginBottom: 30, color: '#4B5563', fontSize: '1.1rem', lineHeight: 1.5 }}>
                Are you sure you want to logout?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setLogoutConfirm(false); onLogout(); }} className="btn-danger" style={{ ...styles.deleteConfirmBtn, flex: 1, padding: '14px 16px', background: '#DC2626' }}>Yes</button>
                <button onClick={() => setLogoutConfirm(false)} className="btn-secondary" style={{ ...styles.cancelBtn, flex: 1, padding: '14px 16px' }}>No</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#F4F1EA', overflowX: 'hidden', boxSizing: 'border-box' },
  nav: { padding: '8px 16px', display: 'flex', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #ddd', boxSizing: 'border-box', minHeight: '50px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 },
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

  // Avatar Selector Grid
  themeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
    overflowY: 'auto', flex: 1, padding: '4px'
  },
};