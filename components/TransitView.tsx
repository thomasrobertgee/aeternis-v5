import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  useEffect,
  Easing
} from 'react-native-reanimated';
import { useTravelStore } from '../utils/useTravelStore';
import { Navigation, Loader2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const TransitView = () => {
  const { travelTimeRemaining, destinationName, isTraveling } = useTravelStore();
  const totalTime = 15; // We know it's hardcoded to 15s for now
  
  const progress = (totalTime - travelTimeRemaining) / totalTime;
  const pulse = useSharedValue(1);

  const [logs, setLogs] = React.useState<string[]>([]);

  const systemMessages = [
    `Initializing Aether-Link to ${destinationName}...`,
    "Stabilizing physical manifestation...",
    `Scanning ${destinationName} resonance frequencies...`,
    "Mapping fractured leylines...",
    "Bypassing old-world network firewall...",
    "Recalibrating kinetic stabilizers...",
    "Analyzing local Imaginum density...",
    "Decrypting sector-specific lore shards...",
    "Finalizing synchronization...",
    "Synchronizing..."
  ];

  React.useEffect(() => {
    if (isTraveling) {
      // Add a log every 1.5 seconds
      const logInterval = setInterval(() => {
        setLogs(prev => {
          const nextIndex = prev.length % systemMessages.length;
          return [...prev, systemMessages[nextIndex]].slice(-5); // Keep last 5
        });
      }, 1500);
      
      return () => {
        clearInterval(logInterval);
        setLogs([]); // Reset for next time
      };
    }
  }, [isTraveling, destinationName]);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value - 0.2,
  }));

  if (!isTraveling) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(500)}
      style={StyleSheet.absoluteFill}
      className="bg-black/90 z-[3000] items-center justify-center p-10"
    >
      {/* Tactical Wireframe Background Simulation */}
      <View className="absolute inset-0 opacity-10 flex-col">
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} className="h-px w-full bg-cyan-500 mb-12" />
        ))}
      </View>
      <View className="absolute inset-0 opacity-10 flex-row">
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} className="w-px h-full bg-cyan-500 mr-12" />
        ))}
      </View>

      <Animated.View style={animatedIconStyle} className="mb-8">
        <View className="w-24 h-24 rounded-full border-2 border-cyan-500/40 items-center justify-center bg-cyan-500/5">
          <Navigation size={48} color="#06b6d4" />
        </View>
      </Animated.View>

      <Text className="text-cyan-500 font-bold uppercase tracking-[6px] text-xs mb-2">
        Aether-Link Transit
      </Text>
      
      <Text className="text-white text-3xl font-black text-center mb-1">
        In-Transit
      </Text>
      
      <Text className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-10">
        Destination: {destinationName}
      </Text>

      {/* System Logs Area */}
      <View className="w-full h-32 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-4 mb-8">
        {logs.map((log, index) => (
          <Animated.Text 
            entering={FadeIn.duration(400)}
            key={`${index}-${log}`}
            className={`font-mono text-[9px] mb-1.5 ${index === logs.length - 1 ? 'text-cyan-400' : 'text-zinc-600'}`}
          >
            {`> ${log}`}
          </Animated.Text>
        ))}
      </View>

      {/* Progress Bar Container */}
      <View className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 mb-4">
        <Animated.View 
          className="h-full bg-cyan-500 shadow-lg shadow-cyan-500"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between w-full px-1">
        <Text className="text-zinc-600 font-mono text-[10px]">STABILIZING...</Text>
        <Text className="text-cyan-400 font-mono text-[10px]">{travelTimeRemaining}s</Text>
      </View>

      <View className="mt-12 flex-row items-center bg-zinc-950/50 px-4 py-2 rounded-xl border border-zinc-900">
        <Loader2 size={12} color="#71717a" className="mr-2 animate-spin" />
        <Text className="text-zinc-600 font-bold text-[8px] uppercase tracking-widest">
          Coordinates Locked • Interaction Suspended
        </Text>
      </View>
    </Animated.View>
  );
};

export default TransitView;
