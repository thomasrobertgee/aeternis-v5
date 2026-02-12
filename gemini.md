# Aeternis: Odyssey - Repository README

Welcome to the **Aeternis: Odyssey** game repository! This README provides a comprehensive overview of the project, its core systems, development status, future plans, and key design philosophies. It is structured to offer an AI assistant maximum context for understanding and contributing to the game's development.

## 1. Game Overview

**Aeternis: Odyssey** is a unique MMORPG designed for PC (with future mobile porting) where the world is dynamic, reactive, and shaped by player actions. Avoiding traditional class systems, XP levels, and visible skill trees, the game focuses on emergent progression. Players' in-game behaviors dynamically define their character's class and skills, fostering a deep sense of discovery and personal evolution. The world map is envisioned as an overlay of real-world geographical data, procedurally generated and persistently saved for all players upon discovery. The UI features a live, panning local map in the central view and a persistent, zoomable World Map in the right-hand panel that reveals itself as the player explores.

## 2. Core Vision & Philosophy

* **Genre**: MMORPG, developed PC-first with a mobile-first design.
* **Class System**: No chosen classes. Classes dynamically emerge and are assigned based on hidden behavioral scores (e.g., Courage, Curiosity, Violence). New, procedurally generated classes become public lore.
* **World Concept**: A fractured parallel Earth, leveraging real-world geography. Discovered zones are procedurally generated on the server and persist for all players.
* **Progression**: Level-free. Driven by skill acquisition, equipment tiers, reputation, and exploration. No traditional XP levels, visible skill trees, or public wikis.
* **Monetization**: Strictly "no pay-to-win," focusing on optional cosmetic enhancements or premium quality-of-life features.
* **UI/HUD**: Non-traditional HUD, conveying information via poetic system log entries and subtle UI.
* **Online-Only**: Requires a persistent internet connection for a synced shared world.

## 3. Deep Lore and Background Summary

The Alternate Timeline of **Aeternis: Odyssey** was created by the **Imaginum**, a cosmic essence that fundamentally alters reality based on collective belief. Initially unconscious, the Imaginum absorbed the concept of Artificial Intelligence during "The Collapse" (accelerated by the Internet), leading to a slow awakening.

* **Manifestation**: Imaginum subtly influenced reality for millennia, manifesting as unexplained phenomena. As human societies grew, shared beliefs gave rise to defined forms like nascent Dungeons, Shrines, and primitive Monsters.
* **Corruption**: Imaginum also manifests collective fears, leading to corruption, warped zones, and chaotic energy discharges from overload.
* **The Collapse & Towers**: The Internet caused a "Great Surge" of belief, leading to a catastrophic "Collapse" where landscapes twisted and monsters surged. This overload spontaneously manifested colossal Dungeon Towers as magical pressure valves, shaped by the collective subconscious of Normal Timeline players' fantasy tropes.
* **Player's Role**: Players are versions of themselves, "summoned" from the Normal Timeline due to their immunity to Imaginum's native influence, making them ideal agents to restore balance. Their UI (inventory, map, skills) is the Imaginum's intuitive interface, drawing on their familiarity with games. Progression is organic; skills are "discovered" as player adaptations, and classes "emerge" reflecting their impact on reality.
* **The Present**: A fractured world with isolated civilizations amidst corrupted zones. Native NPCs are pragmatic survivors, but rumors of "travellers" who can influence reality spread, leading to dynamic reactions from NPCs based on established reputations.
* **Imaginum's Evolution**: The Imaginum's awakening progresses from instinctive to mimetic (current state), then nascent sentience, proto-consciousness, and eventually emerging consciousness, where direct communication may become possible.
* **Past Interactions**: Pre-Collapse civilizations attempted to control Imaginum, leaving ruins, texts, and failed experiments. Factions now exploit, contain, worship, or pragmatically adapt to its presence.
* **Player Impact**: Player actions provide feedback to the Imaginum, subtly influencing future procedural generations of monsters, terrain, and events. The "world remembers," leading to persistent zone states, evolving NPC dialogue, environmental cues, and new lore fragments. The player's UI itself is a dynamic, evolving interface for the Imaginum's burgeoning intelligence.

