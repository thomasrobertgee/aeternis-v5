# Aeternis: Odyssey - Project Changelog

This document provides a chronological history of requests, features, and bug fixes for the **Aeternis: Odyssey** project. It is intended as a reference for future developers and AI agents to understand the project's evolution and architectural decisions.

---

## [March 6, 2026] - Stability & UX Refactor

### **Requests & Issues**
1. **Dungeon Boss Navigation Bug**: "Encountering the navigation error when defeating the dungeon boss and moving from the battle summary screen to the dungeon summary screen."
2. **Continue Button Frozen**: "Last update broke the continue button on the battle summary page."
3. **Tutorial Button Flash**: "In tutorial text sequences, after clicking a text option, there is a brief flash of the upcoming button text before the typing finishes."
4. **Step 58 Map Locking**: "At step 58 the map is not panning and zooming to lock onto the settlement at Altona Gate."
5. **NativeWind Navigation Context Error**: Investigated "Couldn't find a navigation context" errors linked to NativeWind v4 runtime interop.
6. **Battle Speed**: "Reduce the time of turns in battle by half."
7. **Settlement Visibility**: "Settlement icon sometimes does not appear on the map."

### **Implementation & Fixes**
*   **Navigation Standardization**: Updated all `router.replace` and `router.push` calls to use absolute paths (e.g., `/(tabs)/explore`).
    *   *Result*: Resolved "route not found" errors during complex tab-to-tab state transitions.
*   **NativeWind to Inline Style Refactor**: Replaced high-risk NativeWind classes (shadows, opacity shorthands, complex gradients) with standard React Native `style` props in persistent layout components (`PlayerHeader`, `TutorialView`, `ZoneCard`).
    *   *Why*: NativeWind v4 sometimes triggers a race condition during CSS-to-Native conversion that strips the React Navigation context from the component tree. Standard styles are safer for overlays and headers.
*   **Interaction Guards**: Added `isActionProcessing` state to combat and dungeon buttons.
    *   *What Worked*: Prevents multiple rapid clicks from triggering double-navigation or store-reset crashes.
*   **Typing State Sync**: Updated `TutorialView` to clear displayed text and set `isTyping = true` *immediately* upon choice selection.
    *   *Result*: Eliminated the "button flash" by ensuring UI elements remain hidden until the new narrative segment starts.
*   **Combat Pacing**: Halved almost all combat-related `setTimeout` durations (Enemy AI: 1500ms -> 750ms; Resolve: 2000ms -> 1000ms).
*   **Map Logic Cleanup**: Consolidated map zoom logic. Blocked automatic "Recenter on Player" logic during tutorial steps 40 and 58 to allow the scripted pans to finish uninterrupted.
*   **New Project Mandate**: Established a core rule in `gemini.md` requiring all documentation to be synchronized and updated automatically whenever a push to GitHub is requested.
*   **Final Tutorial Loop Fix**: Resolved a critical bug where the final tutorial step would loop indefinitely. Added `isTutorialComplete` synchronization to `ExploreScreen` effects and `TutorialView` render guards.

---

## [February 27 - March 2, 2026] - Map & UI Ergonomics

### **Features**
*   **Map Info Bar**: Implemented a top-aligned bar with a live clock, dynamic weather detection based on suburb, and temperature unit switching (C/F).
*   **Minimalist Quest HUD**: Refactored the quest tracker into a right-aligned, transparent layout to maximize map visibility.
*   **Grounded Weather**: Linked weather states to player location using the `WorldStateManager`.

### **Technical Shifts**
*   **Z-Index Layering**: Optimized map marker layering (Player: 50, Orb: 60, Dungeons: 70, Enemies: 20).
*   **Expo Updates Compatibility**: Added fallback reload logic using `Updates.reloadAsync()` for standalone builds while keeping `DevSettings.reload()` for fast iteration.

---

## [February 20 - February 26, 2026] - Dungeon System & NPC Implementation

### **Features**
*   **Dungeon System (Roguelite)**: Created a 10-stage instanced system with randomized encounters, chest drops, and "Altars" that provide temporary stat modifiers.
*   **Jeff NPC & Altona Gate**: Introduced the first persistent NPC ("Jeff") and the concept of "Otherworlders" to the lore.
*   **Aetium Economy**: Set all marketplace prices to 1 Aetium to simplify early-game balancing and testing.

### **Bug Fixes**
*   **Combat Item Usage**: Fixed a bug where potions used during combat wouldn't correctly sync back to the main `usePlayerStore`.
*   **Inventory Stacking**: Implemented automatic stacking for utility items (e.g., "Focus Potion x3") to prevent UI clutter.

---

## [February 14 - February 19, 2026] - Interactive Tutorial & Web Support

### **Features**
*   **Tutorial Narrative (Steps 0-63)**: Implemented the full awakening sequence, weapon selection (Stick/Door/Rocks), and the first combat tutorial.
*   **Web Compatibility**: Isolated `react-native-maps` into `.web.tsx` variants to allow the project to bundle for browsers without crashing on the missing Google Maps dependency.

---

## [Early February 2026] - Project Foundation

### **Core Systems**
*   **Procedural Engine**: Created `ZoneSynthesizer.ts` to convert Wikipedia summary text into game biomes and factions.
*   **Geospatial Boundaries**: Integrated a 12MB Melbourne Suburbs GeoJSON for precise, offline-capable zone detection.
*   **Combat Engine**: Built the initial turn-based state machine in `useCombatStore.ts`.
*   **Zustand Architecture**: Established the multi-store pattern (Player, Combat, Travel, UI) with persistent storage.

---

## **Referece for Future AI Agents**

*   **Styling**: Use NativeWind for layout and colors, but **ALWAYS** use inline styles for `shadowColor`, `shadowOpacity`, and any component that might be rendered in the `app/(tabs)/_layout.tsx` or as a `Modal`.
*   **Navigation**: Use absolute paths (`/(tabs)/...`). Expo Router can be inconsistent with relative paths when jumping between different tab stacks.
*   **State**: The `usePlayerStore` is the primary source of truth. The `useCombatStore` is transient—ensure `setGlobalStats` is called at the end of a battle to sync HP/XP back to the player.
*   **Tutorial**: The tutorial flow is highly dependent on `currentStep`. If adding a new feature, check if it needs to be gated by `isTutorialComplete`.
