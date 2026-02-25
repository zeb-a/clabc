import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState, useMemo, useRef } from 'react';
import { boringAvatar } from '../utils/avatar';

// ─── Character assets ────────────────────────────────────────────────────────
import monkeyImg    from '../assets/characters/monkey_thumbsup.png';
import pigImg       from '../assets/characters/pig_celebrate.png';
import frogImg      from '../assets/characters/frog_wow.png';
import dogImg       from '../assets/characters/dog_sad.png';
import owlImg       from '../assets/characters/owl_disappointed.png';
// Sprite characters
import dinoSpriteSheet   from '../assets/characters/Dino_spritesheet.png';
// import dollSprite   from '../assets/characters/doll_sprite.png';
// import pigSprite    from '../assets/characters/pig_sprite.png';
import planeSpriteSheet  from '../assets/characters/plane_spritesheet.png';
import catSpriteSheet from '../assets/characters/cat_spritesheet.png';
import slideCatSpriteSheet from '../assets/characters/slide_cat_spritesheet.png';
import jumpIdleRunCatSpriteSheet from '../assets/characters/Jump_Idle_run-cat-spritesheet.png';
import fallCatSpriteSheet from '../assets/characters/Fall_sprite-spritesheet.png';
import deadCatSpriteSheet from '../assets/characters/dead_cat-spritesheet.png';

// ─── Plane sprite frames ───────────────────────────────────────────────────────
const PLANE_FRAMES = [
  { id: 'Shoot 5', x: 0,     y: 1096, width: 443, height: 302 },
  { id: 'Shoot 4', x: 444,   y: 1096, width: 443, height: 302 },
  { id: 'Shoot 3', x: 888,   y: 1096, width: 443, height: 302 },
  { id: 'Shoot 2', x: 0,     y: 1399, width: 443, height: 302 },
  { id: 'Shoot 1', x: 444,   y: 1399, width: 443, height: 302 },
  { id: 'Fly 2',   x: 888,   y: 1399, width: 443, height: 302 },
  { id: 'Fly 1',   x: 1461,  y: 0,     width: 443, height: 302 },
  { id: 'BG',      x: 0,     y: 0,     width: 1460, height: 1095 },
];

// ─── Dino sprite frames ───────────────────────────────────────────────────────
const DINO_FRAMES = [
  { id: 'Walk 9',  x: 0,     y: 0,     width: 680, height: 472 },
  { id: 'Walk 8',  x: 0,     y: 473,   width: 680, height: 472 },
  { id: 'Walk 7',  x: 681,   y: 0,     width: 680, height: 472 },
  { id: 'Walk 6',  x: 681,   y: 473,   width: 680, height: 472 },
  { id: 'Walk 5',  x: 0,     y: 946,   width: 680, height: 472 },
  { id: 'Walk 4',  x: 681,   y: 946,   width: 680, height: 472 },
  { id: 'Walk 3',  x: 0,     y: 1419,  width: 680, height: 472 },
  { id: 'Walk 2',  x: 681,   y: 1419,  width: 680, height: 472 },
  { id: 'Walk 10', x: 1362,  y: 0,     width: 680, height: 472 },
  { id: 'Walk 1',  x: 1362,  y: 473,   width: 680, height: 472 },
  { id: 'Run 8',   x: 1362,  y: 946,   width: 680, height: 472 },
  { id: 'Run 7',   x: 1362,  y: 1419,  width: 680, height: 472 },
  { id: 'Run 6',   x: 0,     y: 1892,  width: 680, height: 472 },
  { id: 'Run 5',   x: 681,   y: 1892,  width: 680, height: 472 },
  { id: 'Run 4',   x: 1362,  y: 1892,  width: 680, height: 472 },
  { id: 'Run 3',   x: 2043,  y: 0,     width: 680, height: 472 },
  { id: 'Run 2',   x: 2043,  y: 473,   width: 680, height: 472 },
  { id: 'Run 1',   x: 2043,  y: 946,   width: 680, height: 472 },
  { id: 'Jump 9',  x: 2043,  y: 1419,  width: 680, height: 472 },
  { id: 'Jump 8',  x: 2043,  y: 1892,  width: 680, height: 472 },
  { id: 'Jump 7',  x: 0,     y: 2365,  width: 680, height: 472 },
  { id: 'Jump 6',  x: 681,   y: 2365,  width: 680, height: 472 },
  { id: 'Jump 5',  x: 1362,  y: 2365,  width: 680, height: 472 },
  { id: 'Jump 4',  x: 2043,  y: 2365,  width: 680, height: 472 },
  { id: 'Jump 3',  x: 0,     y: 2838,  width: 680, height: 472 },
  { id: 'Jump 2',  x: 681,   y: 2838,  width: 680, height: 472 },
  { id: 'Jump 12', x: 1362,  y: 2838,  width: 680, height: 472 },
  { id: 'Jump 11', x: 2043,  y: 2838,  width: 680, height: 472 },
  { id: 'Jump 10', x: 2724,  y: 0,     width: 680, height: 472 },
  { id: 'Jump 1',  x: 2724,  y: 473,   width: 680, height: 472 },
  { id: 'Idle 1',  x: 2724,  y: 946,   width: 680, height: 472 },
  { id: 'Idle 9',  x: 2724,  y: 1419,  width: 680, height: 472 },
  { id: 'Idle 8',  x: 2724,  y: 1892,  width: 680, height: 472 },
  { id: 'Idle 7',  x: 2724,  y: 2365,  width: 680, height: 472 },
  { id: 'Idle 6',  x: 2724,  y: 2838,  width: 680, height: 472 },
  { id: 'Idle 5',  x: 0,     y: 3311,  width: 680, height: 472 },
  { id: 'Idle 4',  x: 681,   y: 3311,  width: 680, height: 472 },
  { id: 'Idle 3',  x: 1362,  y: 3311,  width: 680, height: 472 },
  { id: 'Idle 2',  x: 2043,  y: 3311,  width: 680, height: 472 },
  { id: 'Idle 10', x: 2724,  y: 3311,  width: 680, height: 472 },
];

