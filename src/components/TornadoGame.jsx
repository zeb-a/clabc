import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { SoundManager } from './TornadoSoundManager';

// Kid-friendly colors
const KID_COLORS = {
  backgrounds: [
    0x87CEEB, // Sky blue
    0x98FB98, // Pale green
    0xFFB6C1, // Light pink
    0xFFE4B5, // Moccasin
  ],
  cards: {
    single: 0xFFD700,    // Gold
    double: 0xFF69B4,    // Hot pink
    triple: 0x9370DB,    // Purple
    tornado: 0x00CED1,   // Dark turquoise
  },
  players: [
    0x32CD32, // Lime green
    0x00BFFF, // Deep sky blue
    0xFF69B4, // Hot pink
    0xFFD700, // Gold
  ],
  frames: [
    0xFFB6C1, 0x87CEEB, 0x98FB98, 0xFFE4B5,
    0xFFDAB9, 0xE6E6FA, 0xB0E0E6, 0xFFC0CB
  ]
};

class TornadoScene extends Phaser.Scene {
  constructor(gameConfig, players, onGameEnd, onBackToSetup, gameStateRef, setGameState) {
    super({ key: 'TornadoScene' });
    this.gameConfig = gameConfig;
    this.players = players;
    this.onGameEnd = onGameEnd;
    this.onBackToSetup = onBackToSetup;
    this.gameStateRef = gameStateRef;
    this.setGameState = setGameState;
    this.soundManager = null;
    this.cards = [];
    this.frameContainers = [];
    this.cardContainer = null;
    this.leftPlayerPanel = null;
    this.rightPlayerPanel = null;
    this.flippedCount = 0;
  }

  async create() {
    const { width, height } = this.scale;

    // Kid-friendly gradient background
    this.createKidFriendlyBackground();

    // Create player panels on left and right
    this.createPlayerPanels();

    // Create frames for words/pictures first
    this.createDecorativeFrames();

    // Create card grid in center
    this.createCardGrid();

    this.soundManager = new SoundManager();
    await this.soundManager.init();
    this.soundManager.playMusic('background');
  }

