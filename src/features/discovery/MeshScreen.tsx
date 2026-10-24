import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { TrustStatus, PeerRecord } from '../../domain/models/DomainModels';
import { TrustBadge, TransportBadge } from '../../components/Badges';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../components/Buttons';
import { SectionHeader } from '../../components/FeedbackStates';

export const MeshScreen: React.FC = () => {
  const {
    peers,
    isRadioScanning,
    startDiscovery,
    stopDiscovery,
    updatePeerTrust,
  } = useNomad();

  const [activeTab, setActiveTab] = useState<'list' | 'topology'>('list');
  const [selectedPeerForVerify, setSelectedPeerForVerify] = useState<PeerRecord | null>(null);

  const getRssiColor = (rssi?: number) => {
    if (!rssi) return DarkThemeColors.mutedText;
    if (rssi > -65) return DarkThemeColors.rssiStrong;
    if (rssi > -80) return DarkThemeColors.rssiMedium;
    return DarkThemeColors.rssiWeak;
  };

  const handleVerifyPrompt = (peer: PeerRecord) => {
    setSelectedPeerForVerify(peer);
  };

  return (
    <View style={styles.container}>
      {/* Top Header: Radio Controls & Discovery State */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>OFFLINE MESH RADAR</Text>
          <Text style={styles.subtitle}>
            {isRadioScanning
              ? 'Discovering BLE GATT Radios & Wi-Fi Direct Links'
              : 'Radio Scanning Inactive · Manual Standby'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.scanBtn, isRadioScanning ? styles.scanBtnActive : styles.scanBtnInactive]}
          onPress={isRadioScanning ? stopDiscovery : startDiscovery}
          activeOpacity={0.8}
        >
          <Text style={[styles.scanBtnText, isRadioScanning && styles.scanBtnTextActive]}>
            {isRadioScanning ? 'STOP SCAN' : 'START SCAN'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode Switcher: Device List vs Mesh Topology Overview */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'list' && styles.tabButtonTextActive]}>
            Device List ({peers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'topology' && styles.tabButtonActive]}
          onPress={() => setActiveTab('topology')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'topology' && styles.tabButtonTextActive]}>
            Mesh Topology
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        /* Device List Presentation */
        <FlatList
          data={peers}
          keyExtractor={item => item.peerId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isTrusted = item.trustStatus === TrustStatus.TRUSTED;

            return (
              <View style={styles.peerCard}>
                <View style={styles.peerCardHeader}>
                  <View style={styles.peerInfoWrap}>
                    <View style={styles.nameRow}>
                      <Text style={styles.peerAlias}>{item.alias}</Text>
                      <TransportBadge type={item.transportType} style={styles.transportTag} />
                    </View>
                    <Text style={styles.peerIdText}>
                      Ed25519: {item.peerId.slice(0, 16)}...
                    </Text>
                  </View>

                  <View style={styles.signalBadge}>
                    <Text style={[styles.rssiValue, { color: getRssiColor(item.rssi) }]}>
                      {item.rssi ? `${item.rssi} dBm` : 'N/A'}
                    </Text>
                    <Text style={styles.rssiLabel}>Signal RSSI</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Fingerprint & Security Status */}
                <View style={styles.securityRow}>
                  <View style={styles.fingerprintCol}>
                    <Text style={styles.safetyLabel}>SAFETY NUMBER FINGERPRINT</Text>
                    <Text style={styles.safetyNumber}>{item.safetyNumber}</Text>
                  </View>
                  <TrustBadge status={item.trustStatus} />
                </View>

                {/* Action Controls */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => handleVerifyPrompt(item)}
                  >
                    <Text style={styles.verifyBtnText}>
                      {isTrusted ? 'Inspect Verification' : 'Verify Safety Number'}
                    </Text>
                  </TouchableOpacity>

                  {isTrusted ? (
                    <TouchableOpacity
                      style={styles.revokeBtn}
                      onPress={() => updatePeerTrust(item.peerId, TrustStatus.DISCOVERED)}
                    >
                      <Text style={styles.revokeBtnText}>Revoke Trust</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.trustDirectBtn}
                      onPress={() => updatePeerTrust(item.peerId, TrustStatus.TRUSTED)}
                    >
                      <Text style={styles.trustDirectText}>Trust Device</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      ) : (
        /* Mesh Topology Diagram View */
        <View style={styles.topologyContainer}>
          <Text style={styles.topologyTitle}>ESTABLISHED PEER-TO-PEER MESH TOPOLOGY</Text>
          <Text style={styles.topologySubtitle}>
            Represents verified link states. Solid lines depict active multi-hop store-and-forward routes.
          </Text>

          <View style={styles.topologyCanvas}>
            {/* Center Local Device Node */}
            <View style={styles.localNode}>
              <Text style={styles.nodeIcon}>⚡</Text>
              <Text style={styles.nodeAlias}>You (Alpha)</Text>
              <Text style={styles.nodeMeta}>Origin</Text>
            </View>

            <View style={styles.topologyLine} />

            {/* Discovered Peer Nodes */}
            <View style={styles.nodesGrid}>
              {peers.map((peer, idx) => (
                <View key={peer.peerId} style={styles.peerNode}>
                  <View
                    style={[
                      styles.nodeCircle,
                      peer.trustStatus === TrustStatus.TRUSTED && styles.nodeCircleTrusted,
                    ]}
                  >
                    <Text style={styles.nodeIcon}>📡</Text>
                  </View>
                  <Text style={styles.peerNodeAlias}>{peer.alias}</Text>
                  <Text style={styles.peerNodeHops}>Direct BLE Link</Text>
                  <Text
                    style={[
                      styles.peerNodeTrust,
                      {
                        color:
                          peer.trustStatus === TrustStatus.TRUSTED
                            ? DarkThemeColors.successGreen
                            : DarkThemeColors.warningAmber,
                      },
                    ]}
                  >
                    {peer.trustStatus === TrustStatus.TRUSTED ? '● Verified' : '▲ Unverified'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.topologyLegend}>
            <Text style={styles.legendItem}>● Solid Box: Directly connected BLE GATT link</Text>
            <Text style={styles.legendItem}>● Store-and-forward DTN queue limit: 250 envelopes</Text>
            <Text style={styles.legendItem}>● Max hop limit: 7 relay transitions</Text>
          </View>
        </View>
      )}

      {/* Screen 05 — Peer Verification Modal */}
      {selectedPeerForVerify && (
        <Modal
          visible={!!selectedPeerForVerify}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectedPeerForVerify(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>CRYPTOGRAPHIC PEER VERIFICATION</Text>
              <Text style={styles.modalSubtitle}>
                Compare this safety number with the safety number displayed on {selectedPeerForVerify.alias}'s phone screen.
              </Text>

              <View style={styles.fingerprintBox}>
                <Text style={styles.fingerprintLabel}>12-DIGIT COMMUTATIVE SAS FINGERPRINT</Text>
                <Text style={styles.fingerprintLarge}>{selectedPeerForVerify.safetyNumber}</Text>
                <Text style={styles.fingerprintExpl}>
                  Calculated from SHA-256 hash of combined Ed25519 identity keys.
                </Text>
              </View>

              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrIcon}>▦</Text>
                <Text style={styles.qrText}>SCAN PEER QR CODE</Text>
                <Text style={styles.qrSub}>Use in-person camera verification for instant verification</Text>
              </View>

              <View style={styles.modalActions}>
                <PrimaryButton
                  label="Mark as Verified & Trusted"
                  onPress={() => {
                    updatePeerTrust(selectedPeerForVerify.peerId, TrustStatus.TRUSTED);
                    setSelectedPeerForVerify(null);
                    Alert.alert('Peer Verified', `${selectedPeerForVerify.alias} is now marked as a trusted expedition peer.`);
                  }}
                  style={styles.modalBtn}
                />
                <SecondaryButton
                  label="Cancel"
                  onPress={() => setSelectedPeerForVerify(null)}
                  style={styles.modalBtn}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: NomadSpacing.md,
    backgroundColor: DarkThemeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
  },
  title: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    letterSpacing: 1,
  },
  subtitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    maxWidth: 240,
  },
  scanBtn: {
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnActive: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderColor: DarkThemeColors.emergencyRed,
  },
  scanBtnInactive: {
    backgroundColor: DarkThemeColors.actionBlue,
    borderColor: DarkThemeColors.actionBlue,
  },
  scanBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: '#FFFFFF',
  },
  scanBtnTextActive: {
    color: DarkThemeColors.emergencyRed,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    padding: 4,
    margin: NomadSpacing.md,
    borderRadius: NomadRadius.md,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: NomadSpacing.sm,
    alignItems: 'center',
    borderRadius: NomadRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: DarkThemeColors.surface,
  },
  tabButtonText: {
    ...NomadTypography.button,
    fontSize: 13,
    color: DarkThemeColors.secondaryText,
  },
  tabButtonTextActive: {
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: NomadSpacing.md,
    paddingBottom: NomadSpacing.xl,
  },
  peerCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  peerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  peerInfoWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peerAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    marginRight: NomadSpacing.sm,
  },
  transportTag: {
    marginRight: NomadSpacing.xs,
  },
  peerIdText: {
    ...NomadTypography.mono,
    fontSize: 11,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
  signalBadge: {
    alignItems: 'flex-end',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 4,
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
  },
  rssiValue: {
    ...NomadTypography.metadata,
    fontWeight: '700',
  },
  rssiLabel: {
    ...NomadTypography.metadata,
    fontSize: 9,
    color: DarkThemeColors.mutedText,
  },
  divider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.md,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.md,
  },
  fingerprintCol: {
    flex: 1,
  },
  safetyLabel: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  safetyNumber: {
    ...NomadTypography.mono,
    color: DarkThemeColors.actionBlue,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
    alignItems: 'center',
  },
  verifyBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.primaryText,
  },
  trustDirectBtn: {
    backgroundColor: DarkThemeColors.actionBlueSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.actionBlue,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
    alignItems: 'center',
  },
  trustDirectText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.actionBlue,
  },
  revokeBtn: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
    alignItems: 'center',
  },
  revokeBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: DarkThemeColors.emergencyRed,
  },
  topologyContainer: {
    flex: 1,
    padding: NomadSpacing.md,
  },
  topologyTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  topologySubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginBottom: NomadSpacing.md,
    lineHeight: 18,
  },
  topologyCanvas: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
    alignItems: 'center',
  },
  localNode: {
    alignItems: 'center',
    backgroundColor: DarkThemeColors.brandNavy,
    borderWidth: 2,
    borderColor: DarkThemeColors.actionBlue,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.lg,
    paddingVertical: NomadSpacing.sm,
  },
  nodeIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  nodeAlias: {
    ...NomadTypography.bodyMedium,
    color: '#FFFFFF',
  },
  nodeMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontSize: 10,
  },
  topologyLine: {
    width: 2,
    height: 32,
    backgroundColor: DarkThemeColors.actionBlue,
    marginVertical: NomadSpacing.xs,
  },
  nodesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
    gap: 12,
  },
  peerNode: {
    alignItems: 'center',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    width: '45%',
  },
  nodeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: NomadSpacing.xs,
  },
  nodeCircleTrusted: {
    borderColor: DarkThemeColors.successGreen,
  },
  peerNodeAlias: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.primaryText,
  },
  peerNodeHops: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontSize: 10,
  },
  peerNodeTrust: {
    ...NomadTypography.metadata,
    fontSize: 10,
    marginTop: 2,
  },
  topologyLegend: {
    marginTop: NomadSpacing.md,
    padding: NomadSpacing.md,
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
  },
  legendItem: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: NomadSpacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
  },
  modalTitle: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.8,
  },
  modalSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginTop: NomadSpacing.xs,
    marginBottom: NomadSpacing.md,
    lineHeight: 18,
  },
  fingerprintBox: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    alignItems: 'center',
    marginBottom: NomadSpacing.md,
  },
  fingerprintLabel: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
  },
  fingerprintLarge: {
    ...NomadTypography.mono,
    fontSize: 20,
    color: DarkThemeColors.actionBlue,
    letterSpacing: 2,
    fontWeight: '700',
    marginVertical: NomadSpacing.xs,
  },
  fingerprintExpl: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    textAlign: 'center',
    fontSize: 11,
  },
  qrPlaceholder: {
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderStyle: 'dashed',
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
    alignItems: 'center',
    marginBottom: NomadSpacing.lg,
  },
  qrIcon: {
    fontSize: 48,
    color: DarkThemeColors.actionBlue,
    marginBottom: NomadSpacing.xs,
  },
  qrText: {
    ...NomadTypography.button,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
  },
  qrSub: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    textAlign: 'center',
    marginTop: 2,
  },
  modalActions: {
    gap: 8,
  },
  modalBtn: {
    width: '100%',
  },
});
