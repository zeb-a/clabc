class SoundManager {
    constructor() {
      this.sounds = {};
      this.music = null;
      this.audioContext = null;
      this.masterVolume = 0.7;
      this.initialized = false;
    }
  
    async init() {
      if (this.initialized) return;
  
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await this.createSounds();
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize SoundManager:', error);
      }
    }
  
    async createSounds() {
      // Background music - futuristic loop
      this.sounds.background = this.createBackgroundMusic();
  
      // Dice roll sound
      this.sounds.roll = this.createDiceRollSound();
  
      // Movement sound
      this.sounds.move = this.createMoveSound();
  
      // Tornado sound
      this.sounds.tornado = this.createTornadoSound();
  
      // Points sound
      this.sounds.points = this.createPointsSound();
  
      // Win sound
      this.sounds.win = this.createWinSound();
  
      // Turn change sound
      this.sounds.turn = this.createTurnSound();
  
      // Hover sound
      this.sounds.hover = this.createHoverSound();
    }
  
    createBackgroundMusic() {
      return () => {
        const ctx = this.audioContext;
        const duration = 8; // 8 second loop
        const now = ctx.currentTime;
  
        // Create oscillators for futuristic melody
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
  
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
  
          osc.type = 'sine';
          osc.frequency.value = notes[i % notes.length];
  
          filter.type = 'lowpass';
          filter.frequency.value = 2000;
  
          gain.gain.setValueAtTime(0, now + i * 0.5);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.5 + 0.1);
          gain.gain.linearRampToValueAtTime(0.15, now + i * 0.5 + 1.5);
          gain.gain.linearRampToValueAtTime(0, now + i * 0.5 + 2);
  
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
  
          osc.start(now + i * 0.5);
          osc.stop(now + i * 0.5 + 2);
        }
  
        // Bass line
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
  
        bassOsc.type = 'triangle';
        bassOsc.frequency.value = 65.41; // C2
  
        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
        bassGain.gain.linearRampToValueAtTime(0.2, now + 3.8);
        bassGain.gain.linearRampToValueAtTime(0, now + 4);
  
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
  
        bassOsc.start(now);
        bassOsc.stop(now + 4);
  
        // Arpeggio
        const arpeggioNotes = [523.25, 659.25, 783.99, 1046.50];
        arpeggioNotes.forEach((freq, i) => {
          const arpOsc = ctx.createOscillator();
          const arpGain = ctx.createGain();
  
          arpOsc.type = 'sine';
          arpOsc.frequency.value = freq;
  
          arpGain.gain.setValueAtTime(0, now + i * 0.25);
          arpGain.gain.linearRampToValueAtTime(0.08, now + i * 0.25 + 0.05);
          arpGain.gain.linearRampToValueAtTime(0, now + i * 0.25 + 0.2);
  
          arpOsc.connect(arpGain);
          arpGain.connect(ctx.destination);
  
          arpOsc.start(now + i * 0.25);
          arpOsc.stop(now + i * 0.25 + 0.2);
        });
  
        return this;
      };
    }
  
    createDiceRollSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        // Create multiple short clicks for rolling sound
        for (let i = 0; i < 5; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
  
          osc.type = 'triangle';
          osc.frequency.value = 800 + Math.random() * 400;
  
          gain.gain.setValueAtTime(0, now + i * 0.05);
          gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, now + i * 0.05 + 0.01);
          gain.gain.linearRampToValueAtTime(0, now + i * 0.05 + 0.03);
  
          osc.connect(gain);
          gain.connect(ctx.destination);
  
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.03);
        }
  
        // Final thud
        const finalOsc = ctx.createOscillator();
        const finalGain = ctx.createGain();
        const finalFilter = ctx.createBiquadFilter();
  
        finalOsc.type = 'square';
        finalOsc.frequency.value = 150;
  
        finalFilter.type = 'lowpass';
        finalFilter.frequency.value = 1000;
  
        finalGain.gain.setValueAtTime(0, now + 0.25);
        finalGain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, now + 0.25 + 0.01);
        finalGain.gain.linearRampToValueAtTime(0, now + 0.25 + 0.1);
  
        finalOsc.connect(finalFilter);
        finalFilter.connect(finalGain);
        finalGain.connect(ctx.destination);
  
        finalOsc.start(now + 0.25);
        finalOsc.stop(now + 0.25 + 0.1);
      };
    }
  
    createMoveSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
  
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
  
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
  
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.02);
        gain.gain.linearRampToValueAtTime(0, now + 0.1);
  
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start(now);
        osc.stop(now + 0.1);
      };
    }
  
    createTornadoSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        // Whoosh sound
        const noise = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
  
        for (let i = 0; i < noiseBuffer.length; i++) {
          noiseData[i] = Math.random() * 2 - 1;
        }
  
        noise.buffer = noiseBuffer;
  
        const noiseGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
  
        filter.type = 'bandpass';
        filter.frequency.value = 800;
  
        lfo.type = 'sine';
        lfo.frequency.value = 8;
        lfoGain.gain.value = 400;
  
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
  
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.4 * this.masterVolume, now + 0.1);
        noiseGain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + 0.8);
        noiseGain.gain.linearRampToValueAtTime(0, now + 1.5);
  
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
  
        lfo.start(now);
        noise.start(now);
        noise.stop(now + 1.5);
        lfo.stop(now + 1.5);
  
        // Add rumble
        const rumble = ctx.createOscillator();
        const rumbleGain = ctx.createGain();
  
        rumble.type = 'sawtooth';
        rumble.frequency.value = 80;
  
        rumbleGain.gain.setValueAtTime(0, now);
        rumbleGain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + 0.2);
        rumbleGain.gain.linearRampToValueAtTime(0, now + 1.5);
  
        rumble.connect(rumbleGain);
        rumbleGain.connect(ctx.destination);
  
        rumble.start(now);
        rumble.stop(now + 1.5);
      };
    }
  
    createPointsSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        // Coin-like sound
        const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6
  
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
  
          osc.type = 'sine';
          osc.frequency.value = freq;
  
          gain.gain.setValueAtTime(0, now + i * 0.05);
          gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + i * 0.05 + 0.02);
          gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + i * 0.05 + 0.1);
          gain.gain.linearRampToValueAtTime(0, now + i * 0.05 + 0.3);
  
          osc.connect(gain);
          gain.connect(ctx.destination);
  
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.3);
        });
  
        // Sparkle effect
        for (let i = 0; i < 3; i++) {
          const sparkle = ctx.createOscillator();
          const sparkleGain = ctx.createGain();
  
          sparkle.type = 'triangle';
          sparkle.frequency.value = 2000 + Math.random() * 2000;
  
          sparkleGain.gain.setValueAtTime(0, now + i * 0.1);
          sparkleGain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + i * 0.1 + 0.01);
          sparkleGain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.05);
  
          sparkle.connect(sparkleGain);
          sparkleGain.connect(ctx.destination);
  
          sparkle.start(now + i * 0.1);
          sparkle.stop(now + i * 0.1 + 0.05);
        }
      };
    }
  
    createWinSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        // Victory fanfare
        const melody = [
          { freq: 523.25, start: 0, duration: 0.3 },    // C5
          { freq: 659.25, start: 0.3, duration: 0.3 },  // E5
          { freq: 783.99, start: 0.6, duration: 0.3 },  // G5
          { freq: 1046.50, start: 0.9, duration: 0.5 }, // C6
          { freq: 783.99, start: 1.4, duration: 0.3 },  // G5
          { freq: 1046.50, start: 1.7, duration: 0.6 }, // C6
        ];
  
        melody.forEach(({ freq, start, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
  
          osc.type = 'triangle';
          osc.frequency.value = freq;
  
          gain.gain.setValueAtTime(0, now + start);
          gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, now + start + 0.05);
          gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + start + duration * 0.7);
          gain.gain.linearRampToValueAtTime(0, now + start + duration);
  
          osc.connect(gain);
          gain.connect(ctx.destination);
  
          osc.start(now + start);
          osc.stop(now + start + duration);
        });
  
        // Chord accompaniment
        const chord = [523.25, 659.25, 783.99]; // C major
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
  
          osc.type = 'sine';
          osc.frequency.value = freq;
  
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 0.1);
          gain.gain.linearRampToValueAtTime(0.15 * this.masterVolume, now + 1.8);
          gain.gain.linearRampToValueAtTime(0, now + 2.3);
  
          osc.connect(gain);
          gain.connect(ctx.destination);
  
          osc.start(now);
          osc.stop(now + 2.3);
        });
  
        // Celebration particles sound
        for (let i = 0; i < 10; i++) {
          const particle = ctx.createOscillator();
          const particleGain = ctx.createGain();
  
          particle.type = 'sine';
          particle.frequency.value = 1000 + Math.random() * 3000;
  
          particleGain.gain.setValueAtTime(0, now + i * 0.2);
          particleGain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + i * 0.2 + 0.02);
          particleGain.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.1);
  
          particle.connect(particleGain);
          particleGain.connect(ctx.destination);
  
          particle.start(now + i * 0.2);
          particle.stop(now + i * 0.2 + 0.1);
        }
      };
    }
  
    createTurnSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
  
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
  
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
  
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + 0.02);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
  
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start(now);
        osc.stop(now + 0.15);
      };
    }
  
    createHoverSound() {
      return () => {
        if (!this.audioContext) return;
        const ctx = this.audioContext;
        const now = ctx.currentTime;
  
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
  
        osc.type = 'sine';
        osc.frequency.value = 1000;
  
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.01);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);
  
        osc.connect(gain);
        gain.connect(ctx.destination);
  
        osc.start(now);
        osc.stop(now + 0.05);
      };
    }
  
    playMusic(name) {
      if (this.sounds[name] && typeof this.sounds[name] === 'function') {
        this.sounds[name]();
      }
    }
  
    playSound(name) {
      if (this.sounds[name] && typeof this.sounds[name] === 'function') {
        this.sounds[name]();
      }
    }
  
    setVolume(volume) {
      this.masterVolume = Math.max(0, Math.min(1, volume));
    }
  
    stopAll() {
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }
    }
  }
  
  export { SoundManager };
  