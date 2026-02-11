import { useState, useEffect, useRef } from 'react';
import TornadoGame from './TornadoGame';
import FaceOffGame from './FaceOffGame';
import MemoryMatchGame from './MemoryMatchGame';
import QuizGame from './QuizGame';
import MotoRaceGame from './MotoRaceGame';
import HorseRaceGame from './HorseRaceGame';
import LiveWorksheet from './LiveWorksheet';
import api from '../services/api';
import { useTranslation } from '../i18n';

const OPTIONS = ['A', 'B', 'C', 'D'];

/**
 * Extracts the filename from an uploaded image file without the extension.
 * Handles various image formats (.jpg, .jpeg, .png, .gif, .webp, .svg, .bmp, .tiff)
 *
 * @param {File|string} fileOrName - Either a File object or a filename string
 * @returns {string} The filename without the file extension
 */
function extractImageName(fileOrName) {
  let filename = '';

  if (typeof fileOrName === 'string') {
    filename = fileOrName;
  } else if (fileOrName instanceof File) {
    filename = fileOrName.name;
  } else {
    return '';
  }

  // Remove path separators (for cross-platform compatibility)
  filename = filename.replace(/[\\/]/g, ' ');

  // Remove file extension
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex > 0) {
    // Check if it's a valid image extension
    const extension = filename.slice(lastDotIndex + 1).toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico'];

    if (imageExtensions.includes(extension)) {
      filename = filename.slice(0, lastDotIndex);
    }
  }

  return filename.trim();
}

/**
 * Processes uploaded image files and creates editable text elements for the game.
 * Extracts filenames without extensions and allows modification of these names.
 *
 * @param {File[]} files - Array of File objects from file input
 * @param {Function} onProcessComplete - Callback function called with processed image data
 * @returns {Promise<Array>} Promise resolving to array of processed image objects
 */
async function processUploadedImages(files, onProcessComplete) {
  if (!files || files.length === 0) return [];

  const imagePromises = Array.from(files).map((file) => {
    return new Promise((resolve, reject) => {
      // Verify it's an image file
      if (!file.type.startsWith('image/')) {
        reject(new Error(`File "${file.name}" is not an image`));
        return;
      }

      // Extract name without extension
      const displayName = extractImageName(file);

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          src: reader.result,
          name: displayName,
          originalName: file.name,
          file: file
        });
      };
      reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
      reader.readAsDataURL(file);
    });
  });

  try {
    const processedImages = await Promise.all(imagePromises);

    // Notify callback if provided
    if (onProcessComplete && typeof onProcessComplete === 'function') {
      onProcessComplete(processedImages);
    }

    return processedImages;
  } catch (error) {
    console.error('Error processing images:', error);
    throw error;
  }
}

/**
 * Updates the display name of a processed image
 *
 * @param {Object} imageData - The image data object
 * @param {string} newName - The new display name
 * @returns {Object} Updated image data object
 */
function updateImageName(imageData, newName) {
  return {
    ...imageData,
    name: newName.trim()
  };
}

