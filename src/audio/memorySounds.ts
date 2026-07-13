export interface ToneStep {
  frequency: number;
  delay: number;
  duration: number;
  gain: number;
  type: OscillatorType;
}

const REWARD_MELODIES: Record<1 | 2 | 3, ToneStep[]> = {
  1: [
    { frequency: 392, delay: 0, duration: 0.16, gain: 0.045, type: 'triangle' },
  ],
  2: [
    { frequency: 523.25, delay: 0, duration: 0.14, gain: 0.05, type: 'triangle' },
    { frequency: 659.25, delay: 0.14, duration: 0.2, gain: 0.055, type: 'triangle' },
  ],
  3: [
    { frequency: 523.25, delay: 0, duration: 0.12, gain: 0.05, type: 'triangle' },
    { frequency: 659.25, delay: 0.11, duration: 0.12, gain: 0.052, type: 'triangle' },
    { frequency: 783.99, delay: 0.22, duration: 0.14, gain: 0.055, type: 'triangle' },
    { frequency: 1046.5, delay: 0.35, duration: 0.28, gain: 0.06, type: 'sine' },
  ],
};

let sharedContext: AudioContext | null = null;

export function rewardMelodyForStars(stars: number): ToneStep[] {
  const level = Math.max(1, Math.min(3, Math.round(stars))) as 1 | 2 | 3;
  return REWARD_MELODIES[level].map((step) => ({ ...step }));
}

export function playMemoryFlipSound(): void {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime + 0.005;
  playTone(context, {
    frequency: 620,
    delay: 0,
    duration: 0.055,
    gain: 0.028,
    type: 'triangle',
  }, start, 470);
}

export function playMemoryRewardSound(stars: number): void {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime + 0.02;
  rewardMelodyForStars(stars).forEach((step) => playTone(context, step, start));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext
    || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext || sharedContext.state === 'closed') sharedContext = new AudioContextClass();
  if (sharedContext.state === 'suspended') void sharedContext.resume().catch(() => undefined);
  return sharedContext;
}

function playTone(
  context: AudioContext,
  step: ToneStep,
  sequenceStart: number,
  endFrequency = step.frequency,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = sequenceStart + step.delay;
  const end = start + step.duration;

  oscillator.type = step.type;
  oscillator.frequency.setValueAtTime(step.frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, end);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(step.gain, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}
