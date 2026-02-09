import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ChevronLeft, X, ChevronRight, Image as ImageIcon, Trophy } from 'lucide-react';
import * as gameSounds from '../utils/gameSounds';

const BIKE_COLORS = [0x00d9ff, 0xff00ff, 0x00ff88, 0xffcc00];
const ROAD_COLOR = 0x374151;
const ROAD_LINE = 0x9ca3af;

class MotoRaceScene extends Phaser.Scene {
  constructor(config) {
    super({ key: 'MotoRaceScene' });
    this.config = config;
    this.bikes = [];
    this.stepReached = []; // which step indices (0..9) have already triggered overlay
    this.sounds = gameSounds.sounds;
  }

  create() {
    const { width, height } = this.scale;
    const players = this.config.players || [];
    const numPlayers = Math.min(Math.max(players.length, 2), 4);
    const totalSteps = 10;
    this.winnerDeclared = false;

    // Gradient background - sky and ground
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x87CEEB, 0xB0E0E6, 0x87CEEB, 0x98FB98, 1);
    bg.fillRect(0, 0, width, height);

    // Road - horizontal strip with 10 segments
    const roadY = height * 0.5;
    const roadHeight = Math.min(320, height * 0.55);
    const segmentWidth = width / (totalSteps + 1);
    const laneHeight = roadHeight / numPlayers;

    // Road base with asphalt texture look
    const roadBg = this.add.graphics();
    roadBg.fillStyle(0x2d3748, 1);
    roadBg.fillRoundedRect(20, roadY - roadHeight / 2, width - 40, roadHeight, 12);
    roadBg.lineStyle(5, 0x1a1a1a, 1);
    roadBg.strokeRoundedRect(20, roadY - roadHeight / 2, width - 40, roadHeight, 12);

    // Grass borders
    const grass = this.add.graphics();
    grass.fillStyle(0x4ade80, 1);
    grass.fillRoundedRect(15, roadY - roadHeight / 2 - 8, width - 30, 8, 4);
    grass.fillRoundedRect(15, roadY + roadHeight / 2, width - 30, 8, 4);

    // Start line (checkered pattern)
    const startX = 20 + segmentWidth * 0.5;
    const startLine = this.add.graphics();
    const checkSize = 6;
    const startLineWidth = 8;
    for (let y = roadY - roadHeight / 2; y < roadY + roadHeight / 2; y += checkSize) {
      for (let dx = 0; dx < startLineWidth; dx += checkSize) {
        const isBlack = (Math.floor((y - roadY + roadHeight / 2) / checkSize) + Math.floor(dx / checkSize)) % 2 === 0;
        startLine.fillStyle(isBlack ? 0x000000 : 0xffffff, 1);
        startLine.fillRect(startX - startLineWidth / 2 + dx, y, checkSize, checkSize);
      }
    }

    // Finish line (checkered pattern)
    const finishX = 20 + segmentWidth * (totalSteps + 0.5);
    const finishLine = this.add.graphics();
    for (let y = roadY - roadHeight / 2; y < roadY + roadHeight / 2; y += checkSize) {
      for (let dx = 0; dx < startLineWidth; dx += checkSize) {
        const isBlack = (Math.floor((y - roadY + roadHeight / 2) / checkSize) + Math.floor(dx / checkSize)) % 2 === 0;
        finishLine.fillStyle(isBlack ? 0x000000 : 0xffffff, 1);
        finishLine.fillRect(finishX - startLineWidth / 2 + dx, y, checkSize, checkSize);
      }
    }

    // START and FINISH labels
    const startLabel = this.add.text(startX, roadY - roadHeight / 2 - 15, 'START', {
      fontSize: '12px',
      fontWeight: '900',
      color: '#f97316',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });
    startLabel.setOrigin(0.5);

    const finishLabel = this.add.text(finishX, roadY - roadHeight / 2 - 15, 'FINISH', {
      fontSize: '12px',
      fontWeight: '900',
      color: '#f97316',
      fontFamily: 'Arial Black, sans-serif',
      stroke: '#000000',
      strokeThickness: 2
    });
    finishLabel.setOrigin(0.5);

    // Center lane dividers (dashed white lines)
    for (let i = 1; i < numPlayers; i++) {
      const y = roadY - roadHeight / 2 + laneHeight * i;
      const line = this.add.graphics();
      line.lineStyle(3, 0xffffff, 0.8);
      const dashLength = 15;
      const gapLength = 15;
      for (let x = 20; x < width - 20; x += dashLength + gapLength) {
        line.lineBetween(x, y, Math.min(x + dashLength, width - 20), y);
      }
    }

