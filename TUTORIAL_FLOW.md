# Aeternis: Odyssey - Tutorial Flow Documentation

This document outlines the step-by-step narrative, choices, and logic of the initial onboarding sequence in the Fracture.

## 1. Initial Awakening
*   **Step 0**: "you wake up, dazed..."
    *   [sit up] -> Step 1
    *   [stand up] -> Step 2
*   **Step 1**: "your arms and legs feel weak, but with a grunt of effort, you manage to sit up" -> Step 3
*   **Step 2**: "you try to stand up, but your arms and legs feel weak... you manage to sit up." -> Step 3

## 2. Exploration & Memory
*   **Step 3**: "you are sitting on the cold ground. what will you do now?"
    *   [stand up] -> Step 6 (Requires `hasLookedAround` & `hasTriedToRemember`)
    *   [take a look around] -> Step 4 (Sets `hasLookedAround`)
    *   [try to remember what happened] -> Step 5 (Sets `hasTriedToRemember`)
*   **Step 4**: "you take a look around... nature seems to have taken over..." -> Back to Step 3
*   **Step 5**: "you try to remember... but your memory is foggy" -> Back to Step 3

## 3. The Sound & The Orb
*   **Step 6**: "you finally manage to stand up... you realise you can hear a faint hum..."
    *   [sit back down] -> Step 7
    *   [move towards the sound] -> **Map View Unlocks** (Step 8 set as resume point)
*   **Step 7**: "you sit back down... stand back up" -> Map View Unlocks
*   **Step 8**: Arrival at Tutorial Marker (250m North)
    *   **Map Interaction**: User clicks "Explore" on the Glowing Blue Orb.
    *   **Text**: "as you move closer... a blue orb of energy rippling in the air..."
    *   [reach out and touch the light] -> Step 9
    *   [back away] -> Step 10
*   **Step 9**: "**Blinding Flash Transition**"
    *   [continue] -> **Full Screen White Flash** -> Step 11
*   **Step 10**: "you try to back away, but the light hypnotizes you..." -> Back to Step 9

## 4. The HUD Manifestation
*   **Step 11**: "you wake up, dazed..."
    *   [not again...] -> Step 12
*   **Step 12**: "you sit yourself back up again... you actually feel different..."
    *   [assess yourself] -> Step 13
    *   [take a look around] -> Step 14
*   **Step 13**: "you look over your body... faint rippling of blue light..." -> Step 14
*   **Step 14**: "you look around... you notice a small glowing blue orb in the corner of your eye..."
    *   [rub your eyes] -> Step 15
    *   [try focus on the orb of light] -> Step 16
*   **Step 15**: "nope, its still there" -> Step 14
*   **Step 16**: "you try to focus... a large heads up display appears..."
    *   [look at the screen] -> Step 17
*   **Step 17**: "the screen appears to have information... shimmering... replaced in a language you can read..."
    *   [interact with the screen] -> **Opens Hero Tab (Stats)** -> Step 18

## 5. The First Encounter
*   **Step 18**: (Triggered on return to Map) "you hear a growling sound behind you"
    *   [turn around] -> Step 19
*   **Step 19**: "you see what appears to be a large dog... hideously mutated..."
    *   [look around for something to defend yourself with] -> Step 20
*   **Step 20**: **Weapon Choice** (Impacts future Class)
    *   [a large stick] -> Learns **Heavy Strike**, Adds **Tutorial Stick** -> Step 21
    *   [a small car door] -> Learns **Shield Bash**, Adds **Small Car Door** -> Step 21
    *   [a group of rocks] -> Learns **Rock Toss**, Adds **Jagged Rocks** -> Step 21
*   **Step 21**: "you pick up the [weapon], just as the mutated dog charges at you"
    *   [continue] -> **Map Interaction** (Dog Spawned 100m West)
*   **Step 22**: **Combat Tutorial**
    *   User engages and defeats "Mutated Dog".
    *   Rewards: **1 x Aetium**.
    *   Post-Combat Logic -> Step 23

## 6. The Aetium Discovery
*   **Step 23**: "after finally defeating the mutated dog, you sit down, exhausted."
    *   [catch your breath] -> Step 24
*   **Step 24**: "once you catch your breath... notice it starts to slowly shimmer"
    *   [rub your eyes] -> Step 25
    *   [continue to observe] -> Step 26
*   **Step 25**: "yep, definitely shimmering" -> Step 26
*   **Step 26**: "the mutated dog... shimmers out of existence"
    *   [thats wack] -> Step 27
*   **Step 27**: "on the ground... you notice a glowing blue object, kind of like a crystal"
    *   [pick up the crystal] -> Step 28
*   **Step 28**: "it also shimmers and then disappears... '1 x aetium received'..."
    *   [check your character] -> **Opens Hero Tab** -> Step 29

## 7. The Quest Call
*   **Step 29**: (Triggered on return to Map) "you've confirmed that you now have one aetium..."
    *   [check pockets] -> Step 30
*   **Step 30**: "must be in the 'cloud' or something."
    *   [continue] -> Step 31
*   **Step 31**: "you hear another 'ping'... what could this be now."
    *   [look around] -> Step 32
*   **Step 32**: "you notice... more dogs... a small screen has appeared, titled 'QUEST'"
    *   [read the quest details] -> **Starts Quest: "Defeat Mutated Dogs"** -> **Opens Hero Tab (Quests)** -> Step 33
*   **Step 33**: (Triggered on return to Map) "really, five more dogs?"
    *   [prepare for battle] -> **Map Interaction** (5 Dogs Spawned 250m range) -> Step 34
*   **Step 34**: **Combat Sequence**
    *   User defeats 5 Mutated Dogs.
    *   Loot: **1 HP Potion, 1 MP Potion per kill**.
    *   Completion -> Step 35 (Final Checkpoint)

---
*Last Updated: February 14, 2026*
