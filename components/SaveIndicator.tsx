import React from 'react';
import { View, Text } from 'react-native';
import { useUIStore } from '../utils/useUIStore';
import { Save } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const SaveIndicator = () => {
  const isSaving = useUIStore((state) => state.isSaving);

  if (!isSaving) return null;

  return (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute bottom-24 right-6 z-[999] flex-row items-center px-3 py-1.5 rounded-full border"
      style={{
        backgroundColor: 'rgba(24, 24, 27, 0.8)', // zinc-900
        borderColor: '#27272a', // zinc-800
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5
      }}
    >
      <Save size={10} color="#06b6d4" className="mr-2" />
      <Text className="text-cyan-500 font-black text-[8px] uppercase tracking-widest">
        Synchronizing...
      </Text>
    </Animated.View>
  );
};

export default SaveIndicator;
