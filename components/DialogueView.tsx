import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDialogueSystem, DialogueTree } from '../utils/DialogueSystem';

import { useRouter } from 'expo-router';
import { useCombatStore } from '../utils/useCombatStore';

interface DialogueViewProps {
  dialogueData: DialogueTree;
  onExit: () => void;
}

const DialogueView = ({ dialogueData, onExit }: DialogueViewProps) => {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const { handleAction } = useDialogueSystem();
  const { initiateCombat } = useCombatStore();
  const router = useRouter();
  
  const currentNode = dialogueData.nodes[currentNodeId];

  useEffect(() => {
    if (currentNode.actions) {
      currentNode.actions.forEach(handleAction);
    }
    
    // Check for combat trigger
    if (currentNodeId === 'battle_start') {
      initiateCombat('Cogwheel Scavenger', 60, 100, 50);
      router.push('/battle');
    }
  }, [currentNodeId]);

  const handleOptionSelect = (nextId: string) => {
    setCurrentNodeId(nextId);
  };

  return (
    <View className="flex-1 bg-zinc-950 p-6 pt-12">
      <Animated.View entering={FadeInDown.duration(600)} className="mb-10">
        <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-[10px] mb-2">
          Conversation Active
        </Text>
        <View className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-inner">
          <Text className="text-white text-lg leading-7 font-serif">
            {currentNode.text}
          </Text>
        </View>
      </Animated.View>

      <ScrollView className="space-y-4">
        {currentNode.options?.map((option, index) => (
          <Animated.View 
            key={index} 
            entering={FadeInDown.delay(200 + index * 100).duration(500)}
          >
            <TouchableOpacity 
              onPress={() => handleOptionSelect(option.next)}
              className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex-row justify-between items-center mb-4"
            >
              <Text className="text-cyan-100 font-medium flex-1 mr-4">{option.text}</Text>
              <ChevronRight size={18} color="#0891b2" />
            </TouchableOpacity>
          </Animated.View>
        ))}

        {currentNode.isEnd && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <TouchableOpacity 
              onPress={onExit}
              className="bg-zinc-800 py-5 rounded-2xl items-center flex-row justify-center"
            >
              <ArrowLeft size={18} color="#71717a" className="mr-2" />
              <Text className="text-zinc-400 font-bold uppercase tracking-widest text-xs">End Interaction</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

export default DialogueView;
