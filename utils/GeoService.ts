/**
 * GeoService.ts
 * Web-based geocoding services using OpenStreetMap Nominatim.
 * Avoids native location permissions.
 */

interface Coords {
  latitude: number;
  longitude: number;
}

export interface GeoResult {
  suburb: string;
  city: string;
  country: string;
}

// Hardcoded coordinates for major cities to ensure the game works even if API is down/rate-limited
const STABLE_ANCHORS: Record<string, Coords> = {
  "melbourne": { latitude: -37.8136, longitude: 144.9631 },
  "london": { latitude: 51.5074, longitude: -0.1278 },
  "new york": { latitude: 40.7128, longitude: -74.0060 },
  "tokyo": { latitude: 35.6762, longitude: 139.6503 },
  "sydney": { latitude: -33.8688, longitude: 151.2093 },
  "berlin": { latitude: 52.5200, longitude: 13.4050 },
  "paris": { latitude: 48.8566, longitude: 2.3522 },
};

// Simple in-memory cache to prevent duplicate API calls and stay within rate limits
const GEO_CACHE: Record<string, GeoResult> = {};

/**
 * Converts a city name to coordinates.
 */
export const geocodeCity = async (cityName: string): Promise<Coords | null> => {
  const normalized = cityName.toLowerCase().trim();
  
  // Bypass API if it's a known stable city
  if (STABLE_ANCHORS[normalized]) {
    return STABLE_ANCHORS[normalized];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'AeternisOdyssey/1.0',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('Geocoding API responded with error:', response.status);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
};

/**
 * Converts coordinates to a suburb/city name.
 */
export const reverseGeocode = async (coords: Coords): Promise<GeoResult | null> => {
  // Use cache if available (rounded to ~100m precision)
  const cacheKey = `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`;
  if (GEO_CACHE[cacheKey]) {
    return GEO_CACHE[cacheKey];
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
      {
        headers: {
          'User-Agent': 'AeternisOdyssey/1.0',
          'Accept': 'application/json',
        },
      }
    );

    // If rate limited (509) or error, use procedural fallback
    if (!response.ok) {
      console.warn(`Reverse geocoding API error ${response.status}, using procedural fallback.`);
      return getProceduralFallback(coords);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return getProceduralFallback(coords);
    }

    const data = await response.json();
    if (data && data.address) {
      const result = {
        suburb: data.address.suburb || data.address.neighbourhood || data.address.village || data.address.town || data.address.city_district || data.address.city || "Sector Alpha",
        city: data.address.city || data.address.state || "The Gray Void",
        country: data.address.country || "Fractured Earth",
      };
      // Save to cache
      GEO_CACHE[cacheKey] = result;
      return result;
    }
    return getProceduralFallback(coords);
  } catch (error) {
    console.error('Reverse geocoding failed, using procedural fallback:', error);
    return getProceduralFallback(coords);
  }
};

/**
 * Lore-friendly procedural fallback when geocoding is unavailable.
 */
const getProceduralFallback = (coords: Coords): GeoResult => {
  // Create a deterministic "Sector" name using the lat/long decimals
  const latSuffix = Math.abs(coords.latitude).toString().split('.')[1]?.substring(0, 3) || "000";
  const lonSuffix = Math.abs(coords.longitude).toString().split('.')[1]?.substring(0, 3) || "000";
  
  return {
    suburb: `Static Sector ${latSuffix}-${lonSuffix}`,
    city: "The Gray Void",
    country: "Fractured Earth"
  };
};