// ─── Dead cat sprite frames ───────────────────────────────────────────────────
const DEAD_CAT_FRAMES = [
  { id: 'Dead (10)', x: 0,     y: 0,     width: 556, height: 504 },
  { id: 'Dead (9)',  x: 0,     y: 505,   width: 556, height: 504 },
  { id: 'Dead (8)',  x: 557,   y: 0,     width: 556, height: 504 },
  { id: 'Dead (7)',  x: 557,   y: 505,   width: 556, height: 504 },
  { id: 'Dead (6)',  x: 0,     y: 1010,  width: 556, height: 504 },
  { id: 'Dead (5)',  x: 557,   y: 1010,  width: 556, height: 504 },
  { id: 'Dead (4)',  x: 1114,  y: 0,     width: 556, height: 504 },
  { id: 'Dead (3)',  x: 1114,  y: 505,   width: 556, height: 504 },
  { id: 'Dead (2)',  x: 1114,  y: 1010,  width: 556, height: 504 },
  { id: 'Dead (1)',  x: 0,     y: 1515,  width: 556, height: 504 },
];

// ─── Character definitions ───────────────────────────────────────────────────
// Each character has:
//   src        – imported image
//   mood       – 'positive' | 'negative'
//   startSide  – which screen edge it starts from ('left'|'right')
//   labels     – fun reaction text shown in the speech bubble
//   bobAnim    – framer-motion animate object for the idle bob while on screen
//   color      – accent color for the speech bubble
//   walkAnim   – walking animation (bobbing side-to-side)
//   runAnim    – running animation (faster, more energetic)

// ─── Cat sprite frames ─────────────────────────────────────────────────────────
const CAT_SPRITE_FRAMES = [
  { id: 'sprite10', x: 1186, y: 23,   width: 287, height: 428 },
  { id: 'sprite11', x: 100,  y: 24,   width: 287, height: 430 },
  { id: 'sprite12', x: 645,  y: 26,   width: 287, height: 434 },
  { id: 'sprite13', x: 100,  y: 499,  width: 287, height: 430 },
  { id: 'sprite14', x: 1188, y: 500,  width: 287, height: 433 },
  { id: 'sprite15', x: 648,  y: 502,  width: 287, height: 435 },
  { id: 'sprite16', x: 643,  y: 973,  width: 287, height: 427 },
  { id: 'sprite17', x: 102,  y: 975,  width: 287, height: 432 },
  { id: 'sprite18', x: 1188, y: 976,  width: 287, height: 434 },
  { id: 'sprite19', x: 105,  y: 1452, width: 287, height: 435 },
];

