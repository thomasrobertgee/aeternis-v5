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
    *   [stand up] -> Step 6 (Requires `hasLookedAround` & `hasTriedToRemember`)
    *   [take a look around] -> Step 4 (Sets `hasLookedAround`)
    *   [try to remember what happened] -> Step 5 (Sets `hasTriedToRemember`)
*   **Step 4**: "nature seems to have taken over..." -> Back to Step 3
*   **Step 5**: "memory is foggy..." -> Back to Step 3

## 3. The Sound & The Orb
*   **Step 6**: "you finally manage to stand up... faint hum..."
    *   [sit back down] -> Step 7
    *   [move towards the sound] -> Map View Unlocks (Step 8 set as resume point)
*   **Step 7**: "sit back down... grow restless..." -> Map View Unlocks
*   **Step 8**: Arrival at Tutorial Marker (250m North)
    *   **Interaction**: User clicks "Explore" on the Glowing Blue Orb.
    *   [reach out and touch the light] -> Step 9
    *   [back away] -> Step 10
*   **Step 9**: Blinding Flash Transition -> Step 11
*   **Step 10**: "light hypnotizes you..." -> Back to Step 9

## 4. The HUD & First Blood
*   **Step 11**: Second Awakening -> Step 12
*   **Step 12**: "actually feel different..."
    *   [assess yourself] -> Step 13
    *   [take a look around] -> Step 14
*   **Step 13**: "blue light rippling under skin..." -> Step 14
*   **Step 14**: Persistent blue orb in vision.
    *   [rub your eyes] -> Step 15
    *   [focus on the orb] -> Step 16
*   **Step 15**: "nope, its still there" -> Step 14
*   **Step 16**: **HUD Unlocks** (Stats) -> Step 17
*   **Step 17**: "language replaced..."
    *   [interact with the screen] -> Opens Hero Tab -> Step 18
*   **Step 18**: (Return to Map) Growl heard -> Step 19
*   **Step 19**: "hideously mutated dog..." -> Step 20
*   **Step 20**: **Weapon Choice**
    *   [large stick] / [car door] / [rocks] -> Rewards Weapon + Skill -> Step 21
*   **Step 21**: "you pick up the weapon..." -> Step 22 (Spawn "Small Mutated Dog")
*   **Step 22**: **Combat Tutorial 1** (30 HP) -> Step 23

## 5. Questing & Marketplace
*   **Step 23**: "after defeating the dog... exhausted" -> Step 24
*   **Step 24**: Corpse shimmers.
    *   [rub your eyes] / [observe] -> Step 25/26
*   **Step 26**: Corpse disappears -> Step 27
*   **Step 27**: Glowing crystal found.
    *   [pick up crystal] -> Step 28 (Rewards 1 x Aetium)
*   **Step 28**: "check your character..." -> Opens Hero Tab -> Step 29
*   **Step 29**: (Return to Map) "cloud storage" -> Step 30
*   **Step 30**: "ping" heard -> Step 31
*   **Step 31**: "look around..." -> Step 32
*   **Step 32**: More dogs circling. **Quest UI Manifests**.
    *   [read quest details] -> Starts "Defeat Mutated Dogs" -> Opens Quests Tab -> Step 33
*   **Step 33**: (Return to Map) Prepare for battle -> Step 34 (Spawn 5 dogs)
*   **Step 34**: **Combat Sequence 2** (Kill 5 Dogs) -> Step 35

## 6. The Miller's Junction Depths
*   **Step 35**: Exhaustion sequence -> Step 36
*   **Step 36**: Notification "ding" -> Step 37
*   **Step 37**: Marketplace unlock.
    *   [marketplace..?] -> Opens Social Tab -> Step 38
*   **Step 38**: (Return to Map) Another "ding" -> Step 39
*   **Step 39**: **Dungeon Quest**.
    *   [check quests] -> Starts "Clear Millers Junction Depths" -> Opens Quests Tab -> Step 40
*   **Step 40**: **Fast Travel Tutorial**. User travels to Miller's Junction entrance.
*   **Step 41**: Arrival at Miller's Junction.
    *   [take a look around] -> Step 42
*   **Step 42**: Observation of crumbling buildings.
    *   [proceed] -> Step 43 (Enables Dungeon Entry)
*   **Step 43**: **Active Dungeon State**. Player explores and clears the 10-stage instance.

## 7. Meeting Jeff & Settlement
*   **Step 44**: Post-Dungeon Proximity Trigger (Must be back on Map + Clear Dungeon).
    *   "shuffling of footsteps..." -> [draw weapon] -> Step 45
*   **Step 45**: Jeff steps out.
    *   [who are you?] -> Step 46
*   **Step 46**: Jeff thanks the "Otherworlder".
*   **Step 47-52**: Deep Lore Dump (The Collapse, Otherworlders, the Purpose).
*   **Step 53**: Jeff rewards player with 500 Aetium crystals -> Step 54
*   **Step 54**: Player receives Aetium crystals -> Step 55
*   **Step 55**: "anyway, what is your name?"
*   **Step 56**: **Name Selection Prompt**.
    *   User enters and saves name -> Step 57
*   **Step 57**: "nice to meet you {name}. settlement nearby..."
    *   [lead the way] -> Step 58 (Tutorial End Point)
*   **Step 58**: **Settlement Discovered**. Altona Gate safe-zone marker manifest.

---
*Last Updated: February 17, 2026*
