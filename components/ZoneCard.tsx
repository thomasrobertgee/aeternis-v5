import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { X, MapPin, Compass } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface ZoneCardProps {
  suburb: string;
  loreName: string;
  description: string;
  onClose: () => void;
  onExplore: () => void;
  onFastTravel: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoneCard = ({ suburb, loreName, description, onClose, onExplore, onFastTravel }: ZoneCardProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    // Slide up when component mounts
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 90,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      onClose();
    });
  };

  return (
    <Animated.View 
      style={animatedStyle}
      className="absolute bottom-6 left-4 right-4 bg-zinc-950/95 border border-zinc-800 p-6 rounded-[32px] shadow-2xl"
    >
      {/* Glow Effect Decor */}
      <View className="absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-5">
        <View className="flex-row items-center flex-1">
          <View className="bg-cyan-500/10 p-3 rounded-2xl mr-4 border border-cyan-500/20">
            <MapPin size={22} color="#06b6d4" />
          </View>
          <View className="flex-1">
            <Text className="text-cyan-500 font-bold uppercase tracking-[3px] text-[10px] mb-1">
              Location Identified
            </Text>
            <Text className="text-white text-2xl font-bold tracking-tight">{suburb}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleClose} 
          className="bg-zinc-900 p-2 rounded-full border border-zinc-800"
        >
          <X size={20} color="#71717a" />
        </TouchableOpacity>
      </View>

      {/* Lore Context */}
      <View className="mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
        <View className="flex-row items-center mb-2">
          <Compass size={14} color="#06b6d4" className="mr-2" />
          <Text className="text-zinc-400 font-medium text-xs uppercase tracking-widest">The Fractured Realm</Text>
        </View>
        <Text className="text-cyan-100 text-lg font-semibold mb-2">{loreName}</Text>
        <Text className="text-zinc-400 text-sm leading-6 italic">
          "{description}"
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          onPress={onFastTravel}
          activeOpacity={0.8}
          className="flex-1 bg-zinc-900 h-16 rounded-2xl items-center justify-center border border-zinc-800"
        >
          <Text className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
            Fast Travel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onExplore}
          activeOpacity={0.8}
          className="flex-[1.5] bg-cyan-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-cyan-900/40 border-t border-cyan-400/30"
        >
          <Text className="text-white font-black text-sm uppercase tracking-[4px]">
            Explore
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default ZoneCard;
