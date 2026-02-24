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

### 2.4 `useUIStore`
Coordinates global UI state and cross-component actions.
*   **Dynamic State**: `heroTab` (active character screen), `isSaving` indicator, `activeWorldEvent`.
*   **Map Control**: `pendingMapAction` allows components (like Quests) to request smooth panning/zooming to specific coordinates.

## 3. RPG Systems

### 3.1 Geospatial Intelligence
*   **BoundaryService**: Loads high-fidelity GeoJSON polygons (sourced from official OSM administrative data) for precise, offline-capable location detection.
*   **Visual Layering (z-index)**: Implements a strict rendering hierarchy to ensure UI clarity:
    *   **Z-Index 10**: Traveller (Player) Marker.
    *   **Z-Index 2**: Instability Fog (Level 10 restriction).
    *   **Z-Index 1**: Suburb Boundary Highlight (Biome-tinted).
*   **WikipediaService**: Fetches real-world historical and industrial summaries for the current suburb via MediaWiki API.
*   **ZoneSynthesizer**: An "AI" layer that analyzes Wikipedia text to deterministically generate:
    *   **Dominant Faction**: Based on industry/nature keywords.
    *   **Difficulty/Resonance**: Based on the historical age of the locality.
    *   **Unique NPC**: Generates a persistent "Sector Contact" with a lore-accurate name and title.
*   **Instability Fog**: Visually restricts players under Level 10 to their Home City polygon using inverted `Polygon` holes.
*   **Smart Navigation**: "Take me there" buttons in the Quest Log and Character screen utilize the `pendingMapAction` system to center/zoom the map on objectives.

### 3.2 Tactical Map & Combat
*   **Player Representation**: Represented by a **50m radius Circle** and a high-z-index **Traveller Marker**, ensuring visibility over all terrain layers.
*   **Active Zone Highlight**: The current suburb is rendered with a **Light Grey** overlay (`rgba(212, 212, 216, 0.25)`) using high-fidelity OSM polygons.
*   **Hostile Signal Manifestation**: Enemies appear as scaling red markers within the zone. Spawning is restricted to the interior of the current polygon via **Rejection Sampling**.
*   **Manual Radar**: "Scan Area" action generates new manifestations around the player's current location.
*   **Item Stacking**: Identical items (by name and category) are automatically stacked in the inventory, displaying a multiplier (e.g., x2) to conserve screen space and improve legibility.
*   **Dungeon System**: Instanced, 10-stage roguelite challenges featuring randomized choices (Enemies, Chests, Altars), fixed miniboss/boss encounters, and temporary stat modifiers that persist only within the instance. 
    *   **Modifier Feedback**: Active buffs/debuffs are clickable, opening a detail popup explaining the exact stat impact.
*   **Settlement System**: Persistent safe-zones (e.g., Altona Gate) featuring interactive NPCs, localized marketplaces for refined supplies, bulletin boards for extra-curricular contracts, and Lodges for full stat restoration.
*   **Combat Loop**: Automated AI turn cycle with visual feedback and **Critical Hit** logic (15% chance for 1.75x damage).
*   **Haptic Feedback**: Heavy impact haptics on critical hits; success notifications on quest turn-ins.
*   **Sound System**: `SoundService` manages low-drone ambient world music and high-tension battle tracks.
*   **UI Layout**:
    *   **Safe Zone Banner**: Positioned at the bottom (`bottom: 100`) for clear visibility.
    *   **Recenter Control**: Floating button in the bottom-right corner.
    *   **Quest Tracker**: Interactive side-panel at `top: 40%` with a detailed modal view and navigation shortcuts.

### 3.3 Dynamic World
*   **ZoneEventManager**: Periodically triggers biome-specific events (e.g., **Industrial Steam Leak**) that modify combat difficulty and loot drops (Double Scrap).
*   **Biome-Specific Loot**: Adds locality-accurate items (e.g., **Sunken Relics** in Coastal zones) to the drop pool.

### 3.4 Combat Integrity
*   **Action Locking**: Implements an `isActionProcessing` state to debounce player inputs. This prevents rapid multi-click exploits, ensuring the turn-based logic remains synchronized with animations.

