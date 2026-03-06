import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, DevSettings } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../utils/usePlayerStore';
import { useCombatStore } from '../utils/useCombatStore';
import { useDungeonStore } from '../utils/useDungeonStore';
import { User, X, Trash2, ShieldAlert, Settings, Music, Music2, Home, Flame } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import Animated, { FadeIn, SlideInDown, withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import SoundService from '../utils/SoundService';

const PlayerHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const player = usePlayerStore();
  const combat = useCombatStore();
  const dungeon = useDungeonStore();
  const resetStore = usePlayerStore((state) => state.resetStore);
  const [showProfile, setShowProfile] = useState(false);

  const isInBattleScreen = pathname === '/battle' || pathname === '/(tabs)/battle';
  const isInSettlementScreen = pathname === '/settlement' || pathname === '/(tabs)/settlement';
  const isInDungeonScreen = pathname === '/dungeon' || pathname === '/(tabs)/dungeon';
  
  const showBackToBattle = combat.isInCombat && !isInBattleScreen;
  const showBackToSettlement = player.isInSettlement && !isInSettlementScreen && !combat.isInCombat;
  const showBackToDungeon = dungeon.isInsideDungeon && !isInDungeonScreen && !combat.isInCombat;

  const battlePulse = useSharedValue(1);
  const settlementPulse = useSharedValue(1);
  const dungeonPulse = useSharedValue(1);

  useEffect(() => {
    if (showBackToBattle) {
      battlePulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [showBackToBattle]);

  useEffect(() => {
    if (showBackToSettlement) {
      settlementPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [showBackToSettlement]);

  useEffect(() => {
    if (showBackToDungeon) {
      dungeonPulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 900 }),
          withTiming(1, { duration: 900 })
        ),
        -1,
        true
      );
    }
  }, [showBackToDungeon]);

  const battleButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: battlePulse.value }],
  }));

  const settlementButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: settlementPulse.value }],
  }));

  const dungeonButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dungeonPulse.value }],
  }));

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
    <SafeAreaView edges={['top', 'left', 'right']} className="bg-zinc-950 border-b border-zinc-900">
      {/* Level / XP Bar Overlay */}
      <View className="h-1 bg-zinc-900 w-full overflow-hidden">
        <View className="h-full bg-cyan-400" style={{ width: `${(player.xp / player.maxXp) * 100}%` }} />
      </View>

      <View className="px-4 pt-2.5 pb-2 flex-row justify-between items-center">
        {/* Level & Profile Button */}
        <TouchableOpacity 
          onPress={() => setShowProfile(true)}
          activeOpacity={0.7}
          className="mr-4 items-center justify-center bg-zinc-900 w-10 h-10 rounded-xl border border-zinc-800"
        >
          <Text className="text-zinc-500 text-[8px] font-black uppercase">LVL</Text>
          <Text className="text-white font-black text-sm">{player.level}</Text>
        </TouchableOpacity>

        {showBackToBattle && (
          <Animated.View entering={FadeIn} style={battleButtonStyle} className="mr-4">
            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)/battle')}
              className="bg-red-600 px-3 py-2 rounded-xl border border-red-400 flex-row items-center"
              style={{
                shadowColor: '#7f1d1d', // red-900
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 5
              }}
            >
              <ShieldAlert size={12} color="#fff" className="mr-1.5" />
              <Text className="text-white font-black text-[8px] uppercase tracking-widest">
                {combat.showSummary ? 'Battle Summary' : 'In Battle'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showBackToSettlement && (
          <Animated.View entering={FadeIn} style={settlementButtonStyle} className="mr-4">
            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)/settlement')}
              className="bg-emerald-600 px-3 py-2 rounded-xl border border-emerald-400 flex-row items-center"
              style={{
                shadowColor: '#064e3b', // emerald-900
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 5
              }}
            >
              <Home size={12} color="#fff" className="mr-1.5" />
              <Text className="text-white font-black text-[8px] uppercase tracking-widest">In Settlement</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {showBackToDungeon && (
          <Animated.View entering={FadeIn} style={dungeonPulse && dungeonButtonStyle} className="mr-4">
            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)/dungeon')}
              className="bg-purple-600 px-3 py-2 rounded-xl border border-purple-400 flex-row items-center"
              style={{
                shadowColor: '#581c87', // purple-900
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 5
              }}
            >
              <Flame size={12} color="#fff" className="mr-1.5" />
              <Text className="text-white font-black text-[8px] uppercase tracking-widest">In Dungeon</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Profile Modal Overlay */}
        <Modal
          visible={showProfile}
          transparent={true}
          animationType="none"
          onRequestClose={() => setShowProfile(false)}
        >
          <View 
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]} 
            className="items-center justify-center p-6"
          >
            <Animated.View 
              entering={FadeIn.duration(300)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.5,
                shadowRadius: 30,
                elevation: 20
              }}
            >
              <View className="flex-row justify-between items-start mb-8">
                <View 
                  className="p-4 rounded-3xl border"
                  style={{ 
                    backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                    borderColor: 'rgba(6, 182, 212, 0.2)' 
                  }}
                >
                  <User size={32} color="#06b6d4" />
                </View>
                <TouchableOpacity 
                  onPress={() => setShowProfile(false)}
                  className="bg-zinc-800 p-2 rounded-full"
                >
                  <X size={20} color="#71717a" />
                </TouchableOpacity>
              </View>

              <Text className="text-white text-3xl font-black mb-1">{player.playerName}</Text>
              <Text className="text-zinc-500 font-bold uppercase tracking-[4px] text-[10px] mb-8">
                Fracture Profile Synchronization
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

              <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-4 px-1">
                Aether-Link Settings
              </Text>

              <View className="space-y-3 mb-8">
                <TouchableOpacity 
                  onPress={() => {
                    player.toggleMusic();
                    setTimeout(() => {
                      if (usePlayerStore.getState().settings.musicEnabled) {
                        SoundService.playAmbient();
                      } else {
                        SoundService.stopAll();
                      }
                    }, 100);
                  }}
                  className="h-16 rounded-2xl flex-row items-center px-6 border"
                  style={{
                    backgroundColor: player.settings.musicEnabled ? 'rgba(8, 51, 68, 0.2)' : '#09090b', // cyan-950/20 or zinc-950
                    borderColor: player.settings.musicEnabled ? 'rgba(6, 182, 212, 0.4)' : '#27272a'
                  }}
                >
                  <View 
                    className="p-2 rounded-lg mr-4"
                    style={{ backgroundColor: player.settings.musicEnabled ? 'rgba(6, 182, 212, 0.2)' : '#18181b' }}
                  >
                    {player.settings.musicEnabled ? <Music size={18} color="#06b6d4" /> : <Music2 size={18} color="#3f3f46" />}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold ${player.settings.musicEnabled ? 'text-white' : 'text-zinc-500'}`}>Sync Music</Text>
                    <Text className="text-[10px] text-zinc-600 uppercase tracking-widest">{player.settings.musicEnabled ? 'Operational' : 'Disabled'}</Text>
                  </View>
                  <View className={`w-4 h-4 rounded-full border-2 ${player.settings.musicEnabled ? 'bg-cyan-500 border-cyan-400' : 'border-zinc-800'}`} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => player.toggleTempUnit()}
                  className="h-16 rounded-2xl flex-row items-center px-6 border bg-zinc-950 border-zinc-800"
                >
                  <View className="p-2 rounded-lg mr-4 bg-zinc-900">
                    <Settings size={18} color="#06b6d4" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">Temperature Unit</Text>
                    <Text className="text-[10px] text-zinc-600 uppercase tracking-widest">Currently: {player.settings.tempUnit}</Text>
                  </View>
                  <View className="bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800">
                    <Text className="text-cyan-400 font-black text-xs">{player.settings.tempUnit === 'Celsius' ? '°C' : '°F'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="space-y-3">
                <TouchableOpacity 
                  onPress={handleWipeData}
                  className="border h-16 rounded-2xl flex-row items-center justify-center mb-3"
                  style={{ 
                    backgroundColor: 'rgba(69, 10, 10, 0.2)', // red-950
                    borderColor: 'rgba(239, 68, 68, 0.4)'
                  }}
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
          <Text className="text-emerald-500 text-[8px] font-bold uppercase tracking-widest">Health</Text>
          <View className="h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
            <View className="h-full bg-emerald-500" style={{ width: `${(currentHp / maxHp) * 100}%` }} />
          </View>
          <Text className="text-zinc-400 text-[8px] mt-0.5 font-mono">{currentHp}/{maxHp}</Text>
        </View>

        {/* Mana */}
        <View className="flex-1 mx-6">
          <Text className="text-cyan-500 text-[8px] font-bold uppercase tracking-widest">Mana</Text>
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
