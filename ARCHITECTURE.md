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
*   **Settings**: Global player preferences (Music toggle, Temperature units).

### 2.2 `useCombatStore`
Manages active turn-based encounters.
*   **Live Metrics**: Tracks total damage dealt and received during a battle.
*   **Summary State**: Post-battle results overlay, recording loot and XP.

### 2.3 `useDungeonStore`
Manages instanced roguelite runs.
*   **Run Tracking**: Persists statistics (Kills, Damage, Altars, Loot) across 10 stages.
*   **Instance Summary**: Comprehensive "Dungeon Cleared" console upon completion.

### 2.4 `useUIStore`
Coordinates global UI state and cross-component actions.
*   **Map Control**: `pendingMapAction` for programmatic panning/zooming.

## 3. RPG Systems

### 3.1 Geospatial Intelligence
*   **BoundaryService**: High-fidelity GeoJSON detection with centroid calculation for future sector labeling.
*   **Visual Layering (z-index)**:
    *   **Z-Index 999**: Combat/Dungeon status buttons.
    *   **Z-Index 110**: Map Info Bar (Tactical Overlay).
    *   **Z-Index 50**: Player Marker.
    *   **Z-Index 10**: Floating Quest HUD.

### 3.2 Tactical Map & Discovery
*   **Map Info Bar**: Transparent tactical overlay with live clock (seconds), geographic location, and real-world weather conditions (Sunny, Rain, etc.).
*   **Minimalist Quest HUD**: Right-aligned, fully transparent floating cards for active objectives. Features compact progress bars and removes redundant iconography.
*   **"Near Me" Scanner**: Unified POI detection (Hostiles, Settlements, Dungeons) within 20km.
*   **Active Zone Highlight**: Biome-tinted polygon overlays.
*   **Dungeon System**: 10-stage challenges with branching paths and "Resonance Result" feedback.
*   **Settlement System**: Persistent safe-zones (e.g., Altona Gate).
*   **Marketplace Enhancements**:
    *   **Verification**: Purchase confirmation with gear stat comparison.
    *   **Ownership**: "Owned: X" badges on items.
    *   **Instant Sync**: "Equip Now" post-purchase feature.

### 3.3 Combat & Feedback
*   **Summaries**: Automated post-defeat/completion screens for both Battles and Dungeons.
*   **UI Optimization**:
    *   **Status Bar**: Reduced height for optimized screen real estate.
    *   **Recenter Control**: Ergonomic bottom-right positioning.

### 3.4 Tutorial & Narrative Flow
*   **Automated Navigation**: "Lead the way" tutorial choices automatically pan the map.
*   **Proximity Logic**: Narrative resumption based on coordinate arrival and quest state.

## 4. Completed Milestones
- [x] Initial Expo + NativeWind scaffolding.
- [x] Home City Sanctuary system with Rest mechanic.
- [x] **Tutorial Narrative System with world markers.**
- [x] **"Near Me" Unified Scanner.**
- [x] **Battle & Dungeon Summary systems.**
- [x] **Marketplace Stat Comparison & Ownership tracking.**
- [x] **Map Info Bar (Live Time, Weather, and Location).**
- [x] **Minimalist Quest HUD (Transparent, Right-aligned).**
- [x] **UI Layout Optimization (Status bar height & Recenter button).**
