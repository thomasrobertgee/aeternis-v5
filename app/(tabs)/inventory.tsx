import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions, StyleSheet } from 'react-native';
import { usePlayerStore, Item } from '../../utils/usePlayerStore';
import { Package, Sword, Shield, Zap, X, ChevronRight, Hammer } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import { getRarityColor } from '../../utils/Constants';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function InventoryScreen() {
  const router = useRouter();
  const inventory = usePlayerStore((state) => state.inventory);
  const equipItem = usePlayerStore((state) => state.equipItem);
  const removeItem = usePlayerStore((state) => state.removeItem);
  const setStats = usePlayerStore((state) => state.setStats);
  const hp = usePlayerStore((state) => state.hp);
  const maxHp = usePlayerStore((state) => state.maxHp);
  const equipment = usePlayerStore((state) => state.equipment);
  const maxMana = usePlayerStore((state) => state.maxMana);
  const mana = usePlayerStore((state) => state.mana);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const categories = useMemo(() => {
    const groups: Record<string, Item[]> = {
      'Weapon': [],
      'Armor': [],
      'Utility': []
    };
    inventory.forEach(item => {
      if (groups[item.category]) groups[item.category].push(item);
    });
    return groups;
  }, [inventory]);

  const handleAction = useCallback(() => {
    if (!selectedItem) return;

    if (selectedItem.category === 'Utility') {
      if (selectedItem.name.includes('Rations')) {
        const restoreAmount = Math.floor(maxHp * 0.2);
        setStats({ hp: Math.min(maxHp, hp + restoreAmount) });
      } else if (selectedItem.name.includes('Focus Potion')) {
        const restoreAmount = Math.floor(maxMana * 0.2);
        setStats({ mana: Math.min(maxMana, mana + restoreAmount) });
      } else if (selectedItem.name.includes('Health Potion')) {
        setStats({ hp: Math.min(maxHp, hp + 50) });
      } else if (selectedItem.name.includes('Mana Potion')) {
        setStats({ mana: Math.min(maxMana, mana + 30) });
      }
      removeItem(selectedItem.id);
      setSelectedItem(null);
    } else {
      equipItem(selectedItem);
      setSelectedItem(null);
    }
  }, [selectedItem, hp, maxHp, mana, maxMana, setStats, removeItem, equipItem]);

  const getItemIcon = (category: string, rarity: string, size = 24) => {
    const color = getRarityColor(rarity);
    switch (category) {
      case 'Weapon': return <Sword size={size} color={color} />;
      case 'Armor': return <Shield size={size} color={color} />;
      default: return <Package size={size} color={color} />;
    }
  };

  const isEquipped = (item: Item) => {
    return equipment.weapon?.id === item.id || 
           equipment.armor?.id === item.id || 
           equipment.boots?.id === item.id;
  };

  const renderItemCard = (item: Item, index: number) => {
    const rColor = getRarityColor(item.rarity);
    const equipped = isEquipped(item);

    return (
      <Animated.View 
        key={item.id} 
        entering={FadeInDown.delay(index * 50).duration(400)}
        className="w-full mb-3"
      >
        <Pressable 
          onPress={() => setSelectedItem(item)}
          style={({ pressed }) => [
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
          className={`bg-zinc-900/50 border ${
            selectedItem?.id === item.id ? 'border-cyan-500 bg-zinc-900' : 'border-zinc-800'
          } rounded-[24px] p-4 flex-row items-center`}
        >
          <View 
            className="w-16 h-16 rounded-2xl items-center justify-center border"
            style={{ backgroundColor: `${rColor}10`, borderColor: `${rColor}30` }}
          >
            {getItemIcon(item.category, item.rarity, 28)}
          </View>

          <View className="flex-1 ml-4">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-white font-bold text-base">{item.name}</Text>
              {equipped && (
                <View className="bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <Text className="text-emerald-500 text-[6px] font-black uppercase">Equipped</Text>
                </View>
              )}
            </View>
            <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{item.rarity}</Text>
          </View>

          <ChevronRight size={16} color="#3f3f46" className="ml-2" />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <Pressable 
        style={StyleSheet.absoluteFill} 
        onPress={() => setSelectedItem(null)} 
      />
      <View className="flex-1 px-6 pt-16" pointerEvents="box-none">
        <View className="mb-8">
          <Text className="text-white text-4xl font-black tracking-tight">Supplies</Text>
          <Text className="text-zinc-500 text-sm font-medium uppercase tracking-[2px]">
            Vault Synchronized
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {Object.entries(categories).map(([catName, items]) => {
            if (items.length === 0) return null;
            return (
              <View key={catName} className="mb-8">
                <View className="flex-row items-center mb-4 px-1">
                  <Text className="text-zinc-600 font-black text-[10px] uppercase tracking-[4px]">{catName}s</Text>
                  <View className="flex-1 h-px bg-zinc-900 ml-4 opacity-50" />
                </View>
                {items.map((item, idx) => renderItemCard(item, idx))}
              </View>
            );
          })}

          {inventory.length === 0 && (
            <View className="w-full items-center py-20">
              <Package size={48} color="#18181b" />
              <Text className="text-zinc-700 font-bold uppercase tracking-widest mt-4">Empty Pack</Text>
            </View>
          )}
          <View className="h-32" />
        </ScrollView>
      </View>

      {selectedItem && (
        <Animated.View 
          entering={SlideInUp.duration(300)}
          className="absolute bottom-6 left-4 right-4 bg-zinc-900 border-2 border-zinc-800 p-6 rounded-[40px] shadow-2xl z-50"
        >
          <View className="flex-row items-center">
            {/* Left Column: Details */}
            <View className="flex-1 pr-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-zinc-800 p-2 rounded-xl mr-3 border border-zinc-700">
                  {getItemIcon(selectedItem.category, selectedItem.rarity, 20)}
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">{selectedItem.name}</Text>
                  <Text className="text-zinc-500 font-black text-[8px] uppercase tracking-widest">{selectedItem.rarity}</Text>
                </View>
              </View>
              <Text className="text-zinc-400 text-xs italic leading-5" numberOfLines={2}>
                "{selectedItem.description}"
              </Text>
              
              {selectedItem.stats && (
                <View className="flex-row gap-2 mt-3">
                  {Object.entries(selectedItem.stats).map(([key, val]) => (
                    <View key={key} className="bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
                      <Text className="text-cyan-400 font-black text-[8px]">+{val} {key.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Right Column: Large Action Button */}
            <View className="flex-col" style={{ marginLeft: -70 }}>
              <Pressable 
                onPress={handleAction}
                style={({ pressed }) => [
                  { 
                    width: 175, 
                    height: 125, 
                    borderRadius: 28, 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  { backgroundColor: selectedItem.category === 'Utility' ? '#059669' : '#0891b2' },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }
                ]}
              >
                <View className="border border-white/30 px-6 py-3 rounded-2xl">
                  <Text className="text-white font-normal text-3xl uppercase text-center tracking-[6px]">
                    {selectedItem.category === 'Utility' ? 'Use' : 'Equip'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
