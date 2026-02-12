/**
 * LootTable.ts
 * Manages item drops from defeated enemies.
 */

import { Item } from './usePlayerStore';

export const LOOT_ITEMS: Record<string, Item> = {
  SCRAP_METAL: {
    id: 'loot-scrap-metal',
    name: 'Scrap Metal',
    category: 'Utility',
    description: 'Rusted gears and twisted plates. Highly valued by The Cogwheel for reconstruction.',
  },
  AETHER_SHARDS: {
    id: 'loot-aether-shards',
    name: 'Aether Shards',
    category: 'Utility',
    description: 'Crystallized Imaginum that pulses with a faint blue light. Used in high-tech crafting.',
  },
  RATIONS: {
    id: 'loot-rations',
    name: 'Old World Rations',
    category: 'Utility',
    description: 'Vacuum-sealed nutrition from before The Collapse. Tastes like cardboard, but it keeps you going.',
  },
  FOCUS_POTION: {
    id: 'loot-focus-potion',
    name: 'Focus Potion',
    category: 'Utility',
    description: 'A viscous, indigo liquid that sharpens the mind and stabilizes your connection to the Imaginum.',
  },
};

/**
 * Determines loot dropped by an enemy based on its name/type.
 */
export const getLootForEnemy = (enemyName: string): Item | null => {
  const roll = Math.random();
  
  // 70% chance to drop something
  if (roll > 0.7) return null;

  const subRoll = Math.random();

  // Industrial enemies (Drones, Golems, Enforcers)
  if (enemyName.toLowerCase().includes('drone') || 
      enemyName.toLowerCase().includes('golem') || 
      enemyName.toLowerCase().includes('enforcer') ||
      enemyName.toLowerCase().includes('scavenger')) {
    if (subRoll > 0.6) return LOOT_ITEMS.SCRAP_METAL;
    if (subRoll > 0.3) return LOOT_ITEMS.RATIONS;
    return LOOT_ITEMS.FOCUS_POTION;
  }

  // Magical/Spectral enemies (Ghosts, Wisps, Wraiths, Stalkers)
  if (enemyName.toLowerCase().includes('ghost') || 
      enemyName.toLowerCase().includes('wisp') || 
      enemyName.toLowerCase().includes('wraith') ||
      enemyName.toLowerCase().includes('stalker')) {
    if (subRoll > 0.5) return LOOT_ITEMS.AETHER_SHARDS;
    if (subRoll > 0.2) return LOOT_ITEMS.FOCUS_POTION;
    return LOOT_ITEMS.RATIONS;
  }

  // Beast/Nature enemies (Hounds, Walkers, Sentinels, Lurkers)
  if (enemyName.toLowerCase().includes('hound') || 
      enemyName.toLowerCase().includes('walker') || 
      enemyName.toLowerCase().includes('sentinel') ||
      enemyName.toLowerCase().includes('lurker')) {
    if (subRoll > 0.6) return LOOT_ITEMS.RATIONS;
    if (subRoll > 0.3) return LOOT_ITEMS.FOCUS_POTION;
    return LOOT_ITEMS.AETHER_SHARDS;
  }

  // Default random drop
  if (subRoll > 0.75) return LOOT_ITEMS.SCRAP_METAL;
  if (subRoll > 0.50) return LOOT_ITEMS.AETHER_SHARDS;
  if (subRoll > 0.25) return LOOT_ITEMS.FOCUS_POTION;
  return LOOT_ITEMS.RATIONS;
};
