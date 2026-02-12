/**
 * ProceduralEngine.ts
 * Derived from Aeternis Lore (gemini.md)
 */

export type BiomeCategory = 'Industrial' | 'Coastal' | 'Urban';

export interface ProceduralZone {
  suburb: string;
  category: BiomeCategory;
  loreName: string;
  description: string;
}

const LORE_MAPPING = {
  Industrial: {
    name: "Rust Fields",
    description: "A landscape of groaning metal and soot-stained clouds. The Iron Consortium's influence is thick here, manifesting as endless factories that bleed into the horizon.",
    sensory: ["The rhythmic clanging of heavy iron echo through the smog.", "A fine layer of soot settles on every surface, tasting of oil and old copper.", "The hum of ancient, overworked turbines vibrates in your marrow."],
    state: ["The skyline of the Fracture is dominated by groaning metal skeletons.", "Massive pipelines pulse with a toxic, glowing sludge, bleeding into the cracked earth.", "Soot-stained clouds hang low, never fully revealing the sky."],
    conclusion: (suburb: string) => `In the heart of ${suburb}, the machines of the Old World have developed a mind of their own.`
  },
  Coastal: {
    name: "Misty Wharfs",
    description: "The air is thick with salt and spectral fog. Ancient ports, now warped by the Imaginum, serve as gateways for the Void Wanderers' clandestine trade.",
    sensory: ["The air is thick with salt and the mournful sound of spectral foghorns.", "Indigo waves lap against rotted docks with an unsettling, rhythmic persistence.", "A cold, damp wind carries the scent of brine and decaying memories."],
    state: ["Colossal cranes stand like petrified giants over the indigo waves.", "Wharfs that once held trade ships now anchor flickering, semi-corporeal vessels.", "A permanent, bioluminescent fog clings to the water, hiding what lurks beneath."],
    conclusion: (suburb: string) => `The tides of ${suburb} bring in more than just salt—they bring the whispers of the Abyss.`
  },
  Urban: {
    name: "Silicon Spires",
    description: "Soaring towers of glass and neon that pierce the sky. A hub of Neo-Technocratic power, where digital ghosts haunt the circuits of a dying civilization.",
    sensory: ["The neon glare from soaring towers reflects in the permanent haze.", "Digital ghosts hum through the air, causing the hair on your arms to stand up.", "Static-filled announcements echo from speakers that haven't been touched in decades."],
    state: ["Spires of glass and obsidian pierce the clouds like jagged teeth.", "Power lines crackle with blue energy, weaving a web across the vertical city.", "Holographic advertisements flicker over empty plazas, selling dreams to the wind."],
    conclusion: (suburb: string) => `${suburb} remains a vertical tomb of glass, where logic has been rewritten by the Imaginum.`
  }
};

/**
 * Generates a 3-sentence atmospheric intro based on suburb and category.
 */
export const generateAtmosphericIntro = (suburb: string, category: BiomeCategory): string => {
  const lore = LORE_MAPPING[category];
  const hash = suburb.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const s1 = lore.sensory[hash % lore.sensory.length];
  const s2 = lore.state[(hash + 1) % lore.state.length];
  const s3 = lore.conclusion(suburb);
  
  return `${s1} ${s2} ${s3}`;
};

/**
 * Categorizes a suburb into a biome based on name keywords.
 */
export const identifyBiome = (suburb: string): BiomeCategory => {
  const name = suburb.toLowerCase();
  
  // Coastal Keywords
  if (name.includes('port') || name.includes('beach') || name.includes('wharf') || 
      name.includes('coast') || name.includes('shore') || name.includes('bay') || name.includes('island')) {
    return 'Coastal';
  }

  // Industrial Keywords
  if (name.includes('industrial') || name.includes('factory') || name.includes('works') || 
      name.includes('mill') || name.includes('park') && name.includes('industrial')) {
    return 'Industrial';
  }

  // Default to Urban for most suburbs
  return 'Urban';
};

export const getProceduralZone = (suburb: string): ProceduralZone => {
  const category = identifyBiome(suburb);
  const lore = LORE_MAPPING[category];
  
  return {
    suburb,
    category,
    loreName: lore.name,
    description: lore.description
  };
};
