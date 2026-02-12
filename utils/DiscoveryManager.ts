import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCOVERY_KEY = '@aeternis_discovery_list';

/**
 * Persistently saves a discovered suburb.
 */
export const discoverLocation = async (suburb: string): Promise<string[]> => {
  try {
    const existing = await getDiscoveredLocations();
    if (!existing.includes(suburb)) {
      const updated = [...existing, suburb];
      await AsyncStorage.setItem(DISCOVERY_KEY, JSON.stringify(updated));
      return updated;
    }
    return existing;
  } catch (e) {
    console.error('Failed to save discovery', e);
    return [];
  }
};

/**
 * Retrieves the list of all discovered suburbs.
 */
export const getDiscoveredLocations = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(DISCOVERY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to fetch discoveries', e);
    return [];
  }
};

/**
 * Checks if a specific suburb has been discovered.
 */
export const isLocationDiscovered = async (suburb: string): Promise<boolean> => {
  const list = await getDiscoveredLocations();
  return list.includes(suburb);
};
