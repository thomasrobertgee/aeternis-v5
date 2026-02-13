# Aeternis: Odyssey - Technical Architecture

This document outlines the current technical architecture and implementation status of the Aeternis: Odyssey mobile prototype.

## 1. Tech Stack
*   **Framework**: Expo SDK 54 (React Native)
*   **Language**: TypeScript
*   **State Management**: Zustand (Global stores for Player and Combat)
*   **Persistence**: Zustand Persist + Async Storage
*   **Animations**: React Native Reanimated (Springs, Sequences, Layout Transitions)
*   **Styling**: NativeWind v4 (Tailwind CSS)
*   **Audio**: Expo AV (Global SoundService with Ambient/Battle transitions)
*   **Haptics**: Expo Haptics (Tactile combat and quest feedback)
*   **Location**: Web-based Geocoding (OSM Nominatim API) - *Bypasses native permissions*
*   **Maps**: React Native Maps (Fantasy-Dark Styling)

## 2. Core Stores (Zustand)

### 2.1 `usePlayerStore`
The central source of truth for the player's journey.
*   **Stats**: Level, XP, Vitality (HP), Imaginum (Mana), Aetium (Gold), Attack, Defense.
*   **World**: Current coordinates, Discovered Zones, Home City Anchor, Hostile Signals.
*   **RPG**: Inventory (Items), Equipment Slots (Weapon, Armor, Boots), Faction Reputation, Active Quests.
*   **Persistence**: Fully synced to `@aeternis-player-storage`. Includes a **Persistence Indicator** UI triggered on all `setItem` operations.

### 2.2 `useCombatStore`
Manages real-time turn-based encounters.
*   **Dynamic State**: Enemy health, turn order, combat logs, source Signal ID.
*   **Lifecycle**: Handles transitions between exploration and the battle arena.

## 3. RPG Systems

### 3.1 Procedural Engine & Biomes
Translates real-world geography into game content via `ProceduralEngine.ts` and `GeoService.ts`:
*   **Home City Anchor**: Allows users to establish a persistent Sanctuary upon first launch.
*   **Biome Detection**: Maps coordinates to **Industrial (Rust Fields)**, **Coastal (Misty Wharfs)**, or **Urban (Silicon Spires)**.
*   **Resilience**: Implements geocoding caching and procedural "Static Sector" fallbacks.
*   **Safe Zones**: Dynamically detects the Sanctuary to enable the "Rest" mechanic (Full HP/MP restore).

### 3.2 Tactical Map & Combat
*   **Hostile Signal Manifestation**: Enemies appear as red markers within a visual "Scanner" zone.
*   **Manual Radar**: "Scan Area" action generates new manifestations around the player's current location.
*   **Combat Loop**: Automated AI turn cycle with visual feedback and **Critical Hit** logic (15% chance for 1.75x damage).
*   **Haptic Feedback**: Heavy impact haptics on critical hits; success notifications on quest turn-ins.
*   **Sound System**: `SoundService` manages low-drone ambient world music and high-tension battle tracks.

### 3.3 Economy & Progression
*   **Loot Tables**: Probability-based drops (Scrap, Shards, Rations) plus rare equipment (Boots).
*   **Set Bonuses**: Equipping specific sets (e.g., Plasteel Armor + Boots) grants hidden stat modifiers (+5 Defense).
*   **Leveling**: XP-driven progression with permanent stat boosts and auto-triggering story events (Factions at Lvl 5, Specialization at Lvl 10).

### 3.4 Dialogue & Questing
*   **Dialogue Trees**: JSON-based branching paths with integrated state actions.
*   **Quest Tracker**: Functional side-panel overlay with real-time progress tracking and "Turn In" reward system.
*   **Bestiary**: Tracks encounters and defeats for all manifestations, unlocking lore descriptions upon mastery.

## 4. Completed Milestones
- [x] Initial Expo + NativeWind scaffolding.
- [x] Zustand State Architecture with AsyncStorage persistence.
- [x] Web-based geocoding (GeoService) with procedural fallback.
- [x] Home City Sanctuary system with Rest mechanic.
- [x] Zoom-Adaptive Map Proximity detection.
- [x] Manual Area Scanning (Radar) system.
- [x] Animated Battle Arena with Enemy AI and Stat Scaling.
- [x] Grid Inventory with Gear/Consumable logic.
- [x] Marketplace for resource trading.
- [x] Branching Dialogue system with Faction integration.
- [x] Quest Tracker with functional Reward Turn-In.
- [x] Global Sound System (Ambient & Battle tracks).
- [x] Haptic Feedback integration (Combat & Quests).
- [x] Critical Hit and Equipment Set Bonus systems.
- [x] Persistence Indicator UI ("Synchronizing...").
- [x] Bestiary tracking and Mastered Enemy lore.
