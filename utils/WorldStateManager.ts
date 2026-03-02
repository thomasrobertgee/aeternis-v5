/**
 * WorldStateManager.ts
 * Manages global environmental states like dynamic weather.
 */

import { BiomeType } from './BiomeMapper';

export enum WeatherType {
  CLEAR = 'Sunny',
  CLOUDY = 'Partly Cloudy',
  RAINFALL = 'Light Rain',
  STORM = 'Thunderstorm',
  MIST = 'Overcast'
}

export interface WeatherEffect {
  damageModifier: number;
  manaModifier: number;
  description: string;
}

export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffect> = {
  [WeatherType.CLEAR]: {
    damageModifier: 1.0,
    manaModifier: 1.0,
    description: 'The Imaginum is stable under the clear sky. No environmental modifiers active.'
  },
  [WeatherType.CLOUDY]: {
    damageModifier: 1.0,
    manaModifier: 1.0,
    description: 'Imaginum density is fluctuating behind the clouds. Stable conditions.'
  },
  [WeatherType.RAINFALL]: {
    damageModifier: 0.95,
    manaModifier: 1.1,
    description: 'Liquid Imaginum falling as rain dampens the impact of physical strikes (-5% Damage), but increases mental resonance (+10% Mana recovery potential).'
  },
  [WeatherType.STORM]: {
    damageModifier: 1.15,
    manaModifier: 1.15,
    description: 'High-intensity fracture discharge during the storm. All energy manifestations are amplified (+15% Damage & Mana efficiency).'
  },
  [WeatherType.MIST]: {
    damageModifier: 0.9,
    manaModifier: 1.0,
    description: 'Dense spectral overcast obscures targets and softens blows (-10% Damage).'
  }
};

/**
 * Deterministically get the weather for a suburb based on its name and current time.
 * This ensures different areas have different weather, but it stays consistent for a while.
 */
export const getWeatherForSuburb = (suburb: string): WeatherType => {
  const hour = new Date().getHours();
  const hash = suburb.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + hour;
  const weathers = Object.values(WeatherType);
  return weathers[hash % weathers.length];
};

/**
 * Deterministically get the temperature for a suburb (in Celsius).
 */
export const getTemperatureForSuburb = (suburb: string): number => {
  const hour = new Date().getHours();
  const hash = suburb.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + hour;
  // Return a temp between 10 and 35 degrees Celsius
  return 10 + (hash % 26);
};
