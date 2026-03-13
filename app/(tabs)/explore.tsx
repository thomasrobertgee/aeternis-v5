import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator, DevSettings, Alert, Platform } from 'react-native';
import { usePlayerStore } from '../../utils/usePlayerStore';
import { useCombatStore } from '../../utils/useCombatStore';
import { geocodeCity, reverseGeocode } from '../../utils/GeoService';
import { getBiomeFromKeyword, getFactionForZone, BiomeType, FactionType } from '../../utils/BiomeMapper';
import { getProceduralZone, generateAtmosphericIntro } from '../../utils/ProceduralEngine';
import { getDeterministicEnemy, getBossByBiome } from '../../utils/EnemyFactory';
import { getWeatherForSuburb, getTemperatureForSuburb, WeatherType, WEATHER_EFFECTS } from '../../utils/WorldStateManager';
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
import { Coffee, ShieldCheck, Home, Activity, Skull, Package, Focus, Compass, Flame, Clock, Cloud, Thermometer, MapPin as MapPinIcon } from 'lucide-react-native';
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
import { useDungeonStore } from '../../utils/useDungeonStore';
import { useBehaviourStore } from '../../utils/useBehaviourStore';
import SoundService from '../../utils/SoundService';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, MapPressEvent } from 'react-native-maps';
import FractureMap from '../../components/FractureMap';

const WORLD_BOUNDARY = [{ latitude: -85, longitude: -180 }, { latitude: -85, longitude: 180 }, { latitude: 85, longitude: 180 }, { latitude: 85, longitude: -180 }];

