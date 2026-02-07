import { useState, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import TornadoGame from './TornadoGame';
import api from '../services/api';

const TornadoGameWrapper = ({ onBack, classes: externalClasses }) => {
  const [gameState, setGameState] = useState('config'); // select-class, select-students, config, playing, finished
  const [classes, setClasses] = useState(externalClasses || []);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [user, setUser] = useState(null);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [config, setConfig] = useState({
    playerCount: 2,
    squareCount: 20,
    numberedSquares: true,
    tornadoCount: 'random',
    decorativeElements: [],
  });
  const [players, setPlayers] = useState([]);
  const [pixiContainer, setPixiContainer] = useState(null);
  const [prefilled, setPrefilled] = useState(false);

  // Helper functions
  const addWord = (word) => {
    setConfig(prev => ({ ...prev, decorativeElements: [...prev.decorativeElements, word] }));
  };

  const removeWord = (word) => {
    setConfig(prev => ({
      ...prev,
      decorativeElements: prev.decorativeElements.filter(e => e !== word)
    }));
  };

  // Load user and classes
  useEffect(() => {
    const storedUser = localStorage.getItem('classABC_logged_in');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const loadClasses = async () => {
      try {
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        const userEmail = parsedUser?.email || 'anonymous';
        const token = localStorage.getItem('classABC_pb_token') || localStorage.getItem('classABC_token');
        if (token) api.setToken(token);

        console.log('[TornadoGameWrapper] Loading classes for user:', userEmail);

        let remote = await api.getClasses(userEmail);
        console.log('[TornadoGameWrapper] Remote classes:', remote);
        if (Array.isArray(remote) && remote.length > 0) {
          setClasses(remote);
        } else {
          // Fallback to localStorage if remote is empty
          const key = `classABC_data_${userEmail}`;
          const localClasses = JSON.parse(localStorage.getItem(key)) || [];
          console.log('[TornadoGameWrapper] Local classes from', key, ':', localClasses);
          setClasses(localClasses);
        }
      } catch (e) {
        console.log('[TornadoGameWrapper] Error loading classes:', e);
        // Fallback to localStorage
        try {
          const storedUser = localStorage.getItem('classABC_logged_in');
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          const userEmail = parsedUser?.email || 'anonymous';
          const key = `classABC_data_${userEmail}`;
          const localClasses = JSON.parse(localStorage.getItem(key)) || [];
          console.log('[TornadoGameWrapper] Fallback local classes from', key, ':', localClasses);
          setClasses(localClasses);
        } catch (fallbackError) {
          console.error('[TornadoGameWrapper] Fallback error:', fallbackError);
          setClasses([]);
        }
      }
      setClassesLoaded(true);
    };

    loadClasses();
  }, []);

  // Pre-fill selections from localStorage if available
  useEffect(() => {
    if (classes.length > 0 && !prefilled) {
      // Check if TeacherPortal saved selections
      const savedPlayers = localStorage.getItem('torenado_players');
      const savedConfig = localStorage.getItem('torenado_config');

      if (savedPlayers && savedConfig) {
        try {
          const players = JSON.parse(savedPlayers);
          const configData = JSON.parse(savedConfig);

          console.log('[TornadoGameWrapper] Found saved selections:', { players, configData });

          // Find the class
          const targetClass = classes.find(c => c.id === configData.classId);
          if (targetClass) {
            console.log('[TornadoGameWrapper] Found class:', targetClass.name);
            setSelectedClass(targetClass);

            // Convert players back to student objects
            const students = players.map(player => {
              const student = targetClass.students.find(s => s.id === player.id);
              return student || {
                id: player.id,
                name: player.name,
                // Use a default gender if not found
                gender: 'boy'
              };
            }).filter(s => s !== null);

            console.log('[TornadoGameWrapper] Selected students:', students);
            setSelectedStudents(students);
            setPrefilled(true);

            // Clean up localStorage to avoid re-using on reload
            localStorage.removeItem('torenado_players');
            localStorage.removeItem('torenado_config');
          }
        } catch (e) {
          console.error('[TornadoGameWrapper] Error parsing saved selections:', e);
        }
      }
    }
  }, [classes, prefilled]);

  // When classes are passed externally, use them directly
  useEffect(() => {
    if (externalClasses && externalClasses.length > 0) {
      console.log('[TornadoGameWrapper] Using external classes:', externalClasses);
      setClasses(externalClasses);
      setClassesLoaded(true);
    }
  }, [externalClasses]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 50%, #E6E6FA 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Game Configuration Screen */}
      {gameState === 'config' && (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '5px solid #4ECDC4',
          boxShadow: '0 20px 60px rgba(78, 205, 196, 0.3)',
          marginTop: '50px',
          marginBottom: '50px'
        }}>
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                transition: 'all 0.3s ease',
                marginBottom: '20px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
              }}
            >
              ← Back to Portal
            </button>
          )}
          <h1 style={{
            fontSize: '56px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #95E1D3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            marginBottom: '10px',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
          }}>
            🌪️ TORENADO GAME 🌪️
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '20px',
            marginBottom: '30px',
            fontFamily: 'Comic Sans MS, cursive, sans-serif'
          }}>
            A Fun Educational Adventure for Kids!
          </p>

          {/* Class Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '15px',
              textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
            }}>
              📚 Select a Class:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {classes.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '30px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  borderRadius: '20px',
                  border: '2px dashed #FF6B6B'
                }}>
                  <p style={{
                    fontSize: '16px',
                    color: '#FF6B6B',
                    fontWeight: 'bold'
                  }}>
                    😕 No classes found! Please create a class first.
                  </p>
                </div>
              ) : classes.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => {
                    setSelectedClass(cls);
                    setSelectedStudents([]);
                  }}
                  style={{
                    padding: '20px',
                    background: selectedClass?.id === cls.id
                      ? 'linear-gradient(135deg, #4ECDC4, #95E1D3)'
                      : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '20px',
                    border: `3px solid ${selectedClass?.id === cls.id ? '#4ECDC4' : '#ddd'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    boxShadow: selectedClass?.id === cls.id
                      ? '0 5px 20px rgba(78, 205, 196, 0.4)'
                      : '0 2px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    fontSize: '40px',
                    marginBottom: '8px'
                  }}>
                    {cls.theme === 'ocean' ? '🌊' : cls.theme === 'space' ? '🚀' : cls.theme === 'forest' ? '🌳' : '⭐'}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: selectedClass?.id === cls.id ? '#fff' : '#333'
                  }}>
                    {cls.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: selectedClass?.id === cls.id ? '#fff' : '#666'
                  }}>
                    {cls.students?.length || 0} students
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Selection */}
          {selectedClass && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                color: '#fff',
                fontSize: '20px',
                fontWeight: '600',
                display: 'block',
                marginBottom: '15px',
                textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
              }}>
                👥 Select Students (2-4):
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px',
                marginBottom: '20px',
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                {(selectedClass.students || []).map(student => (
                  <div
                    key={student.id}
                    onClick={() => {
                      const isSelected = selectedStudents.some(s => s.id === student.id);
                      if (isSelected) {
                        setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
                      } else if (selectedStudents.length < 4) {
                        setSelectedStudents(prev => [...prev, student]);
                      }
                    }}
                    style={{
                      padding: '15px',
                      background: selectedStudents.some(s => s.id === student.id)
                        ? 'linear-gradient(135deg, #4ECDC4, #95E1D3)'
                        : 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '15px',
                      border: `2px solid ${selectedStudents.some(s => s.id === student.id) ? '#4ECDC4' : '#ddd'}`,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      boxShadow: selectedStudents.some(s => s.id === student.id)
                        ? '0 3px 15px rgba(78, 205, 196, 0.3)'
                        : '0 1px 5px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div style={{
                      fontSize: '28px',
                      marginBottom: '5px'
                    }}>
                      {student.gender === 'girl' ? '👧' : '👦'}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: selectedStudents.some(s => s.id === student.id) ? '#fff' : '#333',
                      wordBreak: 'break-word'
                    }}>
                      {student.name}
                    </div>
                    {selectedStudents.some(s => s.id === student.id) && (
                      <div style={{
                        marginTop: '5px',
                        fontSize: '16px'
                      }}>
                        ✅
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Players Display */}
          {selectedStudents.length >= 2 && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                color: '#fff',
                fontSize: '20px',
                fontWeight: '600',
                display: 'block',
                marginBottom: '15px',
                textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
              }}>
                🎮 Ready to Play:
              </label>
              <div style={{
                display: 'grid',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {selectedStudents.map((player, index) => (
                  <div key={index} style={{
                    padding: '18px',
                    background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(149, 225, 211, 0.3))',
                    borderRadius: '15px',
                    border: '3px solid #4ECDC4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{ fontSize: '32px' }}>
                      {player?.gender === 'girl' ? '👧' : '👦'}
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}>
                      {player?.name || `Player ${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Square Count Selection */}
          <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '15px' }}>
            <label style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '15px',
              textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
            }}>
              🎯 Number of Squares:
            </label>
            <input
              type="range"
              min="10"
              max="40"
              value={config.squareCount}
              onChange={(e) => setConfig(prev => ({ ...prev, squareCount: parseInt(e.target.value) }))}
              style={{
                width: '100%',
                height: '15px',
                borderRadius: '8px',
                background: 'linear-gradient(90deg, #00d9ff, #ff00ff)',
                outline: 'none',
                marginBottom: '15px',
                cursor: 'pointer'
              }}
            />
            <div style={{
              textAlign: 'center',
              color: '#00d9ff',
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(0, 217, 255, 0.8)',
              padding: '10px',
              background: 'rgba(0, 217, 255, 0.1)',
              borderRadius: '10px'
            }}>
              {config.squareCount} Squares
            </div>
          </div>

          {/* Numbered Squares Toggle */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '15px',
              textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
            }}>
              🔢 Numbered Squares:
            </label>
            <button
              onClick={() => setConfig(prev => ({ ...prev, numberedSquares: !prev.numberedSquares }))}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: config.numberedSquares ? '#00ff88' : 'rgba(255, 255, 255, 0.3)',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: config.numberedSquares
                  ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: config.numberedSquares ? '#000' : '#fff',
                boxShadow: config.numberedSquares
                  ? '0 0 20px rgba(0, 255, 136, 0.7)'
                  : 'none'
              }}
            >
              {config.numberedSquares ? '✅ Enabled' : '❌ Disabled'}
            </button>
          </div>

          {/* Tornado Count Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '15px',
              textShadow: '0 0 10px rgba(0, 217, 255, 0.5)'
            }}>
              🌪️ Tornado Count:
            </label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setConfig(prev => ({ ...prev, tornadoCount: 'random' }))}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: config.tornadoCount === 'random' ? '#ff00ff' : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: config.tornadoCount === 'random'
                    ? 'linear-gradient(135deg, #ff00ff, #ff6600)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: config.tornadoCount === 'random' ? '#000' : '#fff'
                }}
              >
                🎲 Random
              </button>
              {[1, 2, 3, 4, 5].map(count => (
                <button
                  key={count}
                  onClick={() => setConfig(prev => ({ ...prev, tornadoCount: count }))}
                  style={{
                    padding: '15px 25px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    borderColor: config.tornadoCount === count ? '#ff00ff' : 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: config.tornadoCount === count
                      ? 'linear-gradient(135deg, #ff00ff, #ff6600)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: config.tornadoCount === count ? '#000' : '#fff'
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Decorative Elements Upload */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              color: '#4ECDC4',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '15px'
            }}>
              🖼️ Upload Pictures for Game Border:
            </label>
            <div
              style={{
                width: '100%',
                padding: '20px',
                marginBottom: '10px',
                fontSize: '16px',
                border: '4px dashed #4ECDC4',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #E6F3FF, #FFE4E1)',
                color: '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
                position: 'relative'
              }}
              onClick={() => document.getElementById('fileInput').click()}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 10px 30px rgba(78, 205, 196, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const newImages = files.slice(0, 20).map(file => URL.createObjectURL(file));
                  setConfig(prev => ({ ...prev, decorativeElements: [...prev.decorativeElements, ...newImages] }));
                }}
              />
              <div style={{
                fontSize: '48px',
                marginBottom: '10px'
              }}>
                📸
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#4ECDC4'
              }}>
                Click to Upload Images
              </div>
              <div style={{
                fontSize: '14px',
                color: '#999',
                marginTop: '5px'
              }}>
                or drag and drop files here
              </div>
            </div>
            <div style={{
              marginTop: '10px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(149, 225, 211, 0.15))',
              borderRadius: '15px',
              color: '#4ECDC4',
              fontSize: '15px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              {config.decorativeElements.filter(e => e.startsWith('data:') || e.startsWith('blob:')).length} / 20 images loaded
            </div>
          </div>

          {/* Add Words Input */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              color: '#FF6B6B',
              fontSize: '20px',
              fontWeight: '600',
              display: 'block',
              marginBottom: '10px'
            }}>
              ✏️ Add Words for Game Border (separate with commas):
            </label>
            <input
              type="text"
              placeholder="Type words separated by commas (e.g., apple, banana, cat, dog)"
              onChange={(e) => {
                const words = e.target.value.split(',').map(w => w.trim()).filter(w => w);
                const currentWords = config.decorativeElements.filter(e => typeof e === 'string' && !e.startsWith('data:') && !e.startsWith('blob:'));
                const images = config.decorativeElements.filter(e => e.startsWith('data:') || e.startsWith('blob:'));
                setConfig(prev => ({ ...prev, decorativeElements: [...images, ...words] }));
              }}
              style={{
                width: '100%',
                padding: '15px 20px',
                marginBottom: '10px',
                fontSize: '16px',
                border: '3px solid #FF6B6B',
                borderRadius: '15px',
                background: '#FFF5F5',
                color: '#333',
                outline: 'none'
              }}
            />
            <div style={{
              marginTop: '10px',
              padding: '12px 20px',
              background: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '15px',
              color: '#FF6B6B',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              💡 Tip: Type words separated by commas and they will be added automatically!
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={() => {
              if (selectedStudents.length >= 2) {
                setPlayers(selectedStudents);
                setConfig(prev => ({ ...prev, playerCount: selectedStudents.length }));
                setGameState('playing');
              }
            }}
            disabled={selectedStudents.length < 2}
            style={{
              width: '100%',
              padding: '25px',
              fontSize: '28px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '20px',
              cursor: selectedStudents.length >= 2 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              background: selectedStudents.length >= 2
                ? 'linear-gradient(135deg, #00d9ff, #00ff88, #ff00ff)'
                : '#ccc',
              color: '#000',
              textShadow: 'none',
              boxShadow: selectedStudents.length >= 2
                ? '0 10px 40px rgba(0, 217, 255, 0.5)'
                : 'none',
              animation: selectedStudents.length >= 2 ? 'glow 2s ease-in-out infinite' : 'none',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              opacity: selectedStudents.length >= 2 ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 15px 50px rgba(0, 217, 255, 0.8)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 10px 40px rgba(0, 217, 255, 0.5)';
            }}
          >
            🚀 START GAME 🚀
          </button>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            @keyframes glow {
              0%, 100% { box-shadow: 0 10px 40px rgba(0, 217, 255, 0.5); }
              50% { box-shadow: 0 10px 60px rgba(255, 0, 255, 0.7); }
            }
          `}</style>
        </div>
      )}

      {gameState === 'playing' && (
        <TornadoGame
          config={config}
          players={players.map((p, i) => ({
            id: i,
            name: typeof p === 'string' ? (p || `Player ${i + 1}`) : (p?.name || `Player ${i + 1}`),
            score: typeof p === 'string' ? 0 : (p?.score || 0),
            position: typeof p === 'string' ? 0 : (p?.position || 0),
            color: typeof p === 'string' ? ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] : (p?.color || ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i])
          }))}
          onGameEnd={() => setGameState('finished')}
          onBackToSetup={() => setGameState('config')}
        />
      )}

      {gameState === 'finished' && (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          marginTop: '50px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ffcc00, #ff6600)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            marginBottom: '30px',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            🏆 GAME OVER! 🏆
          </h1>

          <div style={{ marginBottom: '40px' }}>
            {players
              .map((p, i) => {
                const playerName = typeof p === 'string' ? p : p?.name;
                return { name: playerName || `Player ${i + 1}`, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] };
              })
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((player, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    marginBottom: '15px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '15px',
                    border: `2px solid ${player.color}`,
                    boxShadow: `0 0 20px ${player.color}50`
                  }}
                >
                  <div style={{
                    fontSize: `${24 - index * 4}px`,
                    fontWeight: 'bold',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {index === 0 && '🥇 '}
                    {index === 1 && '🥈 '}
                    {index === 2 && '🥉 '}
                    {player.name}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '900',
                    color: player.color
                  }}>
                    {player.score} pts
                  </div>
                </div>
              ))}
          </div>

          <button
            onClick={() => {
              setSelectedStudents([]);
              setGameState('config');
            }}
            style={{
              width: '100%',
              padding: '25px',
              fontSize: '24px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #00d9ff, #00ff88)',
              color: '#000',
              boxShadow: '0 10px 40px rgba(0, 217, 255, 0.5)'
            }}
          >
            🔄 PLAY AGAIN
          </button>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default TornadoGameWrapper;
