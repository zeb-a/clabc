import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { boringAvatar, fallbackInitialsDataUrl, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import { useModalKeyboard } from '../hooks/useKeyboardShortcuts';
import { Camera, X } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function ProfileModal({ user, onSave, onClose }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(user.title || '');
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
      left: rect.left + rect.width / 2 - 175
    };
  }, []);

  // Handle keyboard shortcuts (Enter to save, Escape to cancel)
  const handleSaveWithValidation = () => {
    if (password && password !== confirm) {
      setError(t('profile.passwords_no_match'));
      return;
    }
    if (!name.trim()) {
      setError(t('profile.name_empty'));
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
      await onSave({ id: user.id, title, name, avatar: avatarToSave, password, oldPassword });
      onClose();
    } catch (err) {
      setError(err.message || t('profile.failed_update'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Warn if file is too large (avatar images should be small)
    if (file.size > 1024 * 1024) {
      setError(t('profile.image_too_large'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result);
      setUploadedAvatar(reader.result);
      setSelectedCharacter(''); // clear preset selection if uploading
    };
    reader.onerror = () => setError(t('profile.failed_read'));
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    setShowAvatarPicker(!showAvatarPicker);
  };

  const currentAvatar = uploadedAvatar || (selectedCharacter ? avatarByCharacter(selectedCharacter) : (name ? boringAvatar(name) : fallbackInitialsDataUrl('U')));

  return (
    <div style={styles.overlay} className="modal-overlay-in">
      <div style={styles.modal} className="animated-modal-content modal-animate-center">
        <h2>{t('profile.edit_profile')}</h2>
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
              {t('profile.change_avatar')}
            </div>

            {/* Upload button */}
            <input ref={fileInputRef} id="profile-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={styles.uploadBtn}>
                {uploadedAvatar ? t('profile.change_photo') : t('profile.upload_photo')}
              </button>
              {uploadedAvatar && (
                <button type="button" onClick={() => { setUploadedAvatar(null); setSelectedCharacter(''); }} style={styles.removeBtn}>{t('profile.remove')}</button>
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
                    padding: '12px',
                    minWidth: '350px'
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

          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ ...styles.input, width: '80px', padding: '8px' }}
            >
              <option value="">Title</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Miss">Miss</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
            </select>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('profile.full_name')} style={{ ...styles.input, flex: 1 }} />
          </div>
          <input type="text" value={user.email || ''} readOnly placeholder={t('profile.email')} style={{ ...styles.input, background: '#F8FAFC', cursor: 'not-allowed' }} />
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder={t('profile.current_password')} style={styles.input} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('profile.new_password')} style={styles.input} />
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={t('profile.confirm_new_password')} style={styles.input} />
          {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
          <button data-enter-submit type="submit" style={styles.saveBtn} disabled={saving}>{saving ? t('profile.saving') : t('profile.save_changes')}</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: 16, padding: 25, minWidth: 300, maxWidth: 320, position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  closeBtn: { position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94A3B8' },
  form: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8, overflow: 'visible', position: 'relative' },
  previewContainer: { position: 'relative', marginBottom: '10px' },
  previewImg: { width: '80px', height: '80px', borderRadius: '50%', background: '#F8FAFC', border: '3px solid #E2E8F0' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white', padding: '5px', borderRadius: '50%' },
  uploadBtn: { padding: '8px 12px', borderRadius: '10px', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 13 },
  removeBtn: { padding: '7px 10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: 12 },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', justifyItems: 'center', width: '100%' },
  avatarOption: { background: 'white', border: '2px solid #e9ecef', borderRadius: '8px', padding: '6px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontSize: '8px', color: '#666', fontWeight: 500, outline: 'none', width: '45px', justifySelf: 'center', position: 'relative' },
  avatarOptionSelected: { background: 'white', border: '2px solid #4CAF50', boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' },
  avatarImg: { width: '26px', height: '26px', borderRadius: '5px' },
  avatarLabel: { fontSize: '7px', color: '#999', textTransform: 'capitalize' },
  input: { padding: 9, borderRadius: 7, border: '1px solid #eee', fontSize: 14 },
  saveBtn: { background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 7, padding: '10px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }
};
