import React, { useEffect, useState } from 'react';
import { X, Trophy, AlertTriangle } from 'lucide-react';

import { boringAvatar } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';
import api from '../services/api';
import { useModalKeyboard } from '../hooks/useKeyboardShortcuts';

export default function BehaviorModal({ student, behaviors, onClose, onGivePoint, hideName = false }) {
  const safeBehaviors = Array.isArray(behaviors) ? behaviors : [];
  
  // Normalize type field - handle both string and array cases
  const normalizedBehaviors = React.useMemo(() => safeBehaviors.map(b => ({
    ...b,
    type: Array.isArray(b.type) ? b.type[0] : (typeof b.type === 'string' ? b.type : '')
  })), [behaviors]);
  
  const wowCards = normalizedBehaviors.filter(b => b.type === 'wow');
  const nonoCards = normalizedBehaviors.filter(b => b.type === 'nono');
  const [activeTab, setActiveTab] = React.useState('wow');
  // Import tab state
  const [classesList, setClassesList] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [sourceBehaviors, setSourceBehaviors] = useState([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [toImport, setToImport] = useState([]);

  // Handle keyboard shortcuts (Escape to close)
  useModalKeyboard(null, onClose, activeTab !== 'import');
  useEffect(() => {
    let mounted = true;
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const data = await api.pbRequest('/collections/classes/records');
        if (!mounted) return;
        // Expect data.items or data
        const items = data && data.items ? data.items : (Array.isArray(data) ? data : []);
        setClassesList(items);
      } catch (err) {
        console.error('Failed to fetch classes for import', err);
        setClassesList([]);
      } finally {
        setLoadingClasses(false);
      }
    };
    if (activeTab === 'import') fetchClasses();
    return () => { mounted = false; };
  }, [activeTab]);

  // When a source class is selected (and we're on the Import tab), fetch its behaviors and compute preview diff
  useEffect(() => {
    let mounted = true;
    const fetchSource = async () => {
      if (activeTab !== 'import' || !selectedClassId) {
        setSourceBehaviors([]);
        setToImport([]);
        return;
      }
      setLoadingSource(true);
      try {
        // Use the dedicated getBehaviors API call
        const items = await api.getBehaviors();
        
        if (!mounted) return;
        setSourceBehaviors(items);

        // FIX 2: Compare by label only. 
        // IDs will always be different across different classes.
        const existingLabels = new Set(
          (normalizedBehaviors || []).map(b => (b.label || '').toLowerCase().trim())
        );

        const filtered = items.filter(x => {
          const label = (x?.label || '').toLowerCase().trim();
          // Only import if the label doesn't already exist in the current class
          return label && !existingLabels.has(label);
        });

        setToImport(filtered);
      } catch (err) {
        console.error('Failed to fetch source class behaviors', err);
        setSourceBehaviors([]);
        setToImport([]);
      } finally {
        setLoadingSource(false);
      }
    };
    fetchSource();
    return () => { mounted = false; };
  }, [selectedClassId, activeTab, normalizedBehaviors]);
    return (
    <div style={styles.overlay} onClick={onClose} className="modal-overlay-in animated-modal-overlay">
      <div style={styles.modalCard} onClick={e => e.stopPropagation()} className="modal-animate-center animated-modal-content">
        <div style={styles.header}>
          <button
            style={styles.closeBtn}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 1, top: 1, textTransform: 'uppercase', fontWeight: 900, color: '#ba3d3dff', fontSize: 13, letterSpacing: 0.6, '@media (max-width: 640px)': { fontSize: 11, letterSpacing: 0.4 } }}>Give Points</div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              {!hideName && <div style={styles.avatarWrapper}>
                <SafeAvatar src={student.avatar || boringAvatar(student.name, student.gender)} name={student.name} alt={student.name} style={styles.avatar} />
                <div style={styles.scoreBadge}>{student.score}</div>
              </div>}
              {!hideName && <h2 style={styles.studentName}>{student.name}</h2>}
            </div>
          </div>
        </div>

        <div style={styles.contentScroll}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, justifyContent: 'center', '@media (max-width: 640px)': { gap: 6, marginBottom: 10 } }}>
            <button onClick={() => setActiveTab('wow')} style={{ padding: '7px 14px', borderRadius: 10, border: activeTab === 'wow' ? '2px solid #4CAF50' : '1px solid #E6EEF2', background: activeTab === 'wow' ? '#E8F5E9' : 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, '@media (max-width: 640px)': { padding: '6px 10px', fontSize: '0.75rem' } }}>WOW CARDS</button>
            <button onClick={() => setActiveTab('nono')} style={{ padding: '7px 14px', borderRadius: 10, border: activeTab === 'nono' ? '2px solid #F44336' : '1px solid #E6EEF2', background: activeTab === 'nono' ? '#FFEBEE' : 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, '@media (max-width: 640px)': { padding: '6px 10px', fontSize: '0.75rem' } }}>NO-NO CARDS</button>
            <button onClick={() => setActiveTab('import')} style={{ padding: '7px 14px', borderRadius: 10, border: activeTab === 'import' ? '2px solid #2563EB' : '1px solid #E6EEF2', background: activeTab === 'import' ? '#EFF6FF' : 'transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, '@media (max-width: 640px)': { padding: '6px 10px', fontSize: '0.75rem' } }}>IMPORT</button>
          </div>

          {/* Show cards for wow/nono, or the import panel when import tab is active */}
          {activeTab !== 'import' ? (
            <div style={styles.section}>
              <div style={styles.buttonGrid} className="behavior-cards-container">
                {(activeTab === 'wow' ? wowCards : nonoCards).map(card => (
                  <button key={card.id} className="behavior-card-btn" onClick={() => {
                    try {
                      onGivePoint(card);
                    } catch (e) {
                      console.error('onGivePoint failed', e);
                    }
                  }} style={activeTab === 'wow' ? styles.cardButton : { ...styles.cardButton, borderLeft: '4px solid #F44336' }}>
                    <div style={{fontSize: '1.8rem', marginBottom: '4px', '@media (max-width: 640px)': { fontSize: '1.5rem', marginBottom: '3px' } }}>{card.icon}</div>
                    <div style={{fontWeight: 'bold', fontSize: '0.85rem', '@media (max-width: 640px)': { fontSize: '0.75rem' } }}>{card.label}</div>
                    <div style={{color: activeTab === 'wow' ? '#4CAF50' : '#F44336', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', '@media (max-width: 640px)': { fontSize: '0.6rem' } }}>{activeTab === 'wow' ? 'WOW' : 'NO NO'}</div>
                    <div style={{color: activeTab === 'wow' ? '#4CAF50' : '#F44336', fontWeight: '900', fontSize: '1rem', '@media (max-width: 640px)': { fontSize: '0.9rem' } }}>{activeTab === 'wow' ? `+${card.pts}` : card.pts}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ minWidth: 320 }}>
                  <label style={{ display: 'block', marginBottom: 8, color: '#475569', fontWeight: 700 }}>Select class to import from</label>
                  <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <option value="">-- Choose a class --</option>
                    {classesList.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name || cls.title || cls.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview area */}
              <div style={{ marginTop: 12, minHeight: 80 }}>
                {loadingSource ? (
                  <div style={{ textAlign: 'center', color: '#64748B' }}>Loading preview…</div>
                ) : (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 8, color: '#334155', fontWeight: 700 }}>
                      {toImport.length > 0 ? `Preview — ${toImport.length} new card(s) will be imported` : 'No new cards to import from selected class'}
                    </div>
                    {toImport.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                        {toImport.map((c) => (
                          <div key={c.id || c.label} style={{ background: 'white', border: '1px solid #E6EEF2', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{c.icon || '⭐'}</div>
                            <div style={{ fontWeight: 700 }}>{c.label}</div>
                            <div style={{ color: '#475569', fontWeight: 800 }}>{c.pts ? (c.pts > 0 ? `+${c.pts}` : c.pts) : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button
                  onClick={async () => {
                    if (!selectedClassId) return;
                    setImporting(true);
                    setImportResult(null);
                    try {
                      // Use the previewed toImport list for import (already filtered)
                      const payload = toImport.length > 0 ? toImport : sourceBehaviors;
                      window.dispatchEvent(new CustomEvent('behavior-import:request', { detail: { sourceClassId: selectedClassId, sourceBehaviors: payload } }));
                      setImportResult({ success: true, imported: (payload || []).length });
                    } catch (err) {
                      console.error('Import failed', err);
                      setImportResult({ success: false, message: err.message || 'Failed to import' });
                    } finally {
                      setImporting(false);
                    }
                  }}
                  disabled={!selectedClassId || importing || loadingSource}
                  style={{
                    padding: '12px 22px',
                    background: selectedClassId && toImport.length > 0 ? '#4CAF50' : '#CBD5E1',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: selectedClassId && toImport.length > 0 ? 'pointer' : 'not-allowed',
                    boxShadow: selectedClassId && toImport.length > 0 ? '0 12px 30px rgba(76,175,80,0.18)' : 'none'
                  }}
                  data-enter-submit
                >
                  {importing ? 'Importing…' : (toImport.length > 0 ? 'Import New Cards' : 'Nothing to Import')}
                </button>
              </div>

              {importResult && (
                <div style={{ textAlign: 'center', marginTop: 12, color: importResult.success ? '#166534' : '#991b1b' }}>
                  {importResult.success ? (
                    importResult.imported && importResult.imported > 0 ?
                      `Imported ${importResult.imported} new card${importResult.imported > 1 ? 's' : ''}.` :
                      `You're all set — no new cards to import.`
                  ) : (
                    `Import failed: ${importResult.message}`
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 },
  modalCard: { background: '#FFFFFF', width: '90%', maxWidth: '650px', borderRadius: '40px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', '@media (max-width: 640px)': { maxHeight: '90vh', width: '95%' } },
  modalAnimateIn: 'modal-animate-center',
  modalAnimateOut: 'modal-exit-center',
  header: { padding: '18px 24px', position: 'relative', borderBottom: '1px solid #F0F0F0', '@media (max-width: 640px)': { padding: '12px 16px' } },
  closeBtn: { position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', zIndex: 12000, padding: 8, borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', '@media (max-width: 640px)': { width: 36, height: 36 } },
  studentInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: '10px', '@media (max-width: 640px)': { marginBottom: '6px' } },
  avatar: { width: '84px', height: '84px', borderRadius: '50%', border: '4px solid #F4F1EA', objectFit: 'cover', '@media (max-width: 640px)': { width: '64px', height: '64px' } },
  scoreBadge: { position: 'absolute', bottom: '0', right: '0', background: '#4CAF50', color: 'white', width: '35px', height: '35px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '3px solid white', '@media (max-width: 640px)': { width: '28px', height: '28px', fontSize: '0.8rem' } },
  studentName: { margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '800', color: '#2D3436', '@media (max-width: 640px)': { fontSize: '1rem', marginBottom: '4px' } },
  contentScroll: { padding: '18px 30px', overflowY: 'auto', flex: 1, '@media (max-width: 640px)': { padding: '12px 16px' } },
  buttonGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '15px', '@media (max-width: 640px)': { gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' } },
  cardButton: { background: 'white', border: '1px solid #E0E0E0', borderLeft: '5px solid #4CAF50', borderRadius: '20px', padding: '20px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'transform 0.2s', '@media (max-width: 640px)': { padding: '14px 8px' } }
};