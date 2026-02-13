/**
 * WikipediaService.ts
 * Fetches real-world data for suburbs to enhance procedural narrative.
 */

export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

class WikipediaService {
  private static instance: WikipediaService;
  private baseUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/';

  private constructor() {}

  public static getInstance(): WikipediaService {
    if (!WikipediaService.instance) {
      WikipediaService.instance = new WikipediaService();
    }
    return WikipediaService.instance;
  }

  /**
   * Fetches the summary of a Wikipedia page for a given suburb.
   * @param suburb The name of the suburb (e.g., 'Altona North')
   * @param state The state to narrow down the search (defaults to 'Victoria')
   */
  public async getSuburbSummary(suburb: string, state: string = 'Victoria'): Promise<WikipediaSummary | null> {
    // Format title: "Altona_North,_Victoria"
    const formattedTitle = `${suburb.replace(/\s+/g, '_')},_${state.replace(/\s+/g, '_')}`;
    
    try {
      const response = await fetch(`${this.baseUrl}${encodeURIComponent(formattedTitle)}`, {
        headers: {
          'User-Agent': 'AeternisOdyssey/1.0 (https://github.com/thomasrobertgee/aeternis-v5; thomasrobertgee@gmail.com)',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        // If "Suburb, State" fails, try just "Suburb"
        if (response.status === 404) {
          return this.getGeneralSummary(suburb);
        }
        console.warn('Wikipedia API error:', response.status);
        return null;
      }

      const data = await response.json();
      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail
      };
    } catch (error) {
      console.error('Failed to fetch Wikipedia summary:', error);
      return null;
    }
  }

  /**
   * Fallback to fetch a general summary if the specific "Suburb, State" page doesn't exist.
   */
  private async getGeneralSummary(title: string): Promise<WikipediaSummary | null> {
    const formattedTitle = title.replace(/\s+/g, '_');
    try {
      const response = await fetch(`${this.baseUrl}${encodeURIComponent(formattedTitle)}`, {
        headers: {
          'User-Agent': 'AeternisOdyssey/1.0',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail
      };
    } catch (error) {
      return null;
    }
  }
}

export default WikipediaService.getInstance();