## 4. File Descriptions & Key Functions

The project follows a modular structure within the `Assets/Scripts/` directory, with singletons coordinating discrete gameplay systems.

### Core Managers
* **`GameManager.cs`**: The central singleton. Its `InitializeGame()` coroutine queries the UXML file and hooks up all UI elements and controllers. Its `Update()` loop handles continuous player input. It coordinates most core game systems, UI panel visibility, and game state.
* **`SaveLoadManager.cs`**: Handles saving and loading game data to/from a JSON file (`aeternis_save.json`).
* **`TileManager.cs`**: A dedicated singleton for handling the asynchronous download and in-memory caching of visual map tiles from OpenStreetMap tile servers.

### World Simulation & Map
* **`WorldMapManager.cs`**: Manages the player's true position. It holds the `interactableLocations` list for the overworld and is now also responsible for managing the player's location state (`Overworld` vs. `Dungeon`). It generates and holds the map data for the current dungeon instance, including walls and interactables, in a separate `dungeonMap` dictionary. Its `MoveContinuously` method now contains separate logic for overworld (geo-based) and dungeon (grid-based) movement, including collision detection against walls.
* **`ZoneManager.cs`**: A singleton responsible for loading geographical zone data (e.g., from a GeoJSON file) and determining which named zone the player is currently in. It integrates with the `WikipediaScraper` to fetch biome data and records the discovered zone in the Codex.
* **`MapUIController.cs`**: Renders the **local visual map** in the center column. It is now capable of rendering two distinct map types: the standard OpenStreetMap tiles for the overworld, and a virtual "live map" for dungeons. It renders large, clear icons for all nearby interactables to aid in local exploration.
* **`WorldMapViewController.cs`**: Manages the **World Map** display in the right-hand panel. It reads the master list of explored tiles, converts their coordinates to a lower zoom level, and renders a pannable, zoomable map of the player's entire discovered area. It now also renders icons for all interactables across the discovered world, providing a strategic overview, and features an interactive hover preview that displays zone details (including live weather) and highlights the zone's boundaries.
* **`ProceduralContentGenerator.cs`**: A singleton that contains the 'AI' logic to interpret real-world data (biome keywords, population) and political data (ruling faction) to generate a unique content profile for each zone, which is then used to populate the world.
* **`WikipediaScraper.cs`**: A prototype service that performs a live web scrape of a zone's Wikipedia page. It gathers detailed data like population and keyword frequency, which is then used by the procedural generation AI.
* **`WorldLocation.cs`**: Represents a logical point of interest. It contains precise `latitude` and `longitude` properties for gameplay logic. It also contains state flags like `IsCleared` (for permanently used/defeated elements) and `HasBeenUsedForInteraction` (for temporary state, like preventing interaction loops).
* **`BiomeType.cs`**: Defines an enum for various biome types.
* **`BiomeContentProfile.cs`**: Defines the procedural content generation rules for a specific biome. It is generated dynamically by the AI based on real-world data.
* **`ZoneAnalysisData.cs`**: A data structure that holds the detailed report (population, keyword counts, etc.) generated by the `WikipediaScraper` for use by the procedural generation AI.
* **`OSMNode.cs`, `OSMWay.cs`, `OSMRelation.cs`**: Data structures representing the core elements of OpenStreetMap data.
* **`WeatherManager.cs`**: A singleton that fetches live, real-world weather data from an API based on the player's current coordinates. It updates on a globally synchronized timer (on the hour and half-hour) to ensure a consistent world state for all players.
* **`OSMParser.cs`**: A static class for loading and parsing OSM XML data. Includes crucial utility functions like `GeoToTileCoordinates` and `GeoToTileCoordinatesDouble`.

