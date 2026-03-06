import { Audio } from 'expo-av';
import { usePlayerStore } from './usePlayerStore';

const AMBIENT_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder low drone
const BATTLE_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'; // Placeholder tense track

const SoundService = {
  ambientSound: null as Audio.Sound | null,
  battleSound: null as Audio.Sound | null,

  init: async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize Audio Mode', error);
    }
  },

  playAmbient: async function() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) {
      await this.stopAll();
      return;
    }
    try {
      if (this.battleSound) {
        await this.battleSound.stopAsync();
      }
      
      if (!this.ambientSound) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: AMBIENT_URL },
          { shouldPlay: true, isLooping: true, volume: 0.3 }
        );
        this.ambientSound = sound;
      } else {
        await this.ambientSound.playAsync();
      }
    } catch (error) {
      console.error('Failed to play ambient sound', error);
    }
  },

  playBattle: async function() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) {
      await this.stopAll();
      return;
    }
    try {
      if (this.ambientSound) {
        await this.ambientSound.pauseAsync();
      }

      if (!this.battleSound) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: BATTLE_URL },
          { shouldPlay: true, isLooping: true, volume: 0.5 }
        );
        this.battleSound = sound;
      } else {
        await this.battleSound.replayAsync();
      }
    } catch (error) {
      console.error('Failed to play battle sound', error);
    }
  },

  playCrit: async function() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play crit SFX', error);
    }
  },

  playHit: async function() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
        { shouldPlay: true, volume: 0.7 }
      );
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play hit SFX', error);
    }
  },

  playScan: async function() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://github.com/rafaelrinaldi/sonar/raw/master/sonar.mp3' },
        { shouldPlay: true, volume: 0.6 }
      );
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play scan SFX', error);
    }
  },

  stopAll: async function() {
    if (this.ambientSound) await this.ambientSound.stopAsync();
    if (this.battleSound) await this.battleSound.stopAsync();
  }
};

export default SoundService;
