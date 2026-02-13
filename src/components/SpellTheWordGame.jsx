import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Upload } from 'lucide-react';
import { sounds } from '../utils/gameSounds';
import { useTranslation } from '../i18n';

// Kid-friendly colors
const LEFT_COLOR = '#32CD32';   // Lime green (player 1)
const RIGHT_COLOR = '#FF69B4';  // Hot pink (player 2)

// Extract filename without extension
function extractImageName(fileOrName) {
  let filename = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  filename = filename.replace(/[\\/]/g, ' ');
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex > 0) {
    const extension = filename.slice(lastDotIndex + 1).toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico'];
    if (imageExtensions.includes(extension)) {
      filename = filename.slice(0, lastDotIndex);
    }
  }
  return filename.trim();
}

export default function SpellTheWordGame({ onBack, onEditQuestions, words: propWords = [], classColor = '#4CAF50', players: propPlayers = [] }) {
  const { t } = useTranslation();
  const [words, setWords] = useState([]);
  const [players, setPlayers] = useState([]);
  const [activeTab, setActiveTab] = useState('words');
  const [playing, setPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [player1State, setPlayer1State] = useState({
    guessedLetters: {},
    completed: false,
    score: 0
  });
  const [player2State, setPlayer2State] = useState({
    guessedLetters: {},
    completed: false,
    score: 0
  });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const audioRef = useRef(null);

  const faceOffMode = playing && players.length >= 2;
  const validWords = words.filter(w => w.word?.trim());
  const currentWord = validWords[currentWordIndex];

  const playSound = (type) => {
    if (sounds[type]) {
      const audio = new Audio(sounds[type]);
      audio.play().catch(e => console.log('Audio play error:', e));
    }
  };

  const handleLetterClick = (letter, playerNum) => {
    if (!currentWord) return;

    // Get unique letters only
    const uniqueLetters = [...new Set(currentWord.word.toUpperCase().split('').filter(l => l.trim()))];
    const letterUpper = letter.toUpperCase();
    const key = `${playerNum}-${letter}`;
    const playerState = playerNum === 1 ? player1State : player2State;
    const setPlayerState = playerNum === 1 ? setPlayer1State : setPlayer2State;

    // Don't allow clicking if already guessed
    if (playerState.guessedLetters[key] !== undefined) return;

    const isCorrect = uniqueLetters.includes(letterUpper);

    // Update guessed letters and check for completion
    const newGuessedLetters = { ...playerState.guessedLetters, [key]: isCorrect ? 'correct' : 'wrong' };
    setPlayerState(prev => ({
      ...prev,
      guessedLetters: newGuessedLetters
    }));

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    // Check if all unique letters are guessed correctly
    const allGuessed = uniqueLetters.every(l => newGuessedLetters[`${playerNum}-${l.toLowerCase()}`] === 'correct');

    if (allGuessed) {
      playSound('win');

      // Mark word as completed and increment score
      setPlayerState(prev => ({ ...prev, completed: true, score: prev.score + 1 }));

      // In face-off mode, automatically move to next word after delay
      if (faceOffMode) {
        setTimeout(() => {
          if (currentWordIndex < validWords.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setPlayer1State(prev => ({ guessedLetters: {}, completed: false, score: prev.score }));
            setPlayer2State(prev => ({ guessedLetters: {}, completed: false, score: prev.score }));
          } else {
            setWinner(player1State.score + 1 > player2State.score + 1 ? 'player1' :
                     player2State.score + 1 > player1State.score + 1 ? 'player2' : 'tie');
            setGameOver(true);
          }
        }, 1500);
      }
    }
  };

  const nextWord = () => {
    if (currentWordIndex < validWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setPlayer1State({ guessedLetters: {}, completed: false, score: player1State.score });
      setPlayer2State({ guessedLetters: {}, completed: false, score: player2State.score });
    } else {
      if (faceOffMode) {
        setWinner(player1State.score > player2State.score ? 'player1' :
                 player2State.score > player1State.score ? 'player2' : 'tie');
        setGameOver(true);
      } else {
        // Single player finished
        setGameOver(true);
        setWinner('player1');
      }
    }
  };

  const startGame = () => {
    const wordsToUse = (words.length === 0 && propWords.length > 0) ? propWords : words;
    const validWordsToUse = wordsToUse.filter(w => w.word?.trim());

    if (validWordsToUse.length < 1) return;

    if (words.length === 0 && propWords.length > 0) {
      setWords(propWords);
    }

    setPlaying(true);
    setCurrentWordIndex(0);
    setPlayer1State({ guessedLetters: {}, completed: false, score: 0 });
    setPlayer2State({ guessedLetters: {}, completed: false, score: 0 });
    setGameOver(false);
    setWinner(null);
  };

  const resetGame = () => {
    setPlaying(false);
    setCurrentWordIndex(0);
    setPlayer1State({ guessedLetters: {}, completed: false, score: 0 });
    setPlayer2State({ guessedLetters: {}, completed: false, score: 0 });
    setGameOver(false);
    setWinner(null);
  };

  // Initialize words and players from props on first mount
  useEffect(() => {
    if (propWords && propWords.length > 0 && words.length === 0) {
      setWords(propWords);
    }
    if (propPlayers && propPlayers.length > 0 && players.length === 0) {
      setPlayers(propPlayers);
    }
  }, []);

  // Sync words from parent when propWords changes (but only if we have words in parent)
  useEffect(() => {
    if (propWords && propWords.length > 0) {
      setWords(propWords);
    }
  }, [propWords]);

  const renderConfig = () => (
    <div style={{
      width: '100%',
      maxWidth: '720px',
      margin: '0 auto',
      padding: '30px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '25px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: classColor }}>
          Spell the Word
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('words')}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '14px',
            fontWeight: '700',
            background: activeTab === 'words' ? classColor : '#f3f4f6',
            color: activeTab === 'words' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Words
        </button>
        <button
          onClick={() => setActiveTab('images')}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '14px',
            fontWeight: '700',
            background: activeTab === 'images' ? classColor : '#f3f4f6',
            color: activeTab === 'images' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Images & Words
        </button>
      </div>

      {/* Number of Players Selection */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '15px', border: '2px solid #e5e7eb' }}>
        <label style={{
          color: '#374151',
          fontSize: '15px',
          fontWeight: '700',
          display: 'block',
          marginBottom: '12px'
        }}>
          👥 Number of Players:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2].map(num => (
            <button
              key={num}
              onClick={() => setPlayers(num === 2 ? [
                { id: 'p1', name: 'Player 1' },
                { id: 'p2', name: 'Player 2' }
              ] : [])}
              style={{
                flex: 1,
                padding: '12px 20px',
                fontSize: '15px',
                fontWeight: '700',
                border: '3px solid',
                borderRadius: '12px',
                cursor: 'pointer',
                background: players.length === num ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : '#fff',
                color: players.length === num ? '#fff' : '#78716c',
                borderColor: players.length === num ? '#EC4899' : '#E7E5E4',
                boxShadow: players.length === num ? '0 4px 15px rgba(236, 72, 153, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {num === 1 ? '👤 1 Player' : '👥 2 Players'}
            </button>
          ))}
        </div>
        {players.length === 2 && (
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
            🎮 Two-player face-off mode enabled!
          </div>
        )}
      </div>

      {/* Image Upload Zone */}
      {activeTab === 'images' && (
        <div
          style={{
            border: `3px dashed ${classColor}`,
            borderRadius: '15px',
            padding: '30px',
            background: '#f8f9ff',
            textAlign: 'center',
            marginBottom: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onClick={() => document.getElementById('bulk-image-upload').click()}
        >
          <Upload size={48} color={classColor} style={{ marginBottom: '10px' }} />
          <div style={{ fontSize: '16px', fontWeight: '700', color: classColor }}>
            Drag & Drop Images Here
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
            Image filenames will be auto-detected as words
          </div>
          <input
            id="bulk-image-upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
              const readers = files.map(file => {
                return new Promise(resolve => {
                  const r = new FileReader();
                  r.onload = () => {
                    const word = extractImageName(file);
                    resolve({
                      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                      word,
                      image: r.result
                    });
                  };
                  r.readAsDataURL(file);
                });
              });
              Promise.all(readers).then(newWords => {
                setWords(prev => {
                  const updated = [...prev, ...newWords];
                  if (typeof onEditQuestions === 'function') {
                    onEditQuestions(updated);
                  }
                  return updated;
                });
              });
            }}
          />
        </div>
      )}

      {/* Words List */}
      <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '20px' }}>
        {words.map((word, index) => (
          <div key={word.id} style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            padding: '12px',
            background: '#f9fafb',
            borderRadius: '10px',
            marginBottom: '10px',
            border: '2px solid #e5e7eb'
          }}>
            <input
              type="text"
              value={word.word || ''}
              onChange={(e) => {
                setWords(prev => {
                  const updated = prev.map(w => w.id === word.id ? { ...w, word: e.target.value.toLowerCase() } : w);
                  if (typeof onEditQuestions === 'function') {
                    onEditQuestions(updated);
                  }
                  return updated;
                });
              }}
              placeholder="Enter word..."
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                textTransform: 'lowercase'
              }}
            />
            {word.image && (
              <img src={word.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
            )}
            <button
              onClick={() => {
                setWords(prev => {
                  const updated = prev.filter(w => w.id !== word.id);
                  if (typeof onEditQuestions === 'function') {
                    onEditQuestions(updated);
                  }
                  return updated;
                });
              }}
              style={{
                padding: '6px',
                background: '#fee2e2',
                border: 'none',
                color: '#dc2626',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add Word Button */}
      <button
        onClick={() => {
          setWords(prev => {
            const updated = [...prev, { id: Date.now(), word: '', image: null }];
            if (typeof onEditQuestions === 'function') {
              onEditQuestions(updated);
            }
            return updated;
          });
        }}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '16px',
          fontWeight: '700',
          background: '#f3f4f6',
          color: '#374151',
          border: '2px dashed #d1d5db',
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        + Add Word
      </button>

      {/* Start Game Button */}
      <button
        onClick={startGame}
        disabled={validWords.length < 1}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '18px',
          fontWeight: '800',
          background: validWords.length >= 1 ? classColor : '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: validWords.length >= 1 ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: validWords.length >= 1 ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        <Play size={24} />
        Start Game ({validWords.length} word{validWords.length !== 1 ? 's' : ''})
      </button>
    </div>
  );

  const renderPlayerBoard = (playerNum, playerState) => {
    if (!currentWord) return null;
    
    // Get unique letters only (one dash per letter)
    const uniqueLetters = [...new Set(currentWord.word.toUpperCase().split('').filter(l => l.trim()))];
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const isLeft = playerNum === 1;

    return (
      <div style={{
        flex: 1,
        padding: '20px',
        background: isLeft ? 'linear-gradient(180deg, #f0fff0 0%, #e0ffe0 100%)' :
                     'linear-gradient(180deg, #fff0f8 0%, #ffe0f8 100%)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflow: 'auto'
      }}>
        {/* Player Name */}
        <div style={{
          fontSize: '20px',
          fontWeight: '800',
          color: isLeft ? LEFT_COLOR : RIGHT_COLOR,
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          {players[playerNum - 1]?.name || (playerNum === 1 ? 'Player 1' : 'Player 2')}
        </div>

        {/* Score Display */}
        <div style={{
          textAlign: 'center',
          padding: '15px',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '15px',
          border: `3px solid ${isLeft ? LEFT_COLOR : RIGHT_COLOR}`
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Score</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: isLeft ? LEFT_COLOR : RIGHT_COLOR }}>
            {playerState.score}
          </div>
        </div>

        {/* Word Dashes - ONE dash per unique letter */}
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          {uniqueLetters.map((letter, index) => {
            const key = `${playerNum}-${letter.toLowerCase()}`;
            const isGuessed = playerState.guessedLetters[key] === 'correct';
            
            return (
              <div
                key={`${currentWord.word}-${letter}-${index}`}
                style={{
                  minWidth: '30px',
                  height: '40px',
                  borderBottom: `3px dashed ${isGuessed ? classColor : '#9ca3af'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '900',
                  color: isGuessed ? classColor : 'transparent',
                  fontFamily: 'Comic Sans MS, cursive',
                  textTransform: 'uppercase',
                  animation: isGuessed ? 'bounce 0.5s ease' : 'none'
                }}
              >
                {isGuessed ? letter : ''}
              </div>
            );
          })}
        </div>

        {/* Completed Status */}
        {playerState.completed && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            background: '#d1fae5',
            color: '#059669',
            borderRadius: '10px',
            fontWeight: '700',
            marginBottom: '10px'
          }}>
            ✓ Correct!
          </div>
        )}

        {/* Letter Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px'
        }}>
          {alphabet.map(letter => {
            const key = `${playerNum}-${letter}`;
            const status = playerState.guessedLetters[key];
            
            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter, playerNum)}
                disabled={status !== undefined || playerState.completed}
                style={{
                  padding: '10px',
                  fontSize: '16px',
                  fontWeight: '800',
                  fontFamily: 'Comic Sans MS, cursive',
                  background: status === 'correct' ? '#d1fae5' :
                             status === 'wrong' ? '#fee2e2' : 'white',
                  color: status === 'correct' ? '#059669' :
                         status === 'wrong' ? '#dc2626' : isLeft ? LEFT_COLOR : RIGHT_COLOR,
                  border: `3px solid ${status === 'correct' ? '#10b981' :
                                   status === 'wrong' ? '#f87171' :
                                   isLeft ? LEFT_COLOR : RIGHT_COLOR}`,
                  borderRadius: '8px',
                  cursor: status === undefined && !playerState.completed ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  animation: status === 'correct' ? 'bounce 0.5s ease' : 
                             status === 'wrong' ? 'shake 0.8s ease' : 'none',
                  textTransform: 'lowercase',
                  opacity: playerState.completed ? 0.5 : 1
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlaying = () => {
    if (!currentWord) return null;

    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: faceOffMode ?
          'linear-gradient(135deg, #e0ffe0 0%, #ffe0f8 100%)' :
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}>
        {/* Back Button - top left */}
        <button
          onClick={resetGame}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: '700',
            color: '#374151',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          <ChevronLeft size={18} />
          Back
        </button>

        {/* Close Button - top right */}
        <button
          onClick={onBack}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '45px',
            height: '45px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            fontSize: '24px',
            fontWeight: '900',
            color: '#ef4444',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          ✕
        </button>

        {/* Main Content */}
        <div style={{
          width: '100%',
          maxWidth: faceOffMode ? '1400px' : '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '80px 20px 40px 20px'
        }}>
          {/* Image Display */}
          {currentWord.image && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '15px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <img
                src={currentWord.image}
                alt=""
                style={{
                  maxWidth: '200px',
                  maxHeight: '150px',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
            </div>
          )}

          {/* Game Area - increased gap */}
          <div style={{
            width: '100%',
            display: 'flex',
            gap: faceOffMode ? '60px' : '15px',
            flexDirection: faceOffMode ? 'row' : 'column',
            alignItems: 'stretch'
          }}>
            {renderPlayerBoard(1, player1State)}
            {faceOffMode && renderPlayerBoard(2, player2State)}
          </div>

          {/* Word Count - moved to bottom */}
          <div style={{
            marginTop: '20px',
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Word {currentWordIndex + 1} of {validWords.length}
          </div>

          {/* Next Word Button */}
          <button
            onClick={nextWord}
            style={{
              marginTop: '15px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '700',
              background: 'rgba(255,255,255,0.9)',
              color: '#374151',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              display: (player1State.completed || player2State.completed) ? 'flex' : 'none'
            }}
          >
            Next Word →
          </button>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              padding: '40px',
              background: 'white',
              borderRadius: '25px',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                {winner === 'player1' ? '🏆' : winner === 'player2' ? '🏆' : '🤝'}
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: classColor, margin: '0 0 10px 0' }}>
                {winner === 'player1' ? `${players[0]?.name || 'Player 1'} Wins!` :
                 winner === 'player2' ? `${players[1]?.name || 'Player 2'} Wins!` :
                 "It's a Tie!"}
              </h2>
              {faceOffMode && (
                <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>
                  Final Score: {player1State.score} - {player2State.score}
                </p>
              )}
              {!faceOffMode && (
                <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>
                  You scored {player1State.score} point{player1State.score !== 1 ? 's' : ''}!
                </p>
              )}
              <button
                onClick={resetGame}
                style={{
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: '700',
                  background: classColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Back to Menu
              </button>
            </div>
          </div>
        )}

        {/* Animations */}
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          @keyframes shake {
            0% { transform: translateX(0) rotate(0deg); }
            10% { transform: translateX(-5px) rotate(-5deg); }
            20% { transform: translateX(5px) rotate(5deg); }
            30% { transform: translateX(-5px) rotate(-5deg); }
            40% { transform: translateX(5px) rotate(5deg); }
            50% { transform: translateX(-3px) rotate(-3deg); }
            60% { transform: translateX(3px) rotate(3deg); }
            70% { transform: translateX(-2px) rotate(-2deg); }
            80% { transform: translateX(2px) rotate(2deg); }
            90% { transform: translateX(-1px) rotate(-1deg); }
            100% { transform: translateX(0) rotate(0deg); }
          }
        `}</style>
      </div>
    );
  };

  return playing ? renderPlaying() : renderConfig();
}
