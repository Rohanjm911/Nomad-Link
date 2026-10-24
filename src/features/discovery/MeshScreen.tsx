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
import { TrustBadge, TransportBadge, SignalMeter } from '../../components/Badges';
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

  const handleVerifyPrompt = (peer: PeerRecord) => {
    setSelectedPeerForVerify(peer);
  };

  return (
    <View style={styles.container}>
      {/* TACTICAL RADAR HUD HEADER */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <View
              style={[
                styles.radarLed,
                isRadioScanning ? styles.radarLedActive : styles.radarLedIdle,
              ]}
            />
            <Text style={styles.title}>// OFFLINE RF MESH RADAR //</Text>
          </View>
          <Text style={styles.subtitle}>
            {isRadioScanning
              ? 'ACTIVE OBSERVATION // BLE GATT RADIOS & WI-FI DIRECT'
              : 'TRANSCEIVER STANDBY // MANUAL SCAN REQUIRED'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.scanBtn, isRadioScanning ? styles.scanBtnActive : styles.scanBtnInactive]}
          onPress={isRadioScanning ? stopDiscovery : startDiscovery}
          activeOpacity={0.8}
        >
          <Text style={[styles.scanBtnText, isRadioScanning && styles.scanBtnTextActive]}>
            {isRadioScanning ? '[HALT SCAN]' : '[RADAR SWEEP]'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TACTICAL TAB SWITCHER */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'list' && styles.tabButtonTextActive]}>
            // 01 NODE LIST ({peers.length}) //
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'topology' && styles.tabButtonActive]}
          onPress={() => setActiveTab('topology')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'topology' && styles.tabButtonTextActive]}>
            // 02 MESH TOPOLOGY //
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        /* DISCOVERED PEERS LIST */
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
                      <Text style={styles.peerAlias}>{item.alias.toUpperCase()}</Text>
                      <TransportBadge type={item.transportType} style={styles.transportTag} />
                    </View>
                    <Text style={styles.peerIdText}>
                      ED25519: {item.peerId.slice(0, 16)}...
                    </Text>
                  </View>

                  <SignalMeter rssi={item.rssi} />
                </View>

                <View style={styles.divider} />

                {/* SAFETY NUMBER FINGERPRINT ROW */}
                <View style={styles.securityRow}>
                  <View style={styles.fingerprintCol}>
                    <Text style={styles.safetyLabel}>// SAFETY FINGERPRINT AUTH //</Text>
                    <Text style={styles.safetyNumber}>{item.safetyNumber || 'UNAUTHENTICATED'}</Text>
                  </View>
                  <TrustBadge status={item.trustStatus} />
                </View>

                {/* TACTICAL TRUST ACTIONS */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => handleVerifyPrompt(item)}
                  >
                    <Text style={styles.verifyBtnText}>
                      {isTrusted ? '[INSPECT AUTH]' : '[VERIFY SAFETY NUMBER]'}
                    </Text>
                  </TouchableOpacity>

                  {isTrusted ? (
                    <TouchableOpacity
                      style={styles.revokeBtn}
                      onPress={() => updatePeerTrust(item.peerId, TrustStatus.DISCOVERED)}
                    >
                      <Text style={styles.revokeBtnText}>[REVOKE TRUST]</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.trustDirectBtn}
                      onPress={() => updatePeerTrust(item.peerId, TrustStatus.TRUSTED)}
                    >
                      <Text style={styles.trustDirectText}>[AUTHORIZE NODE]</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      ) : (
        /* MESH TOPOLOGY VISUALIZER */
        <View style={styles.topologyContainer}>
          <Text style={styles.topologyTitle}>// ESTABLISHED PEER-TO-PEER MESH TOPOLOGY //</Text>
          <Text style={styles.topologySubtitle}>
            Represents authenticated link states. Solid lines depict active multi-hop store-and-forward routes.
          </Text>

          <View style={styles.topologyCanvas}>
            {/* ORIGIN / LOCAL NODE */}
            <View style={styles.localNode}>
              <Text style={styles.nodeIcon}>⬢</Text>
              <Text style={styles.nodeAlias}>LOCAL [YOU]</Text>
              <Text style={styles.nodeMeta}>ORIGIN TRANSCEIVER</Text>
            </View>

            <View style={styles.topologyLine} />

            {/* ADJACENT PEERS MESH */}
            <View style={styles.nodesGrid}>
              {peers.map((peer, _idx) => (
                <View key={peer.peerId} style={styles.peerNode}>
                  <View
                    style={[
                      styles.nodeCircle,
                      peer.trustStatus === TrustStatus.TRUSTED && styles.nodeCircleTrusted,
                    ]}
                  >
                    <Text style={styles.nodeIcon}>📡</Text>
                  </View>
                  <Text style={styles.peerNodeAlias}>{peer.alias.toUpperCase()}</Text>
                  <Text style={styles.peerNodeHops}>DIRECT BLE LINK</Text>
                  <Text
                    style={[
                      styles.peerNodeTrust,
                      {
                        color:
                          peer.trustStatus === TrustStatus.TRUSTED
                            ? DarkThemeColors.tacticalGreen
                            : DarkThemeColors.secondaryText,
                      },
                    ]}
                  >
                    [{peer.trustStatus}]
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* TOPOLOGY METRICS FOOTER */}
          <View style={styles.topologyLegend}>
            <Text style={styles.legendTitle}>// MESH ROUTING PROTOCOL STATS //</Text>
            <Text style={styles.legendBody}>
              • Multi-hop TTL limit: 7 hops · Store-and-forward DTN cache buffer: 50 messages
            </Text>
            <Text style={styles.legendBody}>
              • Transport protocol: BLE 5.2 Extended L2CAP with fallback to Wi-Fi Direct
            </Text>
          </View>
        </View>
      )}

      
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarLed: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  radarLedActive: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  radarLedIdle: {
    backgroundColor: DarkThemeColors.tacticalAmber,
  },
  title: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.primaryText,
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  subtitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9,
    marginTop: 3,
    maxWidth: 240,
  },
  scanBtn: {
    paddingHorizontal: NomadSpacing.sm + 2,
    paddingVertical: NomadSpacing.xs + 2,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnActive: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderColor: DarkThemeColors.emergencyRed,
  },
  scanBtnInactive: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.tacticalCyan,
  },
  scanBtnText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scanBtnTextActive: {
    color: DarkThemeColors.emergencyRed,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    padding: 3,
    margin: NomadSpacing.sm,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: NomadSpacing.xs + 2,
    alignItems: 'center',
    borderRadius: NomadRadius.xs,
  },
  tabButtonActive: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.tacticalCyan,
  },
  tabButtonText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.secondaryText,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: NomadSpacing.sm,
    paddingBottom: NomadSpacing.xl,
  },
  peerCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.xs,
    padding: NomadSpacing.sm + 2,
    marginBottom: NomadSpacing.xs + 3,
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
    borderRadius: NomadRadius.xs,
  },
  legendTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  legendBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 3,
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
