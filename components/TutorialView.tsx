import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, TouchableWithoutFeedback, TextInput } from 'react-native';
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
import { Brain, Eye, Sparkles, ChevronRight, AlertCircle, CheckCircle2, Skull, Briefcase, Activity, Scroll, User, Package } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { useUIStore } from '../utils/useUIStore';

const { width, height } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    text: "You wake up, dazed...",
    choices: [
      { label: "Sit up", nextStep: 1 },
      { label: "Stand up", nextStep: 2 }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "Your arms and legs feel weak, but with a grunt of effort, you manage to sit up.",
    choices: [{ label: "Continue", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You try to stand up, but your limbs feel like lead. With a grunt of effort, you manage to sit up. Maybe you'll try standing again when you've gained more strength.",
    choices: [{ label: "Continue", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You are sitting on the cold, damp ground. What will you do now?",
    choices: [
      { 
        label: "Stand up", 
        nextStep: 7, 
        validate: (p: any) => p.hasLookedAround && p.hasTriedToRemember,
        failStep: 6 
      },
      { label: "Take a look around", nextStep: 4, isSticky: true, updates: { hasLookedAround: true } },
      { label: "Try to remember what happened", nextStep: 5, isSticky: true, updates: { hasTriedToRemember: true } }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You take a look around. You recognize this place, but it seems different somehow. Everything is unkempt, nature seems to have reclaimed the world, and the air feels... strange.",
    choices: [{ label: "Back", nextStep: 3 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "You try to remember what happened, but your memory is a thick, impenetrable fog. Only flashes of static and light remain.",
    choices: [{ label: "Back", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You try to stand up, but your arms and legs still feel weak. Maybe you should take a moment to look around or try to clear your head first.",
    choices: [{ label: "Back", nextStep: 3 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You finally manage to stand up. Once the feeling of dizziness passes, you realize you can hear a faint hum in the distance—like the sound of raw energy vibrating in the air.",
    choices: [
      { label: "Sit back down", nextStep: 8 },
      { label: "Move towards the sound", updates: { isTutorialActive: false, currentStep: 9 } }
    ],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "You sit back down. After a while you grow restless, and you stand back up, your eyes searching for the source of the noise.",
    choices: [
      { label: "Move towards the sound", updates: { isTutorialActive: false, currentStep: 9 } }
    ],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "As you move closer to the sound, it grows louder. You can see what looks like a blue orb of energy rippling in the air, pulsing with every sound it makes.\n\nYou keep moving towards it, and eventually, you are so close you could reach out and touch it...",
    choices: [
      { label: "Reach out and touch the light", nextStep: 10 },
      { label: "Back away", nextStep: 11 }
    ],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "You slowly reach out to touch the light. As you get closer, your fingers start to tingle, then feel warm. The heat increases, spreading throughout your whole body. Suddenly, it's too much to bear, and there is a blinding flash of light...",
    choices: [{ label: "Continue", isFinalTouch: true }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "You try to back away, but the light hypnotizes you, drawing you in with an irresistible pull.",
    choices: [{ label: "Continue", nextStep: 10 }],
    icon: <Eye size={32} color="#a855f7" />
  },
  {
    text: "You wake up, dazed... again.",
    choices: [
      { label: "Not again...", nextStep: 13 }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "With a sigh, you sit yourself back up. You don't feel as weak as last time. Instead, you actually feel... different.",
    choices: [
      { label: "Assess yourself", nextStep: 14 },
      { label: "Take a look around", nextStep: 15 }
    ],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You look over your body and notice that underneath your skin, there appears to be a faint rippling of blue light, barely noticeable but undeniably there.",
    choices: [{ label: "Continue", nextStep: 15 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You are in the area where you came across the light. You look around and don't notice anything different from before, however, you notice a small glowing blue orb in the corner of your eye. No matter where you look, it persists.",
    choices: [
      { label: "Rub your eyes", nextStep: 16 },
      { label: "Focus on the orb of light", nextStep: 17 }
    ],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "Nope, it's still there. It seems to be projected directly onto your vision.",
    choices: [{ label: "Back", nextStep: 15 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "You try to focus on the orb of light in your vision, and suddenly you are startled as a large heads-up display appears in front of you, like a screen from an old game you used to play.",
    choices: [{ label: "Look at the screen", nextStep: 18 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "The screen appears to have information written in another language you don't recognize. However, as you focus on the characters, they start to shimmer and are eventually replaced by words you can understand.",
    choices: [{ label: "Interact with the screen", isHeroTrigger: true, nextStep: 19 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "You hear a low, guttural growl behind you.",
    choices: [{ label: "Turn around", nextStep: 20 }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "You see what appears to be a large dog, but it is hideously mutated and scarred. It is slowly stalking towards you with menace in its eyes.",
    choices: [{ label: "Look for a weapon", nextStep: 21 }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "You see multiple potential weapons on the ground within reach. You rush to grab...",
    choices: [
      { label: "A large stick", isWeaponChoice: true, weaponId: 'stick' },
      { label: "A small car door", isWeaponChoice: true, weaponId: 'door' },
      { label: "A group of rocks", isWeaponChoice: true, weaponId: 'rocks' }
    ],
    icon: <Briefcase size={32} color="#06b6d4" />
  },
  {
    text: "You pick up the improvised weapon just as the mutated dog charges at you!",
    choices: [{ label: "Continue", nextStep: 23, updates: { isTutorialActive: false } }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "The mutated dog is upon you! Engage it on the map to defend yourself.",
    choices: [],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "After finally defeating the mutated dog, you sit down, exhausted and breathing heavily.",
    choices: [{ label: "Catch your breath", nextStep: 25 }],
    icon: <Activity size={32} color="#06b6d4" />
  },
  {
    text: "Once you catch your breath, you look at the corpse of the mutated dog and notice it starting to slowly shimmer.",
    choices: [
      { label: "Rub your eyes", nextStep: 26 },
      { label: "Continue to observe", nextStep: 27 }
    ],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "Yep, definitely shimmering. This world follows very strange rules.",
    choices: [{ label: "Continue to observe", nextStep: 27 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "The mutated dog shimmers more and more until eventually it seems to dissolve out of existence entirely.",
    choices: [{ label: "That's strange...", nextStep: 28 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "On the ground where the corpse was, you notice a glowing blue object—a small, multifaceted crystal.",
    choices: [{ label: "Pick up the crystal", nextStep: 29 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "You crawl over and pick up the crystal. After staring at it for a few seconds, it also shimmers and disappears. Then, you hear a soft 'ding' and the words '1 x Aetium received' appear in the corner of your vision.",
    choices: [{ label: "Check your character", isHeroTrigger: true, nextStep: 30 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "You've confirmed that you now have one Aetium, though you still don't know where it's being stored.",
    choices: [{ label: "Check pockets", nextStep: 31 }],
    icon: <Briefcase size={32} color="#06b6d4" />
  },
  {
    text: "Yep, definitely not in your pockets. It must be in the 'cloud' or some similar system.",
    choices: [{ label: "Continue", nextStep: 32 }],
    icon: <Brain size={32} color="#a855f7" />
  },
  {
    text: "You hear another 'ping'. Oh great, you think to yourself, what could this be now?",
    choices: [{ label: "Look around", nextStep: 33 }],
    icon: <Activity size={32} color="#06b6d4" />
  },
  {
    text: "As you look around, you can see more mutated dogs in the shadows, circling you from a distance. You also notice a small screen has appeared in your vision, titled 'QUEST'.",
    choices: [{ label: "Read the quest details", isQuestTrigger: true, nextStep: 34 }],
    icon: <Scroll size={32} color="#f59e0b" />
  },
  {
    text: "Really? Five more dogs?",
    choices: [{ label: "Prepare for battle", nextStep: 35, updates: { isTutorialActive: false } }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "The mutated dogs are upon you! Engage them on the map to defend yourself.",
    choices: [],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "You collapse on the ground, now truly exhausted. The immediate threat is over, but you are spent.",
    choices: [{ label: "Catch your breath, again", nextStep: 37 }],
    icon: <Activity size={32} color="#06b6d4" />
  },
  {
    text: "You hear another 'ding', and notice a new notification pulsing in your HUD.",
    choices: [{ label: "Read the notification", nextStep: 38 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "It reads: 'You have unlocked the Marketplace'.",
    choices: [{ label: "Marketplace..?", isMarketTrigger: true, nextStep: 39 }],
    icon: <Briefcase size={32} color="#06b6d4" />
  },
  {
    text: "After browsing through the marketplace, you hear another 'ding'.",
    choices: [{ label: "Look at the notification", nextStep: 40 }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "The notification says 'Dungeon MILLERS JUNCTION DEPTHS unlocked'. You hear another 'ding', this time for a new quest.",
    choices: [{ label: "Check quests", isQuestTrigger: true, nextStep: 41 }],
    icon: <Scroll size={32} color="#f59e0b" />
  },
  {
    text: "You arrive at Miller's Junction, however it is completely different from how you remember it.",
    choices: [{ label: "Take a look around", nextStep: 42 }],
    icon: <Eye size={32} color="#06b6d4" />
  },
  {
    text: "The paths have been taken over by nature, the buildings are crumbling, and where the roundabout used to be is now a dark, wide pit with stairs leading downwards. You assume that is the entrance to the depths.",
    choices: [{ 
      label: "Proceed", 
      updates: { isTutorialActive: false, currentStep: 43 },
    }],
    icon: <Sparkles size={32} color="#06b6d4" />
  },
  {
    text: "Active Dungeon: Clear the depths to proceed.",
    choices: [],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "Congratulations, you've completed the dungeon!",
    choices: [{ label: "Continue", nextStep: 45 }],
    icon: <Sparkles size={32} color="#10b981" />
  },
  {
    text: "After exiting the dungeon, you hear a shuffling of footsteps from behind a nearby ruin.",
    choices: [{ label: "Draw your weapon", nextStep: 46 }],
    icon: <Skull size={32} color="#ef4444" />
  },
  {
    text: "\"Wait, wait! I mean you no harm!\" A figure steps out from behind an old dumpster. He is an old man, wearing tattered, weathered clothing.",
    choices: [{ label: "Who are you?", nextStep: 47 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"My name is Jeff, and I just wanted to say thank you for clearing the dungeon. You're the first to do it since The Collapse.\"",
    choices: [{ label: "The Collapse?", nextStep: 48 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "Jeff looks at you with a puzzled expression. \"What do you mean? You don't know what The Collapse was?\"",
    choices: [{ label: "No", nextStep: 49 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "Jeff's eyes grow wide, his voice rising with excitement. \"Then you must be one of those famous 'Otherworlders' I keep hearing about!\"",
    choices: [{ label: "Otherworlders?", nextStep: 50 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"Yes, an Otherworlder! Someone who has traveled from another world—yours—into ours. Does that sound familiar?\"",
    choices: [{ label: "Yep, that sounds like me", nextStep: 51 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"Fantastic! I mean, probably not for you. I hear you guys have a hard time, randomly getting summoned from your home into a strange place and all that.\"",
    choices: [{ label: "Why are you so excited?", nextStep: 52 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"Because for us, who live here, you Otherworlders are our only chance at a more peaceful life.\"",
    choices: [{ label: "Explain?", nextStep: 53 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"These dungeons, these monsters, these things in our world that to you seem like they are from a game... only Otherworlders like yourself have the power to interact with them, to defeat them. And when you do, things naturally become better for us.\"",
    choices: [{ label: "Keep listening", nextStep: 54 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "Jeff continues. \"We don't know why you were summoned, or your purpose beyond defeating what you come across, but we are always grateful for it. Which is why I wanted to say thanks and give you this.\"",
    choices: [{ label: "Continue", nextStep: 55, isAetiumReward: true }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "Jeff presents to you a small pouch. You take it and open it up to find multiple Aetium crystals inside. As soon as you touch them, they shimmer out of existence.",
    choices: [{ label: "Look at Jeff", nextStep: 56 }],
    icon: <Package size={32} color="#f59e0b" />
  },
  {
    text: "\"Sorry, I just wanted to be completely sure. These crystals are what we used to trade in our world, and only with Otherworlders do they disappear when held.\"",
    choices: [{ label: "I see...", nextStep: 57 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"Anyway, what is your name, Otherworlder?\"",
    choices: [{ label: "My name is...", isNameTrigger: true, nextStep: 59 }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "\"Nice to meet you, {name}. Listen, I'm from a settlement not far from here. There are others you can talk to, vendors who sell supplies, and apparently you can set it as a 'safe respawn'—whatever that means.\"",
    choices: [{ label: "Lead the way", updates: { isTutorialActive: false, currentStep: 59 } }],
    icon: <User size={32} color="#a855f7" />
  },
  {
    text: "The tutorial is now complete. Welcome to the Fracture.",
    choices: [{ label: "Finish", updates: { isTutorialActive: false, currentStep: 60 } }],
    icon: <Sparkles size={32} color="#10b981" />
  }
];

const TutorialView = () => {
  const router = useRouter();
  const pathname = usePathname();
  const setHeroTab = useUIStore(s => s.setHeroTab);
  const { tutorialProgress, updateTutorial, clearTutorialMarker, logChoice, addItem, startQuest, choicesLog, learnSkill, equipItem, setStats, gold, setPlayerName, playerName } = usePlayerStore();
  
  const [nameInput, setNameInput] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const pendingNextStepRef = useRef<number | null>(null);

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
      return `You pick up the ${weaponName} just as the mutated dog charges at you!`;
    }
    return baseText.replace('{name}', playerName);
  }, [choicesLog, playerName]);

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
      if (choice.failStep !== undefined) {
        updateTutorial({ currentStep: choice.failStep });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alert(choice.failText);
      }
      return;
    }

    if (choice.isFinalTouch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      flashOpacity.value = withTiming(1, { duration: 1500 }, (finished) => {
        if (finished) {
          runOnJS(clearTutorialMarker)();
          runOnJS(updateTutorial)({ currentStep: 12 });
          flashOpacity.value = withTiming(0, { duration: 2000 });
        }
      });
      return;
    }

    if (choice.isHeroTrigger) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setHeroTab(currentStep === 33 ? 'Quests' : 'Stats');
      updateTutorial({ isTutorialActive: false, currentStep: choice.nextStep });
      router.replace('/(tabs)/character');
      return;
    }

    if (choice.isMarketTrigger) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      updateTutorial({ isTutorialActive: false, currentStep: choice.nextStep });
      router.replace('/(tabs)/social');
      return;
    }

    if (choice.isQuestTrigger) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      if (currentStep === 40) {
        startQuest({
          id: 'q-millers-junction-depths',
          title: 'Clear Millers Junction Depths',
          description: 'Descend into the darkness of the murky depths and purge the anomaly.',
          targetCount: 1,
          currentCount: 0,
          isCompleted: false,
          rewardXp: 1000,
          rewardGold: 5000,
        });
      } else {
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
      }
      setHeroTab('Quests');
      updateTutorial({ isTutorialActive: false, currentStep: choice.nextStep });
      router.replace('/(tabs)/character');
      return;
    }

    if (choice.isAetiumReward) {
      setStats({ gold: gold + 50 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (choice.isNameTrigger) {
      setNameInput("");
      setShowNameInput(true);
      pendingNextStepRef.current = choice.nextStep;
      return;
    }

    if (choice.isWeaponChoice) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logChoice(`weapon_${choice.weaponId}`);
      let item: any;
      let skill: any;
      if (choice.weaponId === 'stick') {
        item = { 
          id: 'tutorial-stick', 
          name: 'Large Heavy Stick', 
          category: 'Weapon', 
          rarity: 'Common', 
          description: 'A sturdy branch that feels surprisingly balanced.', 
          stats: { attack: 5 },
          grantedSkill: { id: 'skill-heavy-strike', name: 'Heavy Strike', level: 1, description: 'A powerful overhead swing using your makeshift club.', type: 'Active' }
        };
        skill = item.grantedSkill;
      } else if (choice.weaponId === 'door') {
        item = { 
          id: 'tutorial-door', 
          name: 'Small Car Door', 
          category: 'Weapon', 
          rarity: 'Common', 
          description: 'A rusted sheet of metal with a handle.', 
          stats: { attack: 5 },
          grantedSkill: { id: 'skill-shield-bash', name: 'Shield Bash', level: 1, description: 'Slam your metal barrier into the enemy to daze them.', type: 'Active' }
        };
        skill = item.grantedSkill;
      } else if (choice.weaponId === 'rocks') {
        item = { 
          id: 'tutorial-rocks', 
          name: 'Bag of Jagged Rocks', 
          category: 'Weapon', 
          rarity: 'Common', 
          description: 'Sharp pieces of concrete and flint.', 
          stats: { attack: 4 },
          grantedSkill: { id: 'skill-rock-toss', name: 'Rock Toss', level: 1, description: 'Hurl jagged debris at enemies from a safe distance.', type: 'Active' }
        };
        skill = item.grantedSkill;
      }
      addItem(item);
      equipItem(item);
      learnSkill(skill);
      updateTutorial({ currentStep: 22 });
      return;
    }

    if (choice.updates) {
      updateTutorial(choice.updates);
    }
    if (choice.nextStep !== undefined) {
      updateTutorial({ currentStep: choice.nextStep });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // Only show tutorial on explore (map), battle, character, social or title screen
  const isAllowedPath = pathname === '/' || pathname === '/explore' || pathname === '/battle' || pathname === '/character' || pathname === '/social' || pathname.includes('(tabs)');
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
              
              {showNameInput && (
                <View className="mt-6 flex-row items-center gap-4">
                  <TextInput
                    value={nameInput}
                    onChangeText={setNameInput}
                    placeholder="Enter name..."
                    placeholderTextColor="#3f3f46"
                    className="flex-1 bg-black/40 border border-cyan-500/20 rounded-xl px-4 py-3 text-white font-bold"
                    autoFocus
                  />
                  <Pressable 
                    onPress={() => {
                      if (nameInput.trim().length > 0) {
                        setPlayerName(nameInput.trim());
                        setShowNameInput(false);
                        const nextStep = pendingNextStepRef.current || currentStep + 1;
                        updateTutorial({ currentStep: nextStep, isTutorialActive: true });
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        pendingNextStepRef.current = null;
                      }
                    }}
                    className="bg-cyan-600 px-6 py-3 rounded-xl"
                  >
                    <Text className="text-white font-black text-xs uppercase">Save</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>

          {(!isTyping && step.choices && step.choices.length > 0 && !showNameInput) ? (
            <View className="w-full gap-4">
              {step.choices.map((choice, i) => {
                const isDone = choice.isSticky && choice.updates && Object.keys(choice.updates).every(k => (tutorialProgress as any)[k]);
                // Grey out the 'Stand up' choice if requirements aren't met
                const isLocked = choice.label === 'Stand up' && choice.validate && !choice.validate(tutorialProgress);

                return (
                  <Pressable 
                    key={i}
                    hitSlop={10}
                    onPress={() => handleChoice(choice)}
                    className={`w-full h-16 border rounded-2xl flex-row items-center justify-center active:scale-95 ${
                      isLocked ? 'bg-zinc-950 border-zinc-900 opacity-40' : 
                      isDone ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-900/80 border-zinc-800'
                    }`}
                  >
                    <Text className={`font-bold uppercase tracking-[4px] text-xs ${isLocked ? 'text-zinc-800' : isDone ? 'text-zinc-700' : 'text-zinc-300'}`}>
                      {choice.label}
                    </Text>
                    {isDone && <CheckCircle2 size={12} color="#10b981" className="ml-3" />}
                  </Pressable>
                );
              })}
            </View>
          ) : (!isTyping && !showNameInput) ? (
            <Pressable 
              hitSlop={10}
              onPress={() => {
                if (!finishTyping()) {
                  // Prevent skipping active combat/dungeon phases
                  if (currentStep === 23 || currentStep === 35 || currentStep === 43) {
                    updateTutorial({ isTutorialActive: false });
                    return;
                  }
                  
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
          ) : null}
        </Animated.View>
        <View className="absolute inset-0 opacity-[0.03] pointer-events-none bg-zinc-400" />
      </Animated.View>
    </View>
  );
};

export default TutorialView;
