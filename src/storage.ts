import { VALID_COLORS, VEHICLES, type VehicleColor, type VehicleCategory } from './vehicleData';
import { CATEGORY_OPTIONS } from './constants';
import { logger } from './logger';

export type StorageV2 = {
  colorOverrides: Record<string, VehicleColor>;
  categoryOverrides: Record<string, VehicleCategory>;
  lockedColors: Record<string, boolean>;
  lockedCategories: Record<string, boolean>;
  collectedCards: string[];
  streak: number;
};

export const DEFAULT_V2: StorageV2 = {
  colorOverrides: {},
  categoryOverrides: {},
  lockedColors: {},
  lockedCategories: {},
  collectedCards: [],
  streak: 0,
};

const KEY_V2 = 'car-car-adventure-tags-v2';
const KEY_V1 = 'car-car-adventure-color-tags-v1';

const validColors = new Set<string>(VALID_COLORS);
const validCategories = new Set<string>(CATEGORY_OPTIONS);
const validVehicleIds = new Set(VEHICLES.map((vehicle) => vehicle.id));

function freshDefaults(): StorageV2 {
  return {
    colorOverrides: {},
    categoryOverrides: {},
    lockedColors: {},
    lockedCategories: {},
    collectedCards: [],
    streak: 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeEnumRecord<T extends string>(
  value: unknown,
  validValues: Set<string>,
): Record<string, T> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => typeof entry === 'string' && validValues.has(entry)),
  ) as Record<string, T>;
}

function sanitizeBooleanRecord(value: unknown): Record<string, boolean> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'),
  );
}

function sanitizeV2(value: unknown): StorageV2 {
  if (!isRecord(value)) return freshDefaults();

  const collectedCards = Array.isArray(value.collectedCards)
    ? [...new Set(value.collectedCards.filter(
        (id): id is string => typeof id === 'string' && validVehicleIds.has(id),
      ))]
    : [];
  const streak = typeof value.streak === 'number' && Number.isInteger(value.streak) && value.streak >= 0
    ? value.streak
    : 0;

  return {
    colorOverrides: sanitizeEnumRecord<VehicleColor>(value.colorOverrides, validColors),
    categoryOverrides: sanitizeEnumRecord<VehicleCategory>(value.categoryOverrides, validCategories),
    lockedColors: sanitizeBooleanRecord(value.lockedColors),
    lockedCategories: sanitizeBooleanRecord(value.lockedCategories),
    collectedCards,
    streak,
  };
}

export function readV2(): StorageV2 {
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (!raw) return freshDefaults();
    return sanitizeV2(JSON.parse(raw));
  } catch (e) {
    logger.error('storage', 'readV2 failed', String(e));
    return freshDefaults();
  }
}

export function writeV2(data: StorageV2): boolean {
  try {
    localStorage.setItem(KEY_V2, JSON.stringify(sanitizeV2(data)));
    return true;
  } catch (e) {
    logger.error('storage', 'writeV2 failed', String(e));
    return false;
  }
}

export function migrateV1toV2(): void {
  try {
    const raw = localStorage.getItem(KEY_V1);
    if (!raw) return;
    const v1ColorOverrides = sanitizeEnumRecord<VehicleColor>(JSON.parse(raw), validColors);
    const existing = readV2();
    if (Object.keys(existing.colorOverrides).length > 0) return;
    if (writeV2({ ...existing, colorOverrides: v1ColorOverrides })) {
      logger.info('storage', 'migrated v1→v2', { colors: Object.keys(v1ColorOverrides).length });
    }
  } catch {
    /* v1 data corrupt, silently use defaults */
  }
}
