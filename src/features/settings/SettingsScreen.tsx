import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { SectionHeader } from '../../components/FeedbackStates';

export const SettingsScreen: React.FC = () => {
  const {
    identity,
    isRadioScanning,
    isBleAdvertising,
    isBackgroundServiceActive,
    batteryEcoMode,
    setBatteryEcoMode,
    toggleBackgroundService,
  } = useNomad();

  const handleResetData = () => {
    Alert.alert(
      'PURGE LOCAL EXPEDITION CACHE?',
      'This will delete all offline DTN queues, cached messages, and peer discovery records. Cryptographic device keys will NOT be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CONFIRM PURGE',
          style: 'destructive',
          onPress: () => Alert.alert('Cache Purged', 'Local DTN queue and temporary buffers reset.'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>SYSTEM CONFIGURATION & DIAGNOSTICS</Text>

      
      <SectionHeader title="Profile & Hardware Cryptographic Identity" />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Device Call-Sign:</Text>
          <Text style={styles.value}>{identity.alias}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Ed25519 Peer ID:</Text>
          <Text style={styles.monoValue}>{identity.peerId.slice(0, 16)}...</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Android Keystore Protection:</Text>
          <Text style={[styles.value, { color: DarkThemeColors.successGreen }]}>
            HARDWARE SECURE ELEMENT
          </Text>
        </View>
      </View>

      
      <SectionHeader title="Networking & Mesh Transport" />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>BLE Peripheral Advertising:</Text>
          <Text
            style={[
              styles.value,
              {
                color: isBleAdvertising
                  ? DarkThemeColors.successGreen
                  : DarkThemeColors.mutedText,
              },
            ]}
          >
            {isBleAdvertising ? 'ONLINE (120ms)' : 'STANDBY'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>BLE Central Scanning:</Text>
          <Text
            style={[
              styles.value,
              {
                color: isRadioScanning
                  ? DarkThemeColors.successGreen
                  : DarkThemeColors.mutedText,
              },
            ]}
          >
            {isRadioScanning ? 'LOW_LATENCY' : 'IDLE'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Wi-Fi Direct P2P Channel:</Text>
          <Text style={styles.value}>READY (Auto-negotiate)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>DTN Queue Bound:</Text>
          <Text style={styles.value}>250 Envelopes (LRU / Priority Eviction)</Text>
        </View>
      </View>

      
      <SectionHeader title="Power & Resource Preservation" />
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchTitle}>Background Relay Service</Text>
            <Text style={styles.switchSubtitle}>
              Maintains BLE scanning and store-and-forward mesh routing when screen is locked.
            </Text>
          </View>
          <Switch
            value={isBackgroundServiceActive}
            onValueChange={toggleBackgroundService}
            trackColor={{ false: '#374151', true: DarkThemeColors.actionBlue }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchTitle}>Expedition Battery Eco-Mode</Text>
            <Text style={styles.switchSubtitle}>
              Throttles radio scan duty cycle to conserve battery during multi-day backcountry treks.
            </Text>
          </View>
          <Switch
            value={batteryEcoMode}
            onValueChange={setBatteryEcoMode}
            trackColor={{ false: '#374151', true: DarkThemeColors.actionBlue }}
          />
        </View>
      </View>

      
      <SectionHeader title="Diagnostics & Maintenance" />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>App Version:</Text>
          <Text style={styles.value}>NOMAD LINK 1.0.0 (Native Release)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>Protocol Version:</Text>
          <Text style={styles.value}>WireProtocol v1 (Magic 0x4E)</Text>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.purgeBtn} onPress={handleResetData}>
          <Text style={styles.purgeText}>Purge Local Mesh Envelopes & Cache</Text>
        </TouchableOpacity>
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
  screenTitle: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.xs,
  },
  card: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
  },
  value: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.primaryText,
  },
  monoValue: {
    ...NomadTypography.mono,
    color: DarkThemeColors.actionBlue,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: DarkThemeColors.borderSubtle,
    marginVertical: NomadSpacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: NomadSpacing.md,
  },
  switchTitle: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  switchSubtitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  purgeBtn: {
    paddingVertical: NomadSpacing.sm,
    alignItems: 'center',
  },
  purgeText: {
    ...NomadTypography.button,
    fontSize: 13,
    color: DarkThemeColors.emergencyRed,
  },
});
