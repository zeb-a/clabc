import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { SoundManager } from './TornadoSoundManager';

// Kid-friendly colors (same as Tornado)
const KID_COLORS = {
  backgrounds: [
    0x87CEEB, // Sky blue
    0x98FB98, // Pale green
    0xFFB6C1, // Light pink
    0xFFE4B5, // Moccasin
  ],
  players: [
    0x32CD32, // Lime green
    0x00BFFF, // Deep sky blue
    0xFF69B4, // Hot pink
    0xFFD700, // Gold
  ],
  cards: {
    correct: 0x4CAF50,
    wrong: 0xFF6B6B,
    neutral: 0xE0E0E0
  }
};

class FaceOffScene extends Phaser.Scene {
  constructor(gameConfig, players, onGameEnd, onBackToSetup, onExitToPortal) {
    super({ key: 'FaceOffScene' });
    this.gameConfig = gameConfig;
    this.players = players;
    this.onGameEnd = onGameEnd;
    this.onBackToSetup = onBackToSetup;
    this.onExitToPortal = onExitToPortal;
    this.soundManager = null;
    this.currentRound = 0;
    this.totalRounds = gameConfig.rounds || 5;
    this.wordImagePairs = gameConfig.wordImagePairs || [];
    this.currentPairIndex = 0;
    this.scoreContainer = null;
    this.wordText = null;
    this.leftImageContainers = [];
    this.rightImageContainers = [];
    this.roundComplete = false;
    this.usedPairs = []; // Track used words to ensure word uniqueness
    this.allowImageReuse = true; // Allow images to be reused
  }

  async create() {
    const { width, height } = this.scale;

    // Kid-friendly gradient background
    this.createKidFriendlyBackground();

    // Create UI buttons
    this.createUIButtons();

    // Create player score panels (compact)
    this.createScorePanels();

    // Create round counter
    this.createRoundCounter();

    // Create word display area
    this.createWordDisplay();

    // Create image grids
    this.createImageGrids();

    // Load and display first round
    this.loadRound();

    this.soundManager = new SoundManager();
    await this.soundManager.init();
    this.soundManager.playMusic('background');
  }

