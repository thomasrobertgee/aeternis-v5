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
import { Coffee, ShieldCheck, Home, Activity, Radar, Skull, Flame, Package, Focus, Compass } from 'lucide-react-native';
import Animated, { 
  FadeIn, 
  SlideInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  Easing 
} from 'react-native-reanimated';
import { getDistance } from '../../utils/MathUtils';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useIsFocused } from '@react-navigation/native';
import BoundaryService from '../../utils/BoundaryService';
import { useTravelStore } from '../../utils/useTravelStore';
import { useUIStore } from '../../utils/useUIStore';
import SoundService from '../../utils/SoundService';

const WORLD_BOUNDARY = [{ latitude: -85, longitude: -180 }, { latitude: -85, longitude: 180 }, { latitude: 85, longitude: 180 }, { latitude: 85, longitude: -180 }];

const CHERRY_LAKE_DEPTHS_COORDS = { latitude: -37.8285, longitude: 144.8625 };

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const isFocused = useIsFocused();
  const { playerLocation, setPlayerLocation, rest, hasSetHomeCity, homeCityName, sanctuaryLocation, enrolledFaction, specialization, level, hostileSignals, setHostileSignals, respawnSignals, triggerRift, saveZoneProfile, cleanupZones, tutorialProgress, updateTutorial, tutorialMarker } = usePlayerStore();
  const { initiateCombat } = useCombatStore();
  const { isTraveling, travelTimeRemaining, startTravel, tickTravel, completeTravel, destinationCoords, destinationName, totalTravelDuration } = useTravelStore();
  const [currentSuburb, setCurrentSuburb] = useState<string>("");
  const [currentSuburbPolygon, setCurrentSuburbPolygon] = useState<{latitude: number, longitude: number}[] | null>(null);
  const [isInEncounter, setIsInEncounter] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [mapRegion, setMapRegion] = useState({ latitude: playerLocation.latitude, longitude: playerLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });

  const tutorialPulseScale = useSharedValue(1);
  const tutorialPulseOpacity = useSharedValue(0);
  const sonarScale = useSharedValue(0);
  const sonarOpacity = useSharedValue(0);

  const isTutorialRestricted = tutorialProgress.isTutorialActive === false && (tutorialProgress.currentStep === 6 || tutorialProgress.currentStep === 7 || tutorialProgress.currentStep === 8 || tutorialProgress.currentStep === 22 || tutorialProgress.currentStep === 33 || tutorialProgress.currentStep === 41);

  useEffect(() => {
    if (isTutorialRestricted) {
      tutorialPulseScale.value = withRepeat(
        withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      tutorialPulseOpacity.value = withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );

      if (tutorialMarker && mapRef.current) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates([playerLocation, tutorialMarker.coords], {
            edgePadding: { top: 150, right: 100, bottom: 150, left: 100 },
            animated: true,
          });
        }, 500);
      }
    } else {
      tutorialPulseScale.value = 1;
      tutorialPulseOpacity.value = 0;
    }
  }, [isTutorialRestricted, tutorialMarker]);

  const animatedTutorialPulse = useAnimatedStyle(() => ({
    transform: [{ scale: tutorialPulseScale.value }],
    opacity: tutorialPulseOpacity.value,
  }));

  const animatedSonarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sonarScale.value }],
    opacity: sonarOpacity.value,
    borderWidth: 2 / (sonarScale.value || 1),
  }));

  const handleRecenter = () => { mapRef.current?.animateToRegion({ ...playerLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000); };
  const BASE_HIT_RADIUS = 0.1;
  const ZOOM_THRESHOLD = 0.12;
  const pulseScale = useSharedValue(0);
  const pulseOpacity = useSharedValue(0);

  const triggerRadarPulse = () => {
    pulseScale.value = 0; pulseOpacity.value = 0.6;
    pulseScale.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) });
    pulseOpacity.value = withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) });
    
    // Full screen sonar
    sonarScale.value = 0;
    sonarOpacity.value = 0.8;
    sonarScale.value = withTiming(4, { duration: 2500, easing: Easing.out(Easing.quad) });
    sonarOpacity.value = withTiming(0, { duration: 2500, easing: Easing.out(Easing.quad) });
    SoundService.playScan();
  };

  useEffect(() => { const interval = setInterval(() => { respawnSignals(); }, 10000); return () => clearInterval(interval); }, [respawnSignals]);
  useEffect(() => { let interval: NodeJS.Timeout; if (isTraveling) { interval = setInterval(() => { tickTravel(); }, 1000); } return () => clearInterval(interval); }, [isTraveling]);
  useEffect(() => { 
    if (!isTraveling && destinationCoords) { 
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); 
      setPlayerLocation(destinationCoords); 
      const newRegion = { ...destinationCoords, latitudeDelta: 0.02, longitudeDelta: 0.02 }; 
      mapRef.current?.animateToRegion(newRegion, 1500); 
      handleRegionChange(newRegion); 
      completeTravel(); 

      // Auto-trigger tutorial directly if arriving at the orb
      if (tutorialMarker && 
          Math.abs(destinationCoords.latitude - tutorialMarker.coords.latitude) < 0.0001 && 
          Math.abs(destinationCoords.longitude - tutorialMarker.coords.longitude) < 0.0001) {
        updateTutorial({ isTutorialActive: true });
      }

      // Auto-trigger tutorial if arriving at Cherry Lake Depths during correct step
      if (tutorialProgress.currentStep === 40 &&
          Math.abs(destinationCoords.latitude - CHERRY_LAKE_DEPTHS_COORDS.latitude) < 0.0001 && 
          Math.abs(destinationCoords.longitude - CHERRY_LAKE_DEPTHS_COORDS.longitude) < 0.0001) {
        updateTutorial({ currentStep: 41, isTutorialActive: true });
      }
    } 
  }, [isTraveling, destinationCoords, tutorialMarker, tutorialProgress.currentStep]);
  useEffect(() => { const timer = setTimeout(() => setTracksViewChanges(false), 3000); return () => clearTimeout(timer); }, []);
  useEffect(() => { 
    if (hasSetHomeCity && playerLocation) { 
      handleRegionChange({ latitude: playerLocation.latitude, longitude: playerLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }); 
      const zoomTimer = setTimeout(() => { 
        if (tutorialProgress.currentStep === 40) {
          mapRef.current?.animateToRegion({
            ...CHERRY_LAKE_DEPTHS_COORDS,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }, 1500);
        } else {
          handleRecenter(); 
        }
      }, 1000); 
      return () => clearTimeout(zoomTimer); 
    } 
  }, [hasSetHomeCity, tutorialProgress.currentStep]);
  useEffect(() => { if (hasSetHomeCity) { if (level >= 5 && !enrolledFaction) { setActiveDialogue(enrollmentDialogue); } else if (level >= 10 && !specialization) { setActiveDialogue(specializationDialogue); } } }, [level, enrolledFaction, specialization, hasSetHomeCity]);

  // Force markers to redraw once when they change
  const [shouldTrackMarkers, setShouldTrackMarkers] = useState(true);
  useEffect(() => {
    setShouldTrackMarkers(true);
  }, [hostileSignals, tutorialMarker]);

  useEffect(() => {
    if (shouldTrackMarkers) {
      const timer = setTimeout(() => setShouldTrackMarkers(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldTrackMarkers]);

  // Resume tutorial if at narrative checkpoints and SCREEN IS FOCUSED
  useEffect(() => {
    const checkpoints = [18, 23, 29, 33, 35, 36, 37, 39, 41, 43];
    if (isFocused && checkpoints.includes(tutorialProgress.currentStep) && !tutorialProgress.isTutorialActive) {
      // Add a small delay to ensure navigation has completed before resuming overlay
      const timer = setTimeout(() => {
        if (isFocused) updateTutorial({ isTutorialActive: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tutorialProgress.currentStep, tutorialProgress.isTutorialActive, isFocused]);

  // Handle step 22 (spawn tutorial enemy)
  useEffect(() => {
    if (tutorialProgress.currentStep === 22 && !tutorialProgress.isTutorialActive) {
      // Spawn a special tutorial enemy near player (approx 100m west)
      const dogCoords = { 
        latitude: playerLocation.latitude, 
        longitude: playerLocation.longitude - 0.001 
      };
      setHostileSignals([{
        id: 'tutorial-dog-signal',
        coords: dogCoords,
        biome: BiomeType.SHATTERED_SUBURBIA,
        type: 'Standard'
      }]);
    }
  }, [tutorialProgress.currentStep, tutorialProgress.isTutorialActive]);

  // Handle step 33 (spawn 5 tutorial dogs)
  useEffect(() => {
    if (tutorialProgress.currentStep === 33 && !tutorialProgress.isTutorialActive) {
      const offsets = [
        { lat: 0.00225, lon: 0 },
        { lat: -0.00225, lon: 0 },
        { lat: 0, lon: 0.00225 },
        { lat: 0, lon: -0.00225 },
        { lat: 0.0015, lon: 0.0015 }
      ];
      
      const newSignals = offsets.map((off, i) => ({
        id: `tutorial-dog-multi-${i}`,
        coords: { 
          latitude: playerLocation.latitude + off.lat, 
          longitude: playerLocation.longitude + off.lon 
        },
        biome: BiomeType.SHATTERED_SUBURBIA,
        type: 'Standard' as const
      }));

      setHostileSignals(newSignals);
      
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates([
            playerLocation, 
            ...newSignals.map(s => s.coords)
          ], {
            edgePadding: { top: 400, right: 400, bottom: 400, left: 400 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [tutorialProgress.currentStep, tutorialProgress.isTutorialActive]);

  const handleRegionChange = async (region: any) => {
    setMapRegion(region);
    if (!hasSetHomeCity) return;
    const coords = { latitude: region.latitude, longitude: region.longitude };
    let resolvedName = BoundaryService.getSuburbAtPoint(coords);
    if (!resolvedName) { try { const result = await reverseGeocode(coords); if (result) resolvedName = result.suburb; } catch (e) { console.error("Geocoding failed during region change", e); } }
    if (resolvedName) {
      setCurrentSuburb(resolvedName);
      const feature = BoundaryService.getSuburbFeature(resolvedName);
      if (feature && feature.geometry) {
        if (feature.geometry.type === 'Polygon') { setCurrentSuburbPolygon(feature.geometry.coordinates[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))); }
        else if (feature.geometry.type === 'MultiPolygon') { setCurrentSuburbPolygon(feature.geometry.coordinates[0][0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))); }
      } else { setCurrentSuburbPolygon(null); }
    }
  };

  const hideScanner = tutorialProgress.currentStep < 35;
  const isSafeZone = useMemo(() => { 
    if (!currentSuburb || !homeCityName || hideScanner) return false; 
    return currentSuburb.toLowerCase().includes(homeCityName.toLowerCase()) || homeCityName.toLowerCase().includes(currentSuburb.toLowerCase()); 
  }, [currentSuburb, homeCityName, hideScanner]);

  const homeCityHoles = useMemo(() => { if (!homeCityName) return []; const feature = BoundaryService.getSuburbFeature(homeCityName); if (!feature || !feature.geometry) return []; if (feature.geometry.type === 'Polygon') { return [feature.geometry.coordinates[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))]; } if (feature.geometry.type === 'MultiPolygon') { return feature.geometry.coordinates.map((poly: any) => poly[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))); } return []; }, [homeCityName]);
  const biomeColors = useMemo(() => { return { fill: 'rgba(212, 212, 216, 0.25)', stroke: 'rgba(6, 182, 212, 0.8)' }; }, []);

  useEffect(() => { if (hasSetHomeCity && (!hostileSignals || hostileSignals.length === 0) && !hideScanner) { handleScanArea(); } }, [hasSetHomeCity, hideScanner]);

  const handleScanArea = () => {
    triggerRadarPulse();
    const activeSuburb = currentSuburb || homeCityName;
    const currentBiome = getBiomeFromKeyword(activeSuburb);
    const feature = BoundaryService.getSuburbFeature(activeSuburb);
    const polygon = feature?.geometry?.type === 'Polygon' ? feature.geometry.coordinates[0] : 
                    feature?.geometry?.type === 'MultiPolygon' ? feature.geometry.coordinates[0][0] : null;

    const findPointInZone = (base: any, radius: number) => {
      if (!polygon) return { latitude: base.latitude + (Math.random() - 0.5) * radius, longitude: base.longitude + (Math.random() - 0.5) * radius };
      for (let i = 0; i < 25; i++) {
        const pt = { latitude: base.latitude + (Math.random() - 0.5) * 0.1, longitude: base.longitude + (Math.random() - 0.5) * 0.1 };
        if (BoundaryService.isPointInPolygon(pt, polygon)) return pt;
      }
      return { latitude: base.latitude + (Math.random() - 0.5) * 0.005, longitude: base.longitude + (Math.random() - 0.5) * 0.005 };
    };

    setHostileSignals(Array.from({ length: 5 }).map((_, i) => ({ id: `hostile-${i}-${Date.now()}`, biome: currentBiome, coords: findPointInZone(playerLocation, 0.03) })));
  };

  const handleTriggerRift = () => {
    triggerRadarPulse();
    const currentBiome = getBiomeFromKeyword(currentSuburb);
    triggerRift({ latitude: playerLocation.latitude + (Math.random() - 0.5) * 0.015, longitude: playerLocation.longitude + (Math.random() - 0.5) * 0.015 }, currentBiome);
  };

  const [selectedZone, setSelectedZone] = useState<{ suburb: string; biome: BiomeType; faction: FactionType; description: string; coords: { latitude: number; longitude: number }; isHostile: boolean; isBoss?: boolean; isTutorialMarker?: boolean; signalId?: string; } | null>(null);

  const handleMapPress = async (event: MapPressEvent) => {
    if (isGeocoding) return;
    const coords = event.nativeEvent.coordinate;
    const zoomScale = Math.max(1, mapRegion.latitudeDelta / 0.05);
    const hitRadius = BASE_HIT_RADIUS * zoomScale;
    
    const clickedSignal = (hostileSignals || []).filter(s => !s.respawnAt).find(s => getDistance(coords, s.coords) < hitRadius);
    if (clickedSignal) {
      setIsGeocoding(true);
      const isBoss = clickedSignal.type === 'Boss';
      const isTutorialDog = clickedSignal.id === 'tutorial-dog-signal' || clickedSignal.id.startsWith('tutorial-dog-multi');
      
      setSelectedZone({ 
        suburb: isTutorialDog ? "MUTATED DOG" : (isBoss ? "FRACTURE RIFT" : "Hostile Sector"), 
        biome: clickedSignal.biome, 
        faction: FactionType.IRON_CONSORTIUM, 
        description: isTutorialDog ? "A snarling, mutated beast. It's ready to lunge." : (isBoss ? "Warning: Sovereign entity crossing over." : "Imaginum turbulence detected."), 
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
    if (selectedZone.isTutorialMarker) {
      const distance = getDistance(playerLocation, selectedZone.coords) * 1000;
      if (distance <= 100) {
        updateTutorial({ isTutorialActive: true });
        setSelectedZone(null);
      } else {
        alert("Too far away. You must reach the orb to interact with it.");
      }
      return;
    }
    if (selectedZone.isHostile) {
      if (selectedZone.signalId === 'tutorial-dog-signal' || selectedZone.signalId?.startsWith('tutorial-dog-multi')) {
        initiateCombat('Mutated Dog', 40, usePlayerStore.getState().hp, usePlayerStore.getState().maxHp, usePlayerStore.getState().mana, usePlayerStore.getState().maxMana, selectedZone.signalId, 1.0, selectedZone.biome);
      } else {
        const enemy = selectedZone.isBoss ? getBossByBiome(selectedZone.biome) : getDeterministicEnemy(selectedZone.signalId || "generic", selectedZone.biome);
        initiateCombat(enemy.name, enemy.maxHp, usePlayerStore.getState().hp, usePlayerStore.getState().maxHp, usePlayerStore.getState().mana, usePlayerStore.getState().maxMana, selectedZone.signalId, 1.0, selectedZone.biome);
      }
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
      {/* Full screen Sonar Ripple */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none" className="items-center justify-center z-[100]">
        <Animated.View 
          style={[
            { 
              width: 300, 
              height: 300, 
              borderRadius: 150, 
              borderColor: 'rgba(6, 182, 212, 0.5)', 
              backgroundColor: 'rgba(6, 182, 212, 0.1)' 
            },
            animatedSonarStyle
          ]} 
        />
      </View>
      <TransitView />
      {showDiscovery && selectedZone && <DiscoveryOverlay suburb={selectedZone.suburb} fracturedTitle={getProceduralZone(selectedZone.suburb).loreName} onComplete={() => setShowDiscovery(false)} />}
      <QuestTracker />
      {!hideScanner && (
        <View className="absolute top-32 right-6 z-50 flex-col gap-3">
          <TouchableOpacity 
            onPress={handleScanArea} 
            activeOpacity={0.6}
            className="bg-red-950/60 border border-red-500/40 p-3 rounded-2xl flex-row items-center shadow-lg active:scale-95"
          >
            <Radar size={16} color="#ef4444" className="mr-2" />
            <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest">Scan Area</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleTriggerRift} 
            activeOpacity={0.6}
            className="bg-purple-950/60 border border-purple-500/40 p-3 rounded-2xl flex-row items-center shadow-lg active:scale-95"
          >
            <Flame size={16} color="#a855f7" className="mr-2" />
            <Text className="text-purple-400 font-black text-[10px] uppercase tracking-widest">Rift Event</Text>
          </TouchableOpacity>
        </View>
      )}
      <View className="absolute bottom-32 right-6 z-50">
        <TouchableOpacity 
          onPress={handleRecenter} 
          activeOpacity={0.6}
          className="bg-zinc-900/80 border border-zinc-700 w-12 h-12 rounded-2xl items-center justify-center shadow-lg active:scale-95"
        >
          <Focus size={20} color="#e4e4e7" />
        </TouchableOpacity>
      </View>
      <MapView 
        ref={mapRef} 
        provider={PROVIDER_GOOGLE} 
        style={StyleSheet.absoluteFillObject} 
        initialRegion={{ latitude: playerLocation.latitude, longitude: playerLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }} 
        onRegionChange={setMapRegion} 
        onRegionChangeComplete={handleRegionChange} 
        customMapStyle={fantasyMapStyle} 
        scrollEnabled={!isTutorialRestricted}
        zoomEnabled={!isTutorialRestricted}
        rotateEnabled={!isTutorialRestricted}
        pitchEnabled={!isTutorialRestricted}
        onPress={(e) => {
          if (isTutorialRestricted) return;
          handleMapPress(e);
        }}
      >
        {currentSuburbPolygon && <Polygon coordinates={currentSuburbPolygon} fillColor={biomeColors.fill} strokeColor={biomeColors.stroke} strokeWidth={4} zIndex={1} />}
        {(level < 10 && tutorialProgress.currentStep >= 36) && <Polygon coordinates={WORLD_BOUNDARY} holes={homeCityHoles} fillColor="rgba(0, 0, 0, 0.7)" strokeColor="transparent" strokeWidth={0} tappable={false} zIndex={2} />}
        <Circle center={playerLocation} radius={50} fillColor="rgba(6, 182, 212, 0.2)" strokeColor="rgba(6, 182, 212, 0.8)" strokeWidth={2} zIndex={2} />
        
        {tutorialMarker && (
          <React.Fragment key="tutorial-marker">
            <Marker coordinate={tutorialMarker.coords} anchor={{ x: 0.5, y: 0.5 }} zIndex={60} tracksViewChanges={true} onPress={(e) => { e.stopPropagation(); setSelectedZone({ suburb: "Glowing Blue Orb", biome: BiomeType.SHATTERED_SUBURBIA, faction: FactionType.IRON_CONSORTIUM, description: "A floating sphere of pure Imaginum energy. It seems to be responding to your presence.", coords: tutorialMarker.coords, isHostile: false, isTutorialMarker: true }); }}>
              <View style={markerStyles.container}>
                <Animated.View 
                  style={[
                    { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(34, 211, 238, 0.4)', position: 'absolute' },
                    animatedTutorialPulse
                  ]} 
                />
                <View className="w-6 h-6 bg-cyan-400/20 rounded-full items-center justify-center border-2 border-cyan-400 shadow-lg shadow-cyan-400">
                  <Compass size={14} color="#22d3ee" className="animate-pulse" />
                </View>
              </View>
            </Marker>
          </React.Fragment>
        )}

        {tutorialProgress.currentStep >= 40 && (
          <Marker 
            coordinate={CHERRY_LAKE_DEPTHS_COORDS} 
            anchor={{ x: 0.5, y: 0.5 }} 
            zIndex={70} 
            tracksViewChanges={true} 
            onPress={(e) => { 
              e.stopPropagation(); 
              setSelectedZone({ 
                suburb: "CHERRY LAKE DEPTHS", 
                biome: BiomeType.SHATTERED_SUBURBIA, 
                faction: FactionType.IRON_CONSORTIUM, 
                description: "The water is murky black, and a stone platform leads deep underground. The air here is heavy with resonance.", 
                coords: CHERRY_LAKE_DEPTHS_COORDS, 
                isHostile: false 
              }); 
            }}
          >
            <View style={markerStyles.container}>
              <View className="w-8 h-8 bg-purple-900/40 rounded-full items-center justify-center border-2 border-purple-500 shadow-lg shadow-purple-500">
                <Flame size={18} color="#a855f7" />
              </View>
            </View>
          </Marker>
        )}

        <Marker coordinate={playerLocation} anchor={{ x: 0.5, y: 0.5 }} zIndex={50} tracksViewChanges={shouldTrackMarkers}><View style={markerStyles.container}><View className="w-5 h-5 bg-cyan-500/20 rounded-full items-center justify-center border-2 border-cyan-400"><View className="w-2 h-2 bg-cyan-400 rounded-full" /></View></View></Marker>
        {(hostileSignals || []).filter(s => !s.respawnAt).map((signal) => {
          const isTutorialEnemy = signal.id.startsWith('tutorial-dog');
          if (isTutorialRestricted && !isTutorialEnemy) return null;
          return (
            <React.Fragment key={signal.id}>
              <Marker 
                coordinate={signal.coords} 
                anchor={{ x: 0.5, y: 0.5 }} 
                zIndex={isTutorialEnemy ? 100 : (signal.type === 'Boss' ? 30 : 20)} 
                tracksViewChanges={isTutorialEnemy ? true : shouldTrackMarkers} 
                onPress={(e) => { if (isTutorialRestricted && !isTutorialEnemy) return; e.stopPropagation(); handleMapPress({ nativeEvent: { coordinate: signal.coords } } as any); }}
              >
                <View style={markerStyles.container}>
                  <View className={`w-5 h-5 rounded-full items-center justify-center border-2 ${signal.type === 'Boss' ? 'bg-purple-500/20 border-purple-500' : 'bg-red-500/20 border-red-500/40'}`}>
                    {signal.type === 'Boss' ? <Skull size={12} color="#a855f7" /> : <Activity size={10} color="#ef4444" />}
                  </View>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapView>
      {selectedZone && <ZoneCard suburb={selectedZone.suburb} loreName={selectedZone.isBoss ? "CRITICAL ANOMALY" : getProceduralZone(selectedZone.suburb).loreName} description={selectedZone.description} coords={selectedZone.coords} isHostile={selectedZone.isHostile} onClose={() => setSelectedZone(null)} onExplore={handleEnterAction} onFastTravel={(duration) => { if (isTutorialRestricted && !selectedZone.isTutorialMarker) return; startTravel(selectedZone.suburb, selectedZone.coords, duration); setSelectedZone(null); }} />}
      {isGeocoding && <View className="absolute top-1/2 left-1/2 -ml-8 -mt-8 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800"><ActivityIndicator color="#06b6d4" /></View>}
      {isSafeZone && ( <Animated.View entering={SlideInDown.delay(500)} className="absolute bottom-[40px] left-6 right-6 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-3xl flex-row items-center justify-between z-50"><View className="flex-row items-center"><View className="bg-emerald-500 p-2 rounded-xl mr-3"><Home size={18} color="#064e3b" /></View><View><Text className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Safe Zone</Text><Text className="text-white font-bold">{homeCityName} Sanctuary</Text></View></View><TouchableOpacity onPress={rest} className="bg-emerald-500 px-4 py-2 rounded-xl flex-row items-center"><Coffee size={14} color="#064e3b" className="mr-2" /><Text className="text-emerald-950 font-black text-[10px] uppercase">Rest</Text></TouchableOpacity></Animated.View> )}
    </View>
  );
}

const markerStyles = StyleSheet.create({ container: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' } });
const fantasyMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] }, { "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] }, { "featureType": "poi", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }, { "weight": 1 }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#001a33" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#336699" }, { "visibility": "on" }] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] }];
