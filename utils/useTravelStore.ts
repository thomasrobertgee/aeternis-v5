import { create } from 'zustand';

interface TravelState {
  isTraveling: boolean;
  travelTimeRemaining: number; // in seconds
  destinationName: string | null;
  destinationCoords: { latitude: number; longitude: number } | null;
  
  // Actions
  startTravel: (destination: string, coords: { latitude: number; longitude: number }, durationSeconds: number) => void;
  tickTravel: () => void;
  completeTravel: () => void;
}

export const useTravelStore = create<TravelState>((set, get) => ({
  isTraveling: false,
  travelTimeRemaining: 0,
  destinationName: null,
  destinationCoords: null,

  startTravel: (destination, coords, durationSeconds) => set({
    isTraveling: true,
    travelTimeRemaining: durationSeconds,
    destinationName: destination,
    destinationCoords: coords
  }),

  tickTravel: () => {
    const { travelTimeRemaining, isTraveling } = get();
    if (!isTraveling) return;

    if (travelTimeRemaining <= 1) {
      // Don't clear coords yet, component might need them for the final jump
      set({ isTraveling: false, travelTimeRemaining: 0 });
    } else {
      set({ travelTimeRemaining: travelTimeRemaining - 1 });
    }
  },

  completeTravel: () => set({
    isTraveling: false,
    travelTimeRemaining: 0,
    destinationName: null,
    destinationCoords: null
  }),
}));
