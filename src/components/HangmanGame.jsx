import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, Volume2, Upload, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/gameSounds';
import PixiBackdrop from './PixiBackdrop';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function HangmanGame({ words: initialWords, contentItems, onBack, onEditWords, classColor = '#4CAF50', players = [] }) {
  const [words, setWords] = useState(initialWords.length ? initialWords : contentItems.filter(c => c.type === 'text' && c.text).map(c => ({ id: c.id, word: c.text.trim(), image: null, audio: null })));
  const [playing, setPlaying] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [guessed, setGuessed] = useState(new Set());
  const synthRef = useRef(null);
  const hasPlayedWinSound = useRef(false);

  const maxWrong = 6;
  const rawWord = words[wordIndex]?.word || '';
  const normalizedWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  const guessedLetters = guessed;
  const wrongGuesses = [...guessedLetters].filter(l => !normalizedWord.includes(l));
  const uniqueLetters = new Set(normalizedWord.split(''));
  const isWin = normalizedWord && [...uniqueLetters].every(l => guessedLetters.has(l));
  const isLose = wrongGuesses.length >= maxWrong;

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    if (!synthRef.current) synthRef.current = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    synthRef.current.speak(u);
  }, []);

  const playAudio = (audioSrc) => {
    if (!audioSrc) {
      speak(rawWord || normalizedWord);
      return;
    }
    const a = new Audio(audioSrc);
    a.play().catch(() => speak(rawWord || normalizedWord));
  };

  const guessLetter = (letter) => {
    const normalized = letter.toLowerCase();
    if (guessed.has(normalized) || isWin || isLose) return;
    const correct = normalizedWord.includes(normalized);
    if (correct) sounds.correct();
    else sounds.wrong();
    setGuessed(prev => new Set([...prev, normalized]));
  };

  const nextWord = () => {
    if (wordIndex < words.length - 1) {
      setWordIndex(i => i + 1);
      setGuessed(new Set());
      hasPlayedWinSound.current = false;
    } else {
      if (!hasPlayedWinSound.current) { sounds.win(); hasPlayedWinSound.current = true; }
      setPlaying(false);
    }
  };

  const addWord = () => {
    setWords(prev => [...prev, { id: Date.now(), word: '', image: null, audio: null }]);
  };

  const updateWord = (id, updates) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWord = (id) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const handleAudioUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateWord(id, { audio: reader.result });
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateWord(id, { image: reader.result });
    reader.readAsDataURL(file);
  };

  const validWords = words.filter(w => w.word && w.word.trim());

  useEffect(() => {
    if (typeof onEditWords === 'function') onEditWords(words);
  }, [words, onEditWords]);

  const startGame = () => {
    if (validWords.length < 1) return;
    setPlaying(true);
    setWordIndex(0);
    setGuessed(new Set());
    hasPlayedWinSound.current = false;
  };

  const gameContainerStyle = {
    position: playing ? 'fixed' : 'relative',
    inset: playing ? 0 : undefined,
    minHeight: '100vh',
    width: playing ? '100vw' : '100%',
    background: 'transparent',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    zIndex: playing ? 9999 : 1,
    overflow: 'hidden'
  };

  useEffect(() => {
    if (isWin && normalizedWord && !hasPlayedWinSound.current) {
      sounds.correct();
      hasPlayedWinSound.current = true;
    }
  }, [isWin, normalizedWord]);

  const styles = {
    container: gameContainerStyle,
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: playing ? 'rgba(70,70,70,0.6)' : 'rgba(230,230,230,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.12)', position: 'sticky', top: 0, zIndex: 100, color: playing ? '#f8fafc' : '#374151' },
    backBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600, color: '#374151' },
    main: { padding: 24, maxWidth: 'min(1200px, 96vw)', width: '100%', margin: '0 auto', position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 72px)' },
    layout: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 28, alignItems: 'start', minHeight: '70vh' },
    leftPanel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 },
    imageArea: { width: '100%', aspectRatio: '4/3', maxHeight: 200, background: 'white', borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    wordDisplay: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive', fontSize: 30, fontWeight: 700, letterSpacing: 3, minHeight: 60 },
    letterBox: { width: 38, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `4px solid ${classColor}`, color: '#111827' },
    wordSpacer: { width: 22, height: 48 },
    letterGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 },
    letterBtn: { width: 36, height: 36, borderRadius: 10, border: '2px solid #E5E7EB', background: 'white', fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive', fontSize: 16, fontWeight: 700, cursor: 'pointer', color: '#374151', transition: 'all 0.2s' },
    letterBtnUsed: { opacity: 0.4, cursor: 'default', borderColor: '#D1D5DB' },
    letterBtnWrong: { borderColor: '#EF4444', background: '#FEF2F2', color: '#EF4444' },
    letterBtnCorrect: { borderColor: classColor, background: '#F0FDF4', color: classColor },
    primaryBtn: { background: 'linear-gradient(135deg, #0f3d91 0%, #0b2d6c 100%)', color: 'white', padding: '14px 24px', borderRadius: 14, border: '2px solid rgba(0,0,0,0.2)', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    secondaryBtn: { background: 'rgba(255,255,255,0.85)', color: '#374151', padding: '12px 20px', borderRadius: 12, border: '2px solid rgba(0,0,0,0.15)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    card: { background: 'white', borderRadius: 20, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: 12 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
    input: { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 16, boxSizing: 'border-box' },
    hangmanFigureWrap: { width: '100%', background: 'white', borderRadius: 20, padding: 14, boxShadow: '0 6px 16px rgba(0,0,0,0.12)' },
    hangmanFigure: { width: '100%', height: 220, display: 'block' }
  };

  if (playing && validWords.length > 0) {
    const w = words[wordIndex];
    const displayWord = rawWord || '';
    const stage = wrongGuesses.length;
    return (
      <div data-game-screen style={styles.container}>
        <PixiBackdrop classColor={classColor} variant="dark" />
        <nav style={styles.nav}>
          <button onClick={() => setPlaying(false)} style={styles.backBtn}><ChevronLeft size={22} /> Exit</button>
          <span style={{ fontWeight: 700, color: '#e0e0e0' }}>Word {wordIndex + 1} / {validWords.length}</span>
          <div style={{ width: 36 }} />
        </nav>
        <main style={styles.main}>
          <div style={styles.layout}>
            <div style={styles.leftPanel}>
              <div style={styles.hangmanFigureWrap}>
                <svg viewBox="0 0 240 260" style={styles.hangmanFigure} aria-label="Hangman figure">
                  <rect x="12" y="210" width="216" height="18" rx="9" fill="#1f2937" opacity="0.3" />
                  <line x1="48" y1="210" x2="48" y2="24" stroke="#1f2937" strokeWidth="8" />
                  <line x1="44" y1="24" x2="170" y2="24" stroke="#1f2937" strokeWidth="8" />
                  <line x1="168" y1="24" x2="168" y2="52" stroke="#1f2937" strokeWidth="6" />
                  <path d="M40 60 Q70 40 100 60" stroke="#111827" strokeWidth="4" fill="none" opacity="0.3" />
                  {stage > 0 && <circle cx="168" cy="78" r="20" fill="#FDE68A" stroke="#1f2937" strokeWidth="5" />}
                  {stage > 0 && (
                    <>
                      <circle cx="162" cy="74" r="3" fill="#111827" />
                      <circle cx="174" cy="74" r="3" fill="#111827" />
                      <path d="M162 84 Q168 90 174 84" stroke="#111827" strokeWidth="3" fill="none" />
                    </>
                  )}
                  {stage > 1 && <rect x="150" y="98" width="36" height="46" rx="12" fill="#60A5FA" stroke="#1f2937" strokeWidth="5" />}
                  {stage > 2 && <line x1="150" y1="112" x2="126" y2="132" stroke="#1f2937" strokeWidth="6" />}
                  {stage > 3 && <line x1="186" y1="112" x2="210" y2="132" stroke="#1f2937" strokeWidth="6" />}
                  {stage > 4 && <line x1="158" y1="144" x2="140" y2="174" stroke="#1f2937" strokeWidth="6" />}
                  {stage > 5 && <line x1="178" y1="144" x2="196" y2="174" stroke="#1f2937" strokeWidth="6" />}
                  {stage > 3 && <circle cx="126" cy="132" r="6" fill="#FDE68A" stroke="#1f2937" strokeWidth="3" />}
                  {stage > 3 && <circle cx="210" cy="132" r="6" fill="#FDE68A" stroke="#1f2937" strokeWidth="3" />}
                </svg>
              </div>
              <div style={styles.imageArea}>
                {w?.image ? <img src={w.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#9CA3AF', fontSize: 14 }}>No image</span>}
              </div>
              <button onClick={() => playAudio(w?.audio)} style={{ ...styles.primaryBtn, padding: '10px 20px' }} title="Play audio / speak">
                <Volume2 size={18} /> Listen
              </button>
              <div style={styles.wordDisplay}>
                {displayWord.split('').map((c, i) => {
                  const isLetter = /[a-z]/i.test(c);
                  if (!isLetter) {
                    return <div key={`${c}-${i}`} style={styles.wordSpacer}>{c}</div>;
                  }
                  const show = guessedLetters.has(c.toLowerCase());
                  return (
                    <div key={`${c}-${i}`} style={styles.letterBox}>
                      {show ? c : ''}
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>{normalizedWord.length} letters</p>
            </div>
            <div>
              <div style={styles.letterGrid}>
                {LETTERS.map(l => {
                  const used = guessed.has(l);
                  const wrong = used && !normalizedWord.includes(l);
                  const correct = used && normalizedWord.includes(l);
                  let btnStyle = styles.letterBtn;
                  if (used) btnStyle = { ...styles.letterBtn, ...styles.letterBtnUsed };
                  if (wrong) btnStyle = { ...styles.letterBtn, ...styles.letterBtnWrong };
                  if (correct) btnStyle = { ...styles.letterBtn, ...styles.letterBtnCorrect };
                  return (
                    <button key={l} style={btnStyle} onClick={() => guessLetter(l)} disabled={used || isWin || isLose}>
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {(isWin || isLose) && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: isWin ? classColor : '#EF4444' }}>{isWin ? 'You got it!' : `The word was: ${rawWord || normalizedWord}`}</p>
              {players.length > 0 && <p style={{ color: '#9ca3af', marginTop: 4 }}>Players: {players.length}</p>}
              <button onClick={nextWord} style={{ ...styles.primaryBtn, marginTop: 12 }}>
                {wordIndex < validWords.length - 1 ? 'Next word' : 'Finish'}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <PixiBackdrop classColor={classColor} variant="light" />
      <nav style={styles.nav}>
        <button onClick={onBack} style={styles.backBtn}><ChevronLeft size={22} /> Back</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Hangman</h2>
        <button onClick={startGame} style={styles.primaryBtn} disabled={validWords.length < 1}>
          <RotateCcw size={18} /> Play
        </button>
      </nav>
      <main style={styles.main}>
        <p style={{ color: '#6B7280', marginBottom: 20 }}>Add words to guess. Optional: image and audio for each word.</p>
        {words.map(w => (
          <div key={w.id} style={styles.card}>
            <label style={styles.label}>Word</label>
            <input placeholder="e.g. Apple" value={w.word} onChange={e => updateWord(w.id, { word: e.target.value })} style={{ ...styles.input, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <label style={styles.label}>Image (optional)</label>
                {w.image ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={w.image} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                    <button onClick={() => updateWord(w.id, { image: null })} style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}>×</button>
                  </div>
                ) : (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '2px dashed #E5E7EB', cursor: 'pointer', fontSize: 13 }}>
                    <Upload size={14} /> Upload
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(w.id, e)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <div>
                <label style={styles.label}>Audio (optional)</label>
                {w.audio ? (
                  <span style={{ fontSize: 13, color: classColor }}>✓ Audio added</span>
                ) : (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '2px dashed #E5E7EB', cursor: 'pointer', fontSize: 13 }}>
                    <Volume2 size={14} /> Upload / Generate
                    <input type="file" accept="audio/*" onChange={e => handleAudioUpload(w.id, e)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              <button onClick={() => removeWord(w.id)} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13 }}>Remove</button>
            </div>
          </div>
        ))}
        <button onClick={addWord} style={{ ...styles.secondaryBtn, width: '100%', justifyContent: 'center', marginBottom: 20 }}>
          + Add word
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBack} style={styles.secondaryBtn}>Back to Games</button>
          <button onClick={startGame} style={styles.primaryBtn} disabled={validWords.length < 1}>
            Play ({validWords.length} words)
          </button>
        </div>
      </main>
    </div>
  );
}
