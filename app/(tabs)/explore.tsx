import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator, DevSettings } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapPressEvent, Marker, Circle, Polygon } from 'react-native-maps';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useCombatStore } from '../../utils/useCombatStore';
import { geocodeCity, reverseGeocode } from '../../utils/GeoService';
import { getBiomeFromKeyword, getFactionForZone, BiomeType, FactionType } from '../../utils/BiomeMapper';
import { getProceduralZone, generateAtmosphericIntro } from '../../utils/ProceduralEngine';
import { getDeterministicEnemy, getBossByBiome } from '../../utils/EnemyFactory';
import { getWeatherForSuburb, WEATHER_EFFECTS } from '../../utils/WorldStateManager';
import WikipediaService from '../../utils/WikipediaService';
import ZoneSynthesizer from '../../utils/ZoneSynthesizer';
import ZoneEventManager from '../../utils/ZoneEventManager';
import ZoneCard from '../../components/ZoneCard';
import NarrativeView from '../../components/NarrativeView';
import DiscoveryOverlay from '../../components/DiscoveryOverlay';
import TransitView from '../../components/TransitView';
import QuestTracker from '../../components/QuestTracker';
import DialogueView from '../../components/DialogueView';
import enrollmentDialogue from '../../assets/dialogue/faction_enrollment.json';
import specializationDialogue from '../../assets/dialogue/specialization_choice.json';
import { Coffee, ShieldCheck, Home, Activity, Radar, Skull, Flame, Package, Focus } from 'lucide-react-native';
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
import * as Haptics from 'expo-haptics';
import BoundaryService from '../../utils/BoundaryService';
import { useTravelStore } from '../../utils/useTravelStore';
import { useUIStore } from '../../utils/useUIStore';

