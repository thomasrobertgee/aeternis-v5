import { create } from 'zustand';
import { WorldEvent } from './ZoneEventManager';

interface UIState {
  isSaving: boolean;
  activeWorldEvent: WorldEvent | null;
  triggerSaving: () => void;
  setWorldEvent: (event: WorldEvent | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSaving: false,
  activeWorldEvent: null,
  triggerSaving: () => {
    if (get().isSaving) return;
    set({ isSaving: true });
    setTimeout(() => set({ isSaving: false }), 1500);
  },
  setWorldEvent: (event) => set({ activeWorldEvent: event }),
}));
