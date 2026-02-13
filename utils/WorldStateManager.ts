/**
 * WorldStateManager.ts
 * Manages global environmental states like dynamic weather.
 */

import { BiomeType } from './BiomeMapper';

export enum WeatherType {
  CLEAR = 'Clear Skies',
  RAINFALL = 'Imaginum Rain',
  WINDY = 'Static Winds',
  STORM = 'Fracture Storm',
  MIST = 'Spectral Mist'
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
    description: 'The Imaginum is stable. No environmental modifiers active.'
  },
  [WeatherType.RAINFALL]: {
    damageModifier: 0.95,
    manaModifier: 1.1,
    description: 'Liquid Imaginum dampens the impact of physical strikes (-5% Damage), but increases mental resonance (+10% Mana recovery potential).'
  },
  [WeatherType.WINDY]: {
    damageModifier: 1.05,
    manaModifier: 0.9,
    description: 'Static winds accelerate kinetic energy (+5% Damage), but make focusing difficult (-10% Mana efficiency).'
  },
  [WeatherType.STORM]: {
    damageModifier: 1.15,
    manaModifier: 1.15,
    description: 'High-intensity fracture discharge. All energy manifestations are amplified (+15% Damage & Mana efficiency).'
  },
  [WeatherType.MIST]: {
    damageModifier: 0.9,
    manaModifier: 1.0,
    description: 'Dense spectral mist obscures targets and softens blows (-10% Damage).'
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
