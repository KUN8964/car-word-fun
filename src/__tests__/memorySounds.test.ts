import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  playMemoryFlipSound,
  playMemoryRewardSound,
  rewardMelodyForStars,
} from '../audio/memorySounds';

afterEach(() => vi.unstubAllGlobals());

describe('memory reward sounds', () => {
  it('uses progressively richer melodies for one, two, and three stars', () => {
    const oneStar = rewardMelodyForStars(1);
    const twoStars = rewardMelodyForStars(2);
    const threeStars = rewardMelodyForStars(3);

    expect(oneStar).toHaveLength(1);
    expect(twoStars).toHaveLength(2);
    expect(threeStars).toHaveLength(4);
    expect(threeStars[threeStars.length - 1].frequency)
      .toBeGreaterThan(twoStars[twoStars.length - 1].frequency);
  });

  it('clamps unexpected star values to a valid reward level', () => {
    expect(rewardMelodyForStars(0)).toEqual(rewardMelodyForStars(1));
    expect(rewardMelodyForStars(9)).toEqual(rewardMelodyForStars(3));
  });

  it('schedules one click tone and a four-note three-star reward', () => {
    const start = vi.fn();
    const audioParam = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    };
    class FakeAudioContext {
      currentTime = 0;
      state = 'running';
      destination = {};
      createOscillator() {
        return { type: 'sine', frequency: audioParam, connect: vi.fn(), start, stop: vi.fn() };
      }
      createGain() {
        return { gain: audioParam, connect: vi.fn() };
      }
      resume() {
        return Promise.resolve();
      }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext);

    playMemoryFlipSound();
    playMemoryRewardSound(3);

    expect(start).toHaveBeenCalledTimes(5);
  });
});
