export enum BiomeType {
  RUST_FIELDS = 'Rust Fields',        // Industrial / Factories
  VERDANT_GROVE = 'Verdant Grove',    // Parks / Greenery
  SILICON_SPIRES = 'Silicon Spires',  // Business / Tech / CBD
  SHATTERED_SUBURBIA = 'Shattered Suburbia', // Residential
  MISTY_WHARFS = 'Misty Wharfs',      // Coastal / Ports
  VOID_PROMENADE = 'Void Promenade',  // Shopping / Leisure
  ANCIENT_ARCHIVES = 'Ancient Archives' // Education / Library
}

export enum FactionType {
  IRON_CONSORTIUM = 'Iron Consortium',
  SYLVAN_CONCLAVE = 'Sylvan Conclave',
  NEO_TECHNOCRATS = 'Neo-Technocrats',
  VOID_WANDERERS = 'Void Wanderers',
  CHRONO_ARCHIVISTS = 'Chrono-Archivists'
}

/**
 * Maps real-world suburb names or keywords to Aeternis fantasy biomes.
 */
export const getBiomeFromKeyword = (keyword: string): BiomeType => {
  const normalized = keyword.toLowerCase();

  if (normalized.includes('industrial') || normalized.includes('factory') || normalized.includes('works')) {
    return BiomeType.RUST_FIELDS;
  }
  
  if (normalized.includes('park') || normalized.includes('reserve') || normalized.includes('garden')) {
    return BiomeType.VERDANT_GROVE;
  }

  if (normalized.includes('cbd') || normalized.includes('center') || normalized.includes('centre') || normalized.includes('tower')) {
    return BiomeType.SILICON_SPIRES;
  }

  if (normalized.includes('beach') || normalized.includes('port') || normalized.includes('wharf') || normalized.includes('coast')) {
    return BiomeType.MISTY_WHARFS;
  }

  if (normalized.includes('mall') || normalized.includes('plaza') || normalized.includes('market')) {
    return BiomeType.VOID_PROMENADE;
  }

  if (normalized.includes('university') || normalized.includes('school') || normalized.includes('library')) {
    return BiomeType.ANCIENT_ARCHIVES;
  }

  // Default for residential/unmapped areas
  return BiomeType.SHATTERED_SUBURBIA;
};

/**
 * Deterministically gets a faction based on the suburb name string.
 */
export const getFactionForZone = (suburb: string): FactionType => {
  const hash = suburb.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const factions = Object.values(FactionType);
  return factions[hash % factions.length];
};

