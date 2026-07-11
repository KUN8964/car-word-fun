import { describe, expect, it } from 'vitest';
import { VEHICLES, type Vehicle, type VehicleColor } from '../vehicleData';
import { createRound, evaluatePick, formatRoundLabel, sample, shuffle } from '../game/engine';
import type { RandomSource, RoundGenParams } from '../game/engine';
import type { Round } from '../constants';

function sequenceRandom(values: number[], fallback = 0): RandomSource {
  let index = 0;
  return () => values[index++] ?? fallback;
}

function makeParams(overrides: Partial<RoundGenParams> = {}): RoundGenParams {
  const markedVehicles = VEHICLES.filter((vehicle) => vehicle.color !== 'unknown');
  const colorCounts = new Map<VehicleColor, number>();
  markedVehicles.forEach((vehicle) => {
    colorCounts.set(vehicle.color, (colorCounts.get(vehicle.color) || 0) + 1);
  });

  return {
    colorCounts,
    markedVehicles,
    categoryForVehicle: (vehicle) => vehicle.category,
    colorForVehicle: (vehicle) => vehicle.color,
    collectedCards: ['458', 'g63', 'f40', 'ae86', 'r8'],
    language: 'zh',
    colorLabel: (color) => color,
    random: () => 0,
    ...overrides,
  };
}

function colorRound(options: Vehicle[]): Round {
  return {
    questionType: 'color',
    targetColor: 'red',
    targetCount: 1,
    options,
    selectedIds: [],
    matchedTargets: [],
    lastSelectedId: null,
    result: 'idle',
  };
}

describe('random helpers', () => {
  it('samples without mutating the source array', () => {
    const items = [1, 2, 3, 4];
    expect(sample(items, 2, () => 0)).toEqual([1, 2]);
    expect(items).toEqual([1, 2, 3, 4]);
  });

  it('returns no more items than are available', () => {
    expect(sample([1, 2], 5, () => 0)).toEqual([1, 2]);
  });

  it('shuffles using the provided random source', () => {
    expect(shuffle([1, 2, 3], () => 0.999)).toEqual([3, 2, 1]);
  });
});

describe('createRound', () => {
  it('generates a deterministic color round', () => {
    const round = createRound(makeParams({
      collectedCards: [],
      random: sequenceRandom([0.9, 0.9]),
    }));

    expect(round.questionType).toBe('color');
    expect(round.targetColor).toBeDefined();
    expect(round.targetCount).toBeGreaterThan(0);
    expect(round.options).toHaveLength(8);
  });

  it('generates a deterministic category round', () => {
    const round = createRound(makeParams({
      collectedCards: [],
      random: sequenceRandom([0.9, 0.1]),
    }));

    expect(round.questionType).toBe('category');
    expect(round.targetCategory).toBeDefined();
    expect(round.targetCount).toBeGreaterThan(0);
  });

  it('generates a deterministic math round with four choices', () => {
    const round = createRound(makeParams({ random: () => 0 }));

    expect(round.questionType).toBe('math');
    expect(round.mathQuestion).toBeTruthy();
    expect(round.mathChoices).toHaveLength(4);
    expect(round.mathChoices).toContain(round.targetCount);
  });

  it('ignores stale collected-card IDs when deciding whether math is available', () => {
    const round = createRound(makeParams({
      collectedCards: ['removed-1', 'removed-2', 'removed-3'],
      random: sequenceRandom([0, 0]),
    }));

    expect(round.questionType).not.toBe('math');
  });

  it('keeps a mixed round reachable when only one vehicle color is available', () => {
    const vehicle = VEHICLES.find((item) => item.id === '458')!;
    const round = createRound(makeParams({
      markedVehicles: [vehicle],
      colorCounts: new Map([['red', 1]]),
      collectedCards: [],
      random: sequenceRandom([0.2, 0, 0, 0]),
    }));

    expect(round.questionType).toBe('mixed');
    expect(round.targetCount).toBe(1);
    expect(round.options).toEqual([vehicle]);
    expect(round.mixedTargets).toEqual([{ color: 'red', category: 'car', count: 1 }]);
  });

  it('never asks for more mixed targets than it puts in the options', () => {
    const round = createRound(makeParams({
      collectedCards: [],
      random: sequenceRandom([0.2, 0.9]),
    }));

    expect(round.questionType).toBe('mixed');
    expect(round.targetCount).toBeGreaterThan(0);
    expect(round.targetCount).toBeLessThanOrEqual(round.options.length);
    expect(round.mixedTargets?.reduce((sum, target) => sum + target.count, 0)).toBe(round.targetCount);
  });
});

describe('evaluatePick', () => {
  const redVehicle = VEHICLES.find((vehicle) => vehicle.color === 'red')!;
  const blueVehicle = VEHICLES.find((vehicle) => vehicle.color === 'blue')!;

  it('accepts a correct color pick', () => {
    const result = evaluatePick({
      vehicle: redVehicle,
      round: colorRound([redVehicle, blueVehicle]),
      colorForVehicle: (vehicle) => vehicle.color,
      categoryForVehicle: (vehicle) => vehicle.category,
    });

    expect(result.correct).toBe(true);
    expect(result.result).toBe('correct');
    expect(result.selectedIds).toEqual([redVehicle.id]);
  });

  it('rejects a wrong color pick without selecting it', () => {
    const result = evaluatePick({
      vehicle: blueVehicle,
      round: colorRound([redVehicle, blueVehicle]),
      colorForVehicle: (vehicle) => vehicle.color,
      categoryForVehicle: (vehicle) => vehicle.category,
    });

    expect(result.correct).toBe(false);
    expect(result.result).toBe('wrong');
    expect(result.selectedIds).toEqual([]);
  });

  it('ignores an already selected vehicle', () => {
    const round = colorRound([redVehicle, blueVehicle]);
    round.targetCount = 2;
    round.selectedIds = [redVehicle.id];
    round.result = 'progress';

    const result = evaluatePick({
      vehicle: redVehicle,
      round,
      colorForVehicle: (vehicle) => vehicle.color,
      categoryForVehicle: (vehicle) => vehicle.category,
    });

    expect(result.correct).toBe(false);
    expect(result.result).toBe('progress');
    expect(result.selectedIds).toEqual([redVehicle.id]);
  });
});

describe('formatRoundLabel', () => {
  it('formats color, category, and mixed labels without random setup', () => {
    const round = colorRound([]);
    expect(formatRoundLabel(round, 'zh', (color) => color)).toBe('red');

    expect(formatRoundLabel({ ...round, questionType: 'category', targetCategory: 'bus' }, 'zh', (color) => color))
      .toBe('巴士');

    expect(formatRoundLabel({
      ...round,
      questionType: 'mixed',
      mixedTargets: [{ color: 'red', category: 'race', count: 2 }],
    }, 'zh', (color) => color)).toBe('2 red 赛车');
  });
});
