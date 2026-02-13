import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  ZoomIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Sparkles, Compass } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface DiscoveryOverlayProps {
  suburb: string;
  fracturedTitle: string;
  onComplete: () => void;
}

const DiscoveryOverlay = ({ suburb, fracturedTitle, onComplete }: DiscoveryOverlayProps) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 3000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    width: withTiming(progress.value * (width * 0.8), { duration: 2500 }),
    opacity: progress.value,
  }));

  return (
    <Animated.View 
      entering={FadeIn.duration(800)}
      exiting={FadeOut.duration(800)}
      style={StyleSheet.absoluteFill}
      className="bg-black/95 z-[2000] items-center justify-center p-8"
    >
      {/* Decorative Background Elements */}
      <View className="absolute inset-0 opacity-20">
        <View className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-cyan-500/20 to-transparent" />
        <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-500/20 to-transparent" />
      </View>

      <Animated.View entering={ZoomIn.delay(400).duration(1000)} className="mb-8">
        <View className="w-24 h-24 rounded-full border-2 border-cyan-500/30 items-center justify-center bg-cyan-500/10">
          <Compass size={48} color="#06b6d4" />
        </View>
      </Animated.View>

      <Animated.View entering={SlideInUp.delay(600).duration(800)} className="items-center">
        <Text className="text-cyan-500 font-bold uppercase tracking-[8px] text-xs mb-4">
          Sector Synchronized
        </Text>
        
        <Text className="text-white text-5xl font-black text-center mb-2 tracking-tighter">
          {suburb}
        </Text>
        
        <View className="flex-row items-center mb-6">
          <View className="w-2 h-2 rounded-full bg-cyan-400 mr-3 animate-pulse" />
          <Text className="text-cyan-100 text-xl font-serif italic opacity-80">
            {fracturedTitle}
          </Text>
        </View>

        {/* Animated Divider */}
        <Animated.View 
          style={lineStyle}
          className="h-px bg-cyan-500/50 mb-8"
        />

        <Animated.View entering={FadeIn.delay(1500).duration(1000)}>
          <View className="flex-row items-center bg-zinc-900/50 px-6 py-3 rounded-full border border-zinc-800">
            <Sparkles size={16} color="#06b6d4" className="mr-2" />
            <Text className="text-zinc-400 font-black text-[10px] uppercase tracking-[4px]">
              Lore Recorded in Codex
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

export default DiscoveryOverlay;