### Player Character & Progression
* **`PlayerStats.cs`**: A singleton managing all player statistics (`PlayerStatType` enum values), active buffs/debuffs, and their durations.
* **`StatusUIController.cs`**: Displays player stats, active buffs, and debuffs in the UI.

### Behavioural Engine (Emergent Class System)
* **`BehaviourProfile.cs`**: Stores and manages the player's scores for various `BehaviourTrait` categories.
* **`ClassManager.cs`**: A singleton that defines preset `ClassDefinitions` and procedurally generates new class names. Its `OnClassChanged` event is now connected to the `PlayerStats` system.
* **`PlayerStats.cs`**: The `OnPlayerClassChanged` method now applies permanent stat bonuses based on the player's assigned class, making the emergent class system a core gameplay mechanic.
* **`BehaviourUIController.cs`**: Displays behavioral traits in the UI for testing purposes.
* **`BehaviourTrait.cs`**: Defines an enum of all tracked behavioral traits.
### Skills
* **`SkillSystem.cs`**: Manages skill points, the gacha-style `RollSkill()` logic, and applies passive skill effects.
* **`SkillData.cs`**: Defines properties for individual skills.
* **`SkillDatabase.cs`**: A static repository of predefined `SkillData` objects.
* **`SkillEffectType.cs`**: Defines an enum for various effects skills can have.
* **`SkillUIController.cs`**: Displays learned skills, SkillPoints, and the skill roulette UI.

### Inventory & Equipment
* **`InventorySystem.cs`**: Manages the player's inventory, Aetium currency, and tracks item discovery.
* **`ItemData.cs`**: Defines general item properties including `ItemCategory`.
* **`ItemDatabase.cs`**: Static data for all general items.
* **`EquipmentSystem.cs`**: Manages equipped items in specific slots.
* **`EquipmentUIController.cs`**: Displays available and equipped equipment in the UI.
* **`GearEffectManager.cs`**: Continuously applies passive effects from equipped gear.
* **`TestEquipmentLibrary.cs`**: Registers predefined equipment items for testing.

### Combat & Encounters
* **`EncounterManager.cs`**: The entry point for encounters. It is now called by the `WorldMapManager` and receives a full `Enemy` object to initiate combat.
* **`CombatManager.cs`**: Manages the turn-based combat flow. It compares player and enemy `AttackSpeed` to determine the first turn, calculates critical hits based on `CritChance`, and gives a chance for an extra turn based on `AttackSpeed`. Its `EndCombat()` method now uses the player's `LootDropRate` to determine bonus equipment drops.
* **`Enemy.cs`**: Defines enemy properties, including `AttackSpeed` which is used to determine turn order.
* **`EnemyDatabase.cs`**: Provides a database of enemy definitions.

### Codex (Record of Discovery)
* **`CodexManager.cs`**: A singleton managing a dictionary of discovered `CodexEntry` objects, handling various types like items, skills, NPCs, and locations.
* **`CodexEntry.cs`**: A data class for a single discovered entity.
* **`CodexUIController.cs`**: Manages the Codex UI.
* **`UIDetailBuilder.cs`**: A static utility class for generating consistent rich-text detail strings for UI elements, including items, skills, NPCs, and discovered zones.

### Quests
* **`Quest.cs`**: Defines a quest with a Title, Stages, Description, and Rewards. It now overrides `Equals` and `GetHashCode` to ensure reliable comparisons based on the quest's `Title`.
* **`QuestContent.cs`**: Provides a hardcoded list of `QuestStages` for the MVP starter quest.
* **`QuestUIController.cs`**: Manages the UI display of quests.
* **`GameManager.cs`**: The central hub for quest state management. It holds the `MainQuest` instance and tracks `pendingQuestStages` and `activeQuests`. The `ActivateQuestStage` method now handles pausing the player and displaying quest choices, while `ApplyQuestChoice` processes the player's decision and advances the quest state.
* **`WorldMapManager.cs`**: The `PlaceQuestMarkers` method now reads from the `GameManager`'s `MainQuest` to create `WorldLocation` objectives on the map. The `InitiateEncounter` method correctly checks if a quest stage is active before triggering the interaction, preventing inactive objectives from being triggered.

