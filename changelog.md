# Aeternis: Odyssey - Project Changelog

This document provides a chronological history of requests, features, and bug fixes for the **Aeternis: Odyssey** project.

---

## [Current Open Bugs]
*   *(No active bugs reported)*

---

## [Resolution History]
*   **Tutorial Interaction Loop (Steps 21, 31, 32)** (Resolved March 11, 2026):
    *   *Bug*: Tutorial overlay would re-open immediately after being hidden for map interaction because those steps were included in the `explore.tsx` auto-resume `checkpoints`. Additionally, some steps were redundant or skipped narrative blocks.
    *   *Fix*:
        1.  Modified `TutorialView.tsx` to set `isTutorialActive: false` immediately upon weapon selection (Step 20) and quest acceptance (Step 31).
        2.  Updated `explore.tsx` to remove Steps 21, 31, and 32 from the auto-resume `checkpoints`, preventing the loop.
        3.  Updated `explore.tsx` to trigger enemy spawning at Steps 21 and 31.
        4.  Updated `battle.tsx` to correctly target Step 22 after the first dog and Step 33 after the pack, ensuring the exhaustion narrative is shown before proceeding.
        5.  Cleared redundant text in Step 32 ("Really? Five more dogs?") as Step 31 already establishes the encounter.

---

## [March 10, 2026] - Dynamic World & Starting Selection

### **Features**
*   **Starting Location Selection**: Implemented a dedicated screen for new players to search for or tap a real-world starting point.
    *   *System Integration*: Automatically triggers the `/api/zone/generate` route to build the world context before the tutorial begins.
*   **Dynamic GeoJSON Sourcing**: Updated `GeoService.ts` to request real-world boundary data from Nominatim on-demand.
    *   *Result*: Any suburb in the world can now display its blue boundary border, even if not present in the local Melbourne GeoJSON file.
*   **Adaptive Tutorial**: Refactored the entire tutorial system to be coordinate-agnostic.
    *   *Mechanism*: The "Glowing Orb", "Dungeon Entrance", and "Settlement" are now placed relative to the player's chosen start point rather than hardcoded coordinates.
*   **Dynamic Wikipedia Synthesis**: Improved the Wikipedia fetching logic to use specific search queries (e.g., "Suburb, State") with automatic fallback to broader searches to maximize AI context quality.
*   **Gemini API Migration**: Updated the project to use the official `@google/generative-ai` SDK and the `gemini-flash-latest` model for improved stability and latency.

### **Bug Fixes**
*   **Tutorial Interaction Skipping**: Fixed a bug in `TutorialView.tsx` where combat steps (21, 32) would skip to the next narrative block instead of hiding the overlay for map interaction.
*   **Blank Tutorial Box**: Resolved an indexing issue where the `handleChoice` logic would fail to increment the step correctly when both `updates` and `nextStep` were provided.
*   **Settlement Visibility**: Fixed a bug where the settlement marker would appear on the map at Step 6; it is now correctly gated until Step 56.
*   **API Routing Error**: Updated `app.json` to enable Expo Router server output, resolving `JSON Parse` errors caused by hitting HTML fallbacks instead of API routes.
*   **Marker Naming**: Fixed a bug where tutorial markers used hardcoded names (e.g., "Altona Gate") instead of the procedurally generated names from the `ActiveZoneContext`.

---

## [March 6, 2026] - Stability & UX Refactor

### **Implementation & Fixes**
*   **Navigation Standardization**: Updated all `router` calls to use absolute paths.
*   **NativeWind to Inline Style Refactor**: Replaced high-risk classes with `style` props to prevent navigation context race conditions.
*   **Interaction Guards**: Added `isActionProcessing` state to combat/dungeon buttons.
*   **Typing State Sync**: Updated `TutorialView` to clear text immediately upon selection.
*   **Combat Pacing**: Halved turn durations for faster gameplay.
*   **Map Logic Cleanup**: Blocked "Recenter" logic during scripted tutorial pans.

---

## [February 2026] - Foundation & Systems

### **Core Systems**
*   **Procedural Engine**: Created `ZoneSynthesizer.ts`.
*   **Dungeon System**: 10-stage instanced roguelite system.
*   **Geospatial Boundaries**: Initial local Melbourne GeoJSON integration.
*   **Combat Engine**: Initial turn-based state machine.