// ─── Slide cat sprite frames ───────────────────────────────────────────────────
const SLIDE_CAT_FRAMES = [
  { id: 'Slide 9',  x: 0,     y: 0,     width: 542, height: 474 },
  { id: 'Slide 8',  x: 0,     y: 475,   width: 542, height: 474 },
  { id: 'Slide 7',  x: 543,   y: 0,     width: 542, height: 474 },
  { id: 'Slide 6',  x: 543,   y: 475,   width: 542, height: 474 },
  { id: 'Slide 5',  x: 0,     y: 950,   width: 542, height: 474 },
  { id: 'Slide 4',  x: 543,   y: 950,   width: 542, height: 474 },
  { id: 'Slide 3',  x: 1086,  y: 0,     width: 542, height: 474 },
  { id: 'Slide 2',  x: 1086,  y: 475,   width: 542, height: 474 },
  { id: 'Slide 10', x: 1086,  y: 950,   width: 542, height: 474 },
  { id: 'Slide 1',  x: 0,     y: 1425,  width: 542, height: 474 },
];

// ─── Jump/Idle/Run cat sprite frames ─────────────────────────────────────────────
const JUMP_IDLE_RUN_CAT_FRAMES = [
  { id: 'Run 8',  x: 0,     y: 0,     width: 542, height: 474 },
  { id: 'Run 7',  x: 0,     y: 474,   width: 542, height: 474 },
  { id: 'Run 6',  x: 542,   y: 0,     width: 542, height: 474 },
  { id: 'Run 5',  x: 542,   y: 474,   width: 542, height: 474 },
  { id: 'Run 4',  x: 0,     y: 948,   width: 542, height: 474 },
  { id: 'Run 3',  x: 542,   y: 948,   width: 542, height: 474 },
  { id: 'Run 2',  x: 1084,  y: 0,     width: 542, height: 474 },
  { id: 'Run 1',  x: 1084,  y: 474,   width: 542, height: 474 },
  { id: 'Jump 8',  x: 1084,  y: 948,   width: 542, height: 474 },
  { id: 'Jump 7',  x: 0,     y: 1422,  width: 542, height: 474 },
  { id: 'Jump 6',  x: 542,   y: 1422,  width: 542, height: 474 },
  { id: 'Jump 5',  x: 1084,  y: 1422,  width: 542, height: 474 },
  { id: 'Jump 4',  x: 1626,  y: 0,     width: 542, height: 474 },
  { id: 'Jump 3',  x: 1626,  y: 474,   width: 542, height: 474 },
  { id: 'Jump 2',  x: 1626,  y: 948,   width: 542, height: 474 },
  { id: 'Jump 1',  x: 1626,  y: 1422,  width: 542, height: 474 },
  { id: 'Idle 9',  x: 0,     y: 1896,  width: 542, height: 474 },
  { id: 'Idle 8',  x: 542,   y: 1896,  width: 542, height: 474 },
  { id: 'Idle 7',  x: 1084,  y: 1896,  width: 542, height: 474 },
  { id: 'Idle 6',  x: 1626,  y: 1896,  width: 542, height: 474 },
  { id: 'Idle 5',  x: 2168,  y: 0,     width: 542, height: 474 },
  { id: 'Idle 4',  x: 2168,  y: 474,   width: 542, height: 474 },
  { id: 'Idle 3',  x: 2168,  y: 948,   width: 542, height: 474 },
  { id: 'Idle 2',  x: 2168,  y: 1422,  width: 542, height: 474 },
  { id: 'Idle 10', x: 2168,  y: 1896,  width: 542, height: 474 },
  { id: 'Idle 1',  x: 0,     y: 2370,  width: 542, height: 474 },
];

// ─── Fall cat sprite frames ───────────────────────────────────────────────────────
const FALL_CAT_FRAMES = [
  { id: 'Fall (1)', x: 0,     y: 0,     width: 542, height: 474 },
  { id: 'Fall (8)', x: 0,     y: 475,   width: 542, height: 474 },
  { id: 'Fall (7)', x: 543,   y: 0,     width: 542, height: 474 },
  { id: 'Fall (6)', x: 543,   y: 475,   width: 542, height: 474 },
  { id: 'Fall (5)', x: 0,     y: 950,   width: 542, height: 474 },
  { id: 'Fall (4)', x: 543,   y: 950,   width: 542, height: 474 },
  { id: 'Fall (3)', x: 1086,  y: 0,     width: 542, height: 474 },
  { id: 'Fall (2)', x: 1086,  y: 475,   width: 542, height: 474 },
];

