import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PlayerHeader from "../components/PlayerHeader";
import GlobalNotification from "../components/GlobalNotification";
import SaveIndicator from "../components/SaveIndicator";
import SoundService from "../utils/SoundService";

export default function RootLayout() {
  useEffect(() => {
    const initSound = async () => {
      await SoundService.init();
      await SoundService.playAmbient();
    };
    initSound();
  }, []);

  return (
    <SafeAreaProvider>
      <PlayerHeader />
      <GlobalNotification />
      <SaveIndicator />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
