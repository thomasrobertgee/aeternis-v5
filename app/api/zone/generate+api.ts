import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchWikipediaSummary } from '../../../utils/wikipediaApi';

/**
 * POST /api/zone/generate
 * Generates a dark fantasy procedural biome based on real-world suburb data.
 */
export async function POST(request: Request) {
  try {
    const { suburbName, regionContext } = await request.json();

    if (!suburbName) {
      return Response.json({ error: 'Missing suburbName in request body' }, { status: 400 });
    }

    // Construct a specific search query for Wikipedia (e.g., "Williamstown, Victoria")
    const searchQuery = regionContext ? `${suburbName}, ${regionContext}` : `${suburbName}, Victoria`;

    // Fetch Wikipedia context internally to reduce client-side logic
    let wikipediaSummary = await fetchWikipediaSummary(searchQuery);

    // FALLBACK: If the specific search fails (returns the forgotten territory string), 
    // try just the suburb name to avoid total 404s on over-specified queries.
    if (wikipediaSummary.includes('forgotten territory') && regionContext) {
      wikipediaSummary = await fetchWikipediaSummary(suburbName);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are the Imaginum, a cosmic entity shaping a dark fantasy parallel Earth. Analyze this real-world location: ${suburbName}. Historical Context: ${wikipediaSummary}.
    
    IMPORTANT NAMING RULES:
    1. Do not change or corrupt the zone name. biomeName MUST be exactly "${suburbName}".
    2. For primarySettlement.name and dungeon.name, find a real-world street, park, or landmark from the provided context and simply append the word "Settlement" or "Dungeon" to it (e.g., "Nelson Place Settlement" or "Point Gellibrand Dungeon").
    
    THEMATIC RULES:
    1. Corrupt the weatherState, description, and the enemies into a dark fantasy MMORPG setting based on the real-world history and industry of the area.
    2. The enemy of type "weak_tutorial" must be a corrupted version of a common local animal or nuisance.

    Return ONLY a valid JSON object with this exact structure: 
    { 
      "zoneTheme": { 
        "biomeName": "String", 
        "weatherState": "String", 
        "description": "String" 
      }, 
      "primarySettlement": { 
        "name": "String", 
        "chieftain": { "name": "String", "lore": "String" }, 
        "vendor": { "name": "String", "specialty": "String" } 
      }, 
      "enemies": [ 
        { "name": "String", "type": "weak_tutorial", "description": "String" }, 
        { "name": "String", "type": "standard", "description": "String" } 
      ], 
      "dungeon": { 
        "name": "String", 
        "theme": "String" 
      } 
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text in case the AI wraps it in markdown code blocks
    const cleanedText = text.replace(/```json|```/gi, '').trim();
    
    let zoneData;
    try {
      zoneData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return Response.json({ error: 'Failed to generate a valid zone profile' }, { status: 500 });
    }

    /**
     * DATABASE PERSISTENCE (FUTURE IMPLEMENTATION):
     * --------------------------------------------
     * To ensure this generated zone persists for ALL players who visit this suburb,
     * you should save the output to a global 'Zones' table here.
     * 
     * Example:
     * const { data, error } = await supabase
     *   .from('world_zones')
     *   .upsert({ 
     *     suburb_id: suburbName.toLowerCase(), 
     *     data: zoneData, 
     *     last_updated: new Date().toISOString() 
     *   });
     * 
     * This turns procedural generation into persistent world-building.
     */

    return Response.json(zoneData, { status: 200 });

  } catch (error) {
    console.error('Error generating zone:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