  createKidFriendlyBackground() {
    const { width, height } = this.scale;

    // Light, colorful gradient background
    const bg = this.add.graphics();
    bg.fillStyle(0xFFF5E6, 1);
    bg.fillRect(0, 0, width, height);

    // Add colorful gradient overlay
    const gradientOverlay = this.add.graphics();
    gradientOverlay.fillGradientStyle(0xFFB6C1, 0x87CEEB, 0x87CEEB, 0xFFB6C1, 0.3);
    gradientOverlay.fillRect(0, 0, width, height);

    // Animated floating shapes
    this.orbs = [];
    const orbColors = [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3];
    for (let i = 0; i < 6; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(100, height - 100),
        Phaser.Math.Between(30, 80),
        orbColors[i % 4],
        0.2
      );
      orb.vx = Phaser.Math.FloatBetween(-0.3, 0.3);
      orb.vy = Phaser.Math.Between(-0.3, 0.3);
      orb.originalAlpha = 0.2;
      this.orbs.push(orb);
    }
  }

  createUIButtons() {
    const { width } = this.scale;
    const buttonPadding = 10;
    const buttonSize = 45;

    // Back Button (Top Left)
    const backButton = this.add.container(buttonPadding, buttonPadding);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x4ECDC4, 1);
    backBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 10);
    backBg.lineStyle(3, 0xFFFFFF, 1);
    backBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 10);
    backButton.add(backBg);

    const backText = this.add.text(buttonSize / 2, buttonSize / 2, '←', {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    backText.setOrigin(0.5);
    backButton.add(backText);

    backButton.setSize(buttonSize, buttonSize);
    backButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.onBackToSetup())
      .on('pointerover', () => {
        backBg.setScale(1.1);
        backBg.clear();
        backBg.fillStyle(0x3DB8B0, 1);
        backBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 10);
        backBg.lineStyle(3, 0xFFFFFF, 1);
        backBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 10);
      })
      .on('pointerout', () => {
        backBg.setScale(1);
        backBg.clear();
        backBg.fillStyle(0x4ECDC4, 1);
        backBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 10);
        backBg.lineStyle(3, 0xFFFFFF, 1);
        backBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 10);
      });

    // Exit Button (Top Right)
    const exitButton = this.add.container(width - buttonSize - buttonPadding, buttonPadding);
    const exitBg = this.add.graphics();
    exitBg.fillStyle(0xFF6B6B, 1);
    exitBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 10);
    exitBg.lineStyle(3, 0xFFFFFF, 1);
    exitBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 10);
    exitButton.add(exitBg);

    const exitText = this.add.text(buttonSize / 2, buttonSize / 2, '✕', {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    exitText.setOrigin(0.5);
    exitButton.add(exitText);

    exitButton.setSize(buttonSize, buttonSize);
    exitButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.showExitConfirmation())
      .on('pointerover', () => {
        exitBg.setScale(1.1);
        exitBg.clear();
        exitBg.fillStyle(0xE85555, 1);
        exitBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 10);
        exitBg.lineStyle(3, 0xFFFFFF, 1);
        exitBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 10);
      })
      .on('pointerout', () => {
        exitBg.setScale(1);
        exitBg.clear();
        exitBg.fillStyle(0xFF6B6B, 1);
        exitBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 10);
        exitBg.lineStyle(3, 0xFFFFFF, 1);
        exitBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 10);
      });

    this.exitButton = exitButton;
    this.exitDialogVisible = false;
  }

  createScorePanels() {
    const { width } = this.scale;
    const panelWidth = 120;
    const panelHeight = 80;
    const padding = 20;

    // Left player score (Player 1)
    const leftPanel = this.add.container(padding, 100);
    const leftBg = this.add.graphics();
    const leftColor = KID_COLORS.players[0];
    leftBg.fillStyle(0xFFFFFF, 0.95);
    leftBg.fillRoundedRect(0, 0, panelWidth, panelHeight, 15);
    leftBg.lineStyle(3, leftColor, 1);
    leftBg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 15);
    leftPanel.add(leftBg);

    const leftName = this.add.text(panelWidth / 2, 20, this.players[0]?.name || 'Player 1', {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#' + leftColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    leftName.setOrigin(0.5);
    leftPanel.add(leftName);

    const leftScore = this.add.text(panelWidth / 2, 55, '0', {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#' + leftColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    leftScore.setOrigin(0.5);
    leftPanel.add(leftScore);
    this.leftScoreText = leftScore;

    // Right player score (Player 2)
    const rightX = this.scale.width - panelWidth - padding;
    const rightPanel = this.add.container(rightX, 100);
    const rightBg = this.add.graphics();
    const rightColor = KID_COLORS.players[1];
    rightBg.fillStyle(0xFFFFFF, 0.95);
    rightBg.fillRoundedRect(0, 0, panelWidth, panelHeight, 15);
    rightBg.lineStyle(3, rightColor, 1);
    rightBg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 15);
    rightPanel.add(rightBg);

    const rightName = this.add.text(panelWidth / 2, 20, this.players[1]?.name || 'Player 2', {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#' + rightColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    rightName.setOrigin(0.5);
    rightPanel.add(rightName);

    const rightScore = this.add.text(panelWidth / 2, 55, '0', {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#' + rightColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    rightScore.setOrigin(0.5);
    rightPanel.add(rightScore);
    this.rightScoreText = rightScore;
  }

  createRoundCounter() {
    const { width } = this.scale;
    
    const counterBg = this.add.graphics();
    counterBg.fillStyle(0x4ECDC4, 1);
    counterBg.fillRoundedRect(width / 2 - 60, 10, 120, 40, 20);
    counterBg.lineStyle(3, 0xFFFFFF, 1);
    counterBg.strokeRoundedRect(width / 2 - 60, 10, 120, 40, 20);

    this.roundText = this.add.text(width / 2, 30, `Round ${this.currentRound + 1}/${this.totalRounds}`, {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    this.roundText.setOrigin(0.5);
  }

  createWordDisplay() {
    const { width, height } = this.scale;

    const wordBg = this.add.graphics();
    wordBg.fillStyle(0xFFFFFF, 0.98);
    wordBg.fillRoundedRect(width / 2 - 200, 120, 400, 80, 20);
    wordBg.lineStyle(4, 0xFFD700, 1);
    wordBg.strokeRoundedRect(width / 2 - 200, 120, 400, 80, 20);
    wordBg.lineStyle(8, 0xFFD700, 0.3);
    wordBg.strokeRoundedRect(width / 2 - 204, 116, 408, 88, 24);

    this.wordText = this.add.text(width / 2, 160, '', {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#333333',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      wordWrap: { width: 380 }
    });
    this.wordText.setOrigin(0.5);
  }

  createImageGrids() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const startY = 320;
    const imageGridSize = 120;
    const gap = 15;
    const dividerWidth = 30;

    // Calculate positions for two separate sections
    const leftSectionWidth = (centerX - dividerWidth / 2) - 40;
    const rightSectionWidth = (width - centerX - dividerWidth / 2) - 40;

    const leftStartX = leftSectionWidth / 2;
    const rightStartX = width - rightSectionWidth / 2;

    // Thick vertical divider - Clear and separate
    const dividerBg = this.add.graphics();
    dividerBg.fillStyle(0x2D3748, 1);
    dividerBg.fillRect(centerX - dividerWidth / 2, startY - 70, dividerWidth, 2 * (imageGridSize + gap) + 120);
    dividerBg.lineStyle(4, 0x4ECDC4, 1);
    dividerBg.strokeRect(centerX - dividerWidth / 2, startY - 70, dividerWidth, 2 * (imageGridSize + gap) + 120);

    // Inner divider accent
    const dividerAccent = this.add.graphics();
    dividerAccent.fillStyle(0x4ECDC4, 0.3);
    dividerAccent.fillRect(centerX - 4, startY - 65, 8, 2 * (imageGridSize + gap) + 110);

    // Left section container (Player 1) - CLIPPING MASK
    const leftSectionBg = this.add.graphics();
    leftSectionBg.fillStyle(0xF0FFF4, 0.3);
    leftSectionBg.fillRoundedRect(20, startY - 30, leftSectionWidth, 2 * (imageGridSize + gap) + 60, 15);
    leftSectionBg.lineStyle(3, KID_COLORS.players[0], 0.4);
    leftSectionBg.strokeRoundedRect(20, startY - 30, leftSectionWidth, 2 * (imageGridSize + gap) + 60, 15);

    // Right section container (Player 2) - CLIPPING MASK
    const rightSectionBg = this.add.graphics();
    rightSectionBg.fillStyle(0xFFF5F5, 0.3);
    rightSectionBg.fillRoundedRect(centerX + dividerWidth / 2 + 20, startY - 30, rightSectionWidth, 2 * (imageGridSize + gap) + 60, 15);
    rightSectionBg.lineStyle(3, KID_COLORS.players[1], 0.4);
    rightSectionBg.strokeRoundedRect(centerX + dividerWidth / 2 + 20, startY - 30, rightSectionWidth, 2 * (imageGridSize + gap) + 60, 15);

    // Create 3x2 grid for left section (Player 1)
    const colsLeft = 3;
    const rowsLeft = 2;
    const gridWidthLeft = colsLeft * imageGridSize + (colsLeft - 1) * gap;
    const gridHeightLeft = rowsLeft * imageGridSize + (rowsLeft - 1) * gap;
    const startXLeft = leftSectionWidth / 2 - gridWidthLeft / 2 + 30; // Increased right offset
    const startYLeft = startY + 60; // Push down

    for (let row = 0; row < rowsLeft; row++) {
      for (let col = 0; col < colsLeft; col++) {
        const x = startXLeft + col * (imageGridSize + gap);
        const y = startYLeft + row * (imageGridSize + gap);
        this.createImageSlot(x, y, imageGridSize, 'left');
      }
    }

    // Create 3x2 grid for right section (Player 2)
    const colsRight = 3;
    const rowsRight = 2;
    const gridWidthRight = colsRight * imageGridSize + (colsRight - 1) * gap;
    const gridHeightRight = rowsRight * imageGridSize + (rowsRight - 1) * gap;
    const startXRight = centerX + dividerWidth / 2 + 30 + rightSectionWidth / 2 - gridWidthRight / 2 + 30; // Increased right offset
    const startYRight = startY + 60; // Same vertical offset as left

    for (let row = 0; row < rowsRight; row++) {
      for (let col = 0; col < colsRight; col++) {
        const x = startXRight + col * (imageGridSize + gap);
        const y = startYRight + row * (imageGridSize + gap);
        this.createImageSlot(x, y, imageGridSize, 'right');
      }
    }
  }

  createImageSlot(x, y, size, side) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0xF5F5F5, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 15);
    bg.lineStyle(3, 0xCCCCCC, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 15);
    container.add(bg);
    
    container.size = size;
    container.side = side;
    container.bg = bg;
    container.content = null;
    container.index = side === 'left' ? this.leftImageContainers.length : this.rightImageContainers.length;
    container.isCorrect = false;
    container.originalX = x;
    container.wrongClicked = false;
    
    if (side === 'left') {
      this.leftImageContainers.push(container);
    } else {
      this.rightImageContainers.push(container);
    }
    
    return container;
  }

  async loadRound() {
    // Check if we've reached configured number of rounds
    if (this.currentRound >= this.totalRounds) {
      await this.showGameOver();
      return;
    }

    // Check if we've used all unique words and this is standard round count (not custom 10/20/30)
    const allUniqueWordsUsed = this.usedPairs.length >= this.wordImagePairs.length;
    const isCustomRounds = this.totalRounds === 10 || this.totalRounds === 20 || this.totalRounds === 30;

    if (allUniqueWordsUsed && !isCustomRounds) {
      // All unique words used, end game
      await this.showGameOver();
      return;
    }

    // Get current word-image pair - ensure word uniqueness
    let availablePairs = this.wordImagePairs.filter((_, index) => !this.usedPairs.includes(index));
    
    if (availablePairs.length === 0 && !isCustomRounds) {
      // All unique words used, end game
      await this.showGameOver();
      return;
    } else if (availablePairs.length === 0 && isCustomRounds) {
      // Custom rounds with insufficient unique words - allow word reuse
      availablePairs = [...this.wordImagePairs];
    }

    // Pick random available pair (ensures word uniqueness unless custom rounds)
    const pairIndex = Phaser.Math.Between(0, availablePairs.length - 1);
    const pair = availablePairs[pairIndex];
    const actualIndex = this.wordImagePairs.indexOf(pair);
    
    // Only track used words for standard game (not custom rounds with insufficient words)
    if (!(isCustomRounds && this.usedPairs.length >= this.wordImagePairs.length)) {
      this.usedPairs.push(actualIndex);
    }
    
    this.currentPair = pair;

    // Update round counter
    this.roundText.setText(`Round ${this.currentRound + 1}/${this.totalRounds}`);

    // Display word
    this.wordText.setText(pair.word);

    // Load images
    await this.loadImagesForRound(pair);
  }

  async loadImagesForRound(pair) {
    return new Promise((resolve) => {
      // Get all possible distractors (allow image reuse)
      const availableDistractors = this.wordImagePairs.filter(p => p.word !== pair.word);
      
      // Create array with correct image and 5 distractors
      const images = [pair.image];
      
      // If we don't have enough distractors, use what we have and duplicate
      const distractors = availableDistractors.map(p => p.image);
      
      if (distractors.length > 0) {
        // Add up to 5 distractors, allowing duplicates if needed
        for (let i = 0; i < 5; i++) {
          const randomDistractor = distractors[Phaser.Math.Between(0, distractors.length - 1)];
          images.push(randomDistractor);
        }
      } else {
        // No distractors available, fill with the correct image
        for (let i = 0; i < 5; i++) {
          images.push(pair.image);
        }
      }
      
      // Shuffle final array
      Phaser.Utils.Array.Shuffle(images);

      // Load and display images on both sides (separately)
      let loadedCount = 0;
      const totalImages = 12; // 6 on left, 6 on right

      // Load left side images
      images.forEach((imageSrc, imgIndex) => {
        const textureKey = `round${this.currentRound}_left_${imgIndex}`;
        
        this.load.image(textureKey, imageSrc);
        
        this.load.once(`filecomplete-image-${textureKey}`, () => {
          const container = this.leftImageContainers[imgIndex];
          if (container) {
            this.displayImageInSlot(container, textureKey);
            container.isCorrect = (images[imgIndex] === pair.image);
            loadedCount++;
            
            if (loadedCount >= totalImages) {
              this.enableImageClicks();
              resolve();
            }
          }
        });
      });

      // Load right side images (same shuffled order)
      images.forEach((imageSrc, imgIndex) => {
        const textureKey = `round${this.currentRound}_right_${imgIndex}`;
        
        this.load.image(textureKey, imageSrc);
        
        this.load.once(`filecomplete-image-${textureKey}`, () => {
          const container = this.rightImageContainers[imgIndex];
          if (container) {
            this.displayImageInSlot(container, textureKey);
            container.isCorrect = (images[imgIndex] === pair.image);
            loadedCount++;
            
            if (loadedCount >= totalImages) {
              this.enableImageClicks();
              resolve();
            }
          }
        });
      });

      this.load.start();
    });
  }

  displayImageInSlot(container, textureKey) {
    const size = container.size;
    const sprite = this.add.sprite(0, 0, textureKey);
    sprite.setDisplaySize(size - 8, size - 8);
    sprite.setOrigin(0.5, 0.5);
    
    // Create a mask graphics to constrain image to the slot
    const maskGraphics = this.make.graphics();
    maskGraphics.fillStyle(0xFFFFFF, 1);
    maskGraphics.fillRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
    maskGraphics.setDepth(0);
    
    // Create the mask
    const mask = maskGraphics.createGeometryMask();
    sprite.setMask(mask);
    
    // Add sprite to container
    container.add(sprite);
    
    // Add mask graphics to the scene at the same position as container
    maskGraphics.setPosition(container.x, container.y);
    maskGraphics.setVisible(false);
    
    container.content = sprite;
    container.textureKey = textureKey;
    container.maskGraphics = maskGraphics;
  }

  enableImageClicks() {
    // Enable clicks for both sides - make the IMAGE CONTENT clickable
    [...this.leftImageContainers, ...this.rightImageContainers].forEach(container => {
      // We target the sprite (container.content) instead of the container
      const sprite = container.content;
      
      if (sprite) {
        // The sprite handles its own hit area perfectly based on its size/origin
        sprite.setInteractive({ useHandCursor: true });

        // Forward the events to your existing logic, passing the 'container'
        sprite
          .on('pointerdown', (pointer, localX, localY, event) => {
            if (event) event.stopPropagation();
            this.handleImageClick(container);
          })
          .on('pointerover', () => {
            // Add subtle hover effect (targeting the parent container's bg)
            if (container.bg) {
              container.bg.clear();
              container.bg.fillStyle(0xE8F4F8, 1);
              container.bg.fillRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
              container.bg.lineStyle(3, 0x4ECDC4, 1);
              container.bg.strokeRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
            }
          })
          .on('pointerout', () => {
            // Remove hover effect
            if (container.bg && !container.wrongClicked) {
              container.bg.clear();
              container.bg.fillStyle(0xF5F5F5, 1);
              container.bg.fillRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
              container.bg.lineStyle(3, 0xCCCCCC, 1);
              container.bg.strokeRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
            }
          });
      }
    });
  }

  async handleImageClick(container) {
    if (this.roundComplete) return;

    // Check if this is the first click of the round
    if (this.firstClickSide) {
      // Someone already clicked, ignore
      return;
    }

    this.firstClickSide = container.side;
    const playerIndex = container.side === 'left' ? 0 : 1;
    const isCorrect = container.isCorrect;

    if (isCorrect) {
      // Correct answer - play sound
      this.soundManager?.playSound('points');
      
      // Visual feedback on correct card - kid-friendly bounce animation
      container.bg.clear();
      container.bg.fillStyle(KID_COLORS.cards.correct, 1);
      container.bg.fillRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
      container.bg.lineStyle(4, 0xFFFFFF, 1);
      container.bg.strokeRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);

      // Playful bounce animation for correct card
      this.tweens.add({
        targets: container,
        scaleX: 1.4,
        scaleY: 1.4,
        duration: 200,
        ease: 'Elastic.easeOut',
        yoyo: true,
        repeat: 1,
        onRepeat: () => {
          container.setScale(1.2);
        }
      });

      // Spawn fun colorful particles
      this.spawnCelebrationParticles(container.x, container.y);

      // Gentle fade for other cards
      [...this.leftImageContainers, ...this.rightImageContainers].forEach(otherContainer => {
        if (otherContainer !== container && otherContainer.content) {
          this.tweens.add({
            targets: otherContainer,
            alpha: 0.3,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 500,
            ease: 'Sine.easeOut'
          });
        }
      });

      // Update score with playful animation
      await new Promise(resolve => setTimeout(resolve, 400));
      this.players[playerIndex].score = (this.players[playerIndex].score || 0) + 1;
      const scoreText = playerIndex === 0 ? this.leftScoreText : this.rightScoreText;
      
      // Score text bounce
      this.tweens.add({
        targets: scoreText,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 200,
        ease: 'Back.easeOut',
        yoyo: true,
        repeat: 1,
        onRepeat: () => {
          scoreText.setText(this.players[playerIndex].score);
          scoreText.setScale(1);
        }
      });

      // Fun star popup
      const stars = ['⭐', '✨', '🌟'];
      const randomStar = stars[Math.floor(Math.random() * stars.length)];
      const starPopup = this.add.text(container.x, container.y - 60, randomStar, {
        fontSize: '64px',
        fontStyle: 'bold',
        fontFamily: 'Comic Sans MS, cursive, sans-serif'
      });
      starPopup.setOrigin(0.5);
      starPopup.setAlpha(0);
      this.tweens.add({
        targets: starPopup,
        alpha: 1,
        y: starPopup.y - 30,
        duration: 300,
        ease: 'Power2.easeOut',
        yoyo: true,
        repeat: 1,
        onComplete: () => starPopup.destroy()
      });

      // Disable all interactions
      this.disableAllImages();
      
      this.roundComplete = true;

      // Wait and then next round
      await new Promise(resolve => setTimeout(resolve, 1800));
      this.nextRound();
    } else {
        // Wrong answer - playful shake animation
        this.soundManager?.playSound('hover');
  
        // Mark container as wrong clicked
        container.wrongClicked = true;
  
        // Shake animation
        this.tweens.add({
          targets: container,
          x: container.x + 10,
          duration: 50,
          ease: 'Linear.easeNone',
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            container.x = container.originalX || container.x;
          }
        });
  
        // Gentle fade out with wiggle
        this.tweens.add({
          targets: container,
          alpha: 0,
          rotation: 0.2,
          scaleX: 0.7,
          scaleY: 0.7,
          duration: 400,
          ease: 'Sine.easeOut',
          delay: 150,
          onComplete: () => {
            // IMPORTANT: Properly destroy and NULL the reference
            if (container.content) {
              container.content.destroy();
              container.content = null; // This prevents the "undefined" error later
            }
            
            container.bg.clear();
            container.bg.fillStyle(KID_COLORS.cards.wrong, 0.7);
            container.bg.fillRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
            container.bg.lineStyle(2, 0xFF9999, 1);
            container.bg.strokeRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
          }
        });
  
        // Remove from interactive - TARGET THE SPRITE NOW
        if (container.content && container.content.scene) {
          container.content.disableInteractive();
        }
  
        // Other player gets a chance
        this.firstClickSide = null;
      }
  }

  disableAllImages() {
    [...this.leftImageContainers, ...this.rightImageContainers].forEach(container => {
      // SAFE CHECK: Only disable if content exists AND is still active in the scene
      if (container.content && container.content.scene) {
        container.content.disableInteractive();
      }
    });
  }
  nextRound() {
    this.currentRound++;
    this.roundComplete = false;
    this.firstClickSide = null;

    // Clear all image containers from both sides
    [...this.leftImageContainers, ...this.rightImageContainers].forEach(container => {
      if (container.content) {
        // Clear mask first
        container.content.clearMask();
        container.content.destroy();
        container.content = null;
      }
      if (container.maskGraphics) {
        container.maskGraphics.destroy();
        container.maskGraphics = null;
      }
      container.bg.clear();
      container.bg.fillStyle(0xF5F5F5, 1);
      container.bg.fillRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
      container.bg.lineStyle(3, 0xCCCCCC, 1);
      container.bg.strokeRoundedRect(-container.size / 2, -container.size / 2, container.size, container.size, 15);
      container.textureKey = null;
      container.isCorrect = false;
      container.wrongClicked = false;
      container.alpha = 1;
      container.scaleX = 1;
      container.scaleY = 1;
      container.rotation = 0;
      container.x = container.originalX;
    });

    this.loadRound();
  }

  async showGameOver() {
    // Find winner
    const p1Score = this.players[0].score || 0;
    const p2Score = this.players[1].score || 0;
    const winnerIndex = p1Score >= p2Score ? 0 : 1;
    const isTie = p1Score === p2Score;

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

    // Title
    const titleText = isTie ? "IT'S A TIE!" : '🏆 WINNER! 🏆';
    const title = this.add.text(0, -180, titleText, {
      fontSize: '48px',
      fontWeight: 'bold',
      color: isTie ? '#4ECDC4' : '#FFD700',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif',
      stroke: '#000000',
      strokeThickness: 3
    });
    title.setOrigin(0.5);
    container.add(title);

    // Winner name
    if (!isTie) {
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
    }

    // Scores
    let scoreY = isTie ? -50 : -30;
    this.players.forEach((player, index) => {
      const scoreText = this.add.text(0, scoreY, `${player?.name || 'P' + (index + 1)}: ${player?.score || 0} points`, {
        fontSize: '32px',
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
      .on('pointerdown', () => this.onBackToSetup())
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

  showExitConfirmation() {
    if (this.exitDialogVisible) return;
    this.exitDialogVisible = true;

    const { width, height } = this.scale;
    const dialogWidth = 400;
    const dialogHeight = 260;

    // Create overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(3000);

    // Create dialog container
    const dialogContainer = this.add.container(width / 2, height / 2);
    dialogContainer.setDepth(3001);

    // Dialog background
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0xFFFFFF, 0.98);
    dialogBg.fillRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 25);
    dialogBg.lineStyle(4, 0xFF6B6B, 1);
    dialogBg.strokeRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 25);
    dialogContainer.add(dialogBg);

    // Warning icon
    const warningText = this.add.text(0, -dialogHeight / 2 + 70, '⚠️', {
      fontSize: '48px'
    });
    warningText.setOrigin(0.5);
    dialogContainer.add(warningText);

    // Dialog title
    const titleText = this.add.text(0, -dialogHeight / 2 + 120, 'Exit Game?', {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FF6B6B',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    titleText.setOrigin(0.5);
    dialogContainer.add(titleText);

    // Buttons container
    const buttonsContainer = this.add.container(0, 50);
    dialogContainer.add(buttonsContainer);

    // OK Button (Exit)
    const okBtn = this.add.container(-90, 0);
    const okBg = this.add.graphics();
    okBg.fillStyle(0xFF6B6B, 1);
    okBg.fillRoundedRect(-70, -20, 140, 40, 12);
    okBg.lineStyle(2, 0xFFFFFF, 1);
    okBg.strokeRoundedRect(-70, -20, 140, 40, 12);
    okBtn.add(okBg);

    const okText = this.add.text(0, 0, 'OK', {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    okText.setOrigin(0.5);
    okBtn.add(okText);

    okBtn.setSize(140, 40);
    okBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.hideExitConfirmation();
        this.onExitToPortal && this.onExitToPortal();
      })
      .on('pointerover', () => {
        okBg.clear();
        okBg.fillStyle(0xE85555, 1);
        okBg.fillRoundedRect(-70, -20, 140, 40, 12);
        okBg.lineStyle(2, 0xFFFFFF, 1);
        okBg.strokeRoundedRect(-70, -20, 140, 40, 12);
      })
      .on('pointerout', () => {
        okBg.clear();
        okBg.fillStyle(0xFF6B6B, 1);
        okBg.fillRoundedRect(-70, -20, 140, 40, 12);
        okBg.lineStyle(2, 0xFFFFFF, 1);
        okBg.strokeRoundedRect(-70, -20, 140, 40, 12);
      });

    buttonsContainer.add(okBtn);

    // Stay Button
    const stayBtn = this.add.container(90, 0);
    const stayBg = this.add.graphics();
    stayBg.fillStyle(0x4ECDC4, 1);
    stayBg.fillRoundedRect(-70, -20, 140, 40, 12);
    stayBg.lineStyle(2, 0xFFFFFF, 1);
    stayBg.strokeRoundedRect(-70, -20, 140, 40, 12);
    stayBtn.add(stayBg);

    const stayText = this.add.text(0, 0, 'Stay', {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    stayText.setOrigin(0.5);
    stayBtn.add(stayText);

    stayBtn.setSize(140, 40);
    stayBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.hideExitConfirmation();
      })
      .on('pointerover', () => {
        stayBg.clear();
        stayBg.fillStyle(0x3DB8B0, 1);
        stayBg.fillRoundedRect(-70, -20, 140, 40, 12);
        stayBg.lineStyle(2, 0xFFFFFF, 1);
        stayBg.strokeRoundedRect(-70, -20, 140, 40, 12);
      })
      .on('pointerout', () => {
        stayBg.clear();
        stayBg.fillStyle(0x4ECDC4, 1);
        stayBg.fillRoundedRect(-70, -20, 140, 40, 12);
        stayBg.lineStyle(2, 0xFFFFFF, 1);
        stayBg.strokeRoundedRect(-70, -20, 140, 40, 12);
      });

    buttonsContainer.add(stayBtn);

    // Animate in
    dialogContainer.setScale(0);
    this.tweens.add({
      targets: dialogContainer,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.exitOverlay = overlay;
    this.exitDialog = dialogContainer;
  }

  hideExitConfirmation() {
    if (!this.exitDialogVisible) return;

    // Animate out
    this.tweens.add({
      targets: this.exitDialog,
      scale: 0,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (this.exitOverlay) {
          this.exitOverlay.destroy();
          this.exitOverlay = null;
        }
        if (this.exitDialog) {
          this.exitDialog.destroy();
          this.exitDialog = null;
        }
        this.exitDialogVisible = false;
      }
    });
  }

  createDividerFeedback(x, y) {
    // Create a visual ripple effect on the divider
    const ripple = this.add.ellipse(x, y, 16, 30, 0x4ECDC4, 0.6);
    ripple.setDepth(1000);

    this.tweens.add({
      targets: ripple,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      ease: 'Power2.easeOut',
      onComplete: () => ripple.destroy()
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

  spawnCelebrationParticles(x, y) {
    const colors = [0xFF6B6B, 0x4ECDC4, 0xFFD700, 0x95E1D3, 0xFF69B4, 0x98FB98];
    const shapes = ['circle', 'star', 'heart'];
    
    for (let i = 0; i < 40; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
      let particle;
      
      if (shapeType === 'star') {
        // Create star shape
        particle = this.add.star(0, 0, Phaser.Math.Between(4, 10), 5, 0.5, 2, color, 1);
      } else if (shapeType === 'heart') {
        // Create heart shape using circle
        particle = this.add.circle(0, 0, Phaser.Math.Between(4, 8), color, 1);
      } else {
        // Default circle
        particle = this.add.circle(0, 0, Phaser.Math.Between(4, 10), color, 1);
      }
      
      particle.setPosition(x, y);
      particle.setDepth(999);
      
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const speed = Phaser.Math.Between(100, 300);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 50; // Upward bias
      
      // Playful bouncy animation
      this.tweens.add({
        targets: particle,
        x: particle.x + vx,
        y: particle.y + vy,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        rotation: Phaser.Math.FloatBetween(0, Math.PI * 2),
        duration: Phaser.Math.Between(800, 1500),
        ease: 'Elastic.easeOut',
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

        orb.alpha = orb.originalAlpha + Math.sin(Date.now() / 1000 + orb.x) * 0.05;
      });
    }
  }
}

const FaceOffGame = ({ config, players, onGameEnd, onBackToSetup, onExitToPortal }) => {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const phaserConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameContainerRef.current,
      backgroundColor: '#FFF5E6',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: new FaceOffScene(
        config,
        players,
        onGameEnd,
        onBackToSetup,
        onExitToPortal
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
        background: 'linear-gradient(135deg, #FFF5E6 0%, #FFB6C1 50%, #E6E6FA 100%)'
      }}
    />
  );
};

export default FaceOffGame;
