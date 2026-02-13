/**
 * ZoneEventManager.ts
 * Manages temporary world events that modify gameplay mechanics.
 */

import { BiomeType } from './BiomeMapper';

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  biomeRequirement: BiomeType;
  difficultyMultiplier: number;
  lootMultiplier: Record<string, number>;
  durationMs: number;
  startTime: number;
}

class ZoneEventManager {
  private static instance: ZoneEventManager;
  private activeEvents: Map<string, WorldEvent> = new Map();

  private constructor() {}

  public static getInstance(): ZoneEventManager {
    if (!ZoneEventManager.instance) {
      ZoneEventManager.instance = new ZoneEventManager();
    }
    return ZoneEventManager.instance;
  }

  /**
   * Checks if an event should trigger for a given zone.
   */
  public triggerRoll(suburb: string, biome: BiomeType): WorldEvent | null {
    // 30% chance to trigger an event if it's an Industrial zone
    if (biome === BiomeType.RUST_FIELDS && Math.random() < 0.3) {
      return this.createSteamLeak(suburb);
    }
    
    return null;
  }

  private createSteamLeak(suburb: string): WorldEvent {
    return {
      id: `steam-leak-${suburb}-${Date.now()}`,
      name: 'Industrial Steam Leak',
      description: 'Fractured pipes are venting high-pressure Imaginum steam. Visibility is low, but exposed components are easier to salvage.',
      biomeRequirement: BiomeType.RUST_FIELDS,
      difficultyMultiplier: 1.25, // 25% harder
      lootMultiplier: { 'Scrap Metal': 2.0 }, // Double scrap
      durationMs: 10 * 60 * 1000, // 10 minutes
      startTime: Date.now()
    };
  }

  public getActiveEventForZone(suburb: string): WorldEvent | null {
    const events = Array.from(this.activeEvents.values());
    const now = Date.now();
    
    const event = events.find(e => e.id.includes(suburb) && (now - e.startTime < e.durationMs));
    if (event) return event;
    
    return null;
  }

  public addEvent(event: WorldEvent) {
    this.activeEvents.set(event.id, event);
  }

  public cleanup() {
    const now = Date.now();
    for (const [id, event] of this.activeEvents.entries()) {
      if (now - event.startTime > event.durationMs) {
        this.activeEvents.delete(id);
      }
    }
  }
}

export default ZoneEventManager.getInstance();
