import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readV2, writeV2, migrateV1toV2, DEFAULT_V2, type StorageV2 } from '../storage';
import { VEHICLES } from '../vehicleData';

describe('storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('locks every built-in color and category by default', () => {
    expect(readV2()).toEqual(DEFAULT_V2);
    expect(Object.keys(DEFAULT_V2.lockedColors)).toHaveLength(VEHICLES.length);
    expect(Object.keys(DEFAULT_V2.lockedCategories)).toHaveLength(VEHICLES.length);
    expect(Object.values(DEFAULT_V2.lockedColors).every(Boolean)).toBe(true);
    expect(Object.values(DEFAULT_V2.lockedCategories).every(Boolean)).toBe(true);
  });

  it('should persist and read colorOverrides', () => {
    const data: StorageV2 = { ...DEFAULT_V2, colorOverrides: { '458': 'red' } };
    writeV2(data);
    expect(readV2().colorOverrides).toEqual({ '458': 'red' });
  });

  it('should persist and read collectedCards', () => {
    const data = { ...DEFAULT_V2, collectedCards: ['458', 'g63'] };
    writeV2(data);
    expect(readV2().collectedCards).toEqual(['458', 'g63']);
  });

  it('persists valid memory best results and removes malformed entries', () => {
    localStorage.setItem('car-car-adventure-tags-v2', JSON.stringify({
      memoryBest: {
        'vehicle-4': { moves: 12, seconds: 34 },
        'vehicle-5': { moves: 1, seconds: 1 },
        'color-6': { moves: -1, seconds: 20 },
      },
    }));

    expect(readV2().memoryBest).toEqual({
      'vehicle-4': { moves: 12, seconds: 34 },
    });
  });

  it('should migrate v1 data to v2', () => {
    localStorage.setItem('car-car-adventure-color-tags-v1', JSON.stringify({ '458': 'red', 'g63': 'black' }));
    migrateV1toV2();
    const v2 = readV2();
    expect(v2.colorOverrides).toEqual({ '458': 'red', 'g63': 'black' });
    expect(v2.categoryOverrides).toEqual({});
    expect(v2.collectedCards).toEqual([]);
  });

  it('should not overwrite existing v2 colorOverrides during migration', () => {
    writeV2({ ...DEFAULT_V2, colorOverrides: { 'a4': 'blue' } });
    localStorage.setItem('car-car-adventure-color-tags-v1', JSON.stringify({ '458': 'red' }));
    migrateV1toV2();
    expect(readV2().colorOverrides).toEqual({ 'a4': 'blue' });
  });

  it('should handle corrupt data gracefully', () => {
    localStorage.setItem('car-car-adventure-tags-v2', 'not-json{');
    expect(readV2()).toEqual(DEFAULT_V2);
  });

  it('sanitizes malformed fields while preserving explicit unlocks', () => {
    localStorage.setItem('car-car-adventure-tags-v2', JSON.stringify({
      colorOverrides: { '458': 'red', g63: 'neon' },
      categoryOverrides: { '458': 'race', g63: 42 },
      lockedColors: { '458': false, g63: 'yes', removed: true },
      lockedCategories: { g63: false },
      collectedCards: ['458', 'removed-card', '458', 7],
      streak: -3,
    }));

    const restored = readV2();
    expect(restored.colorOverrides).toEqual({ '458': 'red' });
    expect(restored.categoryOverrides).toEqual({ '458': 'race' });
    expect(restored.collectedCards).toEqual(['458']);
    expect(restored.streak).toBe(0);
    expect(restored.lockedColors['458']).toBe(false);
    expect(restored.lockedColors.g63).toBe(true);
    expect(restored.lockedColors.removed).toBeUndefined();
    expect(restored.lockedCategories.g63).toBe(false);
    expect(Object.keys(restored.lockedColors)).toHaveLength(VEHICLES.length);
    expect(Object.keys(restored.lockedCategories)).toHaveLength(VEHICLES.length);
  });

  it('backfills default locks into older v2 saves', () => {
    localStorage.setItem('car-car-adventure-tags-v2', JSON.stringify({
      colorOverrides: { '458': 'blue' },
      categoryOverrides: {},
      collectedCards: [],
      streak: 2,
    }));

    const restored = readV2();
    expect(restored.colorOverrides).toEqual({ '458': 'blue' });
    expect(restored.streak).toBe(2);
    expect(Object.values(restored.lockedColors).every(Boolean)).toBe(true);
    expect(Object.values(restored.lockedCategories).every(Boolean)).toBe(true);
  });

  it('returns false instead of crashing when storage writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Storage disabled', 'SecurityError');
    });

    expect(writeV2(DEFAULT_V2)).toBe(false);
  });

  it('filters invalid values while migrating v1 data', () => {
    localStorage.setItem('car-car-adventure-color-tags-v1', JSON.stringify({
      '458': 'red',
      g63: 'neon',
    }));

    migrateV1toV2();
    expect(readV2().colorOverrides).toEqual({ '458': 'red' });
  });
});
