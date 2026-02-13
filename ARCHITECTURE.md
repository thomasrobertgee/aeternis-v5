# Aeternis: Odyssey - Technical Architecture

This document outlines the current technical architecture and implementation status of the Aeternis: Odyssey mobile prototype.

## 1. Tech Stack
*   **Framework**: Expo SDK 54 (React Native)
*   **Language**: TypeScript
*   **State Management**: Zustand (Global stores for Player, Combat, and Travel)
*   **Persistence**: Zustand Persist + Async Storage
*   **Animations**: React Native Reanimated (Springs, Sequences, Layout Transitions)
*   **Styling**: NativeWind v4 (Tailwind CSS)
*   **Audio**: Expo AV (Global SoundService with Ambient/Battle transitions)
*   **Haptics**: Expo Haptics (Tactile combat, quest, and travel feedback)
*   **Location**: Web-based Geocoding (OSM Nominatim API) + Local GeoJSON Boundaries
*   **Maps**: React Native Maps (Fantasy-Dark Styling + Polygon Overlays)

## 2. Core Stores (Zustand)

### 2.1 `usePlayerStore`
The central source of truth for the player's journey.
*   **Stats**: Level, XP, Vitality, Imaginum, Aetium, Attack, Defense.
*   **World**: Current coordinates, **Persistent Zone Profiles** (Record of synthesized lore).
*   **RPG**: Inventory, Equipment (Weapon, Armor, Boots), Faction Reputation, Quests.
*   **Persistence**: Fully synced to `@aeternis-player-storage`.

### 2.2 `useTravelStore`
Manages the timed transit mechanics for the Aether-Link.
*   **Dynamic State**: `isTraveling` flag, `travelTimeRemaining` countdown (15s), `destinationCoords`.
*   **Lifecycle**: Manages the "In-Transit" lockout period and arrival triggers.

### 2.3 `useCombatStore`
Manages real-time turn-based encounters.
*   **Dynamic State**: Enemy health, turn order, combat logs, source Signal ID, Biome context.

## 3. RPG Systems

### 3.1 Geospatial Intelligence
*   **BoundaryService**: Loads GeoJSON polygons of Melbourne suburbs for precise, offline-capable location detection.
*   **WikipediaService**: Fetches real-world historical and industrial summaries for the current suburb via MediaWiki API.
*   **ZoneSynthesizer**: An "AI" layer that analyzes Wikipedia text to deterministically generate:
    *   **Dominant Faction**: Based on industry/nature keywords.
    *   **Difficulty/Resonance**: Based on the historical age of the locality.
    *   **Unique NPC**: Generates a persistent "Sector Contact" with a lore-accurate name and title.
*   **Instability Fog**: Visually restricts players under Level 10 to their Home City polygon using inverted `Polygon` holes.

### 3.2 Immersive Transit & Discovery
*   **Title Screen**: A cinematic entry point (`app/index.tsx`) featuring pulsing animations and atmospheric FX, acting as the primary synchronization portal.
*   **TransitView**: A full-screen tactical overlay during Fast Travel. Features a wireframe map animation, scrolling technical terminal logs, and a progress bar.
*   **DiscoveryOverlay**: A cinematic, full-screen notification triggered upon first entry into a new suburb polygon, displaying its synthesized "Fractured" title.
*   **Aether-Link Check**: Level-based movement restriction (Lvl 10 required to leave the Home Sanctuary).

### 3.3 Dynamic World
*   **ZoneEventManager**: Periodically triggers biome-specific events (e.g., **Industrial Steam Leak**) that modify combat difficulty and loot drops (Double Scrap).
*   **Biome-Specific Loot**: Adds locality-accurate items (e.g., **Sunken Relics** in Coastal zones) to the drop pool.

### 3.4 Combat Integrity
*   **Action Locking**: Implements an `isActionProcessing` state to debounce player inputs. This prevents rapid multi-click exploits, ensuring the turn-based logic remains synchronized with animations.

## 4. Completed Milestones
- [x] Initial Expo + NativeWind scaffolding.
- [x] Web-based geocoding (GeoService) with procedural fallback.
- [x] Home City Sanctuary system with Rest mechanic.
- [x] Animated Battle Arena with Enemy AI and Stat Scaling.
- [x] Global Sound System (Ambient & Battle tracks).
- [x] Haptic Feedback integration (Combat & Quests).
- [x] **Cinematic Title Screen and Entry Flow.**
- [x] **GeoJSON Boundary detection (BoundaryService).**
- [x] **Wikipedia-driven Zone Synthesis & Lore generation.**
- [x] **Timed Fast Travel (Transit System) with technical log readout.**
- [x] **Sector-specific Unique NPC generation.**
- [x] **Dynamic Zone Events (Steam Leak) and Biome-specific loot.**
- [x] **Visual "Fog of War" restriction for Level-gated areas.**
- [x] **Exploit Prevention: Combat Action Locking.**
