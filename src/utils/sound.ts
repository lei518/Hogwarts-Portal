// Sound effects are synthesized with the Web Audio API rather than loaded from
// asset files, so playback works without shipping any audio files.
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  return audioContext;
}

function playTone(frequency: number, durationMs: number, type: OscillatorType = "sine"): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Audio is a nice-to-have; ignore autoplay restrictions or missing support.
  }
}

export function playClickSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(660, 90);
}

export function playSuccessSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(523, 120);
  setTimeout(() => playTone(784, 160), 110);
}

export function playFailureSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(220, 220, "triangle");
}

export function playAchievementSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(523, 130);
  setTimeout(() => playTone(659, 130), 120);
  setTimeout(() => playTone(784, 220), 240);
}
