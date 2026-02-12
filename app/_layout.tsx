import "../global.css";
import { Stack } from "expo-router";
import PlayerHeader from "../components/PlayerHeader";

export default function RootLayout() {
  return (
    <>
      <PlayerHeader />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
