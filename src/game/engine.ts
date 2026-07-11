import { VEHICLES, Vehicle, VehicleColor, VehicleCategory } from '../vehicleData';
import {
  CATEGORY_OPTIONS, CATEGORY_LABELS, GAME_COLORS,
  Language, MixedTarget, Round,
} from '../constants';

import { logger } from '../logger';

// ── helpers ──────────────────────────────────────────────

export type RandomSource = () => number;

export function sample<T>(items: T[], count: number, random: RandomSource = Math.random) {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length && picked.length < count) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

export function shuffle<T>(items: T[], random: RandomSource = Math.random) {
  return sample(items, items.length, random);
}

// ── round generator ──────────────────────────────────────

export interface RoundGenParams {
  colorCounts: Map<VehicleColor, number>;
  markedVehicles: Vehicle[];
  categoryForVehicle: (v: Vehicle) => VehicleCategory;
  colorForVehicle: (v: Vehicle) => VehicleColor;
  collectedCards: string[];
  language: Language;
  colorLabel: (c: VehicleColor) => string;
  random?: RandomSource;
}

export function createRound(params: RoundGenParams): Round {
  const {
    colorCounts, markedVehicles, categoryForVehicle, colorForVehicle,
    collectedCards, language, colorLabel, random = Math.random,
  } = params;

  const availableColors = GAME_COLORS.filter((c) => (colorCounts.get(c) || 0) > 0);
  const categoriesWithCounts = CATEGORY_OPTIONS.filter((cat) => {
    const count = markedVehicles.filter((v) => categoryForVehicle(v) === cat).length;
    return count > 0;
  });
  const canDoColor = availableColors.length > 0;
  const canDoCategory = categoriesWithCounts.length > 0;
  const canDoMixed = canDoColor && canDoCategory;
  const vehicleIds = new Set(VEHICLES.map((vehicle) => vehicle.id));
  const validCollectedCards = collectedCards.filter((id) => vehicleIds.has(id));
  const canDoMath = validCollectedCards.length >= 3;
  const roll = random();
  const useMath = canDoMath && roll < 0.15;
  const useMixed = !useMath && canDoMixed && roll < 0.30;
  const useCategory = !useMath && !useMixed && canDoCategory && (!canDoColor || random() < 0.4);

  logger.debug('engine', 'createRound', { useMath, useMixed, useCategory, canDoColor, canDoCategory, canDoMath, collectedCards: collectedCards.length });

  if (useMath) return buildMathRound(colorForVehicle, language, colorLabel, validCollectedCards, random);
  if (useMixed) return buildMixedRound(colorForVehicle, categoryForVehicle, availableColors, markedVehicles, random);
  if (useCategory) return buildCategoryRound(categoryForVehicle, categoriesWithCounts, markedVehicles, random);
  return buildColorRound(colorForVehicle, availableColors, markedVehicles, random);
}

