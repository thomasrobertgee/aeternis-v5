import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useUIStore } from '../../utils/useUIStore';
import { Sword, Shield, User, Zap, Flame, Skull, Eye, Heart, BookOpen, Scroll, Activity, Navigation, Gift } from 'lucide-react-native';
import { getRarityColor, MILLERS_JUNCTION_DEPTHS_COORDS } from '../../utils/Constants';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ENEMY_DATABASE, BOSS_DATABASE } from '../../utils/EnemyFactory';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';


type HeroTab = 'Stats' | 'Skills' | 'Quests' | 'Codex';

export default function CharacterScreen() {
  const router = useRouter();
  const { heroTab: activeTab, setHeroTab: setActiveTab } = useUIStore();
  const { 
    hp, maxHp, mana, maxMana, attack, defense, level, xp, maxXp, gold,
    equipment, 
    skills,
    reputation, 
    enrolledFaction, 
    specialization, 
    setBonus,
    bestiary,
    activeQuests,
    discoveredZones,
    playerName,
    tutorialProgress,
    completeQuest
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
          desc: '+50 Max Health, +20% Defense' 
        };
      case 'wildfire-mage':
        return { 
          name: 'Wildfire-Mage', 
          role: 'DPS', 
          icon: <Flame size={20} color="#ef4444" />,
          desc: '+50 Max Mana, +20% Attack' 
        };
      case 'search-and-rescue':
        return { 
          name: 'Search-and-Rescue', 
          role: 'Support', 
          icon: <Zap size={20} color="#10b981" />,
          desc: '+25 Max Health, +25 Max Mana' 
        };
      default:
        return null;
    }
  };

  const specDetails = specialization ? getSpecDetails(specialization) : null;

  // Calculate equipment bonuses for display
  const equipmentAtkBonus = (equipment.weapon?.stats?.attack || 0);
  const equipmentDefBonus = (equipment.armor?.stats?.defense || 0) + 
                           (equipment.boots?.stats?.defense || 0) + 
                           (setBonus?.bonus?.defense || 0);

  const getItemIcon = (category: string, rarity: string | undefined) => {
    const color = getRarityColor(rarity || 'Common');
    switch (category) {
      case 'Weapon': return <Sword size={24} color={color} />;
      case 'Armor': return <Shield size={24} color={color} />;
      default: return <Sword size={24} color={color} />;
    }
  };

  const renderStats = () => (
    <Animated.View entering={FadeIn} className="flex-1">
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-cyan-500/10 rounded-full items-center justify-center border-2 border-cyan-500/30 mb-4">
          <User size={48} color="#06b6d4" />
        </View>
        <Text className="text-white text-3xl font-black tracking-tight">{playerName}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-[10px]">
            Lvl {level} Fracture-Linked
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

      {/* Core Stats Grid */}
      <View className="flex-row flex-wrap gap-4 mb-8">
        <View className="flex-1 min-w-[45%] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
          <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">Health</Text>
          <Text className="text-white font-bold text-lg">{hp} / {maxHp}</Text>
          <View className="h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <View className="h-full bg-red-500" style={{ width: `${(hp/maxHp)*100}%` }} />
          </View>
        </View>
        <View className="flex-1 min-w-[45%] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
          <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">Mana</Text>
          <Text className="text-white font-bold text-lg">{mana} / {maxMana}</Text>
          <View className="h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <View className="h-full bg-cyan-500" style={{ width: `${(mana/maxMana)*100}%` }} />
          </View>
        </View>
        <View className="flex-1 min-w-[45%] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
          <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">Attack</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white font-bold text-lg">{attack}</Text>
            {equipmentAtkBonus > 0 && (
              <Text className="text-zinc-500 text-[10px] ml-1.5 font-bold">
                ({attack - equipmentAtkBonus} <Text className="text-emerald-500">+{equipmentAtkBonus}</Text>)
              </Text>
            )}
          </View>
        </View>
        <View className="flex-1 min-w-[45%] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
          <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">Defense</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white font-bold text-lg">{defense}</Text>
            {equipmentDefBonus > 0 && (
              <Text className="text-zinc-500 text-[10px] ml-1.5 font-bold">
                ({defense - equipmentDefBonus} <Text className="text-emerald-500">+{equipmentDefBonus}</Text>)
              </Text>
            )}
          </View>
        </View>
        <View className="flex-1 min-w-[45%] bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
          <Text className="text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1">Aetium</Text>
          <Text className="text-white font-bold text-lg">{gold}</Text>
        </View>
      </View>

      {/* Set Bonus Card */}
      {setBonus && (
        <View className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-3xl mb-8">
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
        </View>
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

      {/* Equipment Section */}
      <View className="mb-10">
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
          </View>
        </View>
      </View>

      {/* Faction Standing Section */}
      {tutorialProgress.currentStep >= 58 && (
        <View className="mb-10">
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
      )}
    </Animated.View>
  );

  const renderSkills = () => (
    <Animated.View entering={FadeIn} className="flex-1">
      <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-6 px-1">
        Learned Skills
      </Text>
      {skills.length === 0 ? (
        <View className="bg-zinc-900/20 border border-zinc-900 border-dashed p-10 rounded-3xl items-center">
          <Text className="text-zinc-700 font-bold italic text-center">No skills manifested yet.</Text>
        </View>
      ) : (
        <View className="space-y-4">
          {skills.map((skill) => (
            <View key={skill.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center">
                  <View className="bg-cyan-500/10 p-2 rounded-xl mr-3 border border-cyan-500/20">
                    <Activity size={18} color="#06b6d4" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-lg">{skill.name}</Text>
                    <Text className="text-cyan-500/70 text-[8px] font-black uppercase tracking-widest">{skill.type}</Text>
                  </View>
                </View>
                <View className="bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
                  <Text className="text-cyan-400 font-mono text-[10px]">Rank {skill.level}</Text>
                </View>
              </View>
              <Text className="text-zinc-400 text-xs italic leading-5">{skill.description}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const renderQuests = () => (
    <Animated.View entering={FadeIn} className="flex-1">
      <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-6 px-1">
        Active Objectives
      </Text>
      {activeQuests.length === 0 ? (
        <View className="bg-zinc-900/20 border border-zinc-900 border-dashed p-10 rounded-3xl items-center">
          <Text className="text-zinc-700 font-bold italic text-center">No active quests in the log.</Text>
        </View>
      ) : (
        activeQuests.map((quest) => (
          <View key={quest.id} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4">
            <View className="flex-row items-center mb-3">
              <View className="bg-amber-500/10 p-2 rounded-xl mr-3 border border-amber-500/20">
                <Scroll size={18} color="#f59e0b" />
              </View>
              <Text className="text-white font-bold text-lg">{quest.title}</Text>
            </View>
            <Text className="text-zinc-400 text-xs mb-4 leading-5 italic">"{quest.description}"</Text>
            <View className="flex-row justify-between items-center bg-zinc-950/50 p-3 rounded-2xl border border-zinc-900">
              <Text className="text-zinc-500 font-black text-[8px] uppercase tracking-[2px]">Progress</Text>
              <View className="flex-row items-center">
                <Text className="text-cyan-400 font-mono text-xs mr-2">{quest.currentCount} / {quest.targetCount}</Text>
                {quest.isCompleted && <Zap size={12} color="#10b981" />}
              </View>
            </View>
            {quest.isCompleted && (
              <TouchableOpacity 
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  completeQuest(quest.id);
                }}
                className="mt-4 bg-emerald-600 h-12 rounded-xl flex-row items-center justify-center shadow-lg shadow-emerald-900/20"
              >
                <Gift size={16} color="#fff" className="mr-2" />
                <Text className="text-white font-black text-xs uppercase tracking-[4px]">Complete Quest</Text>
              </TouchableOpacity>
            )}
            {quest.id === 'q-millers-junction-depths' && !quest.isCompleted && (
              <TouchableOpacity 
                onPress={() => {
                  useUIStore.getState().setPendingMapAction({
                    type: 'center',
                    coords: MILLERS_JUNCTION_DEPTHS_COORDS,
                    zoom: 0.005
                  });
                  router.replace('/(tabs)/explore');
                }}
                className="mt-4 bg-purple-600/20 border border-purple-500/40 p-4 rounded-2xl flex-row items-center justify-center"
              >
                <Navigation size={14} color="#a855f7" className="mr-2" />
                <Text className="text-purple-400 font-black text-[10px] uppercase tracking-widest">Take me there</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </Animated.View>
  );

  const renderCodex = () => {
    const allEnemies = [
      ...Object.values(ENEMY_DATABASE).flat(),
      ...Object.values(BOSS_DATABASE).flat(),
    ].map(enemy => ({
      ...enemy,
      lastDefeatedAt: bestiary[enemy.name]?.lastDefeatedAt || 0
    })).sort((a, b) => b.lastDefeatedAt - a.lastDefeatedAt);

    const discoveredZonesList = Object.values(discoveredZones).sort((a, b) => b.discoveryDate - a.discoveryDate);

    return (
      <Animated.View entering={FadeIn} className="flex-1">
        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-6 px-1">
          Manifestation Bestiary
        </Text>
        <View className="space-y-4 mb-10">
          {allEnemies.map((enemy, index) => {
            const entry = bestiary[enemy.name];
            const isEncountered = (entry?.encounters || 0) > 0;
            const isDefeatedOnce = (entry?.defeats || 0) > 0;
            const isMastered = (entry?.defeats || 0) >= 5;
            const isNew = entry?.lastDefeatedAt && (Date.now() - entry.lastDefeatedAt < 24 * 60 * 60 * 1000);

            if (!isEncountered) {
              return (
                <View key={enemy.name} className="bg-zinc-900/20 border border-zinc-900 border-dashed p-5 rounded-3xl flex-row items-center mb-4 opacity-40">
                  <View className="bg-zinc-900 p-3 rounded-2xl mr-4">
                    <Eye size={20} color="#27272a" />
                  </View>
                  <Text className="text-zinc-800 font-bold text-lg tracking-widest">??? ??? ???</Text>
                </View>
              );
            }

            return (
              <View 
                key={enemy.name}
                className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <View className={`p-3 rounded-2xl mr-4 border ${isMastered ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-800 border-zinc-700'}`}>
                      <Skull size={20} color={isMastered ? "#ef4444" : "#71717a"} />
                    </View>
                    <View>
                      <View className="flex-row items-center">
                        <Text className="text-white font-bold text-lg">{enemy.name}</Text>
                        {isNew && (
                          <View className="bg-cyan-500 px-2 py-0.5 rounded-full ml-2">
                            <Text className="text-[8px] font-black uppercase text-cyan-950">New</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Defeats: {entry?.defeats || 0}
                      </Text>
                    </View>
                  </View>
                </View>
                {isDefeatedOnce && (
                  <Text className="text-zinc-400 text-xs leading-5 italic">
                    {isMastered ? enemy.description : "A strange manifestation from the static. More data required to analyze behaviors."}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <Text className="text-zinc-600 font-bold uppercase tracking-[3px] text-[10px] mb-6 px-1">
          Zone Records
        </Text>
        {discoveredZonesList.length === 0 ? (
          <View className="bg-zinc-900/20 border border-zinc-900 border-dashed p-10 rounded-3xl items-center">
            <Text className="text-zinc-700 font-bold italic text-center">No zones synthesized yet.</Text>
          </View>
        ) : (
          discoveredZonesList.map((zone) => {
            const isNewZone = (Date.now() - zone.discoveryDate < 24 * 60 * 60 * 1000);
            return (
              <View key={zone.suburb} className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg">{zone.suburb}</Text>
                    {isNewZone && (
                      <View className="bg-cyan-500 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-[8px] font-black uppercase text-cyan-950">New</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-cyan-500 font-mono text-[8px] uppercase tracking-widest">{zone.biome}</Text>
                </View>
                <Text className="text-zinc-500 text-[10px] mb-2 uppercase tracking-widest">Dominant: {zone.faction}</Text>
                <Text className="text-zinc-400 text-xs italic leading-5" numberOfLines={3}>{zone.wikiSummary}</Text>
              </View>
            );
          })
        )}
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      {/* Sub-Navigation Tabs */}
      <View className="flex-row mb-8 bg-zinc-900/30 p-1 rounded-2xl border border-zinc-900">
        {(['Stats', 'Skills', 'Quests', 'Codex'] as HeroTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === tab ? 'bg-cyan-500/10 border border-cyan-500/20' : ''}`}
          >
            <Text className={`font-bold text-[10px] uppercase tracking-widest ${activeTab === tab ? 'text-cyan-400' : 'text-zinc-600'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {activeTab === 'Stats' && renderStats()}
        {activeTab === 'Skills' && renderSkills()}
        {activeTab === 'Quests' && renderQuests()}
        {activeTab === 'Codex' && renderCodex()}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
