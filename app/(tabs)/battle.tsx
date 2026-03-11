import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useCombatStore } from '../../utils/useCombatStore';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useUIStore } from '../../utils/useUIStore';
import { getLootForEnemy } from '../../utils/LootTable';
import { getDeterministicEnemy, getBossByBiome } from '../../utils/EnemyFactory';
import { Sword, Zap, Briefcase, Footprints, ShieldAlert, Skull, Package, Activity, Navigation, Radar, Home, Flame, MapPin, Award } from 'lucide-react-native';
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
import { useDungeonStore } from '../../utils/useDungeonStore';
import { useBehaviourStore } from '../../utils/useBehaviourStore';
import { MILLERS_JUNCTION_DEPTHS_COORDS, ALTONA_GATE_COORDS } from '../../utils/Constants';

export default function BattleScreen() {
  const router = useRouter();
  
  // Selectors for Player Store
  const playerLocation = usePlayerStore((state) => state.playerLocation);
  const hp = usePlayerStore((state) => state.hp);
  const maxHp = usePlayerStore((state) => state.maxHp);
  const mana = usePlayerStore((state) => state.mana);
  const maxMana = usePlayerStore((state) => state.maxMana);
  const hostileSignals = usePlayerStore((state) => state.hostileSignals);
  const removeSignal = usePlayerStore((state) => state.removeSignal);
  const recordEncounter = usePlayerStore((state) => state.recordEncounter);
  const recordDefeat = usePlayerStore((state) => state.recordDefeat);
  const skills = usePlayerStore((state) => state.skills);
  const tutorialProgress = usePlayerStore((state) => state.tutorialProgress);
  const updateTutorial = usePlayerStore((state) => state.updateTutorial);
  const setGlobalStats = usePlayerStore((state) => state.setStats);
  const addItem = usePlayerStore((state) => state.addItem);
  const gainXp = usePlayerStore((state) => state.gainXp);
  const updateQuestProgress = usePlayerStore((state) => state.updateQuestProgress);
  const activeQuests = usePlayerStore((state) => state.activeQuests);

  // Selectors for Dungeon Store
  const isInsideDungeon = useDungeonStore((state) => state.isInsideDungeon);
  const currentDungeonId = useDungeonStore((state) => state.currentDungeonId);
  const currentStage = useDungeonStore((state) => state.currentStage);
  const modifiers = useDungeonStore((state) => state.modifiers);
  const enemiesKilled = useDungeonStore((state) => state.enemiesKilled);
  const chestsOpened = useDungeonStore((state) => state.chestsOpened);
  const altarsUsed = useDungeonStore((state) => state.altarsUsed);
  const restAreasFound = useDungeonStore((state) => state.restAreasFound);
  const totalDamageDealtDungeon = useDungeonStore((state) => state.totalDamageDealt);
  const totalDamageReceivedDungeon = useDungeonStore((state) => state.totalDamageReceived);
  const aetiumGained = useDungeonStore((state) => state.aetiumGained);
  const lootAcquired = useDungeonStore((state) => state.lootAcquired);
  const showDungeonSummary = useDungeonStore((state) => state.showDungeonSummary);
  const batchRecordStats = useDungeonStore((state) => state.batchRecordStats);
  const setShowDungeonSummary = useDungeonStore((state) => state.setShowDungeonSummary);
  const exitDungeon = useDungeonStore((state) => state.exitDungeon);
  const nextStage = useDungeonStore((state) => state.nextStage);

  // Selectors for UI Store
  const activeWorldEvent = useUIStore((state) => state.activeWorldEvent);
  const setPendingMapAction = useUIStore((state) => state.setPendingMapAction);
  
  // Selectors for Combat Store
  const isInCombat = useCombatStore((state) => state.isInCombat);
  const enemyName = useCombatStore((state) => state.enemyName);
  const enemyHp = useCombatStore((state) => state.enemyHp);
  const maxEnemyHp = useCombatStore((state) => state.maxEnemyHp);
  const playerHpCombat = useCombatStore((state) => state.playerHp);
  const maxPlayerHpCombat = useCombatStore((state) => state.maxPlayerHp);
  const playerManaCombat = useCombatStore((state) => state.playerMana);
  const maxPlayerManaCombat = useCombatStore((state) => state.maxPlayerMana);
  const playerAttack = useCombatStore((state) => state.playerAttack);
  const playerDefense = useCombatStore((state) => state.playerDefense);
  const combatLogs = useCombatStore((state) => state.combatLogs);
  const isPlayerTurn = useCombatStore((state) => state.isPlayerTurn);
  const updateHp = useCombatStore((state) => state.updateHp);
  const updateMana = useCombatStore((state) => state.updateMana);
  const addLog = useCombatStore((state) => state.addLog);
  const nextTurn = useCombatStore((state) => state.nextTurn);
  const endCombat = useCombatStore((state) => state.endCombat);
  const initiateCombat = useCombatStore((state) => state.initiateCombat);
  const sourceId = useCombatStore((state) => state.sourceId);
  const damageModifier = useCombatStore((state) => state.damageModifier);
  const biome = useCombatStore((state) => state.biome);
  const showSummary = useCombatStore((state) => state.showSummary);
  const setShowSummary = useCombatStore((state) => state.setShowSummary);
  const totalDamageDealt = useCombatStore((state) => state.totalDamageDealt);
  const totalDamageReceived = useCombatStore((state) => state.totalDamageReceived);
  const lootedAetium = useCombatStore((state) => state.lootedAetium);
  const lootedItems = useCombatStore((state) => state.lootedItems);
  const recordLoot = useCombatStore((state) => state.recordLoot);

  const [isResolving, setIsResolving] = useState(false);
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // Reset local processing state when combat starts/ends or summary is shown
  useEffect(() => {
    if (isInCombat) {
      setIsActionProcessing(false);
      setIsResolving(false);
    }
  }, [isInCombat, showSummary, showDungeonSummary]);

  // Combine and sort ALL nearby points of interest (within 20km)
  const nearbyPOI = useMemo(() => {
    const pois = [];

    // 1. Hostile Signals
    (hostileSignals || []).filter(s => !s.respawnAt).forEach(s => {
      pois.push({
        id: s.id,
        title: s.type === 'Boss' ? 'Fracture Rift' : 'Hostile Entity',
        type: 'Hostile',
        coords: s.coords,
        distance: getDistance(playerLocation, s.coords),
        biome: s.biome,
        signalType: s.type
      });
    });

    // 2. Settlements
    pois.push({
      id: 'poi-settlement-altona-gate',
      title: 'Altona Gate Enclave',
      type: 'Settlement',
      coords: ALTONA_GATE_COORDS,
      distance: getDistance(playerLocation, ALTONA_GATE_COORDS)
    });

    // 3. Dungeons
    pois.push({
      id: 'poi-dungeon-millers-junction',
      title: "Miller's Junction Depths",
      type: 'Dungeon',
      coords: MILLERS_JUNCTION_DEPTHS_COORDS,
      distance: getDistance(playerLocation, MILLERS_JUNCTION_DEPTHS_COORDS)
    });

    return pois
      .filter(p => p.distance <= 20)
      .sort((a, b) => a.distance - b.distance);
  }, [hostileSignals, playerLocation]);

  const handleAction = (poi: any) => {
    if (poi.type === 'Hostile') {
      initiateCombat(poi.title === 'Fracture Rift' ? 'Rift Entity' : 'Fracture Manifestation', 60, hp, maxHp, mana, maxMana, poi.id);
      return;
    }
    
    // For non-combat POIs, center map on them and navigate to Explore
    setPendingMapAction({
      type: 'center',
      coords: poi.coords,
      zoom: 0.005
    });
    setTimeout(() => router.replace('/(tabs)/explore'), 50);
  };

  // Record encounter and switch music when combat starts
  useEffect(() => {
    if (isInCombat && enemyName && !showSummary && !showDungeonSummary) {
      recordEncounter(enemyName);
      SoundService.playBattle();
    } else if (!isInCombat || showSummary || showDungeonSummary) {
      SoundService.playAmbient();
    }
  }, [isInCombat, enemyName, showSummary, showDungeonSummary]);

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
    if (!isInCombat || showSummary || showDungeonSummary) return;

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
        let xpReward = isTutorialDog ? 100 : 50;
        
        addLog(`Recovered ${goldLoot} Aetium from the remains.`, 'system');
        addLog(`Synchronization improved (+${xpReward} XP)`, 'system');
        
        // Remove from map immediately
        if (sourceId) {
          removeSignal(sourceId);
        }
        
        // Guaranteed both potions for any tutorial dog
        const hpPotion = { id: `hp-pot-${Date.now()}`, name: 'Health Potion', category: 'Utility', rarity: 'Common', description: 'Restores 50 HP.' };
        const mpPotion = { id: `mp-pot-${Date.now()}`, name: 'Mana Potion', category: 'Utility', rarity: 'Common', description: 'Restores 30 MP.' };
        
        addItem(hpPotion as any);
        addItem(mpPotion as any);
        addLog(`Acquired: Health Potion, Mana Potion`, 'system');

        const battleLootItems = ['Health Potion', 'Mana Potion'];

        if (isMultiTutorialDog) {
          updateQuestProgress('q-tutorial-dogs', 1);

          // Use getState() to get the updated quests immediately after calling updateQuestProgress
          const latestQuests = usePlayerStore.getState().activeQuests;
          const quest = latestQuests.find(q => q.id === 'q-tutorial-dogs');
          if (quest && quest.currentCount >= quest.targetCount) {
            useBehaviourStore.getState().recordAction('COMPLETE_FIRST_QUEST');
            updateTutorial({ currentStep: 36 }); // Narrative checkpoint: "You collapse..."
          }
        } else {
          updateTutorial({ currentStep: 24 }); // Narrative checkpoint: "After finally defeating..."
        }
        
        setTimeout(() => {
          const currentGold = usePlayerStore.getState().gold;
          setGlobalStats({ 
            hp: playerHpCombat, 
            mana: playerManaCombat,
            gold: currentGold + goldLoot
          });
          gainXp(xpReward);
          
          recordLoot(goldLoot, battleLootItems);
          setShowSummary(true);
          setIsResolving(false);
          setIsActionProcessing(false);
        }, 1000);
        return;
      }

      // Standard Combat Logic
      if (sourceId === 'dungeon-boss') {
        useBehaviourStore.getState().recordAction('DEFEAT_BOSS');
        updateQuestProgress('q-millers-junction-depths', 1);
      } else {
        // Update all active culling quests if appropriate
        activeQuests.forEach(q => {
          if (q.id === 'q-secure-the-west' || q.title.toLowerCase().includes('culling') || q.title.toLowerCase().includes('defeat')) {
            updateQuestProgress(q.id, 1);
          }
        });
      }

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
      const battleLootItems: string[] = [];
      if (itemLoot) {
        let finalItem = itemLoot;
        if (activeWorldEvent?.lootMultiplier[itemLoot.name]) {
          addLog(`EVENT BONUS: Extra ${itemLoot.name} recovered!`, 'system');
          addItem(itemLoot); 
          battleLootItems.push(itemLoot.name);
        }
        addItem(finalItem);
        battleLootItems.push(finalItem.name);
        addLog(`Acquired: ${finalItem.name}`, 'system');
      }
      
      setTimeout(() => {
        const currentGold = usePlayerStore.getState().gold;
        setGlobalStats({ 
          hp: playerHpCombat, 
          mana: playerManaCombat,
          gold: currentGold + goldLoot
        });
        gainXp(xpGained);
        
        recordLoot(goldLoot, battleLootItems);
        setShowSummary(true);
        setIsResolving(false);
        setIsActionProcessing(false);
      }, 1000);
    }

    if (playerHpCombat <= 0 && !isResolving) {
      setIsResolving(true);
      addLog("Your synchronization with the Fracture fails...", "enemy");
      
      setTimeout(() => {
        setGlobalStats({ hp: 10, mana: 10 }); // Weakened state
        setIsResolving(false);
        setTimeout(() => {
          endCombat();
          router.replace('/(tabs)/explore');
        }, 0);
      }, 1500);
    }
  }, [enemyHp, playerHpCombat, showSummary, showDungeonSummary]);

  const handleContinue = useCallback(() => {
    if (isActionProcessing) return;
    setIsActionProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isInsideDungeon) {
      // Consolidate Stats to Dungeon Store before ending combat or transitioning
      batchRecordStats({
        damageDealt: totalDamageDealt,
        damageReceived: totalDamageReceived,
        kill: true,
        loot: lootedItems,
        aetium: lootedAetium
      });

      if (currentStage === 10) {
        // Dungeon Cleared! Transition to Dungeon Summary screen
        // IMPORTANT: We keep isInCombat TRUE here to maintain navigation context in layout
        setShowSummary(false); // Clear the battle summary overlay
        setShowDungeonSummary(true); // Show the dungeon summary overlay
        setIsActionProcessing(false);
      } else {
        nextStage();
        setTimeout(() => {
          endCombat();
          setIsActionProcessing(false);
          router.replace('/(tabs)/dungeon');
        }, 0);
      }
    } else {
      setTimeout(() => {
        endCombat();
        setIsActionProcessing(false);
        router.replace('/(tabs)/explore');
      }, 0);
    }
  }, [isInsideDungeon, currentStage, isActionProcessing, batchRecordStats, setShowDungeonSummary, setShowSummary, nextStage, totalDamageDealt, totalDamageReceived, lootedItems, lootedAetium, endCombat, router]);

  const handleDungeonFinish = useCallback(() => {
    if (isActionProcessing) return;
    setIsActionProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    updateTutorial({ currentStep: 45 });
    setShowDungeonSummary(false); // Clear UI state first
    exitDungeon(); // Clear underlying data
    setTimeout(() => {
      endCombat(); // Now we safely clear combat state and navigate
      setIsActionProcessing(false);
      router.replace('/(tabs)/explore');
    }, 0);
  }, [updateTutorial, isActionProcessing, setShowDungeonSummary, exitDungeon, endCombat, router]);

  // Player Actions
  const handleAttack = () => {
    if (!isPlayerTurn || isResolving || isActionProcessing || showSummary || showDungeonSummary) return;
    setIsActionProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    SoundService.playHit();
    
    const isCrit = Math.random() < 0.15;
    const critMult = isCrit ? 1.75 : 1;
    
    const baseDmg = Math.floor(playerAttack * 1.5) + Math.floor(Math.random() * 5);
    const damage = Math.floor(baseDmg * (damageModifier || 1.0) * critMult);
    
    if (isCrit) {
      addLog(`CRITICAL HIT! Dealt ${damage} damage to ${enemyName}!`, 'player');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      addLog(`You strike the ${enemyName} for ${damage} damage.`, 'player');
    }
    
    triggerEnemyShake();
    updateHp('enemy', -damage);
    
    if (enemyHp - damage > 0) {
      setTimeout(() => {
        setIsActionProcessing(false);
        nextTurn();
      }, 500);
    }
  };

  const handleSkill = () => {
    if (!isPlayerTurn || playerManaCombat < 15 || isResolving || isActionProcessing || showSummary || showDungeonSummary) return;
    setIsActionProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    SoundService.playHit();
    updateMana(-15);

    const damage = Math.floor(playerAttack * 2.5) + 10;
    const skillName = skills.find(s => s.type === 'Active')?.name || "Axe Sweep";
    addLog(`You trigger ${skillName}! Dealt ${damage} resonance damage.`, 'player');
    
    triggerEnemyShake();
    updateHp('enemy', -damage);

    if (enemyHp - damage > 0) {
      setTimeout(() => {
        setIsActionProcessing(false);
        nextTurn();
      }, 600);
    }
  };

  const handleFlee = () => {
    if (isResolving || isActionProcessing || sourceId?.startsWith('tutorial-dog') || showSummary || showDungeonSummary) return;
    setIsActionProcessing(true);
    addLog("You attempt to slip back into the static...", "system");

    const hpPercent = playerHpCombat / maxPlayerHpCombat;
    if (hpPercent < 0.3) {
      useBehaviourStore.getState().recordAction('FLEE_COMBAT_LOW_HP');
    } else {
      useBehaviourStore.getState().recordAction('FLEE_COMBAT_HIGH_HP');
    }

    setTimeout(() => {
      setGlobalStats({ hp: playerHpCombat, mana: playerManaCombat });
      setTimeout(() => {
        endCombat();
        router.replace('/(tabs)/explore');
      }, 0);
    }, 500);
  };

  // Enemy AI Effect
  useEffect(() => {
    if (!isPlayerTurn && isInCombat && enemyHp > 0 && !isActionProcessing && !showSummary && !showDungeonSummary) {
      setIsActionProcessing(true);
      
      setTimeout(() => {
        const damage = Math.max(1, Math.floor(15 + Math.random() * 10) - Math.floor(playerDefense / 2));
        addLog(`${enemyName} strikes for ${damage} damage!`, 'enemy');
        
        triggerScreenFlash();
        updateHp('player', -damage);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        setTimeout(() => {
          setIsActionProcessing(false);
          nextTurn();
        }, 400);
      }, 750);
    }
  }, [isPlayerTurn, isInCombat, enemyHp, showSummary, showDungeonSummary]);

  // Main UI State logic
  if (showDungeonSummary) {
    return (
      <Animated.View 
        entering={FadeIn.duration(800)}
        className="flex-1 bg-zinc-950 px-6 pt-16 justify-center"
      >
        <View className="items-center mb-10">
          <View 
            className="p-8 rounded-[40px] border-2 mb-6"
            style={{ 
              backgroundColor: 'rgba(168, 85, 247, 0.1)', 
              borderColor: 'rgba(168, 85, 247, 0.3)',
              shadowColor: '#a855f7',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 20
            }}
          >
            <Flame size={64} color="#a855f7" />
          </View>
          <Text className="text-purple-500 font-black text-xs uppercase tracking-[8px] mb-2">Structure Destabilized</Text>
          <Text className="text-white text-4xl font-black text-center mb-1">Dungeon Cleared</Text>
          <Text className="text-zinc-500 font-bold uppercase tracking-[4px] text-[10px]">{currentDungeonId || 'The Depths'}</Text>
        </View>
  
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="border border-zinc-800 rounded-[32px] p-8 mb-8 max-h-[400px]"
          style={{ backgroundColor: 'rgba(24, 24, 27, 0.4)' }}
        >
          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Enemies Purged</Text>
              <Text className="text-white text-2xl font-black">{enemiesKilled}</Text>
            </View>
            <View className="items-end">
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Caches Looted</Text>
              <Text className="text-white text-2xl font-black">{chestsOpened}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Altars Activated</Text>
              <Text className="text-white text-2xl font-black">{altarsUsed}</Text>
            </View>
            <View className="items-end">
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Rest Areas Found</Text>
              <Text className="text-white text-2xl font-black">{restAreasFound}</Text>
            </View>
          </View>
  
          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Total Damage Dealt</Text>
              <Text className="text-cyan-400 text-2xl font-black">{totalDamageDealtDungeon}</Text>
            </View>
            <View className="items-end">
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Total Damage Received</Text>
              <Text className="text-red-400 text-2xl font-black">{totalDamageReceivedDungeon}</Text>
            </View>
          </View>
  
          <View className="h-[1px] bg-zinc-800 mb-6" />
  
          <View className="mb-6">
            <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-3">Total Run Loot</Text>
            
            <View className="flex-row items-center mb-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <View className="p-2 rounded-lg mr-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                <Award size={20} color="#f59e0b" />
              </View>
              <View className="flex-row items-baseline">
                <Text className="text-white font-bold text-lg">{aetiumGained}</Text>
                <Text className="text-amber-500 font-bold text-lg ml-2">Aetium</Text>
              </View>
            </View>
  
            {modifiers.length > 0 && (
              <View className="mb-4">
                <Text className="text-zinc-600 font-black text-[7px] uppercase tracking-[3px] mb-2 px-1">Active Resonance (Altars)</Text>
                <View className="flex-row flex-wrap gap-2">
                  {modifiers.map((mod) => (
                    <View key={mod.id} className="border px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(46, 16, 101, 0.2)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                      <Text className="text-purple-400 text-[9px] font-bold uppercase">{mod.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
  
            {lootAcquired.length > 0 ? (
              lootAcquired.map((item, idx) => (
                <View key={idx} className="flex-row items-center mb-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <View className="p-2 rounded-lg mr-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)' }}>
                    <Package size={20} color="#06b6d4" />
                  </View>
                  <Text className="text-white font-bold text-lg">{item}</Text>
                </View>
              ))
            ) : (
              <View className="py-2">
                <Text className="text-zinc-700 text-[10px] italic text-center">No structural artifacts recovered.</Text>
              </View>
            )}
          </View>
        </ScrollView>
  
        <TouchableOpacity 
          onPress={handleDungeonFinish}
          className="bg-purple-600 h-20 rounded-[30px] items-center justify-center border border-purple-400"
          style={{
            shadowColor: '#581c87', // purple-900
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 10
          }}
        >
          <Text className="text-white font-black uppercase tracking-[6px]">Return to World</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (showSummary) {
    return (
      <Animated.View 
        entering={FadeIn.duration(800)}
        className="flex-1 bg-zinc-950 px-6 pt-16 justify-center"
      >
        <View className="items-center mb-12">
          <View 
            className="p-8 rounded-[40px] border-2 mb-6"
            style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              borderColor: 'rgba(16, 185, 129, 0.3)' 
            }}
          >
            <Award size={64} color="#10b981" />
          </View>
          <Text className="text-emerald-500 font-black text-xs uppercase tracking-[8px] mb-2 text-center">Purge Successful</Text>
          <Text className="text-white text-4xl font-black text-center">Battle Summary</Text>
        </View>
  
        <View 
          className="border border-zinc-800 rounded-[32px] p-8 mb-8"
          style={{ backgroundColor: 'rgba(24, 24, 27, 0.4)' }}
        >
          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Total Damage Dealt</Text>
              <Text className="text-cyan-400 text-2xl font-black">{totalDamageDealt}</Text>
            </View>
            <View className="items-end">
              <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-1">Total Damage Received</Text>
              <Text className="text-red-400 text-2xl font-black">{totalDamageReceived}</Text>
            </View>
          </View>
  
          <View className="h-[1px] bg-zinc-800 mb-6" />
  
          <View className="mb-6">
            <Text className="text-zinc-500 font-bold text-[8px] uppercase tracking-widest mb-3">Loot Recovered</Text>
            
            <View className="flex-row items-center mb-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <View className="p-2 rounded-lg mr-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                <Award size={20} color="#f59e0b" />
              </View>
              <View className="flex-row items-baseline">
                <Text className="text-white font-bold text-lg">{lootedAetium}</Text>
                <Text className="text-amber-500 font-bold text-lg ml-2">Aetium</Text>
              </View>
            </View>
  
            {lootedItems.map((item, idx) => (
              <View key={idx} className="flex-row items-center mb-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <View className="p-2 rounded-lg mr-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)' }}>
                  <Package size={20} color="#06b6d4" />
                </View>
                <Text className="text-white font-bold text-lg">{item}</Text>
              </View>
            ))}
            
            {lootedItems.length === 0 ? (
              <View className="py-2">
                <Text className="text-zinc-700 text-[10px] italic text-center">No items recovered from the static.</Text>
              </View>
            ) : null}
          </View>
        </View>
  
        <TouchableOpacity 
          onPress={handleContinue}
          className="bg-white h-20 rounded-[30px] items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 10
          }}
        >
          <Text className="text-black font-black uppercase tracking-[6px]">Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (!isInCombat) {
    return (
      <ScrollView className="flex-1 bg-zinc-950 px-6 pt-16">
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <Radar size={24} color="#06b6d4" className="mr-2" />
            <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-xs">
              Scanner: Operational
            </Text>
          </View>
          <Text className="text-white text-4xl font-black tracking-tight">Near Me</Text>
          <Text className="text-zinc-500 text-sm font-medium uppercase tracking-[2px]">
            Points of interest in your perimeter
          </Text>
        </View>

        <View className="space-y-4">
          {nearbyPOI.map((poi) => (
            <View 
              key={poi.id} 
              className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl mb-4"
            >
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center flex-1">
                  <View className={`p-3 rounded-2xl mr-4 border ${
                    poi.type === 'Hostile' ? 'bg-red-500/10 border-red-500/20' :
                    poi.type === 'Settlement' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    'bg-purple-500/10 border-purple-500/20'
                  }`}>
                    {poi.type === 'Hostile' ? (
                      poi.signalType === 'Boss' ? <Skull size={20} color="#ef4444" /> : <Activity size={20} color="#ef4444" />
                    ) : poi.type === 'Settlement' ? (
                      <Home size={20} color="#10b981" />
                    ) : (
                      <Flame size={20} color="#a855f7" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">{poi.title}</Text>
                    <View className="flex-row items-center mt-0.5">
                      <Navigation size={10} color="#71717a" className="mr-1" />
                      <Text className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Distance: {formatDistance(poi.distance)}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleAction(poi)}
                  className={`${
                    poi.type === 'Hostile' ? 'bg-red-600' :
                    poi.type === 'Settlement' ? 'bg-emerald-600' :
                    'bg-purple-600'
                  } px-5 py-2.5 rounded-xl`}
                >
                  <Text className="text-white font-black text-[10px] uppercase">
                    {poi.type === 'Hostile' ? 'Engage' : 'Locate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
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
        ) : isResolving && playerHpCombat <= 0 ? (
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
              disabled={!isPlayerTurn || playerManaCombat < 15}
              className={`flex-1 min-w-[45%] h-16 rounded-2xl flex-row items-center justify-center border ${
                isPlayerTurn && playerManaCombat >= 15 ? 'bg-cyan-950/30 border-cyan-800' : 'bg-zinc-950 border-zinc-900 opacity-30'
              }`}
            >
              <Zap size={18} color={playerManaCombat >= 15 ? "#06b6d4" : "#3f3f46"} className="mr-2" />
              <View>
                <Text className={`font-bold uppercase tracking-widest text-[10px] ${playerManaCombat >= 15 ? 'text-cyan-400' : 'text-zinc-600'}`}>    
                  {skills.find(s => s.type === 'Active')?.name || "Axe Sweep"}
                </Text>
                <Text className="text-[8px] text-cyan-700 font-bold">-15 Mana</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (tutorialProgress.currentStep < 23) {
                  alert("Utility items are not yet synchronized with your HUD.");
                  return;
                }
                router.replace('/(tabs)/inventory');
              }}
              disabled={!isPlayerTurn}
              className={`flex-1 min-w-[45%] h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center justify-center shadow-md shadow-black ${
                (!isPlayerTurn || tutorialProgress.currentStep < 23) ? 'opacity-30' : 'active:scale-95'
              }`}
            >
              <Briefcase size={18} color={tutorialProgress.currentStep < 23 ? "#3f3f46" : "#fff"} className="mr-2" />
              <Text className={`${tutorialProgress.currentStep < 23 ? 'text-zinc-600' : 'text-white'} font-bold uppercase tracking-widest text-xs`}>Item</Text>
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