    // Step markers (subtle tick marks instead of full lines)
    for (let step = 1; step <= totalSteps; step++) {
      const x = 20 + (segmentWidth * step);
      const marker = this.add.graphics();
      marker.lineStyle(2, 0x6b7280, 0.6);
      // Top tick
      marker.lineBetween(x, roadY - roadHeight / 2, x, roadY - roadHeight / 2 + 8);
      // Bottom tick
      marker.lineBetween(x, roadY + roadHeight / 2 - 8, x, roadY + roadHeight / 2);
    }

    // Step labels (1-10) below the road
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
    const bikeStartX = 20 + segmentWidth * 0.5;
    const playerNames = (this.config.players || []).map(p => p.name || `Player ${p.id + 1}`);
    for (let i = 0; i < numPlayers; i++) {
      const laneY = roadY - roadHeight / 2 + laneHeight * (i + 0.5);
      const bike = this.createMotorcycle(bikeStartX, laneY, BIKE_COLORS[i], i, playerNames[i]);
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
      const nameText = this.add.text(0, -52, playerName, {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#' + color.toString(16).padStart(6, '0'),
        fontFamily: 'Comic Sans MS, cursive, sans-serif',
        stroke: '#000000',
        strokeThickness: 3
      });
      nameText.setOrigin(0.5);
      container.add(nameText);
    }
    const bodyW = 58;
    const bodyH = 18;
    const wheelR = 9;

