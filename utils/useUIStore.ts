import { create } from 'zustand';

interface UIState {
  isSaving: boolean;
  triggerSaving: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSaving: false,
  triggerSaving: () => {
    if (get().isSaving) return;
    set({ isSaving: true });
    setTimeout(() => set({ isSaving: false }), 1500);
  },
}));
