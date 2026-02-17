import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DungeonChoiceType = 'Enemy' | 'Chest' | 'Altar';

export interface DungeonChoice {
  id: string;
  type: DungeonChoiceType;
  title: string;
  description: string;
  isMimic?: boolean;
}

export interface DungeonModifier {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  stat: 'attack' | 'defense' | 'maxHp' | 'maxMana';
  value: number; // e.g. 1.2 for +20% or 0.8 for -20%
}

interface DungeonState {
  isInsideDungeon: boolean;
  currentDungeonId: string | null;
  currentStage: number;
  modifiers: DungeonModifier[];
  stageChoices: DungeonChoice[];
  
  // Actions
  enterDungeon: (dungeonId: string) => void;
  exitDungeon: () => void;
  nextStage: () => void;
  generateChoices: () => void;
  addModifier: (mod: DungeonModifier) => void;
  clearModifiers: () => void;
  resetDungeon: () => void;
}

const MODIFIER_POOL: Omit<DungeonModifier, 'id'>[] = [
  { name: 'Aether Resonance', type: 'buff', stat: 'attack', value: 1.2 },
  { name: 'Hardened Will', type: 'buff', stat: 'defense', value: 1.2 },
  { name: 'Vitality Surge', type: 'buff', stat: 'maxHp', value: 1.2 },
  { name: 'Mental Clarity', type: 'buff', stat: 'maxMana', value: 1.2 },
  { name: 'Static Static', type: 'debuff', stat: 'attack', value: 0.8 },
  { name: 'Brittle Form', type: 'debuff', stat: 'defense', value: 0.8 },
  { name: 'Energy Leak', type: 'debuff', stat: 'maxMana', value: 0.8 },
  { name: 'Fractured Shell', type: 'debuff', stat: 'maxHp', value: 0.8 },
];

export const useDungeonStore = create<DungeonState>()(
  persist(
    (set, get) => ({
      isInsideDungeon: false,
      currentDungeonId: null,
      currentStage: 1,
      modifiers: [],
      stageChoices: [],

      enterDungeon: (dungeonId) => {
        set({ 
          isInsideDungeon: true, 
          currentDungeonId: dungeonId, 
          currentStage: 1, 
          modifiers: [] 
        });
        get().generateChoices();
      },

      exitDungeon: () => set({ 
        isInsideDungeon: false, 
        currentDungeonId: null, 
        currentStage: 1, 
        modifiers: [],
        stageChoices: []
      }),

      nextStage: () => {
        const next = get().currentStage + 1;
        if (next > 10) {
          get().exitDungeon();
        } else {
          set({ currentStage: next });
          get().generateChoices();
        }
      },

      generateChoices: () => {
        const stage = get().currentStage;
        
        // Fixed Stages
        if (stage === 5 || stage === 6 || stage === 10) {
          set({ stageChoices: [] });
          return;
        }

        const choices: DungeonChoice[] = [];
        const counts = { Enemy: 0, Chest: 0, Altar: 0 };
        const MAX_ENEMIES = 2;
        const MAX_CHESTS = 2;
        const MAX_ALTARS = 1;

        for (let i = 0; i < 3; i++) {
          const rand = Math.random();
          let type: DungeonChoiceType;

          if (rand < 0.6) type = 'Enemy';
          else if (rand < 0.8) type = 'Chest';
          else type = 'Altar';

          // Enforce constraints
          if (type === 'Enemy' && counts.Enemy >= MAX_ENEMIES) {
            type = counts.Chest < MAX_CHESTS ? 'Chest' : 'Altar';
          }
          if (type === 'Chest' && counts.Chest >= MAX_CHESTS) {
            type = counts.Enemy < MAX_ENEMIES ? 'Enemy' : 'Altar';
          }
          if (type === 'Altar' && counts.Altar >= MAX_ALTARS) {
            type = counts.Enemy < MAX_ENEMIES ? 'Enemy' : 'Chest';
          }

          counts[type]++;
          
          if (type === 'Enemy') {
            choices.push({
              id: `choice-${i}-${Date.now()}`,
              type: 'Enemy',
              title: 'Hostile Entity',
              description: 'A manifestation of the static blocks your path. Purge it.'
            });
          } else if (type === 'Chest') {
            const isMimic = Math.random() < 0.666;
            choices.push({
              id: `choice-${i}-${Date.now()}`,
              type: 'Chest',
              title: 'Dungeon Cache',
              description: 'A pre-Collapse container. Its contents are unknown.',
              isMimic
            });
          } else {
            choices.push({
              id: `choice-${i}-${Date.now()}`,
              type: 'Altar',
              title: 'Ancient Altar',
              description: 'An obelisk pulsing with raw Imaginum. It demands a sacrifice of will.'
            });
          }
        }

        set({ stageChoices: choices });
      },

      addModifier: (mod) => set((state) => ({
        modifiers: [...state.modifiers, { ...mod, id: `${mod.id}-${Date.now()}` }]
      })),

      clearModifiers: () => set({ modifiers: [] }),

      resetDungeon: () => {
        set({ currentStage: 1, modifiers: [], stageChoices: [] });
        get().generateChoices();
      }
    }),
    {
      name: 'aeternis-dungeon-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
