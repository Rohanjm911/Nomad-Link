import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { SectionHeader } from '../../components/FeedbackStates';
import { TrustBadge, SignalMeter, TransportBadge } from '../../components/Badges';
import { TacticalActionButton } from '../../components/Buttons';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const {
    peers,
    deadReckoning,
    isRadioScanning,
    isBackgroundServiceActive,
    convoy,
    startDiscovery,
    stopDiscovery,
  } = useNomad();

  const trustedPeersCount = peers.filter(p => p.trustStatus === 'TRUSTED').length;
  const activeMembersCount = convoy.members.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* SUB-HEADER MISSION TELEMETRY STRIP */}
      <View style={styles.missionStrip}>
        <View style={styles.missionStripLeft}>
          <View style={styles.hudCrosshair} />
          <Text style={styles.missionLabel}>P2P Mesh Router</Text>
        </View>
        <Text style={styles.missionTimestamp}>
          UTC {new Date().toISOString().slice(11, 19)}Z
        </Text>
      </View>

      {/* RF STATUS HUD CARD */}
      <View style={styles.tacticalHudCard}>
        <View style={styles.hudCardHeader}>
          <View style={styles.hudTitleRow}>
            <View
              style={[
                styles.hudLedDot,
                isRadioScanning ? styles.ledGreen : styles.ledAmber,
              ]}
            />
            <Text style={styles.hudCardTitle}>
              {isRadioScanning ? 'Mesh Network Active' : 'Radio Transceiver Standby'}
            </Text>
          </View>
          <View style={styles.tacticalModeBadge}>
            <Text style={styles.tacticalModeText}>BLE 5.2</Text>
          </View>
        </View>

        <Text style={styles.hudCardBody}>
          {peers.length > 0
            ? `Store-and-forward routing active across ${peers.length} discovered node${peers.length === 1 ? '' : 's'}. End-to-end encrypted packet delivery.`
            : 'BLE GATT transceiver listening. No adjacent peer nodes detected in radio perimeter.'}
        </Text>

        <View style={styles.hudDivider} />

        {/* 4-GAUGE TELEMETRY MATRIX */}
        <View style={styles.matrixGrid}>
          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>01</Text>
            <Text style={styles.matrixValue}>{peers.length}</Text>
            <Text style={styles.matrixLabel}>Discovered</Text>
          </View>

          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>02</Text>
            <Text style={[styles.matrixValue, { color: DarkThemeColors.tacticalGreen }]}>
              {trustedPeersCount}
            </Text>
            <Text style={styles.matrixLabel}>Verified</Text>
          </View>

          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>03</Text>
            <Text style={[styles.matrixValue, { color: DarkThemeColors.warningAmber }]}>
              {activeMembersCount}
            </Text>
            <Text style={styles.matrixLabel}>Convoy</Text>
          </View>

          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>04</Text>
            <Text
              style={[
                styles.matrixValue,
                {
                  color: isBackgroundServiceActive
                    ? DarkThemeColors.tacticalGreen
                    : DarkThemeColors.secondaryText,
                },
              ]}
            >
              {isBackgroundServiceActive ? 'Active' : 'Idle'}
            </Text>
            <Text style={styles.matrixLabel}>DTN Relay</Text>
          </View>
        </View>
      </View>

      {/* QUICK TOOLBAR */}
      <View style={styles.quickToolbar}>
        <TacticalActionButton
          label="Broadcast"
          icon="💬"
          accent="cyan"
          onPress={() => onNavigate('Messages')}
          style={{ flex: 1 }}
        />
        <TacticalActionButton
          label={isRadioScanning ? 'Halt Scan' : 'Radar Scan'}
          icon="📡"
          accent={isRadioScanning ? 'amber' : 'green'}
          onPress={isRadioScanning ? stopDiscovery : startDiscovery}
          style={{ flex: 1 }}
        />
        <TacticalActionButton
          label="Distress SOS"
          icon="🚨"
          accent="red"
          onPress={() => onNavigate('Emergency')}
          style={{ flex: 1 }}
        />
      </View>

      {/* SECTION 1: NEARBY MESH NODES */}
      <SectionHeader
        title="Adjacent Mesh Nodes"
        actionText="View Radar →"
        onAction={() => onNavigate('Mesh')}
      />

      {peers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>
            No nodes currently within radio horizon
          </Text>
          <Text style={styles.emptyCardSub}>
            Initiate radar sweep to detect nearby peer transceivers.
          </Text>
        </View>
      ) : (
        peers.slice(0, 2).map(peer => (
          <View key={peer.peerId} style={styles.peerCard}>
            <View style={styles.peerCardHeader}>
              <View>
                <View style={styles.peerAliasRow}>
                  <Text style={styles.peerAlias}>{peer.alias}</Text>
                  <TransportBadge type={peer.transportType} />
                </View>
                <Text style={styles.peerSafetyMono}>
                  FP: {peer.safetyNumber || 'Unverified'}
                </Text>
              </View>
              <TrustBadge status={peer.trustStatus} />
            </View>

            <View style={styles.peerMetaRow}>
              <SignalMeter rssi={peer.rssi} />
              <TouchableOpacity
                style={styles.txActionBtn}
                onPress={() => onNavigate('Messages')}
                activeOpacity={0.7}
              >
                <Text style={styles.txActionText}>Message →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* SECTION 2: CONVOY TELEMETRY */}
      <SectionHeader
        title="Convoy Coordination"
        actionText="Convoy HUD →"
        onAction={() => onNavigate('Convoy')}
      />
      <TouchableOpacity
        style={styles.tacticalCard}
        onPress={() => onNavigate('Convoy')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.formationRow}>
            <Text style={styles.formationIcon}>🚙</Text>
            <Text style={styles.formationName}>{convoy.convoyName}</Text>
          </View>
          <View style={styles.convoyStatusPill}>
            <Text style={styles.convoyStatusText}>{convoy.members.length} Units Active</Text>
          </View>
        </View>
        <Text style={styles.convoyLeadText}>
          Lead: {convoy.members.find(m => m.isLeader)?.alias || 'Standalone'} · Sync: &lt;4s
        </Text>
        <Text style={styles.convoyRouteText}>
          Expedition path snap active via Mesh DR relay.
        </Text>
      </TouchableOpacity>

      {/* SECTION 3: NAVIGATION & POSITION FIX */}
      <SectionHeader
        title="Position Fix & Dead Reckoning"
        actionText="Maps HUD →"
        onAction={() => onNavigate('Maps')}
      />
      <TouchableOpacity
        style={styles.tacticalCard}
        onPress={() => onNavigate('Maps')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.coordDisplay}>
            {deadReckoning.latitude.toFixed(5)}° N · {deadReckoning.longitude.toFixed(5)}° E
          </Text>
          <View
            style={[
              styles.fixPill,
              deadReckoning.isGpsActive ? styles.fixGnss : styles.fixDr,
            ]}
          >
            <View
              style={[
                styles.fixDot,
                deadReckoning.isGpsActive ? styles.fixDotGnss : styles.fixDotDr,
              ]}
            />
            <Text
              style={[
                styles.fixPillText,
                deadReckoning.isGpsActive ? styles.fixTextGnss : styles.fixTextDr,
              ]}
            >
              {deadReckoning.isGpsActive ? 'GNSS 3D Lock' : 'Inertial DR Fix'}
            </Text>
          </View>
        </View>

        <View style={styles.telemetryGaugesRow}>
          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryBoxLabel}>Heading</Text>
            <Text style={styles.telemetryBoxVal}>
              {deadReckoning.headingDegrees.toFixed(0).padStart(3, '0')}°
            </Text>
          </View>

          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryBoxLabel}>Ground Speed</Text>
            <Text style={styles.telemetryBoxVal}>
              {(deadReckoning.estimatedSpeedMps * 3.6).toFixed(1)} km/h
            </Text>
          </View>

          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryBoxLabel}>Accuracy</Text>
            <Text style={styles.telemetryBoxVal}>
              ±{deadReckoning.uncertaintyRadiusMeters}m
            </Text>
          </View>
        </View>

        <View style={styles.cacheRow}>
          <Text style={styles.cacheText}>
            Offline Sector: Ladakh (482 MB cached vector tiles ready)
          </Text>
        </View>
      </TouchableOpacity>

      {/* SECTION 4: EMERGENCY READINESS */}
      <SectionHeader title="Distress Readiness" />
      <TouchableOpacity
        style={styles.emergencyCard}
        onPress={() => onNavigate('Emergency')}
        activeOpacity={0.8}
      >
        <View style={styles.emergencyIconWrap}>
          <Text style={styles.emergencyIcon}>🚨</Text>
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyTitle}>Emergency SOS Distress Beacon</Text>
          <Text style={styles.emergencySubtitle}>
            Broadcast priority rescue envelope with GPS & DR fix to every node in transceiver horizon.
          </Text>
        </View>
        <Text style={styles.emergencyChevron}>→</Text>
      </TouchableOpacity>
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
  missionStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
    paddingHorizontal: NomadSpacing.xs,
  },
  missionStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hudCrosshair: {
    width: 6,
    height: 6,
    backgroundColor: DarkThemeColors.warningAmber,
    borderRadius: 3,
  },
  missionLabel: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontSize: 10,
    fontWeight: '600',
  },
  missionTimestamp: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 10,
    fontWeight: '500',
  },
  tacticalHudCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
    marginBottom: NomadSpacing.sm,
  },
  hudCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.xs + 2,
  },
  hudTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  hudLedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  ledGreen: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  ledAmber: {
    backgroundColor: DarkThemeColors.tacticalAmber,
  },
  hudCardTitle: {
    ...NomadTypography.sectionHeading,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
  tacticalModeBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tacticalModeText: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.secondaryText,
    fontWeight: '600',
  },
  hudCardBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 18,
    marginTop: 3,
  },
  hudDivider: {
    height: 1,
    backgroundColor: DarkThemeColors.borderSubtle,
    marginVertical: NomadSpacing.md,
  },
  matrixGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  matrixItem: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  matrixIndex: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.mutedText,
    fontWeight: '500',
  },
  matrixValue: {
    ...NomadTypography.screenHeading,
    fontSize: 18,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
    marginTop: 2,
  },
  matrixLabel: {
    ...NomadTypography.metadata,
    fontSize: 9,
    color: DarkThemeColors.secondaryText,
    fontWeight: '500',
    marginTop: 3,
  },
  quickToolbar: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: NomadSpacing.xs,
  },
  emptyCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
  },
  emptyCardText: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCardSub: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  peerCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.xs + 2,
  },
  peerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  peerAliasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  peerAlias: {
    ...NomadTypography.sectionHeading,
    fontSize: 14,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
  peerSafetyMono: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
  peerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NomadSpacing.sm,
    paddingTop: NomadSpacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
  },
  txActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: NomadRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  txActionText: {
    ...NomadTypography.metadata,
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
  tacticalCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.xs,
  },
  formationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formationIcon: {
    fontSize: 14,
  },
  formationName: {
    ...NomadTypography.sectionHeading,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
  convoyStatusPill: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  convoyStatusText: {
    ...NomadTypography.metadata,
    fontSize: 9,
    color: DarkThemeColors.secondaryText,
    fontWeight: '600',
  },
  convoyLeadText: {
    ...NomadTypography.supporting,
    fontSize: 11,
    color: DarkThemeColors.secondaryText,
    marginTop: 3,
  },
  convoyRouteText: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  coordDisplay: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  fixPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  fixDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fixDotGnss: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  fixDotDr: {
    backgroundColor: DarkThemeColors.warningAmber,
  },
  fixGnss: {
    backgroundColor: DarkThemeColors.successGreenSubtle,
    borderColor: DarkThemeColors.tacticalGreen,
  },
  fixDr: {
    backgroundColor: DarkThemeColors.warningAmberSubtle,
    borderColor: DarkThemeColors.tacticalAmber,
  },
  fixPillText: {
    ...NomadTypography.metadata,
    fontSize: 9,
    fontWeight: '600',
  },
  fixTextGnss: {
    color: DarkThemeColors.tacticalGreen,
  },
  fixTextDr: {
    color: DarkThemeColors.tacticalAmber,
  },
  telemetryGaugesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: NomadSpacing.sm,
  },
  telemetryBox: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.sm,
    padding: 8,
    alignItems: 'center',
  },
  telemetryBoxLabel: {
    ...NomadTypography.metadata,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '600',
  },
  telemetryBoxVal: {
    ...NomadTypography.mono,
    fontSize: 12,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
    marginTop: 2,
  },
  cacheRow: {
    marginTop: NomadSpacing.xs + 2,
    paddingTop: NomadSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
  },
  cacheText: {
    ...NomadTypography.supporting,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginTop: NomadSpacing.xs,
  },
  emergencyIconWrap: {
    marginRight: NomadSpacing.sm,
  },
  emergencyIcon: {
    fontSize: 20,
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    ...NomadTypography.sectionHeading,
    fontSize: 13,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '700',
  },
  emergencySubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  emergencyChevron: {
    ...NomadTypography.screenHeading,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '600',
    fontSize: 18,
    marginLeft: NomadSpacing.xs,
  },
});
