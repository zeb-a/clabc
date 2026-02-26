/**
 * PandaCharacter.jsx
 *
 * Standalone 3-D Panda mascot rendered with React Three Fiber.
 * Loaded ONCE at app level — never re-created per page.
 *
 * Animation map (driven by `points` prop):
 *   +1  → Wave          "Nice!"
 *   +2  → Jump          "Great job!"
 *   +3  → Yes (clap)    "Amazing work!"
 *   -1  → HitReact      "Try again!"
 *   -2  → No            "Oh nooo..."
 *   +5  → Run + Yes     "You are a superstar!"
 *   idle→ Idle (breathing)
 *
 * Features:
 *   • Draco-compressed GLB (panda-draco.glb in /public)
 *   • Suspense lazy-loading — GLB only fetched when canvas mounts
 *   • Stylized PBR materials (toon-ish emissive boost)
 *   • Soft contact shadow plane
 *   • Slight idle breathing via useFrame
 *   • Smooth angled camera (not front-on static)
 *   • Speech bubble overlay (HTML via @react-three/drei Html)
 *   • Web Speech API TTS for spoken phrases
 */

import {
  Suspense,
  useRef,
  useEffect,
  useState,
  useCallback,
  lazy,
  createContext,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  useAnimations,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
} from '@react-three/drei';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ─── Animation config ─────────────────────────────────────────────────────────
// Maps point values to GLB animation names + spoken phrases
const POINT_MAP = {
  1:  { anim: 'Wave',      phrase: 'Nice!',                  color: '#4CAF50' },
  2:  { anim: 'Jump',      phrase: 'Great job!',             color: '#2196F3' },
  3:  { anim: 'Yes',       phrase: 'Amazing work!',          color: '#9C27B0' },
  5:  { anim: 'Run',       phrase: 'You are a superstar!',   color: '#FF9800' },
  '-1': { anim: 'HitReact', phrase: 'Try again!',            color: '#F44336' },
  '-2': { anim: 'No',      phrase: 'Oh nooo...',             color: '#795548' },
};

// Fallback for unmapped values
const DEFAULT_POSITIVE = { anim: 'Wave',     phrase: 'Nice!',       color: '#4CAF50' };
const DEFAULT_NEGATIVE = { anim: 'HitReact', phrase: 'Try again!',  color: '#F44336' };
const IDLE_ANIM        = 'Idle';

// Full animation name prefix from the GLB
const ANIM_PREFIX = 'CharacterArmature|CharacterArmature|CharacterArmature|';

// Duration (ms) to show the animation before returning to idle
const ANIM_DURATION = {
  Wave:     2800,
  Jump:     2200,
  Yes:      2600,
  Run:      3200,
  HitReact: 1800,
  No:       2400,
};

// ─── Speech helper ────────────────────────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate  = 1.05;
  utt.pitch = 1.2;
  utt.volume = 0.9;
  // Prefer a friendly voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.toLowerCase().includes('samantha') ||
    v.name.toLowerCase().includes('karen')    ||
    v.name.toLowerCase().includes('google us english')
  );
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

// ─── 3-D Panda mesh (loaded inside Suspense) ─────────────────────────────────
function PandaMesh({ triggerKey, points, onAnimDone }) {
  const group     = useRef();
  const { scene, animations } = useGLTF('/panda-draco.glb', true); // Draco decoder auto-detected
  const { actions, mixer }    = useAnimations(animations, group);
  const currentAction = useRef(null);
  const breathPhase   = useRef(0);

  // ── Stylize materials once on mount ────────────────────────────────────────
  useEffect(() => {
    scene.traverse(obj => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material;
        // Boost emissive for a warm, non-cheap look
        mat.emissive      = mat.emissive || new THREE.Color(0x000000);
        mat.emissiveIntensity = 0.08;
        // Slightly reduce metalness for a toon-ish PBR feel
        if (mat.metalness !== undefined) mat.metalness = Math.min(mat.metalness, 0.15);
        if (mat.roughness !== undefined) mat.roughness = Math.max(mat.roughness, 0.55);
        mat.needsUpdate = true;
        obj.castShadow    = true;
        obj.receiveShadow = true;
      }
    });
  }, [scene]);

  // ── Play animation on trigger ───────────────────────────────────────────────
  useEffect(() => {
    if (triggerKey === null) return;

    const key    = String(points);
    const config = POINT_MAP[key] || (points > 0 ? DEFAULT_POSITIVE : DEFAULT_NEGATIVE);
    const fullName = ANIM_PREFIX + config.anim;

    // Find the action (try full name then short name)
    const action = actions[fullName] || actions[config.anim];
    if (!action) {
      console.warn('[PandaCharacter] Animation not found:', fullName);
      return;
    }

    // Crossfade from current → new
    if (currentAction.current && currentAction.current !== action) {
      currentAction.current.fadeOut(0.3);
    }
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.3).play();
    currentAction.current = action;

    // Return to idle after duration
    const duration = ANIM_DURATION[config.anim] ?? 2500;
    const timer = setTimeout(() => {
      action.fadeOut(0.4);
      const idleAction = actions[ANIM_PREFIX + IDLE_ANIM] || actions[IDLE_ANIM];
      if (idleAction) {
        idleAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.4).play();
        currentAction.current = idleAction;
      }
      if (onAnimDone) onAnimDone();
    }, duration);

    return () => clearTimeout(timer);
  }, [triggerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start idle on first mount ───────────────────────────────────────────────
  useEffect(() => {
    const idleAction = actions[ANIM_PREFIX + IDLE_ANIM] || actions[IDLE_ANIM];
    if (idleAction) {
      idleAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      currentAction.current = idleAction;
    }
  }, [actions]);

  // ── Idle breathing via useFrame ─────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!group.current) return;
    breathPhase.current += delta * 0.8;
    const breathY = Math.sin(breathPhase.current) * 0.004;
    group.current.position.y = breathY;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

// Pre-warm the GLB loader so it's cached before the Canvas mounts
useGLTF.preload('/panda-draco.glb');

// ─── Camera rig — smooth angled view ─────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(1.8, 1.6, 3.2);
    camera.lookAt(0, 0.8, 0);
  }, [camera]);
  return null;
}

