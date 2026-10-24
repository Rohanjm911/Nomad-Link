import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { SavedWaypointModel } from '../../domain/models/DomainModels';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { SectionHeader } from '../../components/FeedbackStates';

export const ConvoyScreen: React.FC = () => {
  const { convoy, sendConvoyRegroup, deadReckoning } = useNomad();
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(true);

  const handleRegroup = () => {
    Alert.alert(
      'DISPATCH CONVOY REGROUP SIGNAL?',
      'This will broadcast a high-priority regroup alert to all convoy members. Navigation coordinates will snap to the convoy regroup waypoint.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DISPATCH REGROUP',
          onPress: () => {
            sendConvoyRegroup();
            Alert.alert(
              'Regroup Signal Broadcasted',
              'All nodes in the mesh have received the regroup directive.'
            );
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MOVING':
        return DarkThemeColors.successGreen;
      case 'REGROUPING':
        return DarkThemeColors.warningAmber;
      case 'ASSISTANCE_REQUESTED':
        return DarkThemeColors.emergencyRed;
      default:
        return DarkThemeColors.mutedText;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.convoyName}>{convoy.convoyName}</Text>
          <Text style={styles.convoyMeta}>
            Convoy ID: {convoy.convoyId} · {convoy.members.length} Expedition Vehicles
          </Text>
        </View>

        <TouchableOpacity style={styles.regroupBtn} onPress={handleRegroup} activeOpacity={0.8}>
          <Text style={styles.regroupBtnText}>REGROUP</Text>
        </TouchableOpacity>
      </View>

      
      <View style={styles.mapCard}>
        <View style={styles.mapHeaderRow}>
          <Text style={styles.mapTitle}>TACTICAL CONVOY POSITION MAP</Text>
          <Text style={styles.mapModeBadge}>OFFLINE SENSOR FIX</Text>
        </View>

        <View style={styles.mapCanvas}>
          
          <View style={styles.gridLineHorizontal} />
          <View style={styles.gridLineVertical} />

          
          {convoy.members.map((member, idx) => {
            const isMe = member.peerId.includes('Alpha') || idx === 1;
            const topOffset = 25 + idx * 35;
            const leftOffset = 20 + idx * 30;

            return (
              <View
                key={member.peerId}
                style={[
                  styles.mapPin,
                  { top: `${topOffset}%`, left: `${leftOffset}%` },
                  isMe && styles.myPin,
                ]}
              >
                <View
                  style={[
                    styles.pinDot,
                    { backgroundColor: getStatusColor(member.status) },
                  ]}
                />
                <Text style={styles.pinLabel}>{member.alias.split(' ')[0]}</Text>
              </View>
            );
          })}

          <View style={styles.regroupTargetPin}>
            <Text style={styles.regroupTargetText}>★ REGROUP PT (Khardung La)</Text>
          </View>
        </View>

        <View style={styles.mapFooter}>
          <Text style={styles.mapFooterText}>
            Local Fix: {deadReckoning.latitude.toFixed(4)}° N, {deadReckoning.longitude.toFixed(4)}° E (±{deadReckoning.uncertaintyRadiusMeters}m)
          </Text>
          <TouchableOpacity
            style={styles.sharingToggle}
            onPress={() => setIsLocationSharingActive(!isLocationSharingActive)}
          >
            <Text
              style={[
                styles.sharingToggleText,
                { color: isLocationSharingActive ? DarkThemeColors.successGreen : DarkThemeColors.warningAmber },
              ]}
            >
              {isLocationSharingActive ? '● Sharing Active' : '○ Sharing Paused'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      
      <SectionHeader title="Convoy Telemetry & Formation" />
      {convoy.members.map(item => {
        const statusColor = getStatusColor(item.status);
        const fixAgeSec = Math.round((Date.now() - item.lastFixTimestamp) / 1000);
        const isStale = fixAgeSec > 25;

        return (
          <View key={item.peerId} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <View style={styles.titleRow}>
                <Text style={styles.memberAlias}>{item.alias}</Text>
                {item.isLeader && (
                  <View style={styles.leaderBadge}>
                    <Text style={styles.leaderBadgeText}>LEAD</Text>
                  </View>
                )}
              </View>

              <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.telemetryRow}>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>{item.speedKmh} km/h</Text>
                <Text style={styles.telemetryLabel}>Speed</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>{item.headingDegrees}°</Text>
                <Text style={styles.telemetryLabel}>Heading</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text style={styles.telemetryVal}>{item.altitudeMeters} m</Text>
                <Text style={styles.telemetryLabel}>Altitude</Text>
              </View>
              <View style={styles.telemetryItem}>
                <Text
                  style={[
                    styles.telemetryVal,
                    {
                      color: item.isDeadReckoning
                        ? DarkThemeColors.warningAmber
                        : DarkThemeColors.successGreen,
                    },
                  ]}
                >
                  {item.isDeadReckoning ? 'DR' : 'GPS'}
                </Text>
                <Text style={styles.telemetryLabel}>Fix Source</Text>
              </View>
            </View>

            <View style={styles.coordRow}>
              <Text style={styles.coordText}>
                {item.latitude.toFixed(5)}° N, {item.longitude.toFixed(5)}° E
              </Text>
              <Text
                style={[
                  styles.ageText,
                  { color: isStale ? DarkThemeColors.warningAmber : DarkThemeColors.mutedText },
                ]}
              >
                {isStale ? `▲ Stale Fix: ${fixAgeSec}s ago` : `Fresh Fix: ${fixAgeSec}s ago`}
              </Text>
            </View>
          </View>
        );
      })}

      
      <SectionHeader title="Expedition Waypoints" />
      <View style={styles.waypointContainer}>
        {convoy.activeWaypoints.map((wp: SavedWaypointModel) => (
          <View key={wp.id} style={styles.waypointItem}>
            <View>
              <Text style={styles.wpName}>{wp.name}</Text>
              <Text style={styles.wpCoords}>
                {wp.latitude.toFixed(4)}° N, {wp.longitude.toFixed(4)}° E {wp.altitudeMeters ? `· Alt: ${wp.altitudeMeters}m` : ''}
              </Text>
            </View>
            <View style={styles.wpTag}>
              <Text style={styles.wpTagText}>SAVED</Text>
            </View>
          </View>
        ))}
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  headerTitleWrap: {
    flex: 1,
  },
  convoyName: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
  },
  convoyMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
  },
  regroupBtn: {
    backgroundColor: DarkThemeColors.warningAmberSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.warningAmber,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
  },
  regroupBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.warningAmber,
    fontWeight: '800',
  },
  mapCard: {
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
  mapTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
  },
  mapModeBadge: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
  },
  mapCanvas: {
    height: 180,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: NomadSpacing.sm,
  },
  gridLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: DarkThemeColors.border,
  },
  gridLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: DarkThemeColors.border,
  },
  mapPin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkThemeColors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
  },
  myPin: {
    borderColor: DarkThemeColors.actionBlue,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  pinLabel: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.primaryText,
  },
  regroupTargetPin: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: DarkThemeColors.warningAmberSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.warningAmber,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: NomadRadius.sm,
  },
  regroupTargetText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.warningAmber,
    fontWeight: '700',
  },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: NomadSpacing.xs,
  },
  mapFooterText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  sharingToggle: {
    paddingVertical: 2,
  },
  sharingToggleText: {
    ...NomadTypography.metadata,
    fontWeight: '700',
  },
  memberCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  leaderBadge: {
    backgroundColor: DarkThemeColors.actionBlueSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.actionBlue,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: NomadSpacing.sm,
  },
  leaderBadgeText: {
    ...NomadTypography.metadata,
    fontSize: 9,
    color: DarkThemeColors.actionBlue,
    fontWeight: '800',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 2,
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  statusText: {
    ...NomadTypography.metadata,
    fontSize: 11,
    fontWeight: '700',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderRadius: NomadRadius.sm,
    padding: NomadSpacing.sm,
    marginBottom: NomadSpacing.sm,
  },
  telemetryItem: {
    alignItems: 'center',
  },
  telemetryVal: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  telemetryLabel: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    fontSize: 10,
    marginTop: 2,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordText: {
    ...NomadTypography.mono,
    fontSize: 12,
    color: DarkThemeColors.secondaryText,
  },
  ageText: {
    ...NomadTypography.metadata,
    fontSize: 11,
    fontWeight: '600',
  },
  waypointContainer: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
  },
  waypointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: NomadSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.borderSubtle,
  },
  wpName: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  wpCoords: {
    ...NomadTypography.mono,
    fontSize: 11,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
  wpTag: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: NomadRadius.sm,
  },
  wpTagText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.secondaryText,
    fontWeight: '700',
  },
});
