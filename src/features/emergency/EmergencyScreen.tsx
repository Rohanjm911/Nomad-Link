import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { EmergencySeverity } from '../../../protocol/WireProtocol';
import { DangerButton, SecondaryButton } from '../../components/Buttons';
import { SectionHeader } from '../../components/FeedbackStates';

interface EmergencyScreenProps {
  onNavigate?: (tab: string, peerId?: string) => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onNavigate }) => {
  const { sendEmergencySos, cancelEmergencySos, deadReckoning, identity } = useNomad();
  const [selectedSeverity, setSelectedSeverity] = useState<EmergencySeverity>(
    EmergencySeverity.SEVERITY_MEDEVAC
  );
  const [note, setNote] = useState('Medical assistance needed. Immediate evacuation required.');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [sosDispatched, setSosDispatched] = useState(false);

  const handleBroadcastSos = async () => {
    Alert.alert(
      'TRANSMIT EMERGENCY SOS BEACON?',
      'This will broadcast high-priority SOS distress telemetry to EVERY device within mesh radio range. All nodes will prioritize forwarding this envelope.\n\nNote: This does not contact civilian emergency services or satellite SAR directly.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CONFIRM EMERGENCY BROADCAST',
          style: 'destructive',
          onPress: async () => {
            setIsTransmitting(true);
            await sendEmergencySos(selectedSeverity, note);
            setIsTransmitting(false);
            setSosDispatched(true);
            Alert.alert(
              'SOS Beacon Transmitted to Mesh',
              'Distress beacon is stored in local DTN emergency queue with maximum hop priority (Hop 7) and currently transmitting over BLE/Wi-Fi Direct.'
            );
          },
        },
      ]
    );
  };

  const handleCancelSos = () => {
    Alert.alert('Cancel Distress Beacon?', 'This will halt active emergency re-transmissions and broadcast an ALL CLEAR envelope to the mesh.', [
      { text: 'Keep Active', style: 'cancel' },
      {
        text: 'Stand Down Beacon',
        onPress: async () => {
          await cancelEmergencySos();
          setSosDispatched(false);
          Alert.alert('Distress Beacon Cancelled', 'All-Clear envelope sent to mesh nodes.');
        },
      },
    ]);
  };

  const handleUpdateSitrep = async () => {
    if (!note.trim()) return;
    await sendEmergencySos(selectedSeverity, `[SITREP UPDATE]: ${note.trim()}`);
    Alert.alert('SITREP Update Broadcasted', 'Updated situation telemetry sent to all adjacent mesh relays.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* TACTICAL SOS HEADER */}
      <View style={styles.alertHeader}>
        <View style={styles.alertIconWrap}>
          <Text style={styles.alertIcon}>🚨</Text>
        </View>
        <View style={styles.alertTextWrap}>
          <View style={styles.alertTitleRow}>
            <View style={styles.alertLed} />
            <Text style={styles.alertTitle}>OFFLINE SOS DISTRESS BEACON</Text>
          </View>
          <Text style={styles.alertSubtitle}>
            Transmits high-priority distress telemetry envelope to all nodes in transceiver horizon. All mesh relays prioritize forwarding this envelope. Does NOT call civilian 911/112 or satellite search-and-rescue.
          </Text>
        </View>
      </View>

      {/* ACTIVE BROADCAST CARD */}
      {sosDispatched && (
        <View style={styles.dispatchedCard}>
          <View style={styles.dispatchedRow}>
            <View style={styles.pulsingDot} />
            <Text style={styles.dispatchedTitle}>ACTIVE BEACON BROADCASTING</Text>
          </View>
          <Text style={styles.dispatchedBody}>
            BEACON ID: SOS-{Date.now().toString(16).slice(-6).toUpperCase()} · PRIORITY: HIGHEST (0x03) · TTL: 7 HOPS
          </Text>
          <Text style={styles.deliveryStatusNote}>
            STATUS: Stored in local DTN router. Burst advertisement repeats every 8 seconds over BLE & Wi-Fi Direct.
          </Text>
          <View style={styles.dispatchedActionsRow}>
            <TouchableOpacity style={styles.standDownBtn} onPress={handleCancelSos} activeOpacity={0.7}>
              <Text style={styles.standDownText}>Halt Distress Beacon / Stand Down</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewCommsBtn}
              onPress={() => onNavigate && onNavigate('Messages')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewCommsText}>View Distress Stream in Comms →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ATTACHED TELEMETRY */}
      <SectionHeader title="Attached Position Telemetry (GNSS / INS)" />
      <View style={styles.geoCard}>
        <View style={styles.geoRow}>
          <View>
            <Text style={styles.coords}>
              {deadReckoning.latitude.toFixed(6)}° N · {deadReckoning.longitude.toFixed(6)}° E
            </Text>
            <Text style={styles.geoMeta}>
              FIX: {deadReckoning.isGpsActive ? 'GNSS 3D Lock' : 'Inertial Dead Reckoning'} · ERR: ±{deadReckoning.uncertaintyRadiusMeters}M
            </Text>
          </View>
          <View style={styles.altBadge}>
            <Text style={styles.altText}>ALT: 4,350M</Text>
          </View>
        </View>
      </View>

      {/* EMERGENCY CATEGORY GRID */}
      <SectionHeader title="Select Emergency Category" />
      <View style={styles.severityGrid}>
        <TouchableOpacity
          style={[
            styles.severityBtn,
            selectedSeverity === EmergencySeverity.SEVERITY_MEDEVAC && styles.severitySelected,
          ]}
          onPress={() => {
            setSelectedSeverity(EmergencySeverity.SEVERITY_MEDEVAC);
            setNote('Medical assistance needed. Immediate evacuation required.');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.severityIcon}>🩺</Text>
          <Text style={styles.severityTitle}>01 Medevac</Text>
          <Text style={styles.severityDesc}>Severe trauma or injury</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.severityBtn,
            selectedSeverity === EmergencySeverity.SEVERITY_SEARCH_AND_RESCUE && styles.severitySelected,
          ]}
          onPress={() => {
            setSelectedSeverity(EmergencySeverity.SEVERITY_SEARCH_AND_RESCUE);
            setNote('Search & Rescue needed. Expedition personnel separated from trail.');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.severityIcon}>🧭</Text>
          <Text style={styles.severityTitle}>02 Lost / SAR</Text>
          <Text style={styles.severityDesc}>Missing personnel off-route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.severityBtn,
            selectedSeverity === EmergencySeverity.SEVERITY_MECHANICAL_BREAKDOWN && styles.severitySelected,
          ]}
          onPress={() => {
            setSelectedSeverity(EmergencySeverity.SEVERITY_MECHANICAL_BREAKDOWN);
            setNote('Critical vehicle breakdown. Immobilized in high pass.');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.severityIcon}>🔧</Text>
          <Text style={styles.severityTitle}>03 Breakdown</Text>
          <Text style={styles.severityDesc}>Vehicle or gear disabled</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.severityBtn,
            selectedSeverity === EmergencySeverity.SEVERITY_GENERAL_DISTRESS && styles.severitySelected,
          ]}
          onPress={() => {
            setSelectedSeverity(EmergencySeverity.SEVERITY_GENERAL_DISTRESS);
            setNote('General emergency distress. Hostile weather / terrain hazard.');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.severityIcon}>⚠️</Text>
          <Text style={styles.severityTitle}>04 General SOS</Text>
          <Text style={styles.severityDesc}>Environmental / hazard</Text>
        </TouchableOpacity>
      </View>

      {/* SITUATION REPORT PAYLOAD */}
      <SectionHeader title="Distress Situation Report (SITREP)" />
      <TextInput
        style={styles.textInput}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        placeholder="Specific injuries, vehicle state, environmental hazards..."
        placeholderTextColor={DarkThemeColors.mutedText}
      />

      {/* MASSIVE DISTRESS TRANSMIT ACTION */}
      <View style={styles.actionWrap}>
        <DangerButton
          label={isTransmitting ? 'Transmitting Beacon...' : 'Broadcast Distress Beacon'}
          onPress={handleBroadcastSos}
          loading={isTransmitting}
          icon="🚨"
        />
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
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  alertIconWrap: {
    marginRight: NomadSpacing.sm,
    marginTop: 2,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertLed: {
    width: 7,
    height: 7,
    backgroundColor: DarkThemeColors.emergencyRed,
    borderRadius: NomadRadius.full,
  },
  alertTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '900',
    letterSpacing: 1.0,
    fontSize: 11,
  },
  alertSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
  dispatchedCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  dispatchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: NomadSpacing.xs,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: NomadRadius.full,
    backgroundColor: DarkThemeColors.emergencyRed,
    marginRight: NomadSpacing.sm,
  },
  dispatchedTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '900',
    letterSpacing: 1.0,
    fontSize: 11,
  },
  dispatchedBody: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.primaryText,
    fontSize: 10,
    marginTop: 2,
  },
  deliveryStatusNote: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
    marginTop: 4,
  },
  dispatchedActionsRow: {
    marginTop: NomadSpacing.sm,
    gap: 8,
  },
  standDownBtn: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
  },
  standDownText: {
    ...NomadTypography.monoSmall,
    fontSize: 10.5,
    color: DarkThemeColors.accent,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  viewCommsBtn: {
    backgroundColor: DarkThemeColors.actionBlueSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.actionBlue,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
  },
  viewCommsText: {
    ...NomadTypography.monoSmall,
    fontSize: 10.5,
    color: DarkThemeColors.actionBlue,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  geoCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  geoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coords: {
    ...NomadTypography.mono,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
  },
  geoMeta: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9.5,
    marginTop: 3,
  },
  altBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 4,
    borderRadius: NomadRadius.full,
  },
  altText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.accent,
    fontSize: 9.5,
    fontWeight: '800',
  },
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: NomadSpacing.sm,
  },
  severityBtn: {
    width: '48.5%',
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.md,
  },
  severitySelected: {
    borderColor: DarkThemeColors.emergencyRed,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
  },
  severityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  severityTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  severityDesc: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.mutedText,
    fontSize: 10,
    marginTop: 2,
  },
  textInput: {
    minHeight: 70,
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    color: DarkThemeColors.primaryText,
    textAlignVertical: 'top',
    ...NomadTypography.bodyMedium,
    fontSize: 12,
    marginBottom: NomadSpacing.md,
  },
  actionWrap: {
    marginTop: NomadSpacing.xs,
  },
});
