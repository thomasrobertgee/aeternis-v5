import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { usePlayerStore, Item } from '../../utils/usePlayerStore';
import { Store, Sword, Shield, Zap, Package, ShoppingCart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRarityColor } from '../../utils/Constants';

interface MarketItem {
  item: Item;
  price: number;
}

const MARKET_STOCK: MarketItem[] = [
  {
    item: {
      id: 'mkt-kinetic-blade',
      name: 'Kinetic Blade',
      category: 'Weapon',
      rarity: 'Rare',
      description: 'A vibro-sword that hums with harvested Imaginum. Cuts through static like paper.',
      stats: { attack: 25 },
    },
    price: 1,
  },
  {
    item: {
      id: 'mkt-plasteel-plating',
      name: 'Plasteel Plating',
      category: 'Armor',
      rarity: 'Rare',
      description: 'Lightweight composite armor used by pre-Collapse orbital security.',
      stats: { defense: 15 },
    },
    price: 1,
  },
  {
    item: {
      id: 'mkt-plasteel-boots',
      name: 'Plasteel Boots',
      category: 'Armor',
      rarity: 'Rare',
      description: 'Stabilized kinetic footwear. Completes the Plasteel protection suite.',
      stats: { defense: 10 },
    },
    price: 1,
  },
  {
    item: {
      id: 'mkt-void-reaper',
      name: 'Void Reaper',
      category: 'Weapon',
      rarity: 'Fractured',
      description: 'A blade that exists partially in the static. Its strikes ignore physical density.',
      stats: { attack: 45 },
    },
    price: 7,
  },
  {
    item: {
      id: 'loot-focus-potion',
      name: 'Focus Potion',
      category: 'Utility',
      rarity: 'Rare',
      description: 'A viscous, indigo liquid that sharpens the mind and stabilizes your connection to the Imaginum.',
    },
    price: 1,
  },
  {
    item: {
      id: 'loot-rations',
      name: 'Old World Rations',
      category: 'Utility',
      rarity: 'Common',
      description: 'Vacuum-sealed nutrition from before The Collapse. Tastes like cardboard, but it keeps you going.',
    },
    price: 1,
  },
];

export default function MarketScreen() {
  const { gold, setStats, addItem } = usePlayerStore();

  const handlePurchase = (marketItem: MarketItem) => {
    if (gold < marketItem.price) {
      Alert.alert("Insufficient Aetium", "You need more resources to acquire this.");
      return;
    }

    setStats({ gold: gold - marketItem.price });
    addItem(marketItem.item);
    
    Alert.alert("Acquisition Complete", `${marketItem.item.name} has been added to your bag.`);
  };

  const getIcon = (category: string, rarity: string) => {
    const color = getRarityColor(rarity);
    switch (category) {
      case 'Weapon': return <Sword size={20} color={color} />;
      case 'Armor': return <Shield size={20} color={color} />;
      default: return <Package size={20} color={color} />;
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 pt-16" showsVerticalScrollIndicator={false}>
      <View className="mb-8">
        <View className="flex-row items-center mb-2">
          <Store size={24} color="#06b6d4" className="mr-2" />
          <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-xs">
            Trading Node Active
          </Text>
        </View>
        <Text className="text-white text-4xl font-black tracking-tight">Marketplace</Text>
        <Text className="text-zinc-500 text-sm font-medium uppercase tracking-[2px]">
          Exchange Aetium for Survival
        </Text>
      </View>

      <View className="bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] mb-10 flex-row justify-between items-center shadow-lg">
        <View>
          <Text className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-1">Available Aetium</Text>
          <View className="flex-row items-center">
            <Text className="text-white text-3xl font-black">{gold.toLocaleString()}</Text>
            <Text className="text-amber-500 ml-2 text-xl font-bold">A</Text>
          </View>
        </View>
        <View className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
          <ShoppingCart size={24} color="#06b6d4" />
        </View>
      </View>

      <View className="space-y-6 pb-20">
        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-2 px-1">
          Available Inventory
        </Text>

        {MARKET_STOCK.map((item, index) => {
          const rColor = getRarityColor(item.item.rarity);
          return (
            <Animated.View 
              key={item.item.id} 
              entering={FadeInDown.delay(index * 100).duration(500)}
              className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="bg-zinc-800 p-3 rounded-2xl mr-4 border border-zinc-700">
                    {getIcon(item.item.category, item.item.rarity)}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white font-bold text-lg mr-2">{item.item.name}</Text>
                      <View 
                        className="px-1.5 py-0.5 rounded-md border" 
                        style={{ borderColor: `${rColor}40`, backgroundColor: `${rColor}10` }}
                      >
                        <Text style={{ color: rColor }} className="text-[7px] font-black uppercase tracking-widest">{item.item.rarity}</Text>
                      </View>
                    </View>
                    <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{item.item.category}</Text>
                  </View>
                </View>
                <View className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800">
                  <Text className="text-amber-500 font-black text-xs">{item.price} A</Text>
                </View>
              </View>

              <Text className="text-zinc-400 text-sm leading-5 mb-5 italic">
                "{item.item.description}"
              </Text>

              {item.item.stats && (
                <View className="flex-row gap-3 mb-5">
                  {Object.entries(item.item.stats).map(([key, val]) => (
                    <View key={key} className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800">
                      <Text className="text-cyan-400 font-bold text-[10px] uppercase">{key} +{val}</Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity 
                onPress={() => handlePurchase(item)}
                activeOpacity={0.8}
                className={`h-12 rounded-xl items-center justify-center border-t border-white/5 ${
                  gold >= item.price ? 'bg-cyan-600 shadow-cyan-900/40' : 'bg-zinc-800 opacity-50'
                } shadow-md`}
              >
                <Text className="text-white font-black text-[10px] uppercase tracking-[3px]">
                  {gold >= item.price ? 'Acquire Item' : 'Insufficient Aetium'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScrollView>
  );
}
