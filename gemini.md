# Aeternis: Odyssey - Project Manifest

Welcome to the **Aeternis: Odyssey** repository. This document serves as the primary source of truth for the project's architecture, systems, and development status.

## 1. Project Mandates
*   **Documentation Synchronization**: Whenever a commit and push to GitHub is requested, all project documentation (including `ARCHITECTURE.md`, `changelog.md`, and `TUTORIAL_FLOW.md`) MUST be reviewed and updated to reflect the latest changes, bug fixes, and architectural shifts.

## 2. Technical Stack
*   **Framework**: Expo SDK 54 (React Native).
*   **AI Layer**: Google Gemini API (`gemini-flash-latest`) via `@google/generative-ai`.
*   **State Management**: Zustand (Global stores for Player, Combat, Travel, and UI).
*   **Maps**: React Native Maps with custom "Fracture" aesthetic and dynamic GeoJSON boundary sourcing via Nominatim.

## 3. Core Systems & Architecture

### 3.1 Procedural Synthesis
*   **`WikipediaService.ts`**: Fetches real-world context for zone generation.
*   **`StartingLocationSelection.tsx`**: Dynamic entry point allowing global starting positions.
*   **`ZoneSynthesizer.ts`**: AI-driven layer converting real-world history into game lore.

### 3.2 Adaptive Tutorial
*   **Dynamic Placement**: Objectives (Orb, Dungeon, Settlement) are calculated relative to the player's chosen start location.
*   **Interaction Control**: Overlay gating ensures players interact with the map/combat at key narrative junctures.

## 4. Current Milestones & Roadmap
- [x] Initial React Native/Expo Scaffolding.
- [x] Geospatial Boundary detection (Local + Dynamic GeoJSON).
- [x] Wikipedia-driven Zone Synthesis.
- [x] **Starting Location Selection with global support.**
- [x] Turn-based Combat Engine with AI turns.
- [x] **Adaptive Tutorial Narrative (Relative coordinate placement).**
- [x] Instanced Dungeon & Settlement systems.
- [x] Web/ESM Compatibility fixes.
- [x] **Gemini API Stable Integration (gemini-flash-latest).**

### Immediate Next Steps
1.  Implement specialized "Boss" mechanics for Rift events.
2.  Expand the Settlement Bulletin Board with more dynamic, procedurally generated contracts.
3.  Add "Set Bonuses" for higher-tier gear (e.g., full Plasteel set).
4.  Implement visual "Instability Fog" for Level-gated high-level zones.

## 5. Known Issues
*   Map markers for hostile signals may jitter slightly during high-speed travel transitions.

---
*Last Updated: March 10, 2026 (Dynamic World Sync)*
