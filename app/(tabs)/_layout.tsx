import { Tabs } from 'expo-router';
import { Map, Sword, User, Briefcase, Store, Radar } from 'lucide-react-native';
import PlayerHeader from '../../components/PlayerHeader';
import GlobalNotification from '../../components/GlobalNotification';
import SaveIndicator from '../../components/SaveIndicator';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useCombatStore } from '../../utils/useCombatStore';
import { useDungeonStore } from '../../utils/useDungeonStore';
import TutorialView from '../../components/TutorialView';

export default function TabLayout() {
  const tutorialProgress = usePlayerStore((state) => state.tutorialProgress);
  const isTutorialComplete = usePlayerStore((state) => state.isTutorialComplete);
  const isInCombat = useCombatStore((state) => state.isInCombat);
  const isInsideDungeon = useDungeonStore((state) => state.isInsideDungeon);
  
  const currentStep = tutorialProgress.currentStep;
  
  // Hide tabs until specific milestones OR tutorial is fully complete
  const hideHero = !isTutorialComplete && currentStep < 17;
  const hideBag = !isTutorialComplete && currentStep < 23;
  const hideOthers = !isTutorialComplete && currentStep < 38; // Marketplace unlocks at step 38

  // Interaction restrictions for specific overworld steps
  const isTutorialRestricted = !isTutorialComplete && tutorialProgress.isTutorialActive === false && (currentStep === 22 || currentStep === 34);

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => (
          <>
            <PlayerHeader />
            <GlobalNotification />
            <SaveIndicator />
          </>
        ),
        tabBarStyle: {          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
          height: 80,
          paddingBottom: 24,
          paddingTop: 12,
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
        listeners={{
          tabPress: (e) => {
            if (isInCombat || isInsideDungeon) e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: 'Near Me',
          href: !isTutorialComplete ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Radar size={size} color={color} strokeWidth={2.5} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (isTutorialRestricted || !isTutorialComplete) e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="character"
        options={{
          title: 'Hero',
          href: hideHero ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.5} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            const ALLOWED_HERO_STEPS = [17, 27, 28, 29, 32, 33]; 
            if (tutorialProgress.isTutorialActive && ALLOWED_HERO_STEPS.includes(currentStep)) return;
            if (hideHero) e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Bag',
          href: hideBag ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Briefcase size={size} color={color} strokeWidth={2.5} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (hideBag) e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Market',
          href: hideOthers ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <Store size={size} color={color} strokeWidth={2.5} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (hideOthers) e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="dungeon"
        options={{
          href: null,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settlement"
        options={{
          href: null,
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
    <TutorialView />
    </>
  );
}
