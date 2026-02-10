import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, RotateCcw, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/gameSounds';
import PixiBackdrop from './PixiBackdrop';
import * as PIXI from 'pixi.js';

// Add CSS animations
const styleElement = document.createElement('style');
styleElement.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
if (!document.getElementById('memory-match-animations')) {
  styleElement.id = 'memory-match-animations';
  document.head.appendChild(styleElement);
}

function MemoryMatchPixiBoard({ pairs, flipped, matched, onSelect }) {
  const hostRef = useRef(null);
  const appRef = useRef(null);
  const drawRef = useRef(null);
  const stateRef = useRef({
    pairs: Array.isArray(pairs) ? pairs : [],
    flipped: flipped || new Set(),
    matched: matched || new Set(),
    onSelect: onSelect || (() => {})
  });

  useEffect(() => {
    stateRef.current = {
      pairs: Array.isArray(pairs) ? pairs : [],
      flipped: flipped || new Set(),
      matched: matched || new Set(),
      onSelect: onSelect || (() => {})
    };
    if (drawRef.current) drawRef.current();
  }, [pairs, flipped, matched, onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let resizeObserver;

    const setup = async () => {
      const app = new PIXI.Application();
      if (typeof app.init === 'function') {
        await app.init({ backgroundAlpha: 0, antialias: true, resolution: window.devicePixelRatio || 1, autoDensity: true });
      }
      if (disposed) return;
      appRef.current = app;
      host.appendChild(app.canvas || app.view);

      const draw = () => {
        if (!appRef.current || disposed) return;
        const app = appRef.current;

        const { pairs: localPairs, flipped: localFlipped, matched: localMatched, onSelect: onSelectLocal } = stateRef.current;
        if (!Array.isArray(localPairs) || localPairs.length === 0) {
          return;
        }

        const rect = host.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);

        if (!app.renderer || !app.stage) return;
        app.renderer.resize(width, height);

        // Safely clear existing children
        if (app.stage.removeChildren) {
          try {
            const children = app.stage.removeChildren();
            if (Array.isArray(children)) {
              children.forEach(child => {
                try {
                  if (child && child.destroy) {
                    child.destroy({ children: true });
                  }
                } catch (err) {
                  // Ignore destroy errors
                }
              });
            }
          } catch (err) {
            // Ignore removeChildren errors
          }
        }

        const cols = Math.min(4, Math.ceil(Math.sqrt(localPairs.length)) || 1);
        const rows = Math.ceil(localPairs.length / cols) || 1;
        const cellSize = Math.min((width * 0.9) / cols, (height * 0.95) / rows);
        const startX = (width - cellSize * cols) / 2;
        const startY = (height - cellSize * rows) / 2;

        localPairs.forEach((card, idx) => {
          // Check if app is still valid
          if (disposed || !app.stage) return;

          const row = Math.floor(idx / cols);
          const col = idx % cols;
          const x = startX + col * cellSize;
          const y = startY + row * cellSize;
          const isFlipped = localFlipped.has(card.id) || localMatched.has(card.id);

          const tile = new PIXI.Graphics();
          const isBlue = idx % 2 === 1;
          const baseColor = isBlue ? 0x0b1f7a : 0x7c0a0a;
          tile.beginFill(isFlipped ? 0xf2f2f2 : baseColor, 1);
          tile.lineStyle(3, 0xffffff, 0.45);
          tile.drawRoundedRect(x, y, cellSize - 8, cellSize - 8, 14);
          tile.endFill();
          tile.eventMode = isFlipped ? 'none' : 'static';
          tile.cursor = isFlipped ? 'default' : 'pointer';
          tile.on('pointertap', () => onSelectLocal(card));

          if (app.stage) {
            app.stage.addChild(tile);
          }

          if (!isFlipped) {
            const q = new PIXI.Text('?', {
              fontFamily: 'Arial',
              fontSize: Math.max(24, cellSize * 0.35),
              fill: 0xffffff,
              fontWeight: '800'
            });
            q.x = x + (cellSize - 8) / 2 - q.width / 2;
            q.y = y + (cellSize - 8) / 2 - q.height / 2;
            if (app.stage) {
              app.stage.addChild(q);
            }
            return;
          }

          if (card.type === 'image' || card.src) {
            try {
              // Create a sprite from the image source
              const sprite = new PIXI.Sprite();

              // Handle base64 data URLs differently
              if (card.src.startsWith('data:')) {
                // Create an image element first for base64
                const img = new Image();
                img.src = card.src;

                // Check if image is loaded
                if (img.complete) {
                  const texture = PIXI.Texture.from(img);
                  sprite.texture = texture;
                } else {
                  img.onload = () => {
                    const texture = PIXI.Texture.from(img);
                    sprite.texture = texture;
                    // Force redraw
                    if (drawRef.current) drawRef.current();
                  };
                }
              } else {
                // Regular URL
                const texture = PIXI.Texture.from(card.src);
                sprite.texture = texture;
              }

              const pad = 12;
              sprite.width = cellSize - pad * 2;
              sprite.height = cellSize - pad * 2;

              // Set anchor to center
              sprite.anchor.set(0.5);
              sprite.x = x + (cellSize - 8) / 2;
              sprite.y = y + (cellSize - 8) / 2;
              sprite.roundPixels = true;

              if (app.stage) {
                app.stage.addChild(sprite);
              }
            } catch (e) {
              console.error('[MemoryMatchPixiBoard] Error loading image:', e, card);
              // Fallback emoji
              const errorText = new PIXI.Text('📷', {
                fontFamily: 'Arial',
                fontSize: Math.max(32, cellSize * 0.4),
                fill: 0x8B5CF6,
                fontWeight: '800'
              });
              errorText.x = x + (cellSize - 8) / 2 - errorText.width / 2;
              errorText.y = y + (cellSize - 8) / 2 - errorText.height / 2;
              app.stage.addChild(errorText);
            }
          } else {
            const text = new PIXI.Text(card.text || '', {
              fontFamily: 'Arial',
              fontSize: Math.max(12, cellSize * 0.16),
              fill: 0x111827,
              fontWeight: '700',
              wordWrap: true,
              wordWrapWidth: cellSize - 16,
              align: 'center'
            });
            text.x = x + (cellSize - 8) / 2 - text.width / 2;
            text.y = y + (cellSize - 8) / 2 - text.height / 2;
            if (app.stage) {
              app.stage.addChild(text);
            }
          }
        });
      };

      drawRef.current = draw;
      draw();
      resizeObserver = new ResizeObserver(draw);
      resizeObserver.observe(host);
    };

    setup();

    return () => {
      disposed = true;
      drawRef.current = null; // Prevent any pending draw calls
      if (resizeObserver) resizeObserver.disconnect();
      if (appRef.current) {
        const view = appRef.current.canvas || appRef.current.view;
        if (view && view.parentNode) view.parentNode.removeChild(view);
        try {
          appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (e) {
          // Ignore destroy errors during unmount
        }
        appRef.current = null;
      }
    };
  }, []);

  return <div ref={hostRef} style={{ width: '100%', height: '100%' }} />;
}

