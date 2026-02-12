import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { ChevronRight, Sparkles, MessageCircle, ArrowLeft, Footprints, Sword } from 'lucide-react-native';
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

import { useCombatStore } from '../utils/useCombatStore';
import { useRouter } from 'expo-router';
import { BiomeType } from '../utils/BiomeMapper';
import { getDeterministicEnemy } from '../utils/EnemyFactory';

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
  const { initiateCombat } = useCombatStore();
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scanlinePos = useSharedValue(-100);

  const startSimulatedBattle = () => {
    const enemy = getDeterministicEnemy(suburb, biome);
    initiateCombat(enemy.name, enemy.maxHp, 100, 50);
    router.push('/battle');
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });

    // Animate a single moving scanline for retro feel
    scanlinePos.value = withRepeat(
      withTiming(Dimensions.get('window').height + 100, { duration: 4000 }),
      -1,
      false
    );
  }, []);

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
      {/* Global Vignette */}
      <View className="absolute inset-0 z-50 pointer-events-none" style={StyleSheet.absoluteFill}>
        <View className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/90 to-transparent" />
        <View className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 to-transparent" />
        <View className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-black/70 to-transparent" />
        <View className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-black/70 to-transparent" />
      </View>

      {/* Animated Scanline */}
      <Animated.View 
        style={[
          { height: 4, width: '100%', backgroundColor: 'rgba(6, 182, 212, 0.08)', zIndex: 60, position: 'absolute', top: 0 },
          scanlineStyle
        ]} 
        pointerEvents="none" 
      />

      {/* Subtle Static Noise / CRT Flicker */}
      <View className="absolute inset-0 z-[55] opacity-[0.04] bg-zinc-400 pointer-events-none" />

      {/* Immersive Background Decor */}
      <View className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-cyan-900/10 to-transparent" />
      
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb / Status */}
        <Animated.View entering={FadeInDown.duration(600)}>
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
        </Animated.View>

        {/* High-Quality Narrative Text Area */}
        <Animated.View 
          entering={FadeInDown.delay(300).duration(800)}
          className="bg-zinc-900/40 border-l-2 border-cyan-500/30 p-8 rounded-tr-3xl rounded-br-3xl mb-12 shadow-inner"
        >
          <Text className="text-cyan-50/90 text-xl leading-[38px] font-serif italic">
            {description}
          </Text>
          
          <View className="mt-6 flex-row justify-end">
            <Sparkles size={16} color="#164e63" />
          </View>
        </Animated.View>

        {/* Action List */}
        <View className="space-y-4">
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-4 px-1">
              Determine Your Path
            </Text>
          </Animated.View>
          
          {/* Action: Scavenge */}
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

          {/* Action: Talk */}
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

          {/* Action: Battle */}
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

          {/* Action: Move On / Exit */}
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

      {/* Subtle Bottom Vignette */}
      <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </View>
  );
};

export default NarrativeView;
