import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '../utils/usePlayerStore';
import { AlertTriangle, Info, Skull, X, Trophy, Coins, Package } from 'lucide-react-native';
import Animated, { SlideInUp, SlideOutUp, Layout } from 'react-native-reanimated';

const GlobalNotification = () => {
  const { 
    globalNotification, 
    removeNotification, 
    errorNotification, 
    removeErrorNotification 
  } = usePlayerStore();

  const activeGlobals = globalNotification ?? [];
  const activeErrors = errorNotification ?? [];

  if (activeGlobals.length === 0 && activeErrors.length === 0) return null;

  return (
    <View className="absolute top-20 left-4 right-4 z-[1000] gap-2">
      {activeErrors.map((error) => (
        <NotificationItem 
          key={error.id}
          item={error}
          onClose={() => removeErrorNotification(error.id)}
          isError={true}
        />
      ))}
      {activeGlobals.map((notif) => (
        <NotificationItem 
          key={notif.id}
          item={notif}
          onClose={() => removeNotification(notif.id)}
          isError={false}
        />
      ))}
    </View>
  );
};

const NotificationItem = ({ item, onClose, isError }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Reduced to 4s (previous was 5s/8s)
    return () => clearTimeout(timer);
  }, []);

  const styles = isError ? {
    bg: 'bg-red-900/90',
    border: 'border-red-500/50',
    icon: <AlertTriangle size={20} color="#ef4444" />,
    text: 'text-red-400',
  } : getTypeStyles(item.type);

  function getTypeStyles(type: any) {
    switch (type) {
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
      case 'LevelUp':
        return {
          bg: 'bg-blue-950/90',
          border: 'border-blue-400/50',
          icon: <Trophy size={20} color="#60a5fa" />,
          text: 'text-blue-400'
        };
      case 'Aetium':
        return {
          bg: 'bg-orange-950/90',
          border: 'border-orange-500/50',
          icon: <Coins size={20} color="#f97316" />,
          text: 'text-orange-400'
        };
      case 'Item':
        return {
          bg: 'bg-zinc-800/90',
          border: 'border-zinc-100/30',
          icon: <Package size={20} color="#f4f4f5" />,
          text: 'text-zinc-100'
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

  return (
    <Animated.View 
      entering={SlideInUp}
      exiting={SlideOutUp}
      layout={Layout.springify()}
      className={`p-4 rounded-3xl border ${styles.bg} ${styles.border} flex-row items-center shadow-2xl`}
    >
      <View className="mr-4">{styles.icon}</View>
      <View className="flex-1">
        <Text className={`font-black text-[10px] uppercase tracking-widest mb-0.5 ${styles.text}`}>
          {item.title}
        </Text>
        <Text className="text-white text-xs font-bold leading-4">
          {item.message}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={onClose}
        className="ml-2 p-2 bg-black/20 rounded-full"
      >
        <X size={14} color="#71717a" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GlobalNotification;
