import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { usePlayerStore } from '../utils/usePlayerStore';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown,
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Brain, Eye, Sparkles, ChevronRight, AlertCircle, CheckCircle2, Skull, Briefcase, Activity, Scroll } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { useUIStore } from '../utils/useUIStore';

const { width, height } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    text: "you wake up, dazed...",
    choices: [
      { label: "sit up", nextStep: 1 },
      { label: "stand up", nextStep: 2 }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "your arms and legs feel weak, but with a grunt of effort, you manage to sit up",
    choices: [{ label: "continue", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you try to stand up, but your arms and legs feel weak. with a grunt of effort, you manage to sit up. maybe you'll try standing up when you have gained more strength",
    choices: [{ label: "continue", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you are sitting on the cold ground. what will you do now?",
    choices: [
      { 
        label: "stand up", 
        nextStep: 6, 
        validate: (p: any) => p.hasLookedAround && p.hasTriedToRemember,
        failText: "you try to stand up, but your arms and legs still feel weak. maybe you'll try again in a little bit"
      },
      { label: "take a look around", nextStep: 4, isSticky: true, updates: { hasLookedAround: true } },
      { label: "try to remember what happened", nextStep: 5, isSticky: true, updates: { hasTriedToRemember: true } }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you take a look around. you recognise this place, but it seems different somehow. everything is unkept, nature seems to have taken over, and the air feels... strange",
    choices: [{ label: "back", nextStep: 3 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "you try to remember what happened, but your memory is foggy",
    choices: [{ label: "back", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you finally manage to stand up. once the feeling of dizziness passes, you realise you can hear a faint hum in the distance, like the sound of energy",
    choices: [
      { label: "sit back down", nextStep: 7 },
      { label: "move towards the sound", updates: { isTutorialActive: false, currentStep: 8 } }
    ],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "you sit back down. after a while you grow restless, and you stand back up",
    choices: [
      { label: "move towards the sound", updates: { isTutorialActive: false, currentStep: 8 } }
    ],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "as you move closer to the sound it gets louder, and you can see what looks like a blue orb of energy rippling in the air, pulsing with every sound it makes\n\nyou keep moving towards it, and eventually you are so close you could reach out and touch it...",
    choices: [
      { label: "reach out and touch the light", nextStep: 9 },
      { label: "back away", nextStep: 10 }
    ],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "you slowly reach out to touch the light, as you get closer your fingers start to tingle, then feel warm, the heat increases spreading throughout your whole body, suddenly its too much to bare, and there is a blinding flash of light...",
    choices: [{ label: "continue", isFinalTouch: true }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "you try to back away, but the light hypnotizes you, drawing you in",
    choices: [{ label: "continue", nextStep: 9 }],
    icon: <Eye size={32} color="#a855f7" />
  },
  {
    text: "you wake up, dazed...",
    choices: [
      { label: "not again...", nextStep: 12 }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "with a sigh, you sit yourself back up again. you don't feel as weak as last time. instead, you actually feel different...",
    choices: [
      { label: "assess yourself", nextStep: 13 },
      { label: "take a look around", nextStep: 14 }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you look over your body, and you notice that underneath your skin, there appears to be a faint rippling of blue light, barely noticeable to the naked eye",
    choices: [{ label: "continue", nextStep: 14 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you are in the area where you came across the light. you look around and don't notice anything different from before, however you notice a small glowing blue orb in the corner of your eye, no matter where you look, it persists",
    choices: [
      { label: "rub your eyes", nextStep: 15 },
      { label: "try focus on the orb of light", nextStep: 16 }
    ],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "nope, its still there",
    choices: [{ label: "back", nextStep: 14 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "you try to focus on the orb of light in your vision, and suddenly you are startled as what appears to be a large heads up display appears in front of you, like a screen from an old game you used to play",
    choices: [{ label: "look at the screen", nextStep: 17 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "the screen appears to have information written in another language you don't recognise, however as you focus on the characters, they start to shimmer, and are eventually replaced in a language you can read and understand.",
    choices: [{ label: "interact with the screen", isHeroTrigger: true, nextStep: 18 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "you hear a growling sound behind you",
    choices: [{ label: "turn around", nextStep: 19 }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "you see a what appears to be a large dog, but hideously mutated and scarred, and its slowly stalking towards you, with menace in its eyes",
    choices: [{ label: "look around for something to defend yourself with", nextStep: 20 }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "you see multiple potential weapons on the ground within reach. you rush to grab...",
    choices: [
      { label: "a large stick", isWeaponChoice: true, weaponId: 'stick' },
      { label: "a small car door", isWeaponChoice: true, weaponId: 'door' },
      { label: "a group of rocks", isWeaponChoice: true, weaponId: 'rocks' }
    ],
    icon: <Briefcase size={32} color="#06b6d4" />
  },
  {
    text: "you pick up the weapon, just as the mutated dog charges at you",
    choices: [{ label: "continue", nextStep: 22, updates: { isTutorialActive: false } }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "the mutated dog is upon you! engage it on the map to defend yourself.",
    choices: [],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "after finally defeating the mutated dog, you sit down, exhausted.",
    choices: [{ label: "catch your breath", nextStep: 24 }],
    icon: <Activity size={32} color="#06b6d4" />
  },
  {
    text: "once you catch your breath, you look at the corpse of the mutated dog, and notice it starts to slowly shimmer",
    choices: [
      { label: "rub your eyes", nextStep: 25 },
      { label: "continue to observe", nextStep: 26 }
    ],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "yep, definitely shimmering",
    choices: [{ label: "continue to observe", nextStep: 26 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "the mutated dog shimmers more and more, until eventually it seems to shimmer out of existence",
    choices: [{ label: "thats wack", nextStep: 27 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "on the ground where the corpse previously was, you notice a glowing blue object, kind of like a crystal",
    choices: [{ label: "pick up the crystal", nextStep: 28 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "you crawl over and pick up the crystal, after staring at it in your hand for a few seconds, it also shimmers and then disappears. then, you hear a 'ding' and the words '1 x aetium received' appear in the corner of your vision",
    choices: [{ label: "check your character", isHeroTrigger: true, nextStep: 29 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "you've confirmed that you now have one aetium, though you don't know how it is being stored",
    choices: [{ label: "check pockets", nextStep: 30 }],
    icon: <Briefcase size={32} color="#06b6d4" />
  },
  {
    text: "yep, definitely not in the pockets. must be in the 'cloud' or something.",
    choices: [{ label: "continue", nextStep: 31 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "you hear another 'ping'. oh great, you think to yourself, what could this be now.",
    choices: [{ label: "look around", nextStep: 32 }],
    icon: <Activity size={32} color="#06b6d4" />
  },
  {
    text: "as you look around, you can see more of the mutated dogs in the shadows, circling you from a distance. you also notice in your vision a small screen has appeared, titled 'QUEST'",
    choices: [{ label: "read the quest details", isQuestTrigger: true, nextStep: 33 }],
    icon: <Scroll size={32} color="#f59e0b" />
  },
  {
    text: "really, five more dogs?",
    choices: [{ label: "prepare for battle", nextStep: 34, updates: { isTutorialActive: false } }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "the mutated dogs are upon you! engage them on the map to defend yourself.",
    choices: [],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "you've done it. the perimeter is clear. the Fracture has recognized your presence. your journey has truly begun.\n\nwelcome to the fracture, traveller.",
    choices: [{ label: "finish tutorial", updates: { currentStep: 36, isTutorialActive: false } }],
    icon: <Sparkles size={32} color="#10b981" />
  }
];

const TutorialView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const setHeroTab = useUIStore(s => s.setHeroTab);
  const { tutorialProgress, updateTutorial, clearTutorialMarker, logChoice, addItem, startQuest, choicesLog, learnSkill, equipItem } = usePlayerStore();
  
  const currentStep = tutorialProgress.currentStep;
  const isTutorialActive = tutorialProgress.isTutorialActive;

  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const flashOpacity = useSharedValue(0);
  const step = TUTORIAL_STEPS[currentStep];

  const getStepText = useCallback((stepIndex: number) => {
    if (!TUTORIAL_STEPS[stepIndex]) return "";
    const baseText = TUTORIAL_STEPS[stepIndex].text;
    if (stepIndex === 21) {
      const weaponChoice = choicesLog.find(c => c.startsWith('weapon_'))?.replace('weapon_', '');
      let weaponName = "weapon";
      if (weaponChoice === 'stick') weaponName = "large stick";
      else if (weaponChoice === 'door') weaponName = "small car door";
      else if (weaponChoice === 'rocks') weaponName = "group of rocks";
      return `you pick up the ${weaponName}, just as the mutated dog charges at you`;
    }
    return baseText;
  }, [choicesLog]);

  useEffect(() => {
    if (isTutorialActive && step) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText("");
      setIsTyping(true);
      let i = 0;
      const fullText = getStepText(currentStep);
      timerRef.current = setInterval(() => {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
        if (i % 4 === 0) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (i >= fullText.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTyping(false);
        }
      }, 20);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [currentStep, isTutorialActive, getStepText]);

  const finishTyping = useCallback(() => {
    if (isTyping) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(getStepText(currentStep));
      setIsTyping(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return true;
    }
    return false;
  }, [isTyping, currentStep, getStepText]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const handleChoice = (choice: any) => {
    console.log('--- Choice Event ---', choice.label, 'Step:', currentStep);
    
    if (isTyping) {
      finishTyping();
      return;
    }
    
    if (choice.validate && !choice.validate(tutorialProgress)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert(choice.failText);
      return;
    }

    if (choice.isFinalTouch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      flashOpacity.value = withTiming(1, { duration: 1500 }, (finished) => {
        if (finished) {
          runOnJS(clearTutorialMarker)();
          runOnJS(updateTutorial)({ currentStep: 11 });
          flashOpacity.value = withTiming(0, { duration: 2000 });
        }
      });
      return;
    }

    if (choice.isHeroTrigger) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setHeroTab(choice.nextStep === 33 ? 'Quests' : 'Stats');
      // Set the step but DON'T activate the tutorial overlay yet.
      updateTutorial({ isTutorialActive: false, currentStep: choice.nextStep });
      router.replace('/(tabs)/character');
      return;
    }

    if (choice.isQuestTrigger) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      startQuest({
        id: 'q-tutorial-dogs',
        title: 'Defeat Mutated Dogs',
        description: 'Cleanse the perimeter of the remaining 5 mutated manifestations.',
        targetCount: 5,
        currentCount: 0,
        biomeRequirement: 'Shattered Suburbia',
        isCompleted: false,
        rewardXp: 200,
        rewardGold: 5,
      });
      setHeroTab('Quests');
      // Set the step but DON'T activate the tutorial overlay yet.
      updateTutorial({ isTutorialActive: false, currentStep: choice.nextStep });
      router.replace('/(tabs)/character');
      return;
    }

    if (choice.isWeaponChoice) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logChoice(`weapon_${choice.weaponId}`);
      let item: any;
      let skill: any;
      if (choice.weaponId === 'stick') {
        item = { id: 'tutorial-stick', name: 'Large Heavy Stick', category: 'Weapon', rarity: 'Common', description: 'A sturdy branch that feels surprisingly balanced.', stats: { attack: 5 } };
        skill = { id: 'skill-heavy-strike', name: 'Heavy Strike', level: 1, description: 'A powerful overhead swing using your makeshift club.', type: 'Active' };
      } else if (choice.weaponId === 'door') {
        item = { id: 'tutorial-door', name: 'Small Car Door', category: 'Weapon', rarity: 'Common', description: 'A rusted sheet of metal with a handle.', stats: { attack: 5 } };
        skill = { id: 'skill-shield-bash', name: 'Shield Bash', level: 1, description: 'Slam your metal barrier into the enemy to daze them.', type: 'Active' };
      } else if (choice.weaponId === 'rocks') {
        item = { id: 'tutorial-rocks', name: 'Bag of Jagged Rocks', category: 'Weapon', rarity: 'Common', description: 'Sharp pieces of concrete and flint.', stats: { attack: 4 } };
        skill = { id: 'skill-rock-toss', name: 'Rock Toss', level: 1, description: 'Hurl jagged debris at enemies from a safe distance.', type: 'Active' };
      }
      addItem(item);
      equipItem(item);
      learnSkill(skill);
      updateTutorial({ currentStep: 21 });
      return;
    }

    if (choice.updates) updateTutorial(choice.updates);
    if (choice.nextStep !== undefined) {
      updateTutorial({ currentStep: choice.nextStep });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // Only show tutorial on explore (map), battle, or title screen
  const isAllowedPath = pathname === '/' || pathname === '/explore' || pathname === '/battle' || pathname.includes('(tabs)/explore');
  if (!isTutorialActive || !step || !isAllowedPath) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10000 }]}>
      <Animated.View 
        entering={FadeIn.duration(800)}
        exiting={FadeOut.duration(500)}
        style={StyleSheet.absoluteFill}
        className="bg-black items-center justify-center p-10"
      >
        <Animated.View 
          style={[StyleSheet.absoluteFill, flashStyle, { backgroundColor: 'white', zIndex: 10001 }]} 
          pointerEvents="none" 
        />
        <View className="absolute inset-0 opacity-20">
          <View className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-cyan-900/30 to-transparent" />
          <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-900/30 to-transparent" />
        </View>

        <Animated.View entering={SlideInDown.delay(200).duration(800)} className="items-center w-full">
          <View className="mb-10 bg-zinc-900/50 p-6 rounded-[40px] border border-zinc-800 shadow-2xl">
            {step.icon}
          </View>

          <TouchableWithoutFeedback onPress={finishTyping}>
            <View className="bg-zinc-900/40 border-l-2 border-cyan-500/30 p-8 rounded-tr-3xl rounded-br-3xl mb-12 shadow-inner w-full min-h-[140px]">
              <Text className="text-cyan-50/90 text-xl leading-[34px] font-serif italic text-left">
                {displayedText}
              </Text>
            </View>
          </TouchableWithoutFeedback>

          {step.choices && step.choices.length > 0 ? (
            <View className="w-full gap-4">
              {step.choices.map((choice, i) => {
                const isDone = choice.isSticky && choice.updates && Object.keys(choice.updates).every(k => (tutorialProgress as any)[k]);
                return (
                  <Pressable 
                    key={i}
                    hitSlop={10}
                    onPress={() => handleChoice(choice)}
                    className={`w-full h-16 border rounded-2xl flex-row items-center justify-center active:scale-95 ${
                      isDone ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-900/80 border-zinc-800'
                    }`}
                  >
                    <Text className={`font-bold uppercase tracking-[4px] text-xs ${isDone ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      {choice.label}
                    </Text>
                    {isDone && <CheckCircle2 size={12} color="#10b981" className="ml-3" />}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Pressable 
              hitSlop={10}
              onPress={() => {
                if (!finishTyping()) {
                  if (currentStep < TUTORIAL_STEPS.length - 1) updateTutorial({ currentStep: currentStep + 1 });
                  else updateTutorial({ isTutorialActive: false });
                }
              }}
              className="w-full h-20 bg-cyan-950/20 border border-cyan-500/30 rounded-3xl flex-row items-center justify-center shadow-lg active:scale-95"
            >
              <Text className="text-cyan-400 font-black text-xs uppercase tracking-[6px] mr-2">
                Continue
              </Text>
              <ChevronRight size={18} color="#06b6d4" />
            </Pressable>
          )}
        </Animated.View>
        <View className="absolute inset-0 opacity-[0.03] pointer-events-none bg-zinc-400" />
      </Animated.View>
    </View>
  );
};

export default TutorialView;
