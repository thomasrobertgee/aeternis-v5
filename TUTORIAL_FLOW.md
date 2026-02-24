# Aeternis: Odyssey - Tutorial Flow Documentation

This document outlines the step-by-step narrative, choices, and logic of the initial onboarding sequence in the Fracture.

## 1. Initial Awakening
*   **Step 0**: "you wake up, dazed..."
    *   [sit up] -> Step 1
    *   [stand up] -> Step 2
*   **Step 1**: "your arms and legs feel weak..." -> Step 3
*   **Step 2**: "you try to stand up..." -> Step 3

## 2. Exploration & Memory
*   **Step 3**: "you are sitting on the cold ground..."
    *   [stand up] -> Step 7 (Requires `hasLookedAround` & `hasTriedToRemember`)
    *   [take a look around] -> Step 4 (Sets `hasLookedAround`)
    *   [try to remember what happened] -> Step 5 (Sets `hasTriedToRemember`)
*   **Step 4**: "nature seems to have taken over..." -> Back to Step 3
*   **Step 5**: "memory is foggy..." -> Back to Step 3
*   **Step 6**: "try to stand up... limbs lead" -> Back to Step 3

## 3. The Sound & The Orb
*   **Step 7**: "you finally manage to stand up... faint hum..."
    *   [sit back down] -> Step 8
    *   [move towards the sound] -> Map View Unlocks (Step 9 set as resume point)
*   **Step 8**: "sit back down... grow restless..." -> Map View Unlocks
*   **Step 9**: Arrival at Tutorial Marker (250m North)
    *   **Interaction**: User clicks "Explore" on the Glowing Blue Orb.
    *   [reach out and touch the light] -> Step 10
    *   [back away] -> Step 11
*   **Step 10**: Blinding Flash Transition -> Step 12
*   **Step 11**: "light hypnotizes you..." -> Back to Step 10

## 4. The HUD & First Blood
*   **Step 12**: Second Awakening -> Step 13
*   **Step 13**: "actually feel different..."
    *   [assess yourself] -> Step 14
    *   [take a look around] -> Step 15
*   **Step 14**: "blue light rippling under skin..." -> Step 15
*   **Step 15**: Persistent blue orb in vision.
    *   [rub your eyes] -> Step 16
    *   [focus on the orb] -> Step 17
*   **Step 16**: "nope, its still there" -> Step 15
*   **Step 17**: **HUD Unlocks** (Stats) -> Step 18
*   **Step 18**: "language replaced..."
    *   [interact with the screen] -> Opens Hero Tab -> Step 19
*   **Step 19**: (Return to Map) Growl heard -> Step 20
*   **Step 20**: "hideously mutated dog..." -> Step 21
*   **Step 21**: **Weapon Choice**
    *   [large stick] / [car door] / [rocks] -> Rewards Weapon + Skill -> Step 22
*   **Step 22**: "you pick up the weapon..." -> Tutorial Overlay Hides (Enables Map Interaction)
*   **Step 23**: **Active Battle Stage**. Player must click red marker on map.
*   **Step 24**: Post-Battle narrative: "after finally defeating the dog... exhausted" -> Step 25

## 5. Loot & Quests
*   **Step 25**: Corpse shimmers.
    *   [rub your eyes] / [observe] -> Step 26/27
*   **Step 27**: Corpse disappears -> Step 28
*   **Step 28**: Glowing crystal found.
    *   [pick up crystal] -> Step 29 (Rewards 1 x Aetium)
*   **Step 29**: "check your character..." -> Opens Hero Tab -> Step 30
*   **Step 30**: (Return to Map) "cloud storage" -> Step 31
*   **Step 31**: "ping" heard -> Step 32
*   **Step 32**: "look around..." -> Step 33
*   **Step 33**: More dogs circling. **Quest UI Manifests**.
    *   [read quest details] -> Starts "Defeat Mutated Dogs" -> Opens Quests Tab -> Step 34
*   **Step 34**: (Return to Map) Prepare for battle -> Tutorial Overlay Hides
*   **Step 35**: **Active Quest Stage**. Player kills 5 Dogs on map.
*   **Step 36**: Post-Quest narrative: "collapse on ground... spent" -> Step 37

## 6. The Miller's Junction Depths
*   **Step 37**: Notification "ding" -> Step 38
*   **Step 38**: Marketplace unlock.
    *   [marketplace..?] -> Opens Social Tab -> Step 39
*   **Step 39**: (Return to Map) Another "ding" -> Step 40
*   **Step 40**: **Dungeon Quest Manifests**.
    *   [check quests] -> Starts "Clear Millers Junction Depths" -> Opens Quests Tab -> Step 41
*   **Step 41**: (Return to Map) **Auto-Zoom to Miller's Junction**. User travels to entrance.
*   **Step 42**: Arrival at Miller's Junction.
    *   [take a look around] -> Step 43
*   **Step 43**: Observation of crumbling buildings.
    *   [proceed] -> Tutorial Overlay Hides (Enables Dungeon Entry)
*   **Step 44**: **Active Dungeon State**. Player explores and clears the 10-stage instance.

## 7. Meeting Jeff & Settlement
*   **Step 45**: Post-Dungeon Proximity Trigger (Must be back on Map + Clear Dungeon).
    *   "shuffling of footsteps..." -> [draw weapon] -> Step 46
*   **Step 46**: Jeff steps out.
    *   [who are you?] -> Step 47
*   **Step 47**: Jeff thanks the "Otherworlder".
*   **Steps 48-54**: Deep Lore Dump (The Collapse, Otherworlders, the Purpose).
*   **Step 55**: Jeff rewards player with Aetium crystals -> Step 56
*   **Step 56**: Player receives crystals -> Step 57
*   **Step 57**: "anyway, what is your name?"
    *   [my name is...] -> Opens Name Entry
*   **Step 58**: **Name Entry Sequence**. User enters name and saves. -> Step 59
*   **Step 59**: "settlement nearby..."
    *   [lead the way] -> **Auto-Zoom to Altona Gate**. Tutorial Overlay Hides.
*   **Step 60**: **Tutorial End Sequence**.
    *   [finish] -> Final completion.

---
*Last Updated: February 24, 2026*