function buildColorRound(
  colorForVehicle: (v: Vehicle) => VehicleColor,
  availableColors: VehicleColor[],
  markedVehicles: Vehicle[],
  random: RandomSource,
): Round {
  const targetColor = availableColors[Math.floor(random() * availableColors.length)] || 'red';
  const targetPool = markedVehicles.filter((v) => colorForVehicle(v) === targetColor);
  const distractorPool = markedVehicles.filter((v) => colorForVehicle(v) !== targetColor);
  const maxTargetCount = Math.min(targetPool.length, 5);
  const targetCount = Math.floor(random() * maxTargetCount) + 1;
  const targetVehicles = sample(targetPool, targetCount, random);
  const distractors = sample(distractorPool, Math.max(0, 8 - targetVehicles.length), random);

  return {
    questionType: 'color', targetColor, targetCount: targetVehicles.length,
    options: shuffle([...targetVehicles, ...distractors], random).slice(0, 8),
    selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

function buildCategoryRound(
  categoryForVehicle: (v: Vehicle) => VehicleCategory,
  categoriesWithCounts: VehicleCategory[],
  markedVehicles: Vehicle[],
  random: RandomSource,
): Round {
  const targetCategory = categoriesWithCounts[Math.floor(random() * categoriesWithCounts.length)];
  const targetPool = markedVehicles.filter((v) => categoryForVehicle(v) === targetCategory);
  const distractorPool = markedVehicles.filter((v) => categoryForVehicle(v) !== targetCategory);
  const maxTargetCount = Math.min(targetPool.length, 5);
  const targetCount = Math.floor(random() * maxTargetCount) + 1;
  const targetVehicles = sample(targetPool, targetCount, random);
  const distractors = sample(distractorPool, Math.max(0, 8 - targetVehicles.length), random);

  return {
    questionType: 'category', targetCategory, targetCount: targetVehicles.length,
    options: shuffle([...targetVehicles, ...distractors], random).slice(0, 8),
    selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

function buildMixedRound(
  colorForVehicle: (v: Vehicle) => VehicleColor,
  categoryForVehicle: (v: Vehicle) => VehicleCategory,
  availableColors: VehicleColor[],
  markedVehicles: Vehicle[],
  random: RandomSource,
): Round {
  // Multi-color questions need two distinct colors. When the parent has left
  // only one color enabled, the color + category form is still valid.
  const isCrossType = availableColors.length < 2 || random() < 0.5;

  if (isCrossType) {
    const targetColor = availableColors[Math.floor(random() * availableColors.length)];
    const crossPool = markedVehicles.filter((v) => colorForVehicle(v) === targetColor);
    const availableCatsForColor = CATEGORY_OPTIONS.filter((cat) =>
      crossPool.some((v) => categoryForVehicle(v) === cat),
    );
    if (availableCatsForColor.length === 0) {
      return buildColorRound(colorForVehicle, availableColors, markedVehicles, random);
    }
    const targetCategory = availableCatsForColor[Math.floor(random() * availableCatsForColor.length)];
    const matchPool = crossPool.filter((v) => categoryForVehicle(v) === targetCategory);
    const maxCount = Math.min(matchPool.length, 3);
    const targetCount = Math.floor(random() * maxCount) + 1;
    return buildMixedWithTargets(
      [{ color: targetColor, category: targetCategory, count: targetCount }],
      markedVehicles, colorForVehicle, categoryForVehicle, random,
    );
  }

  // Multi-color type
  const shuffled = shuffle([...availableColors], random);
  const c1 = shuffled[0];
  const c2 = shuffled[1];
  const pool1 = markedVehicles.filter((v) => colorForVehicle(v) === c1);
  const pool2 = markedVehicles.filter((v) => colorForVehicle(v) === c2);
  const cnt1 = Math.min(pool1.length, 2);
  const cnt2 = Math.min(pool2.length, 2);
  const mixedTargets: MixedTarget[] = [
    { color: c1, count: Math.max(1, cnt1) },
    { color: c2, count: Math.max(1, cnt2) },
  ];
  return buildMixedWithTargets(mixedTargets, markedVehicles, colorForVehicle, categoryForVehicle, random);
}

function buildMixedWithTargets(
  targets: MixedTarget[],
  markedVehicles: Vehicle[],
  colorForVehicle: (v: Vehicle) => VehicleColor,
  categoryForVehicle: (v: Vehicle) => VehicleCategory,
  random: RandomSource,
): Round {
  const actualTargets: Vehicle[] = [];
  const reachableTargets: MixedTarget[] = [];
  const usedIds = new Set<string>();
  targets.forEach((t) => {
    const matching = markedVehicles.filter((v) => {
      if (usedIds.has(v.id)) return false;
      if (t.color && t.category) return colorForVehicle(v) === t.color && categoryForVehicle(v) === t.category;
      if (t.color) return colorForVehicle(v) === t.color;
      return false;
    });
    const picked = sample(matching, t.count, random);
    picked.forEach((v) => usedIds.add(v.id));
    actualTargets.push(...picked);
    if (picked.length > 0) reachableTargets.push({ ...t, count: picked.length });
  });
  const distractorPool = markedVehicles.filter((v) => !usedIds.has(v.id));
  const distractors = sample(distractorPool, Math.max(0, 8 - actualTargets.length), random);

  return {
    questionType: 'mixed', mixedTargets: reachableTargets, targetCount: actualTargets.length,
    options: shuffle([...actualTargets, ...distractors], random).slice(0, 8),
    selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

function buildMathRound(
  colorForVehicle: (v: Vehicle) => VehicleColor,
  language: Language,
  colorLabel: (c: VehicleColor) => string,
  collectedCards: string[],
  random: RandomSource,
): Round {
  const collectedVehicles = VEHICLES.filter((v) => collectedCards.includes(v.id));
  const collectedByColor = new Map<VehicleColor, Vehicle[]>();
  collectedVehicles.forEach((v) => {
    const c = colorForVehicle(v);
    if (!collectedByColor.has(c)) collectedByColor.set(c, []);
    collectedByColor.get(c)!.push(v);
  });
  const colorEntries = Array.from(collectedByColor.entries()).filter(([, vs]) => vs.length >= 1);

  let a: number, b: number, answer: number;
  let questionText: string;
  const isAddition = random() < 0.6;

  if (isAddition && colorEntries.length >= 2) {
    const [c1, v1] = colorEntries[Math.floor(random() * colorEntries.length)];
    const remaining = colorEntries.filter(([c]) => c !== c1);
    const [c2, v2] = remaining[Math.floor(random() * remaining.length)];
    a = Math.min(v1.length, 5);
    b = Math.min(v2.length, 3);
    answer = a + b;
    questionText = language === 'zh'
      ? `${a}辆${colorLabel(c1)} + ${b}辆${colorLabel(c2)} = ?`
      : `${a} ${colorLabel(c1)} + ${b} ${colorLabel(c2)} = ?`;
  } else {
    const [c1, v1] = colorEntries[Math.floor(random() * colorEntries.length)];
    a = Math.min(v1.length, 8);
    b = Math.floor(random() * Math.min(a, 3)) + 1;
    answer = a - b;
    questionText = language === 'zh'
      ? `${a}辆${colorLabel(c1)}，开走${b}辆 = ?`
      : `${a} ${colorLabel(c1)}, ${b} leave = ?`;
  }

  const choices = new Set<number>([answer]);
  let attempts = 0;
  while (choices.size < 4 && attempts < 100) {
    const offset = Math.floor(random() * 5) - 2;
    const c = answer + offset;
    if (c >= 0 && c <= 10) choices.add(c);
    attempts++;
  }
  // Fallback: fill with sequential numbers if random didn't produce enough
  for (let n = 0; n <= 10 && choices.size < 4; n++) {
    choices.add(n);
  }

  return {
    questionType: 'math', targetCount: answer,
    mathQuestion: questionText, mathChoices: shuffle(Array.from(choices), random),
    options: [], selectedIds: [], matchedTargets: [], lastSelectedId: null, result: 'idle',
  };
}

// ── pick evaluator ───────────────────────────────────────

export interface PickEvalParams {
  vehicle: Vehicle;
  round: Round;
  colorForVehicle: (v: Vehicle) => VehicleColor;
  categoryForVehicle: (v: Vehicle) => VehicleCategory;
}

export interface PickResult {
  selectedIds: string[];
  matchedTargets: number[];
  lastSelectedId: string;
  result: 'progress' | 'correct' | 'wrong';
  correct: boolean;
}

export function evaluatePick(params: PickEvalParams): PickResult {
  const { vehicle, round, colorForVehicle, categoryForVehicle } = params;

  const isCorrect = round.questionType === 'mixed'
    ? (() => {
        if (!round.mixedTargets) return false;
        for (let i = 0; i < round.mixedTargets.length; i++) {
          const t = round.mixedTargets[i];
          const alreadyMatched = round.matchedTargets.filter((m) => m === i).length;
          if (alreadyMatched >= t.count) continue;
          if (t.color && t.category) {
            if (colorForVehicle(vehicle) === t.color && categoryForVehicle(vehicle) === t.category) return true;
          } else if (t.color) {
            if (colorForVehicle(vehicle) === t.color) return true;
          }
        }
        return false;
      })()
    : round.questionType === 'category'
      ? categoryForVehicle(vehicle) === round.targetCategory
      : colorForVehicle(vehicle) === round.targetColor;

  if (isCorrect && round.selectedIds.includes(vehicle.id)) {
    return {
      selectedIds: round.selectedIds,
      matchedTargets: round.matchedTargets,
      lastSelectedId: round.lastSelectedId ?? '',
      result: round.result !== 'correct' ? round.result as 'progress' | 'wrong' : 'correct',
      correct: false,
    };
  }

  const selectedIds = isCorrect ? [...round.selectedIds, vehicle.id] : round.selectedIds;
  let matchedTargetIndex = -1;
  if (isCorrect && round.questionType === 'mixed' && round.mixedTargets) {
    for (let i = 0; i < round.mixedTargets.length; i++) {
      const t = round.mixedTargets[i];
      const alreadyMatched = round.matchedTargets.filter((m) => m === i).length;
      if (alreadyMatched >= t.count) continue;
      if (t.color && t.category) {
        if (colorForVehicle(vehicle) === t.color && categoryForVehicle(vehicle) === t.category) { matchedTargetIndex = i; break; }
      } else if (t.color) {
        if (colorForVehicle(vehicle) === t.color) { matchedTargetIndex = i; break; }
      }
    }
  }
  const newMatchedTargets = matchedTargetIndex >= 0
    ? [...round.matchedTargets, matchedTargetIndex]
    : round.matchedTargets;

  const result = !isCorrect
    ? 'wrong'
    : selectedIds.length >= round.targetCount
      ? 'correct'
      : 'progress';

  return { selectedIds, matchedTargets: newMatchedTargets, lastSelectedId: vehicle.id, result, correct: isCorrect };
}

// ── prompt formatters ────────────────────────────────────

export function formatRoundLabel(
  roundData: Round,
  language: Language,
  colorLabel: (c: VehicleColor) => string,
): string {
  if (roundData.questionType === 'mixed' && roundData.mixedTargets) {
    const parts = roundData.mixedTargets.map((t) => {
      let label = '';
      if (t.color) label += colorLabel(t.color);
      if (t.category) label += (label ? ' ' : '') + CATEGORY_LABELS[language][t.category];
      return `${t.count} ${label}`;
    });
    return parts.join(' + ');
  }
  if (roundData.questionType === 'category' && roundData.targetCategory) {
    return CATEGORY_LABELS[language][roundData.targetCategory];
  }
  return roundData.targetColor ? colorLabel(roundData.targetColor) : '';
}
