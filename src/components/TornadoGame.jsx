import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { SoundManager } from './TornadoSoundManager';

/**
 * Extracts the filename from an uploaded image file without the extension.
 * Handles various image formats (.jpg, .jpeg, .png, .gif, .webp, .svg, .bmp, .tiff)
 * 
 * @param {File|string} fileOrName - Either a File object or a filename string
 * @returns {string} The filename without the file extension
 */
function extractImageName(fileOrName) {
  let filename = '';
  
  if (typeof fileOrName === 'string') {
    filename = fileOrName;
  } else if (fileOrName instanceof File) {
    filename = fileOrName.name;
  } else {
    return '';
  }
  
  // Remove path separators (for cross-platform compatibility)
  filename = filename.replace(/[\\/]/g, ' ');
  
  // Remove file extension
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex > 0) {
    // Check if it's a valid image extension
    const extension = filename.slice(lastDotIndex + 1).toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif', 'ico'];
    
    if (imageExtensions.includes(extension)) {
      filename = filename.slice(0, lastDotIndex);
    }
  }
  
  return filename.trim();
}

/**
 * Processes uploaded image files and creates editable text elements for the game.
 * Extracts filenames without extensions and allows modification of these names.
 * 
 * @param {File[]} files - Array of File objects from file input
 * @param {Function} onProcessComplete - Callback function called with processed image data
 * @returns {Promise<Array>} Promise resolving to array of processed image objects
 */
async function processUploadedImages(files, onProcessComplete) {
  if (!files || files.length === 0) return [];
  
  const imagePromises = Array.from(files).map((file) => {
    return new Promise((resolve, reject) => {
      // Verify it's an image file
      if (!file.type.startsWith('image/')) {
        reject(new Error(`File "${file.name}" is not an image`));
        return;
      }
      
      // Extract name without extension
      const displayName = extractImageName(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          src: reader.result,
          name: displayName,
          originalName: file.name,
          file: file
        });
      };
      reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
      reader.readAsDataURL(file);
    });
  });
  
  try {
    const processedImages = await Promise.all(imagePromises);
    
    // Notify callback if provided
    if (onProcessComplete && typeof onProcessComplete === 'function') {
      onProcessComplete(processedImages);
    }
    
    return processedImages;
  } catch (error) {
    console.error('Error processing images:', error);
    throw error;
  }
}

/**
 * Updates the display name of a processed image
 * 
 * @param {Object} imageData - The image data object
 * @param {string} newName - The new display name
 * @returns {Object} Updated image data object
 */
