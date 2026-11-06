// audio.js — generated sound effects using the Web Audio API. No files, no licenses needed.
let audioCtx = null;

function ensureContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function now() {
  ensureContext();
  return audioCtx.currentTime;
}

function whiteNoise(duration, volume, filterFreq = null, fadeOut = 0.05) {
  const bufferSize = Math.ceil(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, now());
  gain.gain.exponentialRampToValueAtTime(0.001, now() + duration);
  if (filterFreq) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    noise.connect(filter);
    filter.connect(gain);
  } else {
    noise.connect(gain);
  }
  gain.connect(audioCtx.destination);
  noise.start();
  noise.stop(now() + duration + 0.02);
}

export function playShoot() {
  if (!audioCtx) ensureContext();
  const t = now();
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(900, t);
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.18, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

export function playHit() {
  if (!audioCtx) ensureContext();
  whiteNoise(0.18, 0.22, 1200, 0.08);
}

export function playDeath() {
  if (!audioCtx) ensureContext();
  const t = now();
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.25, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}

export function resumeAudio() {
  ensureContext();
}
