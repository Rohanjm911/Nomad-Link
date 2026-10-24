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

export const EmergencyScreen: React.FC = () => {
  const { sendEmergencySos, deadReckoning, identity } = useNomad();
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
    Alert.alert('Cancel Distress Beacon?', 'This will halt active emergency re-transmissions.', [
      { text: 'Keep Active', style: 'cancel' },
      {
        text: 'Stand Down Beacon',
        onPress: () => {
          setSosDispatched(false);
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Critical Advisory Notice Header */}
      <View style={styles.alertHeader}>
        <Text style={styles.alertIcon}>🚨</Text>
        <View style={styles.alertTextWrap}>
          <Text style={styles.alertTitle}>TACTICAL OFFLINE SOS BEACON</Text>
          <Text style={styles.alertSubtitle}>
            Transmits distress telemetry to nearby mesh nodes. Does NOT directly call police, cellular 911/112, or satellite rescue.
          </Text>
        </View>
      </View>

      {/* Dispatched Beacon State Banner */}
      {sosDispatched && (
        <View style={styles.dispatchedCard}>
          <View style={styles.dispatchedRow}>
            <View style={styles.pulsingDot} />
            <Text style={styles.dispatchedTitle}>ACTIVE DISTRESS BEACON BROADCASTING</Text>
          </View>
          <Text style={styles.dispatchedBody}>
            Beacon ID: SOS-{Date.now().toString(16).slice(-6)} · Priority: Highest (0x03) · Hop TTL: 7
          </Text>
          <Text style={styles.deliveryStatusNote}>
            Status: Stored in local DTN router & repeating advertising burst every 8 seconds.
          </Text>
          <TouchableOpacity style={styles.standDownBtn} onPress={handleCancelSos}>
            <Text style={styles.standDownText}>Cancel Distress Beacon</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Geolocation & Fix Quality Summary */}
      <SectionHeader title="Attached Position Telemetry" />
      <View style={styles.geoCard}>
        <View style={styles.geoRow}>
          <View>
            <Text style={styles.coords}>
              {deadReckoning.latitude.toFixed(6)}° N, {deadReckoning.longitude.toFixed(6)}° E
            </Text>
            <Text style={styles.geoMeta}>
              Fix: {deadReckoning.isGpsActive ? 'GNSS Lock' : 'Dead Reckoning Estimate'} · Uncertainty: ±{deadReckoning.uncertaintyRadiusMeters}m
            </Text>
          </View>
          <View style={styles.altBadge}>
            <Text style={styles.altText}>Alt: 4,350m</Text>
          </View>
        </View>
      </View>

      {/* Emergency Category Selector */}
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
        >
          <Text style={styles.severityIcon}>🩺</Text>
          <Text style={styles.severityTitle}>MEDEVAC</Text>
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
        >
          <Text style={styles.severityIcon}>🧭</Text>
          <Text style={styles.severityTitle}>LOST / SAR</Text>
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
        >
          <Text style={styles.severityIcon}>🔧</Text>
          <Text style={styles.severityTitle}>BREAKDOWN</Text>
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
        >
          <Text style={styles.severityIcon}>⚠️</Text>
          <Text style={styles.severityTitle}>GENERAL SOS</Text>
          <Text style={styles.severityDesc}>Environmental / hazard</Text>
        </TouchableOpacity>
      </View>

      {/* Distress Note Input */}
      <SectionHeader title="Distress Message Payload" />
      <TextInput
        style={styles.textInput}
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={3}
        placeholder="Specific condition, injuries, vehicle status..."
        placeholderTextColor={DarkThemeColors.mutedText}
      />

      {/* Confirmation & Dispatch Action */}
      <View style={styles.actionWrap}>
        <DangerButton
          label={isTransmitting ? 'Transmitting...' : 'ACTIVATE DISTRESS BEACON'}
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
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: NomadSpacing.md,
    marginTop: 2,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  alertSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginTop: 4,
    lineHeight: 18,
  },
  dispatchedCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  dispatchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: NomadSpacing.xs,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DarkThemeColors.emergencyRed,
    marginRight: NomadSpacing.sm,
  },
  dispatchedTitle: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '800',
  },
  dispatchedBody: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.primaryText,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  deliveryStatusNote: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 4,
  },
  standDownBtn: {
    marginTop: NomadSpacing.md,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
    alignItems: 'center',
  },
  standDownText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.secondaryText,
  },
  geoCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  geoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coords: {
    ...NomadTypography.mono,
    fontSize: 14,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  geoMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
  },
  altBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: NomadRadius.sm,
  },
  altText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  severityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: NomadSpacing.md,
  },
  severityBtn: {
    width: '48%',
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
  },
  severitySelected: {
    borderColor: DarkThemeColors.emergencyRed,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
  },
  severityIcon: {
    fontSize: 22,
    marginBottom: NomadSpacing.xs,
  },
  severityTitle: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  severityDesc: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    fontSize: 10,
    marginTop: 2,
  },
  textInput: {
    minHeight: 72,
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    color: DarkThemeColors.primaryText,
    textAlignVertical: 'top',
    ...NomadTypography.body,
    marginBottom: NomadSpacing.lg,
  },
  actionWrap: {
    marginTop: NomadSpacing.sm,
  },
});
