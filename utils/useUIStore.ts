import { create } from 'zustand';
import { WorldEvent } from './ZoneEventManager';

interface UIState {
  isSaving: boolean;
  activeWorldEvent: WorldEvent | null;
  heroTab: 'Stats' | 'Skills' | 'Quests' | 'Codex';
  pendingMapAction: { type: 'center', coords: { latitude: number, longitude: number }, zoom?: number } | null;
  triggerSaving: () => void;
  setWorldEvent: (event: WorldEvent | null) => void;
  setHeroTab: (tab: 'Stats' | 'Skills' | 'Quests' | 'Codex') => void;
  setPendingMapAction: (action: UIState['pendingMapAction']) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSaving: false,
  activeWorldEvent: null,
  heroTab: 'Stats',
  pendingMapAction: null,
  triggerSaving: () => {
    if (get().isSaving) return;
    set({ isSaving: true });
    setTimeout(() => set({ isSaving: false }), 1500);
  },
  setWorldEvent: (event) => set({ activeWorldEvent: event }),
  setHeroTab: (tab) => set({ heroTab: tab }),
  setPendingMapAction: (action) => set({ pendingMapAction: action }),
}));
