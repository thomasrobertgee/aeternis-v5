# Aeternis: Odyssey - Project Manifest

Welcome to the **Aeternis: Odyssey** repository. This document serves as the primary source of truth for the project's architecture, systems, and development status.

## 1. Game Overview
**Aeternis: Odyssey** is a location-based MMORPG built for mobile (iOS/Android) and Web. It leverages real-world geography to create a dynamic, reactive world shaped by the **Imaginum**—a cosmic essence that alters reality based on collective belief.

*   **Genre**: Location-Based RPG / MMORPG.
*   **Platform**: Mobile-first (Expo/React Native) with Web compatibility.
*   **Core Loop**: Exploration (Real-world movement/Geocoding) -> Discovery (Zone Synthesis/Lore) -> Combat (Turn-based AI) -> Progression (Skill/Gear Acquisition).
*   **Visual Style**: High-contrast "Fracture" aesthetic (Cyan/Purple/Zinc) with fantasy-dark map styling.

## 2. Technical Stack
The project has transitioned from a Unity prototype to a modern, high-performance web-tech stack:
*   **Framework**: Expo SDK 54 (React Native).
*   **Language**: TypeScript.
*   **State Management**: Zustand (Global stores for Player, Combat, Travel, and UI).
*   **Persistence**: Zustand Persist + Async Storage.
*   **Animations**: React Native Reanimated (Shared values, Layout transitions).
*   **Styling**: NativeWind v4 (Tailwind CSS for React Native).
*   **Maps**: React Native Maps (Google Maps Provider) with custom styling and GeoJSON boundary overlays.
*   **Audio/Haptics**: Expo AV and Expo Haptics for tactile/auditory immersion.

## 3. Core Systems & Architecture

### 3.1 State Management (Zustand Stores)
*   **`usePlayerStore.ts`**: The central source of truth. Manages player stats (HP/MP/XP/Gold), inventory, equipped gear, learned skills, discovered zones, and tutorial progress.
*   **`useCombatStore.ts`**: Manages the turn-based combat engine, including AI turn cycles, damage calculations, and battle logs.
*   **`useTravelStore.ts`**: Handles the "Aether-Link" (Fast Travel) system, managing timed transit between discovered sectors.
*   **`useUIStore.ts`**: Coordinates global UI states like notifications, active world events, and map-centering actions.

### 3.2 Geospatial & Procedural Logic
*   **`BoundaryService.ts`**: Utilizes local GeoJSON data (e.g., Melbourne suburbs) for precise, offline-capable zone detection.
*   **`GeoService.ts`**: Interface for Nominatim (OSM) Reverse Geocoding and coordinate-to-address translation.
*   **`WikipediaService.ts`**: Fetches real-world historical/industrial data to provide raw context for zone generation.
*   **`ZoneSynthesizer.ts`**: The "AI" layer. Analyzes Wikipedia context to deterministically generate:
    *   **Dominant Faction**: Based on industry (Iron Consortium) or nature (Sylvan Conclave).
    *   **Difficulty/Loot**: Based on the historical age and landmark density of the suburb.
    *   **Unique NPCs**: Generates persistent sector contacts (e.g., "Mayor Miller" in Altona North).
*   **`ProceduralEngine.ts`**: Generates atmospheric descriptions and lore names (e.g., "Silicon Spires") based on biome categories (Urban, Industrial, Coastal).

### 3.3 Gameplay Modules
*   **Combat Engine**: Automated turn cycle with manual skill triggers. Features critical hits (15% chance), evasion, and dynamic stat scaling based on enemy level/biome.
*   **Dungeon System**: Instanced roguelite challenges (10-stage) featuring randomized encounters, chest drops, and temporary "Altar" modifiers.
*   **Settlement System**: Safe-zone sanctuaries (e.g., Altona Gate) providing quest boards, NPC dialogues, marketplaces, and full-rest facilities.
*   **Inventory System**: Categorized (Weapon, Armor, Utility) storage with automatic item stacking and detailed stat breakdown popups.

## 4. Narrative & Tutorial
The game features a comprehensive 60+ step tutorial that introduces players to the "Fracture":
1.  **Awakening**: Introduction to basic movement and the "Glowing Orb" (Imaginum).
2.  **HUD Discovery**: Unlocking player stats and the Hero Tab.
3.  **First Blood**: Combat tutorial against mutated manifestations.
4.  **The Quest**: Introduction to the Quest Tracker and basic culling objectives.
5.  **The Depths**: Mandatory dungeon clear (Miller's Junction) to introduce instanced gameplay.
6.  **Jeff & Settlement**: Lore dump and introduction to communal safe-zones at Altona Gate.

## 5. Directory Structure
*   **`app/`**: Expo Router entry points and tab navigation.
*   **`components/`**: Modular UI elements (Map overlays, Dialogue views, Narrative cards).
*   **`utils/`**: Core logic (Zustand stores, Geocoding, Math, Procedural generators).
*   **`assets/`**: Static data (GeoJSON boundaries, Dialogue JSONs, Sound effects).

## 6. Current Milestones & Roadmap
- [x] Initial React Native/Expo Scaffolding.
- [x] Geospatial Boundary detection (GeoJSON).
- [x] Wikipedia-driven Zone Synthesis.
- [x] Turn-based Combat Engine with AI turns.
- [x] Full Tutorial Narrative (Steps 0-63).
- [x] Instanced Dungeon & Settlement systems.
- [x] Web/ESM Compatibility fixes.
- [x] Navigation Context Stabilization & NativeWind Refactor.
- [x] Tutorial Flow fixes (Button flashing, Step 58 map panning).

### Immediate Next Steps
1.  Implement specialized "Boss" mechanics for Rift events.
2.  Expand the Settlement Bulletin Board with more dynamic, procedurally generated contracts.
3.  Add "Set Bonuses" for higher-tier gear (e.g., full Plasteel set).
4.  Implement visual "Instability Fog" for Level-gated high-level zones.

## 7. Known Issues
*   Map markers for hostile signals may jitter slightly during high-speed travel transitions.

---
*Last Updated: March 6, 2026*