const WORLD_BOUNDARY = [
  { latitude: -85, longitude: -180 },
  { latitude: -85, longitude: 180 },
  { latitude: 85, longitude: 180 },
  { latitude: 85, longitude: -180 },
];

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const {
    playerLocation,
    setPlayerLocation,
    rest,
    hasSetHomeCity,
    homeCityName,
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
    triggerRift,
    saveZoneProfile,
    cleanupZones
  } = usePlayerStore();

  const { initiateCombat } = useCombatStore();
  const { isTraveling, travelTimeRemaining, startTravel, tickTravel, completeTravel, destinationCoords, destinationName } = useTravelStore();

  const [currentSuburb, setCurrentSuburb] = useState<string>("");
  const [currentSuburbPolygon, setCurrentSuburbPolygon] = useState<{latitude: number, longitude: number}[] | null>(null);
  const [isInEncounter, setIsInEncounter] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: playerLocation.latitude,
    longitude: playerLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  const handleRecenter = () => {
    mapRef.current?.animateToRegion({
      ...playerLocation,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 1000);
  };

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

  // Travel Ticking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTraveling) {
      interval = setInterval(() => {
        tickTravel();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTraveling]);

  // Travel Completion / Coordinate Shift
  useEffect(() => {
    if (!isTraveling && destinationCoords) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPlayerLocation(destinationCoords);
      const newRegion = { ...destinationCoords, latitudeDelta: 0.02, longitudeDelta: 0.02 };
      mapRef.current?.animateToRegion(newRegion, 1500);
      handleRegionChange(newRegion);
      completeTravel();
    }
  }, [isTraveling, destinationCoords]);

  // Force markers to redraw once after mount to prevent clipping on Android
  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Initial Suburb Resolution on Mount
  useEffect(() => {
    if (hasSetHomeCity && playerLocation) {
      handleRegionChange({
        latitude: playerLocation.latitude,
        longitude: playerLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      const zoomTimer = setTimeout(() => {
        handleRecenter();
      }, 1000);
      return () => clearTimeout(zoomTimer);
    }
  }, [hasSetHomeCity]);

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

  const handleRegionChange = async (region: any) => {
    setMapRegion(region);
    if (!hasSetHomeCity) return;
    const coords = { latitude: region.latitude, longitude: region.longitude };
    let resolvedName = BoundaryService.getSuburbAtPoint(coords);
    if (!resolvedName) {
      try {
        const result = await reverseGeocode(coords);
        if (result) resolvedName = result.suburb;
      } catch (e) {
        console.error("Geocoding failed during region change", e);
      }
    }
    if (resolvedName) {
      setCurrentSuburb(resolvedName);
      const feature = BoundaryService.getSuburbFeature(resolvedName);
      if (feature && feature.geometry) {
        if (feature.geometry.type === 'Polygon') {
          setCurrentSuburbPolygon(feature.geometry.coordinates[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] })));
        } else if (feature.geometry.type === 'MultiPolygon') {
          setCurrentSuburbPolygon(feature.geometry.coordinates[0][0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] })));
        }
      } else {
        setCurrentSuburbPolygon(null);
      }
    }
  };

  const isSafeZone = useMemo(() => {
    if (!currentSuburb || !homeCityName) return false;
    return currentSuburb.toLowerCase().includes(homeCityName.toLowerCase()) ||
           homeCityName.toLowerCase().includes(currentSuburb.toLowerCase());
  }, [currentSuburb, homeCityName]);

  const homeCityHoles = useMemo(() => {
    if (!homeCityName) return [];
    const feature = BoundaryService.getSuburbFeature(homeCityName);
    if (!feature || !feature.geometry) return [];
    if (feature.geometry.type === 'Polygon') {
      return [feature.geometry.coordinates[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))];
    }
    if (feature.geometry.type === 'MultiPolygon') {
      return feature.geometry.coordinates.map((poly: any) => poly[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] })));
    }
    return [];
  }, [homeCityName]);

  const biomeColors = useMemo(() => {
    return { fill: 'rgba(212, 212, 216, 0.25)', stroke: 'rgba(161, 161, 170, 0.6)' };
  }, []);

  useEffect(() => {
    if (hasSetHomeCity && (!hostileSignals || hostileSignals.length === 0)) {
      handleScanArea();
    }
  }, [hasSetHomeCity, playerLocation, hostileSignals?.length]);

  const handleScanArea = () => {
    triggerRadarPulse();
    const currentBiome = getBiomeFromKeyword(currentSuburb);
    const feature = BoundaryService.getSuburbFeature(currentSuburb);
    const polygon = feature?.geometry?.type === 'Polygon' ? feature.geometry.coordinates[0] : 
                    feature?.geometry?.type === 'MultiPolygon' ? feature.geometry.coordinates[0][0] : null;

    const findPointInZone = (base: any, radius: number) => {
      if (!polygon) return { latitude: base.latitude + (Math.random() - 0.5) * radius, longitude: base.longitude + (Math.random() - 0.5) * radius };
      for (let i = 0; i < 10; i++) {
        const pt = { latitude: base.latitude + (Math.random() - 0.5) * (radius * 2), longitude: base.longitude + (Math.random() - 0.5) * (radius * 2) };
        if (BoundaryService.isPointInPolygon(pt, polygon)) return pt;
      }
      return { latitude: base.latitude + (Math.random() - 0.5) * 0.005, longitude: base.longitude + (Math.random() - 0.5) * 0.005 };
    };

    setHostileSignals(Array.from({ length: 5 }).map((_, i) => ({ id: `hostile-${i}-${Date.now()}`, biome: currentBiome, coords: findPointInZone(playerLocation, 0.03) })));
    const materials = ['Pure Silicon', 'Chrono-Steel', 'Bio-Fiber', 'Void-Glass'];
    setResourceNodes(Array.from({ length: 3 }).map((_, i) => ({ id: `node-${i}-${Date.now()}`, coords: findPointInZone(playerLocation, 0.02), materialName: materials[Math.floor(Math.random() * materials.length)], amount: 5 + Math.floor(Math.random() * 10), isHarvested: false })));
  };

  const handleTriggerRift = () => {
    triggerRadarPulse();
    const currentBiome = getBiomeFromKeyword(currentSuburb);
    triggerRift({ latitude: playerLocation.latitude + (Math.random() - 0.5) * 0.015, longitude: playerLocation.longitude + (Math.random() - 0.5) * 0.015 }, currentBiome);
  };

  const [selectedZone, setSelectedZone] = useState<{ suburb: string; biome: BiomeType; faction: FactionType; description: string; coords: { latitude: number; longitude: number }; isHostile: boolean; isBoss?: boolean; isResourceNode?: boolean; resourceData?: { id: string; materialName: string; amount: number; distance: number }; signalId?: string; } | null>(null);

  const handleMapPress = async (event: MapPressEvent) => {
    if (isGeocoding) return;
    const coords = event.nativeEvent.coordinate;
    const zoomScale = Math.max(1, mapRegion.latitudeDelta / 0.05);
    const hitRadius = BASE_HIT_RADIUS * zoomScale;
    const clickedNode = (resourceNodes || []).filter(n => !n.isHarvested).find(n => getDistance(coords, n.coords) < hitRadius);
    if (clickedNode) {
      setSelectedZone({ suburb: "Resource Node", biome: BiomeType.SHATTERED_SUBURBIA, faction: FactionType.IRON_CONSORTIUM, description: `A stable cluster of ${clickedNode.materialName} has manifested here. You must be within 50m to harvest.`, coords: clickedNode.coords, isHostile: false, isResourceNode: true, resourceData: { id: clickedNode.id, materialName: clickedNode.materialName, amount: clickedNode.amount, distance: getDistance(playerLocation, clickedNode.coords) * 1000 } });
      return;
    }
    const clickedSignal = (hostileSignals || []).filter(s => !s.respawnAt).find(s => getDistance(coords, s.coords) < hitRadius);
    if (clickedSignal) {
      setIsGeocoding(true);
      const isBoss = clickedSignal.type === 'Boss';
      setSelectedZone({ suburb: isBoss ? "FRACTURE RIFT" : "Hostile Sector", biome: clickedSignal.biome, faction: FactionType.IRON_CONSORTIUM, description: isBoss ? "Warning: Sovereign entity crossing over." : "Imaginum turbulence detected.", coords: clickedSignal.coords, isHostile: true, isBoss, signalId: clickedSignal.id });
      setIsGeocoding(false);
      return;
    }
    setIsGeocoding(true);
    try {
      const result = await reverseGeocode(coords);
      if (result) {
        const suburb = result.suburb;
        const proc = getProceduralZone(suburb);
        let biome: BiomeType;
        switch (proc.category) {
          case 'Industrial': biome = BiomeType.RUST_FIELDS; break;
          case 'Coastal': biome = BiomeType.MISTY_WHARFS; break;
          case 'Urban': biome = BiomeType.SILICON_SPIRES; break;
          default: biome = BiomeType.SHATTERED_SUBURBIA;
        }
        setSelectedZone({ suburb, biome, faction: getFactionForZone(suburb), description: generateAtmosphericIntro(suburb, proc.category), coords, isHostile: false });
      }
    } catch (error) { console.error("Geocoding failed:", error); } finally { setIsGeocoding(false); }
  };

  const handleEnterAction = async () => {
    if (!selectedZone) return;
    if (selectedZone.isResourceNode && selectedZone.resourceData) {
      if (selectedZone.resourceData.distance <= 50) { harvestNode(selectedZone.resourceData.id); setSelectedZone(null); alert(`Harvested ${selectedZone.resourceData.amount} ${selectedZone.resourceData.materialName}!`); }
      else { alert("Too far away. Target must be within 50m."); }
      return;
    }
    if (selectedZone.isHostile) {
      const enemy = selectedZone.isBoss ? getBossByBiome(selectedZone.biome) : getDeterministicEnemy(selectedZone.signalId || "generic", selectedZone.biome);
      initiateCombat(enemy.name, enemy.maxHp, usePlayerStore.getState().hp, usePlayerStore.getState().mana, selectedZone.signalId, 1.0, selectedZone.biome);
      router.push('/battle');
      setSelectedZone(null);
    } else {
      const { discoveredZones } = usePlayerStore.getState();
      if (!discoveredZones[selectedZone.suburb]) {
        setIsGeocoding(true);
        const wikiData = await WikipediaService.getSuburbSummary(selectedZone.suburb);
        const fallback = "The Imaginum is unusually dense here.";
        const finalSummary = wikiData?.extract || selectedZone.description || fallback;
        const synthesis = ZoneSynthesizer.synthesize(finalSummary);
        saveZoneProfile({ suburb: selectedZone.suburb, biome: selectedZone.biome, faction: synthesis.dominantFaction, synthesis: synthesis, npc: synthesis.npc, wikiSummary: finalSummary, discoveryDate: Date.now() });
        setIsGeocoding(false);
        setShowDiscovery(true);
      }
      setIsInEncounter(true);
      const event = ZoneEventManager.triggerRoll(selectedZone.suburb, selectedZone.biome);
      if (event) { ZoneEventManager.addEvent(event); useUIStore.getState().setWorldEvent(event); }
      else { useUIStore.getState().setWorldEvent(null); }
    }
  };

  if (activeDialogue) return <DialogueView dialogueData={activeDialogue} onExit={() => setActiveDialogue(null)} />;
  if (isInEncounter && selectedZone) {
    const proc = getProceduralZone(selectedZone.suburb);
    const profile = usePlayerStore.getState().discoveredZones[selectedZone.suburb];
    return <NarrativeView suburb={selectedZone.suburb} loreName={proc.loreName} category={proc.category} biome={selectedZone.biome} description={selectedZone.description} profile={profile} onExit={() => setIsInEncounter(false)} />;
  }

  return (
    <View className="flex-1 bg-zinc-950">
      <TransitView />
      {showDiscovery && selectedZone && <DiscoveryOverlay suburb={selectedZone.suburb} fracturedTitle={getProceduralZone(selectedZone.suburb).loreName} onComplete={() => setShowDiscovery(false)} />}
      <QuestTracker />
      <View className="absolute top-32 right-6 z-50 flex-col gap-3">
        <TouchableOpacity onPress={handleScanArea} className="bg-red-950/60 border border-red-500/40 p-3 rounded-2xl flex-row items-center shadow-lg"><Radar size={16} color="#ef4444" className="mr-2" /><Text className="text-red-500 font-black text-[10px] uppercase tracking-widest">Scan Area</Text></TouchableOpacity>
        <TouchableOpacity onPress={handleTriggerRift} className="bg-purple-950/60 border border-purple-500/40 p-3 rounded-2xl flex-row items-center shadow-lg"><Flame size={16} color="#a855f7" className="mr-2" /><Text className="text-purple-400 font-black text-[10px] uppercase tracking-widest">Rift Event</Text></TouchableOpacity>
      </View>
      <View className="absolute bottom-32 right-6 z-50"><TouchableOpacity onPress={handleRecenter} className="bg-zinc-900/80 border border-zinc-700 w-12 h-12 rounded-2xl items-center justify-center shadow-lg"><Focus size={20} color="#e4e4e7" /></TouchableOpacity></View>
      <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={StyleSheet.absoluteFillObject} initialRegion={{ latitude: playerLocation.latitude, longitude: playerLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }} onRegionChangeComplete={handleRegionChange} customMapStyle={fantasyMapStyle} onPress={handleMapPress}>
        {currentSuburbPolygon && <Polygon coordinates={currentSuburbPolygon} fillColor={biomeColors.fill} strokeColor={biomeColors.stroke} strokeWidth={2} zIndex={1} />}
        {level < 10 && <Polygon coordinates={WORLD_BOUNDARY} holes={homeCityHoles} fillColor="rgba(0, 0, 0, 0.7)" strokeColor="transparent" strokeWidth={0} tappable={false} zIndex={2} />}
        <Circle center={playerLocation} radius={50} fillColor={`rgba(6, 182, 212, ${pulseOpacity.value * 0.2})`} strokeColor={`rgba(6, 182, 212, ${pulseOpacity.value})`} strokeWidth={2} zIndex={2} />
        <Marker coordinate={playerLocation} anchor={{ x: 0.5, y: 0.5 }} zIndex={50} tracksViewChanges={tracksViewChanges}><View style={markerStyles.container}><View className="w-5 h-5 bg-cyan-500/20 rounded-full items-center justify-center border-2 border-cyan-400"><View className="w-2 h-2 bg-cyan-400 rounded-full" /></View></View></Marker>
        {(resourceNodes || []).filter(n => !n.isHarvested).map((node) => { if (mapRegion.latitudeDelta >= ZOOM_THRESHOLD) return null; return ( <React.Fragment key={node.id}><Marker coordinate={node.coords} anchor={{ x: 0.5, y: 0.5 }} zIndex={15} tracksViewChanges={tracksViewChanges} onPress={(e) => { e.stopPropagation(); handleMapPress({ nativeEvent: { coordinate: node.coords } } as any); }}><View style={markerStyles.container}><View className="w-5 h-5 bg-emerald-500/20 rounded-full items-center justify-center border-2 border-emerald-500/40 shadow-lg shadow-emerald-500"><Package size={10} color="#10b981" /></View></View></Marker></React.Fragment> ); })}
        {(hostileSignals || []).filter(s => !s.respawnAt).map((signal) => { const isBoss = signal.type === 'Boss'; const isZoomedIn = mapRegion.latitudeDelta < ZOOM_THRESHOLD; if (!isZoomedIn && !isBoss) return null; return ( <React.Fragment key={signal.id}><Marker coordinate={signal.coords} anchor={{ x: 0.5, y: 0.5 }} zIndex={isBoss ? 30 : 20} tracksViewChanges={tracksViewChanges} onPress={(e) => { e.stopPropagation(); handleMapPress({ nativeEvent: { coordinate: signal.coords } } as any); }}><View style={markerStyles.container}><View className={`w-5 h-5 rounded-full items-center justify-center border-2 ${isBoss ? 'bg-purple-500/20 border-purple-500' : 'bg-red-500/20 border-red-500/40'}`}>{isBoss ? <Skull size={12} color="#a855f7" /> : <Activity size={10} color="#ef4444" />}</View></View></Marker><Circle center={signal.coords} radius={BASE_HIT_RADIUS * 1000 * Math.max(1, mapRegion.latitudeDelta / 0.05)} fillColor={isBoss ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 0, 0.1)'} strokeColor={isBoss ? '#a855f7' : 'yellow'} strokeWidth={isBoss ? 3 : 2} zIndex={5} /></React.Fragment> ); })}
      </MapView>
      {selectedZone && <ZoneCard suburb={selectedZone.suburb} loreName={selectedZone.isResourceNode ? selectedZone.resourceData?.materialName || "RESOURCE" : selectedZone.isBoss ? "CRITICAL ANOMALY" : getProceduralZone(selectedZone.suburb).loreName} description={selectedZone.description} coords={selectedZone.coords} isHostile={selectedZone.isHostile} isResourceNode={selectedZone.isResourceNode} resourceData={selectedZone.resourceData} onClose={() => setSelectedZone(null)} onExplore={handleEnterAction} onFastTravel={(duration) => { startTravel(selectedZone.suburb, selectedZone.coords, duration); setSelectedZone(null); }} />}
      {isGeocoding && <View className="absolute top-1/2 left-1/2 -ml-8 -mt-8 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800"><ActivityIndicator color="#06b6d4" /></View>}
      {isSafeZone && ( <Animated.View entering={SlideInDown.delay(500)} className="absolute bottom-[100px] left-6 right-6 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-3xl flex-row items-center justify-between z-50"><View className="flex-row items-center"><View className="bg-emerald-500 p-2 rounded-xl mr-3"><Home size={18} color="#064e3b" /></View><View><Text className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Safe Zone</Text><Text className="text-white font-bold">{homeCityName} Sanctuary</Text></View></View><TouchableOpacity onPress={rest} className="bg-emerald-500 px-4 py-2 rounded-xl flex-row items-center"><Coffee size={14} color="#064e3b" className="mr-2" /><Text className="text-emerald-950 font-black text-[10px] uppercase">Rest</Text></TouchableOpacity></Animated.View> )}
    </View>
  );
}

const markerStyles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
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
