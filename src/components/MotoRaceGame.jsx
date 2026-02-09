import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ChevronLeft, X, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { sounds } from '../utils/gameSounds';

const BIKE_COLORS = [0x00d9ff, 0xff00ff, 0x00ff88, 0xffcc00];
const ROAD_COLOR = 0x374151;
const ROAD_LINE = 0x9ca3af;

class MotoRaceScene extends Phaser.Scene {
  constructor(config) {
    super({ key: 'MotoRaceScene' });
    this.config = config;
    this.bikes = [];
    this.stepReached = []; // which step indices (0..9) have already triggered overlay
  }

  create() {
    const { width, height } = this.scale;
    const players = this.config.players || [];
    const numPlayers = Math.min(Math.max(players.length, 2), 4);
    const totalSteps = 10;

    // Gradient background - sky and ground
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0xB0E0E6, 0x87CEEB, 0x98FB98, 1);
    bg.fillRect(0, 0, width, height);

    // Road - horizontal strip with 10 segments
    const roadY = height * 0.5;
    const roadHeight = Math.min(220, height * 0.45);
    const segmentWidth = width / (totalSteps + 1);
    const laneHeight = roadHeight / numPlayers;

    const roadBg = this.add.graphics();
    roadBg.fillStyle(ROAD_COLOR, 1);
    roadBg.fillRoundedRect(20, roadY - roadHeight / 2, width - 40, roadHeight, 12);
    roadBg.lineStyle(4, 0x1f2937, 1);
    roadBg.strokeRoundedRect(20, roadY - roadHeight / 2, width - 40, roadHeight, 12);

    // Lane dividers and step lines
    for (let step = 1; step <= totalSteps; step++) {
      const x = 20 + (segmentWidth * step);
      const line = this.add.graphics();
      line.lineStyle(3, ROAD_LINE, 0.8);
      line.lineBetween(x, roadY - roadHeight / 2, x, roadY + roadHeight / 2);
    }
    for (let i = 1; i < numPlayers; i++) {
      const y = roadY - roadHeight / 2 + laneHeight * i;
      const line = this.add.graphics();
      line.lineStyle(2, ROAD_LINE, 0.5);
      line.lineBetween(20, y, width - 20, y);
    }

    // Step labels (1-10)
    for (let step = 1; step <= totalSteps; step++) {
      const x = 20 + segmentWidth * (step - 0.5);
      const t = this.add.text(x, roadY + roadHeight / 2 + 18, `${step}`, {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#9ca3af',
        fontFamily: 'Comic Sans MS, cursive, sans-serif'
      });
      t.setOrigin(0.5);
    }

    // Create motorcycles (one per player)
    const startX = 20 + segmentWidth * 0.5;
    const playerNames = (this.config.players || []).map(p => p.name || `Player ${p.id + 1}`);
    for (let i = 0; i < numPlayers; i++) {
      const laneY = roadY - roadHeight / 2 + laneHeight * (i + 0.5);
      const bike = this.createMotorcycle(startX, laneY, BIKE_COLORS[i], i, playerNames[i]);
      bike.position = 0;
      bike.playerIndex = i;
      bike.lastClickTime = 0;
      this.bikes.push(bike);
    }

