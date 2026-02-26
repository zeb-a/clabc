/**
 * PointAnimation.jsx
 *
 * Renders the point-award overlay for ClassDashboard.
 *
 * ─── 3-D Panda (React Three Fiber) ──────────────────────────────────────────
 *
 * The Panda character is rendered in a fixed-position WebGL canvas that is
 * mounted ONCE at the app level via <PandaStage>.  It is never torn down or
 * re-created between page navigations.
 *
 * Animation map (driven by `points` prop):
 *   +1  → Wave          "Nice!"
 *   +2  → Jump          "Great job!"
 *   +3  → Yes (clap)    "Amazing work!"
 *   -1  → HitReact      "Try again!"
 *   -2  → No            "Oh nooo..."
 *   +5  → Run           "You are a superstar!"
 *   else→ Wave / HitReact (positive / negative fallback)
 *
 * ─── Existing sprite system ──────────────────────────────────────────────────
 * All original 2-D sprite characters (cat, dino, plane, etc.) are preserved
 * and still rendered alongside the 3-D panda for the PointsBadge and confetti.
 *
 * ─── Performance notes ───────────────────────────────────────────────────────
 *  • GLB is Draco-compressed (panda-draco.glb, ~394 KB)
 *  • Loaded inside <Suspense> — only fetched when the Canvas first mounts
 *  • useGLTF.preload() warms the cache before the first interaction
 *  • Canvas is rendered once; only triggerKey changes to fire new animations
 *  • Web Speech API provides spoken feedback (no external audio files needed)
 */

// ─── React / Framer ──────────────────────────────────────────────────────────
import {
  Suspense,
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  lazy,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ─── React Three Fiber ───────────────────────────────────────────────────────
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  useAnimations,
  ContactShadows,
  Environment,
} from '@react-three/drei';
import * as THREE from 'three';

// ─── Project utilities ───────────────────────────────────────────────────────
import { boringAvatar } from '../utils/avatar';

// ─── Character sprite assets ─────────────────────────────────────────────────
import monkeyImg    from '../assets/characters/monkey_thumbsup.png';
import pigImg       from '../assets/characters/pig_celebrate.png';
import frogImg      from '../assets/characters/frog_wow.png';
import dogImg       from '../assets/characters/dog_sad.png';
import owlImg       from '../assets/characters/owl_disappointed.png';
import dinoSpriteSheet   from '../assets/characters/Dino_spritesheet.png';
import planeSpriteSheet  from '../assets/characters/plane_spritesheet.png';
import catSpriteSheet from '../assets/characters/cat_spritesheet.png';
import slideCatSpriteSheet from '../assets/characters/slide_cat_spritesheet.png';
import jumpIdleRunCatSpriteSheet from '../assets/characters/Jump_Idle_run-cat-spritesheet.png';
import fallCatSpriteSheet from '../assets/characters/Fall_sprite-spritesheet.png';
import deadCatSpriteSheet from '../assets/characters/dead_cat-spritesheet.png';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── 3-D PANDA SYSTEM ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Animation config — maps point values to GLB animation names + phrases + colors.
 * The GLB animation names use a triple-prefix pattern from Blender export.
 */
const ANIM_PREFIX = 'CharacterArmature|CharacterArmature|CharacterArmature|';

const POINT_ANIM_MAP = {
  '1':  { anim: 'Wave',     phrase: 'Nice!',                color: '#4CAF50', duration: 2800 },
  '2':  { anim: 'Jump',     phrase: 'Great job!',           color: '#2196F3', duration: 2200 },
  '3':  { anim: 'Yes',      phrase: 'Amazing work!',        color: '#9C27B0', duration: 2600 },
  '5':  { anim: 'Run',      phrase: 'You are a superstar!', color: '#FF9800', duration: 3200 },
  '-1': { anim: 'HitReact', phrase: 'Try again!',           color: '#F44336', duration: 1800 },
  '-2': { anim: 'No',       phrase: 'Oh nooo...',           color: '#795548', duration: 2400 },
};

