import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import { usePlayerStore, Quest, Item } from '../utils/usePlayerStore';
import { useRouter } from 'expo-router';
import { 
  Home, User, ShoppingBag, Scroll, Coffee, X, 
  MessageSquare, ChevronRight, Sword, Shield, 
  Package, Zap, Star
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { getRarityColor } from '../utils/Constants';

type SettlementTab = 'NPCs' | 'Market' | 'Board' | 'Lodge';

export default function SettlementScreen() {
  const router = useRouter();
  const player = usePlayerStore();
  const [activeTab, setActiveTab] = useState<SettlementTab>('NPCs');

  const handleRest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    player.rest();
    Alert.alert("Sanctuary Found", "The warmth of the lodge restores your spirit. Vitality and MP fully synchronized.");
  };

  const handleAcceptQuest = (quest: Quest) => {
    if (player.activeQuests.find(q => q.id === quest.id)) {
      Alert.alert("Already Active", "You are already tracking this objective.");
      return;
    }
    player.startQuest(quest);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Objective Synchronized", `Quest '${quest.title}' added to your HUD.`);
  };

  const handlePurchase = (item: Item, price: number) => {
    if (player.gold < price) {
      Alert.alert("Insufficient Aetium", "You require more resources for this acquisition.");
      return;
    }
    player.setStats({ gold: player.gold - price });
    player.addItem(item);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Purchase Complete", `${item.name} moved to your storage vault.`);
  };

  const renderNPCs = () => (
    <Animated.View entering={FadeIn} className="flex-1">
      <View className="space-y-4">
        {[
          { name: "Mayor Miller", role: "Enclave Leader", desc: "A weary man with sharp eyes. He looks like he hasn't slept in years.", icon: <User size={24} color="#06b6d4" /> },
          { name: "Sarah", role: "Supply Officer", desc: "Always busy counting crates and checking manifests.", icon: <ShoppingBag size={24} color="#10b981" /> },
          { name: "Kael", role: "Tech-Scavenger", desc: "Covered in oil and blue Imaginum residue. He's tinkering with a broken drone.", icon: <Zap size={24} color="#f59e0b" /> },
          { name: "Old Man Jeff", role: "The One Who Found You", desc: "He's sitting on a bench, happily munching on some pre-Collapse crackers.", icon: <Star size={24} color="#a855f7" /> },
        ].map((npc, idx) => (
          <TouchableOpacity 
            key={idx}
            className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[32px] flex-row items-center mb-4"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert(npc.name, npc.desc);
            }}
          >
            <View className="bg-zinc-800 p-3 rounded-2xl mr-4">{npc.icon}</View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{npc.name}</Text>
              <Text className="text-cyan-500 font-black text-[8px] uppercase tracking-widest">{npc.role}</Text>
            </View>
            <MessageSquare size={18} color="#3f3f46" />
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderMarket = () => (
    <Animated.View entering={FadeIn} className="flex-1">
      <Text className="text-zinc-600 font-black text-[10px] uppercase tracking-[4px] mb-6 px-1">Enclave Supplies</Text>
      <View className="space-y-4">
        {[
          { item: { id: 'sett-hp-pot', name: 'Refined HP Potion', category: 'Utility' as const, rarity: 'Rare' as const, description: 'A cleaner brew than the wild ones. Restores 100 HP.' }, price: 50 },
          { item: { id: 'sett-mp-pot', name: 'Stable Mana Potion', category: 'Utility' as const, rarity: 'Rare' as const, description: 'Stabilizes MP flow. Restores 60 MP.' }, price: 50 },
          { item: { id: 'sett-scout-blade', name: 'Scavengers Dirk', category: 'Weapon' as const, rarity: 'Rare' as const, description: 'A sharp blade made from reinforced rebar.', stats: { attack: 18 } }, price: 200 },
        ].map((entry, idx) => (
          <View key={idx} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[32px] mb-4">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">{entry.item.name}</Text>
                <Text style={{ color: getRarityColor(entry.item.rarity) }} className="text-[8px] font-black uppercase tracking-widest">{entry.item.rarity}</Text>
              </View>
              <View className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                <Text className="text-amber-500 font-black text-xs">{entry.price} A</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => handlePurchase(entry.item, entry.price)}
              className="bg-cyan-600/20 border border-cyan-500/40 h-12 rounded-2xl items-center justify-center"
            >
              <Text className="text-cyan-400 font-bold uppercase text-[10px] tracking-widest">Acquire Item</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </Animated.View>
  );

  const renderBoard = () => (
    <Animated.View entering={FadeIn} className="flex-1">
      <Text className="text-zinc-600 font-black text-[10px] uppercase tracking-[4px] mb-6 px-1">Bulletin Board</Text>
      {[
        { id: 'q-sett-1', title: 'Static Culling', description: 'The perimeter is crawling with manifestations. Purge 10 enemies.', targetCount: 10, currentCount: 0, isCompleted: false, rewardXp: 500, rewardGold: 1000 },
        { id: 'q-sett-2', title: 'Scrap for Kael', description: 'Find and collect 5 units of Scrap Metal from the Rust Fields.', targetCount: 5, currentCount: 0, isCompleted: false, rewardXp: 300, rewardGold: 800 },
      ].map((quest, idx) => (
        <View key={idx} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[32px] mb-4">
          <Text className="text-white font-bold text-xl mb-2">{quest.title}</Text>
          <Text className="text-zinc-500 text-xs italic mb-6">"{quest.description}"</Text>
          <View className="flex-row gap-4 mb-6">
            <View className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Text className="text-cyan-400 font-black text-[8px] uppercase">{quest.rewardXp} XP</Text>
            </View>
            <View className="bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Text className="text-amber-500 font-black text-[8px] uppercase">{quest.rewardGold} AETIUM</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => handleAcceptQuest(quest)}
            className="bg-white h-14 rounded-2xl items-center justify-center"
          >
            <Text className="text-black font-black uppercase text-xs tracking-widest">Accept Contract</Text>
          </TouchableOpacity>
        </View>
      ))}
    </Animated.View>
  );

  const renderLodge = () => (
    <Animated.View entering={FadeIn} className="flex-1 items-center py-10">
      <View className="bg-emerald-500/10 p-10 rounded-[50px] border-2 border-emerald-500/30 mb-8">
        <Home size={80} color="#10b981" />
      </View>
      <Text className="text-white text-3xl font-black text-center mb-2">The Gate Lodge</Text>
      <Text className="text-zinc-500 text-center px-10 mb-10 leading-5">
        A safe haven within the walls. Here, the hum of the static is silenced by the warmth of community.
      </Text>
      <TouchableOpacity 
        onPress={handleRest}
        className="bg-emerald-600 px-16 py-5 rounded-3xl shadow-xl shadow-emerald-900/40"
      >
        <Text className="text-white font-black uppercase tracking-widest">Rest (Restore All)</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 pt-16 pb-8 bg-zinc-950 border-b border-zinc-900">
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <View className="bg-emerald-500/20 p-2 rounded-xl mr-3 border border-emerald-500/30">
              <Home size={20} color="#10b981" />
            </View>
            <View>
              <Text className="text-zinc-500 font-black text-[8px] uppercase tracking-[4px]">Sector Sanctuary</Text>
              <Text className="text-white text-2xl font-black uppercase tracking-tight">Altona Gate</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)/explore')}
            className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800"
          >
            <X size={20} color="#71717a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-zinc-950 px-4 py-2 gap-2">
        {(['NPCs', 'Market', 'Board', 'Lodge'] as SettlementTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(tab);
            }}
            className={`flex-1 py-3 rounded-2xl items-center justify-center border ${
              activeTab === tab ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-transparent border-transparent'
            }`}
          >
            <Text className={`font-black text-[8px] uppercase tracking-widest ${activeTab === tab ? 'text-cyan-400' : 'text-zinc-600'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        {activeTab === 'NPCs' && renderNPCs()}
        {activeTab === 'Market' && renderMarket()}
        {activeTab === 'Board' && renderBoard()}
        {activeTab === 'Lodge' && renderLodge()}
        <View className="h-20" />
      </ScrollView>

      {/* Player Currency Footer */}
      <View className="bg-zinc-950 border-t border-zinc-900 px-8 py-6 flex-row justify-between items-center">
        <View>
          <Text className="text-zinc-600 font-bold uppercase tracking-widest text-[8px]">Vault Credits</Text>
          <View className="flex-row items-center">
            <Text className="text-white text-2xl font-black">{player.gold}</Text>
            <Text className="text-amber-500 ml-1 text-lg font-bold">A</Text>
          </View>
        </View>
        <View className="bg-zinc-900 px-4 py-2 rounded-xl border border-zinc-800">
          <Text className="text-zinc-500 font-mono text-[10px]">SYNC: ACTIVE</Text>
        </View>
      </View>
    </View>
  );
}
