import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReputationState } from './FactionManager';
import { BiomeType, FactionType } from './BiomeMapper';
import { LOOT_ITEMS } from './LootTable';
import { useUIStore } from './useUIStore';
import { ZoneSynthesis, ZoneNPC } from './ZoneSynthesizer';

interface Coords {
  latitude: number;
  longitude: number;
}

export interface ZoneProfile {
  suburb: string;
  biome: BiomeType;
  faction: FactionType;
  synthesis: ZoneSynthesis;
  npc: ZoneNPC;
  wikiSummary: string;
  discoveryDate: number;
}

export interface Item {
  id: string;
  name: string;
  category: 'Weapon' | 'Armor' | 'Utility';
  rarity: 'Common' | 'Rare' | 'Fractured' | 'Legendary';
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

export interface Signal {
  id: string;
  coords: Coords;
  biome: BiomeType;
  type?: 'Standard' | 'Boss';
  expiresAt?: number;
  respawnAt?: number;
}

export interface ResourceNode {
  id: string;
  coords: Coords;
  materialName: string;
  amount: number;
  isHarvested: boolean;
}

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Rift';
}

export interface BestiaryEntry {
  encounters: number;
  defeats: number;
  lastDefeatedAt?: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  description: string;
  type: 'Passive' | 'Active';
}

export interface TutorialProgress {
  currentStep: number;
  hasLookedAround: boolean;
  hasTriedToRemember: boolean;
  isTutorialActive: boolean;
}

export type SpecializationID = 'aether-bumper' | 'wildfire-mage' | 'search-and-rescue';

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
    boots: Item | null;
  };
  inventory: Item[];
  skills: Skill[];
  reputation: ReputationState;
  discoveredZones: Record<string, ZoneProfile>;
  activeQuests: Quest[];
  hostileSignals: Signal[];
  resourceNodes: ResourceNode[];
  bestiary: Record<string, BestiaryEntry>;
  tutorialProgress: TutorialProgress;
  tutorialMarker: { coords: Coords; label: string } | null;
  choicesLog: string[];
  enrolledFaction: string | null;
  specialization: SpecializationID | null;
  setBonus: { name: string; bonus: Record<string, number> } | null;
  globalNotification: GlobalNotification | null;
  hasSetHomeCity: boolean;
  homeCityName: string;
  sanctuaryLocation: Coords | null;
  isSaving: boolean;
  setPlayerLocation: (location: Coords) => void;
  setStats: (stats: Partial<{ hp: number; mana: number; gold: number }>) => void;
  gainXp: (amount: number) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  equipItem: (item: Item) => void;
  learnSkill: (skill: Skill) => void;
  updateReputation: (factionId: string, delta: number) => void;
  saveZoneProfile: (profile: ZoneProfile) => void;
  rest: () => void;
  updateQuestProgress: (id: string, amount: number) => void;
  startQuest: (quest: Quest) => void;
  completeQuest: (id: string) => void;
  enrollInFaction: (factionId: string) => void;
  setSpecialization: (specId: SpecializationID) => void;
  recordEncounter: (enemyName: string) => void;
  recordDefeat: (enemyName: string) => void;
  removeSignal: (id: string) => void;
  respawnSignals: () => void;
  setHostileSignals: (signals: Signal[]) => void;
  setResourceNodes: (nodes: ResourceNode[]) => void;
  harvestNode: (id: string) => void;
  triggerRift: (coords: Coords, biome: BiomeType) => void;
  setNotification: (notif: GlobalNotification | null) => void;
  setHomeCity: (city: string, location: Coords) => void;
  triggerSaving: () => void;
  cleanupZones: () => void;
  resetStore: () => void;
  updateTutorial: (progress: Partial<TutorialProgress>) => void;
  clearTutorialMarker: () => void;
  logChoice: (choice: string) => void;
}

