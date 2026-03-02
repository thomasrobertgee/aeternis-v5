# Aeternis: Odyssey - Technical Architecture

This document outlines the current technical architecture and implementation status of the Aeternis: Odyssey mobile prototype.

## 1. Tech Stack
*   **Framework**: Expo SDK 54 (React Native)
*   **Language**: TypeScript
*   **State Management**: Zustand (Global stores for Player, Combat, Dungeon, and Travel)
*   **Persistence**: Zustand Persist + Async Storage
*   **Animations**: React Native Reanimated (Springs, Sequences, Layout Transitions)
*   **Styling**: NativeWind v4 (Tailwind CSS)
*   **Audio**: Expo AV (Global SoundService with Ambient/Battle transitions)
*   **Haptics**: Expo Haptics (Tactile combat, quest, and travel feedback)
*   **Location**: Web-based Geocoding (OSM Nominatim API) + Local GeoJSON Boundaries
*   **Maps**: React Native Maps (Fantasy-Dark Styling + Polygon Overlays)

## 2. Core Stores

### 2.1 `usePlayerStore`
The primary source of truth for character state and persistence.
*   **Stats**: HP, MP, XP, Level, Gold (Aetium).
*   **Inventory**: Array of categorized items with automatic stacking logic.
*   **Progression**: Quest tracker, tutorial step state, and discovered zone profiles.

### 2.2 `useCombatStore`
Manages active turn-based encounters.
*   **Live Metrics**: Tracks total damage dealt and received during a battle.
*   **Summary State**: Controls the post-battle results overlay, recording loot and XP before returning to the overworld.

### 2.3 `useDungeonStore`
Manages instanced roguelite runs.
*   **Run Tracking**: Persists statistics across all 10 stages, including enemies killed, caches looted, and altars activated.
*   **Instance Summary**: Triggers a comprehensive "Dungeon Cleared" console upon completion, providing a total run breakdown.

### 2.4 `useUIStore`
Coordinates global UI state and cross-component actions.
*   **Dynamic State**: `heroTab` (active character screen), `isSaving` indicator, `activeWorldEvent`.
*   **Map Control**: `pendingMapAction` allows components (like Quests or Scanner) to request smooth panning/zooming to specific coordinates.

## 3. RPG Systems

### 3.1 Geospatial Intelligence
*   **BoundaryService**: Loads high-fidelity GeoJSON polygons for precise, offline-capable location detection. Includes centroid calculation for zone-centered labeling.
*   **Visual Layering (z-index)**: Implements a strict rendering hierarchy:
    *   **Z-Index 999**: Status indicator buttons (In Battle/Dungeon).
    *   **Z-Index 50**: Traveller (Player) Marker.
    *   **Z-Index 2**: Instability Fog (Level 10 restriction).
    *   **Z-Index 1**: Suburb Boundary Highlight (Biome-tinted).
*   **WikipediaService**: Fetches real-world historical/industrial summaries for zone synthesis.
*   **ZoneSynthesizer**: An "AI" layer that generates Factions, Difficulty, and Unique NPCs based on locality context.

### 3.2 Tactical Map & Discovery
*   **"Near Me" Scanner**: Replaces manual scan buttons. A unified tab that identifies all hostile signals, settlements, and dungeons within 20km. Features "Locate" actions that auto-pan the map to POIs.
*   **Active Zone Highlight**: The current suburb is rendered with a biome-tinted overlay using high-fidelity OSM polygons.
*   **Item Stacking**: Identical items are automatically stacked with multipliers (e.g., x2) to conserve space.
*   **Dungeon System**: Instanced, 10-stage challenges.
    *   **Choice Logic**: Branching paths (Enemies, Chests, Altars).
    *   **Modifier Feedback**: "Resonance Result" popups provide immediate feedback on altar buffs/debuffs.
*   **Settlement System**: Persistent safe-zones (e.g., Altona Gate) with rest facilities and marketplaces.
*   **Marketplace Enhancements**:
    *   **Purchase Verification**: Detailed confirmation modal with side-by-side equipment stat comparison.
    *   **Ownership Indicators**: Displays "Owned: X" on market items to prevent redundant purchases.
    *   **Post-Trade Sync**: "Equip Now" prompt allows immediate synchronization of purchased gear.

### 3.3 Combat & Feedback
*   **Battle Summary**: Automated post-defeat screen displaying total damage dealt/received and specific loot recovered from the static.
*   **Dungeon Summary**: Multi-page results screen celebrating run-wide accomplishments (Altars, Kills, Total Loot).
*   **Feedback Cleanup**: Removed redundant global notifications for loot/gold in favor of high-impact summary screens.
*   **UI Layout**: 
    *   **Status Bar**: Streamlined 20% height reduction for a more compact, tactical feel.
    *   **Contextual Buttons**: Mutually exclusive "In Battle", "In Dungeon", and "In Settlement" buttons in the header provide clear navigation shortcuts.

### 3.4 Tutorial & Narrative Flow
*   **Proximity-Gated Narrative**: Critical story beats utilize precise coordinate-based triggers and quest-completion checks.
*   **Automated Navigation**: "Lead the way" tutorial choices automatically pan and zoom the map to destination sectors (e.g., Altona Gate).
*   **Travel Objectives**: Explicit "Follow" steps ensure players must physically reach targets before narrative progression.

## 4. Platform & Web Compatibility
*   **ESM Support**: Configured for modern ESM libraries like Zustand v5 on web.
*   **Bundler Fixes**: Optimized for Metro's package exports and React 19 compatibility.

## 5. Completed Milestones
- [x] Initial Expo + NativeWind scaffolding.
- [x] Web-based geocoding (GeoService) with procedural fallback.
- [x] Home City Sanctuary system with Rest mechanic.
- [x] Animated Battle Arena with Enemy AI and Stat Scaling.
- [x] Global Sound System (Ambient & Battle tracks).
- [x] **Cinematic Title Screen and Entry Flow.**
- [x] **Tutorial Narrative System with persistent state and world markers.**
- [x] **"Near Me" Unified Scanner (consolidated POI detection).**
- [x] **Battle & Dungeon Summary systems with run-wide tracking.**
- [x] **Marketplace Verification with Live Stat Comparison & Ownership tracking.**
- [x] **Dungeon Altar "Resonance Result" popups.**
- [x] **Automated "Lead the Way" map navigation logic.**
- [x] **GeoJSON Boundary centroid calculation for future labeling.**
- [x] **Status Bar Height Optimization (20% reduction).**
