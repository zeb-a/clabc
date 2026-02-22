import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock , X} from 'lucide-react';
import useWindowSize from '../hooks/useWindowSize';

const KidTimer = ({ onComplete, onClose }) => {
  const isMobile = useWindowSize(768);
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
    <div className="safe-area-top" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
        <div style={{ animation: 'fadeIn 0.5s', width: '100%', padding: '0 1px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '52px' }}>
          <div style={{
            background: '#EEF2FF',
            padding: '21px 28px',
            borderRadius: '20px',
            color: '#4F46E5',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}>
            <Clock size={32} color="#4F46E5" /> CLASS TIMER
          </div>
          <h3 style={{ fontSize: 'clamp(17px, 3.5vw, 20px)', color: '#475569', margin: 0,marginBottom:'10px', fontWeight: 700, textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: '0.5px' }}>
            How long do we focus?
          </h3>
          <div style={{
            display: 'flex',
            gap: 'clamp(16px, 2.5vw, 24px)',
            width: '100%',
            maxWidth: '560px',
            justifyContent: 'center',
            flexWrap: 'nowrap',
            paddingTop: '0px'
          }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => selectTime(num)}
                className="timer-select-btn"
                style={{
                  width: 'clamp(65px, 13vw, 80px)',
                  height: 'clamp(52px, 11vw, 68px)',
                  borderRadius: 'clamp(12px, 2.5vw, 16px)',
                  border: 'none',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: 'clamp(20px, 4.5vw, 28px)',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #C7D2FE',
                  transition: 'transform 0.1s, background 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 1,
                  paddingTop: '8px'
                }}
              >
                <span style={{ fontSize: 'clamp(20px, 4.5vw, 28px)', fontWeight: 900, lineHeight: 1 }}>{num}</span>
                <span style={{ fontSize: 'clamp(10px, 2.2vw, 12px)', fontWeight: 600, opacity: 0.7, lineHeight: 1, marginTop: '4px' }}>MIN</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(20px, 4vw, 30px)', width: '100%', maxWidth: '600px', padding: '0 20px', animation: 'fadeIn 0.5s' }}>

          {/* Visual Timer Ring */}
          <div style={{
            position: 'relative',
            width: 'clamp(200px, 50vw, 320px)',
            height: 'clamp(200px, 50vw, 320px)',
            borderRadius: '50%',
            background: `conic-gradient(#10B981 ${((totalSeconds - timeLeft) / totalSeconds) * 100}%, #F3F4F6 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 50px -10px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{
              width: 'clamp(170px, 42vw, 280px)',
              height: 'clamp(170px, 42vw, 280px)',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
               <div style={{ fontSize: 'clamp(48px, 12vw, 80px)', fontWeight: '900', color: '#1E293B', fontVariantNumeric: 'tabular-nums' }}>
                 {formatTime(timeLeft)}
               </div>
               <div style={{ color: '#94A3B8', fontWeight: 600, marginTop: '-5px', fontSize: 'clamp(12px, 3vw, 16px)' }}>
                 {isRunning ? 'FOCUS TIME' : 'PAUSED'}
               </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 20px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 40px)',
                borderRadius: 'clamp(14px, 3vw, 20px)',
                border: 'none',
                background: isRunning ? '#FEF2F2' : '#ECFDF5',
                color: isRunning ? '#EF4444' : '#10B981',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 0 rgba(0,0,0,0.05)'
              }}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              {isRunning ? 'PAUSE' : 'RESUME'}
            </button>

            <button
              onClick={() => { setIsRunning(false); setMode('setup'); }}
              style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(18px, 4vw, 24px)',
                borderRadius: 'clamp(14px, 3vw, 20px)',
                border: 'none',
                background: '#F1F5F9',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: 'clamp(14px, 3.5vw, 18px)'
              }}
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KidTimer;