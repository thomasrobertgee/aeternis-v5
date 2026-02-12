import { usePlayerStore } from './usePlayerStore';

export interface DialogueOption {
  text: string;
  next: string;
}

export interface DialogueAction {
  type: 'UPDATE_REPUTATION' | 'GIVE_ITEM';
  factionId?: string;
  value?: number;
  itemId?: string;
}

export interface DialogueNode {
  text: string;
  options?: DialogueOption[];
  actions?: DialogueAction[];
  isEnd?: boolean;
}

export interface DialogueTree {
  id: string;
  nodes: Record<string, DialogueNode>;
}

export const useDialogueSystem = () => {
  const { updateReputation } = usePlayerStore();

  const handleAction = (action: DialogueAction) => {
    switch (action.type) {
      case 'UPDATE_REPUTATION':
        if (action.factionId && action.value !== undefined) {
          updateReputation(action.factionId, action.value);
        }
        break;
      // Future: handle GIVE_ITEM
    }
  };

  return { handleAction };
};