    // Enhanced shadow with gradient effect
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 12, bodyW + 28, 16);
    shadow.fillStyle(0x000000, 0.2);
    shadow.fillEllipse(0, 10, bodyW + 20, 12);
    container.add(shadow);

    // Bike frame chassis
    const chassis = this.add.graphics();
    chassis.fillStyle(0x2d3748, 1);
    chassis.fillRoundedRect(-bodyW / 2 + 4, -2, bodyW - 8, 6, 3);
    container.add(chassis);

    // Detailed back wheel with spokes
    const wheel1 = this.add.graphics();
    wheel1.fillStyle(0x1a202c, 1);
    wheel1.fillCircle(-bodyW / 2 + 2, 8, wheelR);
    wheel1.lineStyle(3, 0x4a5568, 1);
    wheel1.strokeCircle(-bodyW / 2 + 2, 8, wheelR);
    // Spokes
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      wheel1.lineStyle(1, 0x718096, 0.7);
      wheel1.lineBetween(
        -bodyW / 2 + 2 + Math.cos(angle) * 2,
        8 + Math.sin(angle) * 2,
        -bodyW / 2 + 2 + Math.cos(angle) * (wheelR - 2),
        8 + Math.sin(angle) * (wheelR - 2)
      );
    }
    // Hub
    wheel1.fillStyle(0x718096, 1);
    wheel1.fillCircle(-bodyW / 2 + 2, 8, 3);
    // Brake disc
    wheel1.lineStyle(2, 0xe53e3e, 1);
    wheel1.strokeCircle(-bodyW / 2 + 2, 8, wheelR - 3);
    container.add(wheel1);

    // Detailed front wheel with spokes
    const wheel2 = this.add.graphics();
    wheel2.fillStyle(0x1a202c, 1);
    wheel2.fillCircle(bodyW / 2 - 2, 8, wheelR);
    wheel2.lineStyle(3, 0x4a5568, 1);
    wheel2.strokeCircle(bodyW / 2 - 2, 8, wheelR);
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * Math.PI / 180;
      wheel2.lineStyle(1, 0x718096, 0.7);
      wheel2.lineBetween(
        bodyW / 2 - 2 + Math.cos(angle) * 2,
        8 + Math.sin(angle) * 2,
        bodyW / 2 - 2 + Math.cos(angle) * (wheelR - 2),
        8 + Math.sin(angle) * (wheelR - 2)
      );
    }
    wheel2.fillStyle(0x718096, 1);
    wheel2.fillCircle(bodyW / 2 - 2, 8, 3);
    wheel2.lineStyle(2, 0xe53e3e, 1);
    wheel2.strokeCircle(bodyW / 2 - 2, 8, wheelR - 3);
    container.add(wheel2);

    // Detailed bike body with panels
    const body = this.add.graphics();
    // Main body panel
    body.fillStyle(color, 1);
    body.fillRoundedRect(-bodyW / 2 + 2, -6, bodyW - 4, bodyH, 6);
    // Highlight
    const darkerColor = Phaser.Display.Color.ValueToColor(color).darken(20).color;
    body.lineStyle(2, darkerColor, 0.5);
    body.strokeRoundedRect(-bodyW / 2 + 2, -6, bodyW - 4, bodyH, 6);
    // Glossy highlight
    body.fillStyle(0xffffff, 0.4);
    body.fillRoundedRect(-bodyW / 2 + 6, -4, bodyW * 0.3, 6, 3);
    // Racing stripe
    body.fillStyle(0xffffff, 0.8);
    body.fillRoundedRect(-bodyW / 2 + 3, -2, bodyW - 6, 3, 1);
    // Decal
    const accentColor = 0xffd700;
    body.fillStyle(accentColor, 0.9);
    body.fillTriangle(-5, -4, 5, -4, 0, 4);
    container.add(body);

    // Fuel tank with 3D effect
    const tank = this.add.graphics();
    const tankColor = darkerColor;
    tank.fillStyle(tankColor, 1);
    tank.fillEllipse(0, -12, 24, 10);
    tank.fillStyle(0xffffff, 0.3);
    tank.fillEllipse(-4, -14, 10, 4);
    container.add(tank);

    // Handlebars with grips
    const handlebars = this.add.graphics();
    handlebars.lineStyle(3, 0x1a202c, 1);
    handlebars.lineBetween(-8, -22, 8, -22);
    handlebars.lineStyle(2, 0x1a202c, 1);
    handlebars.lineBetween(0, -18, 0, -22);
    // Grips
    handlebars.fillStyle(0x1a202c, 1);
    handlebars.fillCircle(-10, -22, 3);
    handlebars.fillCircle(10, -22, 3);
    // Brake levers
    handlebars.fillStyle(0xa0aec0, 1);
    handlebars.fillEllipse(-12, -20, 4, 2);
    handlebars.fillEllipse(12, -20, 4, 2);
    // Clutch lever
    handlebars.fillStyle(0xa0aec0, 1);
    handlebars.fillEllipse(0, -19, 3, 1.5);
    container.add(handlebars);

    // Forks (front suspension)
    const forks = this.add.graphics();
    forks.lineStyle(3, 0x4a5568, 1);
    forks.lineBetween(bodyW / 2 - 6, -4, bodyW / 2 - 2, 6);
    forks.lineBetween(bodyW / 2 + 2, -4, bodyW / 2 + 6, 6);
    container.add(forks);

    // Rear suspension/shock absorber
    const shock = this.add.graphics();
    shock.fillStyle(0xe53e3e, 1);
    shock.fillRoundedRect(-bodyW / 2 + 10, -4, 6, 12, 2);
    shock.fillStyle(0x718096, 0.8);
    shock.fillRoundedRect(-bodyW / 2 + 11, 2, 4, 4, 1);
    container.add(shock);

    // Exhaust pipe
    const exhaust = this.add.graphics();
    exhaust.fillStyle(0x718096, 1);
    exhaust.fillRoundedRect(-bodyW / 2 + 4, 2, 18, 4, 2);
    exhaust.fillStyle(0x1a202c, 1);
    exhaust.fillCircle(-bodyW / 2 + 22, 4, 3);
    container.add(exhaust);

    // Headlight
    const headlight = this.add.graphics();
    headlight.fillStyle(0xffeb3b, 1);
    headlight.fillCircle(bodyW / 2 - 4, -8, 5);
    headlight.fillStyle(0xffffff, 0.6);
    headlight.fillCircle(bodyW / 2 - 4, -8, 3);
    container.add(headlight);

    // Taillight
    const taillight = this.add.graphics();
    taillight.fillStyle(0xef4444, 1);
    taillight.fillRoundedRect(-bodyW / 2, -8, 6, 4, 1);
    container.add(taillight);

    // Detailed rider with layered design
    // Jacket body
    const jacketColor = Phaser.Display.Color.ValueToColor(color).darken(30).color;
    const riderBody = this.add.graphics();
    riderBody.fillStyle(jacketColor, 1);
    riderBody.fillRoundedRect(-8, -22, 16, 20, 4);
    // Jacket stripe
    riderBody.fillStyle(color, 0.9);
    riderBody.fillRoundedRect(-4, -20, 8, 16, 2);
    // Jacket details
    riderBody.fillStyle(0x1a202c, 1);
    riderBody.fillCircle(-6, -18, 2);
    riderBody.fillCircle(6, -18, 2);
    container.add(riderBody);

    // Premium helmet with visor
    const helmet = this.add.graphics();
    // Helmet base
    helmet.fillStyle(0xf7fafc, 1);
    helmet.fillCircle(0, -34, 14);
    // Helmet stripe
    helmet.fillStyle(color, 1);
    helmet.fillCircle(0, -34, 14, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
    // Visor
    helmet.fillStyle(0x2d3748, 0.9);
    helmet.fillRoundedRect(-8, -38, 16, 8, 3);
    helmet.fillStyle(0x4a5568, 0.5);
    helmet.fillRoundedRect(-6, -37, 6, 4, 1);
    // Vent
    helmet.fillStyle(0x1a202c, 1);
    helmet.fillRoundedRect(-3, -46, 6, 3, 1);
    // Helmet rim
    helmet.lineStyle(2, 0xe2e8f0, 1);
    helmet.strokeCircle(0, -34, 14);
    container.add(helmet);

    // Arms in riding position
    const arms = this.add.graphics();
    arms.fillStyle(jacketColor, 1);
    arms.fillCircle(-10, -24, 4);
    arms.fillCircle(10, -24, 4);
    arms.lineStyle(4, jacketColor, 1);
    arms.lineBetween(-6, -20, -8, -22);
    arms.lineBetween(6, -20, 8, -22);
    container.add(arms);

    // Gloves
    const gloves = this.add.graphics();
    gloves.fillStyle(0x1a202c, 1);
    gloves.fillCircle(-10, -22, 3);
    gloves.fillCircle(10, -22, 3);
    container.add(gloves);

    // Boots on pedals
    const boots = this.add.graphics();
    boots.fillStyle(0x1a202c, 1);
    boots.fillRoundedRect(-10, -4, 8, 6, 2);
    boots.fillRoundedRect(6, -4, 8, 6, 2);
    container.add(boots);

    // Knee pads (visible on rider's legs)
    const kneePads = this.add.graphics();
    kneePads.fillStyle(0x1a202c, 0.9);
    kneePads.fillRoundedRect(-7, -8, 6, 6, 2);
    kneePads.fillRoundedRect(3, -8, 6, 6, 2);
    container.add(kneePads);

    // Engine details visible
    const engine = this.add.graphics();
    engine.fillStyle(0x4a5568, 0.8);
    engine.fillRoundedRect(-10, -2, 12, 6, 2);
    engine.fillStyle(0x2d3748, 1);
    engine.fillRoundedRect(-8, -1, 8, 3, 1);
    container.add(engine);

    // Store references for animation
    container.wheel1 = wheel1;
    container.wheel2 = wheel2;
    container.riderBody = riderBody;
    container.helmet = helmet;

    container.setSize(bodyW + 40, 65);
    container.setScale(1.3); // 30% bigger
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', (pointer) => {
      const isRightClick = pointer && pointer.rightButtonDown();
      const now = Date.now();
      const isDouble = now - container.lastClickTime < 350;
      container.lastClickTime = now;

      // Right click or double-click for backward movement
      if (isRightClick || (isDouble && container.position > 0)) {
        if (container.position > 0) {
          container.position--;
          this.moveBikeTo(container, container.position, 'backward');
        }
      } else if (!isDouble && container.position < this.totalSteps) {
        // Single left click for forward movement
        container.position++;
        this.moveBikeTo(container, container.position, 'forward');
      }
    });

    // Prevent context menu on right-click
    container.on('pointerup', (pointer) => {
      if (pointer && pointer.rightButtonDown()) {
        pointer.event?.preventDefault?.();
      }
    });
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2.easeOut'
      });
    });
    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2.easeOut'
      });
    });

    return container;
  }

  moveBikeTo(bike, step, direction = 'forward') {
    const startX = 20 + this.segmentWidth * 0.5;
    const targetX = 20 + this.segmentWidth * (step + 0.5);
    const duration = 350;

    // Play motorcycle sound based on direction
    if (direction === 'forward') {
      this.sounds.accelerate();
    } else {
      this.sounds.skid();
    }

    // Wheel rotation animation
    const rotationDirection = direction === 'forward' ? 1 : -1;
    this.tweens.add({
      targets: [bike.wheel1, bike.wheel2],
      angle: `+=${360 * rotationDirection}`,
      duration: duration,
      ease: 'Linear'
    });

    // Body lean animation
    this.tweens.add({
      targets: bike.riderBody,
      rotation: direction === 'forward' ? -0.08 : 0.08,
      duration: duration * 0.3,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Helmet bob animation
    this.tweens.add({
      targets: bike.helmet,
      y: '-=3',
      duration: duration * 0.3,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });

    // Main movement
    this.tweens.add({
      targets: bike,
      x: targetX,
      duration: duration,
      ease: 'Back.easeOut'
    });

    // Scale pulse effect on move
    this.tweens.add({
      targets: bike,
      scaleX: 1.05,
      duration: 80,
      yoyo: true,
      ease: 'Power2.easeOut'
    });

    // Check for race completion on forward move
    if (direction === 'forward' && step >= this.totalSteps) {
      setTimeout(() => this.checkRaceComplete(), duration);
    }
  }

  resume() {
    this.scene.resume();
  }

  checkRaceComplete() {
    if (this.winnerDeclared) return;

    // Check if any bike has reached step 10
    for (let bike of this.bikes) {
      if (bike.position >= this.totalSteps) {
        this.winnerDeclared = true;
        const playerIndex = bike.playerIndex;
        const playerName = this.config.players[playerIndex]?.name || `Player ${playerIndex + 1}`;
        const playerColor = this.config.players[playerIndex]?.color || BIKE_COLORS[playerIndex];

        // Trigger winner callback
        if (this.config.onWinner) {
          this.config.onWinner(playerName, playerColor, playerIndex);
        }

        // Play winner sound
        this.sounds.win();
        setTimeout(() => this.sounds.celebration(), 800);

        break;
      }
    }
  }
}

export default function MotoRaceGame({ items = [], players = [], onBack, contentType = 'text', selectedClass, onGivePoints }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [pointsToGive, setPointsToGive] = useState(1);
  const [pointsGiven, setPointsGiven] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !items.length) return;

    const scene = new MotoRaceScene({
      players: players.map((p, i) => ({ ...p, color: ['#00d9ff', '#ff00ff', '#00ff88', '#ffcc00'][i] })),
      onWinner: (playerName, color, playerIndex) => {
        setWinner({ name: playerName, color: color, index: playerIndex });
        setConfettiActive(true);
        setShowWinnerModal(true);
      }
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

  const handleWinnerModalClose = () => {
    setShowWinnerModal(false);
    setConfettiActive(false);
    if (onBack) onBack();
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>🏍️ MotoRace</span>
          <span style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>
            Tap: Forward | Double tap / Right click: Backward
          </span>
        </div>
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
              {/* Trophy Icon */}
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

              {/* Winner Text */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, color: '#1f2937', textShadow: '2px 2px 4px rgba(255,255,255,0.5)', marginBottom: 8 }}>
                  🎉 CHAMPION! 🎉
                </div>
                <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#' + winner.color.toString(16).padStart(6, '0') }}>
                  {winner.name}
                </div>
              </div>

              {/* Motorcycle Emoji */}
              <div style={{ fontSize: 60 }}>🏍️</div>

              {/* Congratulations Message */}
              <div style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                Congratulations! You completed the race!
              </div>

              {/* Give Points Section */}
              {selectedClass && onGivePoints && !pointsGiven && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 600, color: '#374151' }}>
                    Give points to winner:
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
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
                      const winnerPlayer = players[winner.index];
                      if (winnerPlayer && onGivePoints) {
                        onGivePoints([winnerPlayer], pointsToGive);
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
                    🎁 Give {pointsToGive} Point{pointsToGive !== 1 ? 's' : ''} to {winner.name}
                  </button>
                </div>
              )}

              {pointsGiven && (
                <div style={{
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  fontWeight: 700,
                  color: '#10B981',
                  textAlign: 'center',
                  padding: '12px 24px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 12,
                  border: '2px solid #10B981'
                }}>
                  ✅ {pointsToGive} point{pointsToGive !== 1 ? 's' : ''} given to {winner.name}!
                </div>
              )}

              {/* Exit Button */}
              <button
                onClick={handleWinnerModalClose}
                style={{
                  padding: '16px 40px',
                  fontSize: 20,
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(249,115,22,0.5)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 8px 32px rgba(249,115,22,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 6px 24px rgba(249,115,22,0.5)';
                }}
              >
                🏁 Finish Race 🏁
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes bounceIn {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.05); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

// Confetti Component
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

    // Cleanup
    const timeout = setTimeout(() => {
      confettiElements.forEach(el => el.remove());
    }, 5000);

    return () => {
      clearTimeout(timeout);
      confettiElements.forEach(el => el.remove());
    };
  }, []);

  return (
    <style>{`
      @keyframes confetti-fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `}</style>
  );
}
