/**
 * BoundaryService.ts
 * Logic for detecting suburb occupancy based on GeoJSON polygons.
 */

import melbourneSuburbs from '../assets/boundaries/melbourne_suburbs.json';

interface Coords {
  latitude: number;
  longitude: number;
}

export interface SuburbFeature {
  name: string;
  postcode: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

class BoundaryService {
  private static instance: BoundaryService;
  private features: any[] = [];

  private constructor() {
    this.features = melbourneSuburbs.features;
  }

  public static getInstance(): BoundaryService {
    if (!BoundaryService.instance) {
      BoundaryService.instance = new BoundaryService();
    }
    return BoundaryService.instance;
  }

  /**
   * Ray Casting algorithm to detect if a point is inside a polygon.
   */
  public isPointInPolygon(point: Coords, polygon: number[][]): boolean {
    const x = point.longitude;
    const y = point.latitude;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }

    return inside;
  }

  /**
   * Identifies which suburb the player is currently in.
   */
  public getSuburbAtPoint(point: Coords): string | null {
    for (const feature of this.features) {
      const { geometry, properties } = feature;
      
      if (geometry.type === 'Polygon') {
        // GeoJSON polygons coordinates are [longitude, latitude]
        // Usually the first element of the array is the outer ring
        if (this.isPointInPolygon(point, geometry.coordinates[0])) {
          return properties.name;
        }
      } else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
          if (this.isPointInPolygon(point, polygon[0])) {
            return properties.name;
          }
        }
      }
    }
    return null;
  }

  /**
   * Returns the full GeoJSON feature for a specific suburb name.
   * Supports flexible matching for better UX.
   */
  public getSuburbFeature(name: string): any | null {
    const normalized = name.toLowerCase().trim();
    return this.features.find(f => {
      const featureName = f.properties.name.toLowerCase();
      return featureName.includes(normalized) || normalized.includes(featureName);
    }) || null;
  }
}

export default BoundaryService.getInstance();
