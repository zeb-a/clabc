// Lightweight game sound effects using Web Audio API (no external files)
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

export const sounds = {
  match: () => { beep(523, 0.15, 'sine', 0.25); setTimeout(() => beep(659, 0.15, 'sine', 0.25), 80); setTimeout(() => beep(784, 0.2, 'sine', 0.25), 160); },
  flip: () => beep(400, 0.08, 'sine', 0.2),
  wrong: () => { beep(200, 0.12, 'sawtooth', 0.2); setTimeout(() => beep(150, 0.15, 'sawtooth', 0.2), 100); },
  correct: () => { beep(880, 0.12, 'sine', 0.25); setTimeout(() => beep(1100, 0.15, 'sine', 0.25), 80); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'sine', 0.3), i * 120)); },
  tick: () => beep(600, 0.05, 'sine', 0.15),
};

// Optional: background music URL (royalty-free)
export const MUSIC_URL = 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3';
