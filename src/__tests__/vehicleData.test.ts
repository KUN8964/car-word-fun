import { describe, it, expect } from 'vitest';
import { CATEGORY_OPTIONS } from '../constants';
import { VEHICLES, VALID_COLORS, type Vehicle, type VehicleCategory } from '../vehicleData';

const EXPECTED_CATEGORIES: Record<string, VehicleCategory> = {
  f2004: 'race',
  f1: 'car',
  mp4: 'race',
  gti: 'watercraft',
  'rxt-x-400': 'watercraft',
  'vehicle-48': 'tank',
};

describe('vehicleData', () => {
  it('should have 52 vehicles', () => {
    expect(VEHICLES).toHaveLength(52);
  });

  it('should have valid color and category for every vehicle', () => {
    VEHICLES.forEach((v: Vehicle) => {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
      expect(v.image).toBeTruthy();
      expect(VALID_COLORS).toContain(v.color);
      expect(v.category).toBeTruthy();
    });
  });

  it('should have unique vehicle IDs', () => {
    const ids = VEHICLES.map((v: Vehicle) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps sentinel vehicle categories aligned with the real vehicle type', () => {
    Object.entries(EXPECTED_CATEGORIES).forEach(([id, category]) => {
      expect(VEHICLES.find((vehicle) => vehicle.id === id)?.category).toBe(category);
    });
  });

  it('has at least one vehicle for every selectable category', () => {
    const populatedCategories = new Set(VEHICLES.map((vehicle) => vehicle.category));
    CATEGORY_OPTIONS.forEach((category) => {
      expect(populatedCategories.has(category), `missing category: ${category}`).toBe(true);
    });
  });
});