// ─── Fallback while GLB loads ─────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

// ─── Speech bubble (HTML overlay) ────────────────────────────────────────────
function SpeechBubble({ phrase, color, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={phrase}
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: -10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          style={{
            position: 'absolute',
            top: '8%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: color,
            color: '#fff',
            fontWeight: 800,
            fontSize: 'clamp(18px, 2.5vw, 28px)',
            padding: '10px 24px',
            borderRadius: 32,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            zIndex: 4020,
            letterSpacing: 0.5,
            textShadow: '0 2px 6px rgba(0,0,0,0.2)',
            border: '3px solid rgba(255,255,255,0.4)',
          }}
        >
          {phrase}
          {/* Tail */}
          <div style={{
            position: 'absolute',
            bottom: -14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: `14px solid ${color}`,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
/**
 * PandaCharacter
 *
 * Props:
 *   isVisible    {boolean}  – show/hide the overlay
 *   points       {number}   – point value that drives the animation
 *   onComplete   {function} – called when animation finishes
 *
 * The Canvas is rendered once into a fixed portal and never torn down.
 * Subsequent point events just update `triggerKey` to re-fire the animation.
 */
export const PandaCharacter = forwardRef(function PandaCharacter(
  { isVisible, points = 1, onComplete },
  ref
) {
  const [triggerKey, setTriggerKey]     = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(DEFAULT_POSITIVE);
  const prevVisible = useRef(false);

  // Expose imperative trigger for parent components
  useImperativeHandle(ref, () => ({
    trigger: (pts) => fireAnimation(pts),
  }));

  const fireAnimation = useCallback((pts) => {
    const key    = String(pts);
    const config = POINT_MAP[key] || (pts > 0 ? DEFAULT_POSITIVE : DEFAULT_NEGATIVE);
    setCurrentConfig(config);
    setTriggerKey(Date.now()); // unique key forces effect re-run
    setBubbleVisible(true);
    speak(config.phrase);
  }, []);

  // React to isVisible prop changes (existing ClassDashboard integration)
  useEffect(() => {
    if (isVisible && !prevVisible.current) {
      fireAnimation(points);
    }
    prevVisible.current = isVisible;
  }, [isVisible, points, fireAnimation]);

  const handleAnimDone = useCallback(() => {
    setBubbleVisible(false);
    if (onComplete) onComplete();
  }, [onComplete]);

  // ── Portal content ──────────────────────────────────────────────────────────
  const content = (
    <div
      data-point-animation="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Speech bubble */}
      <SpeechBubble
        phrase={currentConfig.phrase}
        color={currentConfig.color}
        visible={bubbleVisible}
      />

      {/* 3-D Canvas — fixed size, centered, transparent background */}
      <div
        style={{
          position: 'absolute',
          bottom: '5vh',
          right: '3vw',
          width: 'clamp(220px, 28vw, 380px)',
          height: 'clamp(280px, 36vw, 480px)',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.18))',
        }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 38 }}
          style={{ background: 'transparent' }}
        >
          <CameraRig />

          {/* Lighting — warm key + cool fill for depth */}
          <ambientLight intensity={0.55} color="#fff8f0" />
          <directionalLight
            position={[4, 8, 5]}
            intensity={1.4}
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
          <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#c0d8ff" />
          <pointLight position={[0, 4, 2]} intensity={0.4} color="#ffe0b0" />

          {/* Environment for PBR reflections */}
          <Environment preset="city" />

          {/* Soft contact shadow on the ground */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.45}
            scale={3.5}
            blur={2.2}
            far={3}
            color="#1a1a2e"
          />

          {/* Panda model — lazy loaded inside Suspense */}
          <Suspense fallback={<LoadingFallback />}>
            <PandaMesh
              triggerKey={triggerKey}
              points={points}
              onAnimDone={handleAnimDone}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

export default PandaCharacter;
