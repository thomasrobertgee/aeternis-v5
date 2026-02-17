import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, DevSettings } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../utils/usePlayerStore';
import { useCombatStore } from '../utils/useCombatStore';
import { User, X, Trash2, ShieldAlert } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const PlayerHeader = () => {
  const player = usePlayerStore();
  const combat = useCombatStore();
  const resetStore = usePlayerStore((state) => state.resetStore);
  const [showProfile, setShowProfile] = useState(false);

  // Use combat stats if in battle, otherwise use global player stats
  const currentHp = combat.isInCombat ? combat.playerHp : player.hp;
  const maxHp = combat.isInCombat ? combat.maxPlayerHp : player.maxHp;
  const currentMana = combat.isInCombat ? combat.playerMana : player.mana;
  const maxMana = combat.isInCombat ? combat.maxPlayerMana : player.maxMana;

  const handleWipeData = () => {
    Alert.alert(
      "Purge Synchronization",
      "This will permanently delete all character progress and reload the Fracture from Altona North.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Wipe All Data", 
          style: "destructive",
          onPress: async () => {
            try {
              // 1. Reset in-memory store immediately
              resetStore();
              
              // 2. Clear persistence
              await AsyncStorage.clear();
              
              // 3. Force reload using DevSettings (most reliable in development)
              DevSettings.reload();
              
              // Fallback for standalone builds
              try {
                await Updates.reloadAsync();
              } catch (e) {
                setShowProfile(false);
              }
            } catch (e) {
              console.error("Wipe failed", e);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="bg-zinc-950 border-b border-zinc-900">
      {/* Level / XP Bar Overlay */}
      <View className="h-1 bg-zinc-900 w-full overflow-hidden">
        <View className="h-full bg-cyan-400" style={{ width: `${(player.xp / player.maxXp) * 100}%` }} />
      </View>

      <View className="px-4 py-3 flex-row justify-between items-center">
        {/* Level & Profile Button */}
        <TouchableOpacity 
          onPress={() => setShowProfile(true)}
          activeOpacity={0.7}
          className="mr-4 items-center justify-center bg-zinc-900 w-10 h-10 rounded-xl border border-zinc-800"
        >
          <Text className="text-zinc-500 text-[8px] font-black uppercase">LVL</Text>
          <Text className="text-white font-black text-sm">{player.level}</Text>
        </TouchableOpacity>

        {/* Profile Modal Overlay */}
        <Modal
          visible={showProfile}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowProfile(false)}
        >
          <View style={StyleSheet.absoluteFill} className="bg-black/80 items-center justify-center p-6">
            <Animated.View 
              entering={FadeIn.duration(300)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 shadow-2xl"
            >
              <View className="flex-row justify-between items-start mb-8">
                <View className="bg-cyan-500/10 p-4 rounded-3xl border border-cyan-500/20">
                  <User size={32} color="#06b6d4" />
                </View>
                <TouchableOpacity 
                  onPress={() => setShowProfile(false)}
                  className="bg-zinc-800 p-2 rounded-full"
                >
                  <X size={20} color="#71717a" />
                </TouchableOpacity>
              </View>

              <Text className="text-white text-3xl font-black mb-1">Traveller Profile</Text>
              <Text className="text-zinc-500 font-bold uppercase tracking-[4px] text-[10px] mb-8">
                Fracture Synchronization Active
              </Text>

              <View className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8">
                <View className="flex-row justify-between mb-4">
                  <Text className="text-zinc-500 font-bold">Current Sector</Text>
                  <Text className="text-white font-black">{player.homeCityName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-zinc-500 font-bold">Aether-Level</Text>
                  <Text className="text-cyan-400 font-black">Grade {player.level}</Text>
                </View>
              </View>

              <View className="space-y-3">
                <TouchableOpacity 
                  onPress={handleWipeData}
                  className="bg-red-950/20 border border-red-500/40 h-16 rounded-2xl flex-row items-center justify-center mb-3"
                >
                  <Trash2 size={18} color="#ef4444" className="mr-3" />
                  <Text className="text-red-500 font-black text-xs uppercase tracking-[4px]">Reset All Data</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setShowProfile(false)}
                  className="bg-zinc-800 h-16 rounded-2xl items-center justify-center"
                >
                  <Text className="text-zinc-400 font-black text-xs uppercase tracking-[4px]">Close Console</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Health */}
        <View className="flex-1">
          <Text className="text-emerald-500 text-[8px] font-bold uppercase tracking-widest">Vitality</Text>
          <View className="h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
            <View className="h-full bg-emerald-500" style={{ width: `${(currentHp / maxHp) * 100}%` }} />
          </View>
          <Text className="text-zinc-400 text-[8px] mt-0.5 font-mono">{currentHp}/{maxHp}</Text>
        </View>

        {/* Mana */}
        <View className="flex-1 mx-6">
          <Text className="text-cyan-500 text-[8px] font-bold uppercase tracking-widest">Imaginum</Text>
          <View className="h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
            <View className="h-full bg-cyan-500" style={{ width: `${(currentMana / maxMana) * 100}%` }} />
          </View>
          <Text className="text-zinc-400 text-[8px] mt-0.5 font-mono">{currentMana}/{maxMana}</Text>
        </View>

        {/* Gold */}
        <View className="items-end">
          <Text className="text-amber-500 text-[8px] font-bold uppercase tracking-widest">Aetium</Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-white font-black text-sm">{player.gold.toLocaleString()}</Text>
            <Text className="text-amber-500 ml-1 text-xs">A</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlayerHeader;
