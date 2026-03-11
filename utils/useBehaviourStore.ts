import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BehaviourTrait, BehaviourState } from '../types/behaviour';
import { BehaviourActionMap } from '../config/behaviourMap';

interface BehaviourActions {
  recordAction: (actionKey: string) => void;
  checkClassEmergence: () => void;
}

export const useBehaviourStore = create<BehaviourState & BehaviourActions>()(
  persist(
    (set, get) => ({
      traits: {
        [BehaviourTrait.Violence]: 0,
        [BehaviourTrait.Curiosity]: 0,
        [BehaviourTrait.Courage]: 0,
        [BehaviourTrait.Pragmatism]: 0,
        [BehaviourTrait.Empathy]: 0,
      },
      totalActionsTracked: 0,

      recordAction: (actionKey: string) => {
        const impact = BehaviourActionMap[actionKey];
        if (!impact) return;

        set((state) => {
          const newTraits = { ...state.traits };
          newTraits[impact.trait] += impact.value;
          return {
            traits: newTraits,
            totalActionsTracked: state.totalActionsTracked + 1,
          };
        });

        get().checkClassEmergence();
      },

      checkClassEmergence: () => {
        const { totalActionsTracked, traits } = get();
        if (totalActionsTracked === 100) {
          console.log('Threshold reached! Triggering AI class generation');
          console.log('Final Traits:', traits);
        }
      },
    }),
    {
      name: 'aeternis-behaviour-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
