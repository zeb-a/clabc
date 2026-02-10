import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ChevronLeft, X, ChevronRight, Image as ImageIcon, Trophy } from 'lucide-react';
import * as gameSounds from '../utils/gameSounds';
import { useTranslation } from '../i18n';

const PLAYER_COLORS = ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'];

class HorseRaceScene extends Phaser.Scene {
  constructor(config) {
    super({ key: 'HorseRaceScene' });
    this.config = config;
    this.horses = [];
    this.sounds = gameSounds.sounds;
    this.winnerDeclared = false;
  }

  create() {
    const { width, height } = this.scale;
    const players = this.config.players || [];
    const numPlayers = Math.min(Math.max(players.length, 2), 4);
    const totalSteps = 10;
    this.totalSteps = totalSteps;
    this.numPlayers = numPlayers;
    this.winnerDeclared = false;

    // Background gradient (sky -> grass)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87ceeb, 0xb0e0e6, 0x87ceeb, 0x98fb98, 1);
    bg.fillRect(0, 0, width, height);

    // Track area (vertical lanes)
    const trackWidth = Math.min(width - 40, 900);
    const trackHeight = Math.min(height - 140, 900);
    const trackX = width / 2;
    const trackY = height / 2 + 20;
    const laneWidth = trackWidth / numPlayers;

    const track = this.add.graphics();
    track.fillStyle(0x2d3748, 1);
    track.fillRoundedRect(trackX - trackWidth / 2, trackY - trackHeight / 2, trackWidth, trackHeight, 18);
    track.lineStyle(5, 0x1a1a1a, 1);
    track.strokeRoundedRect(trackX - trackWidth / 2, trackY - trackHeight / 2, trackWidth, trackHeight, 18);

    // Grass borders
    const grass = this.add.graphics();
    grass.fillStyle(0x4ade80, 1);
    grass.fillRoundedRect(trackX - trackWidth / 2 - 6, trackY - trackHeight / 2 - 10, trackWidth + 12, 10, 6);
    grass.fillRoundedRect(trackX - trackWidth / 2 - 6, trackY + trackHeight / 2, trackWidth + 12, 10, 6);

    const topY = trackY - trackHeight / 2 + 24;
    const bottomY = trackY + trackHeight / 2 - 24;
    const segmentH = (bottomY - topY) / (totalSteps + 0.5);
    this.topY = topY;
    this.bottomY = bottomY;
    this.segmentH = segmentH;
    this.trackX = trackX;
    this.trackWidth = trackWidth;
    this.trackY = trackY;
    this.trackHeight = trackHeight;
    this.laneWidth = laneWidth;

    // Lane dividers (dashed)
    for (let i = 1; i < numPlayers; i++) {
      const x = trackX - trackWidth / 2 + laneWidth * i;
      const line = this.add.graphics();
      line.lineStyle(3, 0xffffff, 0.6);
      const dash = 18;
      const gap = 14;
      for (let y = topY; y < bottomY; y += dash + gap) {
        line.lineBetween(x, y, x, Math.min(y + dash, bottomY));
      }
    }

    // Start / Finish lines (checkered)
    this.drawCheckeredLine(trackX - trackWidth / 2 + 10, bottomY, trackWidth - 20);
    this.drawCheckeredLine(trackX - trackWidth / 2 + 10, topY, trackWidth - 20);

    const startLabel = this.add.text(trackX, bottomY + 14, 'START', {
      fontSize: '12px',
      fontWeight: '900',
      color: '#f97316',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });
    startLabel.setOrigin(0.5, 0);

    const finishLabel = this.add.text(trackX, topY - 18, 'FINISH', {
      fontSize: '12px',
      fontWeight: '900',
      color: '#f97316',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });
    finishLabel.setOrigin(0.5, 0);

    // Hurdles per step
    for (let step = 1; step <= totalSteps; step++) {
      const y = bottomY - segmentH * step;
      for (let lane = 0; lane < numPlayers; lane++) {
        const x0 = trackX - trackWidth / 2 + laneWidth * lane + 10;
        const x1 = x0 + laneWidth - 20;
        const hurdle = this.add.graphics();
        hurdle.fillStyle(0xc08452, 1);
        hurdle.fillRoundedRect(x0 + 6, y - 3, Math.max(18, (x1 - x0) - 12), 6, 3);
        hurdle.fillStyle(0x7c2d12, 1);
        hurdle.fillRoundedRect(x0, y - 14, 8, 28, 3);
        hurdle.fillRoundedRect(x1 - 8, y - 14, 8, 28, 3);
      }
    }

    // Step numbers (1..10)
    for (let step = 1; step <= totalSteps; step++) {
      const y = bottomY - segmentH * (step - 0.5);
      const t = this.add.text(trackX + trackWidth / 2 + 18, y, `${step}`, {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#9ca3af',
        fontFamily: 'Comic Sans MS, cursive, sans-serif'
      });
      t.setOrigin(0.5);
    }

    // Create horses (one per player)
    const playerNames = players.map((p, i) => p.name || `Player ${i + 1}`);
    for (let i = 0; i < numPlayers; i++) {
      const x = trackX - trackWidth / 2 + laneWidth * (i + 0.5);
      const horse = this.createHorse(x, bottomY, PLAYER_COLORS[i], i, playerNames[i], players[i]?.avatar);
      horse.position = 0;
      horse.playerIndex = i;
      horse.lastJumpTime = 0;
      this.horses.push(horse);
    }
  }

