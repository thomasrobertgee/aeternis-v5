import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useCombatStore } from '../../utils/useCombatStore';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { getLootForEnemy } from '../../utils/LootTable';
import { Sword, Zap, Briefcase, Footprints, ShieldAlert, Skull, Package } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  SlideInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  withRepeat,
  interpolateColor
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';

export default function BattleScreen() {
  const router = useRouter();
  const player = usePlayerStore();
  const setGlobalStats = usePlayerStore((state) => state.setStats);
  const addItem = usePlayerStore((state) => state.addItem);
  const gainXp = usePlayerStore((state) => state.gainXp);
  const updateQuestProgress = usePlayerStore((state) => state.updateQuestProgress);
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
    endCombat
  } = useCombatStore();

  const [isResolving, setIsResolving] = useState(false);

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
      
      // Update Quest Progress
      updateQuestProgress('q-secure-the-west', 1);

      // Calculate Aetium loot
      const goldLoot = 25 + Math.floor(Math.random() * 50);
      addLog(`Recovered ${goldLoot} Aetium from the remains.`, 'system');

      // Calculate XP
      const xpGained = 40 + Math.floor(Math.random() * 30);
      addLog(`Synchronization improved (+${xpGained} XP)`, 'system');
      
      // Calculate Item loot
      const itemLoot = getLootForEnemy(enemyName);
      if (itemLoot) {
        addItem(itemLoot);
        addLog(`Acquired: ${itemLoot.name}`, 'system');
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
    if (!isPlayerTurn || isResolving) return;
    const damage = player.attack + Math.floor(Math.random() * 5);
    triggerEnemyShake();
    updateHp('enemy', -damage);
    addLog(`You strike the ${enemyName} for ${damage} damage.`, 'player');
    
    if (enemyHp - damage > 0) {
      setTimeout(nextTurn, 800);
    }
  };

  const handleSkill = () => {
    if (!isPlayerTurn || playerMana < 20 || isResolving) return;
    const damage = (player.attack * 2) + Math.floor(Math.random() * 10);
    triggerEnemyShake();
    updateMana(-20);
    updateHp('enemy', -damage);
    addLog(`You unleash a Pulse Burst! ${damage} damage dealt.`, 'player');
    
    if (enemyHp - damage > 0) {
      setTimeout(nextTurn, 800);
    }
  };

  const handleFlee = () => {
    if (isResolving) return;
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
        const damage = Math.max(1, baseDamage - player.defense);
        triggerScreenFlash();
        updateHp('player', -damage);
        addLog(`The ${enemyName} retaliates! ${damage} damage received (${player.defense} blocked).`, 'enemy');
        nextTurn();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, isInCombat, isResolving, player.defense]);

  if (!isInCombat) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center p-10">
        <ShieldAlert size={48} color="#3f3f46" />
        <Text className="text-zinc-500 font-bold uppercase tracking-widest mt-4">
          No Threats Detected
        </Text>
        <Text className="text-zinc-700 text-xs mt-2 text-center mb-8">
          The area is calm. Scan the map for fractures to engage in combat.
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/explore')}
          className="bg-zinc-900 px-8 py-4 rounded-2xl border border-zinc-800"
        >
          <Text className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Return to Map</Text>
        </TouchableOpacity>
      </View>
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
      <Animated.View entering={SlideInUp.duration(500)} className="flex-row flex-wrap gap-3 pb-12">
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
              disabled={!isPlayerTurn || playerMana < 20}
              className={`flex-1 min-w-[45%] h-16 rounded-2xl flex-row items-center justify-center border ${
                isPlayerTurn && playerMana >= 20 ? 'bg-cyan-950/30 border-cyan-800' : 'bg-zinc-950 border-zinc-900 opacity-30'
              }`}
            >
              <Zap size={18} color={playerMana >= 20 ? "#06b6d4" : "#3f3f46"} className="mr-2" />
              <View>
                <Text className={`font-bold uppercase tracking-widest text-xs ${playerMana >= 20 ? 'text-cyan-400' : 'text-zinc-600'}`}>Skill</Text>
                <Text className="text-[8px] text-cyan-700 font-bold">-20 MP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 min-w-[45%] h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center justify-center opacity-30"
            >
              <Briefcase size={18} color="#3f3f46" className="mr-2" />
              <Text className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Item</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleFlee}
              className="flex-1 min-w-[45%] h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex-row items-center justify-center shadow-md shadow-black"
            >
              <Footprints size={18} color="#71717a" className="mr-2" />
              <Text className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Flee</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </View>
  );
}
