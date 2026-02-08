import { useState, useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import TornadoGame from './TornadoGame';
import FaceOffGame from './FaceOffGame';
import MemoryMatchGame from './MemoryMatchGame';
import api from '../services/api';

const TornadoGameWrapper = ({ onBack, classes: externalClasses, isReplay: externalIsReplay }) => {
  // Check if this is a replay (coming back from game) or fresh start (from portal)
  // We use localStorage to track this state
  const checkIsReplay = () => {
    const storedIsReplay = localStorage.getItem('torenado_is_replay');
    if (storedIsReplay === 'true') {
      // Clear it so next fresh load goes to config
      localStorage.removeItem('torenado_is_replay');
      return true;
    }
    // Check if we're coming from TeacherPortal by checking localStorage
    const hasStoredConfig = localStorage.getItem('torenado_config');
    return !hasStoredConfig; // If no stored config, it's a replay/back-from-game scenario
  };
  
  const isReplay = externalIsReplay !== undefined ? externalIsReplay : checkIsReplay();
  const initialGameState = isReplay ? 'select-class' : 'config';
  
  // Game type: 'tornado', 'faceoff', or 'memorymatch'
  const [gameType, setGameType] = useState(localStorage.getItem('selected_game_type') || 'tornado');
  
  const [gameState, setGameState] = useState(initialGameState); // select-game, select-class, select-students, config, playing, finished
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

  const [faceOffConfig, setFaceOffConfig] = useState({
    rounds: 5,
    wordImagePairs: []
  });
  const [bulkUploadImages, setBulkUploadImages] = useState([]);
  const [memoryMatchConfig, setMemoryMatchConfig] = useState({
    rounds: 5,
    contentItems: []
  });
  const [memoryMatchBulkUploadImages, setMemoryMatchBulkUploadImages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [pixiContainer, setPixiContainer] = useState(null);
  const [prefilled, setPrefilled] = useState(false);
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);

  // Helper functions
  const addWord = (word) => {
    setConfig(prev => ({ ...prev, decorativeElements: [...prev.decorativeElements, word] }));
  };

  const addFaceOffWordImagePair = (word, image) => {
    setFaceOffConfig(prev => ({
      ...prev,
      wordImagePairs: [...prev.wordImagePairs, { word, image }]
    }));
  };

  const addMemoryMatchContentItem = (text, image, type) => {
    setMemoryMatchConfig(prev => ({
      ...prev,
      contentItems: [...prev.contentItems, { text, src: image, type }]
    }));
  };

  const removeMemoryMatchItem = (index) => {
    setMemoryMatchConfig(prev => ({
      ...prev,
      contentItems: prev.contentItems.filter((_, i) => i !== index)
    }));
  };

  const removeFaceOffPair = (index) => {
    setFaceOffConfig(prev => ({
      ...prev,
      wordImagePairs: prev.wordImagePairs.filter((_, i) => i !== index)
    }));
  };

  const removeWord = (word) => {
    setConfig(prev => ({
      ...prev,
      decorativeElements: prev.decorativeElements.filter(e => e !== word)
    }));
  };

  const removeImage = (image) => {
    setConfig(prev => ({
      ...prev,
      decorativeElements: prev.decorativeElements.filter(e => e !== image)
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
    if (classes.length > 0 && !prefilled && !isReplay) {
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
            
            // Set team mode if applicable
            if (configData.isTeamMode) {
              setIsTeamMode(true);
              setPlayerCount(configData.playerCount || 2);
            }

            // Convert players back to student objects (only for individual mode)
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
      {/* Game Selection Screen */}
      {gameState === 'select-game' && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '5px solid #4ECDC4',
          boxShadow: '0 20px 60px rgba(78, 205, 196, 0.3)',
          marginTop: '100px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontFamily: 'Comic Sans MS, cursive, sans-serif'
            }}>
              🎮 Choose a Game
            </h2>
            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setGameType('tornado');
                localStorage.setItem('selected_game_type', 'tornado');
                setGameState('select-class');
              }}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '40px 20px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '4px solid',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #4ECDC4, #95E1D3)',
                color: '#fff',
                borderColor: '#4ECDC4',
                boxShadow: '0 6px 25px rgba(78, 205, 196, 0.4)',
                transform: 'scale(1.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 30px rgba(78, 205, 196, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 25px rgba(78, 205, 196, 0.4)';
              }}
            >
              <div style={{ fontSize: '48px' }}>🌪️</div>
              <div>Tornado</div>
            </button>

            <button
              onClick={() => {
                setGameType('faceoff');
                localStorage.setItem('selected_game_type', 'faceoff');
                setGameState('select-class');
              }}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '40px 20px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '4px solid',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                borderColor: '#FF6B6B',
                boxShadow: '0 6px 25px rgba(255, 107, 107, 0.4)',
                transform: 'scale(1.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 30px rgba(255, 107, 107, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 25px rgba(255, 107, 107, 0.4)';
              }}
            >
              <div style={{ fontSize: '48px' }}>⚡</div>
              <div>FaceOff</div>
            </button>

            <button
              onClick={() => {
                setGameType('memorymatch');
                localStorage.setItem('selected_game_type', 'memorymatch');
                setGameState('select-class');
              }}
              style={{
                flex: 1,
                minWidth: '140px',
                padding: '40px 20px',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '4px solid',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                color: '#fff',
                borderColor: '#8B5CF6',
                boxShadow: '0 6px 25px rgba(139, 92, 246, 0.4)',
                transform: 'scale(1.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.6)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.4)';
              }}
            >
              <div style={{ fontSize: '48px' }}>🧠</div>
              <div>Memory Match</div>
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6',
            padding: '20px',
            background: '#F8FAFC',
            borderRadius: '15px'
          }}>
            <div><strong>🌪️ Tornado:</strong> Classic card-flipping game with point challenges</div>
            <div style={{ marginTop: '10px' }}><strong>⚡ FaceOff:</strong> Fast-paced word-to-picture matching for 2 players</div>
            <div style={{ marginTop: '10px' }}><strong>🧠 Memory Match:</strong> Match pairs of cards with images or text</div>
          </div>
        </div>
      )}

      {/* Class Selection Screen (Only visible when isReplay=true) */}
      {gameState === 'select-class' && (
        <div style={{
          width: '100%',
          maxWidth: '700px',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          border: '4px solid #8B5CF6',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
          marginTop: '60px',
          marginBottom: '50px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontFamily: 'Comic Sans MS, cursive, sans-serif'
            }}>
              📚 Select Class
            </h2>
            <button
              onClick={onBack}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '15px',
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '10px'
          }}>
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls);
                  // Skip mode selection for FaceOff and Memory Match, go directly to config
                  if (gameType === 'faceoff' || gameType === 'memorymatch') {
                    setGameState('config');
                  } else {
                    setGameState('select-mode');
                  }
                }}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: `3px solid ${selectedClass?.id === cls.id ? '#8B5CF6' : '#E5E7EB'}`,
                  background: selectedClass?.id === cls.id 
                    ? 'linear-gradient(135deg, #8B5CF615, #EC489915)' 
                    : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: selectedClass?.id === cls.id 
                    ? '0 6px 20px rgba(139, 92, 246, 0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  if (selectedClass?.id !== cls.id) {
                    e.currentTarget.style.borderColor = '#A78BFA';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (selectedClass?.id !== cls.id) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F3F4F6'
                }}>
                  {cls.avatar ? (
                    <img
                      src={cls.avatar}
                      alt={cls.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ fontSize: '32px' }}>📚</div>
                  )}
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '700', 
                    color: selectedClass?.id === cls.id ? '#8B5CF6' : '#374151',
                    marginBottom: '4px'
                  }}>
                    {cls.name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6B7280',
                    fontWeight: '500'
                  }}>
                    {cls.students?.length || 0} student{(cls.students?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                {selectedClass?.id === cls.id && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Selection Screen */}
      {gameState === 'select-mode' && selectedClass && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          border: '4px solid #8B5CF6',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
          marginTop: '60px',
          marginBottom: '50px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              fontFamily: 'Comic Sans MS, cursive, sans-serif'
            }}>
              🎮 Game Mode
            </h2>
            <button
              onClick={() => {
                setSelectedClass(null);
                setGameState('select-class');
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '15px',
              display: 'block'
            }}>
              Select mode for {selectedClass.name}:
            </label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setIsTeamMode(false);
                  setPlayerCount(2);
                  setGameState('config');
                }}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '25px 30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: '3px solid',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: isTeamMode ? '#F3F4F6' : 'linear-gradient(135deg, #3B82F6, #10B981)',
                  color: isTeamMode ? '#6B7280' : '#fff',
                  borderColor: isTeamMode ? '#E5E7EB' : '#059669',
                  boxShadow: isTeamMode ? 'none' : '0 6px 25px rgba(16, 185, 129, 0.4)',
                  transform: !isTeamMode ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                👤 Individual
              </button>
              <button
                onClick={() => {
                  setIsTeamMode(true);
                  setPlayerCount(2);
                  setGameState('config');
                }}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '25px 30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: '3px solid',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: isTeamMode ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : '#F3F4F6',
                  color: isTeamMode ? '#fff' : '#6B7280',
                  borderColor: isTeamMode ? '#A78BFA' : '#E5E7EB',
                  boxShadow: isTeamMode ? '0 6px 25px rgba(139, 92, 246, 0.4)' : 'none',
                  transform: isTeamMode ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                👥 Teams
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FaceOff Configuration Screen */}
      {gameState === 'config' && gameType === 'faceoff' && (
        <div style={{
          width: '100%',
          maxWidth: '700px',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '5px solid #FF6B6B',
          boxShadow: '0 20px 60px rgba(255, 107, 107, 0.3)',
          marginTop: '50px',
          marginBottom: '50px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {/* Back Button */}
            <button
              onClick={() => {
                setGameState('select-class');
                setSelectedStudents([]);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(255, 107, 107, 0.3)'
              }}
            >
              ← Back
            </button>

            <div style={{
              textAlign: 'center',
              flex: 1,
              margin: '0 15px'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                fontFamily: 'Comic Sans MS, cursive, sans-serif'
              }}>
                ⚡ FaceOff Configuration
              </div>
              {selectedClass && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Class: {selectedClass.name}
                </div>
              )}
            </div>

            <div style={{ width: '80px' }}></div>
          </div>

          {/* Number of Rounds Selection */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '15px', border: '2px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '15px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '10px'
            }}>
              🎯 Rounds:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[5, 10, 20, 30].map(rounds => (
                <button
                  key={rounds}
                  onClick={() => setFaceOffConfig(prev => ({ ...prev, rounds }))}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: faceOffConfig.rounds === rounds
                      ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)'
                      : 'white',
                    borderColor: faceOffConfig.rounds === rounds ? '#FF6B6B' : '#E5E7EB',
                    color: faceOffConfig.rounds === rounds ? '#fff' : '#4B5563',
                    boxShadow: faceOffConfig.rounds === rounds
                      ? '0 3px 12px rgba(255, 107, 107, 0.3)'
                      : '0 1px 3px rgba(0,0,0,0.05)',
                    transform: faceOffConfig.rounds === rounds ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {rounds}
                </button>
              ))}
            </div>
          </div>

          {/* Add Word-Image Pairs - Inline and Compact */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '15px', border: '2px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '15px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '10px'
            }}>
              🖼️ Word-Image Pairs ({faceOffConfig.wordImagePairs.length}):
            </label>

            {/* Bulk Upload Button */}
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => document.getElementById('faceoff-bulk-file-input').click()}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '2px dashed #8B5CF6',
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#8B5CF6',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#8B5CF615';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>📸📸📸</span>
                <span>Upload Multiple Images</span>
              </button>
              <input
                id="faceoff-bulk-file-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  const imagePromises = Array.from(files).map(file => {
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        resolve({
                          id: `bulk_${Date.now()}_${Math.random()}`,
                          src: reader.result,
                          name: file.name
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  });

                  Promise.all(imagePromises).then(images => {
                    setBulkUploadImages(prev => [...prev, ...images]);
                    e.target.value = '';
                  });
                }}
              />
            </div>

            {/* Bulk Uploaded Images - Display with word inputs */}
            {bulkUploadImages.length > 0 && (
              <div style={{
                marginBottom: '15px',
                padding: '12px',
                background: '#F0F9FF',
                borderRadius: '12px',
                border: '2px solid #3B82F6'
              }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1E40AF',
                  marginBottom: '10px',
                  display: 'block'
                }}>
                  📝 Add words for uploaded images ({bulkUploadImages.length}):
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: '#fff',
                  borderRadius: '8px'
                }}>
                  {bulkUploadImages.map((imgData, index) => (
                    <div key={imgData.id} style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '8px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <img
                        src={imgData.src}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '2px solid #3B82F6',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Word for image ${index + 1}...`}
                        defaultValue=""
                        id={`bulk-word-input-${imgData.id}`}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '12px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#333',
                          outline: 'none',
                          minWidth: '80px'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById(`bulk-add-btn-${imgData.id}`)?.click();
                          }
                        }}
                      />
                      <button
                        id={`bulk-add-btn-${imgData.id}`}
                        onClick={() => {
                          const wordInput = document.getElementById(`bulk-word-input-${imgData.id}`);
                          const word = wordInput?.value?.trim();
                          if (word) {
                            addFaceOffWordImagePair(word, imgData.src);
                            setBulkUploadImages(prev => prev.filter(img => img.id !== imgData.id));
                          } else {
                            alert('Please enter a word for this image!');
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setBulkUploadImages(prev => prev.filter(img => img.id !== imgData.id));
                        }}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {bulkUploadImages.length > 0 && (
                  <button
                    onClick={() => setBulkUploadImages([])}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: '#EF4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All Bulk Images
                  </button>
                )}
              </div>
            )}

            {/* Reminder Message */}
            {faceOffConfig.wordImagePairs.length < 5 && (
              <div style={{
                marginTop: '10px',
                padding: '10px 15px',
                background: '#FEF2F2',
                borderRadius: '10px',
                border: '2px solid #EF4444',
                textAlign: 'center',
                fontSize: '13px',
                color: '#EF4444',
                fontWeight: '600'
              }}>
                ⚠️ Need at least 5 word-image pairs to start
              </div>
            )}

            {/* Compact Inline Word-Image Pairs Display */}
            {faceOffConfig.wordImagePairs.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '8px',
                background: '#fff',
                borderRadius: '10px',
                border: '2px solid #E5E7EB'
              }}>
                {faceOffConfig.wordImagePairs.map((pair, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      border: '2px solid #E5E7EB',
                      fontSize: '12px',
                      fontWeight: '600',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={pair.image}
                      alt={pair.word}
                      style={{
                        width: '30px',
                        height: '30px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #E5E7EB'
                      }}
                    />
                    <span style={{ color: '#333' }}>{pair.word}</span>
                    <button
                      onClick={() => removeFaceOffPair(index)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'rgba(255, 107, 107, 0.9)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Selection - Exactly 2 players */}
          {selectedClass && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '15px', border: '2px solid #4CAF50' }}>
              <label style={{
                color: '#333',
                fontSize: '14px',
                fontWeight: '700',
                display: 'block',
                marginBottom: '10px'
              }}>
                👤 Select 2 Players:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '6px'
              }}>
                {selectedClass.students.map(student => {
                  const isSelected = selectedStudents.some(p => p.id === student.id);
                  const isFull = selectedStudents.length >= 2;
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                        } else if (!isFull) {
                          setSelectedStudents(prev => [...prev, {
                            id: student.id,
                            name: student.name,
                            color: ['#00d9ff', '#ff00ff'][prev.length]
                          }]);
                        }
                      }}
                      disabled={!isSelected && isFull}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '2px solid',
                        cursor: !isSelected && isFull ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected
                          ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                          : 'white',
                        borderColor: isSelected ? '#4CAF50' : '#E5E7EB',
                        color: isSelected ? '#fff' : '#4B5563',
                        opacity: !isSelected && isFull ? '0.5' : '1',
                        fontSize: '13px',
                        fontWeight: '600',
                        position: 'relative',
                        textAlign: 'left'
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{student.name}
                    </button>
                  );
                })}
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '13px',
                color: selectedStudents.length === 2 ? '#4CAF50' : '#6B7280',
                fontWeight: '600'
              }}>
                Selected: {selectedStudents.length}/2 {selectedStudents.length === 2 ? '✓ Ready' : '(Select exactly 2)'}
              </div>
            </div>
          )}

          {/* Start FaceOff Game Button */}
          <button
            onClick={() => {
              if (selectedStudents.length === 2 && faceOffConfig.wordImagePairs.length >= 5) {
                setPlayers(selectedStudents);
                setGameState('playing');
              }
            }}
            disabled={selectedStudents.length !== 2 || faceOffConfig.wordImagePairs.length < 5}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '20px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '15px',
              cursor: selectedStudents.length === 2 && faceOffConfig.wordImagePairs.length >= 5 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              background: selectedStudents.length === 2 && faceOffConfig.wordImagePairs.length >= 5
                ? 'linear-gradient(135deg, #FF6B6B, #FF8E8E)'
                : '#ccc',
              color: '#fff',
              textShadow: 'none',
              boxShadow: selectedStudents.length === 2 && faceOffConfig.wordImagePairs.length >= 5
                ? '0 8px 30px rgba(255, 107, 107, 0.4)'
                : 'none',
              opacity: selectedStudents.length === 2 && faceOffConfig.wordImagePairs.length >= 5 ? 1 : 0.5
            }}
          >
            ⚡ START FACEOFF ⚡
          </button>
        </div>
      )}

      {/* Memory Match Configuration Screen */}
      {gameState === 'config' && gameType === 'memorymatch' && (
        <div style={{
          width: '100%',
          maxWidth: '700px',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          border: '5px solid #8B5CF6',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
          marginTop: '50px',
          marginBottom: '50px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            {/* Back Button */}
            <button
              onClick={() => {
                setGameState('select-class');
                setSelectedStudents([]);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(255, 107, 107, 0.3)'
              }}
            >
              ← Back
            </button>

            <div style={{
              textAlign: 'center',
              flex: 1,
              margin: '0 15px'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                fontFamily: 'Comic Sans MS, cursive, sans-serif'
              }}>
                🧠 Memory Match Configuration
              </div>
              {selectedClass && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  Class: {selectedClass.name}
                </div>
              )}
            </div>

            <div style={{ width: '80px' }}></div>
          </div>

          {/* Content Items - Upload Images/Text */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '15px', border: '2px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '15px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '10px'
            }}>
              📚 Content Items ({memoryMatchConfig.contentItems.length}):
            </label>

            {/* Bulk Upload Button */}
            <div style={{ marginBottom: '15px' }}>
              <button
                onClick={() => document.getElementById('memory-bulk-file-input').click()}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '2px dashed #8B5CF6',
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#8B5CF6',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#8B5CF615';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>📸📸📸</span>
                <span>Upload Multiple Images</span>
              </button>
              <input
                id="memory-bulk-file-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  const imagePromises = Array.from(files).map(file => {
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        resolve({
                          id: `memory_bulk_${Date.now()}_${Math.random()}`,
                          src: reader.result,
                          name: file.name
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  });

                  Promise.all(imagePromises).then(images => {
                    setMemoryMatchBulkUploadImages(prev => [...prev, ...images]);
                    e.target.value = '';
                  });
                }}
              />
            </div>

            {/* Bulk Uploaded Images - Display with text/label inputs */}
            {memoryMatchBulkUploadImages.length > 0 && (
              <div style={{
                marginBottom: '15px',
                padding: '12px',
                background: '#F0F9FF',
                borderRadius: '12px',
                border: '2px solid #3B82F6'
              }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#1E40AF',
                  marginBottom: '10px',
                  display: 'block'
                }}>
                  📝 Add labels for uploaded images ({memoryMatchBulkUploadImages.length}):
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                  maxHeight: '250px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: '#fff',
                  borderRadius: '8px'
                }}>
                  {memoryMatchBulkUploadImages.map((imgData, index) => (
                    <div key={imgData.id} style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '8px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}>
                      <img
                        src={imgData.src}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '2px solid #3B82F6',
                          flexShrink: 0
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Label for image ${index + 1}...`}
                        defaultValue=""
                        id={`memory-word-input-${imgData.id}`}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '12px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#333',
                          outline: 'none',
                          minWidth: '80px'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            document.getElementById(`memory-add-btn-${imgData.id}`)?.click();
                          }
                        }}
                      />
                      <button
                        id={`memory-add-btn-${imgData.id}`}
                        onClick={() => {
                          const wordInput = document.getElementById(`memory-word-input-${imgData.id}`);
                          const text = wordInput?.value?.trim();
                          if (text) {
                            addMemoryMatchContentItem(text, imgData.src, 'image');
                            setMemoryMatchBulkUploadImages(prev => prev.filter(img => img.id !== imgData.id));
                          } else {
                            alert('Please enter a label for this image!');
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setMemoryMatchBulkUploadImages(prev => prev.filter(img => img.id !== imgData.id));
                        }}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {memoryMatchBulkUploadImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => {
                        // Add all bulk images as unlabeled content items
                        memoryMatchBulkUploadImages.forEach(imgData => {
                          addMemoryMatchContentItem('', imgData.src, 'image');
                        });
                        setMemoryMatchBulkUploadImages([]);
                      }}
                      disabled={memoryMatchBulkUploadImages.length % 2 !== 0}
                      style={{
                        flex: 1,
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: memoryMatchBulkUploadImages.length % 2 === 0
                          ? 'linear-gradient(135deg, #10B981, #059669)'
                          : '#ccc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: memoryMatchBulkUploadImages.length % 2 === 0 ? 'pointer' : 'not-allowed',
                        opacity: memoryMatchBulkUploadImages.length % 2 === 0 ? 1 : 0.5
                      }}
                    >
                      Quick Start ({memoryMatchBulkUploadImages.length} images)
                    </button>
                    <button
                      onClick={() => setMemoryMatchBulkUploadImages([])}
                      style={{
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: '#EF4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reminder Messages */}
            {(memoryMatchConfig.contentItems.length < 2 && memoryMatchBulkUploadImages.length < 2) && (
              <div style={{
                marginTop: '10px',
                padding: '10px 15px',
                background: '#FEF2F2',
                borderRadius: '10px',
                border: '2px solid #EF4444',
                textAlign: 'center',
                fontSize: '13px',
                color: '#EF4444',
                fontWeight: '600'
              }}>
                ⚠️ Need at least 2 content items or images to start
              </div>
            )}

            {/* Reminder about odd number of images */}
            {memoryMatchBulkUploadImages.length > 0 && memoryMatchBulkUploadImages.length % 2 !== 0 && (
              <div style={{
                marginTop: '10px',
                padding: '10px 15px',
                background: '#FFFBEB',
                borderRadius: '10px',
                border: '2px solid #F59E0B',
                textAlign: 'center',
                fontSize: '12px',
                color: '#92400E',
                fontWeight: '600'
              }}>
                ⚠️ Please upload an even number of images for matching pairs
              </div>
            )}

            {/* Gentle Reminder about adding words */}
            {memoryMatchBulkUploadImages.length > 0 && memoryMatchBulkUploadImages.length % 2 === 0 && (
              <div style={{
                marginTop: '10px',
                padding: '10px 15px',
                background: '#EFF6FF',
                borderRadius: '10px',
                border: '2px solid #3B82F6',
                textAlign: 'center',
                fontSize: '12px',
                color: '#1E40AF',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                💡 <strong>Tip:</strong> Add labels to your images to match words with pictures!
                <br />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  Or skip labels and match pictures with pictures.
                </span>
              </div>
            )}

            {/* Content Items Display */}
            {memoryMatchConfig.contentItems.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '8px',
                background: '#fff',
                borderRadius: '10px',
                border: '2px solid #E5E7EB'
              }}>
                {memoryMatchConfig.contentItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      border: '2px solid #E5E7EB',
                      fontSize: '12px',
                      fontWeight: '600',
                      position: 'relative'
                    }}
                  >
                    {item.type === 'image' && (
                      <img
                        src={item.src}
                        alt={item.text}
                        style={{
                          width: '30px',
                          height: '30px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #E5E7EB'
                        }}
                      />
                    )}
                    <span style={{ color: '#333' }}>{item.text}</span>
                    <button
                      onClick={() => removeMemoryMatchItem(index)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'rgba(255, 107, 107, 0.9)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Selection */}
          {selectedClass && (
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '15px', border: '2px solid #8B5CF6' }}>
              <label style={{
                color: '#333',
                fontSize: '14px',
                fontWeight: '700',
                display: 'block',
                marginBottom: '10px'
              }}>
                👤 Select Players (1-4):
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '6px'
              }}>
                {selectedClass.students.map(student => {
                  const isSelected = selectedStudents.some(p => p.id === student.id);
                  const isFull = selectedStudents.length >= 4;
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                        } else if (!isFull) {
                          setSelectedStudents(prev => [...prev, {
                            id: student.id,
                            name: student.name,
                            color: ['#00d9ff', '#ff00ff', '#00ff00', '#ffff00'][prev.length]
                          }]);
                        }
                      }}
                      disabled={!isSelected && isFull}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '2px solid',
                        cursor: !isSelected && isFull ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected
                          ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                          : 'white',
                        borderColor: isSelected ? '#8B5CF6' : '#E5E7EB',
                        color: isSelected ? '#fff' : '#4B5563',
                        opacity: !isSelected && isFull ? '0.5' : '1',
                        fontSize: '13px',
                        fontWeight: '600',
                        position: 'relative',
                        textAlign: 'left'
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{student.name}
                    </button>
                  );
                })}
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '13px',
                color: selectedStudents.length >= 1 ? '#8B5CF6' : '#6B7280',
                fontWeight: '600'
              }}>
                Selected: {selectedStudents.length}/4 {selectedStudents.length >= 1 ? '✓ Ready' : '(Select 1-4 players)'}
              </div>
            </div>
          )}

          {/* Start Memory Match Game Button */}
          <button
            onClick={() => {
              const canStart = selectedStudents.length >= 1 &&
                (memoryMatchConfig.contentItems.length >= 2 ||
                 (memoryMatchBulkUploadImages.length >= 2 && memoryMatchBulkUploadImages.length % 2 === 0));

              if (canStart) {
                setPlayers(selectedStudents);

                // If using bulk images, add them to content items first
                if (memoryMatchBulkUploadImages.length > 0 && memoryMatchBulkUploadImages.length % 2 === 0) {
                  const newContentItems = [...memoryMatchConfig.contentItems];
                  memoryMatchBulkUploadImages.forEach(imgData => {
                    newContentItems.push({ text: '', src: imgData.src, type: 'image' });
                  });
                  setMemoryMatchConfig(prev => ({ ...prev, contentItems: newContentItems }));
                  setMemoryMatchBulkUploadImages([]);
                  // Small delay to ensure state is updated
                  setTimeout(() => setGameState('playing'), 50);
                } else {
                  setGameState('playing');
                }
              }
            }}
            disabled={selectedStudents.length < 1 ||
              (memoryMatchConfig.contentItems.length < 2 &&
               (memoryMatchBulkUploadImages.length < 2 || memoryMatchBulkUploadImages.length % 2 !== 0))}
            style={{
              width: '100%',
              padding: '18px',
              fontSize: '20px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '15px',
              cursor: selectedStudents.length >= 1 &&
                (memoryMatchConfig.contentItems.length >= 2 ||
                 (memoryMatchBulkUploadImages.length >= 2 && memoryMatchBulkUploadImages.length % 2 === 0))
                ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              background: selectedStudents.length >= 1 &&
                (memoryMatchConfig.contentItems.length >= 2 ||
                 (memoryMatchBulkUploadImages.length >= 2 && memoryMatchBulkUploadImages.length % 2 === 0))
                ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                : '#ccc',
              color: '#fff',
              textShadow: 'none',
              boxShadow: selectedStudents.length >= 1 &&
                (memoryMatchConfig.contentItems.length >= 2 ||
                 (memoryMatchBulkUploadImages.length >= 2 && memoryMatchBulkUploadImages.length % 2 === 0))
                ? '0 8px 30px rgba(139, 92, 246, 0.4)'
                : 'none',
              opacity: selectedStudents.length >= 1 &&
                (memoryMatchConfig.contentItems.length >= 2 ||
                 (memoryMatchBulkUploadImages.length >= 2 && memoryMatchBulkUploadImages.length % 2 === 0))
                ? 1 : 0.5
            }}
          >
            🧠 START MEMORY MATCH 🧠
          </button>
        </div>
      )}

      {/* Game Configuration Screen - Tornado Only */}
      {gameState === 'config' && gameType === 'tornado' && (
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px'
          }}>
            {/* Back Button */}
            <button
              onClick={() => {
                if (isReplay) {
                  setSelectedClass(null);
                  setGameState('select-class');
                } else {
                  onBack();
                }
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                transition: 'all 0.3s ease'
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
              ← {isReplay ? 'Back' : 'Back to Portal'}
            </button>
            
            {selectedClass && (
              <div style={{
                textAlign: 'center',
                flex: 1,
                margin: '0 20px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6B7280',
                  marginBottom: '4px'
                }}>
                  {isTeamMode ? '👥 Team Mode' : '👤 Individual Mode'}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #95E1D3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  fontFamily: 'Comic Sans MS, cursive, sans-serif'
                }}>
                  {selectedClass.name}
                </div>
              </div>
            )}
            
            {!selectedClass && (
              <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #95E1D3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                fontFamily: 'Comic Sans MS, cursive, sans-serif',
                flex: 1,
                textAlign: 'center'
              }}>
                🌪️ TORENADO GAME 🌪️
              </h1>
            )}
            
            <div style={{ width: '100px' }}></div>
          </div>

          {/* Team/Player Count Selection (Only when replay mode) */}
          {isReplay && selectedClass && isTeamMode && (
            <div style={{ marginBottom: '25px', padding: '20px', background: '#F8FAFC', borderRadius: '18px', border: '3px solid #8B5CF6' }}>
              <label style={{
                color: '#333',
                fontSize: '18px',
                fontWeight: '700',
                display: 'block',
                marginBottom: '15px'
              }}>
                👥 Number of Teams:
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => setPlayerCount(count)}
                    style={{
                      padding: '15px 30px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      border: '3px solid',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: playerCount === count
                        ? 'linear-gradient(135deg, #F59E0B, #EF4444)'
                        : 'white',
                      borderColor: playerCount === count ? '#F59E0B' : '#E5E7EB',
                      color: playerCount === count ? '#fff' : '#4B5563',
                      boxShadow: playerCount === count
                        ? '0 6px 20px rgba(245, 158, 11, 0.4)'
                        : '0 2px 6px rgba(0,0,0,0.05)',
                      transform: playerCount === count ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {count} Teams
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Selection (Only when individual mode and replay) */}
          {isReplay && selectedClass && !isTeamMode && (
            <div style={{ marginBottom: '25px', padding: '20px', background: '#F8FAFC', borderRadius: '18px', border: '3px solid #10B981' }}>
              <label style={{
                color: '#333',
                fontSize: '18px',
                fontWeight: '700',
                display: 'block',
                marginBottom: '12px'
              }}>
                👤 Select Students (2-4):
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '10px',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '8px'
              }}>
                {selectedClass.students.map(student => {
                  const isSelected = selectedStudents.some(p => p.id === student.id);
                  const isMaxReached = selectedStudents.length >= 4;
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                        } else if (!isMaxReached) {
                          setSelectedStudents(prev => [...prev, {
                            id: student.id,
                            name: student.name,
                            color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][prev.length]
                          }]);
                        }
                      }}
                      disabled={!isSelected && isMaxReached}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid',
                        cursor: !isSelected && isMaxReached ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected
                          ? 'linear-gradient(135deg, #10B981, #059669)'
                          : 'white',
                        borderColor: isSelected ? '#10B981' : '#E5E7EB',
                        color: isSelected ? '#fff' : '#4B5563',
                        opacity: !isSelected && isMaxReached ? '0.5' : '1',
                        fontSize: '14px',
                        fontWeight: '600',
                        position: 'relative',
                        textAlign: 'left'
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{student.name}
                      {isMaxReached && !isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#EF4444',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          4
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: selectedStudents.length >= 2 ? '#10B981' : '#6B7280',
                fontWeight: '600'
              }}>
                Selected: {selectedStudents.length}/4 {selectedStudents.length >= 2 ? '✓ Ready' : '(Select at least 2)'}
              </div>
            </div>
          )}

          {/* Square Count Selection */}
          <div style={{ marginBottom: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '20px', border: '3px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '20px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '15px'
            }}>
              🎯 Number of Tiles:
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
              color: '#333',
              fontSize: '28px',
              fontWeight: '900',
              padding: '15px',
              background: '#fff',
              borderRadius: '15px',
              border: '3px solid #00d9ff',
              boxShadow: '0 4px 15px rgba(0, 217, 255, 0.2)'
            }}>
              {config.squareCount} Tiles
            </div>
          </div>

          {/* Numbered Squares Toggle */}
          <div style={{ marginBottom: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '20px', border: '3px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '20px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '15px'
            }}>
              🔢 Numbered Tiles:
            </label>
            <button
              onClick={() => setConfig(prev => ({ ...prev, numberedSquares: !prev.numberedSquares }))}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: config.numberedSquares ? '#00ff88' : '#ccc',
                borderRadius: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: config.numberedSquares
                  ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                  : '#fff',
                color: config.numberedSquares ? '#000' : '#333',
                boxShadow: config.numberedSquares
                  ? '0 4px 15px rgba(0, 255, 136, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {config.numberedSquares ? '✅ Enabled' : '❌ Disabled'}
            </button>
          </div>

          {/* Tornado Count Selection */}
          <div style={{ marginBottom: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '20px', border: '3px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '20px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '15px'
            }}>
              🌪️ Tornado Count:
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setConfig(prev => ({ ...prev, tornadoCount: 'random' }))}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: config.tornadoCount === 'random' ? '#ff00ff' : '#ccc',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: config.tornadoCount === 'random'
                    ? 'linear-gradient(135deg, #ff00ff, #ff6600)'
                    : '#fff',
                  color: config.tornadoCount === 'random' ? '#000' : '#333',
                  boxShadow: config.tornadoCount === 'random'
                    ? '0 4px 15px rgba(255, 0, 255, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)'
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
                    borderColor: config.tornadoCount === count ? '#ff00ff' : '#ccc',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: config.tornadoCount === count
                      ? 'linear-gradient(135deg, #ff00ff, #ff6600)'
                      : '#fff',
                    color: config.tornadoCount === count ? '#000' : '#333',
                    boxShadow: config.tornadoCount === count
                      ? '0 4px 15px rgba(255, 0, 255, 0.4)'
                      : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Decorative Elements Upload */}
          <div style={{ marginBottom: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '20px', border: '3px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '20px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '15px'
            }}>
              🖼️ Upload Pictures for Review:
            </label>
            
            {/* Image Upload Area - Smaller */}
            <div
              style={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                fontSize: '14px',
                border: '3px dashed #4ECDC4',
                borderRadius: '15px',
                background: '#fff',
                color: '#333',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onClick={() => document.getElementById('fileInput').click()}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.01)';
                e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.15)';
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
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                📸
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#4ECDC4'
              }}>
                Click to Upload Images
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '6px'
              }}>
                or drag and drop files here
              </div>
            </div>

            {/* Enlarged Image Counter with Thumbnails */}
            <div style={{
              padding: '20px',
              background: '#fff',
              borderRadius: '20px',
              color: '#333',
              fontSize: '20px',
              fontWeight: 'bold',
              border: '3px solid #4ECDC4',
              boxShadow: '0 4px 20px rgba(78, 205, 196, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '28px' }}>✨</span>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#4ECDC4'
                  }}>
                    {config.decorativeElements.filter(e => e.startsWith('data:') || e.startsWith('blob:')).length} / 20
                  </span>
                  <span style={{
                    fontSize: '18px',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    images loaded
                  </span>
                </div>
              </div>

              {/* Thumbnail Grid */}
              {config.decorativeElements.filter(e => e.startsWith('data:') || e.startsWith('blob:')).length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                  gap: '10px',
                  marginTop: '15px'
                }}>
                  {config.decorativeElements.filter(e => e.startsWith('data:') || e.startsWith('blob:')).map((img, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '2px solid #4ECDC4',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => removeImage(img)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <img
                        src={img}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255, 107, 107, 0.9)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                        transition: 'all 0.3s ease'
                      }}>
                        ✕
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Words Input */}
          <div style={{ marginBottom: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '20px', border: '3px solid #ddd' }}>
            <label style={{
              color: '#333',
              fontSize: '20px',
              fontWeight: '700',
              display: 'block',
              marginBottom: '15px'
            }}>
              ✏️ Add Words for Review:
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px'
            }}>
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
                  flex: 1,
                  padding: '15px 20px',
                  fontSize: '16px',
                  border: '3px solid #FF6B6B',
                  borderRadius: '15px',
                  background: '#fff',
                  color: '#333',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]');
                  if (input) {
                    const words = input.value.split(',').map(w => w.trim()).filter(w => w);
                    const images = config.decorativeElements.filter(e => e.startsWith('data:') || e.startsWith('blob:'));
                    setConfig(prev => ({ ...prev, decorativeElements: [...prev.decorativeElements, ...words] }));
                    input.value = '';
                  }
                }}
                style={{
                  padding: '15px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #4ECDC4, #95E1D3)',
                  color: '#000',
                  border: '3px solid #4ECDC4',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.3)';
                }}
              >
                Add
              </button>
            </div>
            
            {/* Word Display Area with Remove Functionality */}
            <div style={{
              padding: '15px',
              background: '#fff',
              borderRadius: '15px',
              border: '2px solid #FF6B6B',
              minHeight: '60px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#666',
                marginBottom: '10px'
              }}>
                💡 Added words (click to remove):
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {config.decorativeElements.filter(e => typeof e === 'string' && !e.startsWith('data:') && !e.startsWith('blob:')).map((word, index) => (
                  <button
                    key={index}
                    onClick={() => removeWord(word)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #FFE4E1, #FFD1D0)',
                      color: '#FF6B6B',
                      border: '2px solid #FF6B6B',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {word}
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '900'
                    }}>
                      ✕
                    </span>
                  </button>
                ))}
                {config.decorativeElements.filter(e => typeof e === 'string' && !e.startsWith('data:') && !e.startsWith('blob:')).length === 0 && (
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    fontStyle: 'italic'
                  }}>
                    No words added yet. Type words above and click "Add" to include them.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={() => {
              if (gameType === 'faceoff') {
                // FaceOff: exactly 2 players required
                if (selectedStudents.length === 2) {
                  setPlayers(selectedStudents);
                  setGameState('playing');
                }
              } else {
                // Tornado game
                if (isTeamMode) {
                  // Team mode - create teams from selected class students
                  const students = selectedClass.students || [];
                  const teams = [];
                  for (let i = 0; i < playerCount; i++) {
                    teams.push({
                      id: i,
                      name: `Team ${i + 1}`,
                      color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i]
                    });
                  }
                  setPlayers(teams);
                  setConfig(prev => ({ ...prev, playerCount: teams.length }));
                  setGameState('playing');
                } else {
                  // Individual mode - need selected students
                  if (selectedStudents.length >= 2) {
                    setPlayers(selectedStudents);
                    setConfig(prev => ({ ...prev, playerCount: selectedStudents.length }));
                    setGameState('playing');
                  }
                }
              }
            }}
            disabled={
              gameType === 'faceoff'
                ? selectedStudents.length !== 2
                : (isTeamMode ? false : selectedStudents.length < 2)
            }
            style={{
              width: '100%',
              padding: '25px',
              fontSize: '28px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '20px',
              cursor: isTeamMode || selectedStudents.length >= 2 ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              background: isTeamMode || selectedStudents.length >= 2
                ? 'linear-gradient(135deg, #00d9ff, #00ff88, #ff00ff)'
                : '#ccc',
              color: '#000',
              textShadow: 'none',
              boxShadow: isTeamMode || selectedStudents.length >= 2
                ? '0 10px 40px rgba(0, 217, 255, 0.5)'
                : 'none',
              animation: isTeamMode || selectedStudents.length >= 2 ? 'glow 2s ease-in-out infinite' : 'none',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              opacity: isTeamMode || selectedStudents.length >= 2 ? 1 : 0.5
            }}
            onMouseOver={(e) => {
              if (isTeamMode || selectedStudents.length >= 2) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 15px 50px rgba(0, 217, 255, 0.8)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = isTeamMode || selectedStudents.length >= 2 
                ? '0 10px 40px rgba(0, 217, 255, 0.5)' 
                : 'none';
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

      {gameState === 'playing' && gameType === 'tornado' && (
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
          onBackToSetup={() => {
            localStorage.setItem('torenado_is_replay', 'true');
            setGameState('select-class');
            setSelectedClass(null);
            setSelectedStudents([]);
            setIsTeamMode(false);
            setPlayerCount(2);
          }}
          onExitToPortal={onBack}
        />
      )}

      {gameState === 'playing' && gameType === 'faceoff' && (
        <FaceOffGame
          config={faceOffConfig}
          players={players.map((p, i) => ({
            id: i,
            name: typeof p === 'string' ? (p || `Player ${i + 1}`) : (p?.name || `Player ${i + 1}`),
            score: 0,
            color: typeof p === 'string' ? ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] : (p?.color || ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i])
          }))}
          onGameEnd={() => setGameState('finished')}
          onBackToSetup={() => {
            localStorage.setItem('faceoff_is_replay', 'true');
            setGameState('config');
          }}
          onExitToPortal={onBack}
        />
      )}

      {gameState === 'playing' && gameType === 'memorymatch' && (
        <MemoryMatchGame
          contentItems={memoryMatchConfig.contentItems}
          onBack={onBack}
          classColor="#8B5CF6"
          players={players}
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
              // Set replay flag so we show compact menus on next load
              localStorage.setItem('torenado_is_replay', 'true');
              setSelectedStudents([]);
              setSelectedClass(null);
              setIsTeamMode(false);
              setPlayerCount(2);
              setGameState('select-class');
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
