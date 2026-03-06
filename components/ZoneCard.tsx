import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { X, MapPin, Compass, ShieldAlert, Sword, Cloud, Package, Hammer, Skull, Flame, Home } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS 
} from 'react-native-reanimated';
import { getWeatherForSuburb } from '../utils/WorldStateManager';
import { getDistance, formatDuration } from '../utils/MathUtils';
import { usePlayerStore } from '../utils/usePlayerStore';

interface ZoneCardProps {
  suburb: string;
  loreName: string;
  description: string;
  coords: { latitude: number; longitude: number };
  isHostile?: boolean;
  isSettlement?: boolean;
  isDungeon?: boolean;
  onClose: () => void;
  onExplore: () => void;
  onFastTravel: (duration: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoneCard = ({ suburb, loreName, description, coords, isHostile, isSettlement, isDungeon, onClose, onExplore, onFastTravel }: ZoneCardProps) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const weather = useMemo(() => getWeatherForSuburb(suburb), [suburb]);
  const playerLocation = usePlayerStore((state) => state.playerLocation);

  const travelDuration = useMemo(() => {
    const dist = getDistance(playerLocation, coords);
    return Math.max(1, Math.ceil(dist)); // 1 sec per 1km
  }, [playerLocation, coords]);

  useEffect(() => {
    // Slide up when component mounts
    translateY.value = withSpring(0, {
      damping: 25, // Higher damping = less bounce
      stiffness: 60, // Lower stiffness = slower motion
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const getStyleProps = () => {
    if (isHostile) return { bg: 'rgba(69, 10, 10, 0.95)', border: '#991b1b', shadow: '#7f1d1d', accent: '#ef4444' };
    if (isDungeon) return { bg: 'rgba(59, 7, 100, 0.95)', border: '#6b21a8', shadow: '#581c87', accent: '#a855f7' };
    if (isSettlement) return { bg: 'rgba(6, 70, 53, 0.95)', border: '#065f46', shadow: '#064e3b', accent: '#10b981' };
    return { bg: 'rgba(9, 9, 11, 0.95)', border: '#27272a', shadow: '#000000', accent: '#06b6d4' };
  };

  const styleProps = getStyleProps();

  return (
    <View style={StyleSheet.absoluteFill} className="items-center justify-center p-6 z-[2500]" pointerEvents="box-none">
      <Animated.View 
        style={[
          animatedStyle,
          {
            backgroundColor: styleProps.bg,
            borderColor: styleProps.border,
            shadowColor: styleProps.shadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 20
          }
        ]}
        className="w-full border p-8 rounded-[40px]"
      >
      {/* Glow Effect Decor */}
      <View 
        className="absolute -top-px left-1/4 right-1/4 h-px" 
        style={{ backgroundColor: styleProps.accent, opacity: 0.5 }}
      />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-5">
        <View className="flex-row items-center flex-1">
          <View 
            className="p-3 rounded-2xl mr-4 border"
            style={{ 
              backgroundColor: `${styleProps.accent}1A`, // 10% opacity hex
              borderColor: `${styleProps.accent}33` // 20% opacity hex
            }}
          >
            {isHostile ? <ShieldAlert size={22} color="#ef4444" /> : 
             isDungeon ? <Skull size={22} color="#a855f7" /> :
             isSettlement ? <Home size={22} color="#10b981" /> :
             <MapPin size={22} color="#06b6d4" />}
          </View>
          <View className="flex-1">
            <Text 
              className="font-bold uppercase tracking-[3px] text-[10px] mb-1"
              style={{ color: styleProps.accent }}
            >
              {isHostile ? 'Hostile Manifestation' : 
               isDungeon ? 'Dungeon Manifestation' :
               isSettlement ? 'Communal Settlement' :
               'Location Identified'}
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

      <View 
        className="flex-row items-center mb-4 self-start px-3 py-1.5 rounded-full border border-zinc-800"
        style={{ backgroundColor: 'rgba(24, 24, 27, 0.5)' }}
      >
        <Cloud size={12} color="#94a3b8" className="mr-2" />
        <Text className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">{weather}</Text>
      </View>

      {/* Lore Context */}
      <View 
        className="mb-6 p-4 rounded-2xl border"
        style={{ 
          backgroundColor: `${styleProps.accent}0D`, // 5% opacity hex roughly
          borderColor: `${styleProps.accent}26`, // 15% opacity hex
        }}
      >
        <View className="flex-row items-center mb-2">
          {isHostile ? <Sword size={14} color="#ef4444" className="mr-2" /> : 
           isDungeon ? <Flame size={14} color="#a855f7" className="mr-2" /> :
           isSettlement ? <Home size={14} color="#10b981" className="mr-2" /> :
           <Compass size={14} color="#06b6d4" className="mr-2" />}
          <Text className="text-zinc-400 font-medium text-xs uppercase tracking-widest">
            {isHostile ? 'Threat Analysis' : 
             isDungeon ? 'Critical Anomaly' :
             isSettlement ? 'Communal Sanctuary' :
             'The Fractured Realm'}
          </Text>
        </View>
        <Text 
          className="text-lg font-semibold mb-2"
          style={{ color: isHostile ? '#fee2e2' : isDungeon ? '#f3e8ff' : isSettlement ? '#d1fae5' : '#ecfeff' }}
        >
          {isHostile ? 'Fracture Anomaly' : 
           isDungeon ? 'The Depths' :
           isSettlement ? 'Safety and Order' :
           loreName}
        </Text>
        <Text className="text-zinc-400 text-sm leading-6 italic">
          "{description}"
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        {(!isHostile) && (
          <TouchableOpacity 
            onPress={() => onFastTravel(travelDuration)}
            activeOpacity={0.8}
            className="flex-[1.8] bg-zinc-900 h-16 rounded-2xl items-center justify-center border border-zinc-800"
          >
            <Text className="text-zinc-400 font-bold text-xs uppercase tracking-widest">
              Fast Travel
            </Text>
            <Text className="text-zinc-600 font-mono text-[8px] uppercase mt-0.5">
              [ETA {formatDuration(travelDuration)}]
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onExplore}
          activeOpacity={0.8}
          className={`flex-1 h-16 rounded-2xl items-center justify-center border-t`}
          style={{
            backgroundColor: styleProps.accent,
            borderColor: 'rgba(255,255,255,0.1)',
            shadowColor: styleProps.shadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 10
          }}
        >
          <Text className="text-white font-black text-sm uppercase tracking-[4px]">
            {isHostile ? 'Engage' : 
             isDungeon ? 'Descend' :
             isSettlement ? 'Enter' :
             'Explore'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  </View>
  );
};

export default ZoneCard;
