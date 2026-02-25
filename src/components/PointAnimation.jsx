import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState, useMemo, useRef } from 'react';

// ─── Character assets ────────────────────────────────────────────────────────
import monkeyImg    from '../assets/characters/monkey_thumbsup.png';
import pigImg       from '../assets/characters/pig_celebrate.png';
import frogImg      from '../assets/characters/frog_wow.png';
import dogImg       from '../assets/characters/dog_sad.png';
import owlImg       from '../assets/characters/owl_disappointed.png';

// ─── Character definitions ───────────────────────────────────────────────────
// Each character has:
//   src        – imported image
//   mood       – 'positive' | 'negative'
//   entry      – which screen edge it enters from ('left'|'right'|'top'|'bottom')
//   label      – fun reaction text shown in the speech bubble
//   bobAnim    – framer-motion animate object for the idle bob while on screen
//   color      – accent color for the speech bubble

const CHARACTERS = [
  {
    id: 'monkey',
    src: monkeyImg,
    mood: 'positive',
    entry: 'left',
    labels: ['NICE ONE! 🎉', 'YOU ROCK! 🤘', 'BOOM! 💥', 'LEGEND! 🏆'],
    color: '#FF9800',
    bobAnim: {
      y: [0, -22, 0, -14, 0],
      rotate: [0, -8, 8, -5, 0],
      scale: [1, 1.06, 1, 1.04, 1],
    },
  },
  {
    id: 'pig',
    src: pigImg,
    mood: 'positive',
    entry: 'right',
    labels: ['AMAZING! 🌟', 'WOW WOW WOW!', 'SUPERSTAR! ⭐', 'INCREDIBLE! 🎊'],
    color: '#E91E8C',
    bobAnim: {
      y: [0, -18, 0, -10, 0],
      rotate: [0, 6, -6, 4, 0],
      scale: [1, 1.08, 1, 1.05, 1],
    },
  },
  {
    id: 'frog',
    src: frogImg,
    mood: 'positive',
    entry: 'bottom',
    labels: ['RIBBIT! YOU DID IT! 🐸', 'JUMP FOR JOY! 🎉', 'SO AWESOME! ✨', 'YEAH YEAH YEAH! 🌈'],
    color: '#4CAF50',
    bobAnim: {
      y: [0, -28, 0, -16, 0],
      rotate: [0, -4, 4, -3, 0],
      scale: [1, 1.1, 1, 1.06, 1],
    },
  },
  {
    id: 'dog',
    src: dogImg,
    mood: 'negative',
    entry: 'left',
    labels: ['Oof... 😢', 'Aww nooo...', 'Come on...', 'That hurt 💔'],
    color: '#FF5722',
    bobAnim: {
      x: [-6, 6, -6, 4, -4, 0],
      rotate: [-4, 4, -4, 3, -3, 0],
      scale: [1, 0.96, 1, 0.97, 1],
    },
  },
  {
    id: 'owl',
    src: owlImg,
    mood: 'negative',
    entry: 'right',
    labels: ['Disappointing...', 'I expected better.', 'Hmm. Really?', 'Not great, kid.'],
    color: '#795548',
    bobAnim: {
      y: [0, 4, 0, 3, 0],
      rotate: [-3, 3, -3, 2, 0],
      scale: [1, 0.97, 1, 0.98, 1],
    },
  },
];

// ─── Entry/exit motion variants per edge ─────────────────────────────────────
function getEntryVariants(entry) {
  const offscreen = {
    left:   { x: '-140%', y: '0%',    opacity: 0 },
    right:  { x:  '140%', y: '0%',    opacity: 0 },
    top:    { x: '0%',    y: '-140%', opacity: 0 },
    bottom: { x: '0%',    y:  '140%', opacity: 0 },
  };
  return {
    hidden:  offscreen[entry] || offscreen.left,
    visible: { x: '0%', y: '0%', opacity: 1,
      transition: { type: 'spring', damping: 18, stiffness: 220, duration: 0.6 } },
    exit:    { ...offscreen[entry], opacity: 0,
      transition: { type: 'spring', damping: 22, stiffness: 260, duration: 0.45 } },
  };
}

// ─── Confetti particle ────────────────────────────────────────────────────────
const CONFETTI_EMOJIS = ['🎉', '✨', '🌟', '💫', '⭐', '🎊', '🏆', '💥'];
function ConfettiParticle({ index, total }) {
  const x = `${(index / total) * 100}vw`;
  const delay = index * 0.12;
  const size = 22 + (index % 3) * 8;
  return (
    <motion.div
      initial={{ y: '-10vh', x, opacity: 0, rotate: 0 }}
      animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 * (index % 2 === 0 ? 1 : -1) }}
      transition={{ duration: 2.2, delay, ease: 'linear' }}
      style={{ position: 'fixed', top: 0, fontSize: size, pointerEvents: 'none', zIndex: 4001 }}
    >
      {CONFETTI_EMOJIS[index % CONFETTI_EMOJIS.length]}
    </motion.div>
  );
}

