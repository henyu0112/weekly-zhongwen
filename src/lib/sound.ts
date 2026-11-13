let ctx: AudioContext | null = null;

function audio(): AudioContext {
  ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
}

/** Low thump plus a burst of filtered noise. */
function boom(c: AudioContext): void {
  const t = c.currentTime;

  const len = Math.floor(c.sampleRate * 0.55);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1400, t);
  lp.frequency.exponentialRampToValueAtTime(180, t + 0.5);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.28, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
  noise.connect(lp).connect(ng).connect(c.destination);
  noise.start(t);

  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);
  og.gain.setValueAtTime(0.3, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(og).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.45);
}

/** Tiny synthesized sounds so games need no audio files. */
export function beep(kind: 'good' | 'bad' | 'end' | 'boom', enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const c = audio();
    if (kind === 'boom') {
      boom(c);
      return;
    }
    const notes = kind === 'good' ? [660, 880] : kind === 'bad' ? [220, 160] : [523, 659, 784];
    const type: OscillatorType = kind === 'bad' ? 'sawtooth' : 'sine';
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const t = c.currentTime + i * 0.1;
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain).connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {
    /* audio not available */
  }
}
