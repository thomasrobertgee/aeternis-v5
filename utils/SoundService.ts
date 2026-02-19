import { Audio } from 'expo-av';
import { usePlayerStore } from './usePlayerStore';

const AMBIENT_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; // Placeholder low drone
const BATTLE_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'; // Placeholder tense track

class SoundService {
  private static instance: SoundService;
  private ambientSound: Audio.Sound | null = null;
  private battleSound: Audio.Sound | null = null;

  private constructor() {}

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  public async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize Audio Mode', error);
    }
  }

  public async playAmbient() {
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
  }

  public async playBattle() {
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
  }

  public async playCrit() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }, // Placeholder SFX
        { shouldPlay: true, volume: 1.0 }
      );
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play crit SFX', error);
    }
  }

  public async playScan() {
    const isEnabled = usePlayerStore.getState().settings.musicEnabled;
    if (!isEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://github.com/rafaelrinaldi/sonar/raw/master/sonar.mp3' }, // Reliable Sonar SFX
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
  }

  public async stopAll() {
    if (this.ambientSound) await this.ambientSound.stopAsync();
    if (this.battleSound) await this.battleSound.stopAsync();
  }
}

export default SoundService.getInstance();
