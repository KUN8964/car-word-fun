import { describe, expect, it } from 'vitest';
import { VEHICLES } from '../vehicleData';
import {
  availableMemoryRules,
  cardsMatch,
  createMemoryDeck,
  memoryBestKey,
  memoryPairCount,
  type MemoryBoardSize,
} from '../game/memory';
import { vehicleThumbnailPath } from '../assets';

const colorForVehicle = (vehicle: (typeof VEHICLES)[number]) => vehicle.color;
const categoryForVehicle = (vehicle: (typeof VEHICLES)[number]) => vehicle.category;

describe('memory game engine', () => {
  it.each([4, 6, 8] as MemoryBoardSize[])('creates a complete %sx%s vehicle deck', (size) => {
    const deck = createMemoryDeck({
      vehicles: VEHICLES,
      rule: 'vehicle',
      size,
      colorForVehicle,
      categoryForVehicle,
      random: () => 0,
    });

    expect(deck).toHaveLength(size * size);
    const counts = new Map<string, number>();
    deck.forEach((card) => counts.set(card.matchKey, (counts.get(card.matchKey) || 0) + 1));
    expect(counts.size).toBe(memoryPairCount(size));
    expect([...counts.values()].every((count) => count === 2)).toBe(true);
  });

  it.each(['color', 'category'] as const)('creates an even, completable %s deck', (rule) => {
    const deck = createMemoryDeck({
      vehicles: VEHICLES,
      rule,
      size: 8,
      colorForVehicle,
      categoryForVehicle,
      random: () => 0,
    });

    expect(deck).toHaveLength(64);
    const counts = new Map<string, number>();
    deck.forEach((card) => counts.set(card.matchKey, (counts.get(card.matchKey) || 0) + 1));
    expect([...counts.values()].every((count) => count % 2 === 0)).toBe(true);
  });

  it('uses two different vehicles for color and category pairs', () => {
    const deck = createMemoryDeck({
      vehicles: VEHICLES,
      rule: 'color',
      size: 4,
      colorForVehicle,
      categoryForVehicle,
      random: () => 0,
    });

    const first = deck[0];
    const partner = deck.find((card) => card.id !== first.id && card.matchKey === first.matchKey)!;
    expect(first.vehicle.id).not.toBe(partner.vehicle.id);
    expect(cardsMatch(first, partner)).toBe(true);
  });

  it('returns no vehicle deck when there are not enough unique vehicles', () => {
    const deck = createMemoryDeck({
      vehicles: VEHICLES.slice(0, 7),
      rule: 'vehicle',
      size: 4,
      colorForVehicle,
      categoryForVehicle,
    });
    expect(deck).toEqual([]);
  });

  it('reports only rules supported by the eligible data', () => {
    const vehicles = VEHICLES.filter((vehicle) => vehicle.color === 'red').slice(0, 2);
    expect(availableMemoryRules(vehicles, colorForVehicle, categoryForVehicle)).toContain('color');
  });

  it('builds stable storage and thumbnail keys', () => {
    expect(memoryBestKey('category', 6)).toBe('category-6');
    expect(vehicleThumbnailPath(VEHICLES[0])).toMatch(/^\/vehicle-thumbs\/.+\.webp$/);
  });

});
