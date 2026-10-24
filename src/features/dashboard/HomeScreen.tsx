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
      {/* TACTICAL SUB-HEADER MISSION TELEMETRY STRIP */}
      <View style={styles.missionStrip}>
        <View style={styles.missionStripLeft}>
          <View style={styles.hudCrosshair} />
          <Text style={styles.missionLabel}>SYS BUS // SECURE P2P DTN ROUTER</Text>
        </View>
        <Text style={styles.missionTimestamp}>
          UTC {new Date().toISOString().slice(11, 19)}Z
        </Text>
      </View>

      {/* TACTICAL RF STATUS HUD CARD */}
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
              {isRadioScanning ? 'OFFLINE RF MESH: ONLINE' : 'RF TRANSCEIVER: STANDBY'}
            </Text>
          </View>
          <View style={styles.tacticalModeBadge}>
            <Text style={styles.tacticalModeText}>BLE 5.2 + L2CAP</Text>
          </View>
        </View>

        <Text style={styles.hudCardBody}>
          {peers.length > 0
            ? `Active store-and-forward mesh routing over ${peers.length} discovered radio node${peers.length === 1 ? '' : 's'}. End-to-end cryptographic envelope validation active.`
            : 'BLE GATT advertisement & observation bus listening. No adjacent compatible nodes in range.'}
        </Text>

        <View style={styles.hudDivider} />

        {/* 4-GAUGE TACTICAL TELEMETRY MATRIX */}
        <View style={styles.matrixGrid}>
          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>01</Text>
            <Text style={styles.matrixValue}>{peers.length}</Text>
            <Text style={styles.matrixLabel}>DISCOVERED</Text>
          </View>

          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>02</Text>
            <Text style={[styles.matrixValue, { color: DarkThemeColors.tacticalGreen }]}>
              {trustedPeersCount}
            </Text>
            <Text style={styles.matrixLabel}>VERIFIED</Text>
          </View>

          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>03</Text>
            <Text style={[styles.matrixValue, { color: DarkThemeColors.tacticalCyan }]}>
              {activeMembersCount}
            </Text>
            <Text style={styles.matrixLabel}>CONVOY</Text>
          </View>

          <View style={styles.matrixItem}>
            <Text style={styles.matrixIndex}>04</Text>
            <Text
              style={[
                styles.matrixValue,
                {
                  color: isBackgroundServiceActive
                    ? DarkThemeColors.tacticalGreen
                    : DarkThemeColors.tacticalAmber,
                },
              ]}
            >
              {isBackgroundServiceActive ? 'ACTIVE' : 'IDLE'}
            </Text>
            <Text style={styles.matrixLabel}>DTN RELAY</Text>
          </View>
        </View>
      </View>

      {/* QUICK TACTICAL TOOLBAR */}
      <View style={styles.quickToolbar}>
        <TacticalActionButton
          label="BROADCAST ALL"
          icon="💬"
          accent="cyan"
          onPress={() => onNavigate('Messages')}
          style={{ flex: 1 }}
        />
        <TacticalActionButton
          label={isRadioScanning ? 'HALT SCAN' : 'RADAR SWEEP'}
          icon="📡"
          accent={isRadioScanning ? 'amber' : 'green'}
          onPress={isRadioScanning ? stopDiscovery : startDiscovery}
          style={{ flex: 1 }}
        />
        <TacticalActionButton
          label="DISTRESS SOS"
          icon="🚨"
          accent="red"
          onPress={() => onNavigate('Emergency')}
          style={{ flex: 1 }}
        />
      </View>

      {/* SECTION 1: NEARBY MESH NODES */}
      <SectionHeader
        title="Adjacent Mesh Nodes"
        actionText="RADAR VIEW >"
        onAction={() => onNavigate('Mesh')}
      />

      {peers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyCardText}>
            [NO NODES CURRENTLY WITHIN RF SCAN HORIZON]
          </Text>
          <Text style={styles.emptyCardSub}>
            Initiate radar sweep or verify nearby transceiver antennas.
          </Text>
        </View>
      ) : (
        peers.slice(0, 2).map(peer => (
          <View key={peer.peerId} style={styles.peerCard}>
            <View style={styles.peerCardHeader}>
              <View>
                <View style={styles.peerAliasRow}>
                  <Text style={styles.peerAlias}>{peer.alias.toUpperCase()}</Text>
                  <TransportBadge type={peer.transportType} />
                </View>
                <Text style={styles.peerSafetyMono}>
                  FP: {peer.safetyNumber || 'UNKNOWN'}
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
                <Text style={styles.txActionText}>[TRANSMIT COMMS &gt;]</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* SECTION 2: CONVOY TELEMETRY */}
      <SectionHeader
        title="Convoy Operations Telemetry"
        actionText="CONVOY HUD >"
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
            <Text style={styles.formationName}>{convoy.convoyName.toUpperCase()}</Text>
          </View>
          <View style={styles.convoyStatusPill}>
            <Text style={styles.convoyStatusText}>[{convoy.members.length} UNITS IN FORMATION]</Text>
          </View>
        </View>
        <Text style={styles.convoyLeadText}>
          LEAD VEHICLE: {convoy.members.find(m => m.isLeader)?.alias?.toUpperCase() || 'STANDALONE'} · SYNC DELTA: &lt;4S
        </Text>
        <Text style={styles.convoyRouteText}>
          Expedition path snap active via Mesh DR relay.
        </Text>
      </TouchableOpacity>

      {/* SECTION 3: NAVIGATION & POSITION FIX */}
      <SectionHeader
        title="Position Fix & Dead Reckoning"
        actionText="MAPS HUD >"
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
            <Text
              style={[
                styles.fixPillText,
                deadReckoning.isGpsActive ? styles.fixTextGnss : styles.fixTextDr,
              ]}
            >
              {deadReckoning.isGpsActive ? '[● GNSS 3D LOCK]' : '[▲ INERTIAL DR FIX]'}
            </Text>
          </View>
        </View>

        <View style={styles.telemetryGaugesRow}>
          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryBoxLabel}>HEADING</Text>
            <Text style={styles.telemetryBoxVal}>
              {deadReckoning.headingDegrees.toFixed(0).padStart(3, '0')}°
            </Text>
          </View>

          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryBoxLabel}>GROUND VEL</Text>
            <Text style={styles.telemetryBoxVal}>
              {(deadReckoning.estimatedSpeedMps * 3.6).toFixed(1)} KM/H
            </Text>
          </View>

          <View style={styles.telemetryBox}>
            <Text style={styles.telemetryBoxLabel}>RADIUS ERR</Text>
            <Text style={styles.telemetryBoxVal}>
              ±{deadReckoning.uncertaintyRadiusMeters}M
            </Text>
          </View>
        </View>

        <View style={styles.cacheRow}>
          <Text style={styles.cacheText}>
            OFFLINE SECTOR: LADAKH (482 MB CACHED VECTOR TILES READY)
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
          <Text style={styles.emergencyTitle}>EMERGENCY SOS DISTRESS BEACON</Text>
          <Text style={styles.emergencySubtitle}>
            Broadcast priority rescue envelope with GPS & DR fix to every node in transceiver horizon.
          </Text>
        </View>
        <Text style={styles.emergencyChevron}>[TX &gt;]</Text>
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
    borderWidth: 1,
    borderColor: DarkThemeColors.tacticalCyan,
    borderRadius: 1,
  },
  missionLabel: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.0,
  },
  missionTimestamp: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 9,
    fontWeight: '700',
  },
  tacticalHudCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.xs,
    padding: NomadSpacing.md,
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
    gap: 6,
  },
  hudLedDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  ledGreen: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  ledAmber: {
    backgroundColor: DarkThemeColors.tacticalAmber,
  },
  hudCardTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tacticalModeBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tacticalModeText: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '700',
  },
  hudCardBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 17,
    marginTop: 2,
  },
  hudDivider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.sm + 2,
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
    borderRadius: NomadRadius.xs,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  matrixIndex: {
    ...NomadTypography.monoSmall,
    fontSize: 8,
    color: DarkThemeColors.mutedText,
    fontWeight: '800',
  },
  matrixValue: {
    ...NomadTypography.mono,
    fontSize: 15,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
    marginTop: 1,
  },
  matrixLabel: {
    ...NomadTypography.monoSmall,
    fontSize: 7.5,
    color: DarkThemeColors.secondaryText,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  quickToolbar: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: NomadSpacing.xs,
  },
  emptyCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.xs,
    padding: NomadSpacing.md,
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
  },
  emptyCardText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
    letterSpacing: 0.8,
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
    borderRadius: NomadRadius.xs,
    padding: NomadSpacing.sm + 2,
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
    gap: 6,
  },
  peerAlias: {
    ...NomadTypography.mono,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: NomadRadius.xs,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.tacticalCyan,
  },
  txActionText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tacticalCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.xs,
    padding: NomadSpacing.sm + 2,
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
    fontSize: 13,
  },
  formationName: {
    ...NomadTypography.mono,
    fontSize: 12,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  convoyStatusPill: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  convoyStatusText: {
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '800',
  },
  convoyLeadText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
  },
  convoyRouteText: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  coordDisplay: {
    ...NomadTypography.mono,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fixPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
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
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    fontWeight: '800',
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
    marginTop: NomadSpacing.xs + 2,
  },
  telemetryBox: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.xs,
    padding: 6,
    alignItems: 'center',
  },
  telemetryBoxLabel: {
    ...NomadTypography.monoSmall,
    fontSize: 7.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '800',
  },
  telemetryBoxVal: {
    ...NomadTypography.mono,
    fontSize: 11,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
    marginTop: 2,
  },
  cacheRow: {
    marginTop: NomadSpacing.xs + 2,
    paddingTop: NomadSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
  },
  cacheText: {
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    borderRadius: NomadRadius.xs,
    padding: NomadSpacing.sm + 2,
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
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emergencySubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  emergencyChevron: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '800',
    marginLeft: NomadSpacing.xs,
  },
});