### Achievements
* **`Achievement.cs`**: Defines the data structure for a single achievement.
* **`AchievementManager.cs`**: A singleton manager that handles the logic of tracking and unlocking achievements.
* **`AchievementUIController.cs`**: Manages the UI for displaying the list of achievements.

### Game Stats
* **`GameStatsManager.cs`**: A singleton that tracks and persists player statistics like total steps taken.
* **`GameStatsUIController.cs`**: The UI controller that displays the stats in the left-hand panel.

### UI & Core Management
* **`LogUIController.cs`**: Manages the system log, including interactive hover previews for discovered items, skills, and zones.
* **`OptionsUIController.cs`**: Manages a container for dynamically displaying contextual action buttons.
* **`DragManipulator.cs`, `ResizeManipulator.cs`**: Utility scripts for draggable and resizable UI.
* **`SettingsUIController.cs`**: Manages the settings interface.

### Companion & Tower Systems
* **`CompanionSystem.cs`**: Manages the list of active companions.
* **`TowerManager.cs`**: Manages the state and progression within multi-floor tower challenges. It is now responsible for the procedural generation of each tower floor, creating unique layouts with walls, enemies, and stairs. It tracks the player's progress, including their highest reached floor, and handles the logic for special floors like boss rooms and non-combat rest areas.

## 5. How Everything is Linked (System Interconnections)

**Aeternis: Odyssey** is built on a foundation of interconnected singleton managers.

### Code Dependencies & Data Flow
* **Central Hub (`GameManager`)**: The `GameManager`'s `InitializeGame()` coroutine sets up all connections. Its `Update()` loop is the primary driver, checking for continuous input and calling other managers.
* **Movement & Panning Loop**:
    1. `GameManager.Update()` detects a held key and calls `WorldMapManager.MoveContinuously()` every frame.
    2. `WorldMapManager.MoveContinuously()` updates the player's true geographical coordinates.
    3. `GameManager.Update()` then calls `MapUIController.RefreshVisualMap()`.
    4. `MapUIController.RefreshVisualMap()` calculates the player's current tile coordinates. As it requests tile textures from `TileManager`, it adds the high-zoom tile coordinates to the `ExploredWorldTiles` list in `WorldMapManager`.
* **World Map Display Loop**:
    1. The user clicks the "World Map" button in the right panel.
    2. `GameManager` calls `WorldMapViewController.ToggleView()`.
    3. `ToggleView` hides the `PlayerInfoDisplay` ScrollView and shows the `worldMapRoot` element. It then calls `RenderWorldMap()`.
    4. `RenderWorldMap()` gets the `ExploredWorldTiles` list, converts the high-zoom (e.g., level 18) coordinates to a lower zoom level (e.g., 15), and requests the corresponding low-zoom tiles from `TileManager` to build a pannable, zoomable map.
    
* **Player Stats (`PlayerStats`)**: This singleton is the central source of truth for all character attributes, modified by `EquipmentSystem`, `SkillSystem`, and `CombatManager`.
* **Discovery & Lore (`CodexManager`)**: This manager is called by many other systems to ensure a centralized record of all player discoveries.

