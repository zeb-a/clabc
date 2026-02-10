import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, Image as ImageIcon, Play, Maximize2, Minimize2 } from 'lucide-react';
import { sounds } from '../utils/gameSounds';
import PixiBackdrop from './PixiBackdrop';
import { useTranslation } from '../i18n';

const OPTIONS = ['A', 'B', 'C', 'D'];

// Kid-friendly colors matching FaceOff
const LEFT_COLOR = '#32CD32';   // Lime green (player 1)
const RIGHT_COLOR = '#FF69B4';  // Hot pink (player 2)
const DIVIDER_COLOR = '#2D3748';
const DIVIDER_ACCENT = '#4ECDC4';

export default function QuizGame({ questions: initialQuestions, onBack, onEditQuestions, classColor = '#4CAF50', players = [], autoStart = false, selectedClass = null, onGivePoints = null }) {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState(initialQuestions?.length ? initialQuestions : [{ id: Date.now(), question: '', image: null, options: ['', '', '', ''], correct: 0 }]);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [fullScreen, setFullScreen] = useState(true);

  // Two-side (FaceOff) mode state
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [roundAnswered, setRoundAnswered] = useState(null); // null | 'left' | 'right'
  const [wrongLeft, setWrongLeft] = useState(false);
  const [wrongRight, setWrongRight] = useState(false);
  const [wrongAnswerIndexLeft, setWrongAnswerIndexLeft] = useState(null);
  const [wrongAnswerIndexRight, setWrongAnswerIndexRight] = useState(null);
  const [showGameOver, setShowGameOver] = useState(false);

  // Single-player game over (score summary + points awarding)
  const [showSinglePlayerGameOver, setShowSinglePlayerGameOver] = useState(false);
  const [singlePlayerFinalScore, setSinglePlayerFinalScore] = useState(0);
  const [pointsToGive, setPointsToGive] = useState(1);
  const [pointsGiven, setPointsGiven] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  const validQuestions = questions.filter(q => {
    const opts = q.options || [];
    return q.question?.trim() && opts.length >= 2 && opts.some(o => o?.trim()) && opts[q.correct]?.trim();
  });
  const faceOffMode = playing && players.length >= 2;

  useEffect(() => {
    if (typeof onEditQuestions === 'function') onEditQuestions(questions);
  }, [questions, onEditQuestions]);

  useEffect(() => {
    if (autoStart && validQuestions.length >= 1 && players.length >= 2) {
      setPlaying(true);
      setCurrentIndex(0);
      setSelected(null);
      setShowResult(false);
      setScore(0);
      setScoreLeft(0);
      setScoreRight(0);
      setRoundAnswered(null);
      setWrongLeft(false);
      setWrongRight(false);
      setWrongAnswerIndexLeft(null);
      setWrongAnswerIndexRight(null);
    }
  }, [autoStart, validQuestions.length, players.length]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, { id: Date.now(), question: '', image: null, options: ['', ''], correct: 0 }]);
  };

  const addOption = (questionId) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      const opts = q.options || ['', ''];
      if (opts.length >= 4) return q;
      return { ...q, options: [...opts, ''] };
    }));
  };

  const updateQuestion = (id, updates) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateQuestion(id, { image: reader.result });
    reader.readAsDataURL(file);
  };

  const startGame = () => {
    if (validQuestions.length < 1) return;
    setPlaying(true);
    setCurrentIndex(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setScoreLeft(0);
    setScoreRight(0);
    setRoundAnswered(null);
    setWrongLeft(false);
    setWrongRight(false);
    setWrongAnswerIndexLeft(null);
    setWrongAnswerIndexRight(null);
  };

  const submitAnswer = () => {
    if (selected === null) return;
    const q = validQuestions[currentIndex];
    const isCorrect = selected === q.correct;
    if (isCorrect) {
      setScore(s => s + 1);
      sounds.correct();
    } else sounds.wrong();
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < validQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowResult(false);
      setRoundAnswered(null);
      setWrongLeft(false);
      setWrongRight(false);
    } else {
      sounds.win();
      if (players.length >= 2) {
        // FaceOff: handled via showGameOver in handleSideAnswer
        setPlaying(false);
      } else {
        // Single-player: show points-awarding game-over modal (include last question's result)
        const q = validQuestions[currentIndex];
        const lastCorrect = selected === q?.correct;
        setSinglePlayerFinalScore(score + (lastCorrect ? 1 : 0));
        setShowSinglePlayerGameOver(true);
        setPlaying(false);
      }
    }
  };

  // FaceOff-style: one side tapped an option (left or right)
  const handleSideAnswer = (side, optionIndex) => {
    if (roundAnswered) return;
    const q = validQuestions[currentIndex];
    const isCorrect = optionIndex === q.correct;

    if (side === 'left') {
      if (wrongLeft) return;
      if (isCorrect) {
        setScoreLeft(s => s + 1);
        setRoundAnswered('left');
        sounds.correct();
        setTimeout(() => {
          if (currentIndex < validQuestions.length - 1) {
            setCurrentIndex(i => i + 1);
            setRoundAnswered(null);
            setWrongLeft(false);
            setWrongRight(false);
            setWrongAnswerIndexLeft(null);
            setWrongAnswerIndexRight(null);
          } else {
            sounds.win();
            setShowGameOver(true);
          }
        }, 1400);
      } else {
        setWrongLeft(true);
        setWrongAnswerIndexLeft(optionIndex);
        sounds.wrong();
      }
      return;
    }

    if (side === 'right') {
      if (wrongRight) return;
      if (isCorrect) {
        setScoreRight(s => s + 1);
        setRoundAnswered('right');
        sounds.correct();
        setTimeout(() => {
          if (currentIndex < validQuestions.length - 1) {
            setCurrentIndex(i => i + 1);
            setRoundAnswered(null);
            setWrongLeft(false);
            setWrongRight(false);
            setWrongAnswerIndexLeft(null);
            setWrongAnswerIndexRight(null);
          } else {
            sounds.win();
            setShowGameOver(true);
          }
        }, 1400);
      } else {
        setWrongRight(true);
        setWrongAnswerIndexRight(optionIndex);
        sounds.wrong();
      }
    }
  };

  const gameContainerStyle = {
    position: fullScreen ? 'fixed' : 'relative',
    inset: fullScreen ? 0 : undefined,
    minHeight: '100vh',
    width: fullScreen ? '100vw' : '100%',
    background: 'transparent',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    zIndex: fullScreen ? 9999 : 1,
    overflow: 'hidden'
  };

  const styles = {
    container: gameContainerStyle,
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: playing ? 'rgba(70,70,70,0.55)' : 'rgba(230,230,230,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.12)', color: playing ? '#f8fafc' : '#374151', position: 'relative', zIndex: 1 },
    backBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 600, color: 'inherit' },
    main: { padding: 24, maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 },
    card: { background: 'rgba(245,245,245,0.95)', borderRadius: 18, padding: 24, border: '2px solid rgba(0,0,0,0.12)', boxShadow: '0 10px 24px rgba(0,0,0,0.18)', marginBottom: 20 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
    input: { width: '100%', padding: '14px 16px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 16, boxSizing: 'border-box', marginBottom: 12 },
    optionRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 },
    optionLetter: { width: 36, height: 36, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#6B7280', flexShrink: 0 },
    optionLetterCorrect: { background: classColor, color: 'white' },
    optionInput: { flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 15 },
    primaryBtn: { background: 'linear-gradient(135deg, #0f3d91 0%, #0b2d6c 100%)', color: 'white', padding: '14px 24px', borderRadius: 14, border: '2px solid rgba(0,0,0,0.2)', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    secondaryBtn: { background: 'rgba(255,255,255,0.85)', color: '#374151', padding: '12px 20px', borderRadius: 12, border: '2px solid rgba(0,0,0,0.15)', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    optionBtn: { width: '100%', padding: 18, borderRadius: 16, border: '2px solid rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.9)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s', marginBottom: 12 },
    optionBtnSelected: { borderColor: classColor, background: '#F0FDF4' },
    optionBtnCorrect: { borderColor: '#22C55E', background: '#ECFDF5' },
    optionBtnWrong: { borderColor: '#EF4444', background: '#FEF2F2' },
  };

  // ——— Game Over / Winner screen (FaceOff mode) ———
  if (faceOffMode && showGameOver) {
    const isTie = scoreLeft === scoreRight;
    const winnerIndex = scoreLeft >= scoreRight ? 0 : 1;
    const winnerName = isTie ? "It's a tie!" : (players[winnerIndex]?.name || `Player ${winnerIndex + 1}`);
    const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#95E1D3', '#FF69B4', '#98FB98'];

    return (
      <div style={{ ...styles.container, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <PixiBackdrop classColor={classColor} variant="dark" />
        {/* Confetti */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                width: 10 + Math.random() * 8,
                height: 10 + Math.random() * 8,
                background: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                borderRadius: Math.random() > 0.5 ? '50%' : 2,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `quizConfettiFall 2.5s ease-out ${Math.random() * 0.8}s forwards`,
                opacity: 0.9
              }}
            />
          ))}
          {['🎉', '✨', '🌟', '⭐', '🏆'].map((emoji, i) => (
            <div
              key={`e-${i}`}
              style={{
                position: 'absolute',
                left: `${15 + i * 18}%`,
                top: '-30px',
                fontSize: 28 + Math.random() * 20,
                animation: `quizConfettiFall 2.8s ease-out ${i * 0.15}s forwards`,
                opacity: 0.95
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes quizConfettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0.3; }
          }
        `}</style>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: isTie ? '#4ECDC4' : '#FFD700', marginBottom: 8, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {isTie ? `🏆 ${t('games.its_a_tie')} 🏆` : `🏆 ${t('games.winner')} 🏆`}
          </h1>
          <p style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', marginBottom: 24 }}>
            {winnerName}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 32 }}>
            <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.15)', borderRadius: 14, border: `2px solid ${LEFT_COLOR}` }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{players[0]?.name || 'Player 1'}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: LEFT_COLOR }}>{scoreLeft}</div>
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.15)', borderRadius: 14, border: `2px solid ${RIGHT_COLOR}` }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{players[1]?.name || 'Player 2'}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: RIGHT_COLOR }}>{scoreRight}</div>
            </div>
          </div>
          {/* Points awarding (FaceOff): give points to winner */}
          {selectedClass && onGivePoints && (
            <>
              {!pointsGiven ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>
                    {players.length >= 2 ? t('games.give_points_to_winner') : `${t('games.give_points_to')} ${players[0]?.name || 'Player'}:`}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[1, 2, 3, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPointsToGive(val)}
                        style={{
                          padding: '12px 20px',
                          fontSize: 18,
                          fontWeight: 800,
                          background: pointsToGive === val ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          border: `2px solid ${pointsToGive === val ? '#10B981' : 'rgba(255,255,255,0.4)'}`,
                          borderRadius: 12,
                          cursor: 'pointer'
                        }}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const isTie = scoreLeft === scoreRight;
                      const winners = isTie ? [players[0], players[1]].filter(Boolean) : [scoreLeft >= scoreRight ? players[0] : players[1]].filter(Boolean);
                      if (winners.length > 0 && onGivePoints) {
                        onGivePoints(winners, pointsToGive);
                        setWinnerData(winners.length === 1 ? winners[0] : winners);
                        setPointsGiven(true);
                      }
                    }}
                    style={{
                      padding: '12px 32px',
                      fontSize: 16,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 6px 24px rgba(245,158,11,0.4)'
                    }}
                  >
                    🎁 {t('games.give_points_btn').replace('{points}', pointsToGive)}
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981', marginBottom: 20, padding: '12px 24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, border: '2px solid #10B981' }}>
                  ✅ {Array.isArray(winnerData) && winnerData.length > 1 ? t('games.points_given_winners').replace('{points}', pointsToGive) : t('games.points_given').replace('{points}', pointsToGive).replace('{name}', winnerData?.name || 'winner')}
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => { setShowGameOver(false); setPointsGiven(false); setWinnerData(null); setCurrentIndex(0); setScoreLeft(0); setScoreRight(0); setRoundAnswered(null); setWrongLeft(false); setWrongRight(false); setWrongAnswerIndexLeft(null); setWrongAnswerIndexRight(null); }}
              style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: '700', background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(14,165,233,0.4)' }}
            >
              🔄 {t('games.play_again')}
            </button>
            <button
              onClick={() => onBack && onBack()}
              style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: '600', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, cursor: 'pointer' }}
            >
              ← {t('games.back_to_config')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Single-player game over: points awarding modal ———
  if (showSinglePlayerGameOver) {
    const totalQuestions = validQuestions.length;
    const singlePlayer = players[0];
    return (
      <div style={{ ...styles.container, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <PixiBackdrop classColor={classColor} variant="dark" />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: 24, padding: 32, border: '2px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#FFD700', marginBottom: 8, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            🏆 {t('games.quiz_complete')}
          </h1>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            {t('games.your_score')}: {singlePlayerFinalScore} / {totalQuestions}
          </p>
          {selectedClass && onGivePoints && singlePlayer && (
            <>
              {!pointsGiven ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>
                    {t('games.give_points_to')} {singlePlayer.name || 'Player'}:
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[1, 2, 3, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPointsToGive(val)}
                        style={{
                          padding: '12px 20px',
                          fontSize: 18,
                          fontWeight: 800,
                          background: pointsToGive === val ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          border: `2px solid ${pointsToGive === val ? '#10B981' : 'rgba(255,255,255,0.4)'}`,
                          borderRadius: 12,
                          cursor: 'pointer'
                        }}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (onGivePoints) {
                        onGivePoints([singlePlayer], pointsToGive);
                        setPointsGiven(true);
                        setWinnerData(singlePlayer);
                      }
                    }}
                    style={{
                      padding: '12px 32px',
                      fontSize: 16,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      cursor: 'pointer',
                      boxShadow: '0 6px 24px rgba(245,158,11,0.4)'
                    }}
                  >
                    🎁 {t('games.give_points_btn').replace('{points}', pointsToGive)}
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10B981', marginTop: 16, marginBottom: 16, padding: '12px 24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, border: '2px solid #10B981' }}>
                  ✅ {t('games.points_given').replace('{points}', pointsToGive).replace('{name}', singlePlayer.name || 'Player')}
                </div>
              )}
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => { setShowSinglePlayerGameOver(false); setPointsGiven(false); setWinnerData(null); setCurrentIndex(0); setScore(0); setSelected(null); setShowResult(false); startGame(); }}
              style={{ padding: '14px 28px', fontSize: '1.1rem', fontWeight: '700', background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)', color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(14,165,233,0.4)' }}
            >
              🔄 {t('games.play_again')}
            </button>
            <button
              onClick={() => onBack && onBack()}
              style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: '600', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, cursor: 'pointer' }}
            >
              ← {t('games.back_to_config')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— FaceOff-style two-side playing view ———
  if (faceOffMode && validQuestions.length > 0) {
    const q = validQuestions[currentIndex];
    const navColor = '#f8fafc';
    const optionLetters = ['A', 'B', 'C', 'D'];
    const visibleOptions = (q.options || []).map((o, i) => ({ letter: optionLetters[i], text: o, index: i })).filter(x => x.text?.trim());

    return (
      <div data-game-screen style={styles.container}>
        <PixiBackdrop classColor={classColor} variant="dark" />
        <nav style={{ ...styles.nav, color: navColor }}>
          <button onClick={() => (onBack ? onBack() : setPlaying(false))} style={styles.backBtn}><ChevronLeft size={22} /> {t('games.exit')}</button>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>
            {t('games.question_num').replace('{current}', currentIndex + 1).replace('{total}', validQuestions.length)}
          </span>
          <button onClick={() => setFullScreen(f => !f)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, color: navColor, cursor: 'pointer' }} title={fullScreen ? t('games.exit_full_screen') : t('games.full_screen')}>{fullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
        </nav>

        {/* Score panels - same layout as FaceOff */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 120, padding: '12px 16px', background: 'rgba(255,255,255,0.95)', borderRadius: 15, border: `3px solid ${LEFT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: LEFT_COLOR, marginBottom: 4 }}>{players[0]?.name || 'Player 1'}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: LEFT_COLOR }}>{scoreLeft}</div>
          </div>
          <div style={{ width: 120, padding: '12px 16px', background: 'rgba(255,255,255,0.95)', borderRadius: 15, border: `3px solid ${RIGHT_COLOR}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: RIGHT_COLOR, marginBottom: 4 }}>{players[1]?.name || 'Player 2'}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: RIGHT_COLOR }}>{scoreRight}</div>
          </div>
        </div>

        {/* Question area - centered like FaceOff word */}
        <div style={{ padding: '0 24px 16px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 24px', background: 'rgba(255,255,255,0.98)', borderRadius: 20, border: '4px solid #FFD700', boxShadow: '0 8px 24px rgba(255,215,0,0.25)' }}>
            {q.image && <img src={q.image} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }} />}
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', lineHeight: 1.4, fontFamily: 'Comic Sans MS, cursive, sans-serif' }}>{q.question}</div>
          </div>
        </div>

        {/* Two columns with vertical divider - same structure as FaceOff */}
        <div style={{ flex: 1, display: 'flex', padding: '0 16px 24px', gap: 0, position: 'relative', zIndex: 1, minHeight: '320px' }}>
          {/* Left side - Player 1 options */}
          <div style={{
            flex: 1,
            padding: '16px',
            background: 'rgba(240, 255, 244, 0.4)',
            borderRadius: '15px 0 0 15px',
            border: `3px solid ${LEFT_COLOR}40`,
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {visibleOptions.map(({ letter, text, index: i }) => {
              const isCorrect = i === q.correct;
              const showCorrect = roundAnswered && isCorrect;
              const showWrong = wrongLeft && wrongAnswerIndexLeft === i;
              const disabled = !!roundAnswered || wrongLeft;
              return (
                <button
                  key={`left-${i}`}
                  onClick={() => !roundAnswered && !wrongLeft && handleSideAnswer('left', i)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: `3px solid ${showCorrect ? '#22C55E' : showWrong ? '#EF4444' : '#CCCCCC'}`,
                    background: showCorrect ? '#ECFDF5' : showWrong ? '#FEF2F2' : 'rgba(255,255,255,0.95)',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    opacity: wrongLeft && !showCorrect && !showWrong ? 0.5 : 1
                  }}
                >
                  <span style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: showCorrect ? '#22C55E' : '#F3F4F6',
                    color: showCorrect ? '#fff' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0
                  }}>
                    {letter}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>{text}</span>
                </button>
              );
            })}
          </div>

          {/* Vertical divider - same as FaceOff */}
          <div style={{
            width: 28,
            flexShrink: 0,
            background: DIVIDER_COLOR,
            border: `4px solid ${DIVIDER_ACCENT}`,
            borderRadius: 4
          }} />

          {/* Right side - Player 2 options (same options) */}
          <div style={{
            flex: 1,
            padding: '16px',
            background: 'rgba(255, 245, 250, 0.4)',
            borderRadius: '0 15px 15px 0',
            border: `3px solid ${RIGHT_COLOR}40`,
            borderLeft: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            {visibleOptions.map(({ letter, text, index: i }) => {
              const isCorrect = i === q.correct;
              const showCorrect = roundAnswered && isCorrect;
              const showWrong = wrongRight && wrongAnswerIndexRight === i;
              const disabled = !!roundAnswered || wrongRight;
              return (
                <button
                  key={`right-${i}`}
                  onClick={() => !roundAnswered && !wrongRight && handleSideAnswer('right', i)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: `3px solid ${showCorrect ? '#22C55E' : showWrong ? '#EF4444' : '#CCCCCC'}`,
                    background: showCorrect ? '#ECFDF5' : showWrong ? '#FEF2F2' : 'rgba(255,255,255,0.95)',
                    cursor: disabled ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    opacity: wrongRight && !showCorrect && !showWrong ? 0.5 : 1
                  }}
                >
                  <span style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: showCorrect ? '#22C55E' : '#F3F4F6',
                    color: showCorrect ? '#fff' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 14,
                    flexShrink: 0
                  }}>
                    {letter}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ——— Single-player playing view (original) ———
  if (playing && validQuestions.length > 0) {
    const q = validQuestions[currentIndex];
    const isLast = currentIndex >= validQuestions.length - 1;
    return (
      <div data-game-screen style={styles.container}>
        <PixiBackdrop classColor={classColor} variant="dark" />
        <nav style={styles.nav}>
          <button onClick={() => setPlaying(false)} style={styles.backBtn}><ChevronLeft size={22} /> {t('games.exit')}</button>
          <span style={{ fontWeight: 700, color: '#e0e0e0' }}>{t('games.question_num').replace('{current}', currentIndex + 1).replace('{total}', validQuestions.length)} • {t('games.score')}: {score}</span>
          <button onClick={() => setFullScreen(f => !f)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, color: '#e0e0e0', cursor: 'pointer' }} title={fullScreen ? t('games.exit_full_screen') : t('games.full_screen')}>{fullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
        </nav>
        <main style={styles.main}>
          <div style={styles.card}>
            {q.image && <img src={q.image} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />}
            <h3 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, color: '#111827' }}>{q.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(q.options || []).map((opt, i) => {
                if (!opt?.trim()) return null;
                const letter = ['A', 'B', 'C', 'D'][i];
                let btnStyle = styles.optionBtn;
                if (showResult) {
                  if (i === q.correct) btnStyle = { ...styles.optionBtn, ...styles.optionBtnCorrect };
                  else if (i === selected && selected !== q.correct) btnStyle = { ...styles.optionBtn, ...styles.optionBtnWrong };
                } else if (selected === i) btnStyle = { ...styles.optionBtn, ...styles.optionBtnSelected };
                return (
                  <button key={i} style={btnStyle} onClick={() => !showResult && setSelected(i)} disabled={showResult}>
                    <span style={{ ...styles.optionLetter, ...(showResult && i === q.correct ? styles.optionLetterCorrect : {}) }}>{letter}</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              {!showResult ? (
                <button style={styles.primaryBtn} onClick={submitAnswer} disabled={selected === null}>{t('games.submit')}</button>
              ) : (
                <button style={styles.primaryBtn} onClick={() => { if (isLast) sounds.win(); nextQuestion(); }}>
                  {currentIndex < validQuestions.length - 1 ? t('games.next') : t('games.finish')}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ——— Editor / setup view (when onEditQuestions provided or no autoStart) ———
  return (
    <div style={styles.container}>
      <PixiBackdrop classColor={classColor} variant="light" />
      <nav style={styles.nav}>
        <button onClick={onBack} style={styles.backBtn}><ChevronLeft size={22} /> {t('games.back')}</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('games.quiz')}</h2>
        <button onClick={startGame} style={styles.primaryBtn} disabled={validQuestions.length < 1}>
          <Play size={18} /> {t('games.play')}
        </button>
      </nav>
      <main style={styles.main}>
        <p style={{ color: '#6B7280', marginBottom: 20 }}>{t('games.no_questions')}</p>
        {questions.map(q => (
          <div key={q.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={styles.label}>Question</label>
              <button onClick={() => removeQuestion(q.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }} title="Remove"><Trash2 size={18} /></button>
            </div>
            <input placeholder="Enter your question" value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })} style={styles.input} />
            <label style={styles.label}>Add image (optional)</label>
            <div style={{ marginBottom: 12 }}>
              {q.image ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={q.image} alt="" style={{ maxWidth: 200, maxHeight: 120, objectFit: 'cover', borderRadius: 12 }} />
                  <button onClick={() => updateQuestion(q.id, { image: null })} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 8, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ) : (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, border: '2px dashed #E5E7EB', cursor: 'pointer', background: '#F9FAFB' }}>
                  <ImageIcon size={18} color="#6B7280" />
                  <span style={{ fontSize: 14, color: '#6B7280' }}>Upload image</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(q.id, e)} style={{ display: 'none' }} />
                </label>
              )}
            </div>
            <label style={styles.label}>Options (mark correct with the letter)</label>
            {(q.options || ['', '']).map((_, i) => (
              <div key={i} style={styles.optionRow}>
                <button
                  type="button"
                  style={{ ...styles.optionLetter, ...(q.correct === i ? styles.optionLetterCorrect : {}) }}
                  onClick={() => updateQuestion(q.id, { correct: i })}
                  title="Correct answer"
                >
                  {OPTIONS[i]}
                </button>
                <input
                  placeholder={`Option ${OPTIONS[i]}`}
                  value={q.options[i] || ''}
                  onChange={e => {
                    const opts = [...(q.options || ['', ''])];
                    opts[i] = e.target.value;
                    updateQuestion(q.id, { options: opts });
                  }}
                  style={styles.optionInput}
                />
              </div>
            ))}
            {(q.options || ['', '']).length < 4 && (
              <button type="button" onClick={() => addOption(q.id)} style={{ ...styles.secondaryBtn, marginTop: 8, padding: '8px 14px', fontSize: 13 }}>+ {t('games.add')}</button>
            )}
          </div>
        ))}
        <button onClick={addQuestion} style={{ ...styles.secondaryBtn, width: '100%', justifyContent: 'center', marginTop: 8 }}>
          <Plus size={18} /> {t('games.add_question')}
        </button>
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button onClick={onBack} style={styles.secondaryBtn}>{t('games.back_to_config')}</button>
          <button onClick={startGame} style={styles.primaryBtn} disabled={validQuestions.length < 1}>
            <Play size={18} /> {t('games.play')} ({validQuestions.length} {t('games.questions_count').replace('{count}', validQuestions.length)})
          </button>
        </div>
      </main>
    </div>
  );
}
