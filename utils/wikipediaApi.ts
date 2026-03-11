/**
 * wikipediaApi.ts
 * Asynchronously fetches a plain-text summary for a given search query from Wikipedia.
 */

/**
 * Fetches the summary of a Wikipedia page for a given search query.
 * @param searchQuery The search query (e.g., 'Williamstown, Victoria')
 * @returns The plain text summary (extract) or a generic fallback.
 */
export async function fetchWikipediaSummary(searchQuery: string): Promise<string> {
  const formattedName = searchQuery.replace(/\s+/g, '_');
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedName)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AeternisOdyssey/1.0 (https://github.com/thomasrobertgee/aeternis-v5; thomasrobertgee@gmail.com)',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      // Return fallback for 404 or other non-success status codes
      return 'A forgotten territory of the old world, its history lost to the Imaginum.';
    }

    const data = await response.json();
    
    // Return the extract property (plain text summary)
    return data.extract || 'A forgotten territory of the old world, its history lost to the Imaginum.';

  } catch (error) {
    console.error(`Failed to fetch Wikipedia summary for ${searchQuery}:`, error);
    return 'A forgotten territory of the old world, its history lost to the Imaginum.';
  }
}
