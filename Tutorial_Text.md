# Aeternis: Odyssey - Tutorial Script Reference

This document catalogs every step, narrative string, and player choice within the Aeternis: Odyssey onboarding sequence.

## Dynamic Placeholders
*   `{biome}`: The name of the player's chosen starting suburb (e.g., "Williamstown").
*   `{name}`: The player's chosen character name (default: "Traveller").
*   `{settlement}`: The procedurally generated name of the local safe-zone (e.g., "Nelson Place Settlement").
*   `{dungeon}`: The procedurally generated name of the local dungeon (e.g., "Point Gellibrand Dungeon").

---

## Phase 1: The Awakening

### Step 0: Initial Sight
*   **Text**: "You find yourself in {biome}. The air is thick with a strange, shimmering mist—the Imaginum. You don't remember how you got here."
*   **Choices**:
    *   **Look around**: (Updates: `hasLookedAround: true`, Next Step: 1)
*   **Icon**: Compass

### Step 1: Physical Struggle
*   **Text**: "Your arms and legs feel weak, but with a grunt of effort, you manage to sit up."
*   **Choices**:
    *   **Continue**: (Next Step: 2)
*   **Icon**: Brain

### Step 2: The Decision
*   **Text**: "You are sitting on the cold, damp ground. What will you do now?"
*   **Choices**:
    *   **Stand up**: (Requires `hasLookedAround` AND `hasTriedToRemember`. Next Step: 6. Fails to Step 5)
    *   **Take a look around**: (Next Step: 3, Sets `hasLookedAround: true`)
    *   **Try to remember what happened**: (Next Step: 4, Sets `hasTriedToRemember: true`)
*   **Icon**: Brain

### Step 3: Environment Scan
*   **Text**: "You take a look around. You recognize this place, but it seems different somehow. Everything is unkempt, nature seems to have reclaimed the world, and the air feels... strange."
*   **Choices**:
    *   **Back**: (Next Step: 2)
*   **Icon**: Eye

### Step 4: Memory Recall
*   **Text**: "You try to remember what happened, but your memory is a thick, impenetrable fog. Only flashes of static and light remain."
*   **Choices**:
    *   **Back**: (Next Step: 2)
*   **Icon**: Brain

### Step 5: Failure to Stand
*   **Text**: "You try to stand up, but your arms and legs still feel weak. Maybe you should take a moment to look around or try to clear your head first."
*   **Choices**:
    *   **Back**: (Next Step: 2)
*   **Icon**: Brain

---

## Phase 2: The Sound & The Light

### Step 6: Rising
*   **Text**: "You finally manage to stand up. Once the feeling of dizziness passes, you realize you can hear a faint hum in the distance—like the sound of raw energy vibrating in the air."
*   **Choices**:
    *   **Sit back down**: (Next Step: 7)
    *   **Move towards the sound**: (Action: Hides Overlay, Next Step: 8)
*   **Icon**: Sparkles

### Step 7: Restlessness
*   **Text**: "You sit back down. After a while you grow restless, and you stand back up, your eyes searching for the source of the noise."
*   **Choices**:
    *   **Move towards the sound**: (Action: Hides Overlay, Next Step: 8)
*   **Icon**: Sparkles

### Step 8: Discovery
*   **Text**: "As you move closer to the sound, it grows louder. You can see what looks like a blue orb of energy rippling in the air, pulsing with every sound it makes.\n\nYou keep moving towards it, and eventually, you are so close you could reach out and touch it..."
*   **Choices**:
    *   **Reach out and touch the light**: (Next Step: 9)
    *   **Back away**: (Next Step: 10)
*   **Icon**: Sparkles

### Step 9: The Flash
*   **Text**: "You slowly reach out to touch the light. As you get closer, your fingers start to tingle, then feel warm. The heat increases, spreading throughout your whole body. Suddenly, it's too much to bear, and there is a blinding flash of light..."
*   **Choices**:
    *   **Continue**: (Action: Triggers White Flash Animation, Clears Tutorial Marker, Next Step: 11)
*   **Icon**: Sparkles

### Step 10: Irresistible Pull
*   **Text**: "You try to back away, but the light hypnotizes you, drawing you in with an irresistible pull."
*   **Choices**:
    *   **Continue**: (Next Step: 9)
*   **Icon**: Eye

---

## Phase 3: The Internal Resonance & HUD

### Step 11: Changed
*   **Text**: "You wake up, dazed... again."
*   **Choices**:
    *   **Not again...**: (Next Step: 12)
*   **Icon**: Brain

