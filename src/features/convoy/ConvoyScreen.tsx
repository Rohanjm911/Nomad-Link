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
import { TextInput } from 'react-native';

interface ConvoyScreenProps {
  onNavigate?: (tab: string, peerId?: string) => void;
}

export const ConvoyScreen: React.FC<ConvoyScreenProps> = ({ onNavigate }) => {
  const {
    convoy,
    sendConvoyRegroup,
    deadReckoning,
    identity,
    updateConvoyMemberStatus,
    addWaypoint,
    removeWaypoint,
  } = useNomad();
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [newWpName, setNewWpName] = useState('');

  const myMember = convoy.members.find(m => m.peerId === identity.peerId) || convoy.members[1];
  const myStatus = myMember?.status || 'MOVING';

  const handleStatusChange = (status: 'MOVING' | 'STOPPED' | 'REGROUPING' | 'ASSISTANCE_REQUESTED') => {
    updateConvoyMemberStatus(identity.peerId, status);
    Alert.alert('Vehicle Telemetry Updated', `Convoy status transmitted: ${status}`);
  };

  const handleCreateCheckpoint = () => {
    if (!newWpName.trim()) return;
    addWaypoint({
      name: newWpName.trim(),
      latitude: deadReckoning.latitude,
      longitude: deadReckoning.longitude,
      altitudeMeters: 4350,
      notes: `Recorded by ${identity.alias}`,
    });
    Alert.alert('Checkpoint Saved', `Added checkpoint "${newWpName}" to convoy expedition waypoints.`);
    setNewWpName('');
    setIsAddingWaypoint(false);
  };

  const handleWaypointAction = (wp: SavedWaypointModel) => {
    Alert.alert(
      `Waypoint: ${wp.name}`,
      `Coordinates: ${wp.latitude.toFixed(4)}°N, ${wp.longitude.toFixed(4)}°E\nAltitude: ${wp.altitudeMeters || 4350}m\nNotes: ${wp.notes || 'None'}`,
      [
        {
          text: 'Navigate Here (Maps)',
          onPress: () => onNavigate && onNavigate('Maps'),
        },
        {
          text: 'Remove Checkpoint',
          style: 'destructive',
          onPress: () => removeWaypoint(wp.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

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
      case 'STOPPED':
        return DarkThemeColors.secondaryText;
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

      
      {/* MY VEHICLE TELEMETRY CONTROLS */}
      <View style={styles.myStatusCard}>
        <Text style={styles.myStatusTitle}>MY VEHICLE TELEMETRY STATUS</Text>
        <View style={styles.statusChipsRow}>
          <TouchableOpacity
            style={[styles.statusChip, myStatus === 'MOVING' && styles.statusChipActiveGreen]}
            onPress={() => handleStatusChange('MOVING')}
          >
            <Text style={[styles.statusChipText, myStatus === 'MOVING' && styles.statusChipTextActive]}>
              ● MOVING
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusChip, myStatus === 'STOPPED' && styles.statusChipActiveMuted]}
            onPress={() => handleStatusChange('STOPPED')}
          >
            <Text style={[styles.statusChipText, myStatus === 'STOPPED' && styles.statusChipTextActive]}>
              ⏸ STOPPED
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusChip, myStatus === 'REGROUPING' && styles.statusChipActiveAmber]}
            onPress={() => handleStatusChange('REGROUPING')}
          >
            <Text style={[styles.statusChipText, myStatus === 'REGROUPING' && styles.statusChipTextActive]}>
              ★ REGROUP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusChip, myStatus === 'ASSISTANCE_REQUESTED' && styles.statusChipActiveRed]}
            onPress={() => handleStatusChange('ASSISTANCE_REQUESTED')}
          >
            <Text style={[styles.statusChipText, myStatus === 'ASSISTANCE_REQUESTED' && styles.statusChipTextActive]}>
              🚨 NEED HELP
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TACTICAL MAP CARD */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeaderRow}>
          <Text style={styles.mapTitle}>TACTICAL CONVOY POSITION MAP</Text>
          <Text style={styles.mapModeBadge}>OFFLINE SENSOR FIX</Text>
        </View>

        <View style={styles.mapCanvas}>
          <View style={styles.gridLineHorizontal} />
          <View style={styles.gridLineVertical} />

          {convoy.members.map((member, idx) => {
            const isMe = member.peerId === identity.peerId || member.peerId.includes('Alpha');
            const isSelected = selectedMemberId === member.peerId;
            const topOffset = 25 + idx * 35;
            const leftOffset = 20 + idx * 30;

            return (
              <TouchableOpacity
                key={member.peerId}
                style={[
                  styles.mapPin,
                  { top: `${topOffset}%`, left: `${leftOffset}%` },
                  isMe && styles.myPin,
                  isSelected && styles.selectedPin,
                ]}
                onPress={() => setSelectedMemberId(isSelected ? null : member.peerId)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.pinDot,
                    { backgroundColor: getStatusColor(member.status) },
                  ]}
                />
                <Text style={styles.pinLabel}>{member.alias.split(' ')[0]}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.regroupTargetPin}
            onPress={() => onNavigate && onNavigate('Maps')}
            activeOpacity={0.7}
          >
            <Text style={styles.regroupTargetText}>★ REGROUP PT (Khardung La)</Text>
          </TouchableOpacity>
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

      {/* SECTION: CONVOY ROSTER */}
      <SectionHeader title="Convoy Telemetry & Formation" />
      {convoy.members.map(item => {
        const isMe = item.peerId === identity.peerId || item.peerId.includes('Alpha');
        const statusColor = getStatusColor(item.status);
        const fixAgeSec = Math.round((Date.now() - item.lastFixTimestamp) / 1000);
        const isStale = fixAgeSec > 25;

        return (
          <View
            key={item.peerId}
            style={[
              styles.memberCard,
              selectedMemberId === item.peerId && styles.memberCardHighlighted,
            ]}
          >
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

            {!isMe && (
              <View style={styles.memberActionRow}>
                <TouchableOpacity
                  style={styles.messageMemberBtn}
                  onPress={() => onNavigate && onNavigate('Messages', item.peerId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.messageMemberText}>Direct Comms →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {/* SECTION: EXPEDITION WAYPOINTS */}
      <SectionHeader
        title="Expedition Waypoints"
        actionText={isAddingWaypoint ? 'Cancel ✕' : '+ Add Checkpoint'}
        onAction={() => setIsAddingWaypoint(!isAddingWaypoint)}
      />

      {isAddingWaypoint && (
        <View style={styles.addWpCard}>
          <Text style={styles.addWpTitle}>RECORD CHECKPOINT AT CURRENT GPS FIX</Text>
          <TextInput
            style={styles.addWpInput}
            value={newWpName}
            onChangeText={setNewWpName}
            placeholder="e.g. Ridge Rest Area / River Crossing"
            placeholderTextColor={DarkThemeColors.mutedText}
          />
          <TouchableOpacity
            style={[styles.saveWpBtn, !newWpName.trim() && styles.btnDisabled]}
            disabled={!newWpName.trim()}
            onPress={handleCreateCheckpoint}
          >
            <Text style={styles.saveWpBtnText}>Save Waypoint to Mesh</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.waypointContainer}>
        {convoy.activeWaypoints.map((wp: SavedWaypointModel) => (
          <TouchableOpacity
            key={wp.id}
            style={styles.waypointItem}
            onPress={() => handleWaypointAction(wp)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.wpName}>{wp.name}</Text>
              <Text style={styles.wpCoords}>
                {wp.latitude.toFixed(4)}° N, {wp.longitude.toFixed(4)}° E {wp.altitudeMeters ? `· Alt: ${wp.altitudeMeters}m` : ''}
              </Text>
              <Text style={styles.wpSubAction}>Tap to view navigation or delete</Text>
            </View>
            <View style={styles.wpTag}>
              <Text style={styles.wpTagText}>SAVED</Text>
            </View>
          </TouchableOpacity>
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
  wpSubAction: {
    ...NomadTypography.metadata,
    fontSize: 9.5,
    color: DarkThemeColors.actionBlue,
    marginTop: 2,
  },
  myStatusCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  myStatusTitle: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.sm,
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: {
    ...NomadTypography.monoSmall,
    fontSize: 9.5,
    color: DarkThemeColors.secondaryText,
    fontWeight: '700',
  },
  statusChipActiveGreen: {
    backgroundColor: DarkThemeColors.successGreenSubtle,
    borderColor: DarkThemeColors.successGreen,
  },
  statusChipActiveMuted: {
    backgroundColor: DarkThemeColors.surfaceElevated,
    borderColor: DarkThemeColors.primaryText,
  },
  statusChipActiveAmber: {
    backgroundColor: DarkThemeColors.warningAmberSubtle,
    borderColor: DarkThemeColors.warningAmber,
  },
  statusChipActiveRed: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderColor: DarkThemeColors.emergencyRed,
  },
  statusChipTextActive: {
    color: DarkThemeColors.primaryText,
  },
  selectedPin: {
    borderColor: DarkThemeColors.warningAmber,
    borderWidth: 2,
  },
  memberCardHighlighted: {
    borderColor: DarkThemeColors.actionBlue,
  },
  memberActionRow: {
    marginTop: NomadSpacing.sm,
    paddingTop: NomadSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
    alignItems: 'flex-end',
  },
  messageMemberBtn: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: NomadRadius.full,
  },
  messageMemberText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
  },
  addWpCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  addWpTitle: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.sm,
  },
  addWpInput: {
    minHeight: 40,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.md,
    color: DarkThemeColors.primaryText,
    marginBottom: NomadSpacing.sm,
    ...NomadTypography.body,
    fontSize: 13,
  },
  saveWpBtn: {
    backgroundColor: DarkThemeColors.actionBlue,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
    alignItems: 'center',
  },
  saveWpBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
