/**
 * MathUtils.ts
 * Geographic utilities for Aeternis Odyssey.
 */

interface Coords {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 */
export const getDistance = (coords1: Coords, coords2: Coords): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

/**
 * Formats distance for display.
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.floor(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};