  createKidFriendlyBackground() {
    const { width, height } = this.scale;

    // Light, colorful gradient background
    const bg = this.add.graphics();
    
    // Soft gradient from light blue to soft purple
    bg.fillStyle(0xE6F3FF, 1);
    bg.fillRect(0, 0, width, height);

    // Add colorful gradient overlay
    const gradientOverlay = this.add.graphics();
    gradientOverlay.fillGradientStyle(0x87CEEB, 0xFFB6C1, 0xFFB6C1, 0x87CEEB, 0.5);
    gradientOverlay.fillRect(0, 0, width, height);

    // Animated floating shapes (fun for kids)
    this.orbs = [];
    const orbColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3];
    for (let i = 0; i < 6; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(100, height - 100),
        Phaser.Math.Between(30, 80),
        orbColors[i % 4],
        0.3
      );
      orb.vx = Phaser.Math.FloatBetween(-0.3, 0.3);
      orb.vy = Phaser.Math.Between(-0.3, 0.3);
      orb.originalAlpha = 0.3;
      this.orbs.push(orb);
    }

    // Add some stars scattered around
    for (let i = 0; i < 20; i++) {
      const star = this.add.text(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height - 50),
        '⭐',
        { fontSize: '20px' }
      );
      star.setAlpha(0.5);
      star.vx = Phaser.Math.FloatBetween(-0.2, 0.2);
      star.vy = Phaser.Math.FloatBetween(-0.2, 0.2);
      this.orbs.push(star);
    }
  }

  createPlayerPanels() {
    const { width, height } = this.scale;

    // Left panel for Player 1 - shifted more to the left
    this.leftPlayerPanel = this.createPlayerPanel(0, 10, (height / 2) - 220, true);

    // Right panel for Player 2 - shifted more to the right
    this.rightPlayerPanel = this.createPlayerPanel(1, width - 210, (height / 2) - 220, false);
  }

  createPlayerPanel(playerIndex, x, y, isLeft) {
    const container = this.add.container(x, y);
    const player = this.players[playerIndex];
    const playerColor = KID_COLORS.players[playerIndex] || 0x32CD32;

    // Panel background with kid-friendly colors
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xFFFFFF, 0.95);
    panelBg.fillRoundedRect(0, 0, 200, 440, 25);

    // Colorful border
    panelBg.lineStyle(5, playerColor, 1);
    panelBg.strokeRoundedRect(0, 0, 200, 440, 25);

    container.add(panelBg);

    // Player avatar circle with fun color
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(playerColor, 0.4);
    avatarBg.fillCircle(100, 90, 55);
    avatarBg.lineStyle(4, playerColor, 1);
    avatarBg.strokeCircle(100, 90, 55);
    container.add(avatarBg);

    // Player initial with fun font
    const initial = this.add.text(100, 90, (player?.name || 'P')[0]?.toUpperCase() || 'P', {
      fontSize: '52px',
      fontWeight: 'bold',
      color: '#' + playerColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    initial.setOrigin(0.5);
    container.add(initial);

    // Player name
    const nameText = this.add.text(100, 160, player?.name || `Player ${playerIndex + 1}`, {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#333333',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    nameText.setOrigin(0.5);
    container.add(nameText);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(3, playerColor, 0.5);
    line.moveTo(20, 180);
    line.lineTo(180, 180);
    container.add(line);

    // Points label with star
    const pointsLabel = this.add.text(100, 205, '⭐ POINTS ⭐', {
      fontSize: '16px',
      fontWeight: 'bold',
      color: playerColor,
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    pointsLabel.setOrigin(0.5);
    container.add(pointsLabel);

    // Decrease button
    const minusBtn = this.add.container(40, 260);
    const minusBg = this.add.graphics();
    minusBg.fillStyle(0xFF6B6B, 1);
    minusBg.fillCircle(0, 0, 25);
    minusBg.lineStyle(3, 0xFFFFFF, 1);
    minusBg.strokeCircle(0, 0, 25);
    minusBtn.add(minusBg);

    const minusText = this.add.text(0, 0, '-', {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    minusText.setOrigin(0.5);
    minusBtn.add(minusText);

    minusBtn.setSize(50, 50);
    minusBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.adjustPoints(playerIndex, -1))
      .on('pointerover', () => minusBg.setScale(1.1))
      .on('pointerout', () => minusBg.setScale(1));

    container.add(minusBtn);

    // Points counter
    const pointsText = this.add.text(100, 265, '0', {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#' + playerColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    pointsText.setOrigin(0.5);
    container.add(pointsText);

    // Increase button
    const plusBtn = this.add.container(160, 260);
    const plusBg = this.add.graphics();
    plusBg.fillStyle(0x4ECDC4, 1);
    plusBg.fillCircle(0, 0, 25);
    plusBg.lineStyle(3, 0xFFFFFF, 1);
    plusBg.strokeCircle(0, 0, 25);
    plusBtn.add(plusBg);

    const plusText = this.add.text(0, 0, '+', {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    plusText.setOrigin(0.5);
    plusBtn.add(plusText);

    plusBtn.setSize(50, 50);
    plusBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.adjustPoints(playerIndex, 1))
      .on('pointerover', () => plusBg.setScale(1.1))
      .on('pointerout', () => plusBg.setScale(1));

    container.add(plusBtn);

    // Turn indicator
    const turnIndicator = this.add.graphics();
    turnIndicator.fillStyle(playerColor, 0.2);
    turnIndicator.fillRoundedRect(10, 10, 180, 420, 20);
    turnIndicator.setVisible(false);
    container.add(turnIndicator);

    // Store references
    container.pointsText = pointsText;
    container.turnIndicator = turnIndicator;
    container.playerIndex = playerIndex;

    // Active badge
    const activeBadge = this.add.text(100, 400, '🎯 YOUR TURN! 🎯', {
      fontSize: '18px',
      fontWeight: 'bold',
      color: playerColor,
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    activeBadge.setOrigin(0.5);
    activeBadge.setVisible(false);
    container.add(activeBadge);
    container.activeBadge = activeBadge;

    return container;
  }

  createDecorativeFrames() {
    const elements = this.gameConfig.decorativeElements;
    if (elements.length === 0) return;

    const { width, height } = this.scale;
    const panelWidth = 220;
    const frameSize = 70;
    const frameGap = 15;

    // Calculate border area (around panels, not including panel area)
    const leftX = panelWidth + 10;
    const rightX = width - panelWidth - 10;
    const topY = 10;
    const bottomY = height - 10;

    // Calculate positions for frames
    const positions = [];

    // Top row
    const topSpace = rightX - leftX;
    const topCount = Math.floor(topSpace / (frameSize + frameGap));
    for (let i = 0; i < topCount; i++) {
      positions.push({ x: leftX + i * (frameSize + frameGap) + frameSize / 2, y: topY + frameSize / 2 });
    }

    // Bottom row
    for (let i = 0; i < topCount; i++) {
      positions.push({ x: leftX + i * (frameSize + frameGap) + frameSize / 2, y: bottomY - frameSize / 2 });
    }

    // Left column (between panels)
    const leftSpace = bottomY - topY - frameSize * 2 - frameGap * 2;
    const leftCount = Math.floor(leftSpace / (frameSize + frameGap));
    for (let i = 0; i < leftCount; i++) {
      positions.push({ x: leftX + frameSize / 2, y: topY + frameSize + frameGap + i * (frameSize + frameGap) + frameSize / 2 });
    }

    // Right column
    for (let i = 0; i < leftCount; i++) {
      positions.push({ x: rightX - frameSize / 2, y: topY + frameSize + frameGap + i * (frameSize + frameGap) + frameSize / 2 });
    }

    // Place frames and elements
    elements.forEach((element, index) => {
      if (index >= positions.length) return;
      const pos = positions[index];
      const frameColor = KID_COLORS.frames[index % KID_COLORS.frames.length];

      // Create frame container
      const frameContainer = this.add.container(pos.x, pos.y);

      // Frame background
      const frameBg = this.add.graphics();
      frameBg.fillStyle(frameColor, 0.8);
      frameBg.fillRoundedRect(-frameSize / 2, -frameSize / 2, frameSize, frameSize, 15);
      frameBg.lineStyle(3, 0xFFFFFF, 1);
      frameBg.strokeRoundedRect(-frameSize / 2, -frameSize / 2, frameSize, frameSize, 15);
      frameContainer.add(frameBg);

      // Check if it's a word or image
      if (typeof element === 'string' && !element.startsWith('data:') && !element.startsWith('blob:')) {
        // It's a word
        const wordText = this.add.text(0, 0, element.length > 8 ? element.substring(0, 8) + '...' : element, {
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333333',
          fontFamily: 'Comic Sans MS, cursive, sans-serif',
          fontStyle: 'bold',
          wordWrap: { width: frameSize - 10 }
        });
        wordText.setOrigin(0.5);
        frameContainer.add(wordText);
      } else {
        // It's an image
        const textureKey = `decor-${index}`;
        this.load.image(textureKey, element);

        this.load.once('complete', () => {
          if (this.textures.exists(textureKey)) {
            const sprite = this.add.sprite(0, 0, textureKey);
            sprite.setDisplaySize(frameSize - 10, frameSize - 10);
            sprite.setOrigin(0.5);
            frameContainer.add(sprite);
          }
        });

        this.load.start();
      }

      this.frameContainers.push(frameContainer);
      this.add.existing(frameContainer);
    });
  }

  createCardGrid() {
    const { width, height } = this.scale;

    // Calculate grid dimensions - ensure it doesn't overlap panels or frames
    const panelWidth = 220;
    const frameSize = 70;
    const frameGap = 15;
    const outerPadding = 20;
    const borderPadding = frameSize + frameGap + outerPadding;

    const availableWidth = width - (panelWidth * 2) - (borderPadding * 2) - 30;
    const availableHeight = height - (borderPadding * 2) - 20;

    // Calculate rows/cols based on square count (max 20)
    const totalCards = Math.min(this.gameConfig.squareCount, 20);
    
    // Determine grid layout based on square count
    let cols, rows;
    if (totalCards <= 9) {
      cols = 3; rows = 3;
    } else if (totalCards <= 12) {
      cols = 4; rows = 3;
    } else if (totalCards <= 16) {
      cols = 4; rows = 4;
    } else {
      cols = 5; rows = 4;
    }

    const cardWidth = (availableWidth - (cols - 1) * 15) / cols;
    const cardHeight = (availableHeight - (rows - 1) * 15) / rows;

    const startX = panelWidth + borderPadding + 15;
    const startY = borderPadding + 10;

    this.cardContainer = this.add.container();
    this.cards = [];
    this.flippedCount = 0;

    // Determine card types
    const tornadoCount = Math.floor(totalCards * 0.12);
    const doubleCount = Math.floor(totalCards * 0.12);
    const tripleCount = Math.floor(totalCards * 0.08);
    const singleCount = totalCards - tornadoCount - doubleCount - tripleCount;

    const cardTypes = [];
    for (let i = 0; i < tornadoCount; i++) cardTypes.push({ type: 'tornado', points: 0 });
    for (let i = 0; i < doubleCount; i++) cardTypes.push({ type: 'double', points: Phaser.Math.Between(5, 30) });
    for (let i = 0; i < tripleCount; i++) cardTypes.push({ type: 'triple', points: Phaser.Math.Between(10, 50) });
    for (let i = 0; i < singleCount; i++) cardTypes.push({ type: 'single', points: Phaser.Math.Between(0, 50) });

    // Shuffle
    Phaser.Utils.Array.Shuffle(cardTypes);

    for (let i = 0; i < totalCards; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardWidth + 15) + cardWidth / 2;
      const y = startY + row * (cardHeight + 15) + cardHeight / 2;

      const card = this.createCard(x, y, cardWidth, cardHeight, cardTypes[i], i);
      this.cards.push(card);
      this.cardContainer.add(card);
    }

    // Center the game board properly
    const totalGridWidth = cols * cardWidth + (cols - 1) * 15;
    const totalGridHeight = rows * cardHeight + (rows - 1) * 15;
    const centerX = (width - totalGridWidth) / 2;
    const centerY = (height - totalGridHeight) / 2;
    
    this.cardContainer.setPosition(
      centerX - startX - 10,
      centerY - startY - 10
    );
  }

  createCard(x, y, width, height, cardData, index) {
    const container = this.add.container(x, y);
    container.cardType = cardData.type;
    container.cardPoints = cardData.points;
    container.isRevealed = false;
    container.index = index;

    // Card back (hidden state) - kid-friendly design
    const cardBack = this.add.graphics();
    cardBack.fillStyle(0xFFE4B5, 1);
    cardBack.fillRoundedRect(-width / 2, -height / 2, width, height, 20);

    // Fun pattern on card back
    cardBack.lineStyle(2, 0xFFD700, 0.6);
    for (let i = 0; i < 4; i++) {
      const yOffset = -height / 2 + 25 + i * (height / 5);
      cardBack.moveTo(-width / 2 + 20, yOffset);
      cardBack.lineTo(width / 2 - 20, yOffset);
    }

    // Colorful border
    cardBack.lineStyle(4, 0x00CED1, 1);
    cardBack.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

    // Fun glow effect
    cardBack.lineStyle(8, 0x87CEEB, 0.3);
    cardBack.strokeRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 24);

    container.add(cardBack);
    container.cardBack = cardBack;

    // Star icon on back
    const questionMark = this.add.text(0, 0, '⭐', {
      fontSize: `${Math.min(width, height) * 0.35}px`
    });
    questionMark.setOrigin(0.5);
    questionMark.alpha = 0.6;
    container.add(questionMark);
    container.questionMark = questionMark;

    // Card front (revealed state)
    const cardFront = this.add.graphics();
    let bgColor, iconText, iconColor;

    switch (cardData.type) {
      case 'tornado':
        bgColor = KID_COLORS.cards.tornado;
        iconText = '🌪️';
        iconColor = '#FFFFFF';
        break;
      case 'triple':
        bgColor = KID_COLORS.cards.triple;
        iconText = 'x3';
        iconColor = '#FFFFFF';
        break;
      case 'double':
        bgColor = KID_COLORS.cards.double;
        iconText = 'x2';
        iconColor = '#FFFFFF';
        break;
      default:
        bgColor = KID_COLORS.cards.single;
        iconText = '+' + cardData.points;
        iconColor = '#FFFFFF';
    }

    cardFront.fillStyle(bgColor, 1);
    cardFront.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
    cardFront.lineStyle(4, bgColor, 1);
    cardFront.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);

    // Glow
    cardFront.lineStyle(8, bgColor, 0.4);
    cardFront.strokeRoundedRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8, 24);

    container.add(cardFront);
    container.cardFront = cardFront;

    // Icon or text on front
    const frontText = this.add.text(0, 0, iconText, {
      fontSize: `${Math.min(width, height) * 0.3}px`,
      fontWeight: 'bold',
      color: iconColor,
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    frontText.setOrigin(0.5);
    container.add(frontText);
    container.frontText = frontText;

    // Hide front initially
    cardFront.setVisible(false);
    frontText.setVisible(false);

    // Make card interactive
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onCardClick(container))
      .on('pointerover', () => {
        if (!container.isRevealed) {
          cardBack.clear();
          cardBack.fillStyle(0xFFF8DC, 1);
          cardBack.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
          cardBack.lineStyle(4, 0x00CED1, 1);
          cardBack.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);
        }
      })
      .on('pointerout', () => {
        if (!container.isRevealed) {
          cardBack.clear();
          cardBack.fillStyle(0xFFE4B5, 1);
          cardBack.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
          cardBack.lineStyle(4, 0x00CED1, 1);
          cardBack.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);
        }
      });

    return container;
  }

  async onCardClick(card) {
    if (card.isRevealed) return;

    const currentPlayerIndex = this.gameStateRef.current.currentPlayerIndex;
    card.isRevealed = true;
    this.flippedCount++;

    // Flip animation
    await this.flipCard(card);

    // Handle card effect
    switch (card.cardType) {
      case 'tornado':
        await this.handleTornado(currentPlayerIndex, card);
        break;
      case 'triple':
        await this.handlePoints(currentPlayerIndex, card.cardPoints * 3, card);
        break;
      case 'double':
        await this.handlePoints(currentPlayerIndex, card.cardPoints * 2, card);
        break;
      default:
        await this.handlePoints(currentPlayerIndex, card.cardPoints, card);
    }

    // Check if all cards are flipped
    if (this.flippedCount >= this.cards.length) {
      await this.showGameOver();
      return;
    }

    // Next turn
    this.nextTurn();
  }

  async flipCard(card) {
    return new Promise(resolve => {
      this.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => {
          // Switch visibility
          card.cardBack.setVisible(false);
          card.questionMark.setVisible(false);
          card.cardFront.setVisible(true);
          card.frontText.setVisible(true);

          // Flip back
          this.tweens.add({
            targets: card,
            scaleX: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: resolve
          });
        }
      });
    });
  }

  async showGameOver() {
    const totalCards = this.cards.length;
    
    // Find winner
    let winnerIndex = 0;
    let maxScore = -1;
    this.players.forEach((player, index) => {
      const score = player.score || 0;
      if (score > maxScore) {
        maxScore = score;
        winnerIndex = index;
      }
    });

    // Create confetti
    this.createConfetti();

    // Create game over screen
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    overlay.setDepth(2000);

    const container = this.add.container(this.scale.width / 2, this.scale.height / 2);
    container.setDepth(2001);

    // Game over panel
    const panel = this.add.graphics();
    panel.fillStyle(0xFFFFFF, 0.98);
    panel.fillRoundedRect(-300, -250, 600, 500, 30);
    panel.lineStyle(5, 0x4ECDC4, 1);
    panel.strokeRoundedRect(-300, -250, 600, 500, 30);
    container.add(panel);

    // Winner title
    const winnerTitle = this.add.text(0, -180, '🏆 WINNER! 🏆', {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      stroke: '#000000',
      strokeThickness: 3
    });
    winnerTitle.setOrigin(0.5);
    container.add(winnerTitle);

    // Winner name
    const winner = this.players[winnerIndex];
    const winnerName = this.add.text(0, -100, winner?.name || `Player ${winnerIndex + 1}`, {
      fontSize: '56px',
      fontWeight: 'bold',
      color: '#' + (KID_COLORS.players[winnerIndex] || 0x32CD32).toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    winnerName.setOrigin(0.5);
    container.add(winnerName);

    // Winner score
    const winnerScore = this.add.text(0, -30, `⭐ ${winner?.score || 0} POINTS ⭐`, {
      fontSize: '48px',
      fontWeight: 'bold',
      color: '#FF6B6B',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    winnerScore.setOrigin(0.5);
    container.add(winnerScore);

    // All scores
    let scoreY = 60;
    this.players.forEach((player, index) => {
      const scoreText = this.add.text(0, scoreY, `${player?.name || 'P' + (index + 1)}: ${player?.score || 0}`, {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#' + (KID_COLORS.players[index] || 0x32CD32).toString(16).padStart(6, '0'),
        fontStyle: 'bold',
        fontFamily: 'Comic Sans MS, cursive, sans-serif'
      });
      scoreText.setOrigin(0.5);
      container.add(scoreText);
      scoreY += 50;
    });

    // Play again button
    const playAgainBtn = this.add.container(0, 180);
    const playAgainBg = this.add.graphics();
    playAgainBg.fillStyle(0x4ECDC4, 1);
    playAgainBg.fillRoundedRect(-100, -30, 200, 60, 15);
    playAgainBg.lineStyle(3, 0xFFFFFF, 1);
    playAgainBg.strokeRoundedRect(-100, -30, 200, 60, 15);
    playAgainBtn.add(playAgainBg);

    const playAgainText = this.add.text(0, 0, '🔄 PLAY AGAIN', {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    playAgainText.setOrigin(0.5);
    playAgainBtn.add(playAgainText);

    playAgainBtn.setSize(200, 60);
    playAgainBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.onBackToSetup();
      })
      .on('pointerover', () => playAgainBg.setScale(1.05))
      .on('pointerout', () => playAgainBg.setScale(1));

    container.add(playAgainBtn);

    // Animate in
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.soundManager?.playSound('win');
  }

  createConfetti() {
    const colors = [0xFF6B6B, 0x4ECDC4, 0xFFD700, 0x95E1D3, 0xFF69B4];
    
    for (let i = 0; i < 100; i++) {
      const confetti = this.add.rectangle(
        Phaser.Math.Between(0, this.scale.width),
        -20,
        Phaser.Math.Between(5, 15),
        Phaser.Math.Between(5, 15),
        colors[Phaser.Math.Between(0, colors.length - 1)],
        1
      );
      confetti.setDepth(1999);
      
      this.tweens.add({
        targets: confetti,
        y: this.scale.height + 50,
        x: confetti.x + Phaser.Math.Between(-100, 100),
        rotation: Phaser.Math.Between(0, Math.PI * 4),
        duration: Phaser.Math.Between(3000, 5000),
        ease: 'Linear',
        onComplete: () => confetti.destroy()
      });
    }
  }

  async handleTornado(playerIndex, card) {
    this.soundManager?.playSound('tornado');

    const player = this.players[playerIndex];
    const panel = playerIndex === 0 ? this.leftPlayerPanel : this.rightPlayerPanel;

    // Get card position for animation start
    const startX = card.x;
    const startY = card.y;

    // Create tornado sprite at card position
    const tornado = this.add.text(startX, startY, '🌪️', {
      fontSize: '120px'
    });
    tornado.setOrigin(0.5);
    tornado.setDepth(1000);

    // Animate tornado swirling - slower speed
    this.tweens.add({
      targets: tornado,
      rotation: Math.PI * 4,
      scale: { from: 0, to: 1.3 },
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Particle explosion at card
    this.spawnParticles(startX, startY, 0x00CED1, 40);

    // Wait a bit before animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Animate to panel and destroy points - slower
    this.tweens.add({
      targets: tornado,
      x: panel.x + 100,
      y: panel.y + 265,
      scale: { from: 1.3, to: 0.4 },
      duration: 1200,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        tornado.destroy();
      }
    });

    // Count down points to zero - slower speed
    const currentPoints = player.score || 0;
    if (currentPoints > 0) {
      for (let i = currentPoints; i >= 0; i -= 5) {
        panel.pointsText.setText(Math.max(0, i));
        await new Promise(resolve => setTimeout(resolve, 80));
      }
    }

    // Update player score
    player.score = 0;

    const newPlayers = [...this.players];
    this.players = newPlayers;

    const newScores = [...this.gameStateRef.current.scores];
    newScores[playerIndex] = 0;
    this.setGameState(prev => ({ ...prev, scores: newScores, players: newPlayers }));

    // Screen shake
    this.cameras.main.shake(800, 0.008);

    // Flash effect
    const flash = this.add.graphics();
    flash.fillStyle(0x00CED1, 0.4);
    flash.fillRect(0, 0, this.scale.width, this.scale.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy()
    });
  }

  async handlePoints(playerIndex, points, card) {
    this.soundManager?.playSound('tornado');

    const player = this.players[playerIndex];
    const panel = playerIndex === 0 ? this.leftPlayerPanel : this.rightPlayerPanel;

    // Create tornado sprite
    const tornado = this.add.text(panel.x + 100, panel.y, '🌪️', {
      fontSize: '120px'
    });
    tornado.setOrigin(0.5);
    tornado.setDepth(1000);

    // Animate tornado swirling - slower speed
    this.tweens.add({
      targets: tornado,
      rotation: Math.PI * 4,
      scale: { from: 0, to: 1.3 },
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Particle explosion
    this.spawnParticles(panel.x + 100, panel.y + 220, 0x00CED1, 40);

    // Wait a bit before animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Animate to panel and destroy points - slower
    this.tweens.add({
      targets: tornado,
      x: panel.x + 100,
      y: panel.y + 265,
      scale: { from: 1.3, to: 0.4 },
      duration: 1200,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        tornado.destroy();
      }
    });

    // Count down points to zero - slower speed
    const currentPoints = player.score || 0;
    if (currentPoints > 0) {
      for (let i = currentPoints; i >= 0; i -= 5) {
        panel.pointsText.setText(Math.max(0, i));
        await new Promise(resolve => setTimeout(resolve, 80));
      }
    }

    // Update player score
    player.score = 0;

    const newPlayers = [...this.players];
    this.players = newPlayers;

    const newScores = [...this.gameStateRef.current.scores];
    newScores[playerIndex] = 0;
    this.setGameState(prev => ({ ...prev, scores: newScores, players: newPlayers }));

    // Screen shake
    this.cameras.main.shake(800, 0.008);

    // Flash effect
    const flash = this.add.graphics();
    flash.fillStyle(0x00CED1, 0.4);
    flash.fillRect(0, 0, this.scale.width, this.scale.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy()
    });
  }

  async handlePoints(playerIndex, points, card) {
    if (points === 0) {
      this.soundManager?.playSound('hover');
      return;
    }

    this.soundManager?.playSound('points');

    const player = this.players[playerIndex];
    const panel = playerIndex === 0 ? this.leftPlayerPanel : this.rightPlayerPanel;

    // Use the clicked card position for animation
    const startX = card.x;
    const startY = card.y;

    // Create floating points text
    const pointsText = this.add.text(startX, startY, `+${points}`, {
      fontSize: '52px',
      fontWeight: 'bold',
      color: '#4ECDC4',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 3,
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    pointsText.setOrigin(0.5);
    pointsText.setDepth(1000);

    // Spawn particles
    this.spawnParticles(startX, startY, 0xFFD700, 30);

    // Animate points flying to player panel - slower
    this.tweens.add({
      targets: pointsText,
      x: panel.x + 100,
      y: panel.y + 265,
      duration: 1200,
      ease: 'Back.easeOut',
      onComplete: () => {
        pointsText.destroy();
      }
    });

    // Count up points - slower speed
    const oldScore = player.score || 0;
    const newScore = oldScore + points;

    const step = Math.max(1, Math.floor(points / 20));
    for (let i = oldScore; i <= newScore; i += step) {
      panel.pointsText.setText(Math.min(newScore, i));
      await new Promise(resolve => setTimeout(resolve, 60));
    }
    panel.pointsText.setText(newScore);

    // Update player score
    player.score = newScore;

    const newPlayers = [...this.players];
    this.players = newPlayers;

    const newScores = [...this.gameStateRef.current.scores];
    newScores[playerIndex] = newScore;
    this.setGameState(prev => ({ ...prev, scores: newScores, players: newPlayers }));
  }

  adjustPoints(playerIndex, amount) {
    const player = this.players[playerIndex];
    const panel = playerIndex === 0 ? this.leftPlayerPanel : this.rightPlayerPanel;
    const oldScore = player.score || 0;
    const newScore = oldScore + amount;
    const playerColor = KID_COLORS.players[playerIndex] || 0x32CD32;

    player.score = newScore;

    const newPlayers = [...this.players];
    this.players = newPlayers;

    const newScores = [...this.gameStateRef.current.scores];
    newScores[playerIndex] = newScore;
    this.setGameState(prev => ({ ...prev, scores: newScores, players: newPlayers }));

    // Update text color based on score
    const scoreColor = newScore < 0 ? 0xFF6B6B : playerColor;
    panel.pointsText.setColor('#' + scoreColor.toString(16).padStart(6, '0'));
    panel.pointsText.setText(newScore);

    // Visual feedback
    const feedback = this.add.text(panel.x + 100, panel.y + 340, amount > 0 ? '+' + amount : amount, {
      fontSize: '32px',
      fontWeight: 'bold',
      color: amount > 0 ? '#4ECDC4' : '#FF6B6B',
      fontStyle: 'bold'
    });
    feedback.setOrigin(0.5);
    feedback.setDepth(1000);

    this.tweens.add({
      targets: feedback,
      y: feedback.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => feedback.destroy()
    });
  }

  spawnParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
      const particle = this.add.circle(x, y, Phaser.Math.Between(3, 8), color, 1);
      particle.setDepth(999);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(80, 250);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.tweens.add({
        targets: particle,
        x: particle.x + vx,
        y: particle.y + vy,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 1000,
        ease: 'Power2.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  update() {
    // Animate floating orbs
    if (this.orbs && this.orbs.length > 0) {
      this.orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < 0) orb.x = this.scale.width;
        if (orb.x > this.scale.width) orb.x = 0;
        if (orb.y < 0) orb.y = this.scale.height;
        if (orb.y > this.scale.height) orb.y = 0;

        // Pulse effect
        orb.alpha = orb.originalAlpha + Math.sin(Date.now() / 1000 + orb.x) * 0.08;
      });
    }

    // Update turn indicators
    const currentPlayerIndex = this.gameStateRef.current.currentPlayerIndex;

    if (this.leftPlayerPanel) {
      this.leftPlayerPanel.turnIndicator?.setVisible(currentPlayerIndex === 0);
      this.leftPlayerPanel.activeBadge?.setVisible(currentPlayerIndex === 0);
    }

    if (this.rightPlayerPanel) {
      this.rightPlayerPanel.turnIndicator?.setVisible(currentPlayerIndex === 1);
      this.rightPlayerPanel.activeBadge?.setVisible(currentPlayerIndex === 1);
    }
  }

  nextTurn() {
    const nextPlayerIndex = (this.gameStateRef.current.currentPlayerIndex + 1) % this.gameConfig.playerCount;
    this.setGameState(prev => ({
      ...prev,
      currentPlayerIndex: nextPlayerIndex
    }));

    this.soundManager?.playSound('turn');
  }
}

const TornadoGame = ({ config, players, onGameEnd, onBackToSetup }) => {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);

  const [gameState, setGameState] = useState({
    currentPlayerIndex: 0,
    scores: players.map(p => p.score || 0),
    positions: players.map(() => 0),
    diceValue: 1,
    isRolling: false,
    turnPhase: 'rolling',
    winner: null,
    players: [...players]
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const phaserConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameContainerRef.current,
      backgroundColor: '#E6F3FF',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: new TornadoScene(
        config,
        players,
        onGameEnd,
        onBackToSetup,
        gameStateRef,
        setGameState
      )
    };

    const game = new Phaser.Game(phaserConfig);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #E6F3FF 0%, #FFB6C1 50%, #E6E6FA 100%)'
      }}
    />
  );
};

export default TornadoGame;