const INITIAL_LOCATION = {
  latitude: -37.8291,
  longitude: 144.8488,
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
  rarity: 'Common',
  description: 'A weighted tool of survival, blunt but effective against the horrors of the fracture.',
  stats: { attack: 12 },
};

const STARTING_ARMOR: Item = {
  id: 'starting-armor',
  name: 'Reflective Turnout Gear',
  category: 'Armor',
  rarity: 'Common',
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
  rewardGold: 1500,
};

const TUTORIAL_QUEST: Quest = {
  id: 'q-tutorial-dogs',
  title: 'Defeat Mutated Dogs',
  description: 'Cleanse the perimeter of the remaining 5 mutated manifestations.',
  targetCount: 5,
  currentCount: 0,
  biomeRequirement: 'Shattered Suburbia',
  isCompleted: false,
  rewardXp: 200,
  rewardGold: 5,
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
      mana: 20,
      maxMana: 20,
      gold: 0,
      attack: BASE_ATTACK,
      defense: BASE_DEFENSE,
            equipment: {
              weapon: null,
              armor: null,
              boots: null,
            },
            inventory: [],
            skills: [],
            reputation: INITIAL_REPUTATION,
            discoveredZones: {},
            activeQuests: [],
            hostileSignals: [],
            resourceNodes: [],
            bestiary: {},
            tutorialProgress: {
              currentStep: 0,
              hasLookedAround: false,
              hasTriedToRemember: false,
              isTutorialActive: true,
            },
            tutorialMarker: {
              coords: {
                latitude: INITIAL_LOCATION.latitude + 0.00225, // approx 250m north
                longitude: INITIAL_LOCATION.longitude
              },
              label: "Glowing Blue Orb"
            },
            choicesLog: [],
            enrolledFaction: null,
                  specialization: null,
                  setBonus: null,
                        globalNotification: null,
                              hasSetHomeCity: true,
                              homeCityName: "Altona North",
                              sanctuaryLocation: INITIAL_LOCATION,
                              isSaving: false,
            
                              setPlayerLocation: (location) => set({ playerLocation: location }),      setStats: (stats) => set((state) => ({ ...state, ...stats })),
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
              if (item.category === 'Armor') {
                if (item.name.toLowerCase().includes('boots')) {
                  newEquipment.boots = item;
                } else {
                  newEquipment.armor = item;
                }
              }
              
              let weaponBonus = newEquipment.weapon?.stats?.attack || 0;
              let armorBonus = (newEquipment.armor?.stats?.defense || 0) + (newEquipment.boots?.stats?.defense || 0);
              
              let activeSetBonus = null;
              if (newEquipment.armor?.name.includes('Plasteel') && 
                  newEquipment.boots?.name.includes('Plasteel')) {
                armorBonus += 5;
                activeSetBonus = { name: 'Plasteel Reinforcement', bonus: { defense: 5 } };
              }
              
              return { 
                equipment: newEquipment,
                attack: BASE_ATTACK + weaponBonus,
                defense: BASE_DEFENSE + armorBonus,
                setBonus: activeSetBonus
              };
            }),
            learnSkill: (skill) => set((state) => {
              const existingIndex = state.skills.findIndex(s => s.id === skill.id);
              if (existingIndex > -1) {
                const newSkills = [...state.skills];
                newSkills[existingIndex] = skill;
                return { skills: newSkills };
              }
              return { skills: [...state.skills, skill] };
            }),
            updateReputation: (factionId, delta) => set((state) => ({
              reputation: {
                ...state.reputation,
                [factionId]: (state.reputation[factionId] || 0) + delta,
              },
            })),
            saveZoneProfile: (profile) => set((state) => ({
              discoveredZones: {
                ...state.discoveredZones,
                [profile.suburb]: profile
              }
            })),
            rest: () => set((state) => ({
              hp: state.maxHp,
              mana: state.maxMana
            })),      updateQuestProgress: (id, amount) => set((state) => {
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
      startQuest: (quest) => set((state) => {
        if (state.activeQuests.find(q => q.id === quest.id)) return state;
        return { activeQuests: [...state.activeQuests, quest] };
      }),
      completeQuest: (id) => set((state) => {
        const quest = state.activeQuests.find(q => q.id === id);
        if (!quest || !quest.isCompleted) return state;

        let itemReward: Item | null = null;
        if (state.enrolledFaction === 'the-cogwheel') {
          itemReward = Math.random() > 0.5 ? LOOT_ITEMS.SCRAP_METAL : LOOT_ITEMS.AETHER_SHARDS;
        } else if (state.enrolledFaction === 'the-verdant') {
          itemReward = Math.random() > 0.5 ? LOOT_ITEMS.RATIONS : LOOT_ITEMS.FOCUS_POTION;
        }

        const updatedInventory = itemReward 
          ? [...state.inventory, { ...itemReward, id: `${itemReward.id}-${Math.random().toString(36).substr(2, 9)}` }]
          : state.inventory;

        let newXp = state.xp + quest.rewardXp;
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
          gold: state.gold + quest.rewardGold,
          inventory: updatedInventory,
          xp: newXp,
          level: newLevel,
          maxXp: newMaxXp,
          maxHp: newMaxHp,
          maxMana: newMaxMana,
          hp: newHp,
          mana: newMana,
          activeQuests: state.activeQuests.filter(q => q.id !== id)
        };
      }),
      enrollInFaction: (factionId) => set((state) => {
        if (state.enrolledFaction) return state;
        
        let bonusStats = {};
        if (factionId === 'the-cogwheel') {
          bonusStats = { attack: Math.floor(state.attack * 1.15) };
        } else if (factionId === 'the-verdant') {
          bonusStats = { defense: Math.floor(state.defense * 1.15) };
        }

        return { 
          enrolledFaction: factionId,
          ...bonusStats
        };
      }),
      setSpecialization: (specId) => set((state) => {
        if (state.specialization) return state;

        let bonusStats = {};
        if (specId === 'aether-bumper') {
          bonusStats = { maxHp: state.maxHp + 50, hp: state.hp + 50, defense: Math.floor(state.defense * 1.2) };
        } else if (specId === 'wildfire-mage') {
          bonusStats = { maxMana: state.maxMana + 50, mana: state.mana + 50, attack: Math.floor(state.attack * 1.2) };
        } else if (specId === 'search-and-rescue') {
          bonusStats = { maxHp: state.maxHp + 25, hp: state.hp + 25, maxMana: state.maxMana + 25, mana: state.mana + 25 };
        }

        return {
          specialization: specId,
          ...bonusStats
        };
      }),
      recordEncounter: (enemyName) => set((state) => {
        const entry = state.bestiary[enemyName] || { encounters: 0, defeats: 0 };
        return {
          bestiary: {
            ...state.bestiary,
            [enemyName]: { ...entry, encounters: entry.encounters + 1 }
          }
        };
      }),
      recordDefeat: (enemyName) => set((state) => {
        const entry = state.bestiary[enemyName] || { encounters: 1, defeats: 0 };
        return {
          bestiary: {
            ...state.bestiary,
            [enemyName]: { 
              ...entry, 
              defeats: entry.defeats + 1,
              lastDefeatedAt: Date.now()
            }
          }
        };
      }),
      removeSignal: (id) => set((state) => ({
        hostileSignals: state.hostileSignals.filter(s => s.id !== id || s.expiresAt)
          .map(s => s.id === id ? { ...s, respawnAt: Date.now() + 5 * 60 * 1000 } : s)
      })),
      respawnSignals: () => set((state) => {
        const now = Date.now();
        const updated = state.hostileSignals.filter(s => !s.expiresAt || now < s.expiresAt).map(s => {
          if (s.respawnAt && now > s.respawnAt) {
            return {
              ...s,
              respawnAt: undefined,
              coords: {
                latitude: s.coords.latitude + (Math.random() - 0.5) * 0.002,
                longitude: s.coords.longitude + (Math.random() - 0.5) * 0.002,
              }
            };
          }
          return s;
        });
        return { hostileSignals: updated };
      }),
      setHostileSignals: (signals) => set({ hostileSignals: signals }),
      setResourceNodes: (nodes) => set({ resourceNodes: nodes }),
      harvestNode: (id) => set((state) => {
        const node = state.resourceNodes.find(n => n.id === id);
        if (!node || node.isHarvested) return state;

        const material: Item = {
          id: `mat-${node.materialName.toLowerCase()}`,
          name: node.materialName,
          category: 'Utility',
          rarity: 'Common',
          description: `A raw material used for crafting and faction projects. Amount: ${node.amount}`,
        };

        return {
          resourceNodes: state.resourceNodes.map(n => n.id === id ? { ...n, isHarvested: true } : n),
          inventory: [...state.inventory, { ...material, id: `${material.id}-${Math.random().toString(36).substr(2, 9)}` }]
        };
      }),
      triggerRift: (coords, biome) => set((state) => {
        const riftSignal: Signal = {
          id: `rift-${Date.now()}`,
          coords,
          biome,
          type: 'Boss',
          expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
        };
        
        const riftNotif: GlobalNotification = {
          id: `rift-notif-${Date.now()}`,
          title: 'FRACTURE RIFT DETECTED',
          message: 'A massive energy spike has manifested nearby. A high-level entity is crossing over. Duration: 15m.',
          type: 'Rift'
        };

        return {
          hostileSignals: [...state.hostileSignals, riftSignal],
          globalNotification: riftNotif
        };
      }),
      setNotification: (notif) => set({ globalNotification: notif }),
      setHomeCity: (city, location) => set({ 
        homeCityName: city, 
        playerLocation: location, 
        sanctuaryLocation: location,
        hasSetHomeCity: true 
      }),
      cleanupZones: () => set({
        discoveredZones: {},
        hostileSignals: [],
        resourceNodes: []
      }),
      resetStore: () => set({
        playerLocation: INITIAL_LOCATION,
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 100,
        maxHp: 100,
        mana: 20,
        maxMana: 20,
        gold: 0,
        attack: BASE_ATTACK,
        defense: BASE_DEFENSE,
        equipment: {
          weapon: null,
          armor: null,
          boots: null,
        },
        inventory: [],
        reputation: INITIAL_REPUTATION,
        discoveredZones: {},
        activeQuests: [],
        hostileSignals: [],
        resourceNodes: [],
        bestiary: {},
        tutorialProgress: {
          currentStep: 0,
          hasLookedAround: false,
          hasTriedToRemember: false,
          isTutorialActive: true,
        },
        tutorialMarker: {
          coords: {
            latitude: INITIAL_LOCATION.latitude + 0.00225,
            longitude: INITIAL_LOCATION.longitude
          },
          label: "Glowing Blue Orb"
        },
        choicesLog: [],
        enrolledFaction: null,
        specialization: null,
        setBonus: null,
        globalNotification: null,
        hasSetHomeCity: true,
        homeCityName: "Altona North",
        sanctuaryLocation: INITIAL_LOCATION,
        isSaving: false,
      }),
      updateTutorial: (progress) => set((state) => ({
        tutorialProgress: { ...state.tutorialProgress, ...progress }
      })),
      clearTutorialMarker: () => set({ tutorialMarker: null }),
      logChoice: (choice) => set((state) => ({ choicesLog: [...state.choicesLog, choice] })),
    }),
    {
      name: 'aeternis-player-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: (name, value) => {
          return AsyncStorage.setItem(name, value);
        },
        removeItem: (name) => AsyncStorage.removeItem(name),
      })),
    }
  )
);
