import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock , X} from 'lucide-react';

const KidTimer = ({ onComplete, onClose }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(5); // Default 5
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  // Removed unused isWarning state
  const [mode, setMode] = useState('setup'); // 'setup' or 'running'
  
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      const animationFrame = animationRef.current;
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  const playSound = (frequency = 800, duration = 100, type = 'sine') => {
    if (!audioContextRef.current) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.1;
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  };

  // Ticking sound
  useEffect(() => {
    if (isRunning && timeLeft > 0) playSound(800, 30, 'square');
  }, [timeLeft, isRunning]);

  // Countdown Logic
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 10 && newTime > 0) {
            playSound(1000, 200, 'sawtooth');
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Handle timer completion when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playSound(400, 2000, 'sine'); // Done sound
      if (onComplete) onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning]);

  // Handle Minute Selection
  const selectTime = (mins) => {
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setMode('running');
    setIsRunning(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = selectedMinutes * 60;

  // --- RENDER ---
  return (
    <div className="safe-area-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingTop: 'calc(var(--safe-top, 0px))' }}>
      <button
      onClick={onClose}
      style={{
        position: 'absolute',
        top: mode === 'setup' ? '60px' : '20px',
        right: '20px',
        background: '#F1F5F9',
        border: 'none',
        borderRadius: '50%',
        padding: '10px',
        cursor: 'pointer',
        color: '#64748B'
      }}
    >
      <X size={24} />
    </button>
      {/* MODE 1: SETUP (Choose Minutes) */}
      {mode === 'setup' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <h3 style={{ fontSize: '24px', color: '#64748B', marginBottom: '30px', fontWeight: 600 }}>
            How long do we focus?
          </h3>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => selectTime(num)}
                className="timer-select-btn"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '24px',
                  border: 'none',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: '32px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #C7D2FE',
                  transition: 'transform 0.1s, background 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {num}
                <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.7 }}>MIN</span>
              </button>
            ))}
          </div>
          <style>{`
            .timer-select-btn:hover { transform: translateY(-4px); background: #E0E7FF !important; }
            .timer-select-btn:active { transform: translateY(2px); box-shadow: none !important; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* MODE 2: RUNNING (The Big Timer) */}
      {mode === 'running' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%', animation: 'fadeIn 0.5s' }}>
          
          {/* Visual Timer Ring */}
          <div style={{
            position: 'relative',
            width: '320px', // Wider
            height: '320px', // Bigger
            borderRadius: '50%',
            background: `conic-gradient(#10B981 ${((totalSeconds - timeLeft) / totalSeconds) * 100}%, #F3F4F6 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px -10px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
               <div style={{ fontSize: '80px', fontWeight: '900', color: '#1E293B', fontVariantNumeric: 'tabular-nums' }}>
                 {formatTime(timeLeft)}
               </div>
               <div style={{ color: '#94A3B8', fontWeight: 600, marginTop: '-10px' }}>
                 {isRunning ? 'FOCUS TIME' : 'PAUSED'}
               </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: '16px 40px',
                borderRadius: '20px',
                border: 'none',
                background: isRunning ? '#FEF2F2' : '#ECFDF5',
                color: isRunning ? '#EF4444' : '#10B981',
                fontSize: '18px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.05)'
              }}
            >
              {isRunning ? <Pause /> : <Play />}
              {isRunning ? 'PAUSE' : 'RESUME'}
            </button>

            <button
              onClick={() => { setIsRunning(false); setMode('setup'); }}
              style={{
                padding: '16px 24px',
                borderRadius: '20px',
                border: 'none',
                background: '#F1F5F9',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              <RotateCcw />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidTimer;