import { BiomeType, FactionType } from './BiomeMapper';

interface ScenarioContext {
  suburb: string;
  biome: BiomeType;
  faction: FactionType;
}

const biomeTemplates: Record<BiomeType, string[]> = {
  [BiomeType.RUST_FIELDS]: [
    "The air here is thick with the scent of ozone and scorched iron. Massive, rusted skeletons of ancient factories loom over the horizon.",
    "Grinding gears and the hiss of steam echo through the metallic canyons. The ground is a patchwork of discarded alloys and cooling slag.",
  ],
  [BiomeType.VERDANT_GROVE]: [
    "Lush, bioluminescent flora has completely reclaimed the concrete. Vines pulse with a soft emerald light, humming with life.",
    "A dense canopy of oversized ferns blocks out the sun. The air is heavy with the scent of damp earth and exotic nectar.",
  ],
  [BiomeType.SILICON_SPIRES]: [
    "Gleaming towers of glass and obsidian pierce the clouds. Holographic advertisements flicker in the permanent haze of the high-rise.",
    "Data streams flow like liquid light through the translucent walls of the spires. The hum of a billion calculations fills the streets.",
  ],
  [BiomeType.SHATTERED_SUBURBIA]: [
    "Rows of familiar houses are caught in a state of suspended decay, half-merged with the shifting landscape of the Imaginum.",
    "Flickering streetlights illuminate empty playgrounds. The silence is broken only by the sound of curtains fluttering in broken windows.",
  ],
  [BiomeType.MISTY_WHARFS]: [
    "A thick, salty fog rolls off the indigo waves, obscuring the colossal cranes that stand like guardian giants along the pier.",
    "The sound of the abyss lapping against the rotted wood of the docks is a constant reminder of the world beyond the veil.",
  ],
  [BiomeType.VOID_PROMENADE]: [
    "The architecture here shifts and flows like silk. Ornate walkways lead to shops that sell memories and liquid starlight.",
    "A grand avenue of marble and shadow, where the elite of the world gather to trade in the currencies of belief and time.",
  ],
  [BiomeType.ANCIENT_ARCHIVES]: [
    "Colossal shelves of stone reach toward an infinite ceiling, filled with tablets and scrolls that whisper the secrets of the Collapse.",
    "The smell of old parchment and magical ink permeates the air. Knowledge is carved into the very walls of this scholarly bastion.",
  ],
};

const factionAtmosphere: Record<FactionType, string> = {
  [FactionType.IRON_CONSORTIUM]: "Heavy machinery patrols the perimeter, and the clank of heavy boots is the rhythm of the day.",
  [FactionType.SYLVAN_CONCLAVE]: "The architecture is grown, not built, and the locals move with a predatory, animalistic grace.",
  [FactionType.NEO_TECHNOCRATS]: "Security drones buzz overhead, scanning for anomalies in the perfectly ordered grid of the city.",
  [FactionType.VOID_WANDERERS]: "Shadows seem to detach from their owners here, and the locals speak in hushed, rhythmic riddles.",
  [FactionType.CHRONO_ARCHIVISTS]: "Time flows strangely; you might see a flower bloom and wither in the span of a single heartbeat.",
};

/**
 * Generates a procedural description for a zone.
 */
export const generateZoneDescription = (context: ScenarioContext): string => {
  const { suburb, biome, faction } = context;
  
  // Deterministic selection based on suburb name
  const hash = suburb.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const templates = biomeTemplates[biome];
  const primaryDescription = templates[hash % templates.length];
  const factionFlavor = factionAtmosphere[faction];

  return `${primaryDescription} ${factionFlavor}`;
};
