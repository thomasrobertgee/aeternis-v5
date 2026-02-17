import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useCombatStore } from '../../utils/useCombatStore';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useUIStore } from '../../utils/useUIStore';
import { getLootForEnemy } from '../../utils/LootTable';
import { Sword, Zap, Briefcase, Footprints, ShieldAlert, Skull, Package, Activity, Navigation, Radar } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  FadeInDown,
  SlideInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withRepeat,
  interpolateColor
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { getDistance, formatDistance } from '../../utils/MathUtils';
import * as Haptics from 'expo-haptics';
import SoundService from '../../utils/SoundService';

export default function BattleScreen() {
  const router = useRouter();
  const player = usePlayerStore();
  const { activeWorldEvent } = useUIStore();
  const { hostileSignals, removeSignal, recordEncounter, recordDefeat } = player;
  
  const { 
    isInCombat, 
    enemyName, 
    enemyHp, 
    maxEnemyHp, 
    playerHp, 
    maxPlayerHp, 
    playerMana, 
    maxPlayerMana,
    combatLogs,
    isPlayerTurn,
    updateHp,
    updateMana,
    addLog,
    nextTurn,
    endCombat,
    initiateCombat,
    sourceId,
    damageModifier,
    biome
  } = useCombatStore();

  const setGlobalStats = usePlayerStore((state) => state.setStats);
  const addItem = usePlayerStore((state) => state.addItem);
  const gainXp = usePlayerStore((state) => state.gainXp);
  const updateQuestProgress = usePlayerStore((state) => state.updateQuestProgress);

  const [isResolving, setIsResolving] = useState(false);
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // Reset local processing state when combat starts/ends
  useEffect(() => {
    if (isInCombat) {
      setIsActionProcessing(false);
      setIsResolving(false);
    }
  }, [isInCombat]);

  // Filter and sort nearby threats (within 10km) that are NOT on cooldown
  const nearbyThreats = (hostileSignals || [])
    .filter(s => !s.respawnAt) // Only show active signals
    .map(signal => ({
      ...signal,
      distance: getDistance(player.playerLocation, signal.coords)
    }))
    .filter(signal => signal.distance <= 10)
    .sort((a, b) => a.distance - b.distance);

  const handleEngage = (signal: any) => {
    // This is for direct engage from the scanner list
    initiateCombat('Fracture Manifestation', 60, player.hp, player.maxHp, player.mana, player.maxMana, signal.id);
  };

  // Record encounter and switch music when combat starts
  useEffect(() => {
    if (isInCombat && enemyName) {
      recordEncounter(enemyName);
      SoundService.playBattle();
    } else if (!isInCombat) {
      SoundService.playAmbient();
    }
  }, [isInCombat, enemyName]);

  // Animations
  const enemyShake = useSharedValue(0);
  const screenFlash = useSharedValue(0);

  const enemyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: enemyShake.value }],
  }));

  const screenFlashStyle = useAnimatedStyle(() => ({
    backgroundColor: 'rgba(239, 68, 68, 0.4)', // red-500
    opacity: screenFlash.value,
  }));

  const triggerEnemyShake = () => {
    enemyShake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const triggerScreenFlash = () => {
    screenFlash.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 200 })
    );
  };

  // Resolution Logic
  useEffect(() => {
    if (!isInCombat) return;

    if (enemyHp <= 0 && !isResolving) {
      setIsResolving(true);
      addLog(`${enemyName} has been purged from the Fracture.`, 'system');
      
      const isTutorialDog = sourceId === 'tutorial-dog-signal';
      const isMultiTutorialDog = sourceId?.startsWith('tutorial-dog-multi');

      // Bestiary Update
      recordDefeat(enemyName);

      if (isTutorialDog || isMultiTutorialDog) {
        // Special Tutorial Logic
        let goldLoot = 1;
        addLog(`Recovered ${goldLoot} Aetium from the remains.`, 'system');
        
        // Guaranteed both potions for any tutorial dog
        const hpPotion = { id: `hp-pot-${Date.now()}`, name: 'Health Potion', category: 'Utility', rarity: 'Common', description: 'Restores 50 HP.' };
        const mpPotion = { id: `mp-pot-${Date.now()}`, name: 'Mana Potion', category: 'Utility', rarity: 'Common', description: 'Restores 30 MP.' };
        
        addItem(hpPotion as any);
        addItem(mpPotion as any);
        addLog(`Acquired: Health Potion, Mana Potion`, 'system');

        if (isMultiTutorialDog) {
          updateQuestProgress('q-tutorial-dogs', 1);

          const quest = usePlayerStore.getState().activeQuests.find(q => q.id === 'q-tutorial-dogs');
          if (quest && quest.currentCount + 1 >= quest.targetCount) {
            player.updateTutorial({ currentStep: 35, isTutorialActive: false }); // Narrative checkpoint
          }
        } else {
          player.updateTutorial({ currentStep: 23, isTutorialActive: false }); // Narrative checkpoint
        }
        
        setTimeout(() => {
          const currentGold = usePlayerStore.getState().gold;
          setGlobalStats({ 
            hp: playerHp, 
            mana: playerMana,
            gold: currentGold + goldLoot
          });
          endCombat();
          setIsResolving(false);
          router.replace('/explore');
        }, 2500);
        return;
      }

      // Standard Combat Logic
      updateQuestProgress('q-secure-the-west', 1);

      // Remove from map/list and trigger respawn timer
      if (sourceId) {
        removeSignal(sourceId);
      }

      // Calculate Aetium loot
      let goldLoot = 25 + Math.floor(Math.random() * 50);
      if (activeWorldEvent?.lootMultiplier['Aetium']) {
        goldLoot = Math.floor(goldLoot * activeWorldEvent.lootMultiplier['Aetium']);
      }
      addLog(`Recovered ${goldLoot} Aetium from the remains.`, 'system');

      // Calculate XP
      const xpGained = 40 + Math.floor(Math.random() * 30);
      addLog(`Synchronization improved (+${xpGained} XP)`, 'system');
      
      // Calculate Item loot
      const itemLoot = getLootForEnemy(enemyName, biome);
      if (itemLoot) {
        let finalItem = itemLoot;
        if (activeWorldEvent?.lootMultiplier[itemLoot.name]) {
          addLog(`EVENT BONUS: Extra ${itemLoot.name} recovered!`, 'system');
          // For now, "doubling" just means we give it to them. 
          // Future: actually add 2 to inventory if we update addItem to support counts
          addItem(itemLoot); 
        }
        addItem(finalItem);
        addLog(`Acquired: ${finalItem.name}`, 'system');
      }
      
      setTimeout(() => {
        const currentGold = usePlayerStore.getState().gold;
        gainXp(xpGained);
        setGlobalStats({ 
          hp: playerHp, 
          mana: playerMana,
          gold: currentGold + goldLoot
        });
        endCombat();
        setIsResolving(false);
      }, 2500);
    }

    if (playerHp <= 0 && !isResolving) {
      setIsResolving(true);
      addLog("Your synchronization with the Fracture fails...", "enemy");
      
      setTimeout(() => {
        setGlobalStats({ hp: 10, mana: 10 }); // Weakened state
        endCombat();
        setIsResolving(false);
        router.push('/explore');
      }, 3000);
    }
  }, [enemyHp, playerHp]);

  // Player Actions
  const handleAttack = () => {
    if (!isPlayerTurn || isResolving || isActionProcessing) return;
    setIsActionProcessing(true);
    
    const isCrit = Math.random() < 0.15;
    const critMult = isCrit ? 1.75 : 1;
    
    const baseDmg = player.attack + Math.floor(Math.random() * 5);
    const damage = Math.floor(baseDmg * (damageModifier || 1.0) * critMult);
    
    if (isCrit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      SoundService.playCrit();
      addLog(`CRITICAL HIT!`, 'player');
    }

    triggerEnemyShake();
    updateHp('enemy', -damage);
    addLog(`You strike the ${enemyName} for ${damage} damage.${damageModifier !== 1 ? ' (Weather Mod)' : ''}`, 'player');
    
    if (enemyHp - damage > 0) {
      setTimeout(() => {
        setIsActionProcessing(false);
        nextTurn();
      }, 800);
    }
  };

  const handleSkill = () => {
    if (!isPlayerTurn || playerMana < 15 || isResolving || isActionProcessing) return;
    setIsActionProcessing(true);
    
    const isCrit = Math.random() < 0.15;
    const critMult = isCrit ? 1.75 : 1;
    
    const baseDmg = Math.floor(player.attack * 1.5) + Math.floor(Math.random() * 5);
    const damage = Math.floor(baseDmg * (damageModifier || 1.0) * critMult);
    
    if (isCrit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      SoundService.playCrit();
      addLog(`CRITICAL HIT!`, 'player');
    }

    triggerEnemyShake();
    updateMana(-15);
    updateHp('enemy', -damage);
    const skillName = player.skills[0]?.name || "Axe Sweep";
    addLog(`You perform a ${skillName}! ${damage} damage dealt.${damageModifier !== 1 ? ' (Weather Mod)' : ''}`, 'player');
    
    if (enemyHp - damage > 0) {
      setTimeout(() => {
        setIsActionProcessing(false);
        nextTurn();
      }, 800);
    }
  };

  const handleFlee = () => {
    if (isResolving || sourceId?.startsWith('tutorial-dog')) return;
    addLog("You attempt to slip back into the static...", "system");
    setTimeout(() => {
      setGlobalStats({ hp: playerHp, mana: playerMana });
      endCombat();
    }, 1000);
  };

  // Enemy AI
  useEffect(() => {
    if (!isPlayerTurn && isInCombat && !isResolving) {
      const timer = setTimeout(() => {
        const baseDamage = 15 + Math.floor(Math.random() * 8);
        const eventMult = activeWorldEvent?.difficultyMultiplier || 1.0;
        const damage = Math.max(1, Math.floor(baseDamage * eventMult) - player.defense);
        
        triggerScreenFlash();
        updateHp('player', -damage);
        addLog(`The ${enemyName} retaliates! ${damage} damage received (${player.defense} blocked).${eventMult > 1 ? ' (Event Boost)' : ''}`, 'enemy');
        nextTurn();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, isInCombat, isResolving, player.defense, activeWorldEvent]);

  if (!isInCombat) {
    return (
      <ScrollView className="flex-1 bg-zinc-950 px-6 pt-16">
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <Radar size={24} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 font-bold uppercase tracking-[4px] text-xs">
              Scanner: Operational
            </Text>
          </View>
          <Text className="text-white text-4xl font-black tracking-tight">Nearby Threats</Text>
          <Text className="text-zinc-500 text-sm font-medium uppercase tracking-[2px]">
            Hostile signals detected in your perimeter
          </Text>
        </View>

        {nearbyThreats.length > 0 ? (
          <View className="space-y-4">
            {nearbyThreats.map((signal, index) => (
              <Animated.View 
                key={signal.id} 
                entering={FadeInDown.delay(index * 100).duration(500)}
                className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-red-500/10 p-3 rounded-2xl mr-4 border border-red-500/20">
                      <Activity size={20} color="#ef4444" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-lg">Fracture Signal</Text>
                      <View className="flex-row items-center mt-0.5">
                        <Navigation size={10} color="#71717a" className="mr-1" />
                        <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          Distance: {formatDistance(signal.distance)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleEngage(signal)}
                    className="bg-red-600 px-5 py-2.5 rounded-xl shadow-lg shadow-red-900/40"
                  >
                    <Text className="text-white font-black text-[10px] uppercase">Engage</Text>
                  </TouchableOpacity>
                </View>
                
                <Text className="text-zinc-500 text-[10px] italic">
                  Signal strength is stable. Manifestation confirmed in this sector.
                </Text>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20 bg-zinc-900/30 rounded-[40px] border border-dashed border-zinc-800">
            <ShieldAlert size={48} color="#3f3f46" />
            <Text className="text-zinc-500 font-bold uppercase tracking-widest mt-4">
              Clear Perimeter
            </Text>
            <Text className="text-zinc-700 text-xs mt-2 text-center px-10">
              No hostile manifestations within 10km. Travel to new sectors to locate targets.
            </Text>
          </View>
        )}
        
        <View className="h-20" />
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-16">
      <Animated.View style={[StyleSheet.absoluteFill, screenFlashStyle, { zIndex: 50, pointerEvents: 'none' }]} />

      {/* Enemy Section */}
      <Animated.View 
        entering={FadeIn.duration(800)} 
        style={enemyAnimatedStyle}
        className="mb-12"
      >
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-red-500 font-black uppercase tracking-[4px] text-xs">
            Hostile Manifestation
          </Text>
          <Text className="text-white font-mono text-xs">{enemyHp} / {maxEnemyHp}</Text>
        </View>
        <Text className="text-white text-3xl font-black mb-4">{enemyName}</Text>
        <View className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-lg">
          <View 
            className="h-full bg-red-600 shadow-lg shadow-red-500" 
            style={{ width: `${Math.max(0, (enemyHp / maxEnemyHp) * 100)}%` }} 
          />
        </View>
      </Animated.View>

      {/* Combat Logs */}
      <View className="flex-1 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-5 mb-8 overflow-hidden shadow-inner">
        <ScrollView showsVerticalScrollIndicator={false}>
          {combatLogs.map((log) => (
            <Animated.View entering={FadeIn} key={log.id} className="mb-3">
              <Text className={`text-xs font-medium ${
                log.type === 'player' ? 'text-cyan-400' : 
                log.type === 'enemy' ? 'text-red-400' : 'text-zinc-500 italic'
              }`}>
                {log.type === 'system' ? '' : log.type === 'player' ? '>> ' : '<< '}
                {log.message}
              </Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Action Menu */}
      <Animated.View entering={SlideInDown.duration(500)} className="flex-row flex-wrap gap-3 pb-12">
        {isResolving && enemyHp <= 0 ? (
          <View className="w-full bg-emerald-950/20 border border-emerald-900/30 p-8 rounded-[32px] items-center">
             <Text className="text-emerald-400 font-black text-xl uppercase tracking-[6px] mb-2">Victory</Text>
             <Text className="text-zinc-500 text-xs">Purge complete. Synchronizing data...</Text>
          </View>
        ) : isResolving && playerHp <= 0 ? (
          <View className="w-full bg-red-950/20 border border-red-900/30 p-8 rounded-[32px] items-center">
             <Skull size={32} color="#ef4444" className="mb-4" />
             <Text className="text-red-500 font-black text-xl uppercase tracking-[6px] mb-2">Defeat</Text>
             <Text className="text-zinc-500 text-xs text-center">Connection lost. Reconstituting physical form...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              onPress={handleAttack}
              disabled={!isPlayerTurn}
              className={`flex-1 min-w-[45%] h-16 rounded-2xl flex-row items-center justify-center border ${
                isPlayerTurn ? 'bg-zinc-900 border-zinc-800 shadow-md shadow-black' : 'bg-zinc-950 border-zinc-900 opacity-30'
              }`}
            >
              <Sword size={18} color={isPlayerTurn ? "#fff" : "#3f3f46"} className="mr-2" />
              <Text className="text-white font-bold uppercase tracking-widest text-xs">Attack</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSkill}
              disabled={!isPlayerTurn || playerMana < 15}
              className={`flex-1 min-w-[45%] h-16 rounded-2xl flex-row items-center justify-center border ${
                isPlayerTurn && playerMana >= 15 ? 'bg-cyan-950/30 border-cyan-800' : 'bg-zinc-950 border-zinc-900 opacity-30'
              }`}
            >
              <Zap size={18} color={playerMana >= 15 ? "#06b6d4" : "#3f3f46"} className="mr-2" />
              <View>
                <Text className={`font-bold uppercase tracking-widest text-[10px] ${playerMana >= 15 ? 'text-cyan-400' : 'text-zinc-600'}`}>
                  {player.skills[0]?.name || "Axe Sweep"}
                </Text>
                <Text className="text-[8px] text-cyan-700 font-bold">-15 MP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                if (player.tutorialProgress.currentStep < 23) {
                  alert("Utility items are not yet synchronized with your HUD.");
                  return;
                }
                router.replace('/inventory');
              }}
              disabled={!isPlayerTurn}
              className={`flex-1 min-w-[45%] h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center justify-center shadow-md shadow-black ${
                (!isPlayerTurn || player.tutorialProgress.currentStep < 23) ? 'opacity-30' : 'active:scale-95'
              }`}
            >
              <Briefcase size={18} color={player.tutorialProgress.currentStep < 23 ? "#3f3f46" : "#fff"} className="mr-2" />
              <Text className={`${player.tutorialProgress.currentStep < 23 ? 'text-zinc-600' : 'text-white'} font-bold uppercase tracking-widest text-xs`}>Item</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleFlee}
              disabled={sourceId?.startsWith('tutorial-dog')}
              className={`flex-1 min-w-[45%] h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center justify-center shadow-md shadow-black ${sourceId?.startsWith('tutorial-dog') ? 'opacity-30' : ''}`}
            >
              <Footprints size={18} color={sourceId?.startsWith('tutorial-dog') ? "#3f3f46" : "#71717a"} className="mr-2" />
              <Text className={`${sourceId?.startsWith('tutorial-dog') ? 'text-zinc-600' : 'text-zinc-400'} font-bold uppercase tracking-widest text-xs`}>Flee</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}
