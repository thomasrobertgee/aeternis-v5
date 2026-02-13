import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapPressEvent, Marker, Circle } from 'react-native-maps';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useCombatStore } from '../../utils/useCombatStore';
import { geocodeCity, reverseGeocode } from '../../utils/GeoService';
import { getBiomeFromKeyword, getFactionForZone, BiomeType, FactionType } from '../../utils/BiomeMapper';
import { getProceduralZone, generateAtmosphericIntro } from '../../utils/ProceduralEngine';
import { getDeterministicEnemy, getBossByBiome } from '../../utils/EnemyFactory';
import { getWeatherForSuburb, WEATHER_EFFECTS } from '../../utils/WorldStateManager';
import ZoneCard from '../../components/ZoneCard';
import NarrativeView from '../../components/NarrativeView';
import QuestTracker from '../../components/QuestTracker';
import DialogueView from '../../components/DialogueView';
import enrollmentDialogue from '../../assets/dialogue/faction_enrollment.json';
import specializationDialogue from '../../assets/dialogue/specialization_choice.json';
import { Coffee, ShieldCheck, Home, Activity, Radar, Skull, Flame, Package } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { getDistance } from '../../utils/MathUtils';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const {
    playerLocation,
    setPlayerLocation,
    discoverZone,
    rest,
    hasSetHomeCity,
    homeCityName,
    setHomeCity,
    sanctuaryLocation,
    enrolledFaction,
    specialization,
    level,
    hostileSignals,
    setHostileSignals,
    resourceNodes,
    setResourceNodes,
    harvestNode,
    respawnSignals,
    triggerRift
  } = usePlayerStore();

  const { initiateCombat } = useCombatStore();

  const [currentSuburb, setCurrentSuburb] = useState<string>("");
  const [isInEncounter, setIsInEncounter] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const [cityInput, setCityInput] = useState("");
  const [isSettingHome, setIsSettingHome] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: playerLocation.latitude,
    longitude: playerLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const BASE_HIT_RADIUS = 0.2; // 200 meters
  const ZOOM_THRESHOLD = 0.12; // Hide entities when zoomed out past this

  // Radar Pulse Animation
  const pulseScale = useSharedValue(0);
  const pulseOpacity = useSharedValue(0);

  const triggerRadarPulse = () => {
    pulseScale.value = 0;
    pulseOpacity.value = 0.6;
    pulseScale.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) });
    pulseOpacity.value = withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) });
  };

  // Background Respawn Tick
  useEffect(() => {
    const interval = setInterval(() => {
      respawnSignals();
    }, 10000);
    return () => clearInterval(interval);
  }, [respawnSignals]);

  // Force markers to redraw once after mount to prevent clipping on Android
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Check for Level-based Story Events
  useEffect(() => {
    if (hasSetHomeCity) {
      if (level >= 5 && !enrolledFaction) {
        setActiveDialogue(enrollmentDialogue);
      } else if (level >= 10 && !specialization) {
        setActiveDialogue(specializationDialogue);
      }
    }
  }, [level, enrolledFaction, specialization, hasSetHomeCity]);

  useEffect(() => {
    const resolveCurrentSuburb = async () => {
      if (!hasSetHomeCity) return;
      try {
        const result = await reverseGeocode(playerLocation);
        if (result) {
          setCurrentSuburb(result.suburb);
        }
      } catch (e) {
        console.error("Failed to resolve current suburb", e);
      }
    };
    resolveCurrentSuburb();
  }, [playerLocation, hasSetHomeCity]);

  const isSafeZone = useMemo(() => {
    if (!currentSuburb || !homeCityName) return false;
    return currentSuburb.toLowerCase().includes(homeCityName.toLowerCase()) ||
           homeCityName.toLowerCase().includes(currentSuburb.toLowerCase());
  }, [currentSuburb, homeCityName]);

  useEffect(() => {
    if (hasSetHomeCity && (!hostileSignals || hostileSignals.length === 0)) {
      handleScanArea();
    }
  }, [hasSetHomeCity, playerLocation, hostileSignals?.length]);

  const handleScanArea = () => {
    triggerRadarPulse();
    const currentBiome = getBiomeFromKeyword(currentSuburb);
    
    // Generate Hostile Signals
    const signals = Array.from({ length: 5 }).map((_, i) => ({
      id: `hostile-${i}-${Date.now()}`,
      biome: currentBiome,
      coords: {
        latitude: playerLocation.latitude + (Math.random() - 0.5) * 0.03,
        longitude: playerLocation.longitude + (Math.random() - 0.5) * 0.03,
      }
    }));
    setHostileSignals(signals);

    // Generate Resource Nodes
    const materials = ['Pure Silicon', 'Chrono-Steel', 'Bio-Fiber', 'Void-Glass'];
    const nodes = Array.from({ length: 3 }).map((_, i) => ({
      id: `node-${i}-${Date.now()}`,
      coords: {
        latitude: playerLocation.latitude + (Math.random() - 0.5) * 0.02,
        longitude: playerLocation.longitude + (Math.random() - 0.5) * 0.02,
      },
      materialName: materials[Math.floor(Math.random() * materials.length)],
      amount: 5 + Math.floor(Math.random() * 10),
      isHarvested: false
    }));
    setResourceNodes(nodes);
  };

  const handleTriggerRift = () => {
    triggerRadarPulse();
    const currentBiome = getBiomeFromKeyword(currentSuburb);
    const riftCoords = {
      latitude: playerLocation.latitude + (Math.random() - 0.5) * 0.015,
      longitude: playerLocation.longitude + (Math.random() - 0.5) * 0.015,
    };
    triggerRift(riftCoords, currentBiome);
  };

  const [selectedZone, setSelectedZone] = useState<{
    suburb: string;
    biome: BiomeType;
    faction: FactionType;
    description: string;
    coords: { latitude: number; longitude: number };
    isHostile: boolean;
    isBoss?: boolean;
    isResourceNode?: boolean;
    resourceData?: { id: string; materialName: string; amount: number; distance: number };
    signalId?: string;
  } | null>(null);

  const factionColors = useMemo(() => {
    if (enrolledFaction === 'the-cogwheel') {
      return { fill: 'rgba(245, 158, 11, 0.15)', stroke: 'rgba(245, 158, 11, 0.5)' };
    }
    if (enrolledFaction === 'the-verdant') {
      return { fill: 'rgba(16, 185, 129, 0.15)', stroke: 'rgba(16, 185, 129, 0.5)' };
    }
    return { fill: 'rgba(6, 182, 212, 0.1)', stroke: 'rgba(6, 182, 212, 0.3)' };
  }, [enrolledFaction]);

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
      alert("Could not find that city. The Imaginum is unstable.");
    }
    setIsSettingHome(false);
  };

  const handleMapPress = async (event: MapPressEvent) => {
    if (isGeocoding) return;
    const coords = event.nativeEvent.coordinate;

    const zoomScale = Math.max(1, mapRegion.latitudeDelta / 0.05);
    const hitRadius = BASE_HIT_RADIUS * zoomScale;

    // --- HIT DETECTION FOR RESOURCE NODES ---
    const clickedNode = (resourceNodes || [])
      .filter(n => !n.isHarvested)
      .find(n => getDistance(coords, n.coords) < hitRadius);

    if (clickedNode) {
      const dist = getDistance(playerLocation, clickedNode.coords);
      setSelectedZone({
        suburb: "Resource Node",
        biome: BiomeType.SHATTERED_SUBURBIA,
        faction: FactionType.IRON_CONSORTIUM,
        description: `A stable cluster of ${clickedNode.materialName} has manifested here. You must be within 50m to harvest.`,
        coords: clickedNode.coords,
        isHostile: false,
        isResourceNode: true,
        resourceData: {
          id: clickedNode.id,
          materialName: clickedNode.materialName,
          amount: clickedNode.amount,
          distance: dist * 1000 // Convert to meters
        }
      });
      return;
    }

    // --- HIT DETECTION FOR HOSTILE SIGNALS ---
    const clickedSignal = (hostileSignals || [])
      .filter(s => !s.respawnAt)
      .find(s => getDistance(coords, s.coords) < hitRadius);

    if (clickedSignal) {
      setIsGeocoding(true);
      const isBoss = clickedSignal.type === 'Boss';
      const suburb = isBoss ? "FRACTURE RIFT" : "Hostile Sector";
      const description = isBoss
        ? "Warning: Massive gravitational distortion. A Sovereign entity has crossed over."
        : "Extreme Imaginum turbulence detected. Combat synchronization required.";

      setSelectedZone({
        suburb,
        biome: clickedSignal.biome,
        faction: FactionType.IRON_CONSORTIUM,
        description,
        coords: clickedSignal.coords,
        isHostile: true,
        isBoss,
        signalId: clickedSignal.id
      });
      setIsGeocoding(false);
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await reverseGeocode(coords);
      if (result) {
        const suburb = result.suburb;
        const proceduralData = getProceduralZone(suburb);
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
          coords,
          isHostile: false
        });
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleEnterAction = async () => {
    if (!selectedZone) return;

    if (selectedZone.isResourceNode && selectedZone.resourceData) {
      if (selectedZone.resourceData.distance <= 50) {
        harvestNode(selectedZone.resourceData.id);
        setSelectedZone(null);
        alert(`Harvested ${selectedZone.resourceData.amount} ${selectedZone.resourceData.materialName}!`);
      } else {
        alert("Too far away. Target must be within 50m.");
      }
      return;
    }

    if (selectedZone.isHostile) {
      const enemy = selectedZone.isBoss
        ? getBossByBiome(selectedZone.biome)
        : getDeterministicEnemy(selectedZone.signalId || "generic", selectedZone.biome);

      const weather = getWeatherForSuburb(currentSuburb || "Static Sector");
      const modifier = WEATHER_EFFECTS[weather].damageModifier;

      initiateCombat(enemy.name, enemy.maxHp, usePlayerStore.getState().hp, usePlayerStore.getState().mana, selectedZone.signalId, modifier);
      router.push('/battle');
      setSelectedZone(null);
    } else {
      discoverZone(selectedZone.suburb);
      setIsInEncounter(true);
    }
  };

  const handleFastTravel = () => {
    if (!selectedZone) return;
    setPlayerLocation(selectedZone.coords);
    mapRef.current?.animateToRegion({
      ...selectedZone.coords,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 1000);
    setSelectedZone(null);
  };

  if (activeDialogue) {
    return (
      <DialogueView 
        dialogueData={activeDialogue} 
        onExit={() => setActiveDialogue(null)} 
      />
    );
  }

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

      <View className="absolute top-16 right-6 z-50 flex-col gap-3">
        <TouchableOpacity
          onPress={handleScanArea}
          className="bg-red-950/60 border border-red-500/40 p-3 rounded-2xl flex-row items-center shadow-lg"
        >
          <Radar size={16} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest">Scan Area</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleTriggerRift}
          className="bg-purple-950/60 border border-purple-500/40 p-3 rounded-2xl flex-row items-center shadow-lg"
        >
          <Flame size={16} color="#a855f7" className="mr-2" />
          <Text className="text-purple-400 font-black text-[10px] uppercase tracking-widest">Rift Event</Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={mapRegion}
        onRegionChangeComplete={setMapRegion}
        customMapStyle={fantasyMapStyle}
        onPress={handleMapPress}
      >
        <Circle 
          center={playerLocation}
          radius={pulseScale.value * 5000}
          fillColor={`rgba(6, 182, 212, ${pulseOpacity.value * 0.2})`}
          strokeColor={`rgba(6, 182, 212, ${pulseOpacity.value})`}
          strokeWidth={2}
          zIndex={2}
        />

        {hasSetHomeCity && sanctuaryLocation && (
          <Circle
            center={sanctuaryLocation}
            radius={2000}
            fillColor={factionColors.fill}
            strokeColor={factionColors.stroke}
            strokeWidth={2}
            zIndex={1}
          />
        )}

        <Marker
          coordinate={playerLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={10}
          tracksViewChanges={tracksViewChanges}
        >
          <View style={markerStyles.container}>
            <View className="w-10 h-10 bg-cyan-500/20 rounded-full items-center justify-center border-2 border-cyan-400">
               <View className="w-4 h-4 bg-cyan-400 rounded-full" />
            </View>
            <View className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 mt-1">
               <Text className="text-cyan-400 text-[8px] font-bold uppercase">Traveller</Text>
            </View>
          </View>
        </Marker>

        {/* Resource Nodes */}
        {(resourceNodes || []).filter(n => !n.isHarvested).map((node) => {
          if (mapRegion.latitudeDelta >= ZOOM_THRESHOLD) return null;
          return (
            <React.Fragment key={node.id}>
              <Marker
                coordinate={node.coords}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={15}
                tracksViewChanges={tracksViewChanges}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMapPress({ nativeEvent: { coordinate: node.coords } } as any);
                }}
              >
                <View style={markerStyles.container}>
                  <View className="w-10 h-10 bg-emerald-500/20 rounded-full items-center justify-center border-2 border-emerald-500/40 shadow-lg shadow-emerald-500">
                     <Package size={20} color="#10b981" />
                  </View>
                  <View className="bg-zinc-900 px-1.5 py-0.5 rounded border border-emerald-900/30 mt-1">
                     <Text className="text-emerald-500 text-[6px] font-bold uppercase tracking-widest">Resource</Text>
                  </View>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {(hostileSignals || []).filter(s => !s.respawnAt).map((signal) => {
          const isBoss = signal.type === 'Boss';
          const isZoomedIn = mapRegion.latitudeDelta < ZOOM_THRESHOLD;

          if (!isZoomedIn && !isBoss) return null; // Always show bosses, hide standard signals when zoomed out

          return (
            <React.Fragment key={signal.id}>
              <Marker
                coordinate={signal.coords}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={isBoss ? 30 : 20}
                tracksViewChanges={tracksViewChanges}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMapPress({ nativeEvent: { coordinate: signal.coords } } as any);
                }}
              >
                <View style={markerStyles.container}>
                  <View className={`w-10 h-10 rounded-full items-center justify-center border-2 ${
                    isBoss ? 'bg-purple-500/20 border-purple-500' : 'bg-red-500/20 border-red-500/40'
                  }`}>
                     {isBoss ? <Skull size={24} color="#a855f7" /> : <Activity size={20} color="#ef4444" />}
                  </View>
                  <View className={`bg-zinc-900 px-1.5 py-0.5 rounded border mt-1 ${
                    isBoss ? 'border-purple-900/50' : 'border-red-900/30'
                  }`}>
                     <Text className={`${isBoss ? 'text-purple-400' : 'text-red-500'} text-[6px] font-bold uppercase tracking-widest`}>
                       {isBoss ? 'FRACTURE RIFT' : 'Hostile Signal'}
                     </Text>
                  </View>
                </View>
              </Marker>

              <Circle
                center={signal.coords}
                radius={BASE_HIT_RADIUS * 1000 * Math.max(1, mapRegion.latitudeDelta / 0.05)}
                fillColor={isBoss ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 0, 0.1)'}
                strokeColor={isBoss ? '#a855f7' : 'yellow'}
                strokeWidth={isBoss ? 3 : 2}
                zIndex={5}
              />
            </React.Fragment>
          );
        })}
      </MapView>

      {selectedZone && (
        <ZoneCard
          suburb={selectedZone.suburb}
          loreName={
            selectedZone.isResourceNode ? selectedZone.resourceData?.materialName || "RESOURCE" :
            selectedZone.isBoss ? "CRITICAL ANOMALY" : 
            getProceduralZone(selectedZone.suburb).loreName
          }
          description={selectedZone.description}
          isHostile={selectedZone.isHostile}
          isResourceNode={selectedZone.isResourceNode}
          resourceData={selectedZone.resourceData}
          onClose={() => setSelectedZone(null)}
          onExplore={handleEnterAction}
          onFastTravel={handleFastTravel}
        />
      )}

      {isGeocoding && (
        <View className="absolute top-1/2 left-1/2 -ml-8 -mt-8 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
          <ActivityIndicator color="#06b6d4" />
        </View>
      )}

      {isSafeZone && (
        <Animated.View entering={SlideInDown.delay(500)} className="absolute top-32 left-6 right-6 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-3xl flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-emerald-500 p-2 rounded-xl mr-3"><Home size={18} color="#064e3b" /></View>
            <View>
              <Text className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Safe Zone</Text>
              <Text className="text-white font-bold">{homeCityName} Sanctuary</Text>
            </View>
          </View>
          <TouchableOpacity onPress={rest} className="bg-emerald-500 px-4 py-2 rounded-xl flex-row items-center">
            <Coffee size={14} color="#064e3b" className="mr-2" />
            <Text className="text-emerald-950 font-black text-[10px] uppercase">Rest</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {!hasSetHomeCity && (
        <View style={StyleSheet.absoluteFill} className="bg-black/90 items-center justify-center p-8 z-[100]">
          <Animated.View entering={FadeIn.duration(1000)} className="w-full">
            <View className="items-center mb-8">
              <View className="bg-cyan-500/10 p-6 rounded-full border border-cyan-500/20 mb-6"><ShieldCheck size={64} color="#06b6d4" /></View>
              <Text className="text-white text-3xl font-black text-center mb-2">Initialize Synchronization</Text>
              <Text className="text-zinc-500 text-center px-4">The Imaginum requires an anchor. Select your home city.</Text>
            </View>
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
              <TextInput value={cityInput} onChangeText={setCityInput} placeholder="e.g. Melbourne..." placeholderTextColor="#3f3f46" className="bg-zinc-950 border border-zinc-800 h-14 rounded-2xl px-5 text-white font-bold text-lg" />
            </View>
            <TouchableOpacity onPress={handleSetHome} disabled={isSettingHome || !cityInput.trim()} className={`h-16 rounded-2xl items-center justify-center ${cityInput.trim() ? 'bg-cyan-600' : 'bg-zinc-800 opacity-50'}`}>
              {isSettingHome ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-sm uppercase tracking-[4px]">Establish Anchor</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const markerStyles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  }
});

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