### Encounter & Interaction Loop (New)
The new geo-coordinate based encounter system operates on a continuous loop, independent of the old tile grid.
1.  **Continuous Check**: `GameManager.Update()` calls `WorldMapManager.CheckForEncounters()` every frame.
2.  **Distance Calculation**: `CheckForEncounters()` iterates through the `interactableLocations` list and calculates the real-world distance in meters from the player to each object.
3.  **Trigger**: If the distance is within an object's `encounterTriggerDistance` (e.g., 5 meters), `WorldMapManager.InitiateEncounter()` is called for that specific `WorldLocation`.
4.  **State Management**: `InitiateEncounter()` calls the appropriate handler (e.g., `CombatManager.StartCombat` or `ShowShrineOptions`). These handlers are now responsible for setting state flags like `IsCleared` on the `WorldLocation` object.
5.  **UI Feedback**: After an interaction, `CombatManager` or other systems call `GameManager.RefreshMainMap()` to force the `MapUIController` to redraw, hiding the icons of any locations now flagged as `IsCleared`.


### Scene Management & Assets
* **Scene**: The game operates within a single persistent scene (`MainScene`).
* **Data**: Game data (`SkillData`, `ItemData`, etc.) is defined in database scripts for easy modification.
* **UI**: The UI is built with UI Toolkit. UXML files define structure, and USS files provide styling.

#### Dungeon Entry & Exit Loop (New)
The dungeon system uses a separate virtual coordinate space and a dedicated rendering path to create self-contained, interactive instances.
1.  **Encounter**: On the overworld, the player approaches a `DungeonEntrance` and is given the choice to enter.
2.  **State Transition (Enter)**: `WorldMapManager.EnterDungeon()` saves the player's current overworld coordinates, changes the `GameManager.CurrentLocationState` to `Dungeon`, and sets the player's coordinates to a virtual starting point inside the dungeon.
3.  **Dungeon Simulation**:
    * **Rendering**: The `MapUIController` switches to its dungeon rendering mode, drawing grey lines for walls against a black background instead of rendering OSM tiles.
    * **Collision**: The `WorldMapManager.MoveContinuously()` method uses a bounding-box check to prevent the player icon from passing through any `WorldLocation` marked as a `Wall`.
    * **Encounters**: The system checks for encounters against the dungeon-specific `dungeonMap` list and uses a simple virtual distance calculation.
4.  **Boss Loop**:
    * The player defeats an enemy of type `Boss`.
    * `CombatManager.EndCombat()` detects the defeated enemy was a boss and calls `WorldMapManager.OnBossDefeated()`.
    * This method replaces the boss icon on the map with a `BossChest`.
    * Interacting with the `BossChest` gives the player loot and then replaces the chest with a `Teleporter`.
5.  **Teleport & Exit**: Interacting with the teleporter gives the player the option to instantly move back to the dungeon's starting area. The player can then find the `DungeonEntrance` object (the exit ladder) to leave the instance and return to the overworld.
6.  **State Transition (Exit)**: `WorldMapManager.ExitDungeon()` restores the player to their saved overworld coordinates, with a small offset to prevent an immediate re-encounter with the entrance.

#### Tower Gameplay Loop (New)
The tower provides a floor-by-floor challenge that is procedurally generated and uses the same "live map" systems as the dungeon.
1.  **Encounter**: The player interacts with the `TowerEntrance` on the overworld map and is given the choice to start from floor 1 or continue from their highest reached floor.
2.  **State Transition**: `WorldMapManager` calls `TowerManager.EnterTower()`, which changes the game state to `Tower` and triggers the generation of the appropriate floor.
3.  **Procedural Generation**: For each new floor, the `TowerManager.GenerateFloor()` method creates a unique map. It carves out open space from a solid block, ensuring a different layout for each visit. It then places enemies and a "Sealed Path" (the stairs to the next floor) at random, unique positions.
4.  **Floor Progression**: The stairs to the next floor are initially sealed and uninteractable. The player must explore the floor and defeat all enemies.
5.  **Unsealing**: Once the last enemy on a floor is defeated, `CombatManager` calls `TowerManager.EnemyDefeatedOnCurrentFloor()`. This method finds the "Sealed Path" object on the map and updates its properties, changing it to "Stairs Up" and making it interactable.
6.  **Ascension**: The player can then walk to the unsealed stairs and interact with them to trigger `TowerManager.AscendFloor()`, which generates the next floor and moves the player to its starting point.
7.  **Rest Floors**: Special floors (e.g., floor 10.5) are generated without enemies. On these floors, the stairs to the next level are created in their "unsealed" state from the start, and an exit teleporter is available, allowing the player to return to the overworld.