### Step 12: Recovery
*   **Text**: "With a sigh, you sit yourself back up. You don't feel as weak as last time. Instead, you actually feel... different."
*   **Choices**:
    *   **Assess yourself**: (Next Step: 13)
    *   **Take a look around**: (Next Step: 14)
*   **Icon**: Brain

### Step 13: The Ripple
*   **Text**: "You look over your body and notice that underneath your skin, there appears to be a faint rippling of blue light, barely noticeable but undeniably there."
*   **Choices**:
    *   **Continue**: (Next Step: 14)
*   **Icon**: Brain

### Step 14: The Persistence
*   **Text**: "You are in the area where you came across the light. You look around and don't notice anything different from before, however, you notice a small glowing blue orb in the corner of your eye. No matter where you look, it persists."
*   **Choices**:
    *   **Rub your eyes**: (Next Step: 15)
    *   **Focus on the orb of light**: (Next Step: 16)
*   **Icon**: Eye

### Step 15: Projected Reality
*   **Text**: "Nope, it's still there. It seems to be projected directly onto your vision."
*   **Choices**:
    *   **Back**: (Next Step: 14)
*   **Icon**: Eye

### Step 16: HUD Manifestation
*   **Text**: "You try to focus on the orb of light in your vision, and suddenly you are startled as a large heads-up display appears in front of you, like a screen from an old game you used to play."
*   **Choices**:
    *   **Look at the screen**: (Next Step: 17)
*   **Icon**: Sparkles

### Step 17: Translation
*   **Text**: "The screen appears to have information written in another language you don't recognize. However, as you focus on the characters, they start to shimmer and are eventually replaced by words you can understand."
*   **Choices**:
    *   **Interact with the screen**: (Action: Navigates to Character Stats tab, Next Step: 18)
*   **Icon**: Sparkles

---

## Phase 4: First Blood

### Step 18: The Growl
*   **Text**: "You hear a low, guttural growl behind you."
*   **Choices**:
    *   **Turn around**: (Next Step: 19)
*   **Icon**: Skull

### Step 19: The Threat
*   **Text**: "You see what appears to be a large dog, but it is hideously mutated and scarred. It is slowly stalking towards you with menace in its eyes."
*   **Choices**:
    *   **Look for a weapon**: (Next Step: 20)
*   **Icon**: Skull

### Step 20: Weapon Choice
*   **Text**: "You see multiple potential weapons on the ground within reach. You rush to grab..."
*   **Choices**:
    *   **A large stick**: (Action: Grants Heavy Strike Skill + Weapon, Next Step: 21)
    *   **A small car door**: (Action: Grants Shield Bash Skill + Weapon, Next Step: 21)
    *   **A group of rocks**: (Action: Grants Rock Toss Skill + Weapon, Next Step: 21)
*   **Icon**: Briefcase

### Step 21: Engagement
*   **Text**: "You pick up the [chosen weapon] just as the mutated dog charges at you! Engage it on the map to defend yourself."
*   **Choices**:
    *   **[MAP INTERACTION REQUIRED]**: (Action: Hides Overlay, Spawns Dog Signal on Map)
*   **Icon**: Skull

### Step 22: Victory
*   **Text**: "After finally defeating the mutated dog, you sit down, exhausted and breathing heavily."
*   **Choices**:
    *   **Catch your breath**: (Next Step: 23)
*   **Icon**: Activity

---

## Phase 5: Loot & The Quest System

### Step 23: Shimmering Corpse
*   **Text**: "Once you catch your breath, you look at the corpse of the mutated dog and notice it starting to slowly shimmer."
*   **Choices**:
    *   **Rub your eyes**: (Next Step: 24)
    *   **Continue to observe**: (Next Step: 25)
*   **Icon**: Eye

### Step 24: Rule of Reality
*   **Text**: "Yep, definitely shimmering. This world follows very strange rules."
*   **Choices**:
    *   **Continue to observe**: (Next Step: 25)
*   **Icon**: Eye

### Step 25: Dissolution
*   **Text**: "The mutated dog shimmers more and more until eventually it seems to dissolve out of existence entirely."
*   **Choices**:
    *   **That's strange...**: (Next Step: 26)
*   **Icon**: Sparkles

### Step 26: The Crystal
*   **Text**: "On the ground where the corpse was, you notice a glowing blue object—a small, multifaceted crystal."
*   **Choices**:
    *   **Pick up the crystal**: (Next Step: 27)
*   **Icon**: Sparkles

### Step 27: Aetium Received
*   **Text**: "You crawl over and pick up the crystal. After staring at it for a few seconds, it also shimmers and disappears. Then, you hear a soft 'ding' and the words '1 x Aetium received' appear in the corner of your vision."
*   **Choices**:
    *   **Check your character**: (Action: Navigates to Stats Tab, Next Step: 28, Grants 1 Gold)
