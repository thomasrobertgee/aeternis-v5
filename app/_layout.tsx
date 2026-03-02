import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SoundService from "../utils/SoundService";
import { usePlayerStore } from "../utils/usePlayerStore";

export default function RootLayout() {
  useEffect(() => {
    // Migration/Fix for persisted null notification arrays
    const state = usePlayerStore.getState();
    if (!state.globalNotification || !Array.isArray(state.globalNotification)) {
      usePlayerStore.setState({ globalNotification: [] });
    }
    if (!state.errorNotification || !Array.isArray(state.errorNotification)) {
      usePlayerStore.setState({ errorNotification: [] });
    }

    const initSound = async () => {
      await SoundService.init();
      await SoundService.playAmbient();
    };
    initSound();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