// ─── Speech bubble ────────────────────────────────────────────────────────────
function SpeechBubble({ text, color, side }) {
  const isLeft = side === 'left' || side === 'bottom';
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', damping: 14, stiffness: 300, delay: 0.35 }}
      style={{
        position: 'absolute',
        top: '8%',
        [isLeft ? 'right' : 'left']: '-10px',
        transform: isLeft ? 'translateX(100%)' : 'translateX(-100%)',
        background: color,
        color: '#fff',
        fontWeight: 900,
        fontSize: 'clamp(14px, 2.2vw, 22px)',
        padding: '10px 18px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        zIndex: 4010,
        letterSpacing: 0.3,
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {text}
      {/* Tail */}
      <div style={{
        position: 'absolute',
        top: '50%',
        [isLeft ? 'left' : 'right']: -10,
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        [isLeft ? 'borderRight' : 'borderLeft']: `12px solid ${color}`,
      }} />
    </motion.div>
  );
}

// ─── Points badge ─────────────────────────────────────────────────────────────
function PointsBadge({ points, studentName, isPositive }) {
  const bg = isPositive
    ? 'linear-gradient(135deg, #FFD700 0%, #FF9800 100%)'
    : 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)';
  return (
    <motion.div
      initial={{ scale: 0, y: 60, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: -40, opacity: 0 }}
      transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.2 }}
      style={{
        position: 'fixed',
        bottom: '12vh',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        borderRadius: 28,
        padding: '18px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        zIndex: 4005,
        minWidth: 180,
        border: `4px solid rgba(255,255,255,0.4)`,
      }}
    >
      <span style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(18px, 3vw, 26px)', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        {studentName}
      </span>
      <motion.span
        animate={{ scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.3 }}
        style={{ color: '#fff', fontWeight: 950, fontSize: 'clamp(42px, 7vw, 72px)', lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
      >
        {isPositive ? `+${points}` : points}
      </motion.span>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export const PointAnimation = ({
  isVisible,
  studentAvatar,
  studentName,
  points = 1,
  behaviorEmoji = '⭐',
  onComplete,
  students,
}) => {
  const isPositive = points > 0;
  const isWholeClass = students && students.length > 0;

  // Pick a random character matching the mood, stable per animation trigger
  const characterRef = useRef(null);
  const labelRef = useRef('');

  useEffect(() => {
    if (isVisible) {
      const pool = CHARACTERS.filter(c => c.mood === (isPositive ? 'positive' : 'negative'));
      const picked = pool[Math.floor(Math.random() * pool.length)];
      characterRef.current = picked;
      labelRef.current = picked.labels[Math.floor(Math.random() * picked.labels.length)];
    }
  }, [isVisible, isPositive]);

  const char = characterRef.current;
  const entry = char?.entry ?? 'left';
  const variants = useMemo(() => getEntryVariants(entry), [entry]);

  // ── Sound effects (unchanged from original) ────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;
    let audioContext = null;
    let oscillators = [];
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioContext = new AudioContextClass({ latencyHint: 'interactive' });
      if (audioContext.state === 'suspended') audioContext.resume();
      const startTime = audioContext.currentTime;
      const playNote = (freq, time, volume = 0.2, duration = 0.2, type = 'sine') => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        osc.start(time);
        osc.stop(time + duration);
        oscillators.push(osc);
      };
      if (isPositive) {
        const count = Math.min(Math.max(points, 1), 5);
        if (count === 1) {
          playNote(1046, startTime, 0.25, 0.15, 'sine');
          playNote(1318, startTime + 0.08, 0.15, 0.2, 'sine');
        } else if (count === 2) {
          playNote(784, startTime, 0.2, 0.2, 'triangle');
          playNote(880, startTime + 0.12, 0.2, 0.2, 'triangle');
          playNote(1046, startTime + 0.24, 0.25, 0.35, 'sine');
        } else if (count === 3) {
          playNote(659, startTime, 0.18, 0.2, 'triangle');
          playNote(784, startTime + 0.1, 0.18, 0.2, 'triangle');
          playNote(987, startTime + 0.2, 0.2, 0.25, 'triangle');
          playNote(1318, startTime + 0.3, 0.25, 0.4, 'sine');
        } else if (count === 4) {
          playNote(523, startTime, 0.15, 0.15, 'triangle');
          playNote(659, startTime + 0.08, 0.15, 0.15, 'triangle');
          playNote(784, startTime + 0.16, 0.18, 0.2, 'triangle');
          playNote(1046, startTime + 0.24, 0.2, 0.25, 'triangle');
          playNote(1318, startTime + 0.32, 0.25, 0.5, 'sine');
        } else {
          const chords = [
            { f: [523, 659], t: 0 }, { f: [784, 987], t: 0.15 },
            { f: [1046, 1318], t: 0.3 }, { f: [1318, 1567], t: 0.5 },
          ];
          chords.forEach(c => c.f.forEach(freq => playNote(freq, startTime + c.t, 0.18, 0.8, 'triangle')));
        }
      } else {
        const penalty = Math.abs(points);
        if (penalty === 1) {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'sine'; osc.connect(gain); gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(660, startTime);
          osc.frequency.exponentialRampToValueAtTime(330, startTime + 0.2);
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
          osc.start(startTime); osc.stop(startTime + 0.2);
          oscillators.push(osc);
        } else if (penalty === 2) {
          playNote(494, startTime, 0.15, 0.15, 'triangle');
          playNote(330, startTime + 0.12, 0.18, 0.25, 'triangle');
          playNote(392, startTime + 0.3, 0.15, 0.15, 'triangle');
          playNote(262, startTime + 0.42, 0.18, 0.25, 'triangle');
        } else if (penalty === 3) {
          playNote(523, startTime, 0.15, 0.12, 'triangle');
          playNote(392, startTime + 0.12, 0.15, 0.12, 'triangle');
          playNote(330, startTime + 0.24, 0.18, 0.15, 'triangle');
          playNote(262, startTime + 0.36, 0.2, 0.3, 'triangle');
        } else {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const lfo = audioContext.createOscillator();
          const lfoGain = audioContext.createGain();
          osc.type = 'triangle'; lfo.type = 'sine'; lfo.frequency.value = 5;
          lfoGain.gain.value = 100;
          osc.connect(gain); lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
          gain.connect(audioContext.destination);
          osc.frequency.value = 400;
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.9);
          lfo.start(startTime); osc.start(startTime);
          osc.stop(startTime + 0.9); lfo.stop(startTime + 0.9);
          oscillators.push(osc, lfo);
        }
      }
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }
    return () => {
      oscillators.forEach(osc => { try { if (osc.state !== 'stopped') osc.stop(); } catch (e) {} });
      if (audioContext && audioContext.state !== 'closed') { try { audioContext.close(); } catch (e) {} }
    };
  }, [isVisible, isPositive, points]);

  // ── Character position on screen ───────────────────────────────────────────
  // Characters are anchored to their entry edge so they look like they're
  // peeking in from the side / bottom of the viewport.
  const positionStyle = useMemo(() => {
    const base = {
      position: 'fixed',
      zIndex: 4002,
      width: 'clamp(180px, 28vw, 360px)',
      height: 'auto',
    };
    switch (entry) {
      case 'left':   return { ...base, left: '2vw',  bottom: '8vh' };
      case 'right':  return { ...base, right: '2vw', bottom: '8vh', scaleX: -1 };
      case 'bottom': return { ...base, left: '50%',  bottom: 0, transform: 'translateX(-50%)' };
      case 'top':    return { ...base, left: '50%',  top: 0,    transform: 'translateX(-50%)' };
      default:       return { ...base, left: '2vw',  bottom: '8vh' };
    }
  }, [entry]);

  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && char && (
        <>
          {/* Dim backdrop — tap to dismiss */}
          <motion.div
            data-point-animation-backdrop="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 3999, cursor: 'pointer' }}
          />

          {/* Confetti for positive */}
          {isPositive && Array.from({ length: 10 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} total={10} />
          ))}

          {/* Character wrapper — slides in from edge */}
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ ...positionStyle, position: 'fixed' }}
          >
            {/* Idle bob animation on the image itself */}
            <motion.div
              style={{ position: 'relative', display: 'inline-block' }}
              animate={char.bobAnim}
              transition={{ duration: 0.9, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
            >
              <img
                src={char.src}
                alt={char.id}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  // flip right-side characters so they face inward
                  transform: entry === 'right' ? 'scaleX(-1)' : 'none',
                  filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.22))',
                }}
              />

              {/* Speech bubble */}
              <SpeechBubble
                text={labelRef.current}
                color={char.color}
                side={entry}
              />
            </motion.div>
          </motion.div>

          {/* Points + name badge at bottom center */}
          <PointsBadge
            points={points}
            studentName={isWholeClass ? 'Whole Class' : (studentName || 'Student')}
            isPositive={isPositive}
          />
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