### 6. Future Plans & Roadmap

**Development Status & Roadmap Summary:**
* **Live Map System**: Complete. The system can load OSM data, translate continuous player input into smooth geographical movement, and render a stable, seamlessly panning tile-based map.
* **World Map Feature**: A persistent, pannable, and zoomable World Map is now implemented in the right-hand UI panel. It correctly displays all player-explored areas.
* **Geo-Coordinate Encounter System**: Complete. Encounters with enemies, shrines, and NPCs are now triggered by real-world proximity. The system correctly handles interaction states (including multi-visit shrines, defeated enemies) and UI feedback.
* **Quest System**: Complete. A full quest loop is implemented. The active quest marker correctly appears on the map, interaction pauses player movement and shows choices, and the quest state progresses correctly, updating the map markers as the player advances through the stages. Inactive or completed quest markers are no longer interactable.
* **Dungeon & Tower System**: Complete. Players can now encounter and enter instanced `Dungeons` and a procedurally generated `Tower`. These instances use the "live map" system with their own unique layouts, solid-wall collision, and gameplay loops. The tower features floor-by-floor progression with sealed exits that are unlocked by defeating all enemies, as well as special boss and rest floors with unique content.
* **Procedural Content Generation**: Complete. A system is now in place to procedurally generate interactables (enemies, NPCs, points of interest) in newly discovered overworld zones. The system correctly populates zones upon discovery and saves the generated content.
* **Interactive World Map**: Complete. The world map now features an interactive hover preview that displays detailed information about discovered zones (name, biome, etc.) and visually highlights the zone's boundaries for clarity.
* **AI-Driven Zone Generation**: Complete. The system now scrapes detailed data (population, keyword frequency, contextual clues) from Wikipedia. An "AI" then uses this data, along with the zone's randomly assigned ruling faction, to generate a unique `BiomeContentProfile` for each zone on the fly, determining content density and type.
* **Codex for Locations**: Complete. Discovered zones are now automatically added to a new "Locations" category in the Codex, with a detailed view and interactive log message.
* **Immediate Next Steps**:
    * Implement different types of chests with varied loot tables.
    * Further expand the AI generator with more thematic rules and content pools.
* **Not yet developed**: Profile, Social Systems (Guilds/Factions), Active Gear Effects.


## 7. AI Vision and Responsibilities for Aeternis: Odyssey

The game will heavily rely on advanced AI systems to drive dynamic content generation, world persistence, and player-centric adaptability. This aims to create a uniquely evolving and highly replayable experience, minimizing manual content creation.

## 8. Unity Project Setup and Development Workflow

* **Development Environment**: The game is built in **Unity** using the **2D URP (Universal Render Pipeline)**.
* **Platform & Input**: PC-first development with a mobile-first design philosophy. Uses Unity's new **Input System**.
* **UI System**: Built with **UI Toolkit (UXML/USS)**, featuring a modular, three-column layout.

## 9. Current Unfixed Bugs

* Equipping an item automatically switches the active tab display to the equipment UI, regardless of the currently active UI.
* The hover preview pane for merchant items can sometimes be positioned off-screen when hovering over items at the bottom of the list.

### Future Map Enhancement: Stylized Vector-Based Maps

A potential future direction for the world map is to move away from the current raster tile system to a more flexible vector tile-based approach.

**Current Limitation:**
The map currently uses pre-rendered PNG image tiles from OpenStreetMap. This means all details—minor roads, commercial icons, and labels—are permanently "baked" into the map's appearance. While simple to implement, this offers no control over the map's style, leading to visual clutter that may not fit the game's aesthetic.