  drawCheckeredLine(x, y, width) {
    const g = this.add.graphics();
    const checkSize = 8;
    const height = 10;
    for (let dx = 0; dx < width; dx += checkSize) {
      const isBlack = (Math.floor(dx / checkSize) % 2) === 0;
      g.fillStyle(isBlack ? 0x000000 : 0xffffff, 1);
      g.fillRect(x + dx, y - height / 2, checkSize, height);
    }
  }

  createHorse(x, y, accentColor, index, playerName = '', avatarSrc) {
    const container = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.25);
    shadow.fillEllipse(0, 18, 84, 18);
    container.add(shadow);
    container.shadow = shadow;

    if (playerName) {
      const nameText = this.add.text(0, -72, playerName, {
        fontSize: '14px',
        fontWeight: 'bold',
        color: accentColor,
        fontFamily: 'Comic Sans MS, cursive, sans-serif',
        stroke: '#000000',
        strokeThickness: 3
      });
      nameText.setOrigin(0.5);
      container.add(nameText);
    }

    // Horse body (more detailed, modern shading)
    const body = this.add.graphics();
    body.fillGradientStyle(0x7c2d12, 0x92400e, 0x7c2d12, 0xb45309, 1);
    body.fillEllipse(0, 0, 86, 34);
    body.fillStyle(0x78350f, 0.95);
    body.fillEllipse(28, -10, 34, 18); // shoulder
    body.fillStyle(0x92400e, 0.95);
    body.fillEllipse(-28, -10, 28, 16); // hip
    // Neck
    body.fillGradientStyle(0x92400e, 0x78350f, 0x92400e, 0x78350f, 1);
    body.fillRoundedRect(18, -34, 22, 34, 10);
    // Head
    body.fillStyle(0x78350f, 1);
    body.fillEllipse(34, -44, 26, 18);
    // Nose highlight
    body.fillStyle(0xfef3c7, 0.35);
    body.fillEllipse(42, -44, 10, 6);
    // Mane
    body.fillStyle(0x1f2937, 0.9);
    body.fillRoundedRect(18, -44, 10, 30, 6);
    // Tail
    body.fillStyle(0x1f2937, 0.9);
    body.fillRoundedRect(-46, -10, 12, 34, 6);
    container.add(body);
    container.bodyGfx = body;

    // Legs (stylized but not pixel-art)
    const legs = this.add.graphics();
    legs.fillStyle(0x451a03, 1);
    const legX = [-26, -10, 10, 26];
    for (let i = 0; i < legX.length; i++) {
      legs.fillRoundedRect(legX[i] - 4, 10, 8, 26, 4);
      // Hoof
      legs.fillStyle(0x111827, 1);
      legs.fillRoundedRect(legX[i] - 6, 32, 12, 8, 3);
      legs.fillStyle(0x451a03, 1);
    }
    container.add(legs);
    container.legs = legs;

    // Rider (jockey) with accent jersey + optional avatar head
    const rider = this.add.container(-4, -36);
    const riderBody = this.add.graphics();
    riderBody.fillStyle(Phaser.Display.Color.HexStringToColor(accentColor).color, 1);
    riderBody.fillRoundedRect(-10, 10, 20, 18, 8);
    riderBody.fillStyle(0xffffff, 0.8);
    riderBody.fillRoundedRect(-10, 16, 20, 4, 2);
    rider.add(riderBody);

    const helmet = this.add.graphics();
    helmet.fillStyle(0x111827, 1);
    helmet.fillCircle(0, 4, 10);
    helmet.fillStyle(0xffffff, 0.25);
    helmet.fillCircle(-3, 1, 4);
    rider.add(helmet);

