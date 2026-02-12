import { Tabs } from 'expo-router';
import { Map, Sword, User, Briefcase, Store } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6', // blue-500
        tabBarInactiveTintColor: '#71717a', // zinc-500
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'World',
          tabBarIcon: ({ color, size }) => (
            <Map size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: 'Battle',
          tabBarIcon: ({ color, size }) => (
            <Sword size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: 'Hero',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => (
            <Store size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
