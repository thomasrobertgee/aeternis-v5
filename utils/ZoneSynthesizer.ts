/**
 * ZoneSynthesizer.ts
 * Analyzes real-world data to generate gameplay mechanics and attributes.
 */

import { FactionType } from './BiomeMapper';

export interface ZoneNPC {
  name: string;
  title: string;
  description: string;
}

export interface ZoneSynthesis {
  dominantFaction: FactionType;
  difficultyLevel: number; // 1-10
  lootQuality: 'Common' | 'Rare' | 'Fractured' | 'Legendary';
  analysisTags: string[];
  npc: ZoneNPC;
}

class ZoneSynthesizer {
  private static instance: ZoneSynthesizer;

  private constructor() {}

  public static getInstance(): ZoneSynthesizer {
    if (!ZoneSynthesizer.instance) {
      ZoneSynthesizer.instance = new ZoneSynthesizer();
    }
    return ZoneSynthesizer.instance;
  }

  /**
   * Synthesizes a zone profile based on Wikipedia text.
   */
  public synthesize(text: string): ZoneSynthesis {
    const normalized = text.toLowerCase();

    // 1. Determine Dominant Industry (Faction)
    const faction = this.determineFaction(normalized);

    // 2. Determine Historical Age (Difficulty)
    const difficulty = this.calculateDifficulty(normalized);

    // 3. Determine Landmark Density (Loot Quality)
    const loot = this.calculateLootQuality(normalized);

    // 4. Generate Unique NPC
    const npc = this.generateNPC(faction, normalized);

    return {
      dominantFaction: faction,
      difficultyLevel: difficulty,
      lootQuality: loot,
      analysisTags: this.extractTags(normalized),
      npc,
    };
  }

  private generateNPC(faction: FactionType, text: string): ZoneNPC {
    const isWater = text.includes('water') || text.includes('river') || text.includes('creek');
    const isOld = text.includes('historic') || text.includes('established') || text.includes('18');
    
    switch (faction) {
      case FactionType.IRON_CONSORTIUM:
        return {
          name: this.pick(['Sterling', 'Vance', 'Gears', 'Forge', 'Anvil']),
          title: this.pick(['Chief Engineer', 'Foreman', 'Site Manager', 'Heavy Welder']),
          description: `A grimy overseer ensuring the ${isWater ? 'pumps' : 'furnaces'} never stop running.`
        };
      case FactionType.SYLVAN_CONCLAVE:
        return {
          name: this.pick(['Oakley', 'Fern', 'Moss', 'Briar', 'Reed']),
          title: this.pick(['Grove Warden', 'Seed Keeper', 'Root Tender', 'Canopy Watcher']),
          description: `A figure draped in living foliage, guarding the ${isOld ? 'ancient roots' : 'new growth'} of the zone.`
        };
      case FactionType.NEO_TECHNOCRATS:
        return {
          name: this.pick(['Cipher', 'Null', 'Kore', 'Vertex', 'Prime']),
          title: this.pick(['Lead Analyst', 'Grid Architect', 'Data Broker', 'System Admin']),
          description: 'A sleek individual whose eyes flicker with scrolling data streams.'
        };
      case FactionType.CHRONO_ARCHIVISTS:
        return {
          name: this.pick(['Booker', 'Scribe', 'Page', 'Vellum', 'Quill']),
          title: this.pick(['Head Curator', 'Lore Seeker', 'Preservationist', 'Dust Walker']),
          description: `An eccentric scholar obsessed with the history of ${isOld ? 'the old world' : 'the fracture'}.`
        };
      case FactionType.VOID_WANDERERS:
        return {
          name: this.pick(['Tide', 'Drift', 'Mist', 'Echo', 'Shroud']),
          title: this.pick(['Ferryman', 'Navigator', 'Abyss Diver', 'Shore Scout']),
          description: 'A restless nomad who smells of salt and unseen dimensions.'
        };
      default:
        return {
          name: 'Doe',
          title: 'Survivor',
          description: 'A lone survivor trying to make sense of the fracture.'
        };
    }
  }

  private pick(options: string[]): string {
    return options[Math.floor(Math.random() * options.length)];
  }

  private determineFaction(text: string): FactionType {
    const scores = {
      [FactionType.IRON_CONSORTIUM]: this.countOccurrences(text, ['industrial', 'factory', 'refinery', 'works', 'plant', 'manufacturing', 'port', 'steel', 'railway']),
      [FactionType.SYLVAN_CONCLAVE]: this.countOccurrences(text, ['park', 'reserve', 'forest', 'garden', 'creek', 'river', 'botanical', 'nature', 'landscape']),
      [FactionType.NEO_TECHNOCRATS]: this.countOccurrences(text, ['office', 'business', 'tower', 'headquarters', 'tech', 'innovation', 'digital', 'central', 'modern']),
      [FactionType.CHRONO_ARCHIVISTS]: this.countOccurrences(text, ['library', 'school', 'university', 'historic', 'archive', 'museum', 'heritage', 'church', 'original']),
      [FactionType.VOID_WANDERERS]: this.countOccurrences(text, ['beach', 'wharf', 'pier', 'maritime', 'sea', 'ocean', 'ferry', 'trade', 'bay']),
    };

    let dominant: FactionType = FactionType.NEO_TECHNOCRATS;
    let maxScore = -1;

    for (const [faction, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominant = faction as FactionType;
      }
    }

    return dominant;
  }

  private calculateDifficulty(text: string): number {
    // Look for established dates (e.g., 1850, 19th century)
    const yearMatches = text.match(/\b(1[789]\d{2})\b/g);
    let baseDifficulty = 3;

    if (yearMatches) {
      const earliestYear = Math.min(...yearMatches.map(Number));
      if (earliestYear < 1850) baseDifficulty += 4;
      else if (earliestYear < 1900) baseDifficulty += 2;
    }

    if (text.includes('historic') || text.includes('heritage')) baseDifficulty += 2;
    if (text.includes('war') || text.includes('battle')) baseDifficulty += 1;

    return Math.min(10, baseDifficulty);
  }

  private calculateLootQuality(text: string): 'Common' | 'Rare' | 'Fractured' | 'Legendary' {
    const landmarks = ['bridge', 'church', 'station', 'monument', 'memorial', 'square', 'hall', 'hospital', 'theatre', 'university'];
    const density = this.countOccurrences(text, landmarks);

    if (density > 8) return 'Legendary';
    if (density > 5) return 'Fractured';
    if (density > 2) return 'Rare';
    return 'Common';
  }

  private countOccurrences(text: string, keywords: string[]): number {
    return keywords.reduce((acc, word) => {
      const regex = new RegExp(`\b${word}\b`, 'g');
      return acc + (text.match(regex)?.length || 0);
    }, 0);
  }

  private extractTags(text: string): string[] {
    const allTags = ['industrial', 'residential', 'commercial', 'coastal', 'historic', 'educational', 'recreational'];
    return allTags.filter(tag => text.includes(tag));
  }
}

export default ZoneSynthesizer.getInstance();
