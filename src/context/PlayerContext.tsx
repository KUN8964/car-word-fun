import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { VEHICLES, type VehicleCategory, type VehicleColor } from '../vehicleData';
import { DEFAULT_V2, migrateV1toV2, readV2, writeV2, type StorageV2 } from '../storage';
import { logger } from '../logger';

interface PlayerContextValue {
  storage: StorageV2;
  setStorage: React.Dispatch<React.SetStateAction<StorageV2>>;
  colorForVehicle: (vehicle: { id: string; color: VehicleColor }) => VehicleColor;
  categoryForVehicle: (vehicle: { id: string; category: VehicleCategory }) => VehicleCategory;
  markedVehicles: typeof VEHICLES;
  colorCounts: Map<VehicleColor, number>;
  resetTags: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [storage, setStorage] = useState<StorageV2>(() => {
    migrateV1toV2();
    const data = readV2();
    logger.info('storage', 'init', {
      streak: data.streak,
      collectedCards: data.collectedCards.length,
      overrides: Object.keys(data.colorOverrides).length,
    });
    return data;
  });

  const colorForVehicle = useCallback(
    (vehicle: { id: string; color: VehicleColor }) => storage.colorOverrides[vehicle.id] || vehicle.color,
    [storage.colorOverrides],
  );
  const categoryForVehicle = useCallback(
    (vehicle: { id: string; category: VehicleCategory }) => storage.categoryOverrides[vehicle.id] || vehicle.category,
    [storage.categoryOverrides],
  );
  const markedVehicles = useMemo(
    () => VEHICLES.filter((vehicle) => colorForVehicle(vehicle) !== 'unknown'),
    [colorForVehicle],
  );
  const colorCounts = useMemo(() => {
    const counts = new Map<VehicleColor, number>();
    markedVehicles.forEach((vehicle) => {
      const color = colorForVehicle(vehicle);
      counts.set(color, (counts.get(color) || 0) + 1);
    });
    return counts;
  }, [colorForVehicle, markedVehicles]);

  useEffect(() => {
    writeV2(storage);
  }, [storage]);

  const resetTags = useCallback(() => {
    setStorage({
      ...DEFAULT_V2,
      colorOverrides: {},
      categoryOverrides: {},
      lockedColors: { ...DEFAULT_V2.lockedColors },
      lockedCategories: { ...DEFAULT_V2.lockedCategories },
      collectedCards: [],
      memoryBest: {},
    });
  }, []);

  const value = useMemo(() => ({
    storage, setStorage, colorForVehicle, categoryForVehicle,
    markedVehicles, colorCounts, resetTags,
  }), [storage, colorForVehicle, categoryForVehicle, markedVehicles, colorCounts, resetTags]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
}
