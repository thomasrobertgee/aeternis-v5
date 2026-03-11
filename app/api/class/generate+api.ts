import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/class/generate
 * Generates a unique player class based on behavioural traits.
 */
export async function POST(request: Request) {
  try {
    const { traits } = await request.json();

    if (!traits) {
      return Response.json({ error: 'Missing traits in request body' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are the Imaginum, a cosmic entity in a dark fantasy MMORPG. 
    Based on the following player behavioral traits: ${JSON.stringify(traits)}, 
    generate a highly unique, emergent class. Do not use standard tropes like Warrior or Mage. 
    Return ONLY a valid JSON object with the following structure: 
    { 
      "className": "String", 
      "description": "String (2 sentences explaining how their actions manifested this class)", 
      "startingSkills": [ "Skill 1", "Skill 2", "Skill 3" ] 
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response text in case the AI wraps it in markdown code blocks
    const cleanedText = text.replace(/```json|```/gi, '').trim();
    
    let classData;
    try {
      classData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return Response.json({ error: 'Failed to generate a valid class profile' }, { status: 500 });
    }

    /**
     * DATABASE INSERTION LOGIC (FUTURE IMPLEMENTATION):
     * --------------------------------------------------
     * To save this class as 'public lore' for future players, 
     * you should perform a database insertion here.
     * 
     * Example using a hypothetical 'Lore' table in PostgreSQL/Supabase:
     * 
     * const { data, error } = await supabase
     *   .from('lore_classes')
     *   .insert([
     *     { 
     *       name: classData.className, 
     *       description: classData.description, 
     *       traits_context: traits,
     *       is_public: true,
     *       created_at: new Date().toISOString()
     *     }
     *   ]);
     * 
     * This would allow the 'Codex' or a 'Hall of Legends' screen to 
     * pull procedurally generated classes discovered by other players.
     */

    return Response.json(classData, { status: 200 });

  } catch (error) {
    console.error('Error generating class:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