const CHARACTERS = [
  {
    id: 'cat',
    src: catSpriteSheet,
    slideSrc: slideCatSpriteSheet,
    isSprite: true,
    frames: CAT_SPRITE_FRAMES,
    slideFrames: SLIDE_CAT_FRAMES,
    mood: 'positive',
    startSide: 'left',
    labels: ['MEOW! 🐱', 'PURRR! 😻', 'CAT CHARM! ✨', 'FELINE POWER! 🐈'],
    color: '#9C27B0',
    bobAnim: {
      y: [0, -12, 0, -8, 0],
      rotate: [0, -3, 3, -2, 0],
      scale: [1, 1.04, 1, 1.02, 1],
    },
    walkAnim: {
      y: [0, -6, 0, -4, 0],
      rotate: [0, -2, 2, -1, 0],
      scale: [1, 1.02, 1, 1.01, 1],
    },
    runAnim: {
      y: [0, -15, 0, -10, 0],
      rotate: [0, -5, 5, -3, 0],
      scale: [1, 1.08, 1, 1.05, 1],
    },
  },
  {
    id: 'cat-jump',
    src: jumpIdleRunCatSpriteSheet,
    slideSrc: jumpIdleRunCatSpriteSheet,
    isSprite: true,
    frames: JUMP_IDLE_RUN_CAT_FRAMES,
    slideFrames: JUMP_IDLE_RUN_CAT_FRAMES,
    mood: 'positive',
    startSide: 'center',
    labels: ['WOW! 🌟', 'AMAZING! ⚡', 'SUPER! 🚀', 'FANTASTIC! 🏆'],
    color: '#FF9800',
    bobAnim: {
      y: [0, -8, 0],
      rotate: [0, -2, 0],
      scale: [1, 1.03, 1],
    },
    walkAnim: {
      y: [0, -4, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.02, 1],
    },
    runAnim: {
      y: [0, -12, 0],
      rotate: [0, -3, 0],
      scale: [1, 1.05, 1],
    },
  },
  {
    id: 'cat-fall',
    src: fallCatSpriteSheet,
    slideSrc: fallCatSpriteSheet,
    isSprite: true,
    frames: FALL_CAT_FRAMES,
    slideFrames: FALL_CAT_FRAMES,
    mood: 'negative',
    startSide: 'center',
    labels: ['OH NO! 😱', 'OUCH! 😿', 'OOPS! 😰', 'FALLING! 😵'],
    color: '#FF6B6B',
    bobAnim: {
      y: [0, -5, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.02, 1],
    },
    walkAnim: {
      y: [0, -3, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.01, 1],
    },
    runAnim: {
      y: [0, -8, 0],
      rotate: [0, -2, 0],
      scale: [1, 1.03, 1],
    },
  },
  {
    id: 'dino',
    src: dinoSpriteSheet,
    slideSrc: dinoSpriteSheet,
    isSprite: true,
    frames: DINO_FRAMES,
    slideFrames: DINO_FRAMES,
    mood: 'positive',
    startSide: 'left',
    labels: ['RAWR! 🦖', 'DINO POWER! 💪', 'ROAR! 🌋', 'PREHISTORIC! 🦕'],
    color: '#2ECC71',
    bobAnim: {
      y: [0, -10, 0],
      rotate: [0, -2, 0],
      scale: [1, 1.04, 1],
    },
    walkAnim: {
      y: [0, -5, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.02, 1],
    },
    runAnim: {
      y: [0, -15, 0],
      rotate: [0, -3, 0],
      scale: [1, 1.06, 1],
    },
  },
  {
    id: 'plane',
    src: planeSpriteSheet,
    slideSrc: planeSpriteSheet,
    isSprite: true,
    frames: PLANE_FRAMES,
    slideFrames: PLANE_FRAMES,
    mood: 'positive',
    startSide: 'left',
    labels: ['ZOOM! ✈️', 'SKY HIGH! 🌤️', 'SOARING! ☁️', 'FLYING! 🦅'],
    color: '#3498DB',
    bobAnim: {
      y: [0, -5, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.03, 1],
    },
    walkAnim: {
      y: [0, -3, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.02, 1],
    },
    runAnim: {
      y: [0, -8, 0],
      rotate: [0, -2, 0],
      scale: [1, 1.05, 1],
    },
  },
  {
    id: 'dead-cat',
    src: deadCatSpriteSheet,
    slideSrc: deadCatSpriteSheet,
    isSprite: true,
    frames: DEAD_CAT_FRAMES,
    slideFrames: DEAD_CAT_FRAMES,
    mood: 'negative',
    startSide: 'center',
    labels: ['DEFEATED... 😵', 'GAME OVER! 💀', 'NOOO! 😭', 'ELIMINATED! ☠️'],
    color: '#2D3436',
    bobAnim: {
      y: [0, -2, 0],
      rotate: [0, -1, 0],
      scale: [1, 1.01, 1],
    },
  },
];