    if (avatarSrc) {
      const key = `horse_avatar_${index}`;
      if (!this.textures.exists(key)) {
        this.textures.addBase64(key, avatarSrc);
      }
      const avatar = this.add.image(0, 4, key);
      avatar.setDisplaySize(18, 18);
      const maskGfx = this.make.graphics({ x: 0, y: 0, add: false });
      maskGfx.fillStyle(0xffffff, 1);
      maskGfx.fillCircle(0, 4, 9);
      avatar.setMask(maskGfx.createGeometryMask());
      rider.add(avatar);
    }

    container.add(rider);
    container.rider = rider;

    container.setScale(1.1);
    return container;
  }

  jumpHorse(playerIndex) {
    if (this.winnerDeclared) return;
    const horse = this.horses[playerIndex];
    if (!horse) return;
    if (horse.position >= this.totalSteps) return;

    const now = Date.now();
    if (now - (horse.lastJumpTime || 0) < 220) return;
    horse.lastJumpTime = now;

    horse.position += 1;
    const targetY = this.bottomY - this.segmentH * horse.position;

    // Sound + animation - use player-specific neigh sound
    this.sounds.neigh?.(playerIndex);

    const duration = 360;
    const startY = horse.y;
    const peakY = Math.min(startY, targetY) - 36;

    this.tweens.chain({
      targets: horse,
      tweens: [
        { y: peakY, duration: duration * 0.45, ease: 'Sine.easeOut' },
        { y: targetY, duration: duration * 0.55, ease: 'Back.easeOut' }
      ]
    });

    // Shadow squash for jump feel
    this.tweens.add({
      targets: horse.shadow,
      scaleX: 0.85,
      scaleY: 0.85,
      duration: duration * 0.45,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Body bob
    this.tweens.add({
      targets: horse.bodyGfx,
      alpha: 0.96,
      duration: duration * 0.3,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Winner check
    if (horse.position >= this.totalSteps) {
      setTimeout(() => this.checkRaceComplete(), duration + 20);
    }
  }

  checkRaceComplete() {
    if (this.winnerDeclared) return;
    for (let horse of this.horses) {
      if (horse.position >= this.totalSteps) {
        this.winnerDeclared = true;
        const idx = horse.playerIndex;
        const name = this.config.players[idx]?.name || `Player ${idx + 1}`;
        const color = this.config.players[idx]?.color || PLAYER_COLORS[idx];
        this.sounds.win?.();
        setTimeout(() => this.sounds.celebration?.(), 800);
        this.config.onWinner?.(name, color, idx);
        break;
      }
    }
  }
}

export default function HorseRaceGame({ items = [], players = [], onBack, contentType = 'text', onGivePoints }) {
  const { t } = useTranslation();
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [pointsToGive, setPointsToGive] = useState(1);
  const [pointsGiven, setPointsGiven] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new HorseRaceScene({
      players: players.map((p, i) => ({
        ...p,
        color: p.color || PLAYER_COLORS[i],
      })),
      onWinner: (playerName, color, playerIndex) => {
        const basePlayer = players[playerIndex] || {};
        setWinner({ ...basePlayer, name: playerName, color: color, index: playerIndex });
        setConfettiActive(true);
        setShowWinnerModal(true);
      }
    });
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerRef.current,
      backgroundColor: '#87CEEB',
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: scene
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [players.length]);

  const safeItems = Array.isArray(items) ? items : [];
  const currentSlide = safeItems[slideshowIndex];
  const hasImages = contentType === 'images';

  const handlePedal = (playerIndex) => {
    sceneRef.current?.jumpHorse(playerIndex);
  };

  const handleWinnerModalClose = () => {
    setShowWinnerModal(false);
    setConfettiActive(false);
    if (onBack) onBack();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)', zIndex: 9999 }}>
      {/* Header */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        background: 'rgba(55,65,81,0.9)',
        color: '#fff',
        borderBottom: '3px solid #f59e0b',
        flexShrink: 0
      }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          <ChevronLeft size={22} /> {t('games.exit')}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 18 }}>🐎 {t('games.horserace')}</span>
          <span style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>
            {t('games.press_pedal_to_jump')}
          </span>
        </div>
        <button
          onClick={() => setSlideshowOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(245,158,11,0.4)'
          }}
        >
          <ImageIcon size={18} /> {t('games.slideshow')}
        </button>
      </nav>

      {/* Phaser canvas */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />

      {/* Pedals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.max(2, Math.min(players.length || 2, 4))}, minmax(0, 1fr))`,
        gap: 10,
        padding: '12px 14px',
        background: 'rgba(15,23,42,0.85)',
        borderTop: '2px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0
      }}>
        {(players.slice(0, 4).length ? players.slice(0, 4) : [{ name: 'P1' }, { name: 'P2' }]).map((p, i) => (
          <button
            key={p.id || i}
            onPointerDown={() => handlePedal(i)}
            onMouseDown={() => handlePedal(i)}
            style={{
              padding: '14px 14px',
              borderRadius: 16,
              border: '2px solid rgba(255,255,255,0.15)',
              background: `linear-gradient(135deg, ${PLAYER_COLORS[i]}, rgba(255,255,255,0.15))`,
              color: '#0b1220',
              fontWeight: 900,
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}
          >
            {t('games.jump')} — {p.name || `P${i + 1}`}
          </button>
        ))}
      </div>

      {/* Slideshow modal */}
      {slideshowOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: 24
          }}
          onClick={() => setSlideshowOpen(false)}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSlideshowOpen(false)}
              style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            {currentSlide && (
              hasImages ? (
                <img src={currentSlide} alt="" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 12 }} />
              ) : (
                <div style={{ fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 'bold', color: '#1f2937', textAlign: 'center', padding: 20 }}>
                  {currentSlide}
                </div>
              )
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setSlideshowIndex(i => Math.max(0, i - 1))}
                disabled={slideshowIndex === 0}
                style={{ padding: 12, borderRadius: 12, border: '2px solid #f59e0b', background: '#fff', color: '#b45309', cursor: slideshowIndex === 0 ? 'not-allowed' : 'pointer', opacity: slideshowIndex === 0 ? 0.5 : 1 }}
              >
                <ChevronLeft size={28} />
              </button>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#374151' }}>
                {slideshowIndex + 1} / {safeItems.length}
              </span>
              <button
                onClick={() => setSlideshowIndex(i => Math.min(safeItems.length - 1, i + 1))}
                disabled={slideshowIndex >= safeItems.length - 1}
                style={{ padding: 12, borderRadius: 12, border: '2px solid #f59e0b', background: '#fff', color: '#b45309', cursor: slideshowIndex >= safeItems.length - 1 ? 'not-allowed' : 'pointer', opacity: slideshowIndex >= safeItems.length - 1 ? 0.5 : 1 }}
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Celebration Modal */}
      {showWinnerModal && winner && (
        <>
          {confettiActive && <Confetti />}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10003,
              padding: 24,
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <div
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                borderRadius: 32,
                padding: 48,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 28,
                boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                border: '6px solid #fff',
                animation: 'bounceIn 0.5s ease-out'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  animation: 'pulse 1.5s infinite'
                }}
              >
                <Trophy size={60} color="#FFD700" fill="#FFD700" strokeWidth={2} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  {t('games.winner')}!
                </div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#111827', marginTop: 8 }}>
                  {winner.name}
                </div>
              </div>

              <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 20 }}>
                <div style={{ fontWeight: 900, color: '#111827', marginBottom: 12 }}>{t('games.give_points_to_winner')}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                  {[1, 2, 3, 5].map(p => (
                    <button
                      key={p}
                      onClick={() => setPointsToGive(p)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: 14,
                        border: pointsToGive === p ? '3px solid #111827' : '2px solid rgba(17,24,39,0.2)',
                        background: pointsToGive === p ? '#111827' : '#fff',
                        color: pointsToGive === p ? '#fff' : '#111827',
                        fontWeight: 900,
                        cursor: 'pointer'
                      }}
                    >
                      +{p}
                    </button>
                  ))}
                </div>

                <button
                  disabled={pointsGiven}
                  onClick={() => {
                    if (pointsGiven) return;
                    onGivePoints?.([winner], pointsToGive);
                    setPointsGiven(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: 'none',
                    background: pointsGiven ? '#94a3b8' : 'linear-gradient(135deg, #111827, #334155)',
                    color: '#fff',
                    fontWeight: 900,
                    cursor: pointsGiven ? 'not-allowed' : 'pointer'
                  }}
                >
                  {pointsGiven ? t('games.points_given').replace('{points}', pointsToGive).replace('{name}', winner.name) : t('games.give_points_btn').replace('{points}', pointsToGive)}
                </button>
              </div>

              <button
                onClick={handleWinnerModalClose}
                style={{
                  padding: '14px 20px',
                  borderRadius: 16,
                  border: '3px solid rgba(255,255,255,0.9)',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {t('games.back_to_config')}
              </button>
            </div>
            <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.1);} }
            `}</style>
          </div>
        </>
      )}
    </div>
  );
}

function Confetti() {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA'];
  useEffect(() => {
    const confettiCount = 150;
    const confettiElements = [];
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -20px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        z-index: 10004;
        animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
      `;
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }
    const timeout = setTimeout(() => confettiElements.forEach(el => el.remove()), 5000);
    return () => {
      clearTimeout(timeout);
      confettiElements.forEach(el => el.remove());
    };
  }, []);
  return (
    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `}</style>
  );
}

