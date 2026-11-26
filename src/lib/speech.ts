/** Reads Chinese aloud with the browser's built-in voice (no audio files needed). */
export function speak(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech not available */
  }
}
