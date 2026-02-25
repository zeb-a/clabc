import React, { useState } from 'react';
import { Edit2, Plus, X, RefreshCw, Trash2, Save, Minus } from 'lucide-react';
import api from '../services/api';

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

// Helper: Convert old Twemoji URLs back to emoji
function urlToEmoji(iconValue) {
  if (!iconValue) return '⭐';
  
  // If it's already an emoji (not a URL), return as-is
  if (!iconValue.includes('/') && !iconValue.includes('http')) {
    return iconValue;
  }
  
  // Map common hex codes back to emoji
  const urlToEmojiMap = {
    '1f52c': '🔬',
    '1f44d': '👍',
    '1f44f': '👏',
    '1f60a': '😊',
    '1f60d': '😍',
    '1f973': '🥳',
    '1f4a5': '💥',
    '1f525': '🔥',
    '1f680': '🚀',
    '1f3c6': '🏆',
    '1f3af': '🎯',
    '1f32e': '🌮',
    '2b50': '⭐',
  };
  
  const match = iconValue.match(/\/([a-f0-9-]+)\.(?:png|svg)/i);
  if (match) {
    const hex = match[1].replace(/-/g, '-');
    return urlToEmojiMap[hex] || '⭐';
  }
  
  return '⭐';
}

// ─── Pure CSS tooltip wrapper ─────────────────────────────────────────────────
// Uses data-tooltip + ::after pseudo-element — zero JS, zero re-renders.
// The CSS is injected once at module level so it is never recreated.
if (typeof document !== 'undefined' && !document.getElementById('abc-tooltip-style')) {
  const s = document.createElement('style');
  s.id = 'abc-tooltip-style';
  s.innerHTML = `
    .abc-tip { position: relative; display: inline-block; }
    .abc-tip::after {
      content: attr(data-tooltip);
      position: absolute;
      left: 50%;
      top: calc(100% + 8px);
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 5px 10px;
      border-radius: 8px;
      font-size: 13px;
      white-space: nowrap;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .abc-tip:hover::after { opacity: 1; }
  `;
  document.head.appendChild(s);
}

// ─── Emoji picker CSS injected once at module level ──────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('emoji-picker-styles')) {
  const s = document.createElement('style');
  s.id = 'emoji-picker-styles';
  s.innerHTML = `
    .ep-btn {
      font-size: 32px;
      border: 2px solid #E6EEF8;
      border-radius: 16px;
      padding: 12px;
      cursor: pointer;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: border-color 0.1s, background 0.1s, transform 0.1s;
    }
    .ep-btn:hover {
      border-color: #6366f1;
      background: #F0FDF4;
      transform: scale(1.12);
    }
    @media (max-width: 720px) {
      .hide-on-mobile { display: none !important; }
    }
    @keyframes pulse-border {
      0%   { box-shadow: 0 0 0 0   rgba(76,175,80,0.4); }
      70%  { box-shadow: 0 0 0 10px rgba(76,175,80,0);   }
      100% { box-shadow: 0 0 0 0   rgba(76,175,80,0);   }
    }
    .add-card-hover:hover {
      background-color: #F0FDF4 !important;
      border-color: #4CAF50 !important;
      color: #4CAF50 !important;
      animation: pulse-border 2s infinite;
    }
  `;
  document.head.appendChild(s);
}

// ─── EmojiPickerGrid — defined OUTSIDE SettingsPage so it is never recreated ──
// Each button uses a plain .ep-btn class for hover effects (pure CSS, no state).
// The tooltip is a CSS ::after via data-tooltip — no React state per item.
const EmojiPickerGrid = React.memo(function EmojiPickerGrid({ stickers, onSelect }) {
  return (
    <div style={gridStyle}>
      {stickers.map(sticker => (
        <button
          key={sticker.id}
          className="ep-btn abc-tip"
          data-tooltip={sticker.name}
          onClick={() => onSelect(sticker.emoji)}
          aria-label={sticker.name}
        >
          {sticker.emoji}
        </button>
      ))}
    </div>
  );
});

// Static style object — defined outside component so it is never recreated
const gridStyle = {
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
};

// ─── Tooltip — pure CSS version, no state ────────────────────────────────────
function Tooltip({ children, text }) {
  return (
    <span className="abc-tip" data-tooltip={text} style={{ display: 'inline-block' }}>
      {children}
    </span>
  );
}

