import { BehaviourTrait } from '../types/behaviour';

export interface BehaviourImpact {
  trait: BehaviourTrait;
  value: number;
}

export const BehaviourActionMap: Record<string, BehaviourImpact> = {
  EXPLORE_NEW_ZONE: { trait: BehaviourTrait.Curiosity, value: 5 },
  FLEE_COMBAT_LOW_HP: { trait: BehaviourTrait.Pragmatism, value: 3 },
  FLEE_COMBAT_HIGH_HP: { trait: BehaviourTrait.Courage, value: -5 },
  DEFEAT_BOSS: { trait: BehaviourTrait.Courage, value: 10 },
  INITIATE_ENCOUNTER: { trait: BehaviourTrait.Violence, value: 2 },
  COMPLETE_FIRST_QUEST: { trait: BehaviourTrait.Courage, value: 5 },
};