// ─── Animated Sprite Component ─────────────────────────────────────────────────
function AnimatedSprite({
  spriteSheet,
  slideSpriteSheet,
  frames,
  slideFrames,
  animationPhase,
  startSide,
  charId,
}) {
  const [currentFrame, setCurrentFrame] = useState(0);

  // For cat-jump and dino, use different frame ranges for different phases
  const getFramesForPhase = (phase) => {
    if (charId === 'cat-jump') {
      if (phase === 'jump') return frames.slice(8, 16); // Jump 8-1
      if (phase === 'idle') return frames.slice(16, 25); // Idle 9-1
      if (phase === 'run') return frames.slice(0, 8); // Run 8-1
    }
    if (charId === 'dino') {
      if (phase === 'jump') return frames.slice(18, 30); // Jump 9-1 (frames 18-29)
      if (phase === 'idle') return frames.slice(30, 39); // Idle 1-10 (frames 30-39)
      if (phase === 'run') return frames.slice(10, 18); // Run 8-1 (frames 10-17)
    }
    if (charId === 'plane') {
      if (phase === 'jump') return frames.slice(5, 7); // Fly frames
      if (phase === 'idle') return frames.slice(5, 7); // Fly frames
      if (phase === 'run') return frames.slice(0, 5); // Shoot frames
    }
    if (charId === 'cat-fall') {
      return frames; // All frames for falling
    }
    if (charId === 'dead-cat') {
      return frames; // All frames for dead animation
    }
    // For other characters
    return phase === 'slide' ? slideFrames : frames;
  };

  const currentFrames = getFramesForPhase(animationPhase);
  const frameCount = currentFrames.length;
  const isJumpSequence = charId === 'cat-jump' || charId === 'dino' || charId === 'plane';
  const isFallSequence = charId === 'cat-fall';

  useEffect(() => {
    let interval;

    // Reset frame to 0 when phase changes
    setCurrentFrame(0);

    if (frameCount > 0) {
      const speed = isJumpSequence && animationPhase === 'run' ? 150 : // Run faster
                       isJumpSequence ? 200 : // Jump/Idle medium speed
                       isFallSequence ? 150 : // Fall fast
                       animationPhase === 'slide' ? 200 : 400; // Default

      interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frameCount);
      }, speed);
    }

    return () => clearInterval(interval);
  }, [frames, slideFrames, animationPhase, charId, frameCount, isJumpSequence, isFallSequence]);

  const currentSheet = isJumpSequence || isFallSequence ? spriteSheet :
                     (animationPhase === 'slide' ? slideSpriteSheet : spriteSheet);
  const frame = currentFrames[currentFrame];
  const scale = charId === 'dino' || charId.startsWith('cat') || charId === 'plane' ? 1.0 : 0.5; // Dino, cats, and plane are double the size

  return (
    <div
      style={{
        width: `${frame.width}px`,
        height: `${frame.height}px`,
        position: 'relative',
        overflow: 'hidden',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      <img
        src={currentSheet}
        alt="animated sprite"
        style={{
          position: 'absolute',
          left: `-${frame.x}px`,
          top: `-${frame.y}px`,
          transform: startSide === 'right' ? 'scaleX(-1)' : 'none',
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

// ─── Animation stages: Walk → Slide → Exit ───────────────────────────────────────
function getCrossScreenVariants(startSide) {
  const startX = startSide === 'left' ? '-140%' : '140%';
  const isCenter = startSide === 'center';

  return {
    hidden: { x: isCenter ? '0%' : startX, y: '0%', opacity: 0 },
    walk: {
      x: '0%',  // Walk to center horizontally
      opacity: 1,
      transition: { type: 'spring', damping: 20, stiffness: 50, duration: 2 }  // Walk to center: 2 seconds
    },
    run: {
      x: '0%',  // Stay at center horizontally
      y: isCenter ? ['0%', '50%', '150%'] : '0%',  // For center: run towards screen
      opacity: 1,
      transition: { type: 'spring', damping: 20, stiffness: 60, duration: 2 }
    },
    jump: {
      x: '0%',  // Stay at center horizontally
      opacity: 1,
      transition: { type: 'spring', damping: 20, stiffness: 50, duration: 1 }
    },
    idle: {
      x: '0%',  // Stay at center horizontally
      opacity: 1,
      transition: { type: 'spring', damping: 20, stiffness: 50, duration: 1 }
    },
    slide: {
      x: '0%',  // Stay at center horizontally
      y: ['0%', '150%'],  // Slide from top (0%) to bottom (150%)
      opacity: 1,
      transition: { type: 'spring', damping: 20, stiffness: 8, duration: 6 }  // Slide down: slow and smooth
    },
    exit: { x: '0%', y: '150%', opacity: 0 }
  };
}

// ─── Confetti particle ────────────────────────────────────────────────────────
const CONFETTI_EMOJIS = ['🎉', '✨', '🌟', '💫', '⭐', '🎊', '🏆', '💥'];
const SAD_EMOJIS = ['😢', '😭', '💔', '😞', '😔', '🥀', '⛈️', '💧'];
function ConfettiParticle({ index, total, isPositive }) {
  const x = `${(index / total) * 100}vw`;
  const delay = index * 0.12;
  const size = 22 + (index % 3) * 8;
  const emojis = isPositive ? CONFETTI_EMOJIS : SAD_EMOJIS;
  return (
    <motion.div
      initial={{ y: isPositive ? '-10vh' : '110vh', x, opacity: 0, rotate: 0 }}
      animate={{ y: isPositive ? '110vh' : '-10vh', opacity: [0, 1, 1, 0], rotate: 360 * (index % 2 === 0 ? 1 : -1) }}
      transition={{ duration: 2.2, delay, ease: 'linear' }}
      style={{ position: 'fixed', top: 0, fontSize: size, pointerEvents: 'none', zIndex: 4001 }}
    >
      {emojis[index % emojis.length]}
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
function PointsBadge({ points, studentName, isPositive, studentAvatar, behaviorEmoji }) {
  const bg = isPositive
    ? 'linear-gradient(135deg, #FFD700 0%, #FF9800 100%)'
    : 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)';

  // Generate default avatar if none provided
  const displayAvatar = studentAvatar || boringAvatar(studentName || 'Student', 'boy');

  return (
    <motion.div
      initial={{ scale: 0, y: 60, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: -40, opacity: 0 }}
      transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.2 }}
      style={{
        position: 'fixed',
        bottom: '2vh',
        left: '50%',
        transform: 'translateX(-50%)',
        background: bg,
        borderRadius: 32,
        padding: '20px 60px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        zIndex: 4005,
        minWidth: 600,
        border: `4px solid rgba(255,255,255,0.4)`,
      }}
    >
      {/* Student avatar with emoji */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src={displayAvatar}
          alt={studentName || 'Student'}
          style={{
            width: '122px',
            height: '122px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid rgba(255,255,255,0.5)',
          }}
        />
        <span style={{ fontSize: '61px' }}>{behaviorEmoji}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(24px, 4vw, 34px)', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          {studentName}
        </span>
        <motion.span
          animate={{ scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.3 }}
          style={{ color: '#fff', fontWeight: 950, fontSize: 'clamp(64px, 10vw, 110px)', lineHeight: 1, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
          {isPositive ? `+${points}` : points}
        </motion.span>
      </div>
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
  const timersRef = useRef([]);
  const animationStartedRef = useRef(false);
  const [animationPhase, setAnimationPhase] = useState('hidden');
  const [internalVisible, setInternalVisible] = useState(false); // Keep animation visible until it completes

  // Only respond to visibility changes, not to isPositive changes
  useEffect(() => {
    if (isVisible && !animationStartedRef.current) {
      animationStartedRef.current = true;
      setInternalVisible(true); // Keep animation visible internally

      // For 3 points, use cat-jump specifically. For -1 point, use cat-fall. For -3 points, use dead-cat.
      // For positive points, dino can appear randomly.
      let picked;
      if (isPositive && Math.abs(points) === 3) {
        // Randomly choose between cat-jump and dino for 3 points
        const specialChars = CHARACTERS.filter(c => c.id === 'cat-jump' || c.id === 'dino');
        picked = specialChars[Math.floor(Math.random() * specialChars.length)];
      } else if (!isPositive && Math.abs(points) === 1) {
        picked = CHARACTERS.find(c => c.id === 'cat-fall');
      } else if (!isPositive && Math.abs(points) === 3) {
        picked = CHARACTERS.find(c => c.id === 'dead-cat');
      } else {
        const pool = CHARACTERS.filter(c => c.mood === (isPositive ? 'positive' : 'negative'));
        picked = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
      }

      // Fallback if no character found
      if (!picked) {
        picked = CHARACTERS[0]; // Default to first character
      }

      characterRef.current = picked;
      labelRef.current = picked.labels[Math.floor(Math.random() * picked.labels.length)];

      // Determine animation sequence based on points and character
      let targetPhase;
      if (picked.id === 'cat-jump' || picked.id === 'dino' || picked.id === 'plane') {
        // Jump → Idle → Run sequence
        targetPhase = 'jump';
      } else if (picked.id === 'cat-fall') {
        // Fall animation sequence
        targetPhase = 'fall';
      } else if (picked.id === 'dead-cat') {
        // Dead animation - just play frames
        targetPhase = 'walk';
      } else {
        // Use walk for 1 point, slide for 2+ points
        targetPhase = Math.abs(points) === 1 ? 'walk' : 'slide';
      }

      // Start animation immediately without hidden phase
      setAnimationPhase(targetPhase);

      // For cat-jump and dino: Jump x3 (3s total) → Idle (1s) → Run (2s) → Exit
      // For plane: Shoot then Fly across screen from left to right
      if (picked && picked.id === 'plane') {
        const t1 = setTimeout(() => {
          setAnimationPhase('idle'); // Switch to flying
        }, 2000); // Shoot for 2 seconds
        timersRef.current.push(t1);

        const t2 = setTimeout(() => {
          setAnimationPhase('exit');
          animationStartedRef.current = false; // Reset for next animation
        }, 6000); // Fly for 4 seconds
        timersRef.current.push(t2);
      } else if (picked && (picked.id === 'cat-jump' || picked.id === 'dino')) {
        const t1 = setTimeout(() => {
          setAnimationPhase('idle');
        }, 3000); // Jump for 3 seconds (3 jumps)
        timersRef.current.push(t1);

        const t2 = setTimeout(() => {
          setAnimationPhase('run');
        }, 4000); // Idle for 1 second
        timersRef.current.push(t2);

        const t3 = setTimeout(() => {
          setAnimationPhase('exit');
          animationStartedRef.current = false; // Reset for next animation
        }, 6000); // Run for 2 seconds
        timersRef.current.push(t3);
      } else if (picked && picked.id === 'cat-fall') {
        // Fall from top → center → bottom (2 stages)
        const t1 = setTimeout(() => {
          setAnimationPhase('fall2');
        }, 2000); // Fall to center in 2 seconds
        timersRef.current.push(t1);

        const t2 = setTimeout(() => {
          setAnimationPhase('exit');
          animationStartedRef.current = false; // Reset for next animation
        }, 4000); // Fall from center to bottom in 2 seconds
        timersRef.current.push(t2);
      } else {
        // Standard timing: 1 point: 2s walk, 2+ points: 6s slide
        const t1 = setTimeout(() => {
          setAnimationPhase('exit');
          animationStartedRef.current = false; // Reset for next animation
        }, Math.abs(points) === 1 ? 2100 : 6100);
        timersRef.current.push(t1);
      }
    }

    // Don't clear timers when isVisible becomes false during animation
    // Let the animation complete naturally via Timer 1
    if (!isVisible && !animationStartedRef.current) {
      // Only reset if animation hasn't started yet
      animationStartedRef.current = false;
    }
  }, [isVisible, points]); // Depend on isVisible and points

  // Hide animation internally when it reaches exit phase
  useEffect(() => {
    if (animationPhase === 'exit') {
      // Wait for exit animation to complete before hiding
      setTimeout(() => {
        setInternalVisible(false);
      }, 500);
    }
  }, [animationPhase]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const char = characterRef.current;
  const startSide = char?.startSide ?? 'left';
  const variants = useMemo(() => getCrossScreenVariants(startSide), [startSide]);

  // Get current character animation based on phase
  const getCurrentAnim = () => {
    switch (animationPhase) {
      case 'walk': return char?.walkAnim || char?.bobAnim;
      case 'run': return char?.runAnim || char?.walkAnim || char?.bobAnim;
      case 'jump': return { y: [0, -80, 0], scale: [1, 1.1, 1] };  // Jump up and down (repeats 3 times)
      case 'idle': return { y: [0, -5, 0], rotate: [0, -2, 0], scale: [1, 1.02, 1] };  // Slight idle bounce
      case 'fall': return { rotate: [0, 10, -10, 0] };  // Tumble while falling
      case 'fall2': return { rotate: [0, -10, 10, 0] };  // Tumble while falling
      case 'slide': return { y: [0, -15, 0], x: [0, 5, -5, 0], scale: [1, 1.08, 1] };  // Wobble motion while sliding
      default: return char?.bobAnim;
    }
  };

  const currentCharAnim = getCurrentAnim();

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
  // Character moves horizontally across the screen, centered vertically
  const positionStyle = useMemo(() => {
    const isCenter = char?.startSide === 'center';
    const isPlane = char?.id === 'plane';
    return {
      position: 'fixed',
      zIndex: 4006,  // Higher than PointsBadge (4005) so character appears on top
      width: 'clamp(180px, 28vw, 360px)',
      height: 'auto',
      left: isPlane ? '-100vw' : (isCenter ? '35%' : '50%'),  // Plane starts off-screen on the left
      top: isPlane ? '5%' : (isCenter ? '50%' : '20vh'),  // Plane at very top
      transform: isPlane ? 'translateY(-50%)' : 'translateX(-50%)',
    };
  }, [char]);

  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {(() => {
        if (!internalVisible || !char) return null;

        return (
          <>
          {/* Confetti for positive, sad particles for negative */}
          {(animationPhase === 'walk' || animationPhase === 'slide' || animationPhase === 'run') && Array.from({ length: 10 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} total={10} isPositive={isPositive} />
          ))}

          {/* Character wrapper — walks across screen */}
          <motion.div
            key={`char-${points}-${animationPhase}`}
            initial={{ x: startSide === 'center' ? '0%' : (startSide === 'left' ? '-140%' : '140%'), y: '0%', opacity: 0 }}
            animate={animationPhase === 'hidden' ? { x: startSide === 'center' ? '0%' : (startSide === 'left' ? '-140%' : '140%'), y: '0%', opacity: 0 } :
                     animationPhase === 'walk' ? { x: '0%', opacity: 1 } :
                     animationPhase === 'run' ? { x: '0%', y: ['0%', '50%', '150%'], opacity: 1 } :
                     animationPhase === 'jump' ? { x: '0%', opacity: 1 } :
                     animationPhase === 'idle' ? { x: '0%', opacity: 1 } :
                     animationPhase === 'fall' ? { y: ['-50%', '0%'], opacity: 1 } :  // Fall from top to center
                     animationPhase === 'fall2' ? { y: ['0%', '150%'], opacity: 1 } :  // Fall from center to bottom
                     animationPhase === 'slide' ? { x: '0%', y: ['0%', '150%'], opacity: 1 } :
                     { x: '0%', y: '150%', opacity: 0 }}
            transition={animationPhase === 'slide' ? { type: 'spring', damping: 20, stiffness: 8, duration: 6 } :
                         animationPhase === 'run' ? { type: 'spring', damping: 20, stiffness: 60, duration: 2 } :
                         animationPhase === 'fall' || animationPhase === 'fall2' ? { type: 'spring', damping: 15, stiffness: 40, duration: 2 } :  // Fall timing
                         animationPhase === 'walk' ? { type: 'spring', damping: 20, stiffness: 50, duration: 2 } :
                         { duration: 0.3 }}
            style={{
              ...positionStyle,
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Character animation on the image itself */}
            <motion.div
              style={{ position: 'relative', display: 'inline-block' }}
              animate={char?.id === 'plane' && animationPhase === 'idle' ? { x: ['-100vw', '100vw'] } : currentCharAnim}
              transition={
                char?.id === 'plane' && animationPhase === 'idle'
                  ? { type: 'spring', damping: 20, stiffness: 30, duration: 4 }
                  : { duration: 1, repeat: animationPhase === 'jump' ? 3 : (animationPhase === 'walk' || animationPhase === 'slide' || animationPhase === 'run' || animationPhase === 'idle' || animationPhase === 'fall' || animationPhase === 'fall2' ? Infinity : 0), repeatType: 'loop', ease: 'easeInOut' }
              }
            >
              {char.isSprite ? (
                <AnimatedSprite
                  spriteSheet={char.src}
                  slideSpriteSheet={char.slideSrc}
                  frames={char.frames}
                  slideFrames={char.slideFrames}
                  animationPhase={animationPhase}
                  startSide={startSide}
                  charId={char.id}
                />
              ) : (
                <img
                  src={char.src}
                  alt={char.id}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    // flip right-side characters so they face movement direction
                    transform: startSide === 'right' ? 'scaleX(-1)' : 'none',
                    filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.22))',
                  }}
                />
              )}

              {/* Speech bubble */}
              <SpeechBubble
                text={labelRef.current}
                color={char.color}
                side={startSide}
              />
            </motion.div>
          </motion.div>

          {/* Points + name badge at bottom center */}
          {animationPhase !== 'hidden' && animationPhase !== 'exit' && (
            <PointsBadge
              points={points}
              studentName={isWholeClass ? 'Whole Class' : (studentName || 'Student')}
              isPositive={isPositive}
              studentAvatar={studentAvatar}
              behaviorEmoji={behaviorEmoji}
            />
          )}
          </>
        );
      })()}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