export default function SettingsPage({ activeClass, behaviors, onBack, onUpdateBehaviors }) {
  const [activeTab] = useState('cards');
  const [cards, setCards] = useState(() => {
    const behaviorList = Array.isArray(behaviors) ? behaviors : [];
    return behaviorList.map(card => ({ ...card, icon: urlToEmoji(card.icon) }));
  });
  const [, setSidebarCollapsed] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState({ label: '', pts: 0, icon: '⭐', type: 'wow' });
  const [openEmojiFor, setOpenEmojiFor] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [addCardModalData, setAddCardModalData] = useState({ label: 'New Card', pts: 1, icon: '⭐' });
  const [showEmojiPickerForModal, setShowEmojiPickerForModal] = useState(false);

  const emojiPickerRef = React.useRef(null);

  // Close emoji picker when clicking outside
  React.useEffect(() => {
    if (openEmojiFor !== null) {
      const handleClickOutside = (e) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
          setOpenEmojiFor(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openEmojiFor]);

  // Force cleanup on unmount
  React.useEffect(() => {
    return () => {
      setEditingCardId(null);
      setEditingCard({ label: '', pts: 0, icon: '⭐', type: 'wow' });
      setOpenEmojiFor(null);
      setShowAddCardModal(false);
      setShowEmojiPickerForModal(false);
    };
  }, []);

  React.useEffect(() => {
    const convertedCards = (Array.isArray(behaviors) ? behaviors : []).map(card => ({
      ...card,
      icon: urlToEmoji(card.icon)
    }));
    setCards(convertedCards);
  }, [behaviors]);

  // Auto-collapse sidebar on small screens
  React.useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 720);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleBackClick = () => {
    try {
      setEditingCardId(null);
      setEditingCard({ label: '', pts: 0, icon: '⭐', type: 'wow' });
      setOpenEmojiFor(null);
      setShowAddCardModal(false);
      setShowEmojiPickerForModal(false);
      if (typeof onBack === 'function') onBack();
      api.saveBehaviors(cards).catch(() => {});
    } catch (err) {
      if (typeof onBack === 'function') onBack();
    }
  };

  const handleSaveCard = (id) => {
    const pts = Number(editingCard.pts);
    const type = pts > 0 ? 'wow' : 'nono';
    const updated = cards.map(c => c.id === id ? {
      ...c,
      label: editingCard.label,
      pts,
      icon: editingCard.icon,
      type,
    } : c);
    setCards(updated);
    setEditingCardId(null);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    api.saveBehaviors(updated).then(reloadBehaviors);
  };

  const handleDeleteCard = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    api.saveBehaviors(updated).then(reloadBehaviors);
  };

  const handleAddCard = (newCardData) => {
    const newCard = {
      id: Date.now(),
      ...newCardData,
      type: newCardData.pts > 0 ? 'wow' : 'nono'
    };
    const updated = [newCard, ...cards];
    setCards(updated);
    if (onUpdateBehaviors) onUpdateBehaviors(updated);
    api.saveBehaviors(updated).then(reloadBehaviors);
    setShowAddCardModal(false);
  };

  // Stable onSelect callbacks — memoised so EmojiPickerGrid never re-renders
  const handleEmojiSelectForCard = React.useCallback((emoji) => {
    setEditingCard(prev => ({ ...prev, icon: emoji }));
    setOpenEmojiFor(null);
  }, []);

  const handleEmojiSelectForModal = React.useCallback((emoji) => {
    setAddCardModalData(prev => ({ ...prev, icon: emoji }));
    setShowEmojiPickerForModal(false);
  }, []);

  return (
    <div className="settings-page-root safe-area-top" style={styles.pageContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }} />
        <div className="edit-point-cards-header-text hide-on-mobile" style={styles.headerCenterText}>
          <span style={{ display: 'inline-block', width: '100%' }}>Edit point cards</span>
        </div>
        <div className="settings-header-actions" style={{ ...styles.headerActions, flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
            <Tooltip text="Reset all behavior cards to default">
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
                  try { await api.deleteNewCards(); } catch (e) { console.warn('Failed to delete "New Card" entries:', e.message); }
                  setCards(INITIAL_BEHAVIORS);
                  onUpdateBehaviors && onUpdateBehaviors(INITIAL_BEHAVIORS);
                  setEditingCardId(null);
                }}
              >
                <RefreshCw size={22} style={{ marginRight: 8 }} />
                <span style={{ ...styles.headerIconLabel, fontSize: 14 }}>Reset</span>
              </button>
            </Tooltip>
            <Tooltip text="Done and close settings">
              <button aria-label="Done" style={styles.headerIconBtn} onClick={handleBackClick}>
                <X size={22} />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div style={styles.mainLayout}>
        <main style={styles.content}>
          {activeTab === 'cards' && (
            <section>
              <div style={styles.cardList}>
                {/* ADD CARD */}
                <div
                  className="add-card-hover"
                  title="Add a new behavior card"
                  onClick={() => setShowAddCardModal(true)}
                  style={{
                    ...styles.settingItem,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    boxShadow: 'none',
                    color: '#64748B',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    minHeight: 140,
                    height: 180,
                    minWidth: 360,
                    maxWidth: 390,
                  }}
                >
                  <div style={{ background: 'white', padding: 12, borderRadius: '50%', marginBottom: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <Plus size={32} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Add Card</span>
                </div>

                {cards.map(card => (
                  <div key={card.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <div style={{ position: 'relative' }}>
                        <Tooltip text="Change/choose avatar sticker">
                          <button
                            onClick={() => {
                              if (editingCardId === card.id) {
                                setOpenEmojiFor(openEmojiFor === card.id ? null : card.id);
                              }
                            }}
                            style={{ ...styles.stickerBtn, width: 56, height: 56, fontSize: 32 }}
                            aria-label="Pick sticker"
                          >
                            {editingCardId === card.id ? editingCard.icon : card.icon}
                          </button>
                        </Tooltip>
                        {openEmojiFor === card.id && (
                          <div style={styles.centerEmojiModal} className="modal-overlay-in">
                            <div ref={emojiPickerRef} style={{ position: 'relative', ...gridStyle }} className="animated-modal-content modal-animate-scale">
                              <button
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  zIndex: 10000,
                                  background: 'rgba(255,255,255,0.1)',
                                  border: 'none',
                                  color: '#888',
                                  fontSize: 18,
                                  cursor: 'pointer',
                                  padding: 4,
                                  borderRadius: '0 8px 0 0',
                                }}
                                aria-label="Close emoji picker"
                                onClick={() => setOpenEmojiFor(null)}
                              >
                                <X size={18} />
                              </button>
                              <EmojiPickerGrid
                                stickers={STICKER_OPTIONS}
                                onSelect={handleEmojiSelectForCard}
                              />
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
                                placeholder="Card label"
                                style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #E6EEF8', fontSize: 15, flex: '1 1 140px', minWidth: 120 }}
                                title="Edit card label"
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Tooltip text="Decrease points">
                                    <button onClick={() => { const pts = Number(editingCard.pts) - 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={styles.smallIconBtn} aria-label="Decrease points">-</button>
                                  </Tooltip>
                                  <div style={{ minWidth: 36, textAlign: 'center', fontWeight: 800 }}>{editingCard.pts}</div>
                                  <Tooltip text="Increase points">
                                    <button onClick={() => { const pts = Number(editingCard.pts) + 1; setEditingCard(prev => ({ ...prev, pts, type: pts > 0 ? 'wow' : 'nono' })); }} style={styles.smallIconBtn} aria-label="Increase points">+</button>
                                  </Tooltip>
                                </div>
                                <div style={{ color: editingCard.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '14px', fontWeight: 700, marginTop: 2 }}>
                                  {editingCard.pts > 0 ? 'WOW' : 'NO NO'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={styles.itemLabel}>{card.label}</div>
                            <div style={{ color: card.pts > 0 ? '#4CAF50' : '#F44336', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {card.pts > 0 ? 'WOW' : 'NO NO'}
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
                          <Tooltip text="Save changes">
                            <button onClick={() => handleSaveCard(card.id)} style={styles.saveIconBtn} aria-label="Save"><Save size={22} /></button>
                          </Tooltip>
                          <Tooltip text="Cancel editing">
                            <button onClick={() => setEditingCardId(null)} style={styles.cancelIconBtn} aria-label="Cancel"><X size={22} /></button>
                          </Tooltip>
                        </div>
                      ) : (
                        <>
                          <Tooltip text="Edit card">
                            <button onClick={() => { setEditingCardId(card.id); setEditingCard({ label: card.label, pts: card.pts, icon: card.icon, type: card.type }); }} style={styles.iconOnlyBtn} aria-label="Edit"><Edit2 size={20} /></button>
                          </Tooltip>
                          <Tooltip text="Delete card">
                            <button onClick={() => handleDeleteCard(card.id)} style={styles.iconOnlyBtn} aria-label="Delete"><Trash2 size={20} /></button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ADD CARD MODAL */}
      {showAddCardModal && (
        <div style={styles.modalOverlay} className="modal-overlay-in">
          <div style={styles.modal} className="animated-modal-content modal-animate-center">
            <div style={styles.modalHeader}>
              <h3>Add New Card</h3>
              <button style={styles.closeBtn} onClick={() => setShowAddCardModal(false)}><X size={20} /></button>
            </div>

            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>Choose Icon</label>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 12 }}>
                <div style={{ position: 'relative' }}>
                  <Tooltip text="Click to choose sticker">
                    <button
                      onClick={() => setShowEmojiPickerForModal(!showEmojiPickerForModal)}
                      style={{ ...styles.stickerBtn, width: 90, height: 90, fontSize: 48 }}
                      aria-label="Pick sticker"
                    >
                      {addCardModalData.icon}
                    </button>
                  </Tooltip>
                </div>
              </div>
              {showEmojiPickerForModal && (
                <div style={styles.centerEmojiModal} onClick={e => e.stopPropagation()} className="modal-overlay-in">
                  <div style={gridStyle} className="animated-modal-content modal-animate-scale">
                    <EmojiPickerGrid
                      stickers={STICKER_OPTIONS}
                      onSelect={handleEmojiSelectForModal}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>Card Name</label>
              <input
                type="text"
                placeholder="Enter card name..."
                value={addCardModalData.label}
                onChange={(e) => setAddCardModalData(prev => ({ ...prev, label: e.target.value }))}
                style={styles.modalInput}
              />
            </div>

            <div style={styles.modalSection}>
              <label style={styles.modalLabel}>Points</label>
              <div style={styles.pointsControl}>
                <button onClick={() => setAddCardModalData(prev => ({ ...prev, pts: prev.pts - 1 }))} style={styles.pointsBtn}>
                  <Minus size={20} />
                </button>
                <div style={styles.pointsValue}>{addCardModalData.pts > 0 ? `+${addCardModalData.pts}` : addCardModalData.pts}</div>
                <button onClick={() => setAddCardModalData(prev => ({ ...prev, pts: prev.pts + 1 }))} style={styles.pointsBtn}>
                  <Plus size={20} />
                </button>
              </div>
              <div style={{
                ...styles.typeBadge,
                background: addCardModalData.pts > 0 ? '#F0FDF4' : '#FEF2F2',
                color: addCardModalData.pts > 0 ? '#16A34A' : '#DC2626'
              }}>
                {addCardModalData.pts > 0 ? 'WOW' : 'NO NO'}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.modalCancelBtn} onClick={() => setShowAddCardModal(false)}>Cancel</button>
              <button
                style={{
                  ...styles.modalSaveBtn,
                  opacity: addCardModalData.label.trim() ? 1 : 0.6,
                  cursor: addCardModalData.label.trim() ? 'pointer' : 'not-allowed'
                }}
                onClick={() => addCardModalData.label.trim() && handleAddCard(addCardModalData)}
                disabled={!addCardModalData.label.trim()}
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', position: 'relative' },
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
  mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '260px', background: '#fff', borderRight: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  tab: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'transparent', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#64748B' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: '#E8F5E9', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#2E7D32', fontWeight: 'bold' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    // NOTE: filter: drop-shadow removed — it caused expensive repaints on hover
  },
  emojiPickerBtn: { background: '#fff', border: '1px solid #E6EEF8', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.9)', borderRadius: '12px', boxShadow: '0 8px 30px rgba(2,6,23,0.08)' },
  emojiBtn: { fontSize: '20px', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', background: 'transparent' },
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
  iconBtn: { background: 'white', border: '1px solid #EEF2FF', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#2563EB', fontWeight: 700 },
  compactBtn: { padding: 8, borderRadius: 8, border: '1px solid #E6EEF8', background: 'white', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  compactDelete: { padding: 8, borderRadius: 8, border: '1px solid #ffd6d6', background: 'white', color: '#FF6B6B', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  iconOnlyBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, color: '#2563EB', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  smallIconBtn: { padding: '6px 8px', borderRadius: 8, border: '1px solid #EEF2FF', background: 'white', cursor: 'pointer' },
  saveActionBtn: { padding: '8px 12px', borderRadius: '10px', background: '#2E7D32', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' },
  cancelActionBtn: { padding: '8px 12px', borderRadius: '10px', background: 'transparent', color: '#333', border: '1px solid #E6EEF8', fontWeight: 700, cursor: 'pointer', marginLeft: 8 },
  saveIconBtn: { width: 44, height: 44, padding: 8, borderRadius: 12, background: '#2E7D32', color: 'white', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  cancelIconBtn: { width: 44, height: 44, padding: 8, borderRadius: 12, background: 'transparent', color: '#333', border: '1px solid #E6EEF8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 0 },
  editOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  editModal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  editModalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px', fontSize: '14px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { padding: '15px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  deleteConfirmBtn: { padding: '15px', background: '#FF6B6B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 10000 },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, borderRadius: 8, transition: 'all 0.2s' },
  modalSection: { marginBottom: '20px' },
  modalLabel: { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' },
  modalInput: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' },
  pointsControl: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' },
  pointsBtn: { width: '48px', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#4CAF50' },
  pointsValue: { fontSize: '24px', fontWeight: 800, minWidth: '60px', textAlign: 'center' },
  typeBadge: { textAlign: 'center', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' },
  modalFooter: { display: 'flex', gap: '10px', marginTop: '10px' },
  modalSaveBtn: { padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#4CAF50', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', flex: 1 },
  modalCancelBtn: { padding: '12px 20px', borderRadius: '12px', border: 'none', background: '#F1F5F9', color: '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', flex: 1 },
};