export default function ExploreScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const isFocused = useIsFocused();

  // Selectors for Player Store
  const playerLocation = usePlayerStore((state) => state.playerLocation);
  const setPlayerLocation = usePlayerStore((state) => state.setPlayerLocation);
  const rest = usePlayerStore((state) => state.rest);
  const hasSetHomeCity = usePlayerStore((state) => state.hasSetHomeCity);
  const homeCityName = usePlayerStore((state) => state.homeCityName);
  const sanctuaryLocation = usePlayerStore((state) => state.sanctuaryLocation);
  const enrolledFaction = usePlayerStore((state) => state.enrolledFaction);
  const specialization = usePlayerStore((state) => state.specialization);
  const level = usePlayerStore((state) => state.level);
  const hostileSignals = usePlayerStore((state) => state.hostileSignals);
  const setHostileSignals = usePlayerStore((state) => state.setHostileSignals);
  const respawnSignals = usePlayerStore((state) => state.respawnSignals);
  const triggerRift = usePlayerStore((state) => state.triggerRift);
  const saveZoneProfile = usePlayerStore((state) => state.saveZoneProfile);
  const cleanupZones = usePlayerStore((state) => state.cleanupZones);
  const tutorialProgress = usePlayerStore((state) => state.tutorialProgress);
  const updateTutorial = usePlayerStore((state) => state.updateTutorial);
  const tutorialMarker = usePlayerStore((state) => state.tutorialMarker);
  const isInSettlement = usePlayerStore((state) => state.isInSettlement);
  const isTutorialComplete = usePlayerStore((state) => state.isTutorialComplete);
  const setErrorNotification = usePlayerStore((state) => state.setErrorNotification);
  const settings = usePlayerStore((state) => state.settings);
  const tutorialCoords = usePlayerStore((state) => state.tutorialCoords);
  const activeZoneContext = usePlayerStore((state) => state.activeZoneContext);

  // Selectors for Combat Store
  const initiateCombat = useCombatStore((state) => state.initiateCombat);

  // Selectors for Travel Store
  const isTraveling = useTravelStore((state) => state.isTraveling);
  const travelTimeRemaining = useTravelStore((state) => state.travelTimeRemaining);
  const startTravel = useTravelStore((state) => state.startTravel);
  const tickTravel = useTravelStore((state) => state.tickTravel);
  const completeTravel = useTravelStore((state) => state.completeTravel);
  const destinationCoords = useTravelStore((state) => state.destinationCoords);
  const destinationName = useTravelStore((state) => state.destinationName);
  const totalTravelDuration = useTravelStore((state) => state.totalTravelDuration);

  // Selectors for UI Store
  const pendingMapAction = useUIStore((state) => state.pendingMapAction);
  const setPendingMapAction = useUIStore((state) => state.setPendingMapAction);

  const [currentSuburb, setCurrentSuburb] = useState<string>("");
  const [currentSuburbPolygon, setCurrentSuburbPolygon] = useState<{latitude: number, longitude: number}[] | null>(null);
  const [isInEncounter, setIsInEncounter] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Live Clock for Map Info Bar
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [mapRegion, setMapRegion] = useState({ latitude: playerLocation.latitude, longitude: playerLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });

  useEffect(() => {
    if (isFocused && pendingMapAction && pendingMapAction.type === 'center') {
      const { coords, zoom } = pendingMapAction;
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: zoom || 0.02,
          longitudeDelta: zoom || 0.02
        }, 1500);
        setPendingMapAction(null);
      }, 500);
    }
  }, [isFocused, pendingMapAction]);

  const tutorialPulseScale = useSharedValue(1);
  const tutorialPulseOpacity = useSharedValue(0);
  const sonarScale = useSharedValue(0);
  const sonarOpacity = useSharedValue(0);

  const isTutorialRestricted = !isTutorialComplete && !tutorialProgress.isTutorialActive;

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

      if (tutorialMarker && mapRef.current && tutorialProgress.currentStep < 12) {
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
  }, [isTutorialRestricted, tutorialMarker, tutorialProgress.currentStep]);

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
  const pulseScale = useSharedValue(0);
  const pulseOpacity = useSharedValue(0);

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

      // Auto-trigger tutorial if arriving at dynamic dungeon location
      if (tutorialProgress.currentStep === 41 &&
          Math.abs(destinationCoords.latitude - tutorialCoords.dungeon.latitude) < 0.0001 && 
          Math.abs(destinationCoords.longitude - tutorialCoords.dungeon.longitude) < 0.0001) {
        updateTutorial({ currentStep: 42, isTutorialActive: true });
      }

      // Auto-trigger tutorial if arriving at dynamic settlement location
      if (tutorialProgress.currentStep === 58 &&
          Math.abs(destinationCoords.latitude - tutorialCoords.settlement.latitude) < 0.0001 && 
          Math.abs(destinationCoords.longitude - tutorialCoords.settlement.longitude) < 0.0001) {
        updateTutorial({ isTutorialActive: true });
      }
    } 
  }, [isTraveling, destinationCoords, tutorialMarker, tutorialProgress.currentStep, tutorialCoords]);

  useEffect(() => { const timer = setTimeout(() => setTracksViewChanges(false), 3000); return () => clearTimeout(timer); }, []);
  
  useEffect(() => { 
    if (hasSetHomeCity && playerLocation) { 
      handleRegionChange({ latitude: playerLocation.latitude, longitude: playerLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }); 
      const zoomTimer = setTimeout(() => { 
        const isCustomZoomStep = tutorialProgress.currentStep === 40 || tutorialProgress.currentStep === 58;
        if (!pendingMapAction && !isCustomZoomStep) {
          handleRecenter(); 
        } else if (tutorialProgress.currentStep === 40 && !pendingMapAction) {
          mapRef.current?.animateToRegion({
            ...tutorialCoords.dungeon,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }, 1500);
        }
      }, 1000); 
      return () => clearTimeout(zoomTimer); 
    } 
  }, [hasSetHomeCity, tutorialProgress.currentStep, pendingMapAction, tutorialCoords]);

  useEffect(() => { if (hasSetHomeCity) { if (level >= 10 && !enrolledFaction) { setActiveDialogue(enrollmentDialogue); } else if (level >= 15 && !specialization) { setActiveDialogue(specializationDialogue); } } }, [level, enrolledFaction, specialization, hasSetHomeCity]);

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

  // Resume tutorial if at narrative checkpoints
  useEffect(() => {
    // Exclude interaction steps (21, 31, 32, 42) to prevent auto-resume while user is on map
    const checkpoints = [
      18, 19, 20, 22, 24, 25, 26, 27, 28, 29, 30, 
      33, 34, 36, 37, 38, 39, 40, 44, 45, 46,
      47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60
    ];
    
    if (isFocused && tutorialProgress.currentStep === 46 && !tutorialProgress.isTutorialActive) {
      const activeQuest = usePlayerStore.getState().activeQuests.find(q => q.id === 'q-millers-junction-depths');
      const isDungeonQuestComplete = activeQuest?.isCompleted || !activeQuest;
      const distance = getDistance(playerLocation, tutorialCoords.dungeon) * 1000;

      if (distance <= 150 && isDungeonQuestComplete) {
        const timer = setTimeout(() => {
          if (isFocused) updateTutorial({ isTutorialActive: true });
        }, 500);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (isFocused && !isTutorialComplete && checkpoints.includes(tutorialProgress.currentStep) && !tutorialProgress.isTutorialActive) {
      const timer = setTimeout(() => {
        if (isFocused) updateTutorial({ isTutorialActive: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tutorialProgress.currentStep, tutorialProgress.isTutorialActive, isFocused, isTutorialComplete, tutorialCoords]);

  // Spawn tutorial enemies
  useEffect(() => {
    // Step 21: First Dog Encounter
    if (tutorialProgress.currentStep >= 21 && tutorialProgress.currentStep < 22) {
      if (hostileSignals?.some(s => s.id === 'tutorial-dog-signal')) return;
      const dogCoords = { latitude: playerLocation.latitude, longitude: playerLocation.longitude - 0.001 };
      setHostileSignals([{ id: 'tutorial-dog-signal', coords: dogCoords, biome: BiomeType.SHATTERED_SUBURBIA, type: 'Standard' }]);
    }
  }, [tutorialProgress.currentStep]);

  useEffect(() => {
    // Step 31: Dog Pack Encounter (Was 33)
    if (tutorialProgress.currentStep >= 31 && tutorialProgress.currentStep < 33) {
      if (hostileSignals?.some(s => s.id === 'tutorial-dog-multi-0')) return;
      const offsets = [ { lat: 0.00225, lon: 0 }, { lat: -0.00225, lon: 0 }, { lat: 0, lon: 0.00225 }, { lat: 0, lon: -0.00225 }, { lat: 0.0015, lon: 0.0015 } ];
      const newSignals = offsets.map((off, i) => ({
        id: `tutorial-dog-multi-${i}`,
        coords: { latitude: playerLocation.latitude + off.lat, longitude: playerLocation.longitude + off.lon },
        biome: BiomeType.SHATTERED_SUBURBIA,
        type: 'Standard' as const
      }));
      setHostileSignals(newSignals);
      if (mapRef.current) {
        setTimeout(() => { mapRef.current?.fitToCoordinates([playerLocation, ...newSignals.map(s => s.coords)], { edgePadding: { top: 400, right: 400, bottom: 400, left: 400 }, animated: true }); }, 500);
      }
    }
  }, [tutorialProgress.currentStep]);

  const handleRegionChange = async (region: any) => {
    setMapRegion(region);
    if (!hasSetHomeCity) return;
    const coords = { latitude: region.latitude, longitude: region.longitude };
    let resolvedName = BoundaryService.getSuburbAtPoint(coords);
    if (!resolvedName) { try { const result = await reverseGeocode(coords); if (result) resolvedName = result.suburb; } catch (e) { console.error("Geocoding failed", e); } }
    if (resolvedName) {
      setCurrentSuburb(resolvedName);
      const feature = BoundaryService.getSuburbFeature(resolvedName);
      if (feature && feature.geometry) {
        if (feature.geometry.type === 'Polygon') { setCurrentSuburbPolygon(feature.geometry.coordinates[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))); }
        else if (feature.geometry.type === 'MultiPolygon') { setCurrentSuburbPolygon(feature.geometry.coordinates[0][0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))); }
      } else { setCurrentSuburbPolygon(null); }
    }
  };

  const homeCityHoles = useMemo(() => { if (!homeCityName) return []; const feature = BoundaryService.getSuburbFeature(homeCityName); if (!feature || !feature.geometry) return []; if (feature.geometry.type === 'Polygon') { return [feature.geometry.coordinates[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))]; } if (feature.geometry.type === 'MultiPolygon') { return feature.geometry.coordinates.map((poly: any) => poly[0].map((coord: number[]) => ({ longitude: coord[0], latitude: coord[1] }))); } return []; }, [homeCityName]);
  const biomeColors = useMemo(() => { return { fill: 'rgba(212, 212, 216, 0.25)', stroke: 'rgba(6, 182, 212, 0.8)' }; }, []);

  const [selectedZone, setSelectedZone] = useState<{ suburb: string; biome: BiomeType; faction: FactionType; description: string; coords: { latitude: number; longitude: number }; isHostile: boolean; isBoss?: boolean; isTutorialMarker?: boolean; isDungeon?: boolean; isSettlement?: boolean; signalId?: string; } | null>(null);

  const handleMapPress = async (event: MapPressEvent) => {
    if (isGeocoding) return;
    const coords = event.nativeEvent.coordinate;
    const zoomScale = Math.max(1, mapRegion.latitudeDelta / 0.05);
    const hitRadius = BASE_HIT_RADIUS * zoomScale;
    
    const clickedSignal = (hostileSignals || []).filter(s => !s.respawnAt).find(s => getDistance(coords, s.coords) < hitRadius);
    if (clickedSignal) {
      setIsGeocoding(true);
      const isBoss = clickedSignal.type === 'Boss';
      const isFirstDog = clickedSignal.id === 'tutorial-dog-signal';
      const isMultiDog = clickedSignal.id.startsWith('tutorial-dog-multi');
      
      setSelectedZone({ 
        suburb: isFirstDog ? "SMALL MUTATED DOG" : (isMultiDog ? "MUTATED DOG" : (isBoss ? "FRACTURE RIFT" : "Hostile Sector")), 
        biome: clickedSignal.biome, 
        faction: FactionType.IRON_CONSORTIUM, 
        description: (isFirstDog || isMultiDog) ? "A snarling, mutated beast. It's ready to lunge." : (isBoss ? "Warning: Sovereign entity crossing over." : "Imaginum turbulence detected."), 
        coords: clickedSignal.coords, 
        isHostile: true, 
        isBoss, 
        signalId: clickedSignal.id 
      });
      setIsGeocoding(false);
      return;
    }

    if (!isTutorialComplete) return;

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
    if (selectedZone.isDungeon) {
      const distance = getDistance(playerLocation, selectedZone.coords) * 1000;
      if (distance <= 150) {
        useDungeonStore.getState().enterDungeon(selectedZone.suburb);
        router.replace('/(tabs)/dungeon');
        setSelectedZone(null);
      } else {
        setErrorNotification({ title: "Signal Lost", message: "You must be within 150m of the depths entrance to descend." });
      }
      return;
    }
    if (selectedZone.isSettlement) {
      const distance = getDistance(playerLocation, selectedZone.coords) * 1000;
      if (distance <= 150) {
        router.push('/(tabs)/settlement');
        setSelectedZone(null);
      } else {
        setErrorNotification({ title: "Access Denied", message: "You must reach the settlement perimeter to enter." });
      }
      return;
    }
    if (selectedZone.isTutorialMarker) {
      const distance = getDistance(playerLocation, selectedZone.coords) * 1000;
      if (distance <= 100) {
        updateTutorial({ isTutorialActive: true });
        setSelectedZone(null);
      } else {
        setErrorNotification({ title: "Resonance Lost", message: "You must reach the orb to interact with it." });
      }
      return;
    }
    if (selectedZone.isHostile) {
      useBehaviourStore.getState().recordAction('INITIATE_ENCOUNTER');
      if (selectedZone.signalId === 'tutorial-dog-signal') {
        initiateCombat('Small Mutated Dog', 30, usePlayerStore.getState().hp, usePlayerStore.getState().maxHp, usePlayerStore.getState().mana, usePlayerStore.getState().maxMana, selectedZone.signalId, 1.0, selectedZone.biome);
      } else if (selectedZone.signalId?.startsWith('tutorial-dog-multi')) {
        initiateCombat('Mutated Dog', 40, usePlayerStore.getState().hp, usePlayerStore.getState().maxHp, usePlayerStore.getState().mana, usePlayerStore.getState().maxMana, selectedZone.signalId, 1.0, selectedZone.biome);
      } else {
        const enemy = selectedZone.isBoss ? getBossByBiome(selectedZone.biome) : getDeterministicEnemy(selectedZone.signalId || "generic", selectedZone.biome);
        initiateCombat(enemy.name, enemy.maxHp, usePlayerStore.getState().hp, usePlayerStore.getState().maxHp, usePlayerStore.getState().mana, usePlayerStore.getState().maxMana, selectedZone.signalId, 1.0, selectedZone.biome);
      }
      router.push('/(tabs)/battle');
      setSelectedZone(null);
    } else {
      const { discoveredZones } = usePlayerStore.getState();
      if (!discoveredZones[selectedZone.suburb]) {
        useBehaviourStore.getState().recordAction('EXPLORE_NEW_ZONE');
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
      <View className="flex-row justify-between items-center px-4 h-12 bg-transparent z-[110]">
        <View className="flex-1 flex-row items-center">
          <Text className="text-zinc-400 font-mono text-[10px] uppercase">
            {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
          </Text>
        </View>
        <View className="flex-[2] items-center justify-center flex-row">
          <MapPinIcon size={12} color="#06b6d4" className="mr-1.5" />
          <Text className="text-white font-bold text-[10px] uppercase tracking-[4px]" numberOfLines={1}>
            {currentSuburb || homeCityName || "Fracture Zone"}, AU
          </Text>
        </View>
        <View className="flex-1 flex-row items-center justify-end">
          <View className="items-end mr-2">
            <Text className="text-zinc-200 font-black text-[10px] uppercase leading-tight">
              {getWeatherForSuburb(currentSuburb || homeCityName || "Altona North")}
            </Text>
            <View className="flex-row items-center">
              <Thermometer size={10} color="#71717a" className="mr-1" />
              <Text className="text-zinc-400 font-mono text-[8px] font-bold">
                {(() => {
                  const celsius = getTemperatureForSuburb(currentSuburb || homeCityName || "Altona North");
                  return settings.tempUnit === 'Celsius' ? `${celsius}°C` : `${Math.round((celsius * 9/5) + 32)}°F`;
                })()}
              </Text>
            </View>
          </View>
          <Cloud size={14} color="#06b6d4" />
        </View>
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none" className="items-center justify-center z-[100]">
        <Animated.View style={[{ width: 300, height: 300, borderRadius: 150, borderColor: 'rgba(6, 182, 212, 0.5)', backgroundColor: 'rgba(6, 182, 212, 0.1)' }, animatedSonarStyle ]} />
      </View>
      <TransitView />
      {showDiscovery && selectedZone && <DiscoveryOverlay suburb={selectedZone.suburb} fracturedTitle={getProceduralZone(selectedZone.suburb).loreName} onComplete={() => setShowDiscovery(false)} />}
      <QuestTracker />
      <View className="absolute bottom-10 right-6 z-50">
        <TouchableOpacity onPress={handleRecenter} activeOpacity={0.6} className="bg-zinc-900/80 border border-zinc-700 w-12 h-12 rounded-2xl items-center justify-center shadow-lg active:scale-95"><Focus size={20} color="#e4e4e7" /></TouchableOpacity>
      </View>
      
      <FractureMap
        mapRef={mapRef}
        playerLocation={playerLocation}
        isTutorialRestricted={isTutorialRestricted}
        currentSuburbPolygon={currentSuburbPolygon}
        biomeColors={biomeColors}
        level={level}
        homeCityHoles={homeCityHoles}
        WORLD_BOUNDARY={WORLD_BOUNDARY}
        tutorialMarker={tutorialMarker}
        tutorialProgress={tutorialProgress}
        MILLERS_JUNCTION_DEPTHS_COORDS={tutorialCoords.dungeon}
        ALTONA_GATE_COORDS={tutorialCoords.settlement}
        hostileSignals={hostileSignals}
        handleMapPress={handleMapPress}
        handleRegionChange={handleRegionChange}
        setMapRegion={setMapRegion}
        setSelectedZone={setSelectedZone}
        animatedTutorialPulse={animatedTutorialPulse}
        shouldTrackMarkers={shouldTrackMarkers}
        fantasyMapStyle={fantasyMapStyle}
        markerStyles={markerStyles}
        activeZoneContext={activeZoneContext}
      />

      {selectedZone && <ZoneCard suburb={selectedZone.suburb} loreName={selectedZone.isBoss ? "CRITICAL ANOMALY" : (selectedZone.isDungeon || selectedZone.isSettlement ? selectedZone.suburb : getProceduralZone(selectedZone.suburb).loreName)} description={selectedZone.description} coords={selectedZone.coords} isHostile={selectedZone.isHostile} isDungeon={selectedZone.isDungeon} isSettlement={selectedZone.isSettlement} onClose={() => setSelectedZone(null)} onExplore={handleEnterAction} onFastTravel={(duration) => { 
        if (isInSettlement) { setErrorNotification({ title: "Link Blocked", message: "The Aether-Link is currently synchronized to local Enclave protocols. You must exit the settlement perimeter before jumping." }); return; }
        if (tutorialProgress.currentStep < 58 && !selectedZone.isTutorialMarker && !selectedZone.isDungeon && !selectedZone.isSettlement) {
          setErrorNotification({ title: "Link Locked", message: "The Aether-Link is currently synchronized to tutorial objectives only." }); return;
        }
        startTravel(selectedZone.suburb, selectedZone.coords, duration); setSelectedZone(null); 
      }} />}
      {isGeocoding && <View className="absolute top-1/2 left-1/2 -ml-8 -mt-8 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800"><ActivityIndicator color="#06b6d4" /></View>}
    </View>
  );
}

const markerStyles = StyleSheet.create({ container: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' } });
const fantasyMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] }, { "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] }, { "featureType": "poi", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }, { "weight": 1 }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#001a33" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#336699" }, { "visibility": "on" }] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] }];
