import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { ChevronRight, Sparkles, MessageCircle, ArrowLeft, Footprints, Sword, Cloud } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  FadeInDown,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import DialogueView from './DialogueView';
import scavengerDialogue from '../assets/dialogue/cogwheel_scavenger.json';
import enrollmentDialogue from '../assets/dialogue/faction_enrollment.json';
import specializationDialogue from '../assets/dialogue/specialization_choice.json';

import { useCombatStore } from '../utils/useCombatStore';
import { usePlayerStore } from '../utils/usePlayerStore';
import { useRouter } from 'expo-router';
import { BiomeType } from '../utils/BiomeMapper';
import { getDeterministicEnemy } from '../utils/EnemyFactory';
import { getWeatherForSuburb, WEATHER_EFFECTS } from '../utils/WorldStateManager';

interface NarrativeViewProps {
  suburb: string;
  loreName: string;
  category: string;
  biome: BiomeType;
  description: string;
  onExit: () => void;
}

const NarrativeView = ({ suburb, loreName, category, biome, description, onExit }: NarrativeViewProps) => {
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const { level, enrolledFaction, specialization } = usePlayerStore();
  const { initiateCombat } = useCombatStore();
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scanlinePos = useSharedValue(-100);

  const weather = useMemo(() => getWeatherForSuburb(suburb), [suburb]);
  const weatherEffect = WEATHER_EFFECTS[weather];

  const startSimulatedBattle = () => {
    const enemy = getDeterministicEnemy(suburb, biome);
    initiateCombat(enemy.name, enemy.maxHp, usePlayerStore.getState().hp, usePlayerStore.getState().mana, "");
    router.push('/battle');
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });

    // 1. Faction Enrollment Event (Level 5+)
    if (level >= 5 && !enrolledFaction) {
      setActiveDialogue(enrollmentDialogue);
    } 
    // 2. Specialization Choice Event (Level 10+)
    else if (level >= 10 && !specialization) {
      setActiveDialogue(specializationDialogue);
    }

    // Animate a single moving scanline for retro feel
    scanlinePos.value = withRepeat(
      withTiming(Dimensions.get('window').height + 100, { duration: 4000 }),
      -1,
      false
    );
  }, [level, enrolledFaction, specialization]);

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlinePos.value }],
  }));

  if (activeDialogue) {
    return (
      <DialogueView 
        dialogueData={activeDialogue} 
        onExit={() => setActiveDialogue(null)} 
      />
    );
  }

  return (
    <View className="flex-1 bg-zinc-950">
      {/* --- Visual FX Overlays --- */}
      <View className="absolute inset-0 z-50 pointer-events-none" style={StyleSheet.absoluteFill}>
        <View className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/90 to-transparent" />
        <View className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 to-transparent" />
        <View className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-black/70 to-transparent" />
        <View className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-black/70 to-transparent" />
      </View>

      <Animated.View 
        style={[
          { height: 4, width: '100%', backgroundColor: 'rgba(6, 182, 212, 0.08)', zIndex: 60, position: 'absolute', top: 0 },
          scanlineStyle
        ]} 
        pointerEvents="none" 
      />

      <View className="absolute inset-0 z-[55] opacity-[0.04] bg-zinc-400 pointer-events-none" />

      <View className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-cyan-900/10 to-transparent" />
      
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <View className="flex-row justify-between items-start">
            <View>
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse mr-2" />
                <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-[10px]">
                  Fracture Synchronized
                </Text>
              </View>
              
              <Text className="text-white text-4xl font-black tracking-tight mb-1">
                {loreName}
              </Text>
              <Text className="text-zinc-500 text-sm font-medium uppercase tracking-[2px] mb-8">
                {suburb} • {category} Realm
              </Text>
            </View>

            {/* Weather Overlay in Narrative */}
            <View className="bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-2xl items-center">
              <Cloud size={18} color="#94a3b8" className="mb-1" />
              <Text className="text-zinc-400 font-black text-[8px] uppercase tracking-tighter">{weather}</Text>
            </View>
          </View>
        </Animated.View>

        {/* High-Quality Narrative Text Area */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(800)}
          className="bg-zinc-900/40 border-l-2 border-cyan-500/30 p-8 rounded-tr-3xl rounded-br-3xl mb-8 shadow-inner"
        >
          <Text className="text-cyan-50/90 text-xl leading-[38px] font-serif italic">
            {description}
          </Text>
          
          <View className="mt-6 flex-row justify-end">
            <Sparkles size={16} color="#164e63" />
          </View>
        </Animated.View>

        {/* Environmental Modifiers */}
        <Animated.View 
          entering={FadeInDown.delay(450).duration(600)}
          className="bg-zinc-950/50 border border-zinc-800 p-4 rounded-2xl mb-8 flex-row items-center"
        >
          <View className="bg-cyan-500/10 p-2 rounded-xl mr-4 border border-cyan-500/20">
            <Cloud size={16} color="#06b6d4" />
          </View>
          <View className="flex-1">
            <Text className="text-zinc-500 font-black text-[8px] uppercase tracking-widest mb-1">Environmental Analysis</Text>
            <Text className="text-zinc-400 text-[11px] leading-4 italic">
              "{weatherEffect.description}"
            </Text>
          </View>
        </Animated.View>

        {/* Action List */}
        <View className="space-y-4">
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-4 px-1">
              Determine Your Path
            </Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(700).duration(500)}>
            <TouchableOpacity 
              activeOpacity={0.7}
              className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex-row justify-between items-center mb-4"
            >
              <View className="flex-row items-center">
                <View className="bg-amber-500/10 p-2 rounded-lg mr-4">
                  <Sparkles size={20} color="#f59e0b" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Scavenge Ruins</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">Search for Aetium and relics</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#3f3f46" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(500)}>
            <TouchableOpacity 
              onPress={() => setActiveDialogue(scavengerDialogue)}
              activeOpacity={0.7}
              className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex-row justify-between items-center mb-4"
            >
              <View className="flex-row items-center">
                <View className="bg-blue-500/10 p-2 rounded-lg mr-4">
                  <MessageCircle size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Seek Survivors</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">Attempt to communicate</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#3f3f46" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(850).duration(500)}>
            <TouchableOpacity 
              onPress={startSimulatedBattle}
              activeOpacity={0.7}
              className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl flex-row justify-between items-center mb-4"
            >
              <View className="flex-row items-center">
                <View className="bg-red-500/10 p-2 rounded-lg mr-4">
                  <Sword size={20} color="#ef4444" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Purge Fracture</Text>
                  <Text className="text-red-900/60 text-xs mt-0.5">Engage hostile manifestations</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#7f1d1d" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(900).duration(500)}>
            <TouchableOpacity 
              onPress={onExit}
              activeOpacity={0.7}
              className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex-row justify-between items-center"
            >
              <View className="flex-row items-center">
                <View className="bg-zinc-500/10 p-2 rounded-lg mr-4">
                  <Footprints size={20} color="#71717a" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Move On</Text>
                  <Text className="text-zinc-500 text-xs mt-0.5">Return to the overworld map</Text>
                </View>
              </View>
              <ArrowLeft size={18} color="#3f3f46" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </View>
  );
};

export default NarrativeView;
