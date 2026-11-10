let ctx: AudioContext | null = null;

/** Tiny synthesized beeps so games need no audio files. */
export function beep(kind: 'good' | 'bad' | 'end', enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = kind === 'good' ? [660, 880] : kind === 'bad' ? [220, 160] : [523, 659, 784];
    const type: OscillatorType = kind === 'bad' ? 'sawtooth' : 'sine';
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      const t = ctx!.currentTime + i * 0.1;
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {
    /* audio not available */
  }
}
