import { create } from 'zustand';
import { WorldEvent } from './ZoneEventManager';

interface UIState {
  isSaving: boolean;
  activeWorldEvent: WorldEvent | null;
  heroTab: 'Stats' | 'Skills' | 'Quests' | 'Codex';
  triggerSaving: () => void;
  setWorldEvent: (event: WorldEvent | null) => void;
  setHeroTab: (tab: 'Stats' | 'Skills' | 'Quests' | 'Codex') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSaving: false,
  activeWorldEvent: null,
  heroTab: 'Stats',
  triggerSaving: () => {
    if (get().isSaving) return;
    set({ isSaving: true });
    setTimeout(() => set({ isSaving: false }), 1500);
  },
  setWorldEvent: (event) => set({ activeWorldEvent: event }),
  setHeroTab: (tab) => set({ heroTab: tab }),
}));
