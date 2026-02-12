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

/**
 * Converts a city name to coordinates.
 */
export const geocodeCity = async (cityName: string): Promise<Coords | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'AeternisOdyssey/1.0',
        },
      }
    );
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
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
      {
        headers: {
          'User-Agent': 'AeternisOdyssey/1.0',
        },
      }
    );
    const data = await response.json();
    if (data && data.address) {
      return {
        suburb: data.address.suburb || data.address.neighbourhood || data.address.village || data.address.town || "Unknown Realm",
        city: data.address.city || data.address.state || "Unknown World",
        country: data.address.country || "",
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};