*   **Icon**: Sparkles

### Step 28: Cloud Storage
*   **Text**: "You've confirmed that you now have one Aetium, though you still don't know where it's being stored."
*   **Choices**:
    *   **Check pockets**: (Next Step: 29)
*   **Icon**: Briefcase

### Step 29: Incorporeal
*   **Text**: "Yep, definitely not in your pockets. It must be in the 'cloud' or some similar system."
*   **Choices**:
    *   **Continue**: (Next Step: 30)
*   **Icon**: Brain

### Step 30: Ping
*   **Text**: "You hear another 'ping'. Oh great, you think to yourself, what could this be now?"
*   **Choices**:
    *   **Look around**: (Next Step: 31)
*   **Icon**: Activity

### Step 31: Quest Manifestation
*   **Text**: "As you look around, you can see more mutated dogs in the shadows, circling you from a distance. You also notice a small screen has appeared in your vision, titled 'QUEST'."
*   **Choices**:
    *   **Read the quest details**: (Action: Starts "Defeat Mutated Dogs" Quest, Navigates to Quest Tab, Next Step: 32)
*   **Icon**: Scroll

### Step 32: The Pack
*   **Text**: "Really? Five more dogs? Prepare for battle—engage them on the map to survive."
*   **Choices**:
    *   **[MAP INTERACTION REQUIRED]**: (Action: Hides Overlay, Spawns 5 Dog Signals on Map)
*   **Icon**: Skull

### Step 33: Spent
*   **Text**: "You collapse on the ground, now truly exhausted. The immediate threat is over, but you are spent."
*   **Choices**:
    *   **Catch your breath, again**: (Next Step: 34)
*   **Icon**: Activity

---

## Phase 6: Unlocks & The Depths

### Step 34: Another Notification
*   **Text**: "You hear another 'ding', and notice a new notification pulsing in your HUD."
*   **Choices**:
    *   **Read the notification**: (Next Step: 35)
*   **Icon**: Sparkles

### Step 35: Marketplace Unlock
*   **Text**: "It reads: 'You have unlocked the Marketplace'."
*   **Choices**:
    *   **Marketplace..?**: (Action: Navigates to Social/Market Tab, Next Step: 36)
*   **Icon**: Briefcase

### Step 36: Dungeon Discovery
*   **Text**: "After browsing through the marketplace, you hear another 'ding'."
*   **Choices**:
    *   **Look at the notification**: (Next Step: 37)
*   **Icon**: Sparkles

### Step 37: The Depths Unlocked
*   **Text**: "The notification says 'Dungeon {dungeon} unlocked'. You hear another 'ding', this time for a new quest."
*   **Choices**:
    *   **Check quests**: (Action: Starts Dungeon Quest, Navigates to Quest Tab, Next Step: 38)
*   **Icon**: Scroll

### Step 38: The Arrival
*   **Text**: "You arrive at the entrance to the depths, however it is completely different from how you remember it."
*   **Choices**:
    *   **Take a look around**: (Next Step: 39)
*   **Icon**: Eye

### Step 39: The Wide Pit
*   **Text**: "The paths have been taken over by nature, the buildings are crumbling, and where the landmark used to be is now a dark, wide pit with stairs leading downwards. You assume that is the entrance to the depths."
*   **Choices**:
    *   **Proceed**: (Action: Hides Overlay, Enables Dungeon Entry on Map, Next Step: 40)
*   **Icon**: Sparkles

### Step 40: Jeff's Warning
*   **Text**: "\"This is it,\" Jeff whispers, peering into the dark wide pit. \"{dungeon}. The resonance coming from below is... unsettling. Be careful down there.\""
*   **Choices**:
    *   **Descend**: (Action: Hides Overlay, Next Step: 41)
*   **Icon**: Skull

### Step 41: Active Instance
*   **Text**: "Active Dungeon: Clear the depths to proceed."
*   **Choices**:
    *   **[DUNGEON INTERACTION REQUIRED]**: (Action: Overlay hidden until Dungeon Cleared)
*   **Icon**: Skull

---

## Phase 7: Meeting Jeff & Lore

### Step 42: Footsteps
*   **Text**: "After exiting the dungeon, you hear a shuffling of footsteps from behind a nearby ruin."
*   **Choices**:
    *   **Draw your weapon**: (Next Step: 43)
*   **Icon**: Skull

### Step 43: The Old Man
*   **Text**: "\"Wait, wait! I mean you no harm!\" A figure steps out from behind an old dumpster. He is an old man, wearing tattered, weathered clothing."
*   **Choices**:
    *   **Who are you?**: (Next Step: 44)
