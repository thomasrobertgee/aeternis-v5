# Aeternis: Odyssey - Technical Architecture

This document outlines the current technical architecture and implementation status of the Aeternis: Odyssey mobile prototype.

## 1. Tech Stack
*   **Framework**: Expo SDK 54 (React Native)
*   **Language**: TypeScript
*   **State Management**: Zustand (Global stores for Player and Combat)
*   **Persistence**: Zustand Persist + Async Storage
*   **Animations**: React Native Reanimated (Springs, Sequences, Layout Transitions)
*   **Styling**: NativeWind v4 (Tailwind CSS)
*   **Location**: Expo Location (Reverse geocoding)
*   **Maps**: React Native Maps (Fantasy-Dark Styling)

## 2. Core Stores (Zustand)

### 2.1 `usePlayerStore`
The central source of truth for the player's journey.
*   **Stats**: Level, XP, Vitality (HP), Imaginum (Mana), Aetium (Gold), Attack, Defense.
*   **World**: Current coordinates, Discovered Zones.
*   **RPG**: Inventory (Items), Equipment Slots, Faction Reputation, Active Quests.
*   **Persistence**: Fully synced to `@aeternis-player-storage` via AsyncStorage.

### 2.2 `useCombatStore`
Manages real-time turn-based encounters.
*   **Dynamic State**: Enemy health, turn order, combat logs.
*   **Lifecycle**: Handles transitions between exploration and the battle arena.

## 3. RPG Systems

### 3.1 Procedural Engine & Biomes
Translates real-world geography into game content via `ProceduralEngine.ts`:
*   **Biome Detection**: Maps suburbs to **Industrial (Rust Fields)**, **Coastal (Misty Wharfs)**, or **Urban (Silicon Spires)**.
*   **Lore Injection**: Generates unique 3-sentence atmospheric intros using sensory and environmental templates.
*   **Safe Zones**: Designates specific areas (e.g., Altona North) as Sanctuaries with a "Rest" mechanic.

### 3.2 Combat & Enemy AI
*   **Enemy Factory**: Generates biome-accurate hostiles (e.g., Steam-Drones in industrial zones).
*   **Turn Logic**: Automated turn cycle with 1.2s delay for AI strikes and visual feedback (shake/flash).
*   **Stat Scaling**: Damage output and mitigation scale directly with equipped Gear stats.

### 3.3 Economy & Loot
*   **Loot Tables**: Probability-based drops dependent on enemy type (Scrap Metal, Aether Shards, Rations).
*   **Marketplace**: Trading node where Aetium is exchanged for high-tier gear or consumables.
*   **Inventory**: Grid-based UI with interactive "Use" (percentage-based healing) and "Equip" actions.

### 3.4 Dialogue & Narrative
*   **Dialogue Trees**: JSON-based branching paths with integrated actions (e.g., updating reputation, triggering combat).
*   **Visual FX**: NarrativeView features CRT-style scanlines, Vignette borders, and serif typography for deep immersion.

### 3.5 Questing
*   **Quest Tracker**: Floating map overlay displaying active objectives and progress bars.
*   **Progression**: Quest completion is linked to combat victories and yields massive XP/Aetium rewards.

## 4. Completed Milestones
- [x] Initial Expo + NativeWind scaffolding.
- [x] Zustand State Architecture with AsyncStorage persistence.
- [x] Reverse geocoding for suburb-to-biome mapping.
- [x] Procedural Narrative Engine with visual FX (CRT/Vignette).
- [x] Animated Battle Arena with Enemy AI and Stat Scaling.
- [x] Grid Inventory with Gear/Consumable logic.
- [x] Marketplace for resource trading.
- [x] Branching Dialogue system with Faction reputation integration.
- [x] Quest Tracking system linked to gameplay loops.
- [x] Sanctuary/Safe Zone detection and Rest mechanic.
