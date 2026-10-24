import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { SectionHeader } from '../../components/FeedbackStates';

interface OfflineRegion {
  id: string;
  name: string;
  sizeMb: number;
  status: 'DOWNLOADED' | 'DOWNLOADING' | 'AVAILABLE';
  lastUpdated: string;
}

interface OfflineMapsScreenProps {
  onNavigate?: (tab: string, peerId?: string) => void;
}

export const OfflineMapsScreen: React.FC<OfflineMapsScreenProps> = ({ onNavigate }) => {
  const { deadReckoning, addWaypoint, convoy } = useNomad();
  const [selectedTab, setSelectedTab] = useState<'map' | 'manager'>('map');
  const [waypointName, setWaypointName] = useState('');
  const [isMarkingWaypoint, setIsMarkingWaypoint] = useState(false);
  const [zoomLevelMeters, setZoomLevelMeters] = useState(500);
  const [mapLayer, setMapLayer] = useState<'contour' | 'terrain' | 'grid'>('contour');

  const [regions, setRegions] = useState<OfflineRegion[]>([
    {
      id: 'reg-1',
      name: 'Ladakh & Zanskar Valley High-Altitude Corridor',
      sizeMb: 482,
      status: 'DOWNLOADED',
      lastUpdated: 'Yesterday',
    },
    {
      id: 'reg-2',
      name: 'Spiti Valley & Kunzum Pass Sector',
      sizeMb: 340,
      status: 'AVAILABLE',
      lastUpdated: 'Available for download',
    },
    {
      id: 'reg-3',
      name: 'Manali - Rohtang Topographic Grid',
      sizeMb: 215,
      status: 'AVAILABLE',
      lastUpdated: 'Available for download',
    },
  ]);

  const handleDownloadRegion = (regionId: string) => {
    setRegions(prev =>
      prev.map(r => (r.id === regionId ? { ...r, status: 'DOWNLOADING' } : r))
    );
    setTimeout(() => {
      setRegions(prev =>
        prev.map(r =>
          r.id === regionId ? { ...r, status: 'DOWNLOADED', lastUpdated: 'Just now' } : r
        )
      );
      Alert.alert('Region Cached', 'Topographic vector tiles saved to device offline storage.');
    }, 1200);
  };

  const handleDeleteRegion = (regionId: string) => {
    Alert.alert('Delete Map Cache?', 'This region will need to be re-downloaded over Wi-Fi.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setRegions(prev =>
            prev.map(r => (r.id === regionId ? { ...r, status: 'AVAILABLE' } : r))
          );
        },
      },
    ]);
  };

  const handleZoomIn = () => {
    setZoomLevelMeters(prev => Math.max(100, Math.round(prev / 2)));
  };

  const handleZoomOut = () => {
    setZoomLevelMeters(prev => Math.min(5000, Math.round(prev * 2)));
  };

  const handleToggleLayer = () => {
    setMapLayer(prev => {
      if (prev === 'contour') return 'terrain';
      if (prev === 'terrain') return 'grid';
      return 'contour';
    });
  };

  const handleRecenter = () => {
    Alert.alert(
      'Map Recentered',
      `Locked to current position:\n${deadReckoning.latitude.toFixed(5)}°N, ${deadReckoning.longitude.toFixed(5)}°E\nSensor Fix: ${deadReckoning.isGpsActive ? 'GNSS Lock' : 'Dead-Reckoning'}`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.screenHeading}>OFFLINE NAVIGATION & MAPS</Text>
          <Text style={styles.screenSubtitle}>
            Zero cellular connection required. Topographic vector tiles cached locally.
          </Text>
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, selectedTab === 'map' && styles.tabBtnActive]}
            onPress={() => setSelectedTab('map')}
          >
            <Text style={[styles.tabBtnText, selectedTab === 'map' && styles.tabBtnTextActive]}>
              Navigation
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, selectedTab === 'manager' && styles.tabBtnActive]}
            onPress={() => setSelectedTab('manager')}
          >
            <Text style={[styles.tabBtnText, selectedTab === 'manager' && styles.tabBtnTextActive]}>
              Map Packs ({regions.filter(r => r.status === 'DOWNLOADED').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'map' ? (
        <>
          
          <View style={styles.mapDisplayCard}>
            <View style={styles.mapHeaderRow}>
              <Text style={styles.mapBadge}>CACHED REGION: LADAKH (OFFLINE)</Text>
              <Text
                style={[
                  styles.fixStateBadge,
                  {
                    color: deadReckoning.isGpsActive
                      ? DarkThemeColors.successGreen
                      : DarkThemeColors.warningAmber,
                  },
                ]}
              >
                {deadReckoning.isGpsActive ? '● GNSS CONFIRMED' : '▲ INERTIAL ESTIMATION'}
              </Text>
            </View>

            
            {/* VECTOR MAP CANVAS */}
            <View style={styles.vectorCanvas}>
              {mapLayer === 'contour' && (
                <>
                  <View style={styles.contourLine1} />
                  <View style={styles.contourLine2} />
                  <View style={styles.trailPath} />
                </>
              )}
              {mapLayer === 'terrain' && (
                <View style={styles.terrainOverlay}>
                  <View style={styles.contourLine1} />
                  <View style={styles.reliefShading} />
                </View>
              )}
              {mapLayer === 'grid' && (
                <View style={styles.gridOverlay}>
                  <View style={styles.trailPath} />
                  <View style={styles.gridLineH1} />
                  <View style={styles.gridLineH2} />
                  <View style={styles.gridLineV1} />
                  <View style={styles.gridLineV2} />
                </View>
              )}

              {/* SAVED WAYPOINTS PINS ON CANVAS */}
              {convoy.activeWaypoints.map((wp, idx) => (
                <TouchableOpacity
                  key={wp.id}
                  style={[
                    styles.canvasWpPin,
                    { top: `${30 + (idx % 3) * 25}%`, left: `${20 + (idx % 4) * 20}%` },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      wp.name,
                      `Coordinates: ${wp.latitude.toFixed(4)}°N, ${wp.longitude.toFixed(4)}°E\nAltitude: ${wp.altitudeMeters || 4350}m\n${wp.notes || ''}`
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.canvasWpIcon}>📍</Text>
                  <Text style={styles.canvasWpName} numberOfLines={1}>
                    {wp.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* USER CURRENT POSITION FIX */}
              <View style={styles.posMarker}>
                <View style={styles.posHeadingCone} />
                <View style={styles.posCenterDot} />
              </View>

              {/* SCALE BAR */}
              <View style={styles.scaleBar}>
                <View style={styles.scaleLine} />
                <Text style={styles.scaleText}>{zoomLevelMeters} m</Text>
              </View>

              {/* MAP TOOLBAR (ZOOM / RECENTER / LAYER) */}
              <View style={styles.canvasToolbar}>
                <TouchableOpacity
                  style={styles.canvasToolBtn}
                  onPress={handleZoomIn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.canvasToolText}>＋</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.canvasToolBtn}
                  onPress={handleZoomOut}
                  activeOpacity={0.7}
                >
                  <Text style={styles.canvasToolText}>－</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.canvasToolBtn}
                  onPress={handleRecenter}
                  activeOpacity={0.7}
                >
                  <Text style={styles.canvasToolIcon}>🎯</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.canvasToolBtn}
                  onPress={handleToggleLayer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.canvasToolIcon}>
                    {mapLayer === 'contour' ? '⛰️' : mapLayer === 'terrain' ? '🛰️' : '▦'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* COMPASS ROSE */}
              <TouchableOpacity
                style={styles.compassBox}
                onPress={() =>
                  Alert.alert(
                    'Magnetic Compass',
                    `Current Heading: ${deadReckoning.headingDegrees.toFixed(1)}° Magnetic North.\nInertial Sensor Bias: ±0.4°.\nDeclination corrected for Ladakh sector.`
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.compassNorth}>N</Text>
                <Text style={styles.compassDeg}>{deadReckoning.headingDegrees.toFixed(0)}°</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapFooterRow}>
              <View>
                <Text style={styles.coordDisplay}>
                  {deadReckoning.latitude.toFixed(5)}° N, {deadReckoning.longitude.toFixed(5)}° E
                </Text>
                <Text style={styles.accuracyNote}>
                  Sensor Uncertainty Radius: ±{deadReckoning.uncertaintyRadiusMeters}m (Kalman Fused)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.markWpBtn}
                onPress={() => setIsMarkingWaypoint(!isMarkingWaypoint)}
              >
                <Text style={styles.markWpBtnText}>
                  {isMarkingWaypoint ? 'Cancel ✕' : '+ Waypoint'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* WAYPOINT PROMPT CARD */}
          {isMarkingWaypoint && (
            <View style={styles.waypointPromptCard}>
              <Text style={styles.promptTitle}>SAVE CURRENT SENSOR COORDINATES</Text>
              <TextInput
                style={styles.wpInput}
                value={waypointName}
                onChangeText={setWaypointName}
                placeholder="Waypoint name (e.g. Camp 1 / Water Source)"
                placeholderTextColor={DarkThemeColors.mutedText}
              />
              <View style={styles.promptActions}>
                <PrimaryButton
                  label="Save Waypoint"
                  onPress={() => {
                    if (waypointName.trim()) {
                      addWaypoint({
                        name: waypointName.trim(),
                        latitude: deadReckoning.latitude,
                        longitude: deadReckoning.longitude,
                        altitudeMeters: 4350,
                        notes: 'Saved from Offline Maps Navigation',
                      });
                      Alert.alert(
                        'Waypoint Recorded',
                        `Saved "${waypointName}" at current coordinates and synced with Convoy.`
                      );
                      setWaypointName('');
                      setIsMarkingWaypoint(false);
                    }
                  }}
                  style={styles.promptBtn}
                />
                <SecondaryButton
                  label="Cancel"
                  onPress={() => setIsMarkingWaypoint(false)}
                  style={styles.promptBtn}
                />
              </View>
            </View>
          )}

          {/* ACTIVE WAYPOINTS LIST */}
          <SectionHeader title={`Sector Waypoints (${convoy.activeWaypoints.length})`} />
          <View style={styles.wpListCard}>
            {convoy.activeWaypoints.map(wp => (
              <TouchableOpacity
                key={wp.id}
                style={styles.wpRow}
                onPress={() =>
                  Alert.alert(
                    wp.name,
                    `Fix: ${wp.latitude.toFixed(4)}°N, ${wp.longitude.toFixed(4)}°E\nAltitude: ${wp.altitudeMeters || 4350}m\n${wp.notes || ''}`
                  )
                }
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.wpRowTitle}>{wp.name}</Text>
                  <Text style={styles.wpRowCoords}>
                    {wp.latitude.toFixed(4)}° N, {wp.longitude.toFixed(4)}° E · {wp.altitudeMeters || 4350}m
                  </Text>
                </View>
                <Text style={styles.wpRowChevron}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>OFFLINE ROUTING ADVISORY</Text>
            <Text style={styles.noticeBody}>
              Offline vector maps provide topographical contour reference and waypoint bearings. Turn-by-turn routing is not synthesized without road graphs. Always cross-reference with physical compass.
            </Text>
          </View>
        </>
      ) : (
        
        <View style={styles.managerContainer}>
          <SectionHeader title="Downloaded Offline Map Packs" />
          {regions.map(r => {
            const isDownloaded = r.status === 'DOWNLOADED';

            return (
              <View key={r.id} style={styles.regionCard}>
                <View style={styles.regionHeader}>
                  <View style={styles.regionInfo}>
                    <Text style={styles.regionName}>{r.name}</Text>
                    <Text style={styles.regionMeta}>
                      Size: {r.sizeMb} MB · Status: {r.status} · {r.lastUpdated}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.regionStatusBadge,
                      {
                        backgroundColor: isDownloaded
                          ? DarkThemeColors.successGreenSubtle
                          : DarkThemeColors.surfaceSubtle,
                        borderColor: isDownloaded
                          ? DarkThemeColors.successGreen
                          : DarkThemeColors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.regionStatusText,
                        {
                          color: isDownloaded
                            ? DarkThemeColors.successGreen
                            : DarkThemeColors.secondaryText,
                        },
                      ]}
                    >
                      {isDownloaded ? 'READY' : 'AVAILABLE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.regionActionRow}>
                  {isDownloaded ? (
                    <TouchableOpacity
                      style={styles.deleteRegionBtn}
                      onPress={() => handleDeleteRegion(r.id)}
                    >
                      <Text style={styles.deleteRegionText}>Delete Offline Pack</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.downloadRegionBtn}
                      onPress={() => handleDownloadRegion(r.id)}
                    >
                      <Text style={styles.downloadRegionText}>Download ({r.sizeMb} MB)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  content: {
    padding: NomadSpacing.md,
    paddingBottom: NomadSpacing.xxl,
  },
  header: {
    marginBottom: NomadSpacing.md,
  },
  screenHeading: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.8,
  },
  screenSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    padding: 4,
    borderRadius: NomadRadius.md,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    marginTop: NomadSpacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: NomadSpacing.sm,
    alignItems: 'center',
    borderRadius: NomadRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: DarkThemeColors.surface,
  },
  tabBtnText: {
    ...NomadTypography.button,
    fontSize: 13,
    color: DarkThemeColors.secondaryText,
  },
  tabBtnTextActive: {
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  mapDisplayCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
  },
  mapBadge: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
    fontSize: 10,
  },
  fixStateBadge: {
    ...NomadTypography.metadata,
    fontWeight: '700',
    fontSize: 10,
  },
  vectorCanvas: {
    height: 240,
    backgroundColor: '#141E26',
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contourLine1: {
    position: 'absolute',
    top: 40,
    left: -40,
    width: 320,
    height: 120,
    borderWidth: 1,
    borderColor: '#243444',
    borderRadius: 80,
    transform: [{ rotate: '-15deg' }],
  },
  contourLine2: {
    position: 'absolute',
    top: 90,
    left: -20,
    width: 280,
    height: 90,
    borderWidth: 1,
    borderColor: '#243444',
    borderRadius: 70,
    transform: [{ rotate: '-10deg' }],
  },
  trailPath: {
    position: 'absolute',
    width: 2,
    height: 200,
    backgroundColor: DarkThemeColors.warningAmber,
    transform: [{ rotate: '45deg' }],
  },
  posMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  posHeadingCone: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: DarkThemeColors.actionBlue,
    marginBottom: -4,
  },
  posCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: DarkThemeColors.actionBlue,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  scaleBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  scaleLine: {
    width: 60,
    height: 2,
    backgroundColor: DarkThemeColors.secondaryText,
    marginBottom: 2,
  },
  scaleText: {
    ...NomadTypography.metadata,
    fontSize: 9,
    color: DarkThemeColors.secondaryText,
  },
  compassBox: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: DarkThemeColors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    alignItems: 'center',
  },
  compassNorth: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '800',
    fontSize: 10,
  },
  compassDeg: {
    ...NomadTypography.mono,
    fontSize: 9,
    color: DarkThemeColors.primaryText,
  },
  mapFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NomadSpacing.md,
  },
  coordDisplay: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
    fontSize: 13,
  },
  accuracyNote: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    fontSize: 11,
  },
  markWpBtn: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
  },
  markWpBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.actionBlue,
  },
  waypointPromptCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  promptTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.sm,
  },
  wpInput: {
    minHeight: 44,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    color: DarkThemeColors.primaryText,
    marginBottom: NomadSpacing.md,
    ...NomadTypography.body,
  },
  promptActions: {
    flexDirection: 'row',
    gap: 8,
  },
  promptBtn: {
    flex: 1,
  },
  noticeCard: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
  },
  noticeTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  noticeBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 18,
  },
  managerContainer: {
    flex: 1,
  },
  regionCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: NomadSpacing.md,
  },
  regionInfo: {
    flex: 1,
    marginRight: NomadSpacing.sm,
  },
  regionName: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  regionMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
  },
  regionStatusBadge: {
    borderWidth: 1,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  regionStatusText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    fontWeight: '700',
  },
  regionActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  downloadRegionBtn: {
    backgroundColor: DarkThemeColors.actionBlue,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
  },
  downloadRegionText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: '#FFFFFF',
  },
  deleteRegionBtn: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
  },
  deleteRegionText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.emergencyRed,
  },
  terrainOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B2A38',
  },
  reliefShading: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 200,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 50,
    transform: [{ rotate: '-25deg' }],
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  canvasWpPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: DarkThemeColors.warningAmber,
    maxWidth: 90,
    gap: 3,
  },
  canvasWpIcon: {
    fontSize: 9,
  },
  canvasWpName: {
    ...NomadTypography.monoSmall,
    fontSize: 8,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  canvasToolbar: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.full,
    padding: 2,
    gap: 2,
  },
  canvasToolBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  canvasToolText: {
    color: DarkThemeColors.primaryText,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  canvasToolIcon: {
    fontSize: 11,
  },
  wpListCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.sm,
    marginBottom: NomadSpacing.md,
  },
  wpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: NomadSpacing.xs + 2,
    paddingHorizontal: NomadSpacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.borderSubtle,
  },
  wpRowTitle: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    fontSize: 12.5,
  },
  wpRowCoords: {
    ...NomadTypography.mono,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
  wpRowChevron: {
    ...NomadTypography.mono,
    fontSize: 14,
    color: DarkThemeColors.actionBlue,
  },
});
