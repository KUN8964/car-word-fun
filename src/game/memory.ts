import type { Vehicle, VehicleCategory, VehicleColor } from '../vehicleData';
import { sample, shuffle, type RandomSource } from './engine';

export type MemoryRule = 'vehicle' | 'color' | 'category';
export type MemoryBoardSize = 4 | 6 | 8;

export interface MemoryCard {
  id: string;
  vehicle: Vehicle;
  matchKey: string;
}

export interface MemoryDeckParams {
  vehicles: Vehicle[];
  rule: MemoryRule;
  size: MemoryBoardSize;
  colorForVehicle: (vehicle: Vehicle) => VehicleColor;
  categoryForVehicle: (vehicle: Vehicle) => VehicleCategory;
  random?: RandomSource;
}

export function memoryPairCount(size: MemoryBoardSize): number {
  return (size * size) / 2;
}

export function memoryBestKey(rule: MemoryRule, size: MemoryBoardSize): string {
  return `${rule}-${size}`;
}

export function cardsMatch(first: MemoryCard, second: MemoryCard): boolean {
  return first.id !== second.id && first.matchKey === second.matchKey;
}

export function availableMemoryRules(
  vehicles: Vehicle[],
  colorForVehicle: (vehicle: Vehicle) => VehicleColor,
  categoryForVehicle: (vehicle: Vehicle) => VehicleCategory,
): MemoryRule[] {
  const rules: MemoryRule[] = [];
  if (vehicles.length >= 2) rules.push('vehicle');

  const colorGroups = groupVehicles(vehicles, (vehicle) => colorForVehicle(vehicle));
  if ([...colorGroups.values()].some((group) => group.length >= 2)) rules.push('color');

  const categoryGroups = groupVehicles(vehicles, (vehicle) => categoryForVehicle(vehicle));
  if ([...categoryGroups.values()].some((group) => group.length >= 2)) rules.push('category');
  return rules;
}

export function createMemoryDeck(params: MemoryDeckParams): MemoryCard[] {
  const {
    vehicles, rule, size, colorForVehicle, categoryForVehicle,
    random = Math.random,
  } = params;
  const pairCount = memoryPairCount(size);

  if (rule === 'vehicle') {
    if (vehicles.length < pairCount) return [];
    const selected = sample(vehicles, pairCount, random);
    const cards = selected.flatMap((vehicle, pairIndex) => [
      createCard(vehicle, `vehicle:${vehicle.id}`, `${pairIndex}-a`),
      createCard(vehicle, `vehicle:${vehicle.id}`, `${pairIndex}-b`),
    ]);
    return shuffle(cards, random);
  }

  const getKey = rule === 'color'
    ? (vehicle: Vehicle) => colorForVehicle(vehicle)
    : (vehicle: Vehicle) => categoryForVehicle(vehicle);
  const groups = [...groupVehicles(vehicles, getKey).entries()]
    .filter(([, group]) => group.length >= 2);
  if (groups.length === 0) return [];

  const groupOrder = shuffle(groups, random);
  const cards: MemoryCard[] = [];
  for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
    const [key, group] = groupOrder[pairIndex % groupOrder.length];
    const [first, second] = sample(group, 2, random);
    cards.push(
      createCard(first, `${rule}:${key}`, `${pairIndex}-a`),
      createCard(second, `${rule}:${key}`, `${pairIndex}-b`),
    );
  }
  return shuffle(cards, random);
}

function createCard(vehicle: Vehicle, matchKey: string, suffix: string): MemoryCard {
  return {
    id: `${matchKey}:${vehicle.id}:${suffix}`,
    vehicle,
    matchKey,
  };
}

function groupVehicles(
  vehicles: Vehicle[],
  getKey: (vehicle: Vehicle) => string,
): Map<string, Vehicle[]> {
  const groups = new Map<string, Vehicle[]>();
  vehicles.forEach((vehicle) => {
    const key = getKey(vehicle);
    const group = groups.get(key) || [];
    group.push(vehicle);
    groups.set(key, group);
  });
  return groups;
}
