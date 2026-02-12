import React from 'react';
import { View, Text } from 'react-native';
import { usePlayerStore } from '../utils/usePlayerStore';
import { Scroll, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

const QuestTracker = () => {
  const { activeQuests } = usePlayerStore();

  if (activeQuests.length === 0) return null;

  return (
    <View className="absolute top-48 right-4 w-48 z-10">
      {activeQuests.map((quest, index) => (
        <Animated.View 
          key={quest.id}
          entering={FadeInRight.delay(1000 + index * 200)}
          className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl mb-3 shadow-xl"
        >
          <View className="flex-row items-center mb-1.5">
            <Scroll size={12} color="#06b6d4" className="mr-2" />
            <Text className="text-white font-bold text-[10px] flex-1" numberOfLines={1}>
              {quest.title}
            </Text>
            {quest.isCompleted && <CheckCircle2 size={12} color="#10b981" />}
          </View>
          
          <Text className="text-zinc-500 text-[8px] leading-3 mb-2">
            {quest.description}
          </Text>

          {!quest.isCompleted && (
            <View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-zinc-400 text-[8px] font-bold">Progress</Text>
                <Text className="text-cyan-400 text-[8px] font-mono">{quest.currentCount} / {quest.targetCount}</Text>
              </View>
              <View className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-cyan-500" 
                  style={{ width: `${(quest.currentCount / quest.targetCount) * 100}%` }} 
                />
              </View>
            </View>
          )}

          {quest.isCompleted && (
            <View className="bg-emerald-500/10 border border-emerald-500/20 py-1 rounded-lg items-center">
              <Text className="text-emerald-500 font-black text-[8px] uppercase tracking-widest">Ready to Turn In</Text>
            </View>
          )}
        </Animated.View>
      ))}
    </View>
  );
};

export default QuestTracker;
