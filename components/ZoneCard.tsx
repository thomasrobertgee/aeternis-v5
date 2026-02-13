import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { X, MapPin, Compass, ShieldAlert, Sword, Cloud, Package, Hammer } from 'lucide-react-native';
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
  isResourceNode?: boolean;
  resourceData?: { materialName: string; amount: number; distance: number };
  onClose: () => void;
  onExplore: () => void;
  onFastTravel: (duration: number) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ZoneCard = ({ suburb, loreName, description, coords, isHostile, isResourceNode, resourceData, onClose, onExplore, onFastTravel }: ZoneCardProps) => {
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
      runOnJS(onClose)();
    });
  };

  const isWithinHarvestRange = resourceData ? resourceData.distance <= 50 : false;

  return (
    <Animated.View 
      style={animatedStyle}
      className={`absolute bottom-6 left-4 right-4 border p-6 rounded-[32px] shadow-2xl ${
        isHostile ? 'bg-red-950/95 border-red-800' : 
        isResourceNode ? 'bg-emerald-950/95 border-emerald-800' :
        'bg-zinc-950/95 border-zinc-800'
      }`}
    >
      {/* Glow Effect Decor */}
      <View className={`absolute -top-px left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent to-transparent ${
        isHostile ? 'via-red-500/50' : 
        isResourceNode ? 'via-emerald-500/50' :
        'via-cyan-500/50'
      }`} />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-5">
        <View className="flex-row items-center flex-1">
          <View className={`p-3 rounded-2xl mr-4 border ${
            isHostile ? 'bg-red-500/10 border-red-500/20' : 
            isResourceNode ? 'bg-emerald-500/10 border-emerald-500/20' :
            'bg-cyan-500/10 border-cyan-500/20'
          }`}>
            {isHostile ? <ShieldAlert size={22} color="#ef4444" /> : 
             isResourceNode ? <Package size={22} color="#10b981" /> :
             <MapPin size={22} color="#06b6d4" />}
          </View>
          <View className="flex-1">
            <Text className={`font-bold uppercase tracking-[3px] text-[10px] mb-1 ${
              isHostile ? 'text-red-500' : 
              isResourceNode ? 'text-emerald-500' :
              'text-cyan-500'
            }`}>
              {isHostile ? 'Hostile Manifestation' : 
               isResourceNode ? 'Resource Manifestation' :
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

      {!isResourceNode && (
        <View className="flex-row items-center mb-4 bg-zinc-900/50 self-start px-3 py-1.5 rounded-full border border-zinc-800">
          <Cloud size={12} color="#94a3b8" className="mr-2" />
          <Text className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">{weather}</Text>
        </View>
      )}

      {isResourceNode && resourceData && (
        <View className="flex-row items-center mb-4 bg-emerald-900/20 self-start px-3 py-1.5 rounded-full border border-emerald-800/30">
          <View className={`w-1.5 h-1.5 rounded-full mr-2 ${isWithinHarvestRange ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <Text className={`${isWithinHarvestRange ? 'text-emerald-400' : 'text-red-400'} font-bold text-[9px] uppercase tracking-widest`}>
            Distance: {Math.round(resourceData.distance)}m {isWithinHarvestRange ? '(READY)' : '(TOO FAR)'}
          </Text>
        </View>
      )}

      {/* Lore Context */}
      <View className={`mb-6 p-4 rounded-2xl border ${
        isHostile ? 'bg-red-900/20 border-red-800/30' : 
        isResourceNode ? 'bg-emerald-900/20 border-emerald-800/30' :
        'bg-zinc-900/50 border-zinc-800/50'
      }`}>
        <View className="flex-row items-center mb-2">
          {isHostile ? <Sword size={14} color="#ef4444" className="mr-2" /> : 
           isResourceNode ? <Hammer size={14} color="#10b981" className="mr-2" /> :
           <Compass size={14} color="#06b6d4" className="mr-2" />}
          <Text className="text-zinc-400 font-medium text-xs uppercase tracking-widest">
            {isHostile ? 'Threat Analysis' : 
             isResourceNode ? 'Resource Scan' :
             'The Fractured Realm'}
          </Text>
        </View>
        <Text className={`text-lg font-semibold mb-2 ${
          isHostile ? 'text-red-100' : 
          isResourceNode ? 'text-emerald-100' :
          'text-cyan-100'
        }`}>
          {isHostile ? 'Fracture Anomaly' : 
           isResourceNode ? loreName :
           loreName}
        </Text>
        <Text className="text-zinc-400 text-sm leading-6 italic">
          "{description}"
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        {!isHostile && !isResourceNode && (
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
          className={`flex-1 h-16 rounded-2xl items-center justify-center shadow-lg border-t border-white/10 ${
            isHostile ? 'bg-red-600 shadow-red-900/40' : 
            isResourceNode ? (isWithinHarvestRange ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-zinc-800 opacity-50') :
            'bg-cyan-600 shadow-cyan-900/40'
          }`}
        >
          <Text className="text-white font-black text-sm uppercase tracking-[4px]">
            {isHostile ? 'Engage' : 
             isResourceNode ? 'Harvest' :
             'Explore'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default ZoneCard;
