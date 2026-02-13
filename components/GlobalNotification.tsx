import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../utils/usePlayerStore';
import { AlertTriangle, Info, Skull, X } from 'lucide-react-native';
import Animated, { SlideInTop, SlideOutTop } from 'react-native-reanimated';

const GlobalNotification = () => {
  const { globalNotification, setNotification } = usePlayerStore();

  useEffect(() => {
    if (globalNotification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 8000); // Auto-clear after 8s
      return () => clearTimeout(timer);
    }
  }, [globalNotification]);

  if (!globalNotification) return null;

  const getTypeStyles = () => {
    switch (globalNotification.type) {
      case 'Rift':
        return {
          bg: 'bg-red-950/90',
          border: 'border-red-500/50',
          icon: <Skull size={20} color="#ef4444" />,
          text: 'text-red-400'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-950/90',
          border: 'border-amber-500/50',
          icon: <AlertTriangle size={20} color="#f59e0b" />,
          text: 'text-amber-400'
        };
      default:
        return {
          bg: 'bg-zinc-900/90',
          border: 'border-cyan-500/50',
          icon: <Info size={20} color="#06b6d4" />,
          text: 'text-cyan-400'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Animated.View 
      entering={SlideInTop}
      exiting={SlideOutTop}
      className={`absolute top-20 left-4 right-4 z-[1000] p-4 rounded-3xl border ${styles.bg} ${styles.border} flex-row items-center shadow-2xl`}
    >
      <View className="mr-4">{styles.icon}</View>
      <View className="flex-1">
        <Text className={`font-black text-[10px] uppercase tracking-widest mb-0.5 ${styles.text}`}>
          {globalNotification.title}
        </Text>
        <Text className="text-white text-xs font-bold leading-4">
          {globalNotification.message}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => setNotification(null)}
        className="ml-2 p-2 bg-black/20 rounded-full"
      >
        <X size={14} color="#71717a" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GlobalNotification;
