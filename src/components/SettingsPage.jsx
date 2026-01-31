import React, { useState } from 'react';
import { Edit2, Plus, X, RefreshCw, Trash2, Save } from 'lucide-react';
import api from '../services/api';
import InlineHelpButton from './InlineHelpButton';
import { useTranslation } from '../i18n';

// Modern, fun stickers for kids - using high-quality SVG graphics from reliable CDN
// These are styled as modern flat illustrations with bold colors
const STICKER_OPTIONS = [
  // Stars & Rewards
  { id: 'star-yellow', emoji: '⭐', name: 'Gold Star' },
  { id: 'star-blue', emoji: '🌟', name: 'Blue Star' },
  { id: 'sparkle', emoji: '✨', name: 'Sparkle' },
  { id: 'trophy', emoji: '🏆', name: 'Trophy' },
  { id: 'medal', emoji: '🏅', name: 'Medal' },
  { id: 'ribbon', emoji: '🎀', name: 'Ribbon' },
  { id: 'crown', emoji: '👑', name: 'Crown' },
  
  // Celebrations
  { id: 'party', emoji: '🎉', name: 'Party' },
  { id: 'confetti', emoji: '🎊', name: 'Confetti' },
  { id: 'fire', emoji: '🔥', name: 'On Fire' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'balloon', emoji: '🎈', name: 'Balloon' },
  { id: 'gift', emoji: '🎁', name: 'Gift' },
  
  // Fun Characters
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'alien', emoji: '👽', name: 'Alien' },
  { id: 'ghost', emoji: '👻', name: 'Ghost' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'alien-cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'frog', emoji: '🐸', name: 'Frog' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle' },
  { id: 'octopus', emoji: '🐙', name: 'Octopus' },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly' },
  
  // Sports & Activities
  { id: 'soccer', emoji: '⚽', name: 'Soccer' },
  { id: 'basketball', emoji: '🏀', name: 'Basketball' },
  { id: 'football', emoji: '🏈', name: 'Football' },
  { id: 'tennis', emoji: '🎾', name: 'Tennis' },
  { id: 'bowling', emoji: '🎳', name: 'Bowling' },
  { id: 'music', emoji: '🎵', name: 'Music' },
  { id: 'guitar', emoji: '🎸', name: 'Guitar' },
  { id: 'microphone', emoji: '🎤', name: 'Microphone' },
  { id: 'headphones', emoji: '🎧', name: 'Headphones' },
  
  // Nature & Weather
  { id: 'sun', emoji: '☀️', name: 'Sunny' },
  { id: 'moon', emoji: '🌙', name: 'Moon' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
  { id: 'cloud', emoji: '☁️', name: 'Cloud' },
  { id: 'flower', emoji: '🌸', name: 'Flower' },
  { id: 'tree', emoji: '🌳', name: 'Tree' },
  { id: 'cactus', emoji: '🌵', name: 'Cactus' },
  { id: 'mountain', emoji: '⛰️', name: 'Mountain' },
  { id: 'beach', emoji: '🏖️', name: 'Beach' },
  { id: 'island', emoji: '🏝️', name: 'Island' },
  
  // Food & Treats
  { id: 'apple', emoji: '🍎', name: 'Apple' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza' },
  { id: 'burger', emoji: '🍔', name: 'Burger' },
  { id: 'icecream', emoji: '🍦', name: 'Ice Cream' },
  { id: 'cake', emoji: '🎂', name: 'Cake' },
  { id: 'cookie', emoji: '🍪', name: 'Cookie' },
  { id: 'candy', emoji: '🍬', name: 'Candy' },
  { id: 'donut', emoji: '🍩', name: 'Donut' },
  
  // Emotions & Faces
  { id: 'smile', emoji: '😊', name: 'Smile' },
  { id: 'laugh', emoji: '😄', name: 'Happy' },
  { id: 'love', emoji: '😍', name: 'Love' },
  { id: 'cool', emoji: '😎', name: 'Cool' },
  { id: 'wink', emoji: '😉', name: 'Wink' },
  { id: 'thinking', emoji: '🤔', name: 'Thinking' },
  { id: 'surprised', emoji: '😮', name: 'Surprised' },
  { id: 'angel', emoji: '😇', name: 'Angel' },
  
  // Actions & Gestures
  { id: 'thumbsup', emoji: '👍', name: 'Thumbs Up' },
  { id: 'clap', emoji: '👏', name: 'Clap' },
  { id: 'heart', emoji: '❤️', name: 'Heart' },
  { id: 'fist', emoji: '✊', name: 'Power' },
  { id: 'wave', emoji: '👋', name: 'Wave' },
  { id: 'shake', emoji: '🤝', name: 'Handshake' },
  
  // School & Learning
  { id: 'book', emoji: '📚', name: 'Books' },
  { id: 'pencil', emoji: '✏️', name: 'Pencil' },
  { id: 'lightbulb', emoji: '💡', name: 'Idea' },
  { id: 'brain', emoji: '🧠', name: 'Brain' },
  { id: 'graduation', emoji: '🎓', name: 'Graduation' },
  { id: 'backpack', emoji: '🎒', name: 'Backpack' },
  { id: 'puzzle', emoji: '🧩', name: 'Puzzle' },
  { id: 'compass', emoji: '🧭', name: 'Compass' },
  { id: 'magnifier', emoji: '🔎', name: 'Search' },
  { id: 'flag', emoji: '🚩', name: 'Goal' },
  
  // Positive Corrections
  { id: 'warning', emoji: '⚠️', name: 'Warning' },
  { id: 'bell', emoji: '🔔', name: 'Reminder' },
  { id: 'speaker', emoji: '📢', name: 'Speaker' },
  { id: 'shhh', emoji: '🤫', name: 'Quiet' },
  { id: 'pause', emoji: '⏸️', name: 'Pause' },
  { id: 'clock', emoji: '⏰', name: 'Time' },
];

export default function SettingsPage({ activeClass, behaviors, onBack, onUpdateBehaviors }) {
  const { t } = useTranslation();
  const [activeTab] = useState('cards'); // 'cards' | 'students' | 'general'
  const [cards, setCards] = useState(Array.isArray(behaviors) ? behaviors : []);
  const [, setSidebarCollapsed] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState({ label: '', pts: 0, icon: '⭐', type: 'wow' });
  const [openEmojiFor, setOpenEmojiFor] = useState(null);

  React.useEffect(() => setCards(Array.isArray(behaviors) ? behaviors : []), [behaviors]);

  // Auto-collapse sidebar on small screens
  React.useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 720);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to reload behaviors from backend
  const reloadBehaviors = async () => {
    try {
      const latest = await api.getBehaviors();
      setCards(Array.isArray(latest) ? latest : []);
    } catch (e) {
      console.warn('Failed to reload behaviors:', e.message);
    }
  };

  const persistBehaviors = async (updated) => {
    setCards(updated);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    try { await api.saveBehaviors(updated); } catch (e) { console.warn('saveBehaviors failed', e.message); }
  };

  // Inject mobile-friendly overrides for Settings page
  React.useEffect(() => {
    const style = document.createElement('style');
    style.id = 'settings-mobile-styles';
    style.innerHTML = `@media (max-width:720px){ .settings-page-root header { padding: 0 16px !important; } .settings-page-root main { padding: 16px !important; } .settings-page-root aside { display: none !important; } .settings-page-root .sidebar-collapsed { display: flex !important; width: 64px !important; } }
    .settings-header-actions [data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 50%;
      top: calc(100% + 8px);
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 14px;
      white-space: nowrap;
      z-index: 9999;
      opacity: 1;
      pointer-events: none;
    }
    /* Sticker button hover effects */
    button[class*="sticker"] {
      transition: all 0.2s ease;
    }
    button[class*="sticker"]:hover {
      transform: scale(1.15);
      border-color: #6366f1 !important;
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
    }`;
    document.head.appendChild(style);
    return () => { const el = document.getElementById('settings-mobile-styles'); if (el) el.remove(); };
  }, []);

  React.useEffect(() => {
    // Inject global tooltip CSS
    if (!document.getElementById('abc-tooltip-style')) {
      const style = document.createElement('style');
      style.id = 'abc-tooltip-style';
      style.innerHTML = `
        .abc-tooltip[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: 50%;
          top: calc(100% + 8px);
          transform: translateX(-50%);
          background: #333;
          color: #fff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          white-space: nowrap;
          z-index: 9999;
          opacity: 1;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Parse emojis with Twemoji when emoji picker opens or cards render
  React.useEffect(() => {
    const parseEmojis = () => {
      if (typeof window !== 'undefined' && window.twemoji) {
        // Parse emojis in emoji picker
        setTimeout(() => {
          const emojiModal = document.querySelector('[style*="position: fixed"][style*="z-index: 3500"]');
          if (emojiModal) {
            window.twemoji.parse(emojiModal, {
              folder: 'svg',
              ext: '.svg',
              className: 'emoji'
            });
          }
        }, 50);

        // Parse emojis in card icons
        const cardIcons = document.querySelectorAll('[style*="width: 44px"][style*="height: 44px"]');
        cardIcons.forEach(icon => {
          if (icon.textContent && /[\u{1F000}-\u{1F9FF}]/u.test(icon.textContent)) {
            window.twemoji.parse(icon, {
              folder: 'svg',
              ext: '.svg',
              className: 'emoji'
            });
          }
        });
      }
    };

    parseEmojis();

    // Also parse when emoji picker opens
    if (openEmojiFor) {
      setTimeout(parseEmojis, 100);
    }
  }, [openEmojiFor, cards]);

  // SettingsPage.jsx
// Optimistic close: close UI immediately, save in background
const handleBackClick = () => {
  try {
    // Close the settings UI immediately for a snappy experience
    onBack();
    // Persist changes in the background. Log failures but do not block UI.
    api.saveBehaviors(cards).catch(err => {
      console.error('Failed to persist behavior cards (background):', err);
    });
  } catch (err) {
    console.error('Error closing settings:', err);
    onBack();
  }
};
  const handleSaveCard = (id) => {
    const pts = Number(editingCard.pts);
    const type = pts > 0 ? 'wow' : 'nono';
    const updated = cards.map(c => c.id === id ? { 
      ...c, 
      label: editingCard.label, 
      pts: pts,
      icon: editingCard.icon,
      type: type
    } : c);
    setCards(updated);
    setEditingCardId(null);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    // Save to backend (behaviors are global, not per-class)
    api.saveBehaviors(updated).then(reloadBehaviors);
  };

  const handleDeleteCard = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    // Save to backend (behaviors are global, not per-class)
    api.saveBehaviors(updated).then(reloadBehaviors);
  };
        // Add global CSS for mobile hiding
        if (typeof document !== 'undefined' && !document.getElementById('settings-hide-on-mobile-style')) {
          const style = document.createElement('style');
          style.id = 'settings-hide-on-mobile-style';
          style.innerHTML = `
            @media (max-width: 720px) {
              .hide-on-mobile { display: none !important; }
            }
          `;
          document.head.appendChild(style);
        }
  return (
    <div className="settings-page-root safe-area-top" style={{ ...styles.pageContainer }}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        </div>
        {/* Centered header text for large screens only */}
        <div className="edit-point-cards-header-text hide-on-mobile" style={styles.headerCenterText}>
          <span className="edit-point-cards-header-label" style={{ display: 'inline-block', width: '100%' }}>{t('settings.edit_cards')}</span>
        </div>
        
        <div className="settings-header-actions" style={{ ...styles.headerActions, flexDirection: 'row' }}>
          <div className="header-action-group" style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          <InlineHelpButton pageId="settings-cards" />            <Tooltip text={t('settings.tooltip_add_card')}>
            <button
              aria-label="Add card"
              style={styles.headerIconBtn}
              onClick={() => {
                const newCard = { id: Date.now(), label: t('settings.new_card'), pts: 1, type: 'wow', icon: '⭐' };
                const updated = [newCard, ...cards];
                setCards(updated);
                setEditingCardId(newCard.id);
                setEditingCard({ label: newCard.label, pts: newCard.pts, icon: newCard.icon, type: newCard.type });
              }}
            >
              <Plus size={22} style={{ marginRight: 8 }} />
              <span className="header-icon-label" style={{...styles.headerIconLabel, fontSize: 14}}>{t('settings.add_card')}</span>
            </button>
            </Tooltip>
            <Tooltip text={t('settings.tooltip_reset_cards')}>
            <button
              aria-label="Reset behaviors"
              style={styles.headerIconBtn}
              onClick={async () => {
                const INITIAL_BEHAVIORS = [
                  { id: 1, label: 'Team Player', pts: 1, type: 'wow', icon: '🤝' },
                  { id: 2, label: 'Super Star!', pts: 3, type: 'wow', icon: '🏆' },
                  { id: 3, label: 'Creative', pts: 2, type: 'wow', icon: '🎨' },
                  { id: 4, label: 'Brain Power', pts: 2, type: 'wow', icon: '🧠' },
                  { id: 5, label: 'On Fire!', pts: 3, type: 'wow', icon: '🔥' },
                  { id: 6, label: 'Kind Heart', pts: 1, type: 'wow', icon: '❤️' },
                  { id: 7, label: 'Active', pts: 1, type: 'wow', icon: '⚽' },
                  { id: 8, label: 'Rocket', pts: 2, type: 'wow', icon: '🚀' },
                  { id: 9, label: 'Too Loud', pts: -1, type: 'nono', icon: '🔔' },
                  { id: 10, label: 'Distracted', pts: -2, type: 'nono', icon: '😐' }
                ];
                try {
                  await api.deleteNewCards();
                } catch (e) {
                  console.warn('Failed to delete "New Card" entries:', e.message);
                }
                setCards(INITIAL_BEHAVIORS);
                onUpdateBehaviors && onUpdateBehaviors(INITIAL_BEHAVIORS);
                setEditingCardId(null);
              }}
            >
              <RefreshCw size={22} style={{ marginRight: 8 }} />
              <span className="header-icon-label" style={{...styles.headerIconLabel, fontSize: 14}}>{t('settings.reset')}</span>
            </button>
            </Tooltip>
            <Tooltip text={t('settings.tooltip_done')}>
            <button
              aria-label="Done"
              style={styles.headerIconBtn}
              onClick={handleBackClick}
            >
              <X size={22} />
            </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Settings Sidebar */}
        {/* <aside style={{ ...styles.sidebar, width: sidebarCollapsed ? '84px' : styles.sidebar.width }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <strong style={{ display: sidebarCollapsed ? 'none' : 'block' }}>{activeClass?.name}</strong>
            </div>
            <button onClick={() => setSidebarCollapsed(s => !s)} style={styles.iconBtn} title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
              {sidebarCollapsed ? <ChevronLeft size={18} /> : <LayoutGrid size={16} />}
            </button>
          </div>
          <button 
            onClick={() => setActiveTab('cards')} 
            style={activeTab === 'cards' ? styles.tabActive : styles.tab}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LayoutGrid size={20} />
              {!sidebarCollapsed && <span>Behavior Cards</span>}
            </div>
          </button>
        </aside> */}

        {/* Dynamic Content Area */}
        <main style={styles.content}>
          {activeTab === 'cards' ? (
            <section>
         
              <div style={styles.cardList}>
                {cards.map(card => (
                  <div key={card.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <div style={{ position: 'relative' }}>
                        {/* Only allow opening emoji picker when editing this card */}
                        <Tooltip text={t('settings.tooltip_change_sticker')}>
                        <button
                          onClick={() => {
                            if (editingCardId === card.id) {
                              setOpenEmojiFor(openEmojiFor === card.id ? null : card.id);
                            }
                          }}
                          style={{ ...styles.stickerBtn, width: 56, height: 56, fontSize: 32 }}
                          aria-label="Pick sticker"
                        >
                          {editingCardId === card.id ? (editingCard.icon) : (card.icon)}
                        </button>
                        </Tooltip>
                        {openEmojiFor === card.id && (
                          <div style={styles.centerEmojiModal} onClick={e => e.stopPropagation()} className="modal-overlay-in">
                            <div style={styles.centerStickerGrid} className="animated-modal-content modal-animate-scale">
                              {STICKER_OPTIONS.map(sticker => (
                                <Tooltip key={sticker.id} text={sticker.name}>
                                <button onClick={() => {
                                  if (editingCardId === card.id) {
                                    setEditingCard(prev => ({ ...prev, icon: sticker.emoji }));
                                  } else {
                                    const updated = cards.map(c => c.id === card.id ? { ...c, icon: sticker.emoji } : c);
                                    persistBehaviors(updated);
                                  }
                                  setOpenEmojiFor(null);
                                }} style={{ ...styles.stickerBtn, padding: 12, fontSize: 32 }}>
                                  {sticker.emoji}
                                </button>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                          {editingCardId === card.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                value={editingCard.label}
                                onChange={(e) => setEditingCard(prev => ({ ...prev, label: e.target.value }))}
                                placeholder={t('settings.card_label_placeholder')}
                                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #E6EEF8', fontSize: 15, flex: '1 1 140px', minWidth: 120 }}
                                title={t('settings.tooltip_edit_label')}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Tooltip text={t('settings.tooltip_decrease_points')}>
                                    <button onClick={() => { const pts = Number(editingCard.pts) - 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={styles.smallIconBtn} aria-label="Decrease points">-</button>
                                  </Tooltip>
                                  <div style={{ minWidth: 36, textAlign: 'center', fontWeight: 800 }}>{editingCard.pts}</div>
                                  <Tooltip text={t('settings.tooltip_increase_points')}>
                                    <button onClick={() => { const pts = Number(editingCard.pts) + 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={styles.smallIconBtn} aria-label="Increase points">+</button>
                                  </Tooltip>
                                </div>
                                <div style={{ color: editingCard.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '14px', fontWeight: 700, marginTop: 2 }}>
                                  {editingCard.pts > 0 ? t('dashboard.wow_card') : t('dashboard.nono_card')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={styles.itemLabel}>{card.label}</div>
                            <div style={{ color: card.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {card.pts > 0 ? t('dashboard.wow_card') : t('dashboard.nono_card')}
                            </div>
                            <div style={{ color: card.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '24px', fontWeight: '900', marginTop: '4px' }}>
                              {card.pts > 0 ? `+${card.pts}` : card.pts}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.itemActions}>
                      {editingCardId === card.id ? (
                        <div style={styles.verticalActionStack}>
                          <Tooltip text={t('settings.tooltip_save')}>
                          <button onClick={() => handleSaveCard(card.id)} style={styles.saveIconBtn} aria-label="Save"><Save size={22} /></button>
                          </Tooltip>
                          <Tooltip text={t('settings.tooltip_cancel_edit')}>
                          <button onClick={() => setEditingCardId(null)} style={styles.cancelIconBtn} aria-label="Cancel"><X size={22} /></button>
                          </Tooltip>
                        </div>
                      ) : (
                        <>
                          <Tooltip text={t('settings.tooltip_edit_card')}>
                          <button onClick={() => { setEditingCardId(card.id); setEditingCard({ label: card.label, pts: card.pts, icon: card.icon, type: card.type }); }} style={styles.iconOnlyBtn} aria-label="Edit"><Edit2 size={20} /></button>
                          </Tooltip>
                          <Tooltip text={t('settings.tooltip_delete_card')}>
                          <button onClick={() => handleDeleteCard(card.id)} style={styles.iconOnlyBtn} aria-label="Delete"><Trash2 size={20} /></button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { height: '100vh', display: 'flex', flexDirection: 'column',overflowY: 'auto', background: '#F8FAFC', position: 'relative' },
  header: { background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    width: '100%',
    position: 'relative',
  },
  headerIconBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fff',
    border: '1px solid #EEF2FF',
    borderRadius: 12,
    padding: '12px 18px',
    cursor: 'pointer',
    color: '#2563EB',
    fontWeight: 700,
    fontSize: 18,
    transition: 'background 0.2s',
    minWidth: 0,
    position: 'relative',
  },
  headerIconLabel: {
    fontSize: 18,
    fontWeight: 700,
    display: 'inline-block',
    lineHeight: 1,
    marginLeft: 2,
  },
  headerCenterText: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translateX(-50%)',
    fontWeight: 800,
    fontSize: 22,
    color: '#2563EB',
    letterSpacing: 0.5,
    padding: '0 16px',
    lineHeight: '64px',
    display: 'block',
    textAlign: 'center',
    width: 'max-content',
    minWidth: 180,
    zIndex: 1,
  },
  // Tooltip styling
  '@global .settings-header-actions [data-tooltip]::after': {
    content: 'attr(data-tooltip)',
    position: 'absolute',
    left: '50%',
    top: '100%',
    transform: 'translateX(-50%)',
    background: '#333',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    marginTop: '6px',
    zIndex: 9999,
    opacity: 1,
    pointerEvents: 'none',
  },
  '@media (max-width: 720px)': {
    headerActions: {
      gap: 4,
      flexWrap: 'wrap',
      justifyContent: 'center',
      padding: '0 2px',
    },
    headerIconBtn: {
      padding: '8px 8px',
      fontSize: 15,
      minWidth: 0,
      gap: 4,
    },
    headerIconLabel: {
      fontSize: 15,
      marginLeft: 1,
    },
    headerCenterText: {
      display: 'none',
    },
  },
  mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '260px', background: '#fff', borderRight: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  tab: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'transparent', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#64748B' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: '#E8F5E9', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#2E7D32', fontWeight: 'bold' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  addBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  addBtnModern: { background: 'linear-gradient(90deg,#4CAF50,#2E7D32)', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(46,125,50,0.12)', fontWeight: 800 },
  cardList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '12px',
    alignItems: 'start',
    justifyItems: 'center',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  settingItem: {
    background: '#fff',
    padding: '10px 24px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: 360,
    maxWidth: 390,
    minHeight: 140,
    height: 180,
    boxSizing: 'border-box',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    transition: 'box-shadow 0.2s',
  },
  itemInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  itemIcon: { fontSize: '28px' },
  itemLabel: { fontWeight: 'bold', fontSize: '1.1rem' },
  miniAvatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5' },
  itemActions: { display: 'flex', gap: '20px' },
  actionIcon: { cursor: 'pointer', color: '#94A3B8' },
  stickerBtn: {
    fontSize: '32px',
    border: '2px solid #E6EEF8',
    borderRadius: '16px',
    padding: '12px',
    cursor: 'pointer',
    background: 'white',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
  },
  emojiPickerBtn: { background: '#fff', border: '1px solid #E6EEF8', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.9)', borderRadius: '12px', boxShadow: '0 8px 30px rgba(2,6,23,0.08)' },
  emojiBtn: { fontSize: '20px', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', background: 'transparent' },
  // compact grid picker that appears in a centered top overlay
  verticalEmojiGrid: { position: 'absolute', left: -140, top: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, padding: 8, background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(2,6,23,0.12)', zIndex: 2500 },
  centerEmojiModal: { position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 3500, display: 'flex', justifyContent: 'center', width: 'min(900px, 95%)', pointerEvents: 'auto' },
  centerStickerGrid: {
    width: '100%',
    background: '#fff',
    padding: 16,
    borderRadius: 16,
    boxShadow: '0 20px 60px rgba(2,6,23,0.12)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(56px, 1fr))',
    gap: 12,
    justifyItems: 'center',
    alignItems: 'center',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  verticalActionStack: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' },
  hoverIcons: { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 },
  // small circular icon button used in the modern controls
  iconBtn: { background: 'white', border: '1px solid #EEF2FF', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#2563EB', fontWeight: 700 },
  compactBtn: { padding: 8, borderRadius: 8, border: '1px solid #E6EEF8', background: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  compactDelete: { padding: 8, borderRadius: 8, border: '1px solid #ffd6d6', background: 'white', color: '#FF6B6B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  iconOnlyBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  smallIconBtn: { padding: '6px 8px', borderRadius: 8, border: '1px solid #EEF2FF', background: 'white', cursor: 'pointer' },
  saveActionBtn: { padding: '8px 12px', borderRadius: '10px', background: '#2E7D32', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' },
  cancelActionBtn: { padding: '8px 12px', borderRadius: '10px', background: 'transparent', color: '#333', border: '1px solid #E6EEF8', fontWeight: 700, cursor: 'pointer', marginLeft: 8 },
  saveIconBtn: { width: 44, height: 44, padding: 8, borderRadius: 12, background: '#2E7D32', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  cancelIconBtn: { width: 44, height: 44, padding: 8, borderRadius: 12, background: 'transparent', color: '#333', border: '1px solid #E6EEF8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' , marginLeft: 0 },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  editModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  editModalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '15px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};

// Minimal Tooltip component
function Tooltip({ children, text }) {
  const [show, setShow] = React.useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span style={{
          position: 'absolute',
          left: '50%',
          top: '100%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 14,
          whiteSpace: 'nowrap',
          marginTop: 8,
          zIndex: 9999,
          pointerEvents: 'none',
        }}>{text}</span>
      )}
    </span>
  );
}