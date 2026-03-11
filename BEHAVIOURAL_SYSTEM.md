# Aeternis: Odyssey - Behavioural Tracking System

This document outlines the hidden behavioural tracking system that monitors player actions to determine their eventual AI-generated class. The system silently updates five core traits based on specific game events.

## 1. Core Traits
The system tracks the following psychological profiles:
*   **Violence**: Inclination toward direct conflict and engagement.
*   **Curiosity**: The drive to explore unknown sectors and discover lore.
*   **Courage**: Willingness to face high-threat manifestations and complete difficult objectives.
*   **Pragmatism**: Prioritizing survival and efficient resource management.
*   **Empathy**: Actions that show care for others or the preservation of the Fracture (System foundation established).

---

## 2. Action Mapping
The following table lists the current actions tracked by the `useBehaviourStore` and their impact on the player's profile.

| Action Key | Trigger Event | Trait Affected | Value |
| :--- | :--- | :--- | :--- |
| **EXPLORE_NEW_ZONE** | First-time entry into a new suburb boundary. | Curiosity | +5 |
| **INITIATE_ENCOUNTER** | Choosing to 'Engage' a hostile signal or 'Descend' a dungeon. | Violence | +2 |
| **DEFEAT_BOSS** | Defeating a Sovereign Rift Entity or Dungeon Boss. | Courage | +10 |
| **COMPLETE_FIRST_QUEST** | Finishing the 'Cull the Pack' tutorial objective. | Courage | +5 |
| **FLEE_COMBAT_LOW_HP** | Retreating from battle while under 30% HP. | Pragmatism | +3 |
| **FLEE_COMBAT_HIGH_HP** | Retreating from battle while over 30% HP. | Courage | -5 |

---

## 3. Threshold & Emergence
The system operates on a **Threshold of 100**.

1.  **Tracking**: Every time one of the actions above occurs, `recordAction` is called.
2.  **Convergence**: The system increments `totalActionsTracked`.
3.  **Emergence**: When exactly **100 actions** have been recorded, the system triggers the "Class Emergence" event. 
4.  **Analysis**: The final values of the `traits` object are analyzed to determine the player's unique class (e.g., a player with high *Curiosity* and *Pragmatism* might emerge as a *Void Scout*).

---

## 4. Implementation Details
*   **Storage**: Data is persisted via `AsyncStorage` under the key `aeternis-behaviour-storage`.
*   **Visibility**: The system is intended to be "hidden" (no UI elements currently reflect these stats to the player).
*   **Configuration**: All impact values are managed in `config/behaviourMap.ts`.
