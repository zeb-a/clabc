import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// theme hook for light/dark detection
import { useTheme } from '../ThemeContext';
// ─── Project utilities ───────────────────────────────────────────────────────
import { boringAvatar } from '../utils/avatar';

// ─── Character sprite assets ─────────────────────────────────────────────────
// import dinoSpriteSheet   from '../assets/characters/Dino_spritesheet.png';
// import planeSpriteSheet  from '../assets/characters/plane_spritesheet.png';
// import catSpriteSheet from '../assets/characters/cat_spritesheet.png';
// import slideCatSpriteSheet from '../assets/characters/slide_cat_spritesheet.png';
// import jumpIdleRunCatSpriteSheet from '../assets/characters/Jump_Idle_run-cat-spritesheet.png';
// import fallCatSpriteSheet from '../assets/characters/Fall_sprite-spritesheet.png';
// import deadCatSpriteSheet from '../assets/characters/dead_cat-spritesheet.png';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADVANCED CONFETTI SYSTEM ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function AdvancedConfetti({ isPositive }) {
  const confettiPieces = useRef([]);

  useEffect(() => {
    const pieces = [];
    const count = isPositive ? 40 : 35;

    for (let i = 0; i < count; i++) {
      const piece = {
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 2.5 + Math.random() * 2.0,
        rotation: Math.random() * 720,
        scale: 0.6 + Math.random() * 0.8,
        swayAmount: -30 + Math.random() * 60,
        type: isPositive
          ? ['flower', 'bouquet', 'star', 'sparkle'][Math.floor(Math.random() * 4)]
          : ['glass', 'heart', 'crack', 'shatter'][Math.floor(Math.random() * 4)],
      };
      pieces.push(piece);
    }
    confettiPieces.current = pieces;
  }, [isPositive]);

  const renderConfettiPiece = (piece) => {
    const baseStyle = {
      position: 'fixed',
      top: '-10vh',
      left: `${piece.x}vw`,
      fontSize: piece.scale * (isPositive ? 2.8 : 2.4) + 'rem',
      pointerEvents: 'none',
      zIndex: 4000,
      filter: isPositive ? 'drop-shadow(0 0 8px rgba(255,215,0,0.6))' : 'drop-shadow(0 0 6px rgba(255,0,0,0.4))',
    };

    const emojiMap = {
      flower: '🌸',
      bouquet: '💐',
      star: '⭐',
      sparkle: '✨',
      glass: '🔨',
      heart: '💔',
      crack: '⚡',
      shatter: '💥',
    };

    return (
      <motion.div
        key={piece.id}
        initial={{ y: 0, opacity: 1, rotate: 0, x: 0, scale: piece.scale }}
        animate={{
          y: window.innerHeight + 100,
          opacity: 0,
          rotate: piece.rotation,
          x: piece.swayAmount,
          scale: piece.scale * 0.5,
        }}
        transition={{
          duration: piece.duration,
          delay: piece.delay,
          ease: 'easeIn',
          x: { duration: piece.duration * 0.7, ease: 'easeInOut' },
        }}
        style={baseStyle}
      >
        {emojiMap[piece.type]}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      {confettiPieces.current.map((piece) => renderConfettiPiece(piece))}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── POINTS BADGE (CENTERED AT BOTTOM) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function PointsBadge({ points, studentName, isPositive, studentAvatar, behaviorEmoji }) {
  // apply gradient only when in light mode; dark mode uses transparent
  const { isDark } = useTheme();
  const bg = isDark
    ? 'transparent'
    : isPositive
    ? 'linear-gradient(135deg, #FFD700 0%, #FF9800 100%)'
    : 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)';

  const displayAvatar = studentAvatar || boringAvatar(studentName || 'Student', 'boy');

  const badgeStyle = {
    position: 'absolute',
    bottom: '5vh',
    left: 'calc(35% - 20px)',
    top: 'auto',
    right: 'auto',
    transform: 'translateX(-50%)',
    background: bg,
    borderRadius: 32,
    padding: '19px 40px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 30,
    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
    zIndex: 4005,
    minWidth: 'auto',
    maxWidth: '70vw',
    width: 'clamp(200px, 45vw, 500px)',
    border: '4px solid rgba(255,255,255,0.4)',
    margin: '0 auto',
  };

  return (
    <motion.div
      initial={{ scale: 0, y: 60, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: -40, opacity: 0 }}
      transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.2 }}
      style={badgeStyle}
    >
      {/* Avatar - Far Left (animated, 40% larger) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.4, 1] }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.6 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}
      >
        <img
          src={displayAvatar}
          alt={studentName || 'Student'}
          style={{ width: '112px', height: '112px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0 }}
        />
        <span style={{ fontSize: '48px', lineHeight: 1 }}>{behaviorEmoji}</span>
      </motion.div>

      {/* Points - Middle */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: '0 0 auto' }}>
        <motion.span
          animate={{ scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.3 }}
          style={{ color: '#fff', fontWeight: 950, fontSize: 'clamp(48px, 8vw, 80px)', lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          {isPositive ? `+${points}` : points}
        </motion.span>
      </div>

      {/* Name - Far Right */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: 'fit-content', flex: '0 1 auto' }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(18px, 3vw, 26px)', textShadow: '0 2px 8px rgba(0,0,0,0.2)', textAlign: 'right' }}>
          {studentName}
        </span>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── 2D SPRITE SYSTEM ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// [Simplified version of the 2D sprite system from PointAnimation-old.jsx]
// (Includes AnimatedSprite, SpeechBubble, and character definitions)

const CHARACTERS = [
  { id: 'cat', src: catSpriteSheet, mood: 'positive', labels: ['MEOW! 🐱', 'PURRR! 😻'] },
  { id: 'dino', src: dinoSpriteSheet, mood: 'positive', labels: ['RAWR! 🦖', 'ROAR! 🌋'] },
  { id: 'plane', src: planeSpriteSheet, mood: 'positive', labels: ['ZOOM! ✈️', 'SKY HIGH! 🌤️'] },
  { id: 'dead-cat', src: deadCatSpriteSheet, mood: 'negative', labels: ['DEFEATED... 😵', 'NOOO! 😭'] },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export const PointAnimation = ({
  isVisible,
  studentAvatar,
  studentName,
  points = 1,
  behaviorEmoji = '⭐',
  onComplete,
}) => {
  const isPositive = points > 0;
  const [internalVisible, setInternalVisible] = useState(false);
  const timerRef = useRef(null);
  const animationDuration = 1500;

  useEffect(() => {
    if (isVisible) {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Show badge
      setInternalVisible(true);

      // Set timer to hide badge
      timerRef.current = setTimeout(() => {
        setInternalVisible(false);
        if (onComplete) onComplete();
      }, animationDuration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, animationDuration, onComplete]);

  const content = (
    <AnimatePresence>
      {internalVisible && (
        <>
          <AdvancedConfetti isPositive={isPositive} />
          <PointsBadge
            points={points}
            studentName={studentName || 'Student'}
            isPositive={isPositive}
            studentAvatar={studentAvatar}
            behaviorEmoji={behaviorEmoji}
          />
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default PointAnimation;