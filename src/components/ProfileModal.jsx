import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { boringAvatar, fallbackInitialsDataUrl, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import { useModalKeyboard } from '../hooks/useKeyboardShortcuts';
import { Camera, X } from 'lucide-react';

export default function ProfileModal({ user, onSave, onClose }) {
  const [name, setName] = useState(user.name || '');
  const [avatar, setAvatar] = useState(user.avatar || boringAvatar(user.name || user.email));
  // If avatar is a character avatar, try to match to a preset name
  function getInitialSelectedAvatar() {
    if (!user.avatar) return '';
    for (const opt of AVATAR_OPTIONS) {
      if (user.avatar === avatarByCharacter(opt.name)) return opt.name;
    }
    return '';
  }
  const [selectedCharacter, setSelectedCharacter] = useState(getInitialSelectedAvatar());
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [hoveredChar, setHoveredChar] = useState(null);
  const avatarSectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const getDropdownPosition = useCallback(() => {
    if (!avatarSectionRef.current) return { top: 0, left: 0 };

    const rect = avatarSectionRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 10,
      left: rect.left + rect.width / 2 - 275
    };
  }, []);

  // Handle keyboard shortcuts (Enter to save, Escape to cancel)
  const handleSaveWithValidation = () => {
    if (password && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    handleSave({ preventDefault: () => {} });
  };

  useModalKeyboard(handleSaveWithValidation, onClose, !showAvatarPicker);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (password && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      let avatarToSave = avatar;
      // If a preset character is selected, use it
      if (selectedCharacter) {
        avatarToSave = avatarByCharacter(selectedCharacter);
      }
      // If an uploaded image is selected, use it
      if (uploadedAvatar) {
        avatarToSave = uploadedAvatar;
      }
      // Pass user id explicitly so API knows who to update
      await onSave({ id: user.id, name, avatar: avatarToSave, password, oldPassword });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Warn if file is too large (avatar images should be small)
    if (file.size > 1024 * 1024) {
      setError('Image is too large. Please choose a smaller image (under 1MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setUploadedAvatar(reader.result);
      setSelectedCharacter(''); // clear preset selection if uploading
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    setShowAvatarPicker(!showAvatarPicker);
  };

  const currentAvatar = uploadedAvatar || (selectedCharacter ? avatarByCharacter(selectedCharacter) : (name ? boringAvatar(name) : fallbackInitialsDataUrl('U')));

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Edit Profile</h2>
        <button onClick={onClose} style={styles.closeBtn}><X /></button>
        <form onSubmit={handleSave} style={styles.form}>
          {/* AVATAR SECTION */}
          <div style={{ ...styles.avatarSection, overflow: 'visible', position: 'relative' }} ref={avatarSectionRef}>
            <div
              style={{ ...styles.previewContainer, cursor: 'pointer' }}
              onClick={handleAvatarClick}
            >
              <img src={currentAvatar} alt="Preview" style={styles.previewImg} onError={(e) => { e.target.onerror = null; e.target.src = fallbackInitialsDataUrl(name); }} />
              <div style={styles.cameraBadge}><Camera size={14} /></div>
            </div>
            <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#64748B', fontWeight: 500, cursor: 'pointer' }} onClick={handleAvatarClick}>
              Change avatar
            </div>

            {/* Upload button */}
            <input ref={fileInputRef} id="profile-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={styles.uploadBtn}>
                {uploadedAvatar ? 'Change Photo' : 'Upload Photo'}
              </button>
              {uploadedAvatar && (
                <button type="button" onClick={() => { setUploadedAvatar(null); setSelectedCharacter(''); }} style={styles.removeBtn}>Remove</button>
              )}
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

          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={styles.input} />
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current Password (to change password)" style={styles.input} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" style={styles.input} />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm New Password" style={styles.input} />
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          <button data-enter-submit type="submit" style={styles.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, minWidth: 380, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  closeBtn: { position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94A3B8' },
  form: { display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 10, overflow: 'visible', position: 'relative' },
  previewContainer: { position: 'relative', marginBottom: '12px' },
  previewImg: { width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', border: '3px solid #E2E8F0' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white', padding: '6px', borderRadius: '50%' },
  uploadBtn: { padding: '10px 14px', borderRadius: '12px', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 14 },
  removeBtn: { padding: '8px 12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 13 },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' },
  avatarOption: { background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', padding: '8px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#666', fontWeight: 500, outline: 'none', width: '70px', justifySelf: 'center', position: 'relative' },
  avatarOptionSelected: { background: 'white', border: '2px solid #4CAF50', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' },
  avatarImg: { width: '32px', height: '32px', borderRadius: '6px' },
  avatarLabel: { fontSize: '8px', color: '#999', textTransform: 'capitalize' },
  input: { padding: 10, borderRadius: 8, border: '1px solid #eee', fontSize: 15 },
  saveBtn: { background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }
};
