import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { boringAvatar, fallbackInitialsDataUrl, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import { X, Camera } from 'lucide-react';
import SafeAvatar from './SafeAvatar';
import { detectGender } from '../utils/gender';
import { useModalKeyboard } from '../hooks/useKeyboardShortcuts';

export default function AddStudentModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('boy');
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);
  const avatarSectionRef = useRef(null);
  const fileInputRef = useRef(null);

  const getDropdownPosition = useCallback(() => {
    if (!avatarSectionRef.current) return { top: 0, left: 0 };

    const rect = avatarSectionRef.current.getBoundingClientRect();
    return {
      top: rect.top - 200,
      left: rect.left + rect.width / 2 - 275
    };
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please choose a smaller image (under 1MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedAvatar(reader.result);
      setSelectedCharacter(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle keyboard shortcuts
  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        gender,
        avatar: uploadedAvatar,
        character: selectedCharacter
      });
    }
  };

  useModalKeyboard(handleSave, onClose, !showAvatarPicker);

  // Use selected character if available, otherwise generate from name
  const avatarUrl = uploadedAvatar || (selectedCharacter ? avatarByCharacter(selectedCharacter) : (name ? boringAvatar(name, gender) : fallbackInitialsDataUrl(gender === 'boy' ? 'B' : 'G')));

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    console.log('Avatar clicked, current state:', showAvatarPicker);
    setShowAvatarPicker(!showAvatarPicker);
  };

  return (
    <div style={styles.overlay} className="modal-overlay-in">
      <div style={styles.modal} className="animated-modal-content modal-animate-center">
        <div style={styles.modalHeader}>
          <h3>Enrol New Student</h3>
          <button style={styles.closeBtn} onClick={onClose}><X /></button>
        </div>

        <div style={{ ...styles.avatarSection, overflow: 'visible', position: 'relative' }} ref={avatarSectionRef}>
          <div
            style={{ ...styles.previewContainer, cursor: 'pointer' }}
            onClick={handleAvatarClick}
          >
            <img src={avatarUrl} alt="Preview" style={styles.previewImg} onError={(e) => { e.target.onerror = null; e.target.src = fallbackInitialsDataUrl(name); }} />
            <div style={styles.cameraBadge}><Camera size={14} /></div>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#64748B', fontWeight: 500, cursor: 'pointer' }} onClick={handleAvatarClick}>
            Change avatar
          </div>

          {/* Upload button */}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
            <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={styles.uploadBtn}>
              {uploadedAvatar ? 'Change Photo' : 'Upload Photo'}
            </button>
            {uploadedAvatar && (
              <button onClick={() => { setUploadedAvatar(null); }} style={styles.removeBtn}>Remove</button>
            )}
          </div>
        </div>

        {/* GENDER SELECTION */}
        <div style={styles.genderSection}>
          <label style={styles.genderLabel}>Gender</label>
          <div style={styles.genderButtons}>
            <button
              onClick={() => setGender('boy')}
              style={{
                ...styles.genderBtn,
                ...(gender === 'boy' ? styles.genderBtnActive : {})
              }}
            >
              👦 Boy
            </button>
            <button
              onClick={() => setGender('girl')}
              style={{
                ...styles.genderBtn,
                ...(gender === 'girl' ? styles.genderBtnActive : {})
              }}
            >
              👧 Girl
            </button>
          </div>
        </div>

        {/* AVATAR PICKER DROPDOWN - Rendered via portal to escape modal */}
        {showAvatarPicker && avatarSectionRef.current && (
          <>
            {createPortal(
              <div
                style={{
                  position: 'fixed',
                  ...getDropdownPosition(),
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
                <div style={styles.avatarGrid}>
                  {AVATAR_OPTIONS.map(char => (
                    <button
                      key={char.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCharacter(char.name);
                        setUploadedAvatar(null);
                        setShowAvatarPicker(false);
                      }}
                      onMouseEnter={() => setHoveredChar(char.name)}
                      onMouseLeave={() => setHoveredChar(null)}
                      style={{
                        ...styles.avatarOption,
                        ...(selectedCharacter === char.name ? styles.avatarOptionSelected : {}),
                        ...(hoveredChar === char.name ? { transform: 'scale(1.15)', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {})
                      }}
                      title={char.label}
                    >
                      <img src={avatarByCharacter(char.name)} alt={char.label} style={{ ...styles.avatarImg, ...(hoveredChar === char.name ? { transform: 'scale(5)', position: 'absolute', bottom: 'calc(100% - 80px)', left: '50%', marginLeft: '-20px', zIndex: 20 } : {}) }} />
                      <span style={styles.avatarLabel}>{char.name}</span>
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
          </>
        )}

        {/* NAME INPUT WITH AUTO-GENDER DETECTION */}
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            // Auto-detect gender when name changes
            if (e.target.value.trim()) {
              const detectedGender = detectGender(e.target.value);
              setGender(detectedGender);
            }
          }}
          onBlur={() => {
            // Auto-detect gender when mouse leaves input
            if (name.trim()) {
              const detectedGender = detectGender(name);
              setGender(detectedGender);
            }
          }}
          style={styles.input}
        />
        {!name.trim() && (
          <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 8 }}>Please enter a student's name.</div>
        )}

        <div style={styles.footer}>
          {/* CANCEL BUTTON */}
          <button style={styles.cancelBtn} onClick={onClose}>Cancel (Esc)</button>
          <button
            data-enter-submit
            data-save-student-btn
            style={{
              ...styles.saveBtn,
              opacity: name.trim() ? 1 : 0.6,
              cursor: name.trim() ? 'pointer' : 'not-allowed'
            }}
            onClick={handleSave}
            disabled={!name.trim()}
          >Add Student (Enter)</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 10000, position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', overflow: 'visible', position: 'relative' },
  previewContainer: { position: 'relative', marginBottom: '12px' },
  previewImg: { width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', border: '3px solid #E2E8F0' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white', padding: '6px', borderRadius: '50%' },
  uploadBtn: { padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 14 },
  removeBtn: { padding: '8px 12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 13 },
  genderSection: { marginBottom: '20px' },
  genderLabel: { display: 'block', marginBottom: '8px', fontSize: 14, fontWeight: 600, color: '#334155' },
  genderButtons: { display: 'flex', gap: '12px' },
  genderBtn: { flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748B', transition: 'all 0.2s' },
  genderBtnActive: { borderColor: '#4CAF50', background: '#F0FDF4', color: '#16A34A' },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' },
  avatarOption: { background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#666', fontWeight: 500, outline: 'none', width: '70px', justifySelf: 'center', position: 'relative' },
  avatarOptionSelected: { background: 'white', border: '2px solid #4CAF50', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' },
  avatarImg: { width: '32px', height: '32px', borderRadius: '6px' },
  avatarLabel: { fontSize: '8px', color: '#999', textTransform: 'capitalize' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', outline: 'none', fontSize: 15, color: '#334155' },
  footer: { display: 'flex', gap: 10, marginTop: '10px' },
  cancelBtn: { padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#F1F5F9', color: '#64748B', fontWeight: 600, fontSize: 14, cursor: 'pointer', flex: 1 },
  saveBtn: { padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#4CAF50', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', flex: 1 }
};