### 3.5 Tutorial & Narrative Flow
*   **Zero-Start Experience**: Players begin with 0 Aetium, no equipment, and minimal Vitality/Imaginum to emphasize progression from "nothing."
*   **Initial Narrative Overlay**: The `TutorialView` provides a high-z-index (`z-[10000]`) narrative overlay that guides the player through their first moments in the Fracture.
*   **Dynamic Choice Engine**: Player decisions (e.g., choosing a makeshift weapon) are recorded in a `choicesLog` and immediately impact gameplay by granting specific items and learning corresponding skills (e.g., **Shield Bash**).
*   **Progressive Feature Unlocking**:
    *   **Hero Tab**: Unlocks at step 18/19 (HUD discovery).
    *   **Bag Tab**: Unlocks at step 24 (After first combat).
    *   **Battle/Market Tabs**: Unlocked only after completing the tutorial (Step 60).
    *   **Map Controls**: Recenter is always available; Scanning/Rifts unlock after the tutorial.
*   **State Persistence**: `tutorialProgress` is stored in the `usePlayerStore` and persisted via `AsyncStorage`, maintaining the narrative position across sessions.
*   **Interactive World Gates**: Physical manifestations (`tutorialMarker`, `tutorial-dog-signal`, `MILLERS_JUNCTION_DEPTHS`) act as mandatory interaction points to progress the story.
*   **Predictive Spawning**: Tutorial enemies (e.g., the mutated dog) spawn as soon as their narrative introduction is reached, appearing behind the dialogue overlay for immersion.
*   **Proximity-Gated Narrative**: Critical story beats (e.g., meeting Jeff post-dungeon) utilize precise coordinate-based triggers and quest-completion checks to ensure a coherent linear experience.
*   **Settlement Discovery**: Players are introduced to communal safe-zones through narrative guidance, with the map automatically zooming to the destination (Altona Gate) during the final sequence.
*   **Character Identity**: Integrates a name-selection interface within the tutorial flow, persisting the identity across the HUD and status screens.
*   **Dynamic Map Restrictions**: Level-gated "Fog of War" and interaction locks are dynamically disabled during active tutorial steps to ensure a smooth onboarding experience.
*   **Pathname-Aware Visibility**: The narrative overlay is contextually restricted to the Map and Title screens, preventing interference with character management or inventory tasks.
*   **Combat Integration**:
    *   **Contextual Header**: "Back to Battle" button appears when navigating away from active combat.
    *   **Tutorial Loot**: Guaranteed Health/Mana potions and Aetium drops for tutorial encounters.
    *   **Weapon Rebalancing**: Initial makeshift weapons (e.g., Small Car Door) are categorized as Weapons with attack stats to ensure fair early-game combat.
*   **Cinematic Feedback**: 
    *   **Adaptive Typewriter**: Rhythmic text reveal with light haptic sync.
    *   **Transition Points**: Full-screen white flash transitions (`flashOpacity`) during high-resonance events (e.g., touching the orb).
    *   **Tactile UI**: All tutorial elements use `Pressable` with `scale-95` feedback for consistent responsiveness.
    *   **Inventory UX**: Categorized, large-card layout for Bag items with intuitive "Use/Equip" actions.

## 4. Platform & Web Compatibility
*   **ESM Support**: Configured Metro and Babel (`babel-plugin-transform-import-meta`) to support modern ESM libraries like Zustand v5 on web.
*   **Bundler Fixes**: Enabled `unstable_enablePackageExports` in Metro to handle conditional exports and package entry points.
*   **React Version Alignment**: Enforced strict version parity between `react`, `react-dom`, and `react-native-renderer` (19.1.0) to prevent runtime crashes on Expo Go.

## 5. Completed Milestones
- [x] Initial Expo + NativeWind scaffolding.
- [x] Web-based geocoding (GeoService) with procedural fallback.
- [x] Home City Sanctuary system with Rest mechanic.
- [x] Animated Battle Arena with Enemy AI and Stat Scaling.
- [x] Global Sound System (Ambient & Battle tracks).
- [x] Haptic Feedback integration (Combat & Quests).
- [x] **Cinematic Title Screen and Entry Flow.**
- [x] **Tutorial Narrative System with persistent state and world marker.**
- [x] **Dynamic Skill & Weapon acquisition logic.**
- [x] **Strict Tab Locking and Milestone-based UI Unlocking.**
- [x] **Enhanced Inventory UI and "Back to Battle" navigation.**
- [x] **GeoJSON Boundary detection (BoundaryService).**
- [x] **Wikipedia-driven Zone Synthesis & Lore generation.**
- [x] **Timed Fast Travel (Transit System) with technical log readout.**
- [x] **Sector-specific Unique NPC generation.**
- [x] **Dynamic Zone Events (Steam Leak) and Biome-specific loot.**
- [x] **Visual "Fog of War" restriction for Level-gated areas.**
- [x] **Exploit Prevention: Combat Action Locking.**
- [x] **Smart Navigation System ("Take me there").**
- [x] **Dungeon Altar Detail Popups.**
- [x] **ESM/Web Compatibility Layer.**