    this.totalSteps = totalSteps;
    this.segmentWidth = segmentWidth;
    this.roadY = roadY;
    this.laneHeight = laneHeight;
    this.roadHeight = roadHeight;
    this.numPlayers = numPlayers;
  }

  createMotorcycle(x, y, color, index, playerName = '') {
    const container = this.add.container(x, y);
    if (playerName) {
      const nameText = this.add.text(0, -42, playerName, {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#' + color.toString(16).padStart(6, '0'),
        fontFamily: 'Comic Sans MS, cursive, sans-serif'
      });
      nameText.setOrigin(0.5);
      container.add(nameText);
    }
    const bodyW = 50;
    const bodyH = 22;
    const wheelR = 10;

    // Shadow
    const shadow = this.add.ellipse(0, 8, bodyW + 20, 12, 0x000000, 0.2);
    container.add(shadow);

    // Back wheel
    const wheel1 = this.add.circle(-bodyW / 2 - 2, 6, wheelR, 0x1f2937, 1);
    wheel1.setStrokeStyle(2, 0x4b5563);
    container.add(wheel1);
    // Front wheel
    const wheel2 = this.add.circle(bodyW / 2 + 2, 6, wheelR, 0x1f2937, 1);
    wheel2.setStrokeStyle(2, 0x4b5563);
    container.add(wheel2);

    // Bike body (streamlined)
    const body = this.add.graphics();
    body.fillStyle(color, 1);
    body.fillRoundedRect(-bodyW / 2, -4, bodyW, bodyH, 8);
    body.lineStyle(3, 0xffffff, 0.6);
    body.strokeRoundedRect(-bodyW / 2, -4, bodyW, bodyH, 8);
    container.add(body);

    // Rider - helmet + body
    const helmet = this.add.circle(0, -18, 12, 0xffffff, 1);
    helmet.setStrokeStyle(2, color);
    container.add(helmet);
    const riderBody = this.add.rectangle(0, -6, 16, 14, color, 0.9);
    container.add(riderBody);

    container.setSize(bodyW + 40, 50);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => {
      const now = Date.now();
      const isDouble = now - container.lastClickTime < 350;
      container.lastClickTime = now;
      if (isDouble && container.position > 0) {
        container.position--;
        sounds.move();
        this.moveBikeTo(container, container.position);
      } else if (!isDouble && container.position < this.totalSteps) {
        container.position++;
        sounds.move();
        this.moveBikeTo(container, container.position);
        if (container.position >= 1 && container.position <= this.totalSteps) {
          const stepIndex = container.position - 1;
          if (!this.stepReached[stepIndex]) {
            this.stepReached[stepIndex] = true;
            this.config.onReachStep && this.config.onReachStep(stepIndex);
            this.scene.pause();
          }
        }
      }
    });
    container.on('pointerover', () => { container.setScale(1.08); });
    container.on('pointerout', () => { container.setScale(1); });

    return container;
  }

  moveBikeTo(bike, step) {
    const startX = 20 + this.segmentWidth * 0.5;
    const targetX = 20 + this.segmentWidth * (step + 0.5);
    this.tweens.add({
      targets: bike,
      x: targetX,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  resume() {
    this.scene.resume();
  }
}

export default function MotoRaceGame({ items = [], players = [], onBack, contentType = 'text' }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [showStepOverlay, setShowStepOverlay] = useState(false);
  const [overlayStepIndex, setOverlayStepIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !items.length) return;

    const handleReachStep = (stepIndex) => {
      setOverlayStepIndex(stepIndex);
      setShowStepOverlay(true);
    };

    const scene = new MotoRaceScene({
      players: players.map((p, i) => ({ ...p, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] })),
      onReachStep: handleReachStep
    });

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
    };
  }, [items.length, players.length]);

  const handleCloseStepOverlay = () => {
    setShowStepOverlay(false);
    const scene = gameRef.current?.scene?.getScene?.('MotoRaceScene');
    if (scene && scene.scene) scene.scene.resume();
  };

  const safeItems = Array.isArray(items) ? items : [];
  const currentSlide = safeItems[slideshowIndex];
  const hasImages = contentType === 'images';

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
        borderBottom: '3px solid #F97316',
        flexShrink: 0
      }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
        >
          <ChevronLeft size={22} /> Exit
        </button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>🏍️ MotoRace</span>
        <button
          onClick={() => setSlideshowOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(249,115,22,0.4)'
          }}
        >
          <ImageIcon size={18} /> Slideshow
        </button>
      </nav>

      {/* Phaser canvas */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />

      {/* Slideshow modal - remembers last slide */}
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
                style={{ padding: 12, borderRadius: 12, border: '2px solid #F97316', background: '#fff', color: '#F97316', cursor: slideshowIndex === 0 ? 'not-allowed' : 'pointer', opacity: slideshowIndex === 0 ? 0.5 : 1 }}
              >
                <ChevronLeft size={28} />
              </button>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>
                {slideshowIndex + 1} / {safeItems.length}
              </span>
              <button
                onClick={() => setSlideshowIndex(i => Math.min(safeItems.length - 1, i + 1))}
                disabled={slideshowIndex >= safeItems.length - 1}
                style={{ padding: 12, borderRadius: 12, border: '2px solid #F97316', background: '#fff', color: '#F97316', cursor: slideshowIndex >= safeItems.length - 1 ? 'not-allowed' : 'pointer', opacity: slideshowIndex >= safeItems.length - 1 ? 0.5 : 1 }}
              >
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step overlay - content for current step (pauses race until closed) */}
      {showStepOverlay && safeItems[overlayStepIndex] != null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002,
            padding: 24
          }}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              background: '#fff',
              borderRadius: 24,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              border: '4px solid #F97316'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F97316' }}>
              Step {overlayStepIndex + 1} of 10
            </div>
            {hasImages ? (
              <img src={safeItems[overlayStepIndex]} alt="" style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain', borderRadius: 12 }} />
            ) : (
              <div style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 'bold', color: '#1f2937', textAlign: 'center' }}>
                {safeItems[overlayStepIndex]}
              </div>
            )}
            <button
              onClick={handleCloseStepOverlay}
              style={{
                padding: '14px 32px',
                fontSize: 18,
                fontWeight: '700',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(249,115,22,0.4)'
              }}
            >
              Continue race
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
