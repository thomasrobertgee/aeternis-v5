export enum BehaviourTrait {
  Violence = 'Violence',
  Curiosity = 'Curiosity',
  Courage = 'Courage',
  Pragmatism = 'Pragmatism',
  Empathy = 'Empathy'
}

export interface BehaviourState {
  traits: Record<BehaviourTrait, number>;
  totalActionsTracked: number;
}
