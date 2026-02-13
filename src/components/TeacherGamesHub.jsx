import { useState } from 'react';
import { ChevronLeft, Play, Image, Type, Plus, Trash2, X } from 'lucide-react';
import MemoryMatchGame from './MemoryMatchGame';
import QuizGame from './QuizGame';
import HangmanGame from './HangmanGame';
import TornadoGame from './TornadoGame';
import { useTranslation } from '../i18n';

const GAME_TYPES = [
  { id: 'memory', labelKey: 'games.memorymatch', descKey: 'games.memorymatch.desc' },
  { id: 'quiz', labelKey: 'games.quiz', descKey: 'games.quiz.desc' },
  { id: 'hangman', labelKey: 'games.hangman', descKey: 'games.hangman.desc' },
  { id: 'tornado', labelKey: 'games.torenado', descKey: 'games.tornado.desc' },
];

export default function TeacherGamesHub({ activeClass, playerIds = [], onBack }) {
  const { t } = useTranslation();
  const [contentItems, setContentItems] = useState([]); // { id, type: 'image'|'text', src?, text }
  const [quizQuestions, setQuizQuestions] = useState([]); // For quiz game
  const [hangmanWords, setHangmanWords] = useState([]); // { id, word, image?, audio? }
  const [activeGame, setActiveGame] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAddContent, setShowAddContent] = useState(false);
  const [addContentType, setAddContentType] = useState('text');
  const [pendingImage, setPendingImage] = useState(null);

  const addContentItem = (item) => {
    const id = Date.now();
    if (item.type === 'image') {
      setContentItems(prev => [...prev, { id, type: 'image', src: item.src, text: item.text || '' }]);
    } else {
      setContentItems(prev => [...prev, { id, type: 'text', text: item.text }]);
    }
    setShowAddContent(false);
  };

  const removeContentItem = (id) => {
    setContentItems(prev => prev.filter(c => c.id !== id));
  };

  const addPendingImageWithLabel = (label) => {
    if (pendingImage) addContentItem({ type: 'image', src: pendingImage, text: label || '' });
    setPendingImage(null);
    setShowAddContent(false);
  };

  const startGame = (gameType) => {
    setActiveGame(gameType);
  };

  const exitGame = () => {
    setActiveGame(null);
  };

  const gameStyles = {
    container: { minHeight: '100vh', background: '#F4F1EA', fontFamily: 'Inter, ui-sans-serif, system-ui' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid #E5E7EB', padding: '14px 20px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 },
    backBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600, color: '#374151' },
    title: { fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 },
    main: { padding: '100px 20px 40px', maxWidth: 900, margin: '0 auto' },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: '15px', fontWeight: 700, color: '#374151', marginBottom: 12 },
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 },
    contentCard: { background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', position: 'relative', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8 },
    contentRemove: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 8, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
    addContentArea: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
    addBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 14, border: '2px dashed #CBD5E1', background: '#F8FAFC', cursor: 'pointer', fontWeight: 600, color: '#64748B', transition: 'all 0.2s' },
    addBtnHover: { borderColor: '#4CAF50', color: '#4CAF50', background: '#F0FDF4' },
    gameGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
    gameCard: { background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)', borderRadius: 20, padding: 24, border: '2px solid rgba(76,175,80,0.2)', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
    gameCardHover: { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(76,175,80,0.2)', borderColor: '#4CAF50' },
    playPrimary: { background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: 'white', padding: '14px 24px', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: '15px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(76,175,80,0.35)' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
    modal: { background: 'white', borderRadius: 24, padding: 28, width: 400, maxWidth: '92vw', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' },
    modalTitle: { fontSize: '18px', fontWeight: 700, marginBottom: 16, color: '#111827' },
    textInput: { width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: '16px', marginBottom: 12, boxSizing: 'border-box' },
    modalActions: { display: 'flex', gap: 12, marginTop: 20 }
  };

  const players = (activeClass?.students || []).filter(s => playerIds.length === 0 || playerIds.includes(s.id));

  if (activeGame === 'memory') {
    return (
      <MemoryMatchGame
        contentItems={contentItems}
        onBack={exitGame}
        classColor="#4CAF50"
        players={players}
      />
    );
  }
  if (activeGame === 'quiz') {
    return (
      <QuizGame
        questions={quizQuestions}
        onBack={exitGame}
        onEditQuestions={setQuizQuestions}
        classColor="#4CAF50"
        players={players}
      />
    );
  }
  if (activeGame === 'hangman') {
    return (
      <HangmanGame
        words={hangmanWords}
        contentItems={contentItems}
        onBack={exitGame}
        onEditWords={setHangmanWords}
        classColor="#4CAF50"
        players={players}
      />
    );
  }
  if (activeGame === 'tornado') {
    return (
      <TornadoGame
        onBack={exitGame}
        classColor="#4CAF50"
      />
    );
  }

  return (
    <div data-games-hub style={gameStyles.container}>
      <nav style={gameStyles.nav} className="safe-area-top">
        <button onClick={onBack} style={gameStyles.backBtn}>
          <ChevronLeft size={22} />
          Back
        </button>
        <h1 style={gameStyles.title}>{activeClass?.name || 'Games'} — Play{players.length > 0 ? ` (${players.length} players)` : ''}</h1>
        <div style={{ width: 80 }} />
      </nav>

      <main style={gameStyles.main}>
        <section style={gameStyles.section}>
          <h3 style={gameStyles.sectionTitle}>{t('games.choose')}</h3>
          <div style={gameStyles.gameGrid}>
            {GAME_TYPES.map(g => (
              <div
                key={g.id}
                style={{
                  ...gameStyles.gameCard,
                  borderColor: selectedGame === g.id ? '#4CAF50' : 'rgba(76,175,80,0.2)',
                  boxShadow: selectedGame === g.id ? '0 12px 28px rgba(76,175,80,0.25)' : gameStyles.gameCard.boxShadow,
                  background: selectedGame === g.id ? 'linear-gradient(145deg, #F0FDF4 0%, #FFFFFF 100%)' : gameStyles.gameCard.background
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = gameStyles.gameCardHover.boxShadow; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                onClick={() => setSelectedGame(g.id)}
              >
                <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 800, color: '#111827' }}>{t(g.labelKey)}</h4>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280', lineHeight: 1.4 }}>{t(g.descKey)}</p>
                <button
                  data-primary-btn
                  style={{ ...gameStyles.playPrimary, opacity: selectedGame === g.id ? 1 : 0.7 }}
                  onClick={e => {
                    e.stopPropagation();
                    if (g.id === 'quiz') setQuizQuestions(prev => prev.length ? prev : [{ id: Date.now(), question: '', image: null, options: ['', '', '', ''], correct: 0 }]);
                    if (g.id === 'hangman') setHangmanWords(prev => prev.length ? prev : contentItems.filter(c => c.type === 'text').map(c => ({ id: c.id, word: c.text, image: null, audio: null })));
                    startGame(g.id);
                  }}
                >
                  <Play size={16} />
                  {t('games.play')}
                </button>
              </div>
            ))}
          </div>
        </section>

        {selectedGame === 'memory' && (
          <section style={gameStyles.section}>
            <h3 style={gameStyles.sectionTitle}>{t('games.add_content_memory')}</h3>
            <div style={gameStyles.addContentArea}>
              <label style={{ ...gameStyles.addBtn, cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => { setPendingImage(r.result); setAddContentType('image'); setShowAddContent(true); }; r.readAsDataURL(f); } e.target.value = ''; }} style={{ display: 'none' }} />
                <Image size={18} />
                {t('games.add_picture')}
              </label>
              <button
                onClick={() => { setAddContentType('text'); setShowAddContent(true); }}
                style={gameStyles.addBtn}
                onMouseEnter={e => Object.assign(e.currentTarget.style, gameStyles.addBtnHover)}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.background = ''; }}
              >
                <Type size={18} />
                {t('games.add_text')}
              </button>
            </div>
            <div style={gameStyles.contentGrid}>
              {contentItems.map(item => (
                <div key={item.id} style={gameStyles.contentCard}>
                  <button onClick={() => removeContentItem(item.id)} style={gameStyles.contentRemove} title="Remove">
                    <Trash2 size={12} />
                  </button>
                  {item.type === 'image' ? (
                    <>
                      <img src={item.src} alt="" style={{ width: '100%', height: '70%', objectFit: 'cover', borderRadius: 8 }} />
                      <span style={{ fontSize: 11, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{item.text || 'Image'}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 14, textAlign: 'center', wordBreak: 'break-word' }}>{item.text}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {showAddContent && (
        <div style={gameStyles.modalOverlay} onClick={() => setShowAddContent(false)}>
          <div style={gameStyles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={gameStyles.modalTitle}>{addContentType === 'text' ? t('games.add_text') : t('games.add_picture')}</h3>
            {addContentType === 'text' ? (
              <form onSubmit={e => { e.preventDefault(); const t = e.target.text.value.trim(); if (t) addContentItem({ type: 'text', text: t }); }}>
                <input name="text" placeholder="Enter text (e.g. a word)" style={gameStyles.textInput} autoFocus />
                <div style={gameStyles.modalActions}>
                  <button type="button" onClick={() => setShowAddContent(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', background: '#F3F4F6', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, ...gameStyles.playPrimary }}>Add</button>
                </div>
              </form>
            ) : (
              <div>
                {pendingImage ? (
                  <>
                    <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', maxHeight: 120 }}><img src={pendingImage} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} /></div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Label (optional)</label>
                    <input id="img-label" placeholder="e.g. Apple" style={gameStyles.textInput} onKeyDown={e => { if (e.key === 'Enter') addPendingImageWithLabel(e.target.value.trim()); }} />
                    <div style={gameStyles.modalActions}>
                      <button onClick={() => { setPendingImage(null); setShowAddContent(false); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', background: '#F3F4F6', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => addPendingImageWithLabel(document.getElementById('img-label')?.value?.trim())} style={{ flex: 1, ...gameStyles.playPrimary }}>Add</button>
                    </div>
                  </>
                ) : (
                  <>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>Add picture</label>
                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setPendingImage(r.result); r.readAsDataURL(f); } }} style={{ marginBottom: 12 }} />
                    <div style={gameStyles.modalActions}>
                      <button onClick={() => setShowAddContent(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid #E5E7EB', background: '#F3F4F6', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
