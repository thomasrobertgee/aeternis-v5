import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapPressEvent, Marker } from 'react-native-maps';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { geocodeCity, reverseGeocode } from '../../utils/GeoService';
import { getBiomeFromKeyword, getFactionForZone, BiomeType, FactionType } from '../../utils/BiomeMapper';
import { getProceduralZone, generateAtmosphericIntro } from '../../utils/ProceduralEngine';
import { generateZoneDescription } from '../../utils/ScenarioEngine';
import ZoneCard from '../../components/ZoneCard';
import NarrativeView from '../../components/NarrativeView';
import QuestTracker from '../../components/QuestTracker';
import { Coffee, ShieldCheck, Home } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const ALTONA_NORTH_COORDS = {
  latitude: -37.8286,
  longitude: 144.8475,
};

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const { playerLocation, setPlayerLocation, discoveredZones, discoverZone, rest, hasSetHomeCity, homeCityName, setHomeCity } = usePlayerStore();
  const [currentSuburb, setCurrentSuburb] = useState<string>("");
  const [isInEncounter, setIsInEncounter] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [isSettingHome, setIsSettingHome] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{
    suburb: string;
    biome: BiomeType;
    faction: FactionType;
    description: string;
    coords: { latitude: number; longitude: number };
  } | null>(null);

  useEffect(() => {
    const resolveCurrentSuburb = async () => {
      try {
        const result = await reverseGeocode(playerLocation);
        if (result) {
          setCurrentSuburb(result.suburb);
        }
      } catch (e) {
        console.error("Failed to resolve current suburb", e);
      }
    };
    if (hasSetHomeCity) {
      resolveCurrentSuburb();
    }
  }, [playerLocation, hasSetHomeCity]);

  const isSafeZone = currentSuburb === homeCityName || currentSuburb.includes(homeCityName);

  const handleSetHome = async () => {
    if (!cityInput.trim()) return;
    setIsSettingHome(true);
    const coords = await geocodeCity(cityInput);
    if (coords) {
      setHomeCity(cityInput, coords);
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    } else {
      alert("Could not find that city. Please try another.");
    }
    setIsSettingHome(false);
  };

  const handleMapPress = async (event: MapPressEvent) => {
    const coords = event.nativeEvent.coordinate;
    
    try {
      const result = await reverseGeocode(coords);

      if (result) {
        const suburb = result.suburb;
        
        // Use the new ProceduralEngine for biome categorization
        const proceduralData = getProceduralZone(suburb);
        
        // Map the category back to the existing BiomeType for UI compatibility
        let biome: BiomeType;
        switch (proceduralData.category) {
          case 'Industrial': biome = BiomeType.RUST_FIELDS; break;
          case 'Coastal': biome = BiomeType.MISTY_WHARFS; break;
          case 'Urban': biome = BiomeType.SILICON_SPIRES; break;
          default: biome = BiomeType.SHATTERED_SUBURBIA;
        }

        const faction = getFactionForZone(suburb);
        const description = generateAtmosphericIntro(suburb, proceduralData.category);
        
        setSelectedZone({
          suburb,
          biome,
          faction,
          description,
          coords
        });
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  const handleEnterZone = async () => {
    if (!selectedZone) return;

    // Save discovery via store
    discoverZone(selectedZone.suburb);
    
    // Switch to Narrative View
    setIsInEncounter(true);
  };

  const handleFastTravel = () => {
    if (!selectedZone) return;

    // Update global state
    setPlayerLocation(selectedZone.coords);

    // Animate Map Camera
    mapRef.current?.animateToRegion({
      ...selectedZone.coords,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 1000);

    // Close card
    setSelectedZone(null);
  };

  if (isInEncounter && selectedZone) {
    const proceduralData = getProceduralZone(selectedZone.suburb);
    return (
      <NarrativeView
        suburb={selectedZone.suburb}
        loreName={proceduralData.loreName}
        category={proceduralData.category}
        biome={selectedZone.biome}
        description={selectedZone.description}
        onExit={() => setIsInEncounter(false)}
      />
    );
  }

  return (
    <View className="flex-1 bg-zinc-950">
      <QuestTracker />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          ...playerLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={fantasyMapStyle}
        onPress={handleMapPress}
      >
        {/* Hero Marker */}
        <Marker 
          coordinate={playerLocation}
          title="The Traveller"
        >
          <View className="items-center justify-center">
            <View className="w-10 h-10 bg-cyan-500/20 rounded-full items-center justify-center border-2 border-cyan-400">
               <View className="w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400" />
            </View>
            <View className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 mt-1">
               <Text className="text-cyan-400 text-[8px] font-bold uppercase tracking-widest">Traveller</Text>
            </View>
          </View>
        </Marker>
      </MapView>

      {selectedZone && (
        <ZoneCard
          suburb={selectedZone.suburb}
          loreName={getProceduralZone(selectedZone.suburb).loreName}
          description={selectedZone.description}
          onClose={() => setSelectedZone(null)}
          onExplore={handleEnterZone}
          onFastTravel={handleFastTravel}
        />
      )}

      {/* Safe Zone / Rest UI */}
      {isSafeZone && (
        <Animated.View 
          entering={SlideInDown.delay(500)}
          className="absolute top-32 left-6 right-6 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-3xl flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="bg-emerald-500 p-2 rounded-xl mr-3">
              <Home size={18} color="#064e3b" />
            </View>
            <View>
              <Text className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Safe Zone</Text>
              <Text className="text-white font-bold">{homeCityName} Sanctuary</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={rest}
            className="bg-emerald-500 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Coffee size={14} color="#064e3b" className="mr-2" />
            <Text className="text-emerald-950 font-black text-[10px] uppercase">Rest</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Initial Home Selection Overlay */}
      {!hasSetHomeCity && (
        <View style={StyleSheet.absoluteFill} className="bg-black/90 items-center justify-center p-8 z-[100]">
          <Animated.View entering={FadeIn.duration(1000)} className="w-full">
            <View className="items-center mb-8">
              <View className="bg-cyan-500/10 p-6 rounded-full border border-cyan-500/20 mb-6">
                <ShieldCheck size={64} color="#06b6d4" />
              </View>
              <Text className="text-white text-3xl font-black text-center mb-2">Initialize Synchronization</Text>
              <Text className="text-zinc-500 text-center leading-5 px-4">
                The Imaginum requires an anchor. Select your home city to stabilize your physical form.
              </Text>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
              <Text className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-3 ml-1">Home City Name</Text>
              <TextInput
                value={cityInput}
                onChangeText={setCityInput}
                placeholder="e.g. Melbourne, London, Tokyo..."
                placeholderTextColor="#3f3f46"
                className="bg-zinc-950 border border-zinc-800 h-14 rounded-2xl px-5 text-white font-bold text-lg"
              />
            </View>

            <TouchableOpacity 
              onPress={handleSetHome}
              disabled={isSettingHome || !cityInput.trim()}
              className={`h-16 rounded-2xl items-center justify-center shadow-lg border-t border-white/10 ${
                cityInput.trim() ? 'bg-cyan-600 shadow-cyan-900/40' : 'bg-zinc-800 opacity-50'
              }`}
            >
              {isSettingHome ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-sm uppercase tracking-[4px]">Establish Anchor</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const fantasyMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] },
  { "elementType": "labels", "stylers": [{ "visibility": "off" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }, { "weight": 1 }] },
  { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] },
  { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#001a33" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#336699" }, { "visibility": "on" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] }
];