export default function MemoryMatchGame({ contentItems, onBack, onReset, classColor = '#8B5CF6', players = [], selectedClass, onGivePoints }) {
  const [flipped, setFlipped] = useState(new Set());
  const [matched, setMatched] = useState(new Set());
  const [lastFlipped, setLastFlipped] = useState(null);
  const [fullScreen, setFullScreen] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [pointsToGive, setPointsToGive] = useState(1);
  const [pointsGiven, setPointsGiven] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  // Initialize scores
  useEffect(() => {
    const initialScores = {};
    players.forEach((p, i) => initialScores[i] = 0);
    setScores(initialScores);
  }, [players]);

  const pairs = useMemo(() => {
    if (!Array.isArray(contentItems)) {
      console.warn('[MemoryMatchGame] contentItems is not an array:', contentItems);
      return [];
    }

    const items = contentItems || [];

    // Check if we have labeled images (image with text label)
    const labeledImages = items.filter(c => c.type === 'image' && c.src && c.text);
    const unlabeledImages = items.filter(c => c.type === 'image' && c.src && !c.text);
    const textItems = items.filter(c => c.type === 'text' && c.text && !c.src);

    const paired = [];

    // If we have labeled images, match text to image
    if (labeledImages.length > 0) {
      labeledImages.forEach((c, i) => {
        // One card is the text
        paired.push({
          type: 'text',
          text: c.text,
          id: `text-${i}`,
          pairId: i
        });
        // One card is the image
        paired.push({
          type: 'image',
          src: c.src,
          id: `image-${i}`,
          pairId: i
        });
      });
    }
    // If we have unlabeled images, match image to image
    else if (unlabeledImages.length >= 1) {
      unlabeledImages.forEach((c, i) => {
        // Create two image cards for each image
        paired.push({
          type: 'image',
          src: c.src,
          id: `image-a-${i}`,
          pairId: i
        });
        paired.push({
          type: 'image',
          src: c.src,
          id: `image-b-${i}`,
          pairId: i
        });
      });
    }
    // If we have text items without images, match text to text
    else if (textItems.length >= 1) {
      textItems.forEach((c, i) => {
        paired.push({
          type: 'text',
          text: c.text,
          id: `text-a-${i}`,
          pairId: i
        });
        paired.push({
          type: 'text',
          text: c.text,
          id: `text-b-${i}`,
          pairId: i
        });
      });
    }

    if (paired.length < 1) return [];
    return paired.sort(() => Math.random() - 0.5);
  }, [contentItems]);

  const playerColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#A855F7', '#F97316'];

  const handleClick = (card) => {
    if (flipped.size >= 2 || matched.has(card.id) || flipped.has(card.id)) return;
    if (soundOn) sounds.flip();
    const next = new Set(flipped);
    next.add(card.id);
    setFlipped(next);
    if (lastFlipped === null) {
      setLastFlipped(card);
      return;
    }
    const isMatch = lastFlipped.pairId === card.pairId;
    if (isMatch) {
      if (soundOn) sounds.match();
      setMatched(prev => new Set([...prev, lastFlipped.id, card.id]));
      // Add point to current player
      setScores(prev => ({
        ...prev,
        [currentPlayerIndex]: (prev[currentPlayerIndex] || 0) + 1
      }));
    } else {
      if (soundOn) sounds.wrong();
    }
    setLastFlipped(null);
    setTimeout(() => {
      setFlipped(new Set());
      // Move to next player
      setCurrentPlayerIndex(prev => (prev + 1) % (players.length || 1));
    }, 800);
  };

  const reset = () => {
    setFlipped(new Set());
    setMatched(new Set());
    setLastFlipped(null);
    setCurrentPlayerIndex(0);
    const initialScores = {};
    players.forEach((p, i) => initialScores[i] = 0);
    setScores(initialScores);
    setPointsGiven(false);
    setPointsToGive(1);
    setWinnerData(null);
  };

  useEffect(() => {
    if (matched.size === pairs.length && pairs.length > 0 && soundOn) sounds.win();
  }, [matched.size, pairs.length, soundOn]);

  const styles = {
    container: {
      position: 'fixed',
      inset: 0,
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '3px solid #8B5CF6',
      flexShrink: 0,
      position: 'relative',
      zIndex: 1,
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
      border: '2px solid #FF6B6B',
      borderRadius: '12px',
      padding: '10px 18px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
    },
    gameArea: {
      flex: 1,
      display: 'flex',
      gap: 15,
      padding: '10px',
      position: 'relative',
      zIndex: 1
    },
    leftSidebar: {
      width: '140px',
      maxHeight: '160px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '10px',
      background: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '16px',
      border: '3px solid #8B5CF6',
      boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)'
    },
    rightSidebar: {
      width: '140px',
     maxHeight: '160px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '10px',
      background: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '16px',
      border: '3px solid #8B5CF6',
      boxShadow: '0 8px 30px rgba(139, 92, 246, 0.2)'
    },
    playerCard: (index) => ({
      width: '100%',
      padding: '8px',
      height: '100%',
      borderRadius: '10px',
      background: index === currentPlayerIndex
        ? `linear-gradient(135deg, ${playerColors[index % playerColors.length]}40, ${playerColors[index % playerColors.length]}30)`
        : 'rgba(255, 255, 255, 0.9)',
      border: `3px solid ${playerColors[index % playerColors.length]}`,
      boxShadow: index === currentPlayerIndex
        ? `0 6px 20px ${playerColors[index % playerColors.length]}60, 0 0 0 2px ${playerColors[index % playerColors.length]}30`
        : '0 3px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      transform: index === currentPlayerIndex ? 'scale(1.05)' : 'scale(1)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }),
    playerAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '4px',
      border: '2px solid #E5E7EB'
    },
    playerName: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: '2px',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%'
    },
    playerScore: {
      fontSize: '20px',
      fontWeight: '900',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '2px 2px 4px rgba(139, 92, 246, 0.3)'
    },
    turnBadge: {
      position: 'absolute',
      bottom: '6px',
      right: '1px',
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#fff',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '10px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5)',
      animation: 'pulse 1.5s infinite'
    },
    boardContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 20px'
    },
    boardWrap: {
      width: '100%',
      maxWidth: 620,
      aspectRatio: '1 / 1',
      borderRadius: '20px',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '4px solid #8B5CF6',
      boxShadow: '0 14px 35px rgba(139, 92, 246, 0.3)'
    },
    iconBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 45,
      height: 45,
      borderRadius: '12px',
      border: '2px solid #8B5CF6',
      background: 'rgba(139, 92, 246, 0.1)',
      color: '#8B5CF6',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
    }
  };

  if (pairs.length < 2) {
    return (
      <div data-game-screen style={styles.container}>
        <PixiBackdrop classColor={classColor} variant="light" />
        <nav style={styles.nav}>
          <button onClick={onBack} style={styles.backBtn}><ChevronLeft size={22} /> Back</button>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#374151' }}>Memory Match</h2>
        </nav>
        <main style={{ ...styles.main, textAlign: 'center', paddingTop: 60, position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#9ca3af', fontSize: 16 }}>Add at least 2 items (images or text) in the Games hub to play Memory Match.</p>
          <button onClick={onBack} style={{ marginTop: 20, padding: '12px 24px', borderRadius: 12, border: `2px solid ${classColor}`, background: 'transparent', color: classColor, fontWeight: 700, cursor: 'pointer' }}>Back to Games</button>
        </main>
      </div>
    );
  }

  return (
    <div data-game-screen style={styles.container}>
      <PixiBackdrop classColor={classColor} variant="light" />
      <nav style={styles.nav}>
        <button onClick={onBack} style={styles.backBtn}><ChevronLeft size={18} /> Back</button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🧠 Memory Match</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => setSoundOn(s => !s)} style={styles.iconBtn} title={soundOn ? 'Mute sounds' : 'Sounds on'}>
            {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={onReset} style={{ ...styles.iconBtn, padding: '10px 18px', width: 'auto', background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)', borderColor: '#FF6B6B', color: '#fff' }} title="Back to Game Config">
            <RotateCcw size={18} style={{ marginRight: 6 }} />
            New game
          </button>
        </div>
      </nav>
      <div style={styles.gameArea}>
        {/* Left Player Panel */}
        {players.length >= 1 && (
          <div style={styles.leftSidebar}>
            <div
              style={styles.playerCard(0)}
              onMouseEnter={(e) => {
                if (currentPlayerIndex !== 0) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPlayerIndex !== 0) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {currentPlayerIndex === 0 && (
                <div style={styles.turnBadge}>🎯 YOUR TURN!</div>
              )}
              <div style={{ ...styles.playerAvatar, borderColor: playerColors[0], color: playerColors[0] }}>
                {(players[0]?.name || 'P')[0]?.toUpperCase() || 'P'}
              </div>
              <div style={styles.playerName}>{players[0]?.name || 'Player 1'}</div>
              <div style={styles.playerScore}>{scores[0] || 0}</div>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div style={styles.boardContainer}>
          <div style={styles.boardWrap}>
            <MemoryMatchPixiBoard
              pairs={pairs}
              flipped={flipped}
              matched={matched}
              onSelect={handleClick}
            />
          </div>
        </div>

        {/* Right Player Panel */}
        {players.length >= 2 && (
          <div style={styles.rightSidebar}>
            <div
              style={styles.playerCard(1)}
              onMouseEnter={(e) => {
                if (currentPlayerIndex !== 1) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPlayerIndex !== 1) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {currentPlayerIndex === 1 && (
                <div style={styles.turnBadge}>🎯 YOUR TURN!</div>
              )}
              <div style={{ ...styles.playerAvatar, borderColor: playerColors[1], color: playerColors[1] }}>
                {(players[1]?.name || 'P')[0]?.toUpperCase() || 'P'}
              </div>
              <div style={styles.playerName}>{players[1]?.name || 'Player 2'}</div>
              <div style={styles.playerScore}>{scores[1] || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Full-screen Win Overlay */}
      {matched.size === pairs.length && pairs.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(139, 92, 246, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.5s ease',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '100%'
          }}>
            <p style={{ fontSize: 42, fontWeight: 900, color: '#8B5CF6', textShadow: '0 0 40px rgba(139, 92, 246, 0.4)', marginBottom: 20 }}>
              {(() => {
                if (players.length <= 1) return '🎉 YOU WON! 🎉';

                const maxScore = Math.max(...Object.values(scores));
                const winnerIndices = Object.entries(scores)
                  .filter(([_, score]) => score === maxScore)
                  .map(([idx]) => parseInt(idx));

                if (winnerIndices.length > 1) {
                  return "🤝 IT'S A TIE! 🤝";
                } else if (winnerIndices.length === 1) {
                  const winner = players[winnerIndices[0]];
                  return `🎉 ${winner?.name || 'Player 1'} WINS! 🎉`;
                }
                return '🎉 GAME OVER! 🎉';
              })()}
            </p>

            {players.length > 1 && (
              <div style={{ fontSize: 18, color: '#6B7280', marginBottom: 20 }}>
                {players.map((player, idx) => (
                  <div key={idx} style={{ margin: '8px 0', color: playerColors[idx % playerColors.length], fontWeight: 'bold', fontSize: 16 }}>
                    {player.name}: {scores[idx] || 0} points
                  </div>
                ))}
              </div>
            )}

            {/* Give Points Section for single player or show winner for multiplayer */}
            {selectedClass && onGivePoints && (
              <>
                {!pointsGiven && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280' }}>
                      {players.length === 1 ? `Give points to ${players[0].name}:` : 'Give points to winner:'}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[1, 2, 3, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => setPointsToGive(val)}
                          style={{
                            padding: '12px 20px',
                            fontSize: 18,
                            fontWeight: '800',
                            background: pointsToGive === val
                              ? 'linear-gradient(135deg, #10B981, #059669)'
                              : 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                            color: pointsToGive === val ? '#fff' : '#374151',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            minWidth: '50px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                            if (pointsToGive !== val) {
                              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            if (pointsToGive !== val) {
                              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }
                          }}
                        >
                          +{val}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        // Find winner(s) based on scores
                        const maxScore = Math.max(...Object.values(scores));
                        const winnerIndices = Object.entries(scores)
                          .filter(([_, score]) => score === maxScore)
                          .map(([idx]) => parseInt(idx));
                        const winners = winnerIndices.map(idx => players[idx]);
                        if (winners.length > 0 && onGivePoints) {
                          onGivePoints(winners, pointsToGive);
                          setWinnerData(winners.length === 1 ? winners[0] : winners);
                          setPointsGiven(true);
                        }
                      }}
                      style={{
                        padding: '12px 32px',
                        fontSize: 16,
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        cursor: 'pointer',
                        boxShadow: '0 6px 24px rgba(245,158,11,0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 8px 32px rgba(245,158,11,0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 6px 24px rgba(245,158,11,0.4)';
                      }}
                    >
                      🎁 Give {pointsToGive} Point{pointsToGive !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}

                {pointsGiven && (
                  <div style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#10B981',
                    textAlign: 'center',
                    padding: '12px 24px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 12,
                    border: '2px solid #10B981',
                    marginBottom: 20
                  }}>
                    ✅ {pointsToGive} point{pointsToGive !== 1 ? 's' : ''} given{Array.isArray(winnerData) && winnerData.length > 1
                      ? ' to all winners!'
                      : ` to ${winnerData?.name || 'winner'}!`}
                  </div>
                )}
              </>
            )}

            <button
              onClick={reset}
              style={{
                padding: '16px 40px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                color: 'white',
                fontWeight: 900,
                cursor: 'pointer',
                fontSize: 18,
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
              }}
            >
              🎮 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