const TornadoGameWrapper = ({ onBack, classes: externalClasses, isReplay: externalIsReplay }) => {
  const { t } = useTranslation();
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
  // For liveworksheet, always show the worksheet view directly
  const isLiveWorksheet = localStorage.getItem('selected_game_type') === 'liveworksheet';
  const initialGameState = isLiveWorksheet ? 'worksheet' : (isReplay ? 'select-class' : 'config');
  
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
  const [quizConfig, setQuizConfig] = useState({
    questions: [] // { id, question, image?, options: [a,b,c,d], correct: 0-3 }
  });

  // Load stored quiz questions on mount
  useEffect(() => {
    const storedQuestions = localStorage.getItem('stored_quiz_questions');
    const gameType = localStorage.getItem('selected_game_type');
    if (storedQuestions && gameType === 'quiz') {
      try {
        const parsed = JSON.parse(storedQuestions);
        setQuizConfig({ questions: parsed });
        localStorage.removeItem('stored_quiz_questions');
      } catch (e) {
        console.error('Error loading stored quiz questions:', e);
      }
    }
  }, []);
  const [motoRaceConfig, setMotoRaceConfig] = useState({
    contentType: 'text', // 'text' | 'images'
    items: [], // strings (words) or image data URLs
    playerCount: 2
  });
  const [horseRaceConfig, setHorseRaceConfig] = useState({
    contentType: 'text', // 'text' | 'images'
    words: [], // strings (words) for text mode
    images: [], // image data URLs for images mode
    playerCount: 2
  });
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

  const addQuizQuestion = () => {
    setQuizConfig(prev => ({
      ...prev,
      questions: [...prev.questions, { id: Date.now(), question: '', image: null, options: ['', ''], correct: 0 }]
    }));
  };
  const addQuizOption = (questionId) => {
    setQuizConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const opts = q.options || ['', ''];
        if (opts.length >= 4) return q;
        return { ...q, options: [...opts, ''] };
      })
    }));
  };
  const updateQuizQuestion = (id, updates) => {
    setQuizConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };
  const removeQuizQuestion = (id) => {
    setQuizConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
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

  // Handle giving points to game winners
  const handleGivePoints = async (studentsArray, points = 1) => {
    if (!selectedClass || !selectedClass.students) return;

    const userEmail = user?.email || JSON.parse(localStorage.getItem('classABC_logged_in') || '{}')?.email || 'anonymous';

    // Find the student objects in the class
    const studentsToUpdate = studentsArray.map(playerData => {
      return selectedClass.students.find(s => s.id === playerData.id);
    }).filter(s => s !== null);

    if (studentsToUpdate.length === 0) {
      console.warn('[TornadoGameWrapper] No valid students found to give points');
      return;
    }

    // Update each student's score and history
    const updatedStudents = selectedClass.students.map(student => {
      const shouldUpdate = studentsToUpdate.find(s => s.id === student.id);
      if (!shouldUpdate) return student;

      const historyEntry = {
        label: 'Game Winner',
        pts: points,
        type: 'wow',
        timestamp: new Date().toISOString()
      };

      return {
        ...student,
        score: (student.score || 0) + points,
        history: [...(student.history || []), historyEntry]
      };
    });

    // Update the class
    const updatedClass = {
      ...selectedClass,
      students: updatedStudents
    };

    // Update local state
    setSelectedClass(updatedClass);
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));

    // Save to backend
    try {
      await api.saveClasses(userEmail, [updatedClass]);

    } catch (error) {
      console.error('[TornadoGameWrapper] Error saving points:', error);
    }
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



        let remote = await api.getClasses(userEmail);

        if (Array.isArray(remote) && remote.length > 0) {
          setClasses(remote);
        } else {
          // Fallback to localStorage if remote is empty
          const key = `classABC_data_${userEmail}`;
          const localClasses = JSON.parse(localStorage.getItem(key)) || [];

          setClasses(localClasses);
        }
      } catch (e) {

        // Fallback to localStorage
        try {
          const storedUser = localStorage.getItem('classABC_logged_in');
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          const userEmail = parsedUser?.email || 'anonymous';
          const key = `classABC_data_${userEmail}`;
          const localClasses = JSON.parse(localStorage.getItem(key)) || [];

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



          // Find the class
          const targetClass = classes.find(c => c.id === configData.classId);
          if (targetClass) {

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
              🎮 {t('games.choose')}
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
              ← {t('games.back')}
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
              <div>{t('games.tornado')}</div>
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
              <div>{t('games.faceoff')}</div>
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
              <div>{t('games.memorymatch')}</div>
            </button>

            <button
              onClick={() => {
                setGameType('quiz');
                localStorage.setItem('selected_game_type', 'quiz');
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
                background: gameType === 'quiz' ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)' : 'rgba(255,255,255,0.3)',
                color: gameType === 'quiz' ? '#fff' : '#1E293B',
                borderColor: gameType === 'quiz' ? '#0EA5E9' : 'rgba(255,255,255,0.5)',
                boxShadow: gameType === 'quiz' ? '0 6px 25px rgba(14, 165, 233, 0.4)' : 'none',
                transform: 'scale(1.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #0EA5E9, #06B6D4)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#0EA5E9';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(14, 165, 233, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                if (gameType !== 'quiz') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#1E293B';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0EA5E9, #06B6D4)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#0EA5E9';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(14, 165, 233, 0.4)';
                }
              }}
            >
              <div style={{ fontSize: '48px' }}>🎯</div>
              <div>{t('games.quiz')}</div>
            </button>

            <button
              onClick={() => {
                setGameType('motorace');
                localStorage.setItem('selected_game_type', 'motorace');
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
                background: gameType === 'motorace' ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'rgba(255,255,255,0.3)',
                color: gameType === 'motorace' ? '#fff' : '#1E293B',
                borderColor: gameType === 'motorace' ? '#F97316' : 'rgba(255,255,255,0.5)',
                boxShadow: gameType === 'motorace' ? '0 6px 25px rgba(249, 115, 22, 0.4)' : 'none',
                transform: 'scale(1.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #F97316, #EA580C)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#F97316';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(249, 115, 22, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                if (gameType !== 'motorace') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#1E293B';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #F97316, #EA580C)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#F97316';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(249, 115, 22, 0.4)';
                }
              }}
            >
              <div style={{ fontSize: '48px' }}>🏍️</div>
              <div>{t('games.motorace')}</div>
            </button>

            <button
              onClick={() => {
                setGameType('horserace');
                localStorage.setItem('selected_game_type', 'horserace');
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
                background: gameType === 'horserace' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255,255,255,0.3)',
                color: gameType === 'horserace' ? '#fff' : '#1E293B',
                borderColor: gameType === 'horserace' ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                boxShadow: gameType === 'horserace' ? '0 6px 25px rgba(245, 158, 11, 0.4)' : 'none',
                transform: 'scale(1.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = '#F59E0B';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(245, 158, 11, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                if (gameType !== 'horserace') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#1E293B';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.boxShadow = 'none';
                } else {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#F59E0B';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(245, 158, 11, 0.4)';
                }
              }}
            >
              <div style={{ fontSize: '48px' }}>🐎</div>
              <div>{t('games.horserace')}</div>
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
            <div><strong>🌪️ {t('games.tornado')}:</strong> {t('games.tornado.desc')}</div>
            <div style={{ marginTop: '10px' }}><strong>⚡ {t('games.faceoff')}:</strong> {t('games.faceoff.desc')}</div>
            <div style={{ marginTop: '10px' }}><strong>🧠 {t('games.memorymatch')}:</strong> {t('games.memorymatch.desc')}</div>
            <div style={{ marginTop: '10px' }}><strong>🎯 {t('games.quiz')}:</strong> {t('games.quiz.desc_short')}</div>
            <div style={{ marginTop: '10px' }}><strong>🏍️ {t('games.motorace')}:</strong> {t('games.motorace.desc')}</div>
            <div style={{ marginTop: '10px' }}><strong>🐎 {t('games.horserace')}:</strong> {t('games.horserace.desc')}</div>
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
              📚 {t('games.select_class')}
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
              ← {t('games.back')}
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
                  // Skip mode selection for FaceOff, Memory Match, Quiz, MotoRace, HorseRace — go directly to config
                  // For Live Worksheet, go directly to worksheet view
                  if (gameType === 'liveworksheet') {
                    setGameState('worksheet');
                  } else if (gameType === 'faceoff' || gameType === 'memorymatch' || gameType === 'quiz' || gameType === 'motorace' || gameType === 'horserace') {
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
              🎮 {t('games.mode')}
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
              ← {t('games.back')}
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
              {t('games.select_mode_for').replace('{className}', selectedClass.name)}
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
                👤 {t('games.individual')}
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
                👥 {t('games.teams')}
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
              onClick={onBack}
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
              ← {t('games.back')}
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
                ⚡ {t('games.faceoff_config')}
              </div>
              {selectedClass && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  {t('games.select_class')}: {selectedClass.name}
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
              🎯 {t('games.rounds')}:
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
              🖼️ {t('games.word_image_pairs')} ({faceOffConfig.wordImagePairs.length}):
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
                <span>{t('games.upload_multiple')}</span>
              </button>
              <input
                id="faceoff-bulk-file-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  try {
                    const images = await processUploadedImages(files);
                    setBulkUploadImages(prev => [...prev, ...images]);
                    e.target.value = '';
                  } catch (error) {
                    console.error('Error uploading images:', error);
                    alert(`Error: ${error.message}`);
                  }
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
                  {t('games.add_words_for_images').replace('{count}', bulkUploadImages.length)}
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
                        placeholder={t('games.word_for_image').replace('{index}', index + 1)}
                        defaultValue={imgData.name || ''}
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
                        onChange={(e) => {
                          // Update the image data when the user edits the name
                          setBulkUploadImages(prev =>
                            prev.map(img =>
                              img.id === imgData.id ? { ...img, name: e.target.value } : img
                            )
                          );
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
                            alert(t('games.enter_word_for_image'));
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
                        {t('games.add')}
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
                    {t('games.clear_all_bulk')}
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
                ⚠️ {t('games.need_pairs').replace('{count}', 5)}
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
                {t('games.select_2_players')}
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
                {t('games.selected_n_of_n')
                  .replace('{selected}', selectedStudents.length)
                  .replace('{count}', 2)}{' '}
                {selectedStudents.length === 2
                  ? t('games.selected_ready')
                  : t('games.select_exactly_n').replace('{count}', 2)}
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
            {t('games.start_faceoff')}
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
              onClick={onBack}
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
              ← {t('games.back')}
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
                🧠 {t('games.memory_match_config')}
              </div>
              {selectedClass && (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  {t('games.select_class')}: {selectedClass.name}
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
              📚 {t('games.content_items')} ({memoryMatchConfig.contentItems.length}):
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
                <span>{t('games.upload_multiple')}</span>
              </button>
              <input
                id="memory-bulk-file-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  try {
                    const images = await processUploadedImages(files);
                    setMemoryMatchBulkUploadImages(prev => [...prev, ...images]);
                    e.target.value = '';
                  } catch (error) {
                    console.error('Error uploading images:', error);
                    alert(`Error: ${error.message}`);
                  }
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
                  {t('games.add_labels_for_images').replace('{count}', memoryMatchBulkUploadImages.length)}
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
                        placeholder={t('games.label_for_image').replace('{index}', index + 1)}
                        defaultValue={imgData.name || ''}
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
                        onChange={(e) => {
                          // Update the image data when the user edits the name
                          setMemoryMatchBulkUploadImages(prev =>
                            prev.map(img =>
                              img.id === imgData.id ? { ...img, name: e.target.value } : img
                            )
                          );
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
                            alert(t('games.enter_label_for_image'));
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
                        {t('games.add')}
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
                      {t('games.quick_start_images').replace('{count}', memoryMatchBulkUploadImages.length)}
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
                      {t('games.clear')}
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
                ⚠️ {t('games.need_pairs').replace('{count}', 2)}
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
                ⚠️ {t('games.upload_even_images_warning')}
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
                💡 <strong>{t('games.tip')}:</strong> {t('games.tip_add_labels')}
                <br />
                <span style={{ fontSize: '11px', color: '#6B7280' }}>
                  {t('games.tip_skip_labels')}
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
                👤 {t('games.select_class')}:
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
                {t('games.selected_n_of_n')
                  .replace('{selected}', selectedStudents.length)
                  .replace('{count}', 4)}{' '}
                {selectedStudents.length >= 1
                  ? t('games.selected_ready')
                  : t('games.select_range_players').replace('{min}', 1).replace('{max}', 4)}
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
            {t('games.start_memory_match')}
          </button>
        </div>
      )}

      {/* Quiz Configuration Screen - Advanced 2026 style */}
      {gameState === 'config' && gameType === 'quiz' && (
        <div style={{
          width: '100%',
          maxWidth: '720px',
          padding: '28px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          border: '4px solid #0EA5E9',
          boxShadow: '0 24px 56px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(14, 165, 233, 0.08)',
          marginTop: '44px',
          marginBottom: '44px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={onBack}
              style={{
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(255, 107, 107, 0.3)'
              }}
            >
              ← {t('games.back')}
            </button>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '160px' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                fontFamily: 'Comic Sans MS, cursive, sans-serif'
              }}>
                🎯 {t('games.quiz_config')}
              </div>
              {selectedClass && (
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{t('games.select_class')}: {selectedClass.name}</div>
              )}
            </div>
            <div style={{ width: '80px' }} />
          </div>

          {/* Questions count & add */}
          <div style={{ marginBottom: '18px', padding: '14px 18px', background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)', borderRadius: '16px', border: '2px solid #0EA5E940' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#0C4A6E' }}>
                📝 {t('games.questions_count').replace('{count}', quizConfig.questions.length)}
              </span>
              <button
                onClick={addQuizQuestion}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px solid #0EA5E9',
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#0EA5E9',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                + {t('games.add_question')}
              </button>
            </div>
          </div>

          {/* Question list - scrollable */}
          <div style={{ maxHeight: '42vh', overflowY: 'auto', marginBottom: '18px', paddingRight: '6px' }}>
            {quizConfig.questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '14px' }}>
                {t('games.no_questions')}
              </div>
            )}
            {quizConfig.questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  marginBottom: '14px',
                  padding: '14px 16px',
                  background: '#fff',
                  borderRadius: '14px',
                  border: '2px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0EA5E9' }}>Q{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuizQuestion(q.id)}
                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                <input
                  placeholder="Question text"
                  value={q.question}
                  onChange={e => updateQuizQuestion(q.id, { question: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    marginBottom: '10px',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ marginBottom: '10px' }}>
                  {q.image ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={q.image} alt="" style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button
                        type="button"
                        onClick={() => updateQuizQuestion(q.id, { image: null })}
                        style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 6, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', border: '2px dashed #CBD5E1', cursor: 'pointer', fontSize: '12px', color: '#64748B' }}>
                      📷 Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => updateQuizQuestion(q.id, { image: reader.result });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(q.options || ['', '']).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => updateQuizQuestion(q.id, { correct: i })}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          border: '2px solid',
                          borderColor: q.correct === i ? '#0EA5E9' : '#E2E8F0',
                          background: q.correct === i ? '#0EA5E9' : '#F8FAFC',
                          color: q.correct === i ? '#fff' : '#64748B',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        title="Correct answer"
                      >
                        {OPTIONS[i]}
                      </button>
                      <input
                        placeholder={`Option ${OPTIONS[i]}`}
                        value={q.options[i] ?? ''}
                        onChange={e => {
                          const opts = [...(q.options || ['', ''])];
                          opts[i] = e.target.value;
                          updateQuizQuestion(q.id, { options: opts });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ))}
                  {(q.options || ['', '']).length < 4 && (
                    <button
                      type="button"
                      onClick={() => addQuizOption(q.id)}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: '2px dashed #0EA5E9',
                        borderRadius: '8px',
                        background: '#F0F9FF',
                        color: '#0EA5E9',
                        cursor: 'pointer',
                        alignSelf: 'flex-start'
                      }}
                    >
                      + {t('games.add_option')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Select 2 players */}
          {selectedClass && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #0EA5E940' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#0C4A6E', display: 'block', marginBottom: '10px' }}>
                {t('games.select_2_players_lowercase')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {(selectedClass.students || []).map(student => {
                  const isSelected = selectedStudents.some(p => p.id === student.id);
                  const isFull = selectedStudents.length >= 2;
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (isSelected) setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                        else if (!isFull) setSelectedStudents(prev => [...prev, { id: student.id, name: student.name, color: ['#00d9ff', '#ff00ff'][prev.length] }]);
                      }}
                      disabled={!isSelected && isFull}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: isSelected ? '#0EA5E9' : '#E2E8F0',
                        background: isSelected ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)' : '#fff',
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
              <div style={{ marginTop: '8px', fontSize: '13px', color: selectedStudents.length === 2 ? '#0EA5E9' : '#64748B', fontWeight: '600' }}>
                {t('games.selected_n_of_n')
                  .replace('{selected}', selectedStudents.length)
                  .replace('{count}', 2)}{' '}
                {selectedStudents.length === 2
                  ? t('games.selected_ready')
                  : t('games.select_exactly_n').replace('{count}', 2)}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              const allQuestionsValid = quizConfig.questions.every(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim());
              if (selectedStudents.length === 2 && allQuestionsValid) {
                setPlayers(selectedStudents.map((p, i) => ({ ...p, color: ['#00d9ff', '#ff00ff'][i] })));
                setGameState('playing');
              }
            }}
            disabled={selectedStudents.length !== 2 || !quizConfig.questions.every(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim())}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '14px',
              cursor: selectedStudents.length === 2 && quizConfig.questions.every(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim()) ? 'pointer' : 'not-allowed',
              background: selectedStudents.length === 2 && quizConfig.questions.every(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim())
                ? 'linear-gradient(135deg, #0EA5E9, #06B6D4)'
                : '#ccc',
              color: '#fff',
              boxShadow: selectedStudents.length === 2 && quizConfig.questions.every(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim())
                ? '0 6px 24px rgba(14, 165, 233, 0.4)'
                : 'none',
              opacity: selectedStudents.length === 2 && quizConfig.questions.every(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim()) ? 1 : 0.6
            }}
          >
            {t('games.start_quiz')}
          </button>
        </div>
      )}

      {/* MotoRace Configuration Screen */}
      {gameState === 'config' && gameType === 'motorace' && (
        <div style={{
          width: '100%',
          maxWidth: '720px',
          padding: '28px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          border: '4px solid #F97316',
          boxShadow: '0 24px 56px rgba(249, 115, 22, 0.25)',
          marginTop: '44px',
          marginBottom: '44px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={onBack}
              style={{
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(255, 107, 107, 0.3)'
              }}
            >
              ← {t('games.back')}
            </button>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '160px' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                fontFamily: 'Comic Sans MS, cursive, sans-serif'
              }}>
                🏍️ {t('games.motorace_config')}
              </div>
              {selectedClass && (
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{t('games.select_class')}: {selectedClass.name}</div>
              )}
            </div>
            <div style={{ width: '80px' }} />
          </div>

          {/* Content type: Text OR Images only */}
          <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#FFF7ED', borderRadius: '16px', border: '2px solid #F9731640' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#9A3412', display: 'block', marginBottom: '10px' }}>
              📋 {t('games.text')} / {t('games.image')}
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setMotoRaceConfig(prev => ({ ...prev, contentType: 'text', items: prev.contentType === 'text' ? prev.items : [] }))}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px solid',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: motoRaceConfig.contentType === 'text' ? 'linear-gradient(135deg, #F97316, #EA580C)' : '#fff',
                  color: motoRaceConfig.contentType === 'text' ? '#fff' : '#78716c',
                  borderColor: motoRaceConfig.contentType === 'text' ? '#F97316' : '#E7E5E4'
                }}
              >
                ✏️ {t('games.text')}
              </button>
              <button
                type="button"
                onClick={() => setMotoRaceConfig(prev => ({ ...prev, contentType: 'images', items: prev.contentType === 'images' ? prev.items : [] }))}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px solid',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: motoRaceConfig.contentType === 'images' ? 'linear-gradient(135deg, #F97316, #EA580C)' : '#fff',
                  color: motoRaceConfig.contentType === 'images' ? '#fff' : '#78716c',
                  borderColor: motoRaceConfig.contentType === 'images' ? '#F97316' : '#E7E5E4'
                }}
              >
                🖼️ {t('games.image')}
              </button>
            </div>
          </div>

          {motoRaceConfig.contentType === 'text' && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #F9731640' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#9A3412', display: 'block', marginBottom: '8px' }}>
                ✏️ {t('games.enter_word')}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder={t('games.enter_word')}
                  id="motorace-words-input"
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #E7E5E4',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = document.getElementById('motorace-words-input');
                      const text = (input?.value || '').trim();
                      if (!text) return;
                      const words = text.split(/[,，\n]+/).map(w => w.trim()).filter(Boolean);
                      if (words.length) {
                        setMotoRaceConfig(prev => ({ ...prev, items: [...prev.items, ...words] }));
                        if (input) input.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('motorace-words-input');
                    const text = (input?.value || '').trim();
                    if (!text) return;
                    const words = text.split(/[,，\n]+/).map(w => w.trim()).filter(Boolean);
                    if (words.length) {
                      setMotoRaceConfig(prev => ({ ...prev, items: [...prev.items, ...words] }));
                      if (input) input.value = '';
                    }
                  }}
                  style={{
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '700',
                    border: '2px solid #F97316',
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#F97316',
                    cursor: 'pointer'
                  }}
                >
                  {t('games.add')}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                {motoRaceConfig.items.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    type="button"
                    onClick={() => setMotoRaceConfig(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '2px solid #F97316',
                      background: '#FFF7ED',
                      color: '#9A3412',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {word} ✕
                  </button>
                ))}
              </div>
            </div>
          )}

          {motoRaceConfig.contentType === 'images' && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #F9731640' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#9A3412', display: 'block', marginBottom: '8px' }}>
                {t('games.upload_images_bulk')}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="motorace-bulk-images"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  const readers = Array.from(files).map(file => {
                    return new Promise(resolve => {
                      const r = new FileReader();
                      r.onload = () => resolve(r.result);
                      r.readAsDataURL(file);
                    });
                  });
                  Promise.all(readers).then(urls => {
                    setMotoRaceConfig(prev => ({ ...prev, items: [...prev.items, ...urls] }));
                    e.target.value = '';
                  });
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('motorace-bulk-images').click()}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px dashed #F97316',
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#F97316',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                {t('games.select_images')}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {motoRaceConfig.items.map((src, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: 1, borderRadius: '8px', overflow: 'hidden', border: '2px solid #F97316' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setMotoRaceConfig(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Players: 2, 3, or 4 */}
          {selectedClass && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#FFF7ED', borderRadius: '16px', border: '2px solid #F9731640' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#9A3412', display: 'block', marginBottom: '8px' }}>
                {t('games.number_of_players')}
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setSelectedStudents([]);
                      setMotoRaceConfig(prev => ({ ...prev, playerCount: n }));
                    }}
                    style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      fontWeight: '700',
                      border: '2px solid',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: (motoRaceConfig.playerCount || 2) === n ? 'linear-gradient(135deg, #F97316, #EA580C)' : '#fff',
                      color: (motoRaceConfig.playerCount || 2) === n ? '#fff' : '#78716c',
                      borderColor: (motoRaceConfig.playerCount || 2) === n ? '#F97316' : '#E7E5E4'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#9A3412', display: 'block', marginBottom: '8px' }}>
                {t('games.select_n_players').replace('{count}', (motoRaceConfig.playerCount || 2))}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {(selectedClass.students || []).map(student => {
                  const isSelected = selectedStudents.some(p => p.id === student.id);
                  const maxP = motoRaceConfig.playerCount || 2;
                  const isFull = selectedStudents.length >= maxP;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                        else if (!isFull) setSelectedStudents(prev => [...prev, { id: student.id, name: student.name, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][prev.length] }]);
                      }}
                      disabled={!isSelected && isFull}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: isSelected ? '#F97316' : '#E2E8F0',
                        background: isSelected ? 'linear-gradient(135deg, #F97316, #EA580C)' : '#fff',
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
              <div style={{ marginTop: '8px', fontSize: '13px', color: selectedStudents.length === (motoRaceConfig.playerCount || 2) ? '#F97316' : '#64748B', fontWeight: '600' }}>
                {t('games.selected_n_of_n')
                  .replace('{selected}', selectedStudents.length)
                  .replace('{count}', (motoRaceConfig.playerCount || 2))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              const count = motoRaceConfig.playerCount || 2;
              if (selectedStudents.length === count && motoRaceConfig.items.length >= 10) {
                setPlayers(selectedStudents.map((p, i) => ({ ...p, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] })));
                setGameState('playing');
              }
            }}
            disabled={selectedStudents.length !== (motoRaceConfig.playerCount || 2) || motoRaceConfig.items.length < 10}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '14px',
              cursor: selectedStudents.length === (motoRaceConfig.playerCount || 2) && motoRaceConfig.items.length >= 10 ? 'pointer' : 'not-allowed',
              background: selectedStudents.length === (motoRaceConfig.playerCount || 2) && motoRaceConfig.items.length >= 10
                ? 'linear-gradient(135deg, #F97316, #EA580C)'
                : '#ccc',
              color: '#fff',
              boxShadow: selectedStudents.length === (motoRaceConfig.playerCount || 2) && motoRaceConfig.items.length >= 10 ? '0 6px 24px rgba(249, 115, 22, 0.4)' : 'none',
              opacity: selectedStudents.length === (motoRaceConfig.playerCount || 2) && motoRaceConfig.items.length >= 10 ? 1 : 0.6
            }}
          >
            🏍️ {t('games.start_game')} ({t('games.need_pairs').replace('{count}', 10)})
          </button>
        </div>
      )}

      {/* HorseRace Configuration Screen */}
      {gameState === 'config' && gameType === 'horserace' && (
        <div style={{
          width: '100%',
          maxWidth: '720px',
          padding: '28px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '28px',
          border: '4px solid #F59E0B',
          boxShadow: '0 24px 56px rgba(245, 158, 11, 0.25)',
          marginTop: '44px',
          marginBottom: '44px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              onClick={onBack}
              style={{
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(255, 107, 107, 0.3)'
              }}
            >
              ← {t('games.back')}
            </button>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '160px' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
                fontFamily: 'Comic Sans MS, cursive, sans-serif'
              }}>
                🐎 {t('games.horserace_config')}
              </div>
              {selectedClass && (
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{t('games.select_class')}: {selectedClass.name}</div>
              )}
            </div>
            <div style={{ width: '80px' }} />
          </div>

          {/* Content type: Text OR Images only */}
          <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#FFFBEB', borderRadius: '16px', border: '2px solid #F59E0B40' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', display: 'block', marginBottom: '10px' }}>
              📋 {t('games.text')} / {t('games.image')}
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setHorseRaceConfig(prev => ({ ...prev, contentType: 'text' }))}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px solid',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: horseRaceConfig.contentType === 'text' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#fff',
                  color: horseRaceConfig.contentType === 'text' ? '#fff' : '#78716c',
                  borderColor: horseRaceConfig.contentType === 'text' ? '#F59E0B' : '#E7E5E4'
                }}
              >
                ✏️ {t('games.text')}
              </button>
              <button
                type="button"
                onClick={() => setHorseRaceConfig(prev => ({ ...prev, contentType: 'images' }))}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px solid',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: horseRaceConfig.contentType === 'images' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#fff',
                  color: horseRaceConfig.contentType === 'images' ? '#fff' : '#78716c',
                  borderColor: horseRaceConfig.contentType === 'images' ? '#F59E0B' : '#E7E5E4'
                }}
              >
                🖼️ {t('games.image')}
              </button>
            </div>
          </div>

          {horseRaceConfig.contentType === 'text' && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #F59E0B40' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', display: 'block', marginBottom: '8px' }}>
                ✏️ {t('games.enter_word')}
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder={t('games.enter_word') + " - e.g., apple, banana, cat, dog..."}
                  id="horserace-words-input"
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '2px solid #E7E5E4',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = document.getElementById('horserace-words-input');
                      const text = (input?.value || '').trim();
                      if (!text) return;
                      const words = text.split(/[,，\n]+/).map(w => w.trim()).filter(Boolean);
                      if (words.length) {
                        setHorseRaceConfig(prev => ({ ...prev, words: [...prev.words, ...words] }));
                        if (input) input.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('horserace-words-input');
                    const text = (input?.value || '').trim();
                    if (!text) return;
                    const words = text.split(/[,，\n]+/).map(w => w.trim()).filter(Boolean);
                    if (words.length) {
                      setHorseRaceConfig(prev => ({ ...prev, words: [...prev.words, ...words] }));
                      if (input) input.value = '';
                    }
                  }}
                  style={{
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '700',
                    border: '2px solid #F59E0B',
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#B45309',
                    cursor: 'pointer'
                  }}
                >
                  {t('games.add')}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                {horseRaceConfig.words.map((word, idx) => (
                  <button
                    key={`${word}-${idx}`}
                    type="button"
                    onClick={() => setHorseRaceConfig(prev => ({ ...prev, words: prev.words.filter((_, i) => i !== idx) }))}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '2px solid #F59E0B',
                      background: '#FFFBEB',
                      color: '#92400E',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {word} ✕
                  </button>
                ))}
              </div>
            </div>
          )}

          {horseRaceConfig.contentType === 'images' && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid #F59E0B40' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', display: 'block', marginBottom: '8px' }}>
                {t('games.upload_images_bulk')}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                id="horserace-bulk-images"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  const readers = Array.from(files).map(file => {
                    return new Promise(resolve => {
                      const r = new FileReader();
                      r.onload = () => resolve(r.result);
                      r.readAsDataURL(file);
                    });
                  });
                  Promise.all(readers).then(urls => {
                    setHorseRaceConfig(prev => ({ ...prev, images: [...prev.images, ...urls] }));
                    e.target.value = '';
                  });
                }}
              />
              <button
                type="button"
                onClick={() => document.getElementById('horserace-bulk-images').click()}
                style={{
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px dashed #F59E0B',
                  borderRadius: '10px',
                  background: '#fff',
                  color: '#B45309',
                  cursor: 'pointer',
                  marginBottom: '12px'
                }}
              >
                {t('games.select_images')}
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {horseRaceConfig.images.map((src, idx) => (
                  <div key={idx} style={{ position: 'relative', aspectRatio: 1, borderRadius: '8px', overflow: 'hidden', border: '2px solid #F59E0B' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setHorseRaceConfig(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 12,
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Players: 2, 3, or 4 */}
          {selectedClass && (
            <div style={{ marginBottom: '18px', padding: '14px 18px', background: '#FFFBEB', borderRadius: '16px', border: '2px solid #F59E0B40' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', display: 'block', marginBottom: '8px' }}>
                {t('games.number_of_players')}
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setSelectedStudents([]);
                      setHorseRaceConfig(prev => ({ ...prev, playerCount: n }));
                    }}
                    style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      fontWeight: '700',
                      border: '2px solid',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: (horseRaceConfig.playerCount || 2) === n ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#fff',
                      color: (horseRaceConfig.playerCount || 2) === n ? '#fff' : '#78716c',
                      borderColor: (horseRaceConfig.playerCount || 2) === n ? '#F59E0B' : '#E7E5E4'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#92400E', display: 'block', marginBottom: '8px' }}>
                {t('games.select_n_players').replace('{count}', (horseRaceConfig.playerCount || 2))}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {(selectedClass.students || []).map(student => {
                  const isSelected = selectedStudents.some(p => p.id === student.id);
                  const maxP = horseRaceConfig.playerCount || 2;
                  const isFull = selectedStudents.length >= maxP;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) setSelectedStudents(prev => prev.filter(p => p.id !== student.id));
                        else if (!isFull) setSelectedStudents(prev => [...prev, { id: student.id, name: student.name, avatar: student.avatar, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][prev.length] }]);
                      }}
                      disabled={!isSelected && isFull}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '2px solid',
                        borderColor: isSelected ? '#F59E0B' : '#E2E8F0',
                        background: isSelected ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#fff',
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
              <div style={{ marginTop: '8px', fontSize: '13px', color: selectedStudents.length === (horseRaceConfig.playerCount || 2) ? '#F59E0B' : '#64748B', fontWeight: '600' }}>
                {t('games.selected_n_of_n')
                  .replace('{selected}', selectedStudents.length)
                  .replace('{count}', (horseRaceConfig.playerCount || 2))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              const count = horseRaceConfig.playerCount || 2;
              const items = horseRaceConfig.contentType === 'text' ? horseRaceConfig.words : horseRaceConfig.images;
              if (selectedStudents.length === count && items.length >= 10) {
                setPlayers(selectedStudents.map((p, i) => ({ ...p, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] })));
                setGameState('playing');
              }
            }}
            disabled={selectedStudents.length !== (horseRaceConfig.playerCount || 2) || (horseRaceConfig.contentType === 'text' ? horseRaceConfig.words.length : horseRaceConfig.images.length) < 10}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              fontWeight: '900',
              border: 'none',
              borderRadius: '14px',
              cursor: selectedStudents.length === (horseRaceConfig.playerCount || 2) && (horseRaceConfig.contentType === 'text' ? horseRaceConfig.words.length : horseRaceConfig.images.length) >= 10 ? 'pointer' : 'not-allowed',
              background: selectedStudents.length === (horseRaceConfig.playerCount || 2) && (horseRaceConfig.contentType === 'text' ? horseRaceConfig.words.length : horseRaceConfig.images.length) >= 10
                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                : '#ccc',
              color: '#fff',
              boxShadow: selectedStudents.length === (horseRaceConfig.playerCount || 2) && (horseRaceConfig.contentType === 'text' ? horseRaceConfig.words.length : horseRaceConfig.images.length) >= 10 ? '0 6px 24px rgba(245, 158, 11, 0.4)' : 'none',
              opacity: selectedStudents.length === (horseRaceConfig.playerCount || 2) && (horseRaceConfig.contentType === 'text' ? horseRaceConfig.words.length : horseRaceConfig.images.length) >= 10 ? 1 : 0.6
            }}
          >
            🐎 {t('games.start_game')} ({t('games.need_pairs').replace('{count}', 10)})
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
              ← {t('games.back')}
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
                  {isTeamMode ? `👥 ${t('games.teams')}` : `👤 ${t('games.individual')}`}
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
                {t('games.torenado_game')}
              </h1>
            )}

            <div style={{ width: '100px' }}></div>
          </div>

          {/* Mode Tabs (Individual / Teams) */}
          {selectedClass && (
            <div style={{ marginBottom: '25px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '6px',
                background: '#F3F4F6',
                borderRadius: '16px'
              }}>
                <button
                  onClick={() => {
                    setIsTeamMode(false);
                    setPlayerCount(2);
                    setSelectedStudents([]);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: '16px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: !isTeamMode ? 'linear-gradient(135deg, #3B82F6, #10B981)' : 'transparent',
                    color: !isTeamMode ? '#fff' : '#6B7280',
                    boxShadow: !isTeamMode ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  👤 Individual
                </button>
                <button
                  onClick={() => {
                    setIsTeamMode(true);
                    setPlayerCount(2);
                    setSelectedStudents([]);
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    fontSize: '16px',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: isTeamMode ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' : 'transparent',
                    color: isTeamMode ? '#fff' : '#6B7280',
                    boxShadow: isTeamMode ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                >
                  {t('games.teams_label')}
                </button>
              </div>
            </div>
          )}

          {/* Team/Player Count Selection (Only when replay mode and team mode) */}
          {isReplay && isTeamMode && (
            <div style={{ marginBottom: '25px', padding: '20px', background: '#F8FAFC', borderRadius: '18px', border: '3px solid #8B5CF6' }}>
              <label style={{
                color: '#333',
                fontSize: '18px',
                fontWeight: '700',
                display: 'block',
                marginBottom: '15px'
              }}>
                {t('games.teams_label')}
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[2, 3, 4].map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      setPlayerCount(count);
                      // Divide students evenly among teams
                      if (selectedClass?.students) {
                        const teams = Array.from({ length: count }, (_, i) =>
                          selectedClass.students.filter((_, idx) => idx % count === i)
                        );
                      }
                    }}
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

          {/* Team Display (Show teams with their members) */}
          {isReplay && isTeamMode && selectedClass && playerCount > 0 && (
            <div style={{ marginBottom: '25px', padding: '20px', background: '#F8FAFC', borderRadius: '18px', border: '3px solid #8B5CF6' }}>
              <label style={{
                color: '#333',
                fontSize: '18px',
                fontWeight: '700',
                display: 'block',
                marginBottom: '15px'
              }}>
                👥 {t('games.teams')}:
              </label>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {Array.from({ length: playerCount }).map((_, i) => {
                  const teamMembers = (selectedClass.students || []).filter((_, idx) => idx % playerCount === i);
                  const teamColor = ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i];
                  return (
                    <div key={i} style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: teamColor + '20',
                      border: `2px solid ${teamColor}`
                    }}>
                      <strong style={{ color: teamColor, fontSize: '14px' }}>Team {i + 1}</strong>
                      <ul style={{ margin: '8px 0 0 16px', paddingLeft: '20px', fontSize: '13px' }}>
                        {teamMembers.map(student => (
                          <li key={student.id}>{student.name}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
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
                {t('games.select_students')}
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
                {t('games.selected_count').replace('{selected}', selectedStudents.length).replace('{ready}', selectedStudents.length >= 2 ? t('games.selected_ready') : t('games.selected_not_ready'))}
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
              {t('games.number_of_tiles')}
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
              {t('games.numbered_tiles')}
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
              {config.numberedSquares ? t('games.enabled') : t('games.disabled')}
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
              {t('games.tornado_count')}
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
              {t('games.upload_pictures_review')}
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
                {t('games.click_upload_images')}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '6px'
              }}>
                {t('games.drag_drop_files')}
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
                    {t('games.images_loaded_suffix')}
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
              ✏️ {t('games.enter_word')}:
            </label>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <input
                type="text"
                placeholder={t('games.words_csv_placeholder')}
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
                {t('games.add')}
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
                {t('games.added_words')}
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
                    {t('games.no_words_added_yet')}
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
                  // Team mode - create teams from selected class students divided evenly
                  const students = selectedClass.students || [];
                  const teams = [];
                  for (let i = 0; i < playerCount; i++) {
                    // Divide students evenly among teams using modulo
                    const teamMembers = students.filter((_, idx) => idx % playerCount === i);
                    teams.push({
                      id: i,
                      name: t('games.team_name').replace('{number}', i + 1),
                      color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i],
                      members: teamMembers
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
            {t('games.start_game')}
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
            id: typeof p === 'string' ? i : (p?.id || i),
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
          selectedClass={selectedClass}
          onGivePoints={handleGivePoints}
        />
      )}

      {gameState === 'playing' && gameType === 'faceoff' && (
        <FaceOffGame
          config={faceOffConfig}
          players={players.map((p, i) => ({
            id: typeof p === 'string' ? i : (p?.id || i),
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
          selectedClass={selectedClass}
          onGivePoints={handleGivePoints}
        />
      )}

      {gameState === 'playing' && gameType === 'memorymatch' && (
        <MemoryMatchGame
          contentItems={memoryMatchConfig.contentItems}
          onBack={onBack}
          onReset={() => setGameState('config')}
          classColor="#8B5CF6"
          players={players}
          selectedClass={selectedClass}
          onGivePoints={handleGivePoints}
        />
      )}

      {gameState === 'playing' && (gameType === 'quiz' || gameType === 'liveworksheet') && (
        <QuizGame
          questions={quizConfig.questions.filter(q => q.question?.trim() && (q.options || []).filter(o => o?.trim()).length >= 2 && (q.options || [])[q.correct]?.trim())}
          onBack={() => setGameState('config')}
          classColor="#0EA5E9"
          players={players}
          autoStart={true}
          selectedClass={selectedClass}
          onGivePoints={handleGivePoints}
        />
      )}

      {gameState === 'playing' && gameType === 'motorace' && (
        <MotoRaceGame
          items={motoRaceConfig.items}
          contentType={motoRaceConfig.contentType}
          players={players}
          onBack={() => setGameState('config')}
          selectedClass={selectedClass}
          onGivePoints={handleGivePoints}
        />
      )}

      {gameState === 'playing' && gameType === 'horserace' && (
        <HorseRaceGame
          items={horseRaceConfig.contentType === 'text' ? horseRaceConfig.words : horseRaceConfig.images}
          contentType={horseRaceConfig.contentType}
          players={players}
          onBack={() => setGameState('config')}
          onGivePoints={handleGivePoints}
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
            🏆 {t('games.game_over')}! 🏆
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
            🔄 {t('games.play_again')}
          </button>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}

      {/* Live Worksheet View */}
      {gameState === 'worksheet' && gameType === 'liveworksheet' && (
        <LiveWorksheet
          onBack={() => {
            localStorage.removeItem('selected_game_type');
            setGameState('select-game');
            setGameType('tornado');
            if (onBack) onBack();
          }}
          selectedClass={selectedClass}
          onAssign={async (worksheet) => {
            try {
              const { default: api } = await import('../services/api.js');
              
              // Create new assignment object
              const newAssignment = {
                id: Date.now().toString(),
                title: worksheet.file || 'Worksheet',
                type: 'worksheet',
                questions: worksheet.questions,
                createdAt: worksheet.createdAt,
                status: 'active'
              };

              // Get current class
              const classes = await api.getClasses(user?.email);
              
              // Try to find by ID first, then by collectionId, then by name as fallback
              let currentClass = classes.find(c => c.id === selectedClass?.id);
              if (!currentClass && selectedClass?.collectionId) {
                currentClass = classes.find(c => c.collectionId === selectedClass.collectionId);
              }
              if (!currentClass && selectedClass?.name) {
                currentClass = classes.find(c => c.name === selectedClass.name);
              }
              
              if (currentClass) {
                // Add assignment to class
                const updatedAssignments = [...(currentClass.assignments || []), newAssignment];
                
                // Save updated class - match by the real ID from the found class
                await api.saveClasses(user?.email, [...classes.map(c => 
                  c.id === currentClass.id || c.collectionId === selectedClass?.collectionId
                    ? { ...c, assignments: updatedAssignments }
                    : c
                )]);
                
                // Return to game menu after a brief delay to show success message
                setTimeout(() => {
                  localStorage.removeItem('selected_game_type');
                  setGameState('select-game');
                  setGameType('tornado');
                }, 2000);
              } else {
                alert('Please select a class first.');
              }
            } catch (err) {
              console.error('Failed to assign worksheet:', err);
              alert('Failed to assign worksheet. Please try again.');
            }
            
            localStorage.removeItem('selected_game_type');
            setGameState('select-game');
            setGameType('tornado');
          }}
          onPlayNow={(questions) => {
            // Store questions and navigate to quiz game
            localStorage.setItem('stored_quiz_questions', JSON.stringify(questions));
            localStorage.setItem('selected_game_type', 'quiz');
            setQuizConfig({ questions });
            setGameType('quiz');
            setGameState('config');
          }}
        />
      )}
    </div>
  );
};

export default TornadoGameWrapper;