function updateImageName(imageData, newName) {
  return {
    ...imageData,
    name: newName.trim()
  };
}

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
  constructor(gameConfig, players, onGameEnd, onBackToSetup, onExitToPortal, gameStateRef, setGameState, onWinner) {
    super({ key: 'TornadoScene' });
    this.gameConfig = gameConfig;
    this.players = players;
    this.onGameEnd = onGameEnd;
    this.onBackToSetup = onBackToSetup;
    this.onExitToPortal = onExitToPortal;
    this.gameStateRef = gameStateRef;
    this.onWinner = onWinner;
    this.setGameState = setGameState;
    this.soundManager = null;
    this.cards = [];
    this.frameContainers = [];
    this.cardContainer = null;
    this.leftPlayerPanel = null;
    this.rightPlayerPanel = null;
    this.flippedCount = 0;
    this.totalTurnsTaken = 0;
  }

  async create() {
    const { width, height } = this.scale;

    // Kid-friendly gradient background
    this.createKidFriendlyBackground();

    // Create UI buttons (back and close)
    this.createUIButtons();

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

  createUIButtons() {
    const { width, height } = this.scale;
    const buttonPadding = 5;
    const buttonSize = 50;

    // Back Button (Top Left)
    const backButton = this.add.container(buttonPadding, buttonPadding);
    const backBg = this.add.graphics();
    backBg.fillStyle(0x4ECDC4, 1);
    backBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 12);
    backBg.lineStyle(3, 0xFFFFFF, 1);
    backBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 12);
    backButton.add(backBg);

    const backText = this.add.text(buttonSize / 2, buttonSize / 2, '←', {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    backText.setOrigin(0.5);
    backButton.add(backText);

    backButton.setSize(buttonSize, buttonSize);
    backButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.onBackToSetup();
      })
      .on('pointerover', () => {
        backBg.setScale(1.1);
        backBg.clear();
        backBg.fillStyle(0x3DB8B0, 1);
        backBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 12);
        backBg.lineStyle(3, 0xFFFFFF, 1);
        backBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 12);
      })
      .on('pointerout', () => {
        backBg.setScale(1);
        backBg.clear();
        backBg.fillStyle(0x4ECDC4, 1);
        backBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 12);
        backBg.lineStyle(3, 0xFFFFFF, 1);
        backBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 12);
      });

    this.backButton = backButton;

    // Close Button (Top Right)
    const closeButton = this.add.container(width - buttonSize - buttonPadding, buttonPadding);
    const closeBg = this.add.graphics();
    closeBg.fillStyle(0xFF6B6B, 1);
    closeBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 12);
    closeBg.lineStyle(3, 0xFFFFFF, 1);
    closeBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 12);
    closeButton.add(closeBg);

    const closeText = this.add.text(buttonSize / 2, buttonSize / 2, '✕', {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    closeText.setOrigin(0.5);
    closeButton.add(closeText);

    closeButton.setSize(buttonSize, buttonSize);
    closeButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.showExitConfirmation();
      })
      .on('pointerover', () => {
        closeBg.setScale(1.1);
        closeBg.clear();
        closeBg.fillStyle(0xE85555, 1);
        closeBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 12);
        closeBg.lineStyle(3, 0xFFFFFF, 1);
        closeBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 12);
      })
      .on('pointerout', () => {
        closeBg.setScale(1);
        closeBg.clear();
        closeBg.fillStyle(0xFF6B6B, 1);
        closeBg.fillRoundedRect(0, 0, buttonSize, buttonSize, 12);
        closeBg.lineStyle(3, 0xFFFFFF, 1);
        closeBg.strokeRoundedRect(0, 0, buttonSize, buttonSize, 12);
      });

    this.closeButton = closeButton;
    this.exitDialogVisible = false;
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

    // Store references
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

  createPlayerPanels() {
    const { width, height } = this.scale;
    const numPlayers = this.players.length;

    // Panel dimensions - consistent across all player counts
    const panelWidth = 180;
    const panelHeight = 280;
    const gap = 15;
    const sidePadding = 15;

    if (numPlayers === 2) {
      // 2 players: vertically centered, one on left, one on right
      const leftX = sidePadding;
      const rightX = width - panelWidth - sidePadding;
      const centerY = (height - panelHeight) / 2;

      this.leftPlayerPanel = this.createPlayerPanel(0, leftX, centerY, true);
      this.rightPlayerPanel = this.createPlayerPanel(1, rightX, centerY, false);
    } else if (numPlayers === 3) {
      // 3 players: 1 on left (centered), 2 on right (stacked vertically)
      const leftX = sidePadding;
      const rightX = width - panelWidth - sidePadding;

      // Left side - single panel centered vertically
      const leftY = (height - panelHeight) / 2;
      this.leftPlayerPanel = this.createPlayerPanel(0, leftX, leftY, true);

      // Right side - 2 panels stacked
      const rightTotalHeight = (2 * panelHeight) + gap;
      const rightStartY = (height - rightTotalHeight) / 2;
      this.rightPlayerPanel = this.createPlayerPanel(1, rightX, rightStartY, false);

      // Extra panel for player 2 on right
      this.extraPanels = [];
      const panel2 = this.createPlayerPanel(2, rightX, rightStartY + panelHeight + gap, false);
      this.extraPanels.push(panel2);
    } else if (numPlayers === 4) {
      // 4 players: 2 on left (stacked), 2 on right (stacked)
      const leftX = sidePadding;
      const rightX = width - panelWidth - sidePadding;

      // Calculate total height needed for 2 stacked panels
      const sideTotalHeight = (2 * panelHeight) + gap;
      const startY = (height - sideTotalHeight) / 2;

      // Left side - 2 panels
      this.leftPlayerPanel = this.createPlayerPanel(0, leftX, startY, true);

      this.extraPanels = [];
      const panel2 = this.createPlayerPanel(2, leftX, startY + panelHeight + gap, true);
      this.extraPanels.push(panel2);

      // Right side - 2 panels
      this.rightPlayerPanel = this.createPlayerPanel(1, rightX, startY, false);

      const panel3 = this.createPlayerPanel(3, rightX, startY + panelHeight + gap, false);
      this.extraPanels.push(panel3);
    }
  }

  createPlayerPanel(playerIndex, x, y, isLeft) {
    const container = this.add.container(x, y);
    const player = this.players[playerIndex];
    const playerColor = KID_COLORS.players[playerIndex] || 0x32CD32;

    // Panel dimensions
    const panelWidth = 180;
    const panelHeight = 280;

    // Panel background with kid-friendly colors
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xFFFFFF, 0.95);
    panelBg.fillRoundedRect(0, 0, panelWidth, panelHeight, 20);

    // Colorful border
    panelBg.lineStyle(4, playerColor, 1);
    panelBg.strokeRoundedRect(0, 0, panelWidth, panelHeight, 20);

    container.add(panelBg);

    // Player avatar circle with fun color
    const avatarBg = this.add.graphics();
    avatarBg.fillStyle(playerColor, 0.4);
    avatarBg.fillCircle(panelWidth / 2, 50, 40);
    avatarBg.lineStyle(3, playerColor, 1);
    avatarBg.strokeCircle(panelWidth / 2, 50, 40);
    container.add(avatarBg);

    // Player initial with fun font
    const initial = this.add.text(panelWidth / 2, 50, (player?.name || 'P')[0]?.toUpperCase() || 'P', {
      fontSize: '38px',
      fontWeight: 'bold',
      color: '#' + playerColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    initial.setOrigin(0.5);
    container.add(initial);

    // Player name - increased spacing from avatar (from 50 to 100)
    const nameText = this.add.text(panelWidth / 2, 115, player?.name || `Player ${playerIndex + 1}`, {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333333',
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    nameText.setOrigin(0.5);
    container.add(nameText);

    // Decorative line
    const line = this.add.graphics();
    line.lineStyle(2, playerColor, 0.5);
    line.moveTo(15, 135);
    line.lineTo(panelWidth - 15, 135);
    container.add(line);

    // Decrease button
    const minusBtn = this.add.container(35, 180);
    const minusBg = this.add.graphics();
    minusBg.fillStyle(0xFF6B6B, 1);
    minusBg.fillCircle(0, 0, 20);
    minusBg.lineStyle(2, 0xFFFFFF, 1);
    minusBg.strokeCircle(0, 0, 20);
    minusBtn.add(minusBg);

    const minusText = this.add.text(0, 0, '-', {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    minusText.setOrigin(0.5);
    minusBtn.add(minusText);

    minusBtn.setSize(40, 40);
    minusBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.adjustPoints(playerIndex, -1))
      .on('pointerover', () => minusBg.setScale(1.1))
      .on('pointerout', () => minusBg.setScale(1));

    container.add(minusBtn);

    // Points counter
    const pointsText = this.add.text(panelWidth / 2, 182, '0', {
      fontSize: '38px',
      fontWeight: 'bold',
      color: '#' + playerColor.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
    });
    pointsText.setOrigin(0.5);
    container.add(pointsText);

    // Increase button
    const plusBtn = this.add.container(panelWidth - 35, 180);
    const plusBg = this.add.graphics();
    plusBg.fillStyle(0x4ECDC4, 1);
    plusBg.fillCircle(0, 0, 20);
    plusBg.lineStyle(2, 0xFFFFFF, 1);
    plusBg.strokeCircle(0, 0, 20);
    plusBtn.add(plusBg);

    const plusText = this.add.text(0, 0, '+', {
      fontSize: '26px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    plusText.setOrigin(0.5);
    plusBtn.add(plusText);

    plusBtn.setSize(40, 40);
    plusBtn.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.adjustPoints(playerIndex, 1))
      .on('pointerover', () => plusBg.setScale(1.1))
      .on('pointerout', () => plusBg.setScale(1));

    container.add(plusBtn);

    // Turn indicator
    const turnIndicator = this.add.graphics();
    turnIndicator.fillStyle(playerColor, 0.2);
    turnIndicator.fillRoundedRect(8, 8, panelWidth - 16, panelHeight - 16, 16);
    turnIndicator.setVisible(false);
    container.add(turnIndicator);

    // Store references
    container.pointsText = pointsText;
    container.turnIndicator = turnIndicator;
    container.playerIndex = playerIndex;

    // Active badge
    const activeBadge = this.add.text(panelWidth / 2, 255, '🎯 YOUR TURN! 🎯', {
      fontSize: '14px',
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

    // Check if numbered tiles should be displayed
    const showNumber = this.gameConfig.numberedSquares;

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

    // Number or star icon on back based on numberedSquares setting
    const questionMark = this.add.text(0, 0, showNumber ? (index + 1).toString() : '⭐', {
      fontSize: `${Math.min(width, height) * 0.35}px`,
      fontWeight: 'bold',
      color: showNumber ? '#333333' : undefined,
      fontFamily: 'Comic Sans MS, cursive, sans-serif'
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
          // Re-draw pattern on hover
          cardBack.lineStyle(2, 0xFFD700, 0.6);
          for (let i = 0; i < 4; i++) {
            const yOffset = -height / 2 + 25 + i * (height / 5);
            cardBack.moveTo(-width / 2 + 20, yOffset);
            cardBack.lineTo(width / 2 - 20, yOffset);
          }
        }
      })
      .on('pointerout', () => {
        if (!container.isRevealed) {
          cardBack.clear();
          cardBack.fillStyle(0xFFE4B5, 1);
          cardBack.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
          cardBack.lineStyle(4, 0x00CED1, 1);
          cardBack.strokeRoundedRect(-width / 2, -height / 2, width, height, 20);
          // Re-draw pattern on mouse out
          cardBack.lineStyle(2, 0xFFD700, 0.6);
          for (let i = 0; i < 4; i++) {
            const yOffset = -height / 2 + 25 + i * (height / 5);
            cardBack.moveTo(-width / 2 + 20, yOffset);
            cardBack.lineTo(width / 2 - 20, yOffset);
          }
        }
      });

    return container;
  }

  /**
   * Creates an editable text element for displaying image names
   * Allows users to click and edit the text after it's been added to the game
   * 
   * @param {number} x - X position of the text
   * @param {number} y - Y position of the text
   * @param {string} initialText - The initial text to display
   * @param {Object} options - Configuration options
   * @returns {Object} The text object container with edit functionality
   */
  createEditableTextElement(x, y, initialText, options = {}) {
    const {
      fontSize = '24px',
      fontFamily = 'Comic Sans MS, cursive, sans-serif',
      color = '#333333',
      backgroundColor = 0xFFFFFF,
      borderColor = 0x3B82F6,
      padding = 10,
      maxWidth = 300,
      editable = true,
      onEditComplete = null
    } = options;

    const container = this.add.container(x, y);
    
    // Background for better visibility
    const bg = this.add.graphics();
    const textObj = this.add.text(0, 0, initialText, {
      fontSize,
      fontFamily,
      color,
      wordWrap: { width: maxWidth }
    });
    textObj.setOrigin(0.5);
    
    // Calculate dimensions
    const textWidth = textObj.width + padding * 2;
    const textHeight = textObj.height + padding * 2;
    
    bg.fillStyle(backgroundColor, 0.95);
    bg.fillRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);
    bg.lineStyle(2, borderColor, 1);
    bg.strokeRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);
    
    container.add(bg);
    container.add(textObj);
    
    // Make editable if enabled
    if (editable) {
      let isEditing = false;
      let originalText = initialText;
      
      // Create a hidden HTML input for editing
      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = initialText;
      inputElement.style.cssText = `
        position: fixed;
        display: none;
        padding: 8px;
        font-size: ${fontSize};
        font-family: ${fontFamily};
        border: 2px solid #3B82F6;
        border-radius: 8px;
        background: #FFFFFF;
        color: #333333;
        z-index: 9999;
        outline: none;
      `;
      document.body.appendChild(inputElement);
      
      container.setInteractive({ useHandCursor: true })
        .on('pointerdown', (pointer) => {
          if (isEditing) return;
          
          isEditing = true;
          originalText = textObj.text;
          
          // Position input over the text
          const camera = this.cameras.main;
          const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
          
          inputElement.style.display = 'block';
          inputElement.style.left = `${pointer.x - textWidth / 2}px`;
          inputElement.style.top = `${pointer.y - textHeight / 2}px`;
          inputElement.style.width = `${textWidth}px`;
          inputElement.value = originalText;
          inputElement.focus();
          inputElement.select();
          
          // Hide the game text while editing
          textObj.setVisible(false);
          bg.lineStyle(3, 0xF59E0B, 1);
          bg.strokeRoundedRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 10);
        });
      
      // Handle edit completion
      const finishEditing = () => {
        if (!isEditing) return;
        
        const newText = inputElement.value.trim() || originalText;
        textObj.setText(newText);
        
        // Recalculate background size if text changed
        if (newText !== originalText) {
          bg.clear();
          const newWidth = textObj.width + padding * 2;
          const newHeight = textObj.height + padding * 2;
          bg.fillStyle(backgroundColor, 0.95);
          bg.fillRoundedRect(-newWidth / 2, -newHeight / 2, newWidth, newHeight, 10);
          bg.lineStyle(2, borderColor, 1);
          bg.strokeRoundedRect(-newWidth / 2, -newHeight / 2, newWidth, newHeight, 10);
        }
        
        // Reset styles
        textObj.setVisible(true);
        isEditing = false;
        inputElement.style.display = 'none';
        
        // Call completion callback if provided
        if (onEditComplete) {
          onEditComplete(newText, container);
        }
      };
      
      // Handle input events
      inputElement.addEventListener('blur', finishEditing);
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          inputElement.blur();
        } else if (e.key === 'Escape') {
          textObj.setText(originalText);
          inputElement.blur();
        }
      });
      
      // Store input element for cleanup
      container.inputElement = inputElement;
    }
    
    container.textObj = textObj;
    container.bg = bg;
    container.originalText = initialText;
    
    return container;
  }

  /**
   * Adds processed image names as editable text elements to the game
   * 
   * @param {Array} processedImages - Array of processed image objects from processUploadedImages()
   * @param {Object} layout - Layout configuration
   */
  addImageNameElements(processedImages, layout = {}) {
    const {
      startX = 100,
      startY = 100,
      spacingX = 320,
      spacingY = 80,
      columns = 3,
      fontSize = '18px',
      editable = true
    } = layout;
    
    const elements = [];
    
    processedImages.forEach((imageData, index) => {
      const x = startX + (index % columns) * spacingX;
      const y = startY + Math.floor(index / columns) * spacingY;
      
      const textElement = this.createEditableTextElement(x, y, imageData.name, {
        fontSize,
        editable,
        onEditComplete: (newName, container) => {
          // Update the image data when text is edited
          imageData.name = newName;
        }
      });
      
      elements.push(textElement);
    });
    
    return elements;
  }

  /**
   * Cleans up editable text elements (removes DOM elements)
   * 
   * @param {Array} elements - Array of editable text elements to clean up
   */
  cleanupEditableElements(elements) {
    elements.forEach(element => {
      if (element.inputElement) {
        element.inputElement.removeEventListener('blur');
        element.inputElement.removeEventListener('keydown');
        document.body.removeChild(element.inputElement);
      }
      element.destroy();
    });
  }

  async onCardClick(card) {
    if (card.isRevealed) return;

    const currentPlayerIndex = this.gameStateRef.current.currentPlayerIndex;

    // Validate turn order - this is a HARD RULE
    const expectedPlayer = this.totalTurnsTaken % this.players.length;
    if (currentPlayerIndex !== expectedPlayer) {
      console.error(`TURN VIOLATION! Current player: ${currentPlayerIndex}, Expected: ${expectedPlayer}, Total turns: ${this.totalTurnsTaken}`);
      // Force correct turn
      this.setGameState(prev => ({ ...prev, currentPlayerIndex: expectedPlayer }));
      return;
    }

    card.isRevealed = true;
    this.flippedCount++;
    this.totalTurnsTaken++;

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

    // Next turn - always move to next player regardless of outcome
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

    // Call the winner callback to notify React component
    if (this.onWinner) {
      const winner = this.players[winnerIndex];
      this.onWinner(winner, winnerIndex);
    }

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
    const panel = this.getPlayerPanel(playerIndex);

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
      x: panel.x + 90,
      y: panel.y + 182,
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

  getPlayerPanel(playerIndex) {
    if (playerIndex === 0) return this.leftPlayerPanel;
    if (playerIndex === 1) return this.rightPlayerPanel;
    if (this.extraPanels && playerIndex >= 2) {
      return this.extraPanels[playerIndex - 2];
    }
    return this.leftPlayerPanel;
  }

  async handlePoints(playerIndex, points, card) {
    if (points === 0) {
      this.soundManager?.playSound('hover');
      return;
    }

    this.soundManager?.playSound('points');

    const player = this.players[playerIndex];
    const panel = this.getPlayerPanel(playerIndex);

    // Use the clicked card position for animation start
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
      x: panel.x + 90,
      y: panel.y + 182,
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

    // Flash effect only (no screen shake for regular points)
    const flash = this.add.graphics();
    flash.fillStyle(0xFFD700, 0.3);
    flash.fillRect(0, 0, this.scale.width, this.scale.height);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      onComplete: () => flash.destroy()
    });
  }

  adjustPoints(playerIndex, amount) {
    const player = this.players[playerIndex];
    const panel = this.getPlayerPanel(playerIndex);
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
    const feedback = this.add.text(panel.x + 90, panel.y + 230, amount > 0 ? '+' + amount : amount, {
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

    // Update extra panels for 3-4 players
    if (this.extraPanels && this.extraPanels.length > 0) {
      this.extraPanels.forEach((panel, index) => {
        const playerIndex = index + 2; // Starts from 2 (leftPlayerPanel=0, rightPlayerPanel=1)
        panel.turnIndicator?.setVisible(currentPlayerIndex === playerIndex);
        panel.activeBadge?.setVisible(currentPlayerIndex === playerIndex);
      });
    }
  }

  nextTurn() {
    // Calculate next player using total turns taken - this is UNBREAKABLE
    const nextPlayerIndex = (this.totalTurnsTaken) % this.players.length;

    this.setGameState(prev => ({
      ...prev,
      currentPlayerIndex: nextPlayerIndex
    }));

    this.soundManager?.playSound('turn');
  }
}

const TornadoGame = ({ config, players, onGameEnd, onBackToSetup, onExitToPortal, selectedClass, onGivePoints }) => {
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

  const [pointsToGive, setPointsToGive] = useState(1);
  const [pointsGiven, setPointsGiven] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const handleWinner = (winner, winnerIndex) => {
      setWinnerData({ ...winner, index: winnerIndex });
      setShowWinnerModal(true);
    };

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
        onExitToPortal,
        gameStateRef,
        setGameState,
        handleWinner
      )
    };

    const game = new Phaser.Game(phaserConfig);
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const handleGivePointsToWinner = () => {
    if (winnerData && onGivePoints) {
      onGivePoints([winnerData], pointsToGive);
      setPointsGiven(true);
    }
  };

  const handleWinnerModalClose = () => {
    setShowWinnerModal(false);
    setWinnerData(null);
    setPointsGiven(false);
    setPointsToGive(1);
    onBackToSetup();
  };

  return (
    <>
      <div
        ref={gameContainerRef}
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #E6F3FF 0%, #FFB6C1 50%, #E6E6FA 100%)'
      }}
    />

      {/* Winner Modal */}
      {showWinnerModal && winnerData && (
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
              animation: 'bounceIn 0.5s ease-out',
              overflowY: 'auto'
            }}
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
              <span style={{ fontSize: 60 }}>🏆</span>
            </div>

            {/* Winner Text */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, color: '#1f2937', textShadow: '2px 2px 4px rgba(255,255,255,0.5)', marginBottom: 8 }}>
                🎉 WINNER! 🎉
              </div>
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#1f2937' }}>
                {winnerData.name}
              </div>
              <div style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, color: '#374151', marginTop: 8 }}>
                ⭐ {winnerData.score || 0} points ⭐
              </div>
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
                  onClick={handleGivePointsToWinner}
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
                  🎁 Give {pointsToGive} Point{pointsToGive !== 1 ? 's' : ''} to {winnerData.name}
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
                ✅ {pointsToGive} point{pointsToGive !== 1 ? 's' : ''} given to {winnerData.name}!
              </div>
            )}

            {/* Exit Button */}
            <button
              onClick={handleWinnerModalClose}
              style={{
                padding: '16px 40px',
                fontSize: 20,
                fontWeight: '800',
                background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                cursor: 'pointer',
                boxShadow: '0 6px 24px rgba(78,205,196,0.5)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 32px rgba(78,205,196,0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 6px 24px rgba(78,205,196,0.5)';
              }}
            >
              🎮 Play Again
            </button>
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
        </div>
      )}
    </>
  );
};

export default TornadoGame;
