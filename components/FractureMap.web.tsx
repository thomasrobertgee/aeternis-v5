import React from 'react';
import { View, Text } from 'react-native';
import { Radar } from 'lucide-react-native';

const FractureMap = () => {
  return (
    <View className="flex-1 items-center justify-center p-10 bg-zinc-950">
      <View className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] items-center max-w-md">
        <Radar size={48} color="#3f3f46" className="mb-6" />
        <Text className="text-white text-xl font-black text-center mb-4 uppercase tracking-widest">Map System Offline</Text>
        <Text className="text-zinc-500 text-center leading-6 italic">
          "The Aether-Link's visualization protocols are currently optimized for mobile deployment. Return to your handheld device to view the Fracture."
        </Text>
      </View>
    </View>
  );
};

export default FractureMap;
