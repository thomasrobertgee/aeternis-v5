import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useDungeonStore, DungeonChoice, DungeonModifier } from '../utils/useDungeonStore';
import { usePlayerStore } from '../utils/usePlayerStore';
import { useCombatStore } from '../utils/useCombatStore';
import { useRouter } from 'expo-router';
import { Sword, Package, Zap, Skull, Coffee, Flame, Shield, ChevronRight, Activity, Sparkles } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { getDeterministicEnemy, getBossByBiome } from '../utils/EnemyFactory';
import { BiomeType } from '../utils/BiomeMapper';

export default function DungeonScreen() {
  const router = useRouter();
  const dungeon = useDungeonStore();
  const player = usePlayerStore();
  const combat = useCombatStore();
  const [isProcessing, setIsActionProcessing] = useState(false);

  const currentStage = dungeon.currentStage;
  const choices = dungeon.stageChoices;

  // Sync modifiers to player store for global application (e.g. combat)
  useEffect(() => {
    player.setDungeonModifiers(dungeon.modifiers);
  }, [dungeon.modifiers]);

  // Dungeon death logic: handeled in battle.tsx but we should check here too just in case
  useEffect(() => {
    if (player.hp <= 0 && dungeon.isInsideDungeon) {
      dungeon.exitDungeon();
      router.replace('/(tabs)/explore');
    }
  }, [player.hp]);

  const handleChoice = async (choice: DungeonChoice) => {
    if (isProcessing) return;
    setIsActionProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (choice.type === 'Enemy' || (choice.type === 'Chest' && choice.isMimic)) {
      const enemyName = choice.isMimic ? 'Mimic Cache' : 'Dungeon Manifestation';
      const enemyHp = choice.isMimic ? 80 : 50 + (currentStage * 10);
      
      combat.initiateCombat(
        enemyName, 
        enemyHp, 
        player.hp, 
        player.maxHp, 
        player.mana, 
        player.maxMana, 
        `dungeon-stage-${currentStage}`,
        1.0,
        BiomeType.RUST_FIELDS // Use a default or pass from dungeon
      );
      router.push('/battle');
    } else if (choice.type === 'Chest') {
      // Free loot!
      const goldGain = 100 + (currentStage * 50);
      player.setStats({ gold: player.gold + goldGain });
      Alert.alert("Dungeon Cache", `You found ${goldGain} Aetium inside the container.`);
      dungeon.nextStage();
    } else if (choice.type === 'Altar') {
      const isBuff = Math.random() < 0.5;
      const pool = isBuff ? BUFF_POOL : DEBUFF_POOL;
      const mod = pool[Math.floor(Math.random() * pool.length)];
      
      dungeon.addModifier(mod);
      Alert.alert(
        isBuff ? "Altar Blessing" : "Altar Curse",
        `The obelisk shimmers. ${mod.name}: ${mod.type === 'buff' ? 'Granting' : 'Inflicting'} modifiers to your ${mod.stat}.`
      );
      dungeon.nextStage();
    }
    setIsActionProcessing(false);
  };

  const handleFixedStage = (type: 'Miniboss' | 'Rest' | 'Boss') => {
    if (isProcessing) return;
    setIsActionProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (type === 'Miniboss' || type === 'Boss') {
      const name = type === 'Miniboss' ? 'Sector Guardian' : 'THE VOID SOVEREIGN';
      const hp = type === 'Miniboss' ? 200 : 500;
      combat.initiateCombat(name, hp, player.hp, player.maxHp, player.mana, player.maxMana, `dungeon-${type.toLowerCase()}`);
      router.push('/battle');
    } else {
      player.rest();
      Alert.alert("Rest Area", "You find a moment of peace. Your Vitality and MP have been restored.");
      dungeon.nextStage();
    }
    setIsActionProcessing(false);
  };

  const renderStageContent = () => {
    if (currentStage === 5) {
      return (
        <Animated.View entering={FadeInDown} className="items-center py-10">
          <View className="bg-red-500/10 p-8 rounded-[40px] border-2 border-red-500/30 mb-8">
            <Skull size={64} color="#ef4444" />
          </View>
          <Text className="text-red-500 font-black text-xs uppercase tracking-[6px] mb-2">Stage 5: Miniboss</Text>
          <Text className="text-white text-3xl font-black text-center mb-6">The Sector Guardian</Text>
          <TouchableOpacity 
            onPress={() => handleFixedStage('Miniboss')}
            className="bg-red-600 px-12 py-5 rounded-2xl shadow-xl shadow-red-900/40"
          >
            <Text className="text-white font-black uppercase tracking-widest">Engage Guardian</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (currentStage === 6) {
      return (
        <Animated.View entering={FadeInDown} className="items-center py-10">
          <View className="bg-emerald-500/10 p-8 rounded-[40px] border-2 border-emerald-500/30 mb-8">
            <Coffee size={64} color="#10b981" />
          </View>
          <Text className="text-emerald-500 font-black text-xs uppercase tracking-[6px] mb-2">Stage 6: Safe Haven</Text>
          <Text className="text-white text-3xl font-black text-center mb-6">Restored Resonance</Text>
          <TouchableOpacity 
            onPress={() => handleFixedStage('Rest')}
            className="bg-emerald-600 px-12 py-5 rounded-2xl shadow-xl shadow-emerald-900/40"
          >
            <Text className="text-white font-black uppercase tracking-widest">Rest and Recover</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (currentStage === 10) {
      return (
        <Animated.View entering={FadeInDown} className="items-center py-10">
          <View className="bg-purple-500/10 p-8 rounded-[40px] border-2 border-purple-500/30 mb-8">
            <Flame size={64} color="#a855f7" />
          </View>
          <Text className="text-purple-500 font-black text-xs uppercase tracking-[6px] mb-2">Stage 10: Final Boss</Text>
          <Text className="text-white text-3xl font-black text-center mb-6">THE VOID SOVEREIGN</Text>
          <TouchableOpacity 
            onPress={() => handleFixedStage('Boss')}
            className="bg-purple-600 px-12 py-5 rounded-2xl shadow-xl shadow-purple-900/40"
          >
            <Text className="text-white font-black uppercase tracking-widest">Purge The Sovereign</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <View className="gap-4">
        {choices.map((choice, idx) => (
          <Animated.View key={choice.id} entering={FadeInDown.delay(idx * 100)}>
            <TouchableOpacity 
              onPress={() => handleChoice(choice)}
              className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[32px] flex-row items-center"
            >
              <View className={`p-4 rounded-2xl mr-5 border ${
                choice.type === 'Enemy' ? 'bg-red-500/10 border-red-500/20' :
                choice.type === 'Chest' ? 'bg-amber-500/10 border-amber-500/20' :
                'bg-cyan-500/10 border-cyan-500/20'
              }`}>
                {choice.type === 'Enemy' ? <Sword size={24} color="#ef4444" /> :
                 choice.type === 'Chest' ? <Package size={24} color="#f59e0b" /> :
                 <Zap size={24} color="#06b6d4" />}
              </View>
              <View className="flex-1">
                <Text className={`font-black text-[8px] uppercase tracking-widest mb-1 ${
                  choice.type === 'Enemy' ? 'text-red-500' :
                  choice.type === 'Chest' ? 'text-amber-500' :
                  'text-cyan-500'
                }`}>{choice.type}</Text>
                <Text className="text-white font-bold text-lg">{choice.title}</Text>
                <Text className="text-zinc-500 text-xs italic mt-1 leading-4">"{choice.description}"</Text>
              </View>
              <ChevronRight size={20} color="#3f3f46" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black px-6 pt-16">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-zinc-500 font-black text-[10px] uppercase tracking-[4px]">Dungeon Protocol</Text>
          <Text className="text-white text-3xl font-black">{dungeon.currentDungeonId || 'The Depths'}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert("Abandon Dungeon", "Are you sure you want to retreat? All progress will be lost.", [
              { text: "Stay" },
              { text: "Retreat", style: "destructive", onPress: () => { dungeon.exitDungeon(); router.replace('/(tabs)/explore'); } }
            ]);
          }}
          className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800"
        >
          <X size={20} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="mb-10">
        <View className="flex-row justify-between items-end mb-2 px-1">
          <Text className="text-cyan-500 font-bold text-[8px] uppercase tracking-widest">Progress</Text>
          <Text className="text-white font-mono text-[10px]">Stage {currentStage} / 10</Text>
        </View>
        <View className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <View 
            className="h-full bg-cyan-500 shadow-lg shadow-cyan-500" 
            style={{ width: `${(currentStage / 10) * 100}%` }} 
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {renderStageContent()}
        <View className="h-20" />
      </ScrollView>

      {/* Active Modifiers Bar */}
      {dungeon.modifiers.length > 0 && (
        <View className="absolute bottom-10 left-6 right-6 flex-row flex-wrap gap-2">
          {dungeon.modifiers.map(mod => (
            <View key={mod.id} className={`px-2 py-1 rounded-md border flex-row items-center ${mod.type === 'buff' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <Text className={`${mod.type === 'buff' ? 'text-emerald-400' : 'text-red-400'} font-bold text-[8px] uppercase tracking-widest`}>
                {mod.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const BUFF_POOL: Omit<DungeonModifier, 'id'>[] = [
  { name: 'Aether Resonance', type: 'buff', stat: 'attack', value: 1.2 },
  { name: 'Hardened Will', type: 'buff', stat: 'defense', value: 1.2 },
  { name: 'Vitality Surge', type: 'buff', stat: 'maxHp', value: 1.2 },
  { name: 'Mental Clarity', type: 'buff', stat: 'maxMana', value: 1.2 },
];

const DEBUFF_POOL: Omit<DungeonModifier, 'id'>[] = [
  { name: 'Static interference', type: 'debuff', stat: 'attack', value: 0.8 },
  { name: 'Brittle Form', type: 'debuff', stat: 'defense', value: 0.8 },
  { name: 'Energy Leak', type: 'debuff', stat: 'maxMana', value: 0.8 },
  { name: 'Fractured Shell', type: 'debuff', stat: 'maxHp', value: 0.8 },
];

function X({ size, color }: { size: number, color: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', width: size, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
    </View>
  );
}
