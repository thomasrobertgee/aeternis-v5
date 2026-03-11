# Aeternis: Odyssey - Technical Architecture

This document outlines the current technical architecture and implementation status of the Aeternis: Odyssey mobile prototype.

## 1. Tech Stack
*   **Framework**: Expo SDK 54 (React Native)
*   **Language**: TypeScript
*   **AI Engine**: Google Gemini API (`gemini-flash-latest`) via `@google/generative-ai` SDK.
*   **State Management**: Zustand (Global stores for Player, Combat, Dungeon, and Travel)
*   **Persistence**: Zustand Persist + Async Storage
*   **Animations**: React Native Reanimated (Springs, Sequences, Layout Transitions)
*   **Styling**: NativeWind v4 (Tailwind CSS) with inline style fallback for high-risk props.
*   **Location Services**: 
    *   **Geocoding**: OpenStreetMap (OSM) Nominatim API.
    *   **Boundaries**: Hybrid system using local GeoJSON (Melbourne) and dynamic GeoJSON fetching from Nominatim for global support.
*   **Maps**: React Native Maps (Fantasy-Dark Styling + Polygon Overlays)

## 2. Core Stores

### 2.1 `usePlayerStore`
The primary source of truth for character state and persistence.
*   **Stats**: HP, MP, XP, Level, Gold (Aetium).
*   **ActiveZoneContext**: Stores the procedurally generated lore, NPCs, and enemies for the current location.
*   **TutorialCoords**: Dynamically calculated coordinates for tutorial objectives (Orb, Dungeon, Settlement) based on the player's chosen starting location.
*   **Progression**: Quest tracker, tutorial step state, and discovered zone profiles.

### 2.2 `useCombatStore`
Manages active turn-based encounters.
*   **Live Metrics**: Tracks total damage dealt and received.
*   **Summary State**: Post-battle results overlay, recording loot and XP.

### 2.3 `useDungeonStore`
Manages instanced roguelite runs.
*   **Run Tracking**: Persists statistics across 10 stages.
*   **Instance Summary**: Comprehensive "Dungeon Cleared" summary.

## 3. RPG Systems

### 3.1 Procedural World Generation
*   **Wikipedia Synthesis**: Uses `WikipediaService` to fetch real-world historical/industrial context.
*   **Imaginum API**: A specialized backend route (`/api/zone/generate`) that leverages Gemini AI to "corrupt" real-world data into dark fantasy biomes, settlements, and enemies.
*   **Starting Location Selection**: A pre-tutorial map interface allowing players to search for or tap any real-world location to begin their journey.

### 3.2 Geospatial Intelligence
*   **BoundaryService**: Local GeoJSON detection for high-fidelity Melbourne suburbs.
*   **Dynamic Boundaries**: Automatically fetches GeoJSON from Nominatim when a player enters a zone not covered by local data, applying a blue boundary border to the map.
*   **Visual Layering (z-index)**:
    *   **Z-Index 10000**: Tutorial Overlays.
    *   **Z-Index 110**: Tactical Map Info Bar.
    *   **Z-Index 50-70**: Map Markers (Player, Orb, Dungeons, Settlements).

### 3.3 Tactical Map & Discovery
*   **Map Info Bar**: Live tactical overlay with clock, location, and dynamic weather.
*   **Active Zone Highlight**: Blue-tinted polygon overlays for the player's home city and currently occupied zones.
*   **Dungeon & Settlement Markers**: Now dynamically named and described based on the `ActiveZoneContext`.

### 3.4 Tutorial & Narrative Flow
*   **Adaptive Coordinates**: Tutorial objectives (The Orb, Miller's Junction, Altona Gate) are no longer hardcoded to Altona North but are placed relative to the player's chosen starting coordinates.
*   **Interaction-Gated Progression**: Specific steps (21, 32, 41) hide the tutorial overlay to force map or dungeon interaction before the narrative continues.

## 4. Completed Milestones
- [x] **Starting Location Selection with dynamic search.**
- [x] **Wikipedia-driven procedural zone synthesis.**
- [x] **Dynamic Tutorial Placement (relocates objectives based on start point).**
- [x] **Dynamic GeoJSON sourcing for global boundaries.**
- [x] **Gemini API Integration (gemini-flash-latest).**
- [x] **Tutorial Transition & Logic Overhaul.**
- [x] Navigation Context Stabilization & NativeWind Refactor.
