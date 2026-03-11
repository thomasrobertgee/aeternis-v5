import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReputationState } from './FactionManager';
import { BiomeType, FactionType } from './BiomeMapper';
import { LOOT_ITEMS } from './LootTable';
import { useUIStore } from './useUIStore';
import { ZoneSynthesis, ZoneNPC } from './ZoneSynthesizer';
import { DungeonModifier } from './useDungeonStore';

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
  grantedSkill?: Skill;
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

export interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Rift' | 'LevelUp' | 'Aetium' | 'Item';
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

export interface ActiveZoneContext {
  zoneTheme: {
    biomeName: string;
    weatherState: string;
    description: string;
  };
  primarySettlement: {
    name: string;
    chieftain: { name: string; lore: string };
    vendor: { name: string; specialty: string };
  };
  enemies: { name: string; type: string; description: string }[];
  dungeon: { name: string; theme: string };
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
    boots: Item | null;
  };
  inventory: Item[];
  skills: Skill[];
  reputation: ReputationState;
  discoveredZones: Record<string, ZoneProfile>;
  activeQuests: Quest[];
  hostileSignals: Signal[];
  bestiary: Record<string, BestiaryEntry>;
  tutorialProgress: TutorialProgress;
  tutorialMarker: { coords: Coords; label: string } | null;
  choicesLog: string[];
  enrolledFaction: FactionType | null;
  specialization: SpecializationID | null;
  setBonus: { name: string; bonus: Record<string, number> } | null;
  globalNotification: GlobalNotification[];
  errorNotification: GlobalNotification[];
  playerName: string;
  hasSetHomeCity: boolean;
  homeCityName: string;
  sanctuaryLocation: Coords;
  isSaving: boolean;
  isInSettlement: boolean;
  isTutorialComplete: boolean;
  dungeonModifiers: DungeonModifier[];
  activeZoneContext: ActiveZoneContext | null;
  settings: {
    musicEnabled: boolean;
    tempUnit: 'Celsius' | 'Fahrenheit';
  };
  tutorialCoords: {
    dungeon: Coords;
    settlement: Coords;
  };

  setPlayerLocation: (location: Coords) => void;
  setPlayerName: (name: string) => void;
  setStats: (stats: Partial<PlayerState>) => void;
  setIsInSettlement: (inSettlement: boolean) => void;
  setTutorialComplete: (complete: boolean) => void;
  setDungeonModifiers: (modifiers: DungeonModifier[]) => void;
  setActiveZoneContext: (context: ActiveZoneContext) => void;
  setTutorialMarker: (marker: { coords: Coords; label: string } | null) => void;
  setTutorialCoords: (coords: { dungeon: Coords; settlement: Coords }) => void;
  toggleMusic: () => void;
  toggleTempUnit: () => void;
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
  enrollInFaction: (factionId: FactionType) => void;
  setSpecialization: (specId: SpecializationID) => void;
  recordEncounter: (enemyName: string) => void;
  recordDefeat: (enemyName: string) => void;
  removeSignal: (id: string) => void;
  respawnSignals: () => void;
  setHostileSignals: (signals: Signal[]) => void;
  triggerRift: (coords: Coords, biome: BiomeType) => void;
  setNotification: (notif: GlobalNotification | null) => void;
  removeNotification: (id: string) => void;
  setErrorNotification: (error: Omit<GlobalNotification, 'id' | 'type'> | null) => void;
  removeErrorNotification: (id: string) => void;
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
      tutorialCoords: {
        dungeon: { latitude: -37.84405, longitude: 144.84356 },
        settlement: { latitude: -37.828, longitude: 144.847 }
      },
      choicesLog: [],
      enrolledFaction: null,
      specialization: null,
      setBonus: null,
      globalNotification: [],
      errorNotification: [],
      playerName: "Traveller",
      hasSetHomeCity: false,
      homeCityName: "",
      sanctuaryLocation: INITIAL_LOCATION,
      isSaving: false,
      isInSettlement: false,
      isTutorialComplete: false,
      dungeonModifiers: [],
      activeZoneContext: null,
      settings: {
        musicEnabled: true,
        tempUnit: 'Celsius',
      },

      setPlayerLocation: (location) => set({ playerLocation: location }),
      setPlayerName: (name) => set({ playerName: name }),
      setStats: (stats) => set((state) => ({ ...state, ...stats })),
      setIsInSettlement: (inSettlement) => set({ isInSettlement: inSettlement }),
      setTutorialComplete: (complete) => set({ isTutorialComplete: complete }),
      setDungeonModifiers: (modifiers) => set({ dungeonModifiers: modifiers }),
      setActiveZoneContext: (context) => set({ activeZoneContext: context }),
      setTutorialMarker: (marker) => set({ tutorialMarker: marker }),
      setTutorialCoords: (coords) => set({ tutorialCoords: coords }),

      toggleMusic: () => set((state) => ({
        settings: { ...state.settings, musicEnabled: !state.settings.musicEnabled }
      })),
      toggleTempUnit: () => set((state) => ({
        settings: { ...state.settings, tempUnit: state.settings.tempUnit === 'Celsius' ? 'Fahrenheit' : 'Celsius' }
      })),
      gainXp: (amount) => set((state) => {
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let newMaxXp = state.maxXp;
        let newMaxHp = state.maxHp;
        let newMaxMana = state.maxMana;
        let newHp = state.hp;
        let newMana = state.mana;
        let newAttack = state.attack;
        let newDefense = state.defense;
        let newNotifications = state.globalNotification;

        while (newXp >= newMaxXp) {
          newXp -= newMaxXp;
          newLevel += 1;
          newMaxXp = Math.floor(newMaxXp * 1.5);
          newMaxHp += 20;
          newMaxMana += 10;
          newAttack += 2;
          newDefense += 1;
        }

        if (newLevel > state.level) {
          newHp = newMaxHp;
          newMana = newMaxMana;
          newNotifications = [...newNotifications, {
            id: `level-${Date.now()}-${Math.random()}`,
            title: 'Level Resonance',
            message: `Your Imaginum expands. You have reached Level ${newLevel}.`,
            type: 'LevelUp'
          }];
        }

        return { xp: newXp, level: newLevel, maxXp: newMaxXp, maxHp: newMaxHp, maxMana: newMaxMana, hp: newHp, mana: newMana, attack: newAttack, defense: newDefense, globalNotification: newNotifications };
      }),
      addItem: (item) => set((state) => ({ inventory: [...state.inventory, { ...item, id: `${item.id}-${Math.random().toString(36).substr(2, 9)}` }] })),
      removeItem: (itemId) => set((state) => {
        const index = state.inventory.findIndex(i => i.id === itemId);
        if (index === -1) return state;
        const newInventory = [...state.inventory];
        newInventory.splice(index, 1);
        return { inventory: newInventory };
      }),
      equipItem: (item) => set((state) => {
        const newEquipment = { ...state.equipment };
        let newSkills = [...state.skills];
        if (item.category === 'Weapon') {
          newEquipment.weapon = item;
          if (item.grantedSkill) {
            const existingIdx = newSkills.findIndex(s => s.id === item.grantedSkill?.id);
            if (existingIdx > -1) newSkills[existingIdx] = item.grantedSkill;
            else {
              newSkills = newSkills.filter(s => s.type !== 'Active');
              newSkills.push(item.grantedSkill);
            }
          }
        }
        if (item.category === 'Armor') {
          if (item.name.toLowerCase().includes('boots')) newEquipment.boots = item;
          else newEquipment.armor = item;
        }
        let weaponBonus = newEquipment.weapon?.stats?.attack || 0;
        let armorBonus = (newEquipment.armor?.stats?.defense || 0) + (newEquipment.boots?.stats?.defense || 0);
        let activeSetBonus = null;
        if (newEquipment.armor?.name.includes('Plasteel') && newEquipment.boots?.name.includes('Plasteel')) {
          armorBonus += 5;
          activeSetBonus = { name: 'Plasteel Reinforcement', bonus: { defense: 5 } };
        }
        return { equipment: newEquipment, skills: newSkills, attack: BASE_ATTACK + weaponBonus, defense: BASE_DEFENSE + armorBonus, setBonus: activeSetBonus };
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
      updateReputation: (factionId, delta) => set((state) => ({ reputation: { ...state.reputation, [factionId]: (state.reputation[factionId] || 0) + delta } })),
      saveZoneProfile: (profile) => set((state) => ({ discoveredZones: { ...state.discoveredZones, [profile.suburb]: profile } })),
      rest: () => set((state) => ({ hp: state.maxHp, mana: state.maxMana })),
      updateQuestProgress: (id, amount) => set((state) => {
        const updatedQuests = state.activeQuests.map(q => {
          if (q.id === id && !q.isCompleted) {
            const newCount = Math.min(q.targetCount, q.currentCount + amount);
            return { ...q, currentCount: newCount, isCompleted: newCount === q.targetCount };
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
        let goldReward = quest.rewardGold;
        if (id === 'q-millers-junction-depths') goldReward = 500;
        let itemReward: Item | null = null;
        if (state.enrolledFaction === 'the-cogwheel') itemReward = Math.random() > 0.5 ? LOOT_ITEMS.SCRAP_METAL : LOOT_ITEMS.AETHER_SHARDS;
        else if (state.enrolledFaction === 'the-verdant') itemReward = Math.random() > 0.5 ? LOOT_ITEMS.RATIONS : LOOT_ITEMS.FOCUS_POTION;
        const updatedInventory = itemReward ? [...state.inventory, { ...itemReward, id: `${itemReward.id}-${Math.random().toString(36).substr(2, 9)}` }] : state.inventory;
        let newXp = state.xp + quest.rewardXp;
        let newLevel = state.level;
        let newMaxXp = state.maxXp;
        let newMaxHp = state.maxHp;
        let newMaxMana = state.maxMana;
        let newHp = state.hp;
        let newMana = state.mana;
        let newAttack = state.attack;
        let newDefense = state.defense;
        let newNotifications = [...state.globalNotification];
        while (newXp >= newMaxXp) {
          newXp -= newMaxXp;
          newLevel += 1;
          newMaxXp = Math.floor(newMaxXp * 1.5);
          newMaxHp += 20;
          newMaxMana += 10;
          newAttack += 2;
          newDefense += 1;
        }
        if (newLevel > state.level) {
          newHp = newMaxHp;
          newMana = newMaxMana;
          newNotifications.push({ id: `level-${Date.now()}-${Math.random()}`, title: 'Level Resonance', message: `Your Imaginum expands. You have reached Level ${newLevel}.`, type: 'LevelUp' });
        }
        return { gold: state.gold + goldReward, inventory: updatedInventory, xp: newXp, level: newLevel, maxXp: newMaxXp, maxHp: newMaxHp, maxMana: newMaxMana, hp: newHp, mana: newMana, attack: newAttack, defense: newDefense, activeQuests: state.activeQuests.filter(q => q.id !== id), globalNotification: newNotifications };
      }),
      enrollInFaction: (factionId) => set((state) => {
        if (state.enrolledFaction) return state;
        let bonusStats = factionId === 'the-cogwheel' ? { attack: Math.floor(state.attack * 1.15) } : (factionId === 'the-verdant' ? { defense: Math.floor(state.defense * 1.15) } : {});
        return { enrolledFaction: factionId, ...bonusStats };
      }),
      setSpecialization: (specId) => set((state) => {
        if (state.specialization) return state;
        let bonusStats = {};
        if (specId === 'aether-bumper') bonusStats = { maxHp: state.maxHp + 50, hp: state.hp + 50, defense: Math.floor(state.defense * 1.2) };
        else if (specId === 'wildfire-mage') bonusStats = { maxMana: state.maxMana + 50, mana: state.mana + 50, attack: Math.floor(state.attack * 1.2) };
        else if (specId === 'search-and-rescue') bonusStats = { maxHp: state.maxHp + 25, hp: state.hp + 25, maxMana: state.maxMana + 25, mana: state.mana + 25 };
        return { specialization: specId, ...bonusStats };
      }),
      recordEncounter: (enemyName) => set((state) => ({ bestiary: { ...state.bestiary, [enemyName]: { ...(state.bestiary[enemyName] || { encounters: 0, defeats: 0 }), encounters: (state.bestiary[enemyName]?.encounters || 0) + 1 } } })),
      recordDefeat: (enemyName) => set((state) => ({ bestiary: { ...state.bestiary, [enemyName]: { ...(state.bestiary[enemyName] || { encounters: 1, defeats: 0 }), defeats: (state.bestiary[enemyName]?.defeats || 0) + 1, lastDefeatedAt: Date.now() } } })),
      removeSignal: (id) => set((state) => ({ hostileSignals: state.hostileSignals.filter(s => s.id !== id || s.expiresAt).map(s => s.id === id ? { ...s, respawnAt: Date.now() + 5 * 60 * 1000 } : s) })),
      respawnSignals: () => set((state) => {
        const now = Date.now();
        const updated = state.hostileSignals.filter(s => !s.expiresAt || now < s.expiresAt).map(s => {
          if (s.respawnAt && now > s.respawnAt) return { ...s, respawnAt: undefined, coords: { latitude: s.coords.latitude + (Math.random() - 0.5) * 0.002, longitude: s.coords.longitude + (Math.random() - 0.5) * 0.002 } };
          return s;
        });
        return { hostileSignals: updated };
      }),
      setHostileSignals: (signals) => set({ hostileSignals: signals }),
      triggerRift: (coords, biome) => set((state) => ({ hostileSignals: [...state.hostileSignals, { id: `rift-${Date.now()}`, coords, biome, type: 'Boss', expiresAt: Date.now() + 15 * 60 * 1000 }], globalNotification: [...state.globalNotification, { id: `rift-notif-${Date.now()}`, title: 'FRACTURE RIFT DETECTED', message: 'A massive energy spike has manifested nearby. A high-level entity is crossing over. Duration: 15m.', type: 'Rift' }] })),
      setNotification: (notif) => set((state) => ({ globalNotification: notif ? [...state.globalNotification, notif] : state.globalNotification })),
      removeNotification: (id) => set((state) => ({ globalNotification: state.globalNotification.filter(n => n.id !== id) })),
      setErrorNotification: (error) => set((state) => ({ errorNotification: error ? [...state.errorNotification, { ...error, id: `error-${Date.now()}-${Math.random()}`, type: 'Warning' as const }] : state.errorNotification })),
      removeErrorNotification: (id) => set((state) => ({ errorNotification: state.errorNotification.filter(e => e.id !== id) })),
      setHomeCity: (city, location) => set({ homeCityName: city, playerLocation: location, sanctuaryLocation: location, hasSetHomeCity: true }),
      triggerSaving: () => {
        set({ isSaving: true });
        setTimeout(() => set({ isSaving: false }), 2000);
      },
      cleanupZones: () => set({ discoveredZones: {}, hostileSignals: [] }),
      resetStore: () => set({
        playerLocation: INITIAL_LOCATION,
        level: 1, xp: 0, maxXp: 100, hp: 100, maxHp: 100, mana: 20, maxMana: 20, gold: 0, attack: BASE_ATTACK, defense: BASE_DEFENSE,
        equipment: { weapon: null, armor: null, boots: null }, inventory: [], skills: [], reputation: INITIAL_REPUTATION,
        discoveredZones: {}, activeQuests: [], hostileSignals: [], bestiary: {},
        tutorialProgress: { currentStep: 0, hasLookedAround: false, hasTriedToRemember: false, isTutorialActive: true },
        tutorialMarker: { coords: { latitude: INITIAL_LOCATION.latitude + 0.00225, longitude: INITIAL_LOCATION.longitude }, label: "Glowing Blue Orb" },
        tutorialCoords: { dungeon: { latitude: -37.84405, longitude: 144.84356 }, settlement: { latitude: -37.828, longitude: 144.847 } },
        choicesLog: [], enrolledFaction: null, specialization: null, setBonus: null, globalNotification: [], errorNotification: [], playerName: "Traveller",
        hasSetHomeCity: false, homeCityName: "", sanctuaryLocation: INITIAL_LOCATION, isSaving: false, isInSettlement: false, isTutorialComplete: false, dungeonModifiers: [], activeZoneContext: null,
        settings: { musicEnabled: true, tempUnit: 'Celsius' },
      }),
      updateTutorial: (progress) => set((state) => ({ tutorialProgress: { ...state.tutorialProgress, ...progress } })),
      clearTutorialMarker: () => set({ tutorialMarker: null }),
      logChoice: (choice) => set((state) => ({ choicesLog: [...state.choicesLog, choice] })),
    }),
    {
      name: 'aeternis-player-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => AsyncStorage.getItem(name),
        setItem: (name, value) => AsyncStorage.setItem(name, value),
        removeItem: (name) => AsyncStorage.removeItem(name),
      })),
    }
  )
);
