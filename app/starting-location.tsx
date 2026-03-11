import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Modal, FlatList, Keyboard } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { usePlayerStore, ActiveZoneContext } from '../utils/usePlayerStore';
import { reverseGeocode, searchLocations, GeoSearchResult } from '../utils/GeoService';
import BoundaryService from '../utils/BoundaryService';
import Animated, { FadeIn, FadeInDown, SlideInUp, FadeOut } from 'react-native-reanimated';
import { MapPin, Search, Sparkles, Navigation, CheckCircle2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function StartingLocationSelection() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { playerLocation, setHomeCity, setActiveZoneContext } = usePlayerStore();

  const [searchQuery, setSearchBar] = useState('');
  const [predictions, setPredictions] = useState<GeoSearchResult[]>([]);
  const [selectedSuburb, setSelectedSuburb] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [polygon, setPolygon] = useState<{ latitude: number, longitude: number }[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        const results = await searchLocations(searchQuery);
        setPredictions(results);
        setIsSearching(false);
      } else {
        setPredictions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectLocation = async (lat: number, lon: number, displayName?: string, address?: any, geojson?: any) => {
    const coords = { latitude: lat, longitude: lon };
    setSelectedCoords(coords);
    
    // 1. Try Boundary Service first (Local Melbourne GeoJSON)
    const localSuburb = BoundaryService.getSuburbAtPoint(coords);
    
    if (localSuburb) {
      setSelectedSuburb(localSuburb);
      setSelectedRegion('Victoria, Australia');
      
      const feature = BoundaryService.getSuburbFeature(localSuburb);
      if (feature && feature.geometry) {
        setPolygon(processGeoJSON(feature.geometry));
      }
    } else {
      // 2. Use Dynamic GeoJSON from Nominatim if provided
      if (geojson) {
        const suburbName = address?.suburb || address?.neighbourhood || address?.village || address?.town || address?.city_district || address?.city || 'Sector Alpha';
        setSelectedSuburb(suburbName);
        setSelectedRegion(`${address?.city || 'Unknown City'}, ${address?.country || 'Fractured Earth'}`);
        setPolygon(processGeoJSON(geojson));
      } else {
        // 3. Fallback to Reverse Geocode (which now also requests GeoJSON)
        const geo = await reverseGeocode(coords);
        const suburbName = geo?.suburb || 'Sector Alpha';
        setSelectedSuburb(suburbName);
        setSelectedRegion(geo ? `${geo.city}, ${geo.country}` : 'Fractured Earth');
        
        if (geo?.geojson) {
          setPolygon(processGeoJSON(geo.geojson));
        } else {
          // 4. Ultimate Procedural Fallback if still no geometry
          const offset = 0.008; 
          const fallbackPolygon = [
            { latitude: coords.latitude + offset, longitude: coords.longitude - offset },
            { latitude: coords.latitude + offset, longitude: coords.longitude + offset },
            { latitude: coords.latitude - offset, longitude: coords.longitude + offset },
            { latitude: coords.latitude - offset, longitude: coords.longitude - offset },
          ];
          setPolygon(fallbackPolygon);
        }
      }
    }

    // 5. Pan map
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 1000);

    setPredictions([]);
    setSearchBar('');
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Helper to process various GeoJSON formats from Nominatim
  const processGeoJSON = (geojson: any) => {
    if (!geojson) return null;
    
    // Feature format
    let geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;
    
    if (geometry.type === 'Polygon') {
      return geometry.coordinates[0].map((c: any) => ({ longitude: c[0], latitude: c[1] }));
    } else if (geometry.type === 'MultiPolygon') {
      // Use the first (usually primary) polygon
      return geometry.coordinates[0][0].map((c: any) => ({ longitude: c[0], latitude: c[1] }));
    } else if (geometry.type === 'Point' || geometry.type === 'LineString') {
      // Points and lines can't be polygons, return null to trigger procedural square
      return null;
    }
    return null;
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    selectLocation(coords.latitude, coords.longitude);
  };

  const handlePredictionSelect = (item: GeoSearchResult) => {
    selectLocation(parseFloat(item.lat), parseFloat(item.lon), item.display_name, item.address, item.geojson);
  };

  const handleConfirmLocation = async () => {
    if (!selectedSuburb || !selectedCoords) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsGenerating(true);
    setGenerationStatus('The Imaginum is shaping the world...');

    try {
      // Call Generation API with regional context
      const response = await fetch('/api/zone/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suburbName: selectedSuburb,
          regionContext: selectedRegion
        })
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Generation failed: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Unexpected non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned invalid data format (HTML instead of JSON). Check server logs.');
      }

      const zoneData: ActiveZoneContext = await response.json();

      // Log the procedurally generated zone info
      console.log('--- PROCCEDURAL ZONE SYNTHESIS ---');
      console.log('Biome:', zoneData.zoneTheme.biomeName);
      console.log('Weather:', zoneData.zoneTheme.weatherState);
      console.log('Description:', zoneData.zoneTheme.description);
      console.log('Settlement:', zoneData.primarySettlement.name);
      console.log('Chieftain:', zoneData.primarySettlement.chieftain.name);
      console.log('Vendor:', zoneData.primarySettlement.vendor.name);
      console.log('Dungeon:', zoneData.dungeon.name);
      console.log('Enemies:', zoneData.enemies.map(e => e.name).join(', '));
      console.log('-----------------------------------');

      // Update Global State
      setActiveZoneContext(zoneData);
      setHomeCity(selectedSuburb, selectedCoords);

      // Initialize Tutorial Locations relative to selection
      // Orb: ~250m North
      // Dungeon: ~1.5km South
      // Settlement: ~100m North
      const orbCoords = { 
        latitude: selectedCoords.latitude + 0.00225, 
        longitude: selectedCoords.longitude + (Math.random() - 0.5) * 0.001 
      };
      
      const dungeonCoords = {
        latitude: selectedCoords.latitude - 0.015,
        longitude: selectedCoords.longitude + 0.005
      };

      const settlementCoords = {
        latitude: selectedCoords.latitude + 0.001,
        longitude: selectedCoords.longitude - 0.001
      };

      usePlayerStore.getState().setTutorialMarker({
        coords: orbCoords,
        label: "Glowing Blue Orb"
      });

      usePlayerStore.getState().setTutorialCoords({
        dungeon: dungeonCoords,
        settlement: settlementCoords
      });
      
      setGenerationStatus('Reality Stabilized.');
      
      setTimeout(() => {
        setIsGenerating(false);
        // Replace with Tabs/Explore where the Tutorial overlay will trigger
        router.replace('/(tabs)/explore');
      }, 1500);

    } catch (error) {
      console.error("Selection failed:", error);
      setIsGenerating(false);
      alert("Synchronization interrupted. Please try again.");
    }
  };

  return (
    <View className="flex-1 bg-black">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: playerLocation.latitude,
          longitude: playerLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        customMapStyle={fantasyMapStyle}
        onPress={handleMapPress}
      >
        {polygon && (
          <Polygon 
            coordinates={polygon} 
            fillColor="rgba(6, 182, 212, 0.2)" 
            strokeColor="rgba(6, 182, 212, 0.8)" 
            strokeWidth={3} 
          />
        )}
        {selectedCoords && !polygon && (
          <Marker coordinate={selectedCoords}>
             <View className="bg-cyan-500/20 p-2 rounded-full border border-cyan-500">
                <View className="w-2 h-2 bg-cyan-400 rounded-full" />
             </View>
          </Marker>
        )}
      </MapView>

      {/* Intro Overlay */}
      {!selectedSuburb && predictions.length === 0 && (
        <Animated.View 
          entering={FadeIn.delay(500)} 
          className="absolute top-40 left-10 right-10 pointer-events-none"
        >
          <Text className="text-white text-3xl font-black text-center leading-tight">
            Welcome to the world of <Text className="text-cyan-400">Aeternis</Text>.
          </Text>
          <Text className="text-zinc-500 text-center font-bold mt-4 tracking-widest uppercase text-[10px]">
            Select where you would like to begin your journey...
          </Text>
        </Animated.View>
      )}

      {/* Header Search UI */}
      <View className="absolute top-16 left-6 right-6">
        <Animated.View entering={FadeInDown.duration(800)} className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 shadow-2xl flex-row items-center z-50">
          <Search size={20} color={isSearching ? "#06b6d4" : "#71717a"} className="mr-3" />
          <TextInput
            placeholder="Search sector name..."
            placeholderTextColor="#3f3f46"
            className="flex-1 text-white font-bold"
            value={searchQuery}
            onChangeText={setSearchBar}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchBar('')}>
              <X size={18} color="#71717a" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Search Results */}
        {predictions.length > 0 && (
          <Animated.View entering={FadeIn.duration(200)} className="bg-zinc-900 border border-zinc-800 rounded-3xl mt-2 p-2 shadow-2xl overflow-hidden max-h-64">
            <FlatList
              data={predictions}
              keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handlePredictionSelect(item)}
                  className="p-4 border-b border-zinc-800 flex-row items-center"
                >
                  <MapPin size={16} color="#71717a" className="mr-3" />
                  <View className="flex-1">
                    <Text className="text-white font-bold text-sm" numberOfLines={1}>
                      {item.display_name.split(',')[0]}
                    </Text>
                    <Text className="text-zinc-500 text-[10px]" numberOfLines={1}>
                      {item.display_name.split(',').slice(1).join(',').trim()}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        )}
      </View>

      {/* Confirmation Modal */}
      {selectedSuburb && !isGenerating && predictions.length === 0 && (
        <Animated.View 
          entering={SlideInUp.springify()} 
          exiting={FadeOut}
          className="absolute bottom-12 left-6 right-6 bg-zinc-900 border border-cyan-500/30 rounded-[40px] p-8 shadow-2xl"
        >
          <View className="items-center mb-6">
            <View className="bg-cyan-500/10 p-4 rounded-2xl mb-4">
              <MapPin size={32} color="#06b6d4" />
            </View>
            <Text className="text-zinc-500 font-black text-[10px] uppercase tracking-[4px] mb-1">Sector Target</Text>
            <Text className="text-white text-3xl font-black text-center">{selectedSuburb}</Text>
            <Text className="text-zinc-600 font-bold text-[10px] text-center mt-2 uppercase tracking-widest">{selectedRegion}</Text>
          </View>

          <TouchableOpacity
            onPress={handleConfirmLocation}
            className="bg-cyan-600 h-20 rounded-3xl items-center justify-center border-t border-white/20"
          >
            <Text className="text-white font-black uppercase tracking-[6px]">Begin Journey</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Loading Overlay */}
      {isGenerating && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/90 items-center justify-center p-10">
            <ActivityIndicator size="large" color="#06b6d4" className="mb-8" />
            <Text className="text-cyan-500 font-bold uppercase tracking-[4px] text-xs mb-4">Synchronizing Reality</Text>
            <Text className="text-white text-xl font-serif italic text-center leading-8">
              "{generationStatus}"
            </Text>
          </View>
        </Modal>
      )}
    </View>
  );
}

const fantasyMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#1a1a1a" }] }, { "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#121212" }] }, { "featureType": "poi", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c2c2c" }, { "weight": 1 }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#001a33" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#336699" }, { "visibility": "on" }] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "visibility": "off" }] }];
