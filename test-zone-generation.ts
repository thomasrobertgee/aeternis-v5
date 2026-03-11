/**
 * test-zone-generation.ts
 * Standalone backend test script for verifying procedural zone generation.
 * 
 * TO RUN LOCALLY:
 * Method 1 (npx tsx - Recommended):
 *   npx tsx test-zone-generation.ts
 * 
 * Method 2 (ts-node):
 *   npx ts-node test-zone-generation.ts
 * 
 * NOTE: Ensure your GEMINI_API_KEY environment variable is set in your terminal session.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchWikipediaSummary } from './utils/wikipediaApi';

async function runTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Missing GEMINI_API_KEY environment variable.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  async function testSuburb(suburbName: string, regionContext: string) {
    console.log(`\n--- TESTING SUBURB: ${suburbName} (${regionContext}) ---`);

    // 1. Construct search query like the API route does
    const searchQuery = regionContext ? `${suburbName}, ${regionContext}` : `${suburbName}, Victoria`;

    // 2. Fetch Wikipedia context with more specific search
    let wikipediaSummary = await fetchWikipediaSummary(searchQuery);

    // 3. FALLBACK logic matching the API route
    if (wikipediaSummary.includes('forgotten territory') && regionContext) {
      console.log(`Query "${searchQuery}" failed. Trying fallback: "${suburbName}"`);
      wikipediaSummary = await fetchWikipediaSummary(suburbName);
    }

    console.log(`Wikipedia Summary Fetched: "${wikipediaSummary.substring(0, 100)}..."`);

    // 4. Prepare the exact Imaginum prompt from api/zone/generate.ts
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

    try {
      // 5. Mock the POST request logic calling the Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response text (remove markdown blocks)
      const cleanedText = text.replace(/```json|```/gi, '').trim();
      
      const zoneData = JSON.parse(cleanedText);
      console.log('Final Parsed JSON Output:');
      console.log(JSON.stringify(zoneData, null, 2));
    } catch (error) {
      console.error(`Failed to generate/parse zone for ${suburbName}:`, error);
    }
  }

  // Case 1: Known suburb (passing Victoria to trigger 200)
  await testSuburb('Williamstown', 'Victoria');

  // Case 2: Made-up suburb (to verify Wikipedia 404 fallback)
  await testSuburb('FakeTownXYZ', 'Imaginary Region');
}

runTest().catch(console.error);
