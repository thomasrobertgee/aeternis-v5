/**
 * LootTable.ts
 * Manages item drops from defeated enemies with Rarity levels.
 */

import { Item } from './usePlayerStore';

export const LOOT_ITEMS: Record<string, Item> = {
  SCRAP_METAL: {
    id: 'loot-scrap-metal',
    name: 'Scrap Metal',
    category: 'Utility',
    rarity: 'Common',
    description: 'Rusted gears and twisted plates. Highly valued by The Cogwheel for reconstruction.',
  },
  AETHER_SHARDS: {
    id: 'loot-aether-shards',
    name: 'Aether Shards',
    category: 'Utility',
    rarity: 'Rare',
    description: 'Crystallized Imaginum that pulses with a faint blue light. Used in high-tech crafting.',
  },
  RATIONS: {
    id: 'loot-rations',
    name: 'Old World Rations',
    category: 'Utility',
    rarity: 'Common',
    description: 'Vacuum-sealed nutrition from before The Collapse. Tastes like cardboard, but it keeps you going.',
  },
  FOCUS_POTION: {
    id: 'loot-focus-potion',
    name: 'Focus Potion',
    category: 'Utility',
    rarity: 'Rare',
    description: 'A viscous, indigo liquid that sharpens the mind and stabilizes your connection to the Imaginum.',
  },
  FRACTURED_CORE: {
    id: 'loot-fractured-core',
    name: 'Fractured Core',
    category: 'Utility',
    rarity: 'Fractured',
    description: 'A vibrating sphere of pure instability. Highly dangerous and extremely rare.',
  },
  ANCIENT_RELIC: {
    id: 'loot-ancient-relic',
    name: 'Legendary Relic',
    category: 'Utility',
    rarity: 'Legendary',
    description: 'An artifact from the pre-Collapse era, imbued with impossible energy.',
  },
  SCAVENGED_BOOTS: {
    id: 'loot-scavenged-boots',
    name: 'Scavenged Boots',
    category: 'Armor',
    rarity: 'Common',
    description: 'Worn leather boots reinforced with bits of tire tread and wire.',
    stats: { defense: 3 },
  },
  PLASTEEL_BOOTS: {
    id: 'mkt-plasteel-boots',
    name: 'Plasteel Boots',
    category: 'Armor',
    rarity: 'Rare',
    description: 'Stabilized kinetic footwear. Completes the Plasteel protection suite.',
    stats: { defense: 10 },
  }
};

/**
 * Determines loot dropped by an enemy based on its name/type and roll.
 */
export const getLootForEnemy = (enemyName: string): Item | null => {
  const roll = Math.random();
  
  // 70% chance to drop something
  if (roll > 0.7) return null;

  const subRoll = Math.random();

  // Rarity roll logic
  let selectedRarity: 'Common' | 'Rare' | 'Fractured' | 'Legendary' = 'Common';
  if (subRoll < 0.02) selectedRarity = 'Legendary';
  else if (subRoll < 0.10) selectedRarity = 'Fractured';
  else if (subRoll < 0.35) selectedRarity = 'Rare';

  // Filter items by rarity
  const possibleItems = Object.values(LOOT_ITEMS).filter(item => item.rarity === selectedRarity);
  
  if (possibleItems.length === 0) return LOOT_ITEMS.SCRAP_METAL; // Fallback

  return possibleItems[Math.floor(Math.random() * possibleItems.length)];
};
