import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Plus, Trash2, Image as ImageIcon, Play, X, Upload } from 'lucide-react';
import { sounds } from '../utils/gameSounds';

import { useTranslation } from '../i18n';

// Kid-friendly colors
const LEFT_COLOR = '#32CD32';   // Lime green (player 1)
const RIGHT_COLOR = '#FF69B4';  // Hot pink (player 2)
const DIVIDER_COLOR = '#2D3748';
const DIVIDER_ACCENT = '#4ECDC4';

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

export default function SpellTheWordGame({ onBack, onEditQuestions, classColor = '#4CAF50', players = [], autoStart = false, selectedClass = null, onGivePoints = null }) {
  const { t } = useTranslation();
  const [words, setWords] = useState([]);
  const [activeTab, setActiveTab] = useState('images'); // Only 'images' tab now
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLettersLeft, setGuessedLettersLeft] = useState({});
  const [guessedLettersRight, setGuessedLettersRight] = useState({});
  const [fullScreen, setFullScreen] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [playerCount, setPlayerCount] = useState(1);

  // Two-player mode state
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [wordWinner, setWordWinner] = useState(null);
  const [eliminatedLeft, setEliminatedLeft] = useState(false);
  const [eliminatedRight, setEliminatedRight] = useState(false);

  const audioRef = useRef(null);

  const faceOffMode = playing && (players.length >= 2 || selectedStudents.length >= 2);

  // Get student name or fallback
  const getPlayerName = (index) => {
    const allPlayers = [...players, ...selectedStudents];
    if (allPlayers[index]?.name) {
      return allPlayers[index].name;
    }
    return `Player ${index + 1}`;
  };

  useEffect(() => {
    if (typeof onEditQuestions === 'function') onEditQuestions(words);
  }, [words, onEditQuestions]);

  // Keyboard support for single player mode
  useEffect(() => {
    if (!playing || faceOffMode) return;

    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        handleLetterClick(key, 'left');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playing, faceOffMode, currentIndex, guessedLettersLeft, wordWinner, eliminatedLeft]);

  const playSound = (type) => {
    if (sounds[type]) {
      const audio = new Audio(sounds[type]);
      audio.play().catch(e => console.log('Audio play error:', e));
    }
  };

  const addWord = () => {
    setWords(prev => [...prev, { id: Date.now(), word: '', image: null }]);
  };

  const updateWord = (id, updates) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWord = (id) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const handleImageUpload = (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const word = extractImageName(file);
      updateWord(id, { image: reader.result, word: word });
    };
    reader.readAsDataURL(file);
  };

  const handleBulkUpload = async (files) => {
    const imagePromises = Array.from(files).filter(f => f.type.startsWith('image/')).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const word = extractImageName(file);
          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            word,
            image: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newWords = await Promise.all(imagePromises);
    setWords(prev => [...prev, ...newWords]);
  };

  const startGame = () => {
    const validWords = words.filter(w => w.word?.trim());
    if (validWords.length < 1) return;

    // Check player selection
    if (selectedClass) {
      const requiredPlayers = playerCount;
      if (selectedStudents.length !== requiredPlayers) return;
    }

    setPlaying(true);
    setCurrentIndex(0);
    setGuessedLettersLeft({});
    setGuessedLettersRight({});
    setScoreLeft(0);
    setScoreRight(0);
    setGameOver(false);
    setWinner(null);
    setWordWinner(null);
    setEliminatedLeft(false);
    setEliminatedRight(false);
  };

  const handleLetterClick = (letter, player) => {
    const currentWord = words[currentIndex]?.word.toUpperCase();
    if (!currentWord) return;

    const letterUpper = letter.toUpperCase();
    const isSingle = !faceOffMode;
    const setGuessedLetters = isSingle ? setGuessedLettersLeft : (player === 'left' ? setGuessedLettersLeft : setGuessedLettersRight);
    const guessedLetters = isSingle ? guessedLettersLeft : (player === 'left' ? guessedLettersLeft : guessedLettersRight);
    const isEliminated = player === 'left' ? eliminatedLeft : eliminatedRight;
    const setEliminated = player === 'left' ? setEliminatedLeft : setEliminatedRight;

    const key = `${currentIndex}-${letterUpper}`;
    if (guessedLetters[key] !== undefined || isEliminated) return;

    const isCorrect = currentWord.includes(letterUpper);

    // Update guessed letters and check if complete in one operation
    setGuessedLetters(prev => {
      const newGuesses = { ...prev, [key]: isCorrect ? 'correct' : 'wrong' };

      // Check if word is complete for this player
      const allLetters = [...currentWord].filter(c => c !== ' ');
      const allGuessed = allLetters.every(l => newGuesses[`${currentIndex}-${l}`] === 'correct');

      // Count wrong guesses for this player
      const wrongGuesses = Object.keys(newGuesses).filter(k =>
        k.startsWith(`${currentIndex}-`) && newGuesses[k] === 'wrong'
      ).length;

      if (allGuessed) {
        setWordWinner(isSingle ? 'left' : player);
        playSound('win');

        // Give point to winner (or score in single player)
        if (isSingle || player === 'left') {
          setScoreLeft(prev => prev + 1);
        } else {
          setScoreRight(prev => prev + 1);
        }

        setTimeout(() => {
          moveToNextWord();
        }, 1500);
      } else if (wrongGuesses >= 3 && !isSingle) {
        // Player made 3 mistakes - deduct point and eliminate from this word
        playSound('wrong');
        setEliminated(true);

        if (player === 'left') {
          setScoreLeft(prev => Math.max(0, prev - 1));
        } else {
          setScoreRight(prev => Math.max(0, prev - 1));
        }

        // Check if both players are eliminated or one already won
        const otherEliminated = player === 'left' ? eliminatedRight : eliminatedLeft;
        if (otherEliminated || wordWinner !== null) {
          setTimeout(() => {
            moveToNextWord();
          }, 1000);
        }
      }

      return newGuesses;
    });

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  const moveToNextWord = () => {
    const validWords = words.filter(w => w.word?.trim());
    const nextIndex = currentIndex + 1;

    if (nextIndex >= validWords.length) {
      // Game over - determine winner
      setGameOver(true);
      const isSingle = !faceOffMode;
      if (isSingle) {
        setWinner('single');
      } else if (scoreLeft > scoreRight) {
        setWinner('left');
      } else if (scoreRight > scoreLeft) {
        setWinner('right');
      } else {
        setWinner('tie');
      }
    } else {
      // Move to next word
      setCurrentIndex(nextIndex);
      setGuessedLettersLeft({});
      setGuessedLettersRight({});
      setWordWinner(null);
      setEliminatedLeft(false);
      setEliminatedRight(false);
    }
  };

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

      {/* Player Selection */}
      {selectedClass && (
        <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #0EA5E940' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#0C4A6E', display: 'block', marginBottom: '8px' }}>
              👤 Select Number of Players
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setPlayerCount(1);
                  setSelectedStudents(prev => prev.slice(0, 1));
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '700',
                  background: playerCount === 1 ? classColor : '#f3f4f6',
                  color: playerCount === 1 ? 'white' : '#374151',
                  border: `2px solid ${playerCount === 1 ? classColor : '#e5e7eb'}`,
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                1 Player
              </button>
              <button
                onClick={() => {
                  setPlayerCount(2);
                  setSelectedStudents(prev => prev.slice(0, 2));
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '700',
                  background: playerCount === 2 ? classColor : '#f3f4f6',
                  color: playerCount === 2 ? 'white' : '#374151',
                  border: `2px solid ${playerCount === 2 ? classColor : '#e5e7eb'}`,
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                2 Players
              </button>
            </div>
          </div>

          <label style={{ fontSize: '14px', fontWeight: '700', color: '#0C4A6E', display: 'block', marginBottom: '8px' }}>
            👤 Select {playerCount === 1 ? '1 Student' : '2 Students'}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
            {(selectedClass.students || []).map(student => {
              const isSelected = selectedStudents.some(p => p.id === student.id);
              const isFull = selectedStudents.length >= playerCount;
              return (
                <button
                  key={student.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                    } else if (!isFull) {
                      setSelectedStudents(prev => [...prev, { id: student.id, name: student.name }]);
                    }
                  }}
                  disabled={!isSelected && isFull}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isSelected ? classColor : '#E2E8F0',
                    background: isSelected ? classColor : '#fff',
                    color: isSelected ? '#fff' : '#475569',
                    cursor: !isSelected && isFull ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    opacity: !isSelected && isFull ? 0.5 : 1,
                    textAlign: 'left'
                  }}
                >
                  {isSelected ? '✓ ' : ''}{student.name}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: selectedStudents.length === playerCount ? classColor : '#64748B', fontWeight: '600' }}>
            {selectedStudents.length === playerCount
              ? `✓ ${playerCount === 1 ? 'Student' : 'Students'} selected - Ready!`
              : `Select ${playerCount === 1 ? '1 student' : '2 students'} to play`
            }
          </div>
        </div>
      )}

      {/* Image Upload Zone */}
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f0ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8f9ff';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
            e.currentTarget.style.background = '#e0e0ff';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            e.currentTarget.style.background = '#f8f9ff';
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            e.currentTarget.style.background = '#f8f9ff';
            handleBulkUpload(e.dataTransfer.files);
          }}
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
            onChange={(e) => handleBulkUpload(e.target.files)}
          />
        </div>

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
              onChange={(e) => updateWord(word.id, { word: e.target.value })}
              placeholder="Enter word..."
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
            {activeTab === 'images' && (
              <label style={{
                padding: '8px 12px',
                background: classColor,
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                <ImageIcon size={16} />
                {word.image ? 'Change' : 'Add'} Image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(word.id, e)}
                />
              </label>
            )}
            {word.image && (
              <img src={word.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
            )}
            <button
              onClick={() => removeWord(word.id)}
              style={{
                padding: '6px',
                background: '#fee2e2',
                border: 'none',
                color: '#dc2626',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Word Button */}
      <button
        onClick={addWord}
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
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Plus size={20} />
        Add Word
      </button>

      {/* Start Game Button */}
      <button
        onClick={startGame}
        disabled={
          words.filter(w => w.word?.trim()).length < 1 ||
          (selectedClass && selectedStudents.length !== playerCount)
        }
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '18px',
          fontWeight: '800',
          background: 
            words.filter(w => w.word?.trim()).length >= 1 &&
            (!selectedClass || selectedStudents.length === playerCount)
              ? classColor : '#9ca3af',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 
            words.filter(w => w.word?.trim()).length >= 1 &&
            (!selectedClass || selectedStudents.length === playerCount)
              ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: 
            words.filter(w => w.word?.trim()).length >= 1 &&
            (!selectedClass || selectedStudents.length === playerCount)
              ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        <Play size={24} />
        Start Game ({words.filter(w => w.word?.trim()).length} word{words.filter(w => w.word?.trim()).length !== 1 ? 's' : ''})
      </button>
    </div>
  );

  const renderPlaying = () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return null;

    const wordLetters = currentWord.word.toUpperCase().split('').filter(c => c !== ' ');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

    const renderLetterPanel = (side) => {
      const isLeft = side === 'left';
      const isRight = side === 'right';
      const isSingle = !faceOffMode;
      const guessedLetters = isLeft ? guessedLettersLeft : (isSingle ? guessedLettersLeft : guessedLettersRight);
      const isPanelWinner = wordWinner === (isLeft ? 'left' : 'right');
      const isEliminated = isLeft ? eliminatedLeft : eliminatedRight;

      return (
        <div key={`letter-panel-${side}-${currentIndex}`} style={{
          flex: faceOffMode ? 1 : 1,
          padding: '13px',
          background: isEliminated ? 'rgba(200,200,200,0.5)' :
                       isLeft ? 'linear-gradient(180deg, #f0fff0 0%, #e0ffe0 100%)' :
                       isRight ? 'linear-gradient(180deg, #fff0f8 0%, #ffe0f8 100%)' :
                       'linear-gradient(180deg, #f0f8ff 0%, #e0f0ff 100%)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          opacity: (wordWinner && wordWinner !== (isLeft ? 'left' : 'right')) ? 0.4 : 1
        }}>
          {/* Player Name */}
          {faceOffMode && (
            <div style={{
              fontSize: '21px',
              fontWeight: '700',
              color: isLeft ? LEFT_COLOR : RIGHT_COLOR,
              textAlign: 'center'
            }}>
              {getPlayerName(isLeft ? 0 : 1)}
            </div>
          )}

          {/* Score Display */}
          <div style={{
            textAlign: 'center',
            padding: '10px',
            background: isEliminated ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)',
            borderRadius: '10px',
            border: `2px solid ${isLeft ? LEFT_COLOR : RIGHT_COLOR}`
          }}>
            <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: '600' }}>
              Score {isEliminated ? '(-1)' : ''}
            </div>
            <div style={{ fontSize: '31px', fontWeight: '800', color: isLeft ? LEFT_COLOR : RIGHT_COLOR }}>
              {isLeft ? scoreLeft : scoreRight}
            </div>
          </div>

          {/* Dashed Lines for Word */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '10px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {wordLetters.map((letter, idx) => {
              const key = `${currentIndex}-${letter.toUpperCase()}`;
              const isGuessed = guessedLetters[key] === 'correct';

              return (
                <div
                  key={`${key}-${idx}`}
                  style={{
                    fontSize: '32px',
                    fontWeight: '900',
                    color: isGuessed ? classColor : '#000000',
                    fontFamily: 'Comic Sans MS, cursive',
                    transition: 'all 0.3s ease',
                    animation: isGuessed ? 'flyIn 0.5s ease' : 'none',
                    transform: isGuessed ? 'scale(1.2)' : 'scale(1)'
                  }}
                >
                  {isGuessed ? letter.toLowerCase() : '•'}
                </div>
              );
            })}
          </div>

          {/* Letter Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            gap: '5px',
            opacity: isEliminated ? 0.5 : 1
          }}>
            {alphabet.map(letter => {
              const key = `${currentIndex}-${letter.toUpperCase()}`;
              const status = guessedLetters[key];

              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter, isLeft ? 'left' : 'right')}
                  disabled={status !== undefined || wordWinner !== null || isEliminated}
                  style={{
                    padding: '8px 5px',
                    fontSize: '18px',
                    fontWeight: '700',
                    fontFamily: isLeft || isSingle ? 'Comic Sans MS, cursive' : 'sans-serif',
                    background: status === 'correct' ? '#d1fae5' :
                               status === 'wrong' ? '#fee2e2' : 'white',
                    color: status === 'correct' ? '#059669' :
                           status === 'wrong' ? '#dc2626' : isLeft ? LEFT_COLOR : isRight ? RIGHT_COLOR : '#3B82F6',
                    border: `2px solid ${status === 'correct' ? '#10b981' :
                                     status === 'wrong' ? '#f87171' :
                                     isLeft ? LEFT_COLOR : isRight ? RIGHT_COLOR : '#3B82F6'}`,
                    borderRadius: '8px',
                    cursor: (status === undefined && wordWinner === null && !isEliminated) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    transform: status === 'wrong' ? 'translateX(-3px)' : 'none',
                    animation: status === 'correct' ? 'bounce 0.5s ease' : status === 'wrong' ? 'shake 0.5s ease' : 'none',
                    boxShadow: status === undefined ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
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
        overflow: 'hidden'
      }}>

        {/* Back Button */}
        <button
          onClick={() => {
            setPlaying(false);
            setWordWinner(null);
          }}
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

        {/* X Button - Go to TeacherPortal */}
        <button
          onClick={onBack}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.95)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 1000,
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          <X size={20} />
        </button>

        {/* Main Content */}
        <div style={{
          width: '100%',
          maxWidth: faceOffMode ? '1200px' : '600px',
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Word Progress */}
          <div style={{
            marginBottom: '20px',
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Word {currentIndex + 1} of {words.filter(w => w.word?.trim()).length}
          </div>

          {/* Image Display */}
          {currentWord.image && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <img
                src={currentWord.image}
                alt=""
                style={{
                  maxWidth: '300px',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '10px'
                }}
              />
            </div>
          )}

          {/* Game Area */}
          <div style={{
            width: '100%',
            display: 'flex',
            gap: '20px',
            flexDirection: faceOffMode ? 'row' : 'column'
          }}>
            {renderLetterPanel('left')}
            {faceOffMode && renderLetterPanel('right')}
          </div>
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
                {winner === 'left' ? '🏆' : winner === 'right' ? '🏆' : winner === 'single' ? '🎉' : '🤝'}
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: classColor, margin: '0 0 10px 0' }}>
                {winner === 'left' ? `${getPlayerName(0)} Wins!` :
                 winner === 'right' ? `${getPlayerName(1)} Wins!` :
                 winner === 'single' ? 'Great Job!' :
                 "It's a Tie!"}
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>
                Final Score: {scoreLeft} - {scoreRight}
              </p>
              <button
                onClick={() => {
                  setGameOver(false);
                  setPlaying(false);
                }}
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
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          @keyframes flyIn {
            0% { transform: translateY(-20px) scale(0.5); opacity: 0; }
            100% { transform: translateY(0) scale(1.1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };

  return playing ? renderPlaying() : renderConfig();
}
