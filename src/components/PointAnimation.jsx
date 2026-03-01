import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEffect, useState, useMemo } from 'react';
import { boringAvatar } from '../utils/avatar';

// Large card point animation with student avatar and behavior emoji
export const PointAnimation = ({ isVisible, studentAvatar, studentName, points = 1, behaviorEmoji = '⭐', pointName, onComplete, students }) => {
  const isPositive = points > 0;
  const isWholeClass = students && students.length > 0;

  // Generate stylized name bubbles
  const nameBubbles = useMemo(() => {
    if (!pointName) return [];
    const bubbleCount = Math.min(6, Math.max(4, Math.ceil(pointName.length / 8)));
    return Array.from({ length: bubbleCount }, (_, i) => ({
      id: i,
      text: pointName,
      angle: (i / bubbleCount) * Math.PI * 2,
      distance: 150 + Math.random() * 80,
      delay: Math.random() * 0.3,
      size: 80 + Math.random() * 40,
      colors: [
        'rgba(255, 255, 255, 0.95)',
        'rgba(255, 248, 220, 0.95)',
        'rgba(255, 228, 196, 0.95)',
        'rgba(255, 218, 185, 0.95)'
      ]
    }));
  }, [pointName]);

  // Generate avatar URLs for students array with fallbacks
  const studentsWithAvatars = useMemo(() => {
    if (!students || students.length === 0) return [];
    return students.map(student => ({
      ...student,
      avatar: student.avatar || boringAvatar(student.name || 'Student', 'boy')
    }));
  }, [students]);

  // Fallback avatar for single student
  const fallbackAvatar = studentAvatar || boringAvatar(studentName || 'Student', 'boy');
  const [sparkles, setSparkles] = useState([]);
  const [emojiBounce, setEmojiBounce] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  // Auto-hide after 1.5 seconds
  useEffect(() => {
    if (isVisible) {
      setShouldHide(false);
      const timeout = setTimeout(() => {
        setShouldHide(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  // Performance optimization: Detect device capabilities
  const performanceConfig = useMemo(() => {
    const isLowEnd = typeof window !== 'undefined' && (
      // Check for low memory (Chrome only)
      (navigator.deviceMemory && navigator.deviceMemory < 4) ||
      // Check for slow connection
      (navigator.connection && navigator.connection.effectiveType && navigator.connection.effectiveType.includes('2g')) ||
      // Check for touch device (often slower rendering)
      ('ontouchstart' in window) ||
      // Check for reduced motion preference
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );

    return {
      // Use GPU acceleration hints
      willChange: isLowEnd ? 'auto' : 'transform, opacity',
      // Reduce particle count on low-end devices
      sparkleCount: isLowEnd ? 4 : 8,
      // Reduce confetti count on low-end devices
      confettiCount: isLowEnd ? 15 : 30,
      // Animation duration for badge and confetti
      animationDuration: 1.5,
      // Use simpler easing on low-end devices
      animationEase: isLowEnd ? 'easeOut' : 'easeInOut',
      // Reduce repeat frequency on low-end devices
      repeatDelay: isLowEnd ? 0.3 : 0,
      // Use transform3d for GPU acceleration
      transform: isLowEnd ? undefined : 'translateZ(0)'
    };
  }, []);

  // Create sparkle effects for positive points (optimized count)
  useEffect(() => {
    if (isVisible && isPositive) {
      const newSparkles = Array.from({ length: performanceConfig.sparkleCount }, (_, i) => ({
        id: i,
        angle: (i / performanceConfig.sparkleCount) * Math.PI * 2,
        distance: 100 + Math.random() * 50
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 1200);
    }
  }, [isVisible, isPositive, performanceConfig.sparkleCount]);

  // Trigger emoji bounce animation (optimized for performance)
  useEffect(() => {
    if (isVisible) {
      setEmojiBounce(true);
      // Use requestAnimationFrame for smoother animation
      let animationFrameId;
      let lastTime = 0;
      const bounceDelay = isPositive ? 300 : 400;

      const animateBounce = (timestamp) => {
        if (!lastTime) lastTime = timestamp;
        const elapsed = timestamp - lastTime;

        if (elapsed >= bounceDelay) {
          setEmojiBounce(prev => !prev);
          lastTime = timestamp;
        }

        animationFrameId = requestAnimationFrame(animateBounce);
      };

      animationFrameId = requestAnimationFrame(animateBounce);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [isVisible, isPositive]);
  
  // Play sound effect when animation shows using audio files
  useEffect(() => {
    if (!isVisible) return;

    let audio = null;

    try {
      // Determine which audio file to play
      let audioFile = null;
      if (isPositive) {
        const count = Math.min(Math.max(points, 1), 5);
        if (count === 1) {
          audioFile = '/audio/amazing.mp3';
        } else if (count === 2) {
          audioFile = '/audio/awesome.mp3';
        } else if (count === 3 || count === 4) {
          audioFile = '/audio/rockstar.mp3';
        } else if (count >= 5) {
          audioFile = '/audio/superstar.mp3';
        }
      } else {
        const penalty = Math.abs(points);
        if (penalty === 1) {
          audioFile = '/audio/try_again.mp3';
        } else if (penalty === 2) {
          audioFile = '/audio/cry.mp3';
        }
      }

      // Play audio file if exists
      if (audioFile) {
        audio = new Audio(audioFile);
        audio.volume = 0.7;
        audio.play().catch(err => console.warn('Audio playback failed:', err));
      }
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }

    // Cleanup function
    return () => {
      if (audio) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isVisible, isPositive, points]);

  const backgroundColor = isPositive
    ? '#FFB800'
    : '#FF5252';
  const borderColor = isPositive ? '#FF9800' : '#FF1744';

  // Generate flower bouquets (large flower emojis) for positive points
  const flowerBouquets = useMemo(() => {
    if (!isPositive) return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      flower: ['💐', '🌹', '🌸', '🌺', '🌻', '🌷'][i % 6],
      angle: (i / 6) * Math.PI * 2,
      distance: 200 + Math.random() * 100,
      delay: i * 0.1,
      size: 60 + Math.random() * 40
    }));
  }, [isPositive]);

  // Generate disappointing/confetti for negative points (shattering glass, broken hearts, etc.)
  const sadConfetti = useMemo(() => {
    if (isPositive) return [];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: ['💔', '💥', '😢', '😭', '💧', '🥀', '🧊', '🪨', '🪵', '🦴'][i % 10],
      angle: (i / 25) * Math.PI * 2,
      distance: 250 + Math.random() * 150,
      delay: i * 0.04,
      size: 20 + Math.random() * 30,
      rotation: Math.random() * 720
    }));
  }, [isPositive]);
  
  const content = (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && !shouldHide && (
        <>
          {/* Sparkles for positive points (optimized with GPU hints) - from center */}
          <AnimatePresence>
            {sparkles.map(sparkle => (
              <motion.div
                key={sparkle.id}
                initial={{ opacity: 1, scale: 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  left: `calc(50% + ${Math.cos(sparkle.angle) * sparkle.distance}px)`,
                  top: `calc(50% + ${Math.sin(sparkle.angle) * sparkle.distance}px)`
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: performanceConfig.animationDuration, ease: performanceConfig.animationEase }}
                style={{
                  position: 'fixed',
                  width: '30px',
                  height: '30px',
                  fontSize: '30px',
                  zIndex: 3001,
                  pointerEvents: 'none',
                  willChange: performanceConfig.willChange,
                  transform: performanceConfig.transform
                }}
              >
                ✨
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Badge - centered at bottom */}
          <motion.div
            data-point-animation="true"
            initial={{ opacity: 0, scale: 0.5, y: 20, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20, rotate: 10 }}
            transition={{
              type: 'spring',
              damping: performanceConfig.transform ? 16 : 12,
              stiffness: performanceConfig.transform ? 250 : 300
            }}
            style={{
              position: 'fixed',
              bottom: '5vh',
              left: '30%',
              top: 'auto',
              right: 'auto',
              transform: 'translateX(-50%)',
              background: backgroundColor,
              borderRadius: '32px',
              padding: '22px clamp(20px, 4vw, 50px)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'clamp(20px, 5vw, 40px)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)',
              zIndex: 99999,
              minWidth: 'fit-content',
              maxWidth: '80vw',
              width: 'auto',
              border: `4px solid ${borderColor}`,
              margin: '0 auto',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Student Avatar - far left */}
            <motion.img
              src={studentAvatar || boringAvatar(studentName || 'Student', 'boy')}
              alt={studentName}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              style={{
                width: 'clamp(80px, 12vw, 120px)',
                height: 'clamp(80px, 12vw, 120px)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${borderColor}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.src = boringAvatar(studentName || 'Student', 'boy');
              }}
            />

            {/* Animated Points - center */}
            <motion.span
              animate={{
                scale: isPositive ? [1, 1.3, 1] : [1, 0.85, 1],
                rotate: isPositive ? [0, -3, 3, 0] : [0, -2, 2, 0]
              }}
              transition={{
                duration: performanceConfig.animationDuration * 0.65,
                repeat: Infinity,
                repeatDelay: performanceConfig.repeatDelay,
                delay: 0.1,
                ease: performanceConfig.animationEase
              }}
              style={{
                fontSize: 'clamp(40px, 8vw, 64px)',
                fontWeight: '950',
                color: 'white',
                textShadow: '0 3px 10px rgba(0,0,0,0.6), 0 0 5px rgba(255,255,255,0.5)',
                display: 'inline-block',
                WebkitTextStroke: isPositive ? '1.5px rgba(255,255,255,0.3)' : '1px rgba(255,255,255,0.2)',
                WebkitTextFillColor: 'white',
                willChange: performanceConfig.willChange,
                flex: '1',
                textAlign: 'center'
              }}
            >
              {isPositive ? '+' : ''}{points}
            </motion.span>

            {/* Student Name - far right */}
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                fontSize: 'clamp(20px, 4vw, 28px)',
                fontWeight: '800',
                color: 'white',
                textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 4px rgba(255,255,255,0.4)',
                textAlign: 'right',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {studentName}
            </motion.span>
          </motion.div>

          {/* Big flower bouquets spreading from center */}
          {isPositive && flowerBouquets.map((bouquet) => (
            <motion.div
              key={`flower-${bouquet.id}`}
              initial={{ opacity: 0, scale: 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              animate={{
                opacity: [0, 1, 1, 1],
                scale: [0, 1.5, 1, 0.8],
                left: `calc(50% + ${Math.cos(bouquet.angle) * bouquet.distance}px)`,
                top: `calc(50% + ${Math.sin(bouquet.angle) * bouquet.distance}px)`,
                rotate: [0, 360, 720]
              }}
              transition={{
                duration: performanceConfig.animationDuration,
                delay: bouquet.delay,
                ease: 'easeOut'
              }}
              style={{
                position: 'fixed',
                fontSize: `${bouquet.size}px`,
                filter: 'drop-shadow(0 10px 20px rgba(255, 215, 0, 0.5))',
                WebkitFilter: 'drop-shadow(0 10px 20px rgba(255, 215, 0, 0.5))',
                pointerEvents: 'none',
                willChange: performanceConfig.willChange,
                backfaceVisibility: 'hidden',
                zIndex: 3003
              }}
            >
              {bouquet.flower}
            </motion.div>
          ))}

          {/* Stylized name bubbles spreading from center */}
          {isPositive && nameBubbles.map((bubble, i) => (
            <motion.div
              key={`bubble-${bubble.id}`}
              initial={{ opacity: 0, scale: 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              animate={{
                opacity: [0, 1, 1],
                scale: [0, 1.2, 1],
                left: `calc(50% + ${Math.cos(bubble.angle) * bubble.distance * 1.3}px)`,
                top: `calc(50% + ${Math.sin(bubble.angle) * bubble.distance * 1.3}px)`,
                rotate: [-15, 15, -10]
              }}
              transition={{
                duration: performanceConfig.animationDuration,
                delay: bubble.delay,
                ease: 'easeOut'
              }}
              style={{
                position: 'fixed',
                width: `${bubble.size}px`,
                minHeight: `${bubble.size * 0.6}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 18px',
                borderRadius: '50%',
                background: bubble.colors[i % bubble.colors.length],
                boxShadow: `0 10px 30px rgba(255, 215, 0, 0.5)`,
                border: `4px solid rgba(255, 215, 0, 0.9)`,
                fontSize: '18px',
                fontWeight: '900',
                color: '#FF8C00',
                textShadow: '0 2px 4px rgba(255,255,255,0.9)',
                pointerEvents: 'none',
                willChange: performanceConfig.willChange,
                backfaceVisibility: 'hidden',
                textAlign: 'center',
                wordBreak: 'break-word',
                lineHeight: 1.2,
                zIndex: 3004
              }}
            >
              {pointName}
            </motion.div>
          ))}

          {/* Confetti particles spreading from center in all directions */}
          {isPositive && Array.from({ length: performanceConfig.confettiCount }).map((_, i) => {
            const angle = (i / performanceConfig.confettiCount) * Math.PI * 2;
            const distance = 300 + Math.random() * 200;
            return (
              <motion.div
                key={`confetti-${i}`}
                initial={{ opacity: 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                animate={{
                  opacity: [0, 1, 1],
                  left: `calc(50% + ${Math.cos(angle) * distance}px)`,
                  top: `calc(50% + ${Math.sin(angle) * distance}px)`,
                  rotate: [0, 720 + Math.random() * 360]
                }}
                transition={{
                  duration: performanceConfig.animationDuration,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'fixed',
                  fontSize: `${25 + Math.random() * 20}px`,
                  filter: 'drop-shadow(0 5px 15px rgba(255, 215, 0, 0.4))',
                  WebkitFilter: 'drop-shadow(0 5px 15px rgba(255, 215, 0, 0.4))',
                  pointerEvents: 'none',
                  willChange: performanceConfig.willChange,
                  backfaceVisibility: 'hidden',
                  zIndex: 3002
                }}
              >
                {['🎉', '✨', '🌟', '💫', '⭐', '🎊'][i % 6]}
              </motion.div>
            );
          })}

          {/* Disappointing confetti for negative points (shattering glass, broken hearts) */}
          {!isPositive && sadConfetti.map((item) => (
            <motion.div
              key={`sad-${item.id}`}
              initial={{ opacity: 0, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', scale: 1.5 }}
              animate={{
                opacity: [0, 1, 1],
                scale: [1.5, 1, 0.6],
                left: `calc(50% + ${Math.cos(item.angle) * item.distance}px)`,
                top: `calc(50% + ${Math.sin(item.angle) * item.distance}px)`,
                rotate: [0, item.rotation],
                x: [0, Math.sin(item.angle) * 20]
              }}
              transition={{
                duration: performanceConfig.animationDuration,
                delay: item.delay,
                ease: 'easeOut'
              }}
              style={{
                position: 'fixed',
                fontSize: `${item.size}px`,
                filter: 'drop-shadow(0 5px 10px rgba(255, 71, 87, 0.4))',
                WebkitFilter: 'drop-shadow(0 5px 10px rgba(255, 71, 87, 0.4))',
                pointerEvents: 'none',
                willChange: performanceConfig.willChange,
                backfaceVisibility: 'hidden',
                zIndex: 3002
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};