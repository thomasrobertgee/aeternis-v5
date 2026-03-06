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

  const getStyleProps = (isError: boolean, type: any) => {
    if (isError) {
      return {
        bg: 'rgba(127, 29, 29, 0.9)', // red-900
        border: 'rgba(239, 68, 68, 0.5)', // red-500
        icon: <AlertTriangle size={20} color="#ef4444" />,
        text: 'text-red-400',
      };
    }
    switch (type) {
      case 'Rift':
        return {
          bg: 'rgba(69, 10, 10, 0.9)', // red-950
          border: 'rgba(239, 68, 68, 0.5)', // red-500
          icon: <Skull size={20} color="#ef4444" />,
          text: 'text-red-400'
        };
      case 'Warning':
        return {
          bg: 'rgba(69, 26, 3, 0.9)', // amber-950
          border: 'rgba(245, 158, 11, 0.5)', // amber-500
          icon: <AlertTriangle size={20} color="#f59e0b" />,
          text: 'text-amber-400'
        };
      case 'LevelUp':
        return {
          bg: 'rgba(23, 37, 84, 0.9)', // blue-950
          border: 'rgba(96, 165, 250, 0.5)', // blue-400
          icon: <Trophy size={20} color="#60a5fa" />,
          text: 'text-blue-400'
        };
      case 'Aetium':
        return {
          bg: 'rgba(67, 20, 7, 0.9)', // orange-950
          border: 'rgba(249, 115, 22, 0.5)', // orange-500
          icon: <Coins size={20} color="#f97316" />,
          text: 'text-orange-400'
        };
      case 'Item':
        return {
          bg: 'rgba(39, 39, 42, 0.9)', // zinc-800
          border: 'rgba(244, 244, 245, 0.3)', // zinc-100
          icon: <Package size={20} color="#f4f4f5" />,
          text: 'text-zinc-100'
        };
      default:
        return {
          bg: 'rgba(24, 24, 27, 0.9)', // zinc-900
          border: 'rgba(6, 182, 212, 0.5)', // cyan-500
          icon: <Info size={20} color="#06b6d4" />,
          text: 'text-cyan-400'
        };
    }
  };

  const styleProps = getStyleProps(isError, item.type);

  return (
    <Animated.View 
      entering={SlideInUp}
      exiting={SlideOutUp}
      layout={Layout.springify()}
      className="p-4 rounded-3xl border flex-row items-center"
      style={{
        backgroundColor: styleProps.bg,
        borderColor: styleProps.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10
      }}
    >
      <View className="mr-4">{styleProps.icon}</View>
      <View className="flex-1">
        <Text className={`font-black text-[10px] uppercase tracking-widest mb-0.5 ${styleProps.text}`}>
          {item.title}
        </Text>
        <Text className="text-white text-xs font-bold leading-4">
          {item.message}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={onClose}
        className="ml-2 p-2 rounded-full"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
      >
        <X size={14} color="#71717a" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GlobalNotification;
