import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReputationState } from './FactionManager';

interface Coords {
  latitude: number;
  longitude: number;
}

export interface Item {
  id: string;
  name: string;
  category: 'Weapon' | 'Armor' | 'Utility';
  description: string;
  stats?: Record<string, number>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  biomeRequirement?: string;
  isCompleted: boolean;
  rewardXp: number;
  rewardGold: number;
}

interface PlayerState {
  playerLocation: Coords;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  attack: number;
  defense: number;
  equipment: {
    weapon: Item | null;
    armor: Item | null;
  };
  inventory: Item[];
  reputation: ReputationState;
  discoveredZones: string[];
  activeQuests: Quest[];
  hasSetHomeCity: boolean;
  homeCityName: string;
  setPlayerLocation: (location: Coords) => void;
  setStats: (stats: Partial<{ hp: number; mana: number; gold: number }>) => void;
  gainXp: (amount: number) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  equipItem: (item: Item) => void;
  updateReputation: (factionId: string, delta: number) => void;
  discoverZone: (suburb: string) => void;
  rest: () => void;
  updateQuestProgress: (id: string, amount: number) => void;
  setHomeCity: (city: string, location: Coords) => void;
}

// Initial position (Altona North as per explore.tsx)
const INITIAL_LOCATION = {
  latitude: -37.8286,
  longitude: 144.8475,
};

const BASE_ATTACK = 5;
const BASE_DEFENSE = 2;

const INITIAL_REPUTATION: ReputationState = {
  'the-cogwheel': 0,
  'the-verdant': 0,
};

const STARTING_WEAPON: Item = {
  id: 'starting-axe',
  name: 'Heavy Iron Axe',
  category: 'Weapon',
  description: 'A weighted tool of survival, blunt but effective against the horrors of the fracture.',
  stats: { attack: 12 },
};

const STARTING_ARMOR: Item = {
  id: 'starting-armor',
  name: 'Reflective Turnout Gear',
  category: 'Armor',
  description: 'High-visibility firefighter gear, repurposed to offer protection against both heat and spectral corruption.',
  stats: { defense: 8 },
};

const STARTING_QUEST: Quest = {
  id: 'q-secure-the-west',
  title: 'Secure the West',
  description: 'Defeat 3 enemies in the Rust Fields to stabilize the perimeter.',
  targetCount: 3,
  currentCount: 0,
  biomeRequirement: 'Rust Fields',
  isCompleted: false,
  rewardXp: 150,
  rewardGold: 200,
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerLocation: INITIAL_LOCATION,
      level: 1,
      xp: 0,
      maxXp: 100,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      gold: 150,
      attack: BASE_ATTACK + (STARTING_WEAPON.stats?.attack || 0),
      defense: BASE_DEFENSE + (STARTING_ARMOR.stats?.defense || 0),
      equipment: {
        weapon: STARTING_WEAPON,
        armor: STARTING_ARMOR,
      },
      inventory: [STARTING_WEAPON, STARTING_ARMOR],
      reputation: INITIAL_REPUTATION,
      discoveredZones: [],
      activeQuests: [STARTING_QUEST],
      hasSetHomeCity: false,
      homeCityName: "",
      
      setPlayerLocation: (location) => set({ playerLocation: location }),
      setStats: (stats) => set((state) => ({ ...state, ...stats })),
      gainXp: (amount) => set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let newMaxXp = state.maxXp;
        let newMaxHp = state.maxHp;
        let newMaxMana = state.maxMana;
        let newHp = state.hp;
        let newMana = state.mana;

        while (newXp >= newMaxXp) {
          newXp -= newMaxXp;
          newLevel += 1;
          newMaxXp = Math.floor(newMaxXp * 1.5);
          newMaxHp += 20;
          newMaxMana += 10;
          newHp = newMaxHp; 
          newMana = newMaxMana; 
        }

        return { 
          xp: newXp, 
          level: newLevel, 
          maxXp: newMaxXp, 
          maxHp: newMaxHp, 
          maxMana: newMaxMana,
          hp: newHp,
          mana: newMana
        };
      }),
      addItem: (item) => set((state) => ({ 
        inventory: [...state.inventory, { ...item, id: `${item.id}-${Math.random().toString(36).substr(2, 9)}` }] 
      })),
      removeItem: (itemId) => set((state) => ({
        inventory: state.inventory.filter(i => i.id !== itemId)
      })),
      equipItem: (item) => set((state) => {
        const newEquipment = { ...state.equipment };
        if (item.category === 'Weapon') newEquipment.weapon = item;
        if (item.category === 'Armor') newEquipment.armor = item;
        
        const weaponBonus = newEquipment.weapon?.stats?.attack || 0;
        const armorBonus = newEquipment.armor?.stats?.defense || 0;
        
        return { 
          equipment: newEquipment,
          attack: BASE_ATTACK + weaponBonus,
          defense: BASE_DEFENSE + armorBonus
        };
      }),
      updateReputation: (factionId, delta) => set((state) => ({
        reputation: {
          ...state.reputation,
          [factionId]: (state.reputation[factionId] || 0) + delta,
        },
      })),
      discoverZone: (suburb) => set((state) => ({
        discoveredZones: state.discoveredZones.includes(suburb) 
          ? state.discoveredZones 
          : [...state.discoveredZones, suburb]
      })),
      rest: () => set((state) => ({
        hp: state.maxHp,
        mana: state.maxMana
      })),
      updateQuestProgress: (id, amount) => set((state) => {
        const updatedQuests = state.activeQuests.map(q => {
          if (q.id === id && !q.isCompleted) {
            const newCount = Math.min(q.targetCount, q.currentCount + amount);
            const isNowCompleted = newCount === q.targetCount;
            return { ...q, currentCount: newCount, isCompleted: isNowCompleted };
          }
          return q;
        });
        return { activeQuests: updatedQuests };
      }),
      setHomeCity: (city, location) => set({ 
        homeCityName: city, 
        playerLocation: location, 
        hasSetHomeCity: true 
      }),
    }),
    {
      name: 'aeternis-player-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
