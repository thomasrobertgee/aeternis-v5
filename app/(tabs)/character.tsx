import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { Sword, Shield, User } from 'lucide-react-native';

export default function CharacterScreen() {
  const { equipment } = usePlayerStore();

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 pt-16">
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-cyan-500/10 rounded-full items-center justify-center border-2 border-cyan-500/30 mb-4">
          <User size={48} color="#06b6d4" />
        </View>
        <Text className="text-white text-3xl font-black tracking-tight">The Traveller</Text>
        <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-[10px] mt-1">
          Fracture-Linked
        </Text>
      </View>

      <View className="space-y-6">
        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-4">
          Current Equipment
        </Text>

        {/* Weapon Slot */}
        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex-row items-center mb-4">
          <View className="bg-amber-500/10 p-3 rounded-2xl mr-4 border border-amber-500/20">
            <Sword size={24} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Weapon</Text>
            <Text className="text-white font-bold text-lg">{equipment.weapon?.name || 'Empty'}</Text>
            <Text className="text-zinc-400 text-xs mt-1 italic leading-5">
              {equipment.weapon?.description}
            </Text>
          </View>
        </View>

        {/* Armor Slot */}
        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex-row items-center">
          <View className="bg-blue-500/10 p-3 rounded-2xl mr-4 border border-blue-500/20">
            <Shield size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Armor</Text>
            <Text className="text-white font-bold text-lg">{equipment.armor?.name || 'Empty'}</Text>
            <Text className="text-zinc-400 text-xs mt-1 italic leading-5">
              {equipment.armor?.description}
            </Text>
          </View>
        </View>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}

