import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { Sword, Shield, User, Zap, Flame, Skull, Eye, Heart } from 'lucide-react-native';
import { getRarityColor } from './social';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ENEMY_DATABASE, BOSS_DATABASE } from '../../utils/EnemyFactory';

export default function CharacterScreen() {
  const { 
    equipment, 
    reputation, 
    enrolledFaction, 
    specialization, 
    setBonus,
    bestiary 
  } = usePlayerStore();

  const getFactionColor = (id: string) => {
    if (id === 'the-cogwheel') return 'text-amber-500';
    if (id === 'the-verdant') return 'text-emerald-500';
    return 'text-zinc-500';
  };

  const getSpecDetails = (id: string) => {
    switch (id) {
      case 'aether-bumper':
        return { 
          name: 'Aether-Bumper', 
          role: 'Tank', 
          icon: <Shield size={20} color="#06b6d4" />,
          desc: '+50 Max Vitality, +20% Defense' 
        };
      case 'wildfire-mage':
        return { 
          name: 'Wildfire-Mage', 
          role: 'DPS', 
          icon: <Flame size={20} color="#ef4444" />,
          desc: '+50 Max Imaginum, +20% Attack' 
        };
      case 'search-and-rescue':
        return { 
          name: 'Search-and-Rescue', 
          role: 'Support', 
          icon: <Zap size={20} color="#10b981" />,
          desc: '+25 Max Vitality, +25 Max Imaginum' 
        };
      default:
        return null;
    }
  };

  const specDetails = specialization ? getSpecDetails(specialization) : null;

  const getItemIcon = (category: string, rarity: string | undefined) => {
    const color = getRarityColor(rarity || 'Common');
    switch (category) {
      case 'Weapon': return <Sword size={24} color={color} />;
      case 'Armor': return <Shield size={24} color={color} />;
      default: return <Sword size={24} color={color} />;
    }
  };

  // Combine databases for the bestiary view
  const allEnemies = [
    ...Object.values(ENEMY_DATABASE).flat(),
    ...Object.values(BOSS_DATABASE).flat(),
  ];

  return (
    <ScrollView className="flex-1 bg-zinc-950 px-6 pt-16" showsVerticalScrollIndicator={false}>
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-cyan-500/10 rounded-full items-center justify-center border-2 border-cyan-500/30 mb-4">
          <User size={48} color="#06b6d4" />
        </View>
        <Text className="text-white text-3xl font-black tracking-tight">The Traveller</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-[10px]">
            Fracture-Linked
          </Text>
          {enrolledFaction && (
            <>
              <View className="w-1 h-1 bg-zinc-700 rounded-full mx-2" />
              <Text className={`font-bold uppercase tracking-[4px] text-[10px] ${getFactionColor(enrolledFaction)}`}>
                {enrolledFaction === 'the-cogwheel' ? 'Order' : 'Verdant'}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Set Bonus Card */}
      {setBonus && (
        <Animated.View entering={FadeInDown} className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-3xl mb-8">
          <View className="flex-row items-center mb-2">
            <Zap size={16} color="#f59e0b" className="mr-2" />
            <Text className="text-amber-500 font-black text-[10px] uppercase tracking-widest">Active Set Bonus</Text>
          </View>
          <Text className="text-white font-bold text-lg mb-1">{setBonus.name}</Text>
          <View className="flex-row flex-wrap gap-2">
            {Object.entries(setBonus.bonus).map(([stat, val]) => (
              <Text key={stat} className="text-amber-200/70 text-xs font-bold uppercase tracking-widest">
                + {val} {stat}
              </Text>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Specialization Card */}
      {specDetails && (
        <View className="bg-zinc-900 border border-cyan-500/20 p-5 rounded-3xl mb-8 shadow-lg shadow-cyan-500/5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="bg-cyan-500/10 p-2 rounded-xl mr-3 border border-cyan-500/20">
                {specDetails.icon}
              </View>
              <View>
                <Text className="text-cyan-400 font-black text-[10px] uppercase tracking-widest">Specialization: {specDetails.role}</Text>
                <Text className="text-white font-bold text-lg">{specDetails.name}</Text>
              </View>
            </View>
          </View>
          <Text className="text-zinc-400 text-xs italic leading-5">
            "{specDetails.desc}"
          </Text>
        </View>
      )}

      {/* Enrolled Faction Buff Card */}
      {enrolledFaction && (
        <View className={`bg-zinc-900 border p-5 rounded-3xl mb-8 ${
          enrolledFaction === 'the-cogwheel' ? 'border-amber-500/30' : 'border-emerald-500/30'
        }`}>
          <Text className={`font-black text-[10px] uppercase tracking-widest mb-2 ${getFactionColor(enrolledFaction)}`}>
            Permanent Faction Resonance
          </Text>
          <Text className="text-white font-bold text-lg mb-1">
            {enrolledFaction === 'the-cogwheel' ? 'Cogwheel Protocols' : 'Verdant Vitality'}
          </Text>
          <Text className="text-zinc-400 text-xs italic">
            {enrolledFaction === 'the-cogwheel' 
              ? "Your strikes are reinforced by industrial precision. (+15% Attack)" 
              : "Your physical form is grounded by the world-tree. (+15% Defense)"}
          </Text>
        </View>
      )}

      {/* Equipment Section */}
      <View className="space-y-6 mb-10">
        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-4 px-1">
          Current Equipment
        </Text>

        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex-row items-center mb-4">
          <View 
            className="p-3 rounded-2xl mr-4 border" 
            style={{ backgroundColor: `${getRarityColor(equipment.weapon?.rarity || 'Common')}10`, borderColor: `${getRarityColor(equipment.weapon?.rarity || 'Common')}20` }}
          >
            {getItemIcon('Weapon', equipment.weapon?.rarity)}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Weapon</Text>
              {equipment.weapon && (
                <Text style={{ color: getRarityColor(equipment.weapon.rarity) }} className="text-[8px] font-black uppercase tracking-widest">{equipment.weapon.rarity}</Text>
              )}
            </View>
            <Text className="text-white font-bold text-lg">{equipment.weapon?.name || 'Empty'}</Text>
            <Text className="text-zinc-400 text-xs mt-1 italic leading-5">
              {equipment.weapon?.description}
            </Text>
          </View>
        </View>

        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex-row items-center mb-4">
          <View 
            className="p-3 rounded-2xl mr-4 border" 
            style={{ backgroundColor: `${getRarityColor(equipment.armor?.rarity || 'Common')}10`, borderColor: `${getRarityColor(equipment.armor?.rarity || 'Common')}20` }}
          >
            {getItemIcon('Armor', equipment.armor?.rarity)}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Armor</Text>
              {equipment.armor && (
                <Text style={{ color: getRarityColor(equipment.armor.rarity) }} className="text-[8px] font-black uppercase tracking-widest">{equipment.armor.rarity}</Text>
              )}
            </View>
            <Text className="text-white font-bold text-lg">{equipment.armor?.name || 'Empty'}</Text>
            <Text className="text-zinc-400 text-xs mt-1 italic leading-5">
              {equipment.armor?.description}
            </Text>
          </View>
        </View>

        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl flex-row items-center">
          <View 
            className="p-3 rounded-2xl mr-4 border" 
            style={{ backgroundColor: `${getRarityColor(equipment.boots?.rarity || 'Common')}10`, borderColor: `${getRarityColor(equipment.boots?.rarity || 'Common')}20` }}
          >
            {getItemIcon('Armor', equipment.boots?.rarity)}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Boots</Text>
              {equipment.boots && (
                <Text style={{ color: getRarityColor(equipment.boots.rarity) }} className="text-[8px] font-black uppercase tracking-widest">{equipment.boots.rarity}</Text>
              )}
            </View>
            <Text className="text-white font-bold text-lg">{equipment.boots?.name || 'Empty'}</Text>
            <Text className="text-zinc-400 text-xs mt-1 italic leading-5">
              {equipment.boots?.description || 'No specialized footwear equipped.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bestiary Section */}
      <View className="mb-10">
        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-6 px-1">
          Manifestation Bestiary
        </Text>

        <View className="space-y-4">
          {allEnemies.map((enemy, index) => {
            const entry = bestiary[enemy.name];
            const isEncountered = (entry?.encounters || 0) > 0;
            const isDefeatedOnce = (entry?.defeats || 0) > 0;
            const isMastered = (entry?.defeats || 0) >= 5;

            if (!isEncountered) {
              return (
                <View key={enemy.name} className="bg-zinc-900/20 border border-zinc-900 border-dashed p-5 rounded-3xl flex-row items-center mb-4">
                  <View className="bg-zinc-900 p-3 rounded-2xl mr-4">
                    <Eye size={20} color="#27272a" />
                  </View>
                  <Text className="text-zinc-800 font-bold text-lg tracking-widest">??? ??? ???</Text>
                </View>
              );
            }

            return (
              <Animated.View 
                key={enemy.name}
                entering={FadeInDown.delay(index * 50)}
                className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className={`p-3 rounded-2xl mr-4 border ${isMastered ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-800 border-zinc-700'}`}>
                      <Skull size={20} color={isMastered ? "#ef4444" : "#71717a"} />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-lg">{enemy.name}</Text>
                      <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Defeats: {entry?.defeats || 0}
                      </Text>
                    </View>
                  </View>
                  {isDefeatedOnce && (
                    <View className="flex-row items-center bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
                      <Heart size={10} color="#ef4444" className="mr-1.5" />
                      <Text className="text-white font-mono text-[10px]">{enemy.maxHp} HP</Text>
                    </View>
                  )}
                </View>

                {isDefeatedOnce && (
                  <Text className="text-zinc-400 text-xs leading-5 italic mb-2">
                    {isMastered ? enemy.description : "A strange manifestation from the static. More data required to analyze behaviors."}
                  </Text>
                )}

                {!isMastered && isDefeatedOnce && (
                  <View className="bg-zinc-950/50 rounded-xl p-2 items-center border border-zinc-900">
                    <Text className="text-zinc-600 font-black text-[7px] uppercase tracking-widest">
                      Kill {5 - (entry?.defeats || 0)} more to unlock full analysis
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Faction Standing Section */}
      <View className="space-y-6">
        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-4 px-1">
          Faction Standing
        </Text>

        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold">The Cogwheel</Text>
            <Text className="text-amber-500 font-mono text-[10px] font-bold uppercase tracking-widest">
              REP: {reputation['the-cogwheel'] || 0}
            </Text>
          </View>
          <View className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <View 
              className="h-full bg-amber-500 shadow-lg shadow-amber-500/50" 
              style={{ width: `${Math.min(((reputation['the-cogwheel'] || 0) % 1000) / 10, 100)}%` }} 
            />
          </View>
        </View>

        <View className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold">The Verdant</Text>
            <Text className="text-emerald-500 font-mono text-[10px] font-bold uppercase tracking-widest">
              REP: {reputation['the-verdant'] || 0}
            </Text>
          </View>
          <View className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <View 
              className="h-full bg-emerald-500 shadow-lg shadow-emerald-500/50" 
              style={{ width: `${Math.min(((reputation['the-verdant'] || 0) % 1000) / 10, 100)}%` }} 
            />
          </View>
        </View>
      </View>

      <View className="h-20" />
    </ScrollView>
  );
}
