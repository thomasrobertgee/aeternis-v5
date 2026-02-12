import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { usePlayerStore, Item } from '../../utils/usePlayerStore';
import { Package, Sword, Shield, Zap, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 64) / 3;

export default function InventoryScreen() {
  const { inventory, equipItem, removeItem, setStats, hp, maxHp, equipment } = usePlayerStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleAction = () => {
    if (!selectedItem) return;

    if (selectedItem.category === 'Utility') {
      // Logic for using utility items
      if (selectedItem.name.includes('Rations')) {
        const restoreAmount = Math.floor(maxHp * 0.2);
        setStats({ hp: Math.min(maxHp, hp + restoreAmount) });
      } else if (selectedItem.name.includes('Focus Potion')) {
        const restoreAmount = Math.floor(usePlayerStore.getState().maxMana * 0.2);
        setStats({ mana: Math.min(usePlayerStore.getState().maxMana, usePlayerStore.getState().mana + restoreAmount) });
      }
      removeItem(selectedItem.id);
      setSelectedItem(null);
    } else {
      // Logic for equipping
      equipItem(selectedItem);
      setSelectedItem(null);
    }
  };

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'Weapon': return <Sword size={24} color="#f59e0b" />;
      case 'Armor': return <Shield size={24} color="#3b82f6" />;
      default: return <Package size={24} color="#71717a" />;
    }
  };

  const isEquipped = (item: Item) => {
    return equipment.weapon?.id === item.id || equipment.armor?.id === item.id;
  };

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      <View className="mb-8">
        <Text className="text-white text-4xl font-black tracking-tight">Supplies</Text>
        <Text className="text-zinc-500 text-sm font-medium uppercase tracking-[2px]">
          Recovered from the Fracture
        </Text>
      </View>

      {/* Item Grid */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
      >
        {inventory.map((item, index) => (
          <Animated.View 
            key={item.id} 
            entering={FadeInDown.delay(index * 50).duration(400)}
          >
            <TouchableOpacity 
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.7}
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
              className={`bg-zinc-900 border ${
                selectedItem?.id === item.id ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-zinc-800'
              } rounded-2xl items-center justify-center relative overflow-hidden`}
            >
              {getItemIcon(item.category)}
              
              {isEquipped(item) && (
                <View className="absolute top-1 right-1 bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                  <Text className="text-emerald-500 text-[6px] font-black uppercase">Equipped</Text>
                </View>
              )}

              <View className="absolute bottom-2 px-2">
                <Text className="text-white text-[8px] font-bold text-center" numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {inventory.length === 0 && (
          <View className="w-full items-center py-20">
            <Package size={48} color="#18181b" />
            <Text className="text-zinc-700 font-bold uppercase tracking-widest mt-4">Empty Pack</Text>
          </View>
        )}
      </ScrollView>

      {/* Selection Overlay */}
      {selectedItem && (
        <Animated.View 
          entering={SlideInUp.duration(300)}
          className="absolute bottom-6 left-4 right-4 bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] shadow-2xl z-50"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row items-center">
              <View className="bg-zinc-800 p-3 rounded-2xl mr-4 border border-zinc-700">
                {getItemIcon(selectedItem.category)}
              </View>
              <View>
                <Text className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-1">
                  {selectedItem.category}
                </Text>
                <Text className="text-white text-xl font-bold">{selectedItem.name}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setSelectedItem(null)}
              className="bg-zinc-800 p-2 rounded-full"
            >
              <X size={18} color="#71717a" />
            </TouchableOpacity>
          </View>

          <Text className="text-zinc-400 text-sm leading-6 mb-6 italic">
            "{selectedItem.description}"
          </Text>

          {selectedItem.stats && (
            <View className="flex-row gap-4 mb-6">
              {Object.entries(selectedItem.stats).map(([key, val]) => (
                <View key={key} className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
                  <Text className="text-zinc-500 text-[10px] font-bold uppercase">{key}</Text>
                  <Text className="text-cyan-400 font-black">+{val}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            onPress={handleAction}
            activeOpacity={0.8}
            className={`h-14 rounded-2xl items-center justify-center ${
              selectedItem.category === 'Utility' ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-cyan-600 shadow-cyan-900/40'
            } shadow-lg border-t border-white/10`}
          >
            <Text className="text-white font-black text-xs uppercase tracking-[4px]">
              {selectedItem.category === 'Utility' ? 'Use Item' : isEquipped(selectedItem) ? 'Already Equipped' : 'Equip Gear'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View className="h-20" />
    </View>
  );
}
