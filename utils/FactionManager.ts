/**
 * FactionManager.ts
 * Manages the different organizations and groups within the Fractured Earth.
 */

export interface Faction {
  id: string;
  name: string;
  description: string;
  alignment: 'Order' | 'Chaos' | 'Neutral';
  startingReputation: number;
}

export const FACTIONS: Record<string, Faction> = {
  COGWHEEL: {
    id: 'the-cogwheel',
    name: 'The Cogwheel',
    description: 'A remnants of industrial unions and engineers who believe that only through the restoration of pre-Collapse machinery can humanity survive.',
    alignment: 'Order',
    startingReputation: 0,
  },
  VERDANT: {
    id: 'the-verdant',
    name: 'The Verdant',
    description: 'A mystical collective that embraces the Imaginum-infused flora, seeking to merge human consciousness with the burgeoning world-tree.',
    alignment: 'Neutral',
    startingReputation: 0,
  },
};

export type FactionID = 'the-cogwheel' | 'the-verdant';

export interface ReputationState {
  [key: string]: number; // FactionID -> Reputation Score
}
