import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../utils/usePlayerStore';
import { useCombatStore } from '../utils/useCombatStore';

const PlayerHeader = () => {
  const player = usePlayerStore();
  const combat = useCombatStore();

  // Use combat stats if in battle, otherwise use global player stats
  const currentHp = combat.isInCombat ? combat.playerHp : player.hp;
  const maxHp = combat.isInCombat ? combat.maxPlayerHp : player.maxHp;
  const currentMana = combat.isInCombat ? combat.playerMana : player.mana;
  const maxMana = combat.isInCombat ? combat.maxPlayerMana : player.maxMana;

  return (
    <SafeAreaView className="bg-zinc-950 border-b border-zinc-900">
      {/* Level / XP Bar Overlay */}
      <View className="h-1 bg-zinc-900 w-full overflow-hidden">
        <View className="h-full bg-cyan-400" style={{ width: `${(player.xp / player.maxXp) * 100}%` }} />
      </View>

      <View className="px-4 py-3 flex-row justify-between items-center">
        {/* Level & Profile */}
        <View className="mr-4 items-center justify-center bg-zinc-900 w-10 h-10 rounded-xl border border-zinc-800">
          <Text className="text-zinc-500 text-[8px] font-black uppercase">LVL</Text>
          <Text className="text-white font-black text-sm">{player.level}</Text>
        </View>

        {/* Health */}
        <View className="flex-1">
          <Text className="text-emerald-500 text-[8px] font-bold uppercase tracking-widest">Vitality</Text>
          <View className="h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
            <View className="h-full bg-emerald-500" style={{ width: `${(currentHp / maxHp) * 100}%` }} />
          </View>
          <Text className="text-zinc-400 text-[8px] mt-0.5 font-mono">{currentHp}/{maxHp}</Text>
        </View>

        {/* Mana */}
        <View className="flex-1 mx-6">
          <Text className="text-cyan-500 text-[8px] font-bold uppercase tracking-widest">Imaginum</Text>
          <View className="h-1.5 bg-zinc-900 rounded-full mt-1 overflow-hidden border border-zinc-800">
            <View className="h-full bg-cyan-500" style={{ width: `${(currentMana / maxMana) * 100}%` }} />
          </View>
          <Text className="text-zinc-400 text-[8px] mt-0.5 font-mono">{currentMana}/{maxMana}</Text>
        </View>

        {/* Gold */}
        <View className="items-end">
          <Text className="text-amber-500 text-[8px] font-bold uppercase tracking-widest">Aetium</Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-white font-black text-sm">{player.gold.toLocaleString()}</Text>
            <Text className="text-amber-500 ml-1 text-xs">A</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PlayerHeader;