const FALLBACK_POS = { anim: 'Wave',     phrase: 'Nice!',      color: '#4CAF50', duration: 2500 };
const FALLBACK_NEG = { anim: 'HitReact', phrase: 'Try again!', color: '#F44336', duration: 2000 };
const IDLE_ANIM    = 'Idle';

/** Speak a phrase using the Web Speech API */
function speakPhrase(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate   = 1.05;
  utt.pitch  = 1.2;
  utt.volume = 0.9;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    /samantha|karen|google us english/i.test(v.name)
  );
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

// Configure Draco decoder path (files in /public/draco/)
useGLTF.setDecoderPath('/draco/');

// Pre-warm Draco GLB cache so it's ready before the first interaction
useGLTF.preload('/panda-draco.glb');

// ─── Camera rig: smooth angled view (not front-on static) ────────────────────
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(1.8, 1.6, 3.2);
    camera.lookAt(0, 0.8, 0);
  }, [camera]);
  return null;
}

// ─── Fallback mesh while GLB loads ───────────────────────────────────────────
function GlbLoadingFallback() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 1.5;
  });
  return (
    <mesh ref={meshRef} position={[0, 0.6, 0]}>
      <sphereGeometry args={[0.28, 20, 20]} />
      <meshStandardMaterial color="#b0b8c1" roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

// ─── Panda 3-D mesh (loaded inside Suspense) ─────────────────────────────────
function PandaMesh({ triggerKey, points, onAnimDone }) {
  const groupRef     = useRef();
  const breathPhase  = useRef(0);
  const currentAct   = useRef(null);

  const { scene, animations } = useGLTF('/panda-draco.glb', true);
  const { actions }           = useAnimations(animations, groupRef);

  // ── Stylize materials once ─────────────────────────────────────────────────
  useEffect(() => {
    scene.traverse(obj => {
      if (!obj.isMesh || !obj.material) return;
      const mat = obj.material;
      // Warm emissive boost for a rich, non-flat look
      if (!mat.emissive) mat.emissive = new THREE.Color(0x000000);
      mat.emissiveIntensity = 0.09;
      // Toon-ish PBR: low metalness, medium roughness
      if (mat.metalness !== undefined) mat.metalness = Math.min(mat.metalness, 0.12);
      if (mat.roughness !== undefined) mat.roughness = Math.max(mat.roughness, 0.52);
      mat.needsUpdate = true;
      obj.castShadow    = true;
      obj.receiveShadow = true;
    });
  }, [scene]);

  // ── Start idle on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const idleAct = actions[ANIM_PREFIX + IDLE_ANIM] || actions[IDLE_ANIM];
    if (idleAct) {
      idleAct.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      currentAct.current = idleAct;
    }
  }, [actions]);

  // ── Trigger animation on new point event ──────────────────────────────────
  useEffect(() => {
    if (triggerKey === null) return;

    const key    = String(points);
    const config = POINT_ANIM_MAP[key] || (points > 0 ? FALLBACK_POS : FALLBACK_NEG);
    const act    = actions[ANIM_PREFIX + config.anim] || actions[config.anim];

    if (!act) {
      console.warn('[PandaMesh] Animation not found:', config.anim);
      return;
    }

    // Crossfade from current → triggered animation
    if (currentAct.current && currentAct.current !== act) {
      currentAct.current.fadeOut(0.3);
    }
    act.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.3).play();
    currentAct.current = act;

    // Return to idle after the animation duration
    const timer = setTimeout(() => {
      act.fadeOut(0.4);
      const idleAct = actions[ANIM_PREFIX + IDLE_ANIM] || actions[IDLE_ANIM];
      if (idleAct) {
        idleAct.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
        currentAct.current = idleAct;
      }
      if (onAnimDone) onAnimDone();
    }, config.duration);

    return () => clearTimeout(timer);
  }, [triggerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle breathing via useFrame ────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    breathPhase.current += delta * 0.75;
    groupRef.current.position.y = Math.sin(breathPhase.current) * 0.004;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ─── 3-D Speech bubble (HTML overlay, positioned above the canvas) ────────────
function Panda3DSpeechBubble({ phrase, color, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={phrase + color}
          initial={{ opacity: 0, scale: 0.55, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.55, y: -12 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          style={{
            position: 'absolute',
            bottom: '102%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: color,
            color: '#fff',
            fontWeight: 800,
            fontSize: 'clamp(15px, 2vw, 24px)',
            padding: '10px 22px',
            borderRadius: 32,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
            pointerEvents: 'none',
            zIndex: 4021,
            letterSpacing: 0.5,
            textShadow: '0 2px 6px rgba(0,0,0,0.18)',
            border: '3px solid rgba(255,255,255,0.38)',
          }}
        >
          {phrase}
          {/* Downward tail */}
          <div style={{
            position: 'absolute',
            bottom: -13,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '11px solid transparent',
            borderRight: '11px solid transparent',
            borderTop: `13px solid ${color}`,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * PandaStage
 *
 * The single, persistent WebGL canvas for the Panda character.
 * Mount this ONCE at app level (e.g. inside LoggedInLayout in App.jsx).
 * It listens for a custom DOM event `panda:trigger` to fire animations
 * without needing React prop drilling.
 *
 * Usage from ClassDashboard (or any component):
 *   window.dispatchEvent(new CustomEvent('panda:trigger', { detail: { points: 2 } }))
 */
export function PandaStage() {
  const [triggerKey,    setTriggerKey]    = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [config,        setConfig]        = useState(FALLBACK_POS);
  const [points,        setPoints]        = useState(1);

  const fire = useCallback((pts) => {
    const key = String(pts);
    const cfg = POINT_ANIM_MAP[key] || (pts > 0 ? FALLBACK_POS : FALLBACK_NEG);
    setConfig(cfg);
    setPoints(pts);
    setTriggerKey(Date.now());
    setBubbleVisible(true);
    speakPhrase(cfg.phrase);
  }, []);

  // Listen for cross-component events
  useEffect(() => {
    const handler = (e) => fire(e.detail?.points ?? 1);
    window.addEventListener('panda:trigger', handler);
    return () => window.removeEventListener('panda:trigger', handler);
  }, [fire]);

  const handleAnimDone = useCallback(() => {
    setBubbleVisible(false);
  }, []);

  return createPortal(
    <div
      data-point-animation="true"
      style={{
        position: 'fixed',
        bottom: '4vh',
        right: '2vw',
        width: 'clamp(200px, 24vw, 360px)',
        height: 'clamp(260px, 32vw, 460px)',
        pointerEvents: 'none',
        zIndex: 4008,
        filter: 'drop-shadow(0 18px 36px rgba(0,0,0,0.16))',
      }}
    >
      {/* Speech bubble sits above the canvas */}
      <Panda3DSpeechBubble
        phrase={config.phrase}
        color={config.color}
        visible={bubbleVisible}
      />

      {/* WebGL Canvas — transparent background, renders once, never torn down */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 38 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <CameraRig />

        {/* Warm key light + cool fill for depth */}
        <ambientLight intensity={0.52} color="#fff8f0" />
        <directionalLight
          position={[4, 8, 5]}
          intensity={1.45}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={4}
          shadow-camera-bottom={-1}
          color="#fff5e0"
        />
        <directionalLight position={[-3, 2, -3]} intensity={0.28} color="#c0d8ff" />
        <pointLight position={[0, 4, 2]} intensity={0.38} color="#ffe0b0" />

        {/* PBR environment reflections */}
        <Environment preset="city" />

        {/* Soft contact shadow plane */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.42}
          scale={3.5}
          blur={2.4}
          far={3}
          color="#1a1a2e"
        />

        {/* Panda GLB — Suspense lazy-loads it only when this Canvas first mounts */}
        <Suspense fallback={<GlbLoadingFallback />}>
          <PandaMesh
            triggerKey={triggerKey}
            points={points}
            onAnimDone={handleAnimDone}
          />
        </Suspense>
      </Canvas>
    </div>,
    document.body
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── EXISTING 2-D SPRITE SYSTEM (unchanged) ───────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

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
  { id: 'Jump 8', x: 1084,  y: 948,   width: 542, height: 474 },
  { id: 'Jump 7', x: 0,     y: 1422,  width: 542, height: 474 },
  { id: 'Jump 6', x: 542,   y: 1422,  width: 542, height: 474 },
  { id: 'Jump 5', x: 1084,  y: 1422,  width: 542, height: 474 },
  { id: 'Jump 4', x: 1626,  y: 0,     width: 542, height: 474 },
  { id: 'Jump 3', x: 1626,  y: 474,   width: 542, height: 474 },
  { id: 'Jump 2', x: 1626,  y: 948,   width: 542, height: 474 },
  { id: 'Jump 1', x: 1626,  y: 1422,  width: 542, height: 474 },
  { id: 'Idle 9', x: 0,     y: 1896,  width: 542, height: 474 },
  { id: 'Idle 8', x: 542,   y: 1896,  width: 542, height: 474 },
  { id: 'Idle 7', x: 1084,  y: 1896,  width: 542, height: 474 },
  { id: 'Idle 6', x: 1626,  y: 1896,  width: 542, height: 474 },
  { id: 'Idle 5', x: 2168,  y: 0,     width: 542, height: 474 },
  { id: 'Idle 4', x: 2168,  y: 474,   width: 542, height: 474 },
  { id: 'Idle 3', x: 2168,  y: 948,   width: 542, height: 474 },
  { id: 'Idle 2', x: 2168,  y: 1422,  width: 542, height: 474 },
  { id: 'Idle 10',x: 2168,  y: 1896,  width: 542, height: 474 },
  { id: 'Idle 1', x: 0,     y: 2370,  width: 542, height: 474 },
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

// ─── Character definitions ───────────────────────────────────────────────────
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
    bobAnim:  { y: [0, -12, 0, -8, 0], rotate: [0, -3, 3, -2, 0], scale: [1, 1.04, 1, 1.02, 1] },
    walkAnim: { y: [0, -6, 0, -4, 0],  rotate: [0, -2, 2, -1, 0], scale: [1, 1.02, 1, 1.01, 1] },
    runAnim:  { y: [0, -15, 0, -10, 0], rotate: [0, -5, 5, -3, 0], scale: [1, 1.08, 1, 1.05, 1] },
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
    bobAnim:  { y: [0, -8, 0], rotate: [0, -2, 0], scale: [1, 1.03, 1] },
    walkAnim: { y: [0, -4, 0], rotate: [0, -1, 0], scale: [1, 1.02, 1] },
    runAnim:  { y: [0, -12, 0], rotate: [0, -3, 0], scale: [1, 1.05, 1] },
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
    bobAnim:  { y: [0, -5, 0], rotate: [0, -1, 0], scale: [1, 1.02, 1] },
    walkAnim: { y: [0, -3, 0], rotate: [0, -1, 0], scale: [1, 1.01, 1] },
    runAnim:  { y: [0, -8, 0], rotate: [0, -2, 0], scale: [1, 1.03, 1] },
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
    bobAnim:  { y: [0, -10, 0], rotate: [0, -2, 0], scale: [1, 1.04, 1] },
    walkAnim: { y: [0, -5, 0],  rotate: [0, -1, 0], scale: [1, 1.02, 1] },
    runAnim:  { y: [0, -15, 0], rotate: [0, -3, 0], scale: [1, 1.06, 1] },
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
    bobAnim:  { y: [0, -5, 0], rotate: [0, -1, 0], scale: [1, 1.03, 1] },
    walkAnim: { y: [0, -3, 0], rotate: [0, -1, 0], scale: [1, 1.02, 1] },
    runAnim:  { y: [0, -8, 0], rotate: [0, -2, 0], scale: [1, 1.05, 1] },
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
    bobAnim: { y: [0, -2, 0], rotate: [0, -1, 0], scale: [1, 1.01, 1] },
  },
];

// ─── Animated Sprite Component ─────────────────────────────────────────────────
function AnimatedSprite({ spriteSheet, slideSpriteSheet, frames, slideFrames, animationPhase, startSide, charId }) {
  const [currentFrame, setCurrentFrame] = useState(0);

  const getFramesForPhase = (phase) => {
    if (charId === 'cat-jump') {
      if (phase === 'jump') return frames.slice(8, 16);
      if (phase === 'idle') return frames.slice(16, 25);
      if (phase === 'run')  return frames.slice(0, 8);
    }
    if (charId === 'dino') {
      if (phase === 'jump') return frames.slice(18, 30);
      if (phase === 'idle') return frames.slice(30, 39);
      if (phase === 'run')  return frames.slice(10, 18);
    }
    if (charId === 'plane') {
      if (phase === 'jump') return frames.slice(5, 7);
      if (phase === 'idle') return frames.slice(5, 7);
      if (phase === 'run')  return frames.slice(0, 5);
    }
    if (charId === 'cat-fall' || charId === 'dead-cat') return frames;
    return phase === 'slide' ? slideFrames : frames;
  };

  const currentFrames = getFramesForPhase(animationPhase);
  const frameCount = currentFrames.length;
  const isJumpSeq  = charId === 'cat-jump' || charId === 'dino' || charId === 'plane';
  const isFallSeq  = charId === 'cat-fall';

  useEffect(() => {
    setCurrentFrame(0);
    if (!frameCount) return;
    const speed = isJumpSeq && animationPhase === 'run' ? 150
                : isJumpSeq ? 200
                : isFallSeq ? 150
                : animationPhase === 'slide' ? 200 : 400;
    const iv = setInterval(() => setCurrentFrame(p => (p + 1) % frameCount), speed);
    return () => clearInterval(iv);
  }, [frames, slideFrames, animationPhase, charId, frameCount, isJumpSeq, isFallSeq]);

  const currentSheet = isJumpSeq || isFallSeq
    ? spriteSheet
    : (animationPhase === 'slide' ? slideSpriteSheet : spriteSheet);
  const frame = currentFrames[currentFrame];
  const scale = (charId === 'dino' || charId.startsWith('cat') || charId === 'plane') ? 1.0 : 0.5;

  return (
    <div style={{ width: `${frame.width}px`, height: `${frame.height}px`, position: 'relative', overflow: 'hidden', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <img
        src={currentSheet}
        alt="animated sprite"
        style={{ position: 'absolute', left: `-${frame.x}px`, top: `-${frame.y}px`, transform: startSide === 'right' ? 'scaleX(-1)' : 'none', transformOrigin: 'top left' }}
      />
    </div>
  );
}

// ─── Cross-screen animation variants ─────────────────────────────────────────
function getCrossScreenVariants(startSide) {
  const startX  = startSide === 'left' ? '-140%' : '140%';
  const isCenter = startSide === 'center';
  return {
    hidden: { x: isCenter ? '0%' : startX, y: '0%', opacity: 0 },
    walk:   { x: '0%', opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 50, duration: 2 } },
    run:    { x: '0%', y: isCenter ? ['0%', '50%', '150%'] : '0%', opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 60, duration: 2 } },
    jump:   { x: '0%', opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 50, duration: 1 } },
    idle:   { x: '0%', opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 50, duration: 1 } },
    slide:  { x: '0%', y: ['0%', '150%'], opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 8, duration: 6 } },
    exit:   { x: '0%', y: '150%', opacity: 0 },
  };
}

// ─── Confetti particle ────────────────────────────────────────────────────────
const CONFETTI_EMOJIS = ['🎉', '✨', '🌟', '💫', '⭐', '🎊', '🏆', '💥'];
const SAD_EMOJIS      = ['😢', '😭', '💔', '😞', '😔', '🥀', '⛈️', '💧'];

function ConfettiParticle({ index, total, isPositive }) {
  const x     = `${(index / total) * 100}vw`;
  const delay = index * 0.12;
  const size  = 22 + (index % 3) * 8;
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

// ─── Speech bubble (2-D sprite overlay) ──────────────────────────────────────
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
        border: '4px solid rgba(255,255,255,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img
          src={displayAvatar}
          alt={studentName || 'Student'}
          style={{ width: '122px', height: '122px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.5)' }}
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN EXPORT: PointAnimation ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PointAnimation
 *
 * Drop-in replacement for the original component.  All existing props are
 * preserved.  When `isVisible` becomes true, it:
 *   1. Fires the 2-D sprite animation + PointsBadge + confetti (unchanged)
 *   2. Dispatches a `panda:trigger` event so <PandaStage> plays the 3-D
 *      Panda animation and speaks the phrase via TTS
 *
 * <PandaStage> must be mounted once at app level (see App.jsx integration).
 */
export const PointAnimation = ({
  isVisible,
  studentAvatar,
  studentName,
  points = 1,
  behaviorEmoji = '⭐',
  onComplete,
  students,
}) => {
  const isPositive   = points > 0;
  const isWholeClass = students && students.length > 0;

  const characterRef        = useRef(null);
  const labelRef            = useRef('');
  const timersRef           = useRef([]);
  const animationStartedRef = useRef(false);
  const [animationPhase, setAnimationPhase] = useState('hidden');
  const [internalVisible, setInternalVisible] = useState(false);

  useEffect(() => {
    if (isVisible && !animationStartedRef.current) {
      animationStartedRef.current = true;
      setInternalVisible(true);

      // ── Fire the 3-D Panda animation via custom event ──────────────────────
      window.dispatchEvent(new CustomEvent('panda:trigger', { detail: { points } }));

      // ── Pick 2-D sprite character ──────────────────────────────────────────
      let picked;
      if (isPositive && Math.abs(points) === 3) {
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
      if (!picked) picked = CHARACTERS[0];

      characterRef.current = picked;
      labelRef.current = picked.labels[Math.floor(Math.random() * picked.labels.length)];

      // ── Determine animation phase ──────────────────────────────────────────
      let targetPhase;
      if (picked.id === 'cat-jump' || picked.id === 'dino' || picked.id === 'plane') {
        targetPhase = 'jump';
      } else if (picked.id === 'cat-fall') {
        targetPhase = 'fall';
      } else if (picked.id === 'dead-cat') {
        targetPhase = 'walk';
      } else {
        targetPhase = Math.abs(points) === 1 ? 'walk' : 'slide';
      }
      setAnimationPhase(targetPhase);

      // ── Timers ─────────────────────────────────────────────────────────────
      if (picked.id === 'plane') {
        timersRef.current.push(setTimeout(() => setAnimationPhase('idle'), 2000));
        timersRef.current.push(setTimeout(() => { setAnimationPhase('exit'); animationStartedRef.current = false; }, 6000));
      } else if (picked.id === 'cat-jump' || picked.id === 'dino') {
        timersRef.current.push(setTimeout(() => setAnimationPhase('idle'), 3000));
        timersRef.current.push(setTimeout(() => setAnimationPhase('run'), 4000));
        timersRef.current.push(setTimeout(() => { setAnimationPhase('exit'); animationStartedRef.current = false; }, 6000));
      } else if (picked.id === 'cat-fall') {
        timersRef.current.push(setTimeout(() => setAnimationPhase('fall2'), 2000));
        timersRef.current.push(setTimeout(() => { setAnimationPhase('exit'); animationStartedRef.current = false; }, 4000));
      } else {
        timersRef.current.push(setTimeout(() => {
          setAnimationPhase('exit');
          animationStartedRef.current = false;
        }, Math.abs(points) === 1 ? 2100 : 6100));
      }
    }

    if (!isVisible && !animationStartedRef.current) {
      animationStartedRef.current = false;
    }
  }, [isVisible, points]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (animationPhase === 'exit') {
      setTimeout(() => setInternalVisible(false), 500);
    }
  }, [animationPhase]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  // ── Sound effects (unchanged from original) ────────────────────────────────
  useEffect(() => {
    if (!isVisible) return;
    let audioContext = null;
    const oscillators = [];
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioContext = new AC({ latencyHint: 'interactive' });
      if (audioContext.state === 'suspended') audioContext.resume();
      const t0 = audioContext.currentTime;
      const note = (freq, time, vol = 0.2, dur = 0.2, type = 'sine') => {
        const osc  = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
        osc.start(time); osc.stop(time + dur);
        oscillators.push(osc);
      };
      if (isPositive) {
        const c = Math.min(Math.max(points, 1), 5);
        if (c === 1) { note(1046, t0, 0.25, 0.15); note(1318, t0 + 0.08, 0.15, 0.2); }
        else if (c === 2) { note(784, t0, 0.2, 0.2, 'triangle'); note(880, t0 + 0.12, 0.2, 0.2, 'triangle'); note(1046, t0 + 0.24, 0.25, 0.35); }
        else if (c === 3) { note(659, t0, 0.18, 0.2, 'triangle'); note(784, t0 + 0.1, 0.18, 0.2, 'triangle'); note(987, t0 + 0.2, 0.2, 0.25, 'triangle'); note(1318, t0 + 0.3, 0.25, 0.4); }
        else if (c === 4) { note(523, t0, 0.15, 0.15, 'triangle'); note(659, t0 + 0.08, 0.15, 0.15, 'triangle'); note(784, t0 + 0.16, 0.18, 0.2, 'triangle'); note(1046, t0 + 0.24, 0.2, 0.25, 'triangle'); note(1318, t0 + 0.32, 0.25, 0.5); }
        else { [[523,659],[784,987],[1046,1318],[1318,1567]].forEach(([f1,f2], i) => { note(f1, t0 + i*0.15, 0.18, 0.8, 'triangle'); note(f2, t0 + i*0.15, 0.18, 0.8, 'triangle'); }); }
      } else {
        const p = Math.abs(points);
        if (p === 1) {
          const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
          osc.type = 'sine'; osc.connect(gain); gain.connect(audioContext.destination);
          osc.frequency.setValueAtTime(660, t0); osc.frequency.exponentialRampToValueAtTime(330, t0 + 0.2);
          gain.gain.setValueAtTime(0.2, t0); gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.2);
          osc.start(t0); osc.stop(t0 + 0.2); oscillators.push(osc);
        } else if (p === 2) { note(494, t0, 0.15, 0.15, 'triangle'); note(330, t0 + 0.12, 0.18, 0.25, 'triangle'); note(392, t0 + 0.3, 0.15, 0.15, 'triangle'); note(262, t0 + 0.42, 0.18, 0.25, 'triangle'); }
        else if (p === 3) { note(523, t0, 0.15, 0.12, 'triangle'); note(392, t0 + 0.12, 0.15, 0.12, 'triangle'); note(330, t0 + 0.24, 0.18, 0.15, 'triangle'); note(262, t0 + 0.36, 0.2, 0.3, 'triangle'); }
        else {
          const osc = audioContext.createOscillator(); const gain = audioContext.createGain();
          const lfo = audioContext.createOscillator(); const lfoGain = audioContext.createGain();
          osc.type = 'triangle'; lfo.type = 'sine'; lfo.frequency.value = 5; lfoGain.gain.value = 100;
          osc.connect(gain); lfo.connect(lfoGain); lfoGain.connect(osc.frequency); gain.connect(audioContext.destination);
          osc.frequency.value = 400;
          gain.gain.setValueAtTime(0.2, t0); gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.9);
          lfo.start(t0); osc.start(t0); osc.stop(t0 + 0.9); lfo.stop(t0 + 0.9);
          oscillators.push(osc, lfo);
        }
      }
    } catch (err) { console.warn('Audio playback failed:', err); }
    return () => {
      oscillators.forEach(o => { try { if (o.state !== 'stopped') o.stop(); } catch (e) {} });
      if (audioContext && audioContext.state !== 'closed') { try { audioContext.close(); } catch (e) {} }
    };
  }, [isVisible, isPositive, points]);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const char      = characterRef.current;
  const startSide = char?.startSide ?? 'left';
  const variants  = useMemo(() => getCrossScreenVariants(startSide), [startSide]);

  const getCurrentAnim = () => {
    switch (animationPhase) {
      case 'walk':  return char?.walkAnim || char?.bobAnim;
      case 'run':   return char?.runAnim  || char?.walkAnim || char?.bobAnim;
      case 'jump':  return { y: [0, -80, 0], scale: [1, 1.1, 1] };
      case 'idle':  return { y: [0, -5, 0], rotate: [0, -2, 0], scale: [1, 1.02, 1] };
      case 'fall':  return { rotate: [0, 10, -10, 0] };
      case 'fall2': return { rotate: [0, -10, 10, 0] };
      case 'slide': return { y: [0, -15, 0], x: [0, 5, -5, 0], scale: [1, 1.08, 1] };
      default:      return char?.bobAnim;
    }
  };
  const currentCharAnim = getCurrentAnim();

  const positionStyle = useMemo(() => {
    const isCenter = char?.startSide === 'center';
    const isPlane  = char?.id === 'plane';
    return {
      position: 'fixed',
      zIndex: 4006,
      width: 'clamp(180px, 28vw, 360px)',
      height: 'auto',
      left: isPlane ? '-100vw' : (isCenter ? '35%' : '50%'),
      top:  isPlane ? '5%'     : (isCenter ? '50%' : '20vh'),
      transform: isPlane ? 'translateY(-50%)' : 'translateX(-50%)',
    };
  }, [char]);

  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {(() => {
        if (!internalVisible || !char) return null;
        return (
          <>
            {(animationPhase === 'walk' || animationPhase === 'slide' || animationPhase === 'run') &&
              Array.from({ length: 10 }).map((_, i) => (
                <ConfettiParticle key={i} index={i} total={10} isPositive={isPositive} />
              ))}

            <motion.div
              key={`char-${points}-${animationPhase}`}
              initial={{ x: startSide === 'center' ? '0%' : (startSide === 'left' ? '-140%' : '140%'), y: '0%', opacity: 0 }}
              animate={
                animationPhase === 'hidden' ? { x: startSide === 'center' ? '0%' : (startSide === 'left' ? '-140%' : '140%'), y: '0%', opacity: 0 } :
                animationPhase === 'walk'   ? { x: '0%', opacity: 1 } :
                animationPhase === 'run'    ? { x: '0%', y: ['0%', '50%', '150%'], opacity: 1 } :
                animationPhase === 'jump'   ? { x: '0%', opacity: 1 } :
                animationPhase === 'idle'   ? { x: '0%', opacity: 1 } :
                animationPhase === 'fall'   ? { y: ['-50%', '0%'], opacity: 1 } :
                animationPhase === 'fall2'  ? { y: ['0%', '150%'], opacity: 1 } :
                animationPhase === 'slide'  ? { x: '0%', y: ['0%', '150%'], opacity: 1 } :
                { x: '0%', y: '150%', opacity: 0 }
              }
              transition={
                animationPhase === 'slide'  ? { type: 'spring', damping: 20, stiffness: 8,  duration: 6 } :
                animationPhase === 'run'    ? { type: 'spring', damping: 20, stiffness: 60, duration: 2 } :
                animationPhase === 'fall' || animationPhase === 'fall2' ? { type: 'spring', damping: 15, stiffness: 40, duration: 2 } :
                animationPhase === 'walk'   ? { type: 'spring', damping: 20, stiffness: 50, duration: 2 } :
                { duration: 0.3 }
              }
              style={{ ...positionStyle, position: 'fixed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
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
                    style={{ width: '100%', height: 'auto', display: 'block', transform: startSide === 'right' ? 'scaleX(-1)' : 'none', filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.22))' }}
                  />
                )}
                <SpeechBubble text={labelRef.current} color={char.color} side={startSide} />
              </motion.div>
            </motion.div>

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
