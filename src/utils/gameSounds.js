// Lightweight game sound effects using Web Audio API (no external files)
// Updated to ensure Vite picks up changes
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(freq = 440, duration = 0.1, type = 'sine', volume = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

// Load external audio file - returns Promise<AudioBuffer>
async function loadAudio(url) {
  try {
    const ctx = getCtx();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (e) {
    console.warn('Failed to load audio:', url, e);
    return null;
  }
}

// Cached audio buffers for horse sounds
let horseSoundBuffers = {
  0: null,
  1: null,
  2: null,
  3: null
};
let soundsLoaded = false;

// Load horse sounds from external files
async function loadHorseSounds() {
  if (soundsLoaded) return;

  const soundUrls = [
    '/sounds/horse-neigh-1.mp3',
    '/sounds/horse-neigh-2.mp3',
    '/sounds/horse-neigh-3.mp3',
    '/sounds/horse-neigh-4.mp3'
  ];

  for (let i = 0; i < soundUrls.length; i++) {
    horseSoundBuffers[i] = await loadAudio(soundUrls[i]);
  }

  soundsLoaded = true;
}

// Play loaded audio buffer or fallback to synthesized sound
function playHorseSound(variation = 0) {
  const ctx = getCtx();

  // Try to use pre-loaded audio file first
  if (horseSoundBuffers[variation % 4]) {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = horseSoundBuffers[variation % 4];
    source.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.7;
    source.start(ctx.currentTime);
    return;
  }

  // Fallback to synthesized sound
  generateSynthesizedNeigh(ctx, variation);
}

// Generate high-quality synthesized horse neigh (fallback when no audio files)
function generateSynthesizedNeigh(ctx, variation) {
  // Different horse variations based on player/index (0-3)
  const variations = [
    { baseFreq: 250, peakFreq: 600, duration: 0.6, filterFreq: 400, filterPeak: 600, q: 5 },
    { baseFreq: 280, peakFreq: 650, duration: 0.55, filterFreq: 450, filterPeak: 650, q: 6 },
    { baseFreq: 220, peakFreq: 580, duration: 0.65, filterFreq: 380, filterPeak: 550, q: 4.5 },
    { baseFreq: 300, peakFreq: 700, duration: 0.5, filterFreq: 500, filterPeak: 750, q: 5.5 }
  ];

  const v = variations[variation % variations.length];

  // Main horse neigh - distinctive rising then falling pattern with vibrato
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const filter1 = ctx.createBiquadFilter();
  osc1.connect(filter1);
  filter1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.frequency.setValueAtTime(v.baseFreq, ctx.currentTime);
  osc1.frequency.linearRampToValueAtTime(v.peakFreq * 0.8, ctx.currentTime + v.duration * 0.25);
  osc1.frequency.linearRampToValueAtTime(v.peakFreq, ctx.currentTime + v.duration * 0.42);
  osc1.frequency.linearRampToValueAtTime(v.peakFreq * 0.87, ctx.currentTime + v.duration * 0.67);
  osc1.frequency.linearRampToValueAtTime(v.baseFreq * 1.5, ctx.currentTime + v.duration * 0.92);
  osc1.type = 'sawtooth';
  filter1.type = 'bandpass';
  filter1.frequency.setValueAtTime(v.filterFreq, ctx.currentTime);
  filter1.frequency.linearRampToValueAtTime(v.filterPeak, ctx.currentTime + v.duration * 0.33);
  filter1.Q.value = v.q;
  gain1.gain.setValueAtTime(0, ctx.currentTime);
  gain1.gain.linearRampToValueAtTime(0.07, ctx.currentTime + v.duration * 0.08);
  gain1.gain.linearRampToValueAtTime(0.1, ctx.currentTime + v.duration * 0.33);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + v.duration);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + v.duration);

  // Add vibrato to main oscillator for realistic horse sound
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfo.frequency.value = 8 + (variation * 2);
  lfoGain.gain.value = 15 + (variation * 5);
  lfo.start(ctx.currentTime);
  lfo.stop(ctx.currentTime + v.duration);

  // Harmonic layer for richness
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.frequency.setValueAtTime(v.baseFreq * 1.12, ctx.currentTime);
  osc2.frequency.linearRampToValueAtTime(v.peakFreq * 0.87, ctx.currentTime + v.duration * 0.25);
  osc2.frequency.linearRampToValueAtTime(v.peakFreq * 1.07, ctx.currentTime + v.duration * 0.42);
  osc2.frequency.linearRampToValueAtTime(v.peakFreq, ctx.currentTime + v.duration * 0.67);
  osc2.frequency.linearRampToValueAtTime(v.baseFreq * 1.68, ctx.currentTime + v.duration * 0.92);
  osc2.type = 'triangle';
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.linearRampToValueAtTime(0.04, ctx.currentTime + v.duration * 0.08);
  gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + v.duration * 0.33);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + v.duration);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + v.duration);

  // Breathiness noise layer
  try {
    const bufferSize = ctx.sampleRate * v.duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const envelope = Math.sin(t * Math.PI / v.duration);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noise.buffer = buffer;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(v.filterFreq * 2, ctx.currentTime);
    noiseFilter.frequency.linearRampToValueAtTime(v.filterPeak * 2, ctx.currentTime + v.duration * 0.33);
    noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + v.duration * 0.25);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + v.duration);
    noise.start(ctx.currentTime);
  } catch (_) {}
}