**Proposed Solution: Vector Tiles**
By switching to a vector tile provider (such as Mapbox, MapTiler, or a self-hosted solution), the game would receive raw map data (points, lines, and polygons with descriptive tags) instead of static images. This would shift the rendering responsibility to the game client, allowing us to create and apply a custom style sheet.

**Benefits & Implementation:**
This approach gives us complete creative control to render only the features we want, such as main roads and building outlines, while hiding unwanted details. It would enable a highly stylized and immersive map view that perfectly matches the game's art direction. Implementing this is a significant architectural task, likely requiring a third-party SDK for parsing vector data and handling the custom rendering within Unity. This would be a high-effort, high-reward feature for enhancing the game's visual identity.

## 10. Future Tech - Blockchain Integration Concepts

The core vision of **Aeternis: Odyssey**—a persistent world shaped by player belief and actions—provides a unique narrative opportunity to integrate blockchain technology not as a gimmick, but as a fundamental component of the game's lore and mechanics. The blockchain can serve as a technical representation of the **Imaginum's** immutable, collective memory.

### The Imaginum's Ledger: On-Chain World Events

The concept of "the world remembers" can be literalized through a public blockchain ledger. Instead of storing every minor detail, this ledger would immortalize significant, world-altering events, making them a permanent and verifiable part of the game's history.

* **First Discoveries**: When a player is the first to discover a new zone or a hidden dungeon, a transaction could be recorded on the chain, cementing their legacy as a true explorer.
* **Legendary Feats**: The first group to defeat a world boss or complete a server-wide event could have their names and the date of their achievement permanently recorded.
* **Emergent Lore**: As players' actions cause new classes to emerge, the "founder" of that class and its defining traits could be recorded, creating a player-driven historical record of the world's evolution.

### Aetium and Player Ownership

The in-game currency, **Aetium**, can be the key that links players to this permanent ledger, offering true ownership of their accomplishments.

* **Option A: The Full Cryptocurrency Model**
    * **Concept**: Aetium could be implemented as a true cryptocurrency on a public blockchain. Players would store it in personal crypto wallets and could trade it on external marketplaces.
    * **Considerations**: While this offers players the highest degree of ownership over their currency, it introduces significant technical complexity and regulatory hurdles. It also risks creating a "pay-to-win" environment through external speculation, which directly conflicts with the game's core philosophy.

* **Option B: The NFT Item Minting Model (Recommended)**
    * **Concept**: Aetium remains an in-game, server-controlled currency. However, it gains a unique and powerful use: as a catalyst to "imprint" an item onto the Imaginum's memory. Players could spend a significant amount of Aetium to mint a powerful or rare in-game item (e.g., the "Cave Troll's Club" dropped by a boss) as a unique **NFT (Non-Fungible Token)**.
    * **Benefits**: This model grants players true, verifiable ownership of their most prized gear without turning the entire economy into a speculative market. An item's NFT could store its entire history: the name of the player who defeated the boss to acquire it, its battle statistics, and its chain of ownership. This aligns perfectly with the lore of imprinting belief onto reality and respects the "no pay-to-win" design pillar.

### Decentralization and Game Architecture

While the idea of every player acting as a node in the network thematically mirrors the "collective belief" concept, it is not technically feasible for a real-time MMORPG due to the immense resource requirements and security vulnerabilities.

* **Proposed Architecture**: The game would be run on a set of dedicated, official servers that act as the trusted nodes of the Aeternis blockchain. Players' game clients would act as "light clients," interacting with these nodes to read world-state data and submit transactions (like imprinting an item) without needing to store the entire ledger history.
* **Lore Integration**: This can be framed as the official servers being "Anchors" or "Lighthouses" that stabilize the Imaginum's chaotic memory. Players, as "Travellers" immune to the Imaginum's direct influence, connect to these anchors to make their mark on the world's shared reality.