*   **Icon**: User

### Step 44: First Clearance
*   **Text**: "\"My name is Jeff, and I just wanted to say thank you for clearing the dungeon. You're the first to do it since The Collapse.\""
*   **Choices**:
    *   **The Collapse?**: (Next Step: 45)
*   **Icon**: User

### Step 45: Puzzled
*   **Text**: "Jeff looks at you with a puzzled expression. \"What do you mean? You don't know what The Collapse was?\""
*   **Choices**:
    *   **No**: (Next Step: 46)
*   **Icon**: User

### Step 46: Otherworlders
*   **Text**: "Jeff's eyes grow wide, his voice rising with excitement. \"Then you must be one of those famous 'Otherworlders' I keep hearing about!\""
*   **Choices**:
    *   **Otherworlders?**: (Next Step: 47)
*   **Icon**: User

### Step 47: Travelers
*   **Text**: "\"Yes, an Otherworlder! Someone who has traveled from another world—yours—into ours. Does that sound familiar?\""
*   **Choices**:
    *   **Yep, that sounds like me**: (Next Step: 48)
*   **Icon**: User

### Step 48: Summoned
*   **Text**: "\"Fantastic! I mean, probably not for you. I hear you guys have a hard time, randomly getting summoned from your home into a strange place and all that.\""
*   **Choices**:
    *   **Why are you so excited?**: (Next Step: 49)
*   **Icon**: User

### Step 49: The Only Chance
*   **Text**: "\"Because for us, who live here, you Otherworlders are our only chance at a more peaceful life.\""
*   **Choices**:
    *   **Explain?**: (Next Step: 50)
*   **Icon**: User

### Step 50: The Power
*   **Text**: "\"These dungeons, these monsters, these things in our world that to you seem like they are from a game... only Otherworlders like yourself have the power to interact with them, to defeat them. And when you do, things naturally become better for us.\""
*   **Choices**:
    *   **Keep listening**: (Next Step: 51)
*   **Icon**: User

### Step 51: Gratefulness
*   **Text**: "Jeff continues. \"We don't know why you were summoned, or your purpose beyond defeating what you come across, but we are always grateful for it. Which is why I wanted to say thanks and give you this.\""
*   **Choices**:
    *   **Continue**: (Action: Triggers Aetium Reward logic, Next Step: 52)
*   **Icon**: User

### Step 52: The Pouch
*   **Text**: "Jeff presents to you a small pouch. You take it and open it up to find multiple Aetium crystals inside. As soon as you touch them, they shimmer out of existence."
*   **Choices**:
    *   **Look at Jeff**: (Next Step: 53)
*   **Icon**: Package

### Step 53: Assurance
*   **Text**: "\"Sorry, I just wanted to be completely sure. These crystals are what we used to trade in our world, and only with Otherworlders do they disappear when held.\""
*   **Choices**:
    *   **I see...**: (Next Step: 54)
*   **Icon**: User

### Step 54: Identity
*   **Text**: "\"Anyway, what is your name, Otherworlder?\""
*   **Choices**:
    *   **My name is...**: (Action: Opens Character Name Input Modal, Next Step: 55)
*   **Icon**: User

---

## Phase 8: The Settlement & Conclusion

### Step 55: Nice to Meet You
*   **Text**: "\"Nice to meet you, {name}. Listen, I'm from a settlement not far from here. There are others you can talk to, vendors who sell supplies, and apparently you can set it as a 'safe respawn'—whatever that means.\""
*   **Choices**:
    *   **Lead the way**: (Action: Auto-Zooms Map to Settlement Location, Hides Overlay, Next Step: 56)
*   **Icon**: User

### Step 56: Arriving
*   **Text**: "You arrive at the settlement with Jeff. {settlement}, from your memory as a familiar landmark, now appears run down, with camping tents set up in the carpark, people walking around, and stalls that appear to be vendors."
*   **Choices**:
    *   **Continue**: (Next Step: 57)
*   **Icon**: Home

### Step 57: The Lodge
*   **Text**: "\"How about I show you around,\" Jeff begins. \"The Lodge is where we rest and recover. It's the only place where the static truly fades. You should try resting there—it might help stabilize your resonance.\""
*   **Choices**:
    *   **Explore**: (Action: Hides Overlay, Enables Settlement interaction, Next Step: 58)
*   **Icon**: User

### Step 58: Finale
*   **Text**: "You feel much better. The tutorial is now complete. Welcome to the Fracture, Otherworlder."
*   **Choices**:
    *   **Finish**: (Action: Sets `isTutorialComplete: true`, Closes Tutorial System)
*   **Icon**: Sparkles
