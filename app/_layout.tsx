import "../global.css";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
