import { create } from 'zustand';

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
  
  // State
  isInCombat: boolean;
  isPlayerTurn: boolean;
  turnCount: number;
  combatLogs: CombatLog[];

  // Actions
  initiateCombat: (enemyName: string, enemyMaxHp: number, playerHp: number, playerMana: number, sourceId?: string, damageModifier?: number) => void;
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
  
  isInCombat: false,
  isPlayerTurn: true,
  turnCount: 1,
  combatLogs: [],

  initiateCombat: (enemyName, enemyMaxHp, playerHp, playerMana, sourceId, damageModifier = 1.0) => set({
    enemyName,
    enemyHp: enemyMaxHp,
    maxEnemyHp: enemyMaxHp,
    playerHp: playerHp,
    maxPlayerHp: playerHp,
    playerMana: playerMana,
    maxPlayerMana: playerMana,
    sourceId,
    damageModifier,
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
      return { playerHp: newHp };
    } else {
      const newHp = Math.max(0, Math.min(state.maxEnemyHp, state.enemyHp + amount));
      return { enemyHp: newHp };
    }
  }),

  updateMana: (amount) => set((state) => ({
    playerMana: Math.max(0, Math.min(state.maxPlayerMana, state.playerMana + amount))
  })),

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
    damageModifier: 1.0
  }),
}));
