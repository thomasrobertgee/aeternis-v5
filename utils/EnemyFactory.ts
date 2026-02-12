/**
 * EnemyFactory.ts
 * Generates enemies based on the current biome and lore.
 */

import { BiomeType } from './BiomeMapper';

export interface EnemyTemplate {
  name: string;
  maxHp: number;
  description: string;
}

const ENEMY_DATABASE: Record<string, EnemyTemplate[]> = {
  [BiomeType.RUST_FIELDS]: [
    { name: 'Steam-Drone', maxHp: 50, description: 'A small, spherical bot venting high-pressure steam through rusted valves.' },
    { name: 'Scrapyard Golem', maxHp: 120, description: 'A lumbering mass of discarded iron and magnetic sludge.' },
    { name: 'Cogwheel Enforcer', maxHp: 80, description: 'A heavily armored sentinel keeping watch over industrial relics.' }
  ],
  [BiomeType.VERDANT_GROVE]: [
    { name: 'Thorn-Hound', maxHp: 60, description: 'A canine manifestation made entirely of sharpened briars and pulsing vines.' },
    { name: 'Spore-Walker', maxHp: 45, description: 'A slow-moving humanoid shrouded in a toxic cloud of bioluminescent spores.' },
    { name: 'Overgrowth Sentinel', maxHp: 110, description: 'A massive tree-like entity that has integrated piece of the old world into its bark.' }
  ],
  [BiomeType.SILICON_SPIRES]: [
    { name: 'Data-Ghost', maxHp: 40, description: 'A flickering blue entity composed of corrupted server logs and fragmented code.' },
    { name: 'Security-Bot X-9', maxHp: 75, description: 'A sleek, hovering drone equipped with lethal suppression lasers.' },
    { name: 'Glitch-Stalker', maxHp: 90, description: 'A predator that phases in and out of reality, leaving digital artifacts in its wake.' }
  ],
  [BiomeType.SHATTERED_SUBURBIA]: [
    { name: 'Echo-Stray', maxHp: 35, description: 'The translucent memory of a lost pet, driven to aggression by the Imaginum.' },
    { name: 'Domestic-Horror', maxHp: 85, description: 'A twisted amalgamation of household appliances and spectral shadows.' },
    { name: 'Memory-Wisp', maxHp: 30, description: 'A tiny, floating orb that forces intruders to relive their most painful failures.' }
  ],
  [BiomeType.MISTY_WHARFS]: [
    { name: 'Fog-Lurker', maxHp: 70, description: 'A spindly creature that is almost indistinguishable from the heavy coastal mist.' },
    { name: 'Brine-Shell', maxHp: 130, description: 'A massive crustacean whose shell is reinforced with rusted shipping containers.' },
    { name: 'Deep-One Scout', maxHp: 65, description: 'A wet, rubbery humanoid that smells of salt and ancient depths.' }
  ],
  [BiomeType.VOID_PROMENADE]: [
    { name: 'Gilded-Shadow', maxHp: 55, description: 'An elegant but hollow silhouette wearing jewelry made of liquid starlight.' },
    { name: 'Mirror-Construct', maxHp: 80, description: 'A humanoid made of shards that reflect the darkest parts of those who look at it.' },
    { name: 'Void-Collector', maxHp: 100, description: 'A being that trades in souls and memories, using a heavy ledger to track its debts.' }
  ],
  [BiomeType.ANCIENT_ARCHIVES]: [
    { name: 'Ink-Wraith', maxHp: 45, description: 'A fluid entity that flows across surfaces like spilled, sentient ink.' },
    { name: 'Paper-Gargoyle', maxHp: 75, description: 'A creature folded from ancient, indestructible parchment.' },
    { name: 'Lore-Seeker', maxHp: 110, description: 'A multi-eyed scholar who has been driven mad by the secrets of the Collapse.' }
  ]
};

/**
 * Generates a random enemy based on the provided biome.
 * @param biome The biome to generate an enemy for.
 * @returns An EnemyTemplate object.
 */
export const getRandomEnemyByBiome = (biome: BiomeType): EnemyTemplate => {
  const templates = ENEMY_DATABASE[biome] || ENEMY_DATABASE[BiomeType.SHATTERED_SUBURBIA];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
};

/**
 * Generates a deterministic enemy for a specific suburb in a biome.
 * @param suburb The name of the suburb.
 * @param biome The biome of the suburb.
 * @returns An EnemyTemplate object.
 */
export const getDeterministicEnemy = (suburb: string, biome: BiomeType): EnemyTemplate => {
  const templates = ENEMY_DATABASE[biome] || ENEMY_DATABASE[BiomeType.SHATTERED_SUBURBIA];
  const hash = suburb.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return templates[hash % templates.length];
};
