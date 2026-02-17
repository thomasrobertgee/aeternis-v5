import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../utils/usePlayerStore';
import TutorialView from '../components/TutorialView';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  Easing 
} from 'react-native-reanimated';
import { ShieldCheck, Sparkles } from 'lucide-react-native';

export default function TitleScreen() {
  const router = useRouter();
  const { tutorialProgress } = usePlayerStore();
  const [localTutorialTrigger, setLocalTutorialTrigger] = useState(false);
  const pulse = useSharedValue(1);

  // Navigate to explore automatically if tutorial is finished while on this screen
  useEffect(() => {
    if (localTutorialTrigger && !tutorialProgress.isTutorialActive) {
      router.replace('/(tabs)/explore');
    }
  }, [tutorialProgress.isTutorialActive, localTutorialTrigger]);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    borderColor: 'rgba(6, 182, 212, ' + (pulse.value - 0.5) + ')',
  }));

  const handleEnter = () => {
    if (tutorialProgress.isTutorialActive && tutorialProgress.currentStep === 0) {
      setLocalTutorialTrigger(true);
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  return (
    <View className="flex-1 bg-black items-center justify-center">
      {localTutorialTrigger && <TutorialView />}
      
      {/* Background Ambience */}
      <View className="absolute inset-0 opacity-30">
        <View className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-cyan-900/40 to-transparent" />
        <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-900/40 to-transparent" />
      </View>

      <Animated.View entering={FadeIn.duration(2000)} className="items-center">
        <Animated.View entering={FadeInDown.delay(500).duration(1000)} className="items-center">
          <Text className="text-cyan-500 font-bold uppercase tracking-[12px] text-xl mb-4">
            Aeternis
          </Text>
          <Text className="text-white text-6xl font-black tracking-tighter mb-2">
            ODYSSEY
          </Text>
          <View className="flex-row items-center mb-24">
            <View className="h-px w-8 bg-zinc-800" />
            <Text className="text-zinc-500 mx-4 font-mono text-[10px] uppercase tracking-widest">
              Version 0.0.0.1
            </Text>
            <View className="h-px w-8 bg-zinc-800" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1500).duration(1000)}>
          <TouchableOpacity 
            onPress={handleEnter}
            activeOpacity={0.7}
            className="items-center"
          >
            <Animated.View 
              style={animatedPulseStyle}
              className="bg-cyan-950/20 border-2 border-cyan-500/30 px-10 py-5 rounded-2xl flex-row items-center"
            >
              <Text className="text-cyan-400 font-black text-sm uppercase tracking-[6px]">
                Enter The Fracture
              </Text>
            </Animated.View>
            <Text className="text-zinc-700 font-bold text-[8px] uppercase tracking-[4px] mt-4">
              Synchronization Required
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Decorative Scanlines */}
      <View className="absolute inset-0 opacity-[0.03] pointer-events-none bg-zinc-400" />
    </View>
  );
}
