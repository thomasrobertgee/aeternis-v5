import { create } from 'zustand';
import { BiomeType } from './BiomeMapper';
import { usePlayerStore } from './usePlayerStore';

export interface CombatLog {
  id: string;
  message: string;
  type: 'player' | 'enemy' | 'system';
}

interface CombatState {
  // Stats
  playerHp: number;
  maxPlayerHp: number;
  playerMana: number;
  maxPlayerMana: number;
  enemyHp: number;
  maxEnemyHp: number;
  enemyName: string;
  sourceId?: string; // Track which map signal this enemy belongs to
  damageModifier: number; // For weather effects
  biome?: BiomeType;
  
  // State
  isInCombat: boolean;
  isPlayerTurn: boolean;
  turnCount: number;
  combatLogs: CombatLog[];

  // Actions
  initiateCombat: (enemyName: string, enemyMaxHp: number, playerHp: number, maxPlayerHp: number, playerMana: number, maxPlayerMana: number, sourceId?: string, damageModifier?: number, biome?: BiomeType) => void;
  updateHp: (target: 'player' | 'enemy', amount: number) => void;
  updateMana: (amount: number) => void;
  nextTurn: () => void;
  addLog: (message: string, type: 'player' | 'enemy' | 'system') => void;
  endCombat: () => void;
}

export const useCombatStore = create<CombatState>((set) => ({
  playerHp: 100,
  maxPlayerHp: 100,
  playerMana: 50,
  maxPlayerMana: 50,
  enemyHp: 0,
  maxEnemyHp: 0,
  enemyName: '',
  sourceId: undefined,
  damageModifier: 1.0,
  biome: undefined,
  
  isInCombat: false,
  isPlayerTurn: true,
  turnCount: 1,
  combatLogs: [],

  initiateCombat: (enemyName, enemyMaxHp, playerHp, maxPlayerHp, playerMana, maxPlayerMana, sourceId, damageModifier = 1.0, biome) => set({
    enemyName,
    enemyHp: enemyMaxHp,
    maxEnemyHp: enemyMaxHp,
    playerHp: playerHp,
    maxPlayerHp: maxPlayerHp,
    playerMana: playerMana,
    maxPlayerMana: maxPlayerMana,
    sourceId,
    damageModifier,
    biome,
    isInCombat: true,
    isPlayerTurn: true,
    turnCount: 1,
    combatLogs: [{
      id: Math.random().toString(),
      message: `A ${enemyName} manifests from the static!`,
      type: 'system'
    }],
  }),

  updateHp: (target, amount) => set((state) => {
    if (target === 'player') {
      const newHp = Math.max(0, Math.min(state.maxPlayerHp, state.playerHp + amount));
      usePlayerStore.getState().setStats({ hp: newHp });
      return { playerHp: newHp };
    } else {
      const newHp = Math.max(0, Math.min(state.maxEnemyHp, state.enemyHp + amount));
      return { enemyHp: newHp };
    }
  }),

  updateMana: (amount) => set((state) => {
    const newMana = Math.max(0, Math.min(state.maxPlayerMana, state.playerMana + amount));
    usePlayerStore.getState().setStats({ mana: newMana });
    return { playerMana: newMana };
  }),

  nextTurn: () => set((state) => ({
    isPlayerTurn: !state.isPlayerTurn,
    turnCount: !state.isPlayerTurn ? state.turnCount + 1 : state.turnCount
  })),

  addLog: (message, type) => set((state) => ({
    combatLogs: [
      { id: Math.random().toString(), message, type },
      ...state.combatLogs,
    ].slice(0, 50), // Keep last 50 logs
  })),

  endCombat: () => set({
    isInCombat: false,
    enemyName: '',
    enemyHp: 0,
    combatLogs: [],
    sourceId: undefined,
    damageModifier: 1.0,
    biome: undefined,
    isPlayerTurn: true,
    turnCount: 1
  }),
}));
