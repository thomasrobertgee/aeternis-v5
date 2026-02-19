import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { usePlayerStore } from '../utils/usePlayerStore';
import { Scroll, CheckCircle2, Gift, X, Sparkles, Trophy } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const QuestTracker = () => {
  const { activeQuests, completeQuest, enrolledFaction } = usePlayerStore();
  const [showDetails, setShowDetails] = useState(false);

  if (activeQuests.length === 0) return null;

  const handleComplete = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeQuest(id);
  };

  const getRewardHint = () => {
    if (enrolledFaction === 'the-cogwheel') return 'Tech/Scrap Reward';
    if (enrolledFaction === 'the-verdant') return 'Organic/Healing Reward';
    return null;
  };

  const rewardHint = getRewardHint();

  return (
    <View className="absolute top-24 right-4 w-48 z-10">
      {activeQuests.map((quest, index) => (
        <Animated.View 
          key={quest.id}
          entering={FadeInRight.delay(1000 + index * 200)}
        >
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setShowDetails(true)}
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

            {!quest.isCompleted ? (
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
            ) : (
              <TouchableOpacity 
                onPress={() => handleComplete(quest.id)}
                activeOpacity={0.7}
                className="bg-emerald-500/20 border border-emerald-500/40 py-2 rounded-xl flex-row items-center justify-center"
              >
                <Gift size={10} color="#10b981" className="mr-2" />
                <Text className="text-emerald-500 font-black text-[8px] uppercase tracking-widest">Complete</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Quest Detail Modal */}
      <Modal
        visible={showDetails}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={StyleSheet.absoluteFill} className="bg-black/80 items-center justify-center p-6">
          <Animated.View 
            entering={FadeIn.duration(300)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 shadow-2xl"
          >
            <View className="flex-row justify-between items-start mb-8">
              <View className="bg-cyan-500/10 p-4 rounded-3xl border border-cyan-500/20">
                <Scroll size={32} color="#06b6d4" />
              </View>
              <TouchableOpacity 
                onPress={() => setShowDetails(false)}
                className="bg-zinc-800 p-2 rounded-full"
              >
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-3xl font-black mb-1">Active Objectives</Text>
            <Text className="text-zinc-500 font-bold uppercase tracking-[4px] text-[10px] mb-8">
              Current Fractal Missions
            </Text>

            <ScrollView className="max-h-[400px] mb-8" showsVerticalScrollIndicator={false}>
              {activeQuests.map((quest) => (
                <View key={quest.id} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-4">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-white font-bold text-lg flex-1">{quest.title}</Text>
                    {quest.isCompleted && (
                      <View className="bg-emerald-500/20 px-2 py-1 rounded-lg">
                        <Text className="text-emerald-500 text-[8px] font-black uppercase">Complete</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-zinc-400 text-xs italic leading-5 mb-6">
                    "{quest.description}"
                  </Text>

                  <View className="flex-row gap-3 mb-6">
                    <View className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 flex-row items-center">
                      <Sparkles size={12} color="#06b6d4" className="mr-2" />
                      <Text className="text-cyan-400 font-bold text-xs">+{quest.rewardXp} XP</Text>
                    </View>
                    <View className="bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 flex-row items-center">
                      <Trophy size={12} color="#f59e0b" className="mr-2" />
                      <Text className="text-amber-500 font-bold text-xs">{quest.rewardGold} A</Text>
                    </View>
                  </View>

                  {!quest.isCompleted ? (
                    <View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-zinc-500 font-bold text-[10px] uppercase">Synchronization Progress</Text>
                        <Text className="text-cyan-400 font-mono text-xs">{Math.round((quest.currentCount / quest.targetCount) * 100)}%</Text>
                      </View>
                      <View className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <View 
                          className="h-full bg-cyan-500 shadow-lg shadow-cyan-500" 
                          style={{ width: `${(quest.currentCount / quest.targetCount) * 100}%` }} 
                        />
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => {
                        handleComplete(quest.id);
                        if (activeQuests.length <= 1) setShowDetails(false);
                      }}
                      className="bg-emerald-600 h-12 rounded-xl flex-row items-center justify-center"
                    >
                      <Gift size={16} color="#fff" className="mr-2" />
                      <Text className="text-white font-black text-xs uppercase tracking-[4px]">Claim Reward</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              onPress={() => setShowDetails(false)}
              className="bg-zinc-800 h-16 rounded-2xl items-center justify-center"
            >
              <Text className="text-zinc-400 font-black text-xs uppercase tracking-[4px]">Close Objectives</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default QuestTracker;
