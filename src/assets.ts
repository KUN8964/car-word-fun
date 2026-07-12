import type { Vehicle } from './vehicleData';

export function vehicleThumbnailPath(vehicle: Vehicle): string {
  const filename = vehicle.image.split('/').pop()?.replace(/\.[^.]+$/, '') || vehicle.id;
  return `/vehicle-thumbs/${filename}.webp`;
}

export function cardThumbnailPath(vehicle: Vehicle): string {
  return `/card-thumbs/${encodeURIComponent(`卡牌-${vehicle.name}`)}.webp`;
}

export const CARD_BACK_THUMBNAIL_PATH = `/card-thumbs/${encodeURIComponent('卡牌-背面')}.webp`;
