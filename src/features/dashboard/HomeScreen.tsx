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
import { TrustBadge } from '../../components/Badges';

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const {
    identity,
    peers,
    deadReckoning,
    isRadioScanning,
    isBackgroundServiceActive,
    convoy,
  } = useNomad();

  const trustedPeersCount = peers.filter(p => p.trustStatus === 'TRUSTED').length;
  const activeMembersCount = convoy.members.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Section: Branding, Device Alias & Settings */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.brandTitle}>NOMAD LINK</Text>
          <Text style={styles.brandTagline}>NO SIGNAL. NO LIMITS.</Text>
        </View>

        <TouchableOpacity
          style={styles.identityCard}
          onPress={() => onNavigate('Settings')}
          activeOpacity={0.7}
        >
          <Text style={styles.identityAlias}>{identity.alias}</Text>
          <Text style={styles.identityId}>
            {identity.peerId.slice(0, 8)}...{identity.peerId.slice(-4)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Network Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusTitleRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isRadioScanning ? DarkThemeColors.successGreen : DarkThemeColors.mutedText },
              ]}
            />
            <Text style={styles.statusTitle}>
              {isRadioScanning ? 'OFFLINE MESH RADIO ACTIVE' : 'RADIO STANDBY'}
            </Text>
          </View>
          <View style={styles.protocolBadge}>
            <Text style={styles.protocolBadgeText}>BLE + P2P</Text>
          </View>
        </View>

        <Text style={styles.statusBody}>
          {peers.length > 0
            ? `Connected directly and via relay to ${peers.length} compatible peer${peers.length === 1 ? '' : 's'}. Store-and-forward active.`
            : 'Scanning nearby BLE GATT frequencies. No compatible mesh peers discovered yet.'}
        </Text>

        <View style={styles.divider} />

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{peers.length}</Text>
            <Text style={styles.metricLabel}>Discovered</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: DarkThemeColors.successGreen }]}>
              {trustedPeersCount}
            </Text>
            <Text style={styles.metricLabel}>Verified Trust</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{activeMembersCount}</Text>
            <Text style={styles.metricLabel}>Convoy Nodes</Text>
          </View>
          <View style={styles.metricItem}>
            <Text
              style={[
                styles.metricVal,
                {
                  color: isBackgroundServiceActive
                    ? DarkThemeColors.successGreen
                    : DarkThemeColors.warningAmber,
                },
              ]}
            >
              {isBackgroundServiceActive ? 'ACTIVE' : 'IDLE'}
            </Text>
            <Text style={styles.metricLabel}>Relay Service</Text>
          </View>
        </View>
      </View>

      {/* Nearby Peers Section */}
      <SectionHeader
        title="Nearby Mesh Devices"
        actionText="Mesh Radar →"
        onAction={() => onNavigate('Mesh')}
      />
      {peers.slice(0, 2).map(peer => (
        <View key={peer.peerId} style={styles.peerCard}>
          <View style={styles.peerCardRow}>
            <View>
              <Text style={styles.peerAlias}>{peer.alias}</Text>
              <Text style={styles.peerFingerprint}>Fingerprint: {peer.safetyNumber}</Text>
            </View>
            <TrustBadge status={peer.trustStatus} />
          </View>
          <View style={styles.peerMetaRow}>
            <Text style={styles.peerMeta}>
              Signal: {peer.rssi ? `${peer.rssi} dBm` : 'Direct'} · Transport: {peer.transportType}
            </Text>
            <TouchableOpacity onPress={() => onNavigate('Messages')}>
              <Text style={styles.messageLink}>Send Message →</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Convoy Summary Card */}
      <SectionHeader
        title="Convoy Operations"
        actionText="View Convoy →"
        onAction={() => onNavigate('Convoy')}
      />
      <TouchableOpacity
        style={styles.card}
        onPress={() => onNavigate('Convoy')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{convoy.convoyName}</Text>
          <View style={styles.convoyStatusBadge}>
            <Text style={styles.convoyStatusText}>{convoy.members.length} MEMBERS</Text>
          </View>
        </View>
        <Text style={styles.cardBodyText}>
          Lead: {convoy.members.find(m => m.isLeader)?.alias || 'Unassigned'} · Last sync 4s ago.
          Expedition path through remote mountain pass.
        </Text>
      </TouchableOpacity>

      {/* Navigation & Dead Reckoning Summary */}
      <SectionHeader
        title="Offline Navigation & Fix Quality"
        actionText="Open Map →"
        onAction={() => onNavigate('Maps')}
      />
      <TouchableOpacity
        style={styles.card}
        onPress={() => onNavigate('Maps')}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.coordDisplay}>
            {deadReckoning.latitude.toFixed(5)}° N, {deadReckoning.longitude.toFixed(5)}° E
          </Text>
          <Text
            style={[
              styles.fixBadge,
              {
                color: deadReckoning.isGpsActive
                  ? DarkThemeColors.successGreen
                  : DarkThemeColors.warningAmber,
              },
            ]}
          >
            {deadReckoning.isGpsActive ? '● GNSS FIX' : '▲ INERTIAL DR'}
          </Text>
        </View>
        <Text style={styles.cardBodyText}>
          HDG: {deadReckoning.headingDegrees.toFixed(0)}° · VEL: {(deadReckoning.estimatedSpeedMps * 3.6).toFixed(1)} km/h · Uncertainty: ±{deadReckoning.uncertaintyRadiusMeters}m
        </Text>
        <Text style={styles.mapStorageNote}>
          Offline Map: Ladakh Sector (Offline Cache Ready, 482 MB)
        </Text>
      </TouchableOpacity>

      {/* Emergency Distress Entry Point */}
      <SectionHeader title="Emergency Readiness" />
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
            Broadcast priority rescue request with GPS coordinates to all nodes in mesh range.
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
    padding: NomadSpacing.lg,
    paddingBottom: NomadSpacing.xxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.lg,
    paddingTop: NomadSpacing.xs,
  },
  brandTitle: {
    ...NomadTypography.screenHeading,
    color: DarkThemeColors.primaryText,
    letterSpacing: 1.5,
  },
  brandTagline: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  identityCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.xs + 2,
    alignItems: 'flex-end',
  },
  identityAlias: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.primaryText,
  },
  identityId: {
    ...NomadTypography.mono,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
  },
  statusCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
    marginBottom: NomadSpacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: NomadSpacing.sm,
  },
  statusTitle: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.5,
  },
  protocolBadge: {
    backgroundColor: DarkThemeColors.actionBlueSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.actionBlue,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.xs + 2,
    paddingVertical: 2,
  },
  protocolBadgeText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontSize: 10,
    fontWeight: '700',
  },
  statusBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 18,
    marginTop: NomadSpacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  metricLabel: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
  peerCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  peerCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: NomadSpacing.xs,
  },
  peerAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  peerFingerprint: {
    ...NomadTypography.mono,
    fontSize: 11,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
  peerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NomadSpacing.xs,
    paddingTop: NomadSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
  },
  peerMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
  },
  messageLink: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontWeight: '600',
  },
  card: {
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
  cardTitle: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  convoyStatusBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.xs + 2,
    paddingVertical: 2,
  },
  convoyStatusText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.secondaryText,
    fontWeight: '700',
  },
  cardBodyText: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 18,
  },
  coordDisplay: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  fixBadge: {
    ...NomadTypography.metadata,
    fontWeight: '700',
  },
  mapStorageNote: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    marginTop: NomadSpacing.xs,
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
    marginRight: NomadSpacing.md,
  },
  emergencyIcon: {
    fontSize: 24,
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '700',
  },
  emergencySubtitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  emergencyChevron: {
    fontSize: 18,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '700',
    marginLeft: NomadSpacing.sm,
  },
});