export const sounds = {
  move: () => beep(300, 0.08, 'sine', 0.2),
  accelerate: () => {
    const ctx = getCtx();
    // Low rumble (engine idle base)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);
    osc1.type = 'sawtooth';
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);

    // Mid-range engine tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(160, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.25);
    osc2.type = 'triangle';
    gain2.gain.setValueAtTime(0.10, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.25);

    // High-pitched whine
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.setValueAtTime(300, ctx.currentTime);
    osc3.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.25);
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0.04, ctx.currentTime);
    gain3.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc3.start(ctx.currentTime);
    osc3.stop(ctx.currentTime + 0.25);

    // Add some noise for exhaust rumble
    try {
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
      }
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      noise.buffer = buffer;
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.25);
      noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      noise.start();
    } catch (_) {}
  },
  engineIdle: () => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 120;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  },
  rev: () => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },
  skid: () => {
    try {
      const ctx = getCtx();
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;
      source.start();
    } catch (_) {}
  },
  match: () => { beep(523, 0.15, 'sine', 0.25); setTimeout(() => beep(659, 0.15, 'sine', 0.25), 80); setTimeout(() => beep(784, 0.2, 'sine', 0.25), 160); },
  flip: () => beep(400, 0.08, 'sine', 0.2),
  wrong: () => { beep(200, 0.12, 'sawtooth', 0.2); setTimeout(() => beep(150, 0.15, 'sawtooth', 0.2), 100); },
  correct: () => { beep(880, 0.12, 'sine', 0.25); setTimeout(() => beep(1100, 0.15, 'sine', 0.25), 80); },
  win: () => {
    // Victory fanfare with more celebration
    const melody = [
      { f: 523, d: 0.2 }, { f: 659, d: 0.2 }, { f: 784, d: 0.2 }, { f: 1047, d: 0.3 },
      { f: 784, d: 0.15 }, { f: 1047, d: 0.4 },
      { f: 784, d: 0.15 }, { f: 1047, d: 0.5 }
    ];
    let time = 0;
    melody.forEach((n, i) => {
      setTimeout(() => beep(n.f, n.d, 'sine', 0.3), time);
      time += n.d * 1000;
    });
  },
  tick: () => beep(600, 0.05, 'sine', 0.15),
  celebration: () => {
    // Happy celebration sound
    const notes = [523, 659, 784, 1047, 784, 1047, 1318, 1047];
    notes.forEach((f, i) => setTimeout(() => beep(f, 0.15, 'sine', 0.25), i * 100));
  },
  neigh: (variation = 0) => {
    playHorseSound(variation);
  }
};

// Optional: background music URL (royalty-free)
export const MUSIC_URL = 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3';

// Export function to pre-load horse sounds
export { loadHorseSounds };

