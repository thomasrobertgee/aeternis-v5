import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react-native';

export default function SettingsScreen() {
  const handleWipeData = () => {
    Alert.alert(
      "Critical Warning",
      "This will permanently sever your Aether-Link and wipe all progress. Re-synchronization will start from Altona North.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Wipe Data", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // Reload the app to initialize fresh state
              await Updates.reloadAsync();
            } catch (e) {
              console.error("Failed to wipe data", e);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-24">
      <View className="mb-12">
        <View className="flex-row items-center mb-2">
          <ShieldAlert size={24} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-bold uppercase tracking-[4px] text-xs">
            System Console
          </Text>
        </View>
        <Text className="text-white text-4xl font-black tracking-tight">Protocols</Text>
      </View>

      <View className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[32px] mb-8">
        <View className="flex-row items-center mb-4">
          <AlertTriangle size={20} color="#f59e0b" className="mr-3" />
          <Text className="text-white font-bold text-lg">Danger Zone</Text>
        </View>
        
        <Text className="text-zinc-500 text-sm leading-5 mb-8">
          If your connection to the Fracture is unstable or you wish to start a new odyssey, you can purge all local synchronization data here.
        </Text>

        <TouchableOpacity 
          onPress={handleWipeData}
          className="bg-red-950/20 border border-red-500/40 h-16 rounded-2xl flex-row items-center justify-center"
        >
          <Trash2 size={18} color="#ef4444" className="mr-3" />
          <Text className="text-red-500 font-black text-xs uppercase tracking-[4px]">Purge Aether-Link</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center">
        <Text className="text-zinc-800 font-mono text-[10px] uppercase">Aeternis OS v0.5.3</Text>
      </View>
    </View>
  );
}
