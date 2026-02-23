import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polygon } from 'react-native-maps';
import { Compass, Flame, Home, Skull, Activity } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { BiomeType, FactionType } from '../utils/BiomeMapper';

interface FractureMapProps {
  mapRef: React.RefObject<MapView>;
  playerLocation: { latitude: number; longitude: number };
  isTutorialRestricted: boolean;
  currentSuburbPolygon: any;
  biomeColors: { fill: string; stroke: string };
  level: number;
  homeCityHoles: any[];
  WORLD_BOUNDARY: any[];
  tutorialMarker: any;
  tutorialProgress: any;
  MILLERS_JUNCTION_DEPTHS_COORDS: any;
  ALTONA_GATE_COORDS: any;
  hostileSignals: any[];
  handleMapPress: (e: any) => void;
  handleRegionChange: (region: any) => void;
  setMapRegion: (region: any) => void;
  setSelectedZone: (zone: any) => void;
  animatedTutorialPulse: any;
  shouldTrackMarkers: boolean;
  fantasyMapStyle: any;
  markerStyles: any;
}

const FractureMap = ({
  mapRef,
  playerLocation,
  isTutorialRestricted,
  currentSuburbPolygon,
  biomeColors,
  level,
  homeCityHoles,
  WORLD_BOUNDARY,
  tutorialMarker,
  tutorialProgress,
  MILLERS_JUNCTION_DEPTHS_COORDS,
  ALTONA_GATE_COORDS,
  hostileSignals,
  handleMapPress,
  handleRegionChange,
  setMapRegion,
  setSelectedZone,
  animatedTutorialPulse,
  shouldTrackMarkers,
  fantasyMapStyle,
  markerStyles,
}: FractureMapProps) => {
  return (
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

      {tutorialProgress.currentStep >= 41 && (
        <Marker 
          coordinate={MILLERS_JUNCTION_DEPTHS_COORDS} 
          anchor={{ x: 0.5, y: 0.5 }} 
          zIndex={70} 
          tracksViewChanges={true} 
          onPress={(e) => { 
            e.stopPropagation(); 
            setSelectedZone({ 
              suburb: "MILLERS JUNCTION DEPTHS", 
              biome: BiomeType.SHATTERED_SUBURBIA, 
              faction: FactionType.IRON_CONSORTIUM, 
              description: "The buildings are crumbling, and a dark wide pit leads deep underground. The air here is heavy with resonance.", 
              coords: MILLERS_JUNCTION_DEPTHS_COORDS, 
              isHostile: false,
              isDungeon: true
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

      {tutorialProgress.currentStep >= 59 && (
        <Marker 
          coordinate={ALTONA_GATE_COORDS} 
          anchor={{ x: 0.5, y: 0.5 }} 
          zIndex={70} 
          tracksViewChanges={true} 
          onPress={(e) => { 
            e.stopPropagation(); 
            setSelectedZone({ 
              suburb: "ALTONA GATE SETTLEMENT", 
              biome: BiomeType.SHATTERED_SUBURBIA, 
              faction: FactionType.NEO_TECHNOCRATS, 
              description: "A bustling enclave of survivors. Warm lights and the smell of ozone fill the air. A place of relative safety.", 
              coords: ALTONA_GATE_COORDS, 
              isHostile: false,
              isSettlement: true
            }); 
          }}
        >
          <View style={markerStyles.container}>
            <View className="w-8 h-8 bg-emerald-900/40 rounded-full items-center justify-center border-2 border-emerald-500 shadow-lg shadow-emerald-500">
              <Home size={18} color="#10b981" />
            </View>
          </View>
        </Marker>
      )}

      <Marker coordinate={playerLocation} anchor={{ x: 0.5, y: 0.5 }} zIndex={50} tracksViewChanges={tutorialProgress.currentStep < 58 ? true : shouldTrackMarkers}><View style={markerStyles.container}><View className="w-7 h-7 bg-cyan-500/20 rounded-full items-center justify-center border-2 border-cyan-400"><View className="w-3 h-3 bg-cyan-400 rounded-full" /></View></View></Marker>
      {(hostileSignals || []).filter(s => !s.respawnAt).map((signal) => {
        const isTutorialEnemy = signal.id.startsWith('tutorial-dog');
        if (isTutorialRestricted && !isTutorialEnemy) return null;
        return (
          <React.Fragment key={signal.id}>
            <Marker 
              coordinate={signal.coords} 
              anchor={{ x: 0.5, y: 0.5 }} 
              zIndex={isTutorialEnemy ? 100 : (signal.type === 'Boss' ? 30 : 20)} 
              tracksViewChanges={true} 
              onPress={(e) => { if (isTutorialRestricted && !isTutorialEnemy) return; e.stopPropagation(); handleMapPress({ nativeEvent: { coordinate: signal.coords } } as any); }}
            >
              <View style={markerStyles.container}>
                <View className={`w-7 h-7 rounded-full items-center justify-center border-2 ${signal.type === 'Boss' ? 'bg-purple-500/20 border-purple-500' : 'bg-red-500/20 border-red-500/40'}`}>
                  {signal.type === 'Boss' ? <Skull size={12} color="#a855f7" /> : <Activity size={10} color="#ef4444" />}
                </View>
              </View>
            </Marker>
          </React.Fragment>
        );
      })}
    </MapView>
  );
};

export default FractureMap;
