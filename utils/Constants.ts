/**
 * Constants.ts
 * Shared UI constants and styling utilities.
 */

export const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Legendary': return '#f97316'; // orange-500
    case 'Fractured': return '#a855f7'; // purple-500
    case 'Rare': return '#3b82f6'; // blue-500
    default: return '#f4f4f5'; // zinc-100
  }
};
