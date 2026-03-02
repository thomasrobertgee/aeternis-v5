import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, StyleSheet } from 'react-native';
import { usePlayerStore, Item } from '../../utils/usePlayerStore';
import { Store, Sword, Shield, Zap, Package, ShoppingCart, X, CheckCircle2, Info, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { getRarityColor } from '../../utils/Constants';
import * as Haptics from 'expo-haptics';

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
      grantedSkill: { id: 'skill-void-harvest', name: 'Void Harvest', level: 1, description: 'Step through the static to deliver a strike that ignores armor.', type: 'Active' },
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
  const { gold, setStats, addItem, inventory, equipment, equipItem } = usePlayerStore();
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [purchasedItem, setPurchasedItem] = useState<Item | null>(null);

  const getOwnedCount = (itemId: string) => {
    return inventory.filter(i => i.id.startsWith(itemId)).length;
  };

  const getEquippedInSlot = (item: Item) => {
    if (item.category === 'Weapon') return equipment.weapon;
    if (item.category === 'Armor') {
      if (item.name.toLowerCase().includes('boots')) return equipment.boots;
      return equipment.armor;
    }
    return null;
  };

  const handleInitiatePurchase = (marketItem: MarketItem) => {
    if (gold < marketItem.price) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Insufficient Aetium", "You need more resources to acquire this.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(marketItem);
  };

  const confirmPurchase = () => {
    if (!selectedItem) return;

    const newItem = { ...selectedItem.item, id: `${selectedItem.item.id}-${Math.random().toString(36).substr(2, 9)}` };
    setStats({ gold: gold - selectedItem.price });
    addItem(newItem);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const isEquipment = selectedItem.item.category === 'Weapon' || selectedItem.item.category === 'Armor';
    const currentMarketItem = selectedItem;
    setSelectedItem(null);

    if (isEquipment) {
      // Delay slightly to allow the first modal to close
      setTimeout(() => {
        setPurchasedItem(newItem);
      }, 400);
    }
  };

  const handleEquipNow = () => {
    if (purchasedItem) {
      equipItem(purchasedItem);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setPurchasedItem(null);
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
    <View className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-16" showsVerticalScrollIndicator={false}>
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
            const ownedCount = getOwnedCount(item.item.id);
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
                      <View className="flex-row items-center flex-wrap">
                        <Text className="text-white font-bold text-lg mr-2">{item.item.name}</Text>
                        <View 
                          className="px-1.5 py-0.5 rounded-md border" 
                          style={{ borderColor: `${rColor}40`, backgroundColor: `${rColor}10` }}
                        >
                          <Text style={{ color: rColor }} className="text-[7px] font-black uppercase tracking-widest">{item.item.rarity}</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{item.item.category}</Text>
                        {ownedCount > 0 && (
                          <View className="flex-row items-center ml-3 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
                            <CheckCircle2 size={8} color="#10b981" className="mr-1" />
                            <Text className="text-emerald-500 text-[8px] font-black uppercase">Owned: {ownedCount}</Text>
                          </View>
                        )}
                      </View>
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
                  onPress={() => handleInitiatePurchase(item)}
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

      {/* Purchase Confirmation Modal */}
      <Modal
        visible={!!selectedItem}
        transparent={true}
        animationType="none"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={StyleSheet.absoluteFill} className="bg-black/80 items-center justify-center p-6">
          <Animated.View 
            entering={FadeIn.duration(300)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 shadow-2xl"
          >
            <View className="flex-row justify-between items-start mb-8">
              <View className="bg-cyan-500/10 p-4 rounded-3xl border border-cyan-500/20">
                <ShoppingCart size={32} color="#06b6d4" />
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedItem(null)}
                className="bg-zinc-800 p-2 rounded-full"
              >
                <X size={20} color="#71717a" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-3xl font-black mb-1">Confirm Purchase</Text>
            <Text className="text-zinc-500 font-bold uppercase tracking-[4px] text-[10px] mb-8">
              Verify Transaction Parameters
            </Text>

            <View className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-zinc-500 font-bold">Item</Text>
                <Text className="text-white font-black">{selectedItem?.item.name}</Text>
              </View>
              
              {/* Equipment Comparison */}
              {(selectedItem?.item.category === 'Weapon' || selectedItem?.item.category === 'Armor') && (
                <View className="mb-4 border-y border-zinc-900 py-4 my-2">
                  <Text className="text-zinc-600 font-black text-[8px] uppercase tracking-widest mb-3 text-center">Equipment Comparison</Text>
                  <View className="flex-row justify-between">
                    <View className="flex-1 items-center">
                      <Text className="text-zinc-500 text-[8px] font-bold uppercase mb-1">Equipped</Text>
                      {getEquippedInSlot(selectedItem.item) ? (
                        <View className="items-center">
                          <Text className="text-zinc-400 font-bold text-xs" numberOfLines={1}>{getEquippedInSlot(selectedItem.item)?.name}</Text>
                          {Object.entries(getEquippedInSlot(selectedItem.item)?.stats || {}).map(([key, val]) => (
                            <Text key={key} className="text-zinc-500 text-[10px] uppercase">{key} {val}</Text>
                          ))}
                        </View>
                      ) : (
                        <Text className="text-zinc-700 italic text-[10px]">None Equipped</Text>
                      )}
                    </View>
                    
                    <View className="px-4 justify-center">
                      <ChevronRight size={16} color="#3f3f46" />
                    </View>

                    <View className="flex-1 items-center">
                      <Text className="text-cyan-500 text-[8px] font-bold uppercase mb-1">New Item</Text>
                      <View className="items-center">
                        <Text className="text-white font-bold text-xs" numberOfLines={1}>{selectedItem.item.name}</Text>
                        {Object.entries(selectedItem.item.stats || {}).map(([key, val]) => {
                          const equipped = getEquippedInSlot(selectedItem.item);
                          const currentVal = equipped?.stats?.[key] || 0;
                          const diff = val - currentVal;
                          return (
                            <Text key={key} className={`text-[10px] uppercase font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {key} {val} ({diff >= 0 ? '+' : ''}{diff})
                            </Text>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-zinc-500 font-bold">Cost</Text>
                <Text className="text-amber-500 font-black">{selectedItem?.price} A</Text>
              </View>
              <View className="h-[1px] bg-zinc-800 mb-4" />
              <View className="flex-row justify-between items-center">
                <Text className="text-zinc-500 font-bold">New Balance</Text>
                <Text className="text-cyan-400 font-black">{(gold - (selectedItem?.price || 0)).toLocaleString()} A</Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => setSelectedItem(null)}
                className="flex-1 bg-zinc-800 h-16 rounded-2xl items-center justify-center"
              >
                <Text className="text-zinc-400 font-black text-xs uppercase tracking-[4px]">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={confirmPurchase}
                className="flex-2 bg-cyan-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-cyan-900/40 px-8"
              >
                <Text className="text-white font-black text-xs uppercase tracking-[4px]">Confirm trade</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Equip Now Modal */}
      <Modal
        visible={!!purchasedItem}
        transparent={true}
        animationType="none"
        onRequestClose={() => setPurchasedItem(null)}
      >
        <View style={StyleSheet.absoluteFill} className="bg-black/80 items-center justify-center p-6">
          <Animated.View 
            entering={FadeIn.duration(300)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 shadow-2xl items-center"
          >
            <View className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 mb-6">
              <Zap size={48} color="#10b981" />
            </View>

            <Text className="text-white text-3xl font-black mb-1 text-center">Sync Complete</Text>
            <Text className="text-zinc-500 font-bold uppercase tracking-[4px] text-[10px] mb-8 text-center">
              New gear acquired: {purchasedItem?.name}
            </Text>

            <Text className="text-zinc-400 text-center mb-8 px-4 text-sm leading-5">
              Would you like to synchronize and equip this gear to your physical form immediately?
            </Text>

            <View className="flex-row gap-4 w-full">
              <TouchableOpacity 
                onPress={() => setPurchasedItem(null)}
                className="flex-1 bg-zinc-800 h-16 rounded-2xl items-center justify-center"
              >
                <Text className="text-zinc-400 font-black text-xs uppercase tracking-[4px]">Later</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleEquipNow}
                className="flex-2 bg-emerald-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-emerald-900/40 px-8"
              >
                <Text className="text-white font-black text-xs uppercase tracking-[4px]">Equip Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
