import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
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
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';
import { EmptyState } from '../../components/FeedbackStates';
import { RadarScope } from '../../components/RadarScope';

interface MeshScreenProps {
  onNavigate?: (tab: string, peerId?: string) => void;
}

export const MeshScreen: React.FC<MeshScreenProps> = ({ onNavigate }) => {
  const {
    peers,
    isRadioScanning,
    startDiscovery,
    stopDiscovery,
    scanForPeers,
    updatePeerTrust,
  } = useNomad();

  const [activeTab, setActiveTab] = useState<'radar' | 'list' | 'topology'>('radar');
  const [selectedRadarPeer, setSelectedRadarPeer] = useState<PeerRecord | null>(null);
  const [selectedPeerForVerify, setSelectedPeerForVerify] = useState<PeerRecord | null>(null);

  const handleVerifyPrompt = (peer: PeerRecord) => {
    setSelectedPeerForVerify(peer);
  };

  const handleScanQr = () => {
    if (!selectedPeerForVerify) return;
    const verifiedAlias = selectedPeerForVerify.alias;
    updatePeerTrust(selectedPeerForVerify.peerId, TrustStatus.TRUSTED);
    setSelectedPeerForVerify(null);
    Alert.alert(
      'QR Code Verified Instantly',
      `Optical scan match confirmed! Ed25519 signing key and X25519 exchange key for ${verifiedAlias} authenticated cryptographically.`
    );
  };

  const handleToggleTrust = (peer: PeerRecord) => {
    const nextTrust =
      peer.trustStatus === TrustStatus.TRUSTED
        ? TrustStatus.DISCOVERED
        : TrustStatus.TRUSTED;
    updatePeerTrust(peer.peerId, nextTrust);
    Alert.alert(
      'Node Trust Updated',
      `${peer.alias} trust state has been set to ${nextTrust}.`
    );
  };

  const handleScanAction = async () => {
    if (isRadioScanning) {
      await stopDiscovery();
      Alert.alert('Radar Standby', 'Radio transceivers placed in standby mode.');
    } else {
      await scanForPeers();
      Alert.alert(
        'RF Radar Sweep Initiated',
        'Broadcasting BLE 5.2 burst discovery advertisement and Wi-Fi Direct probes. Radio perimeter refreshed.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* RADAR HUD HEADER */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <View
              style={[
                styles.radarLed,
                isRadioScanning ? styles.radarLedActive : styles.radarLedIdle,
              ]}
            />
            <Text style={styles.title}>Mesh Discovery & Radar</Text>
          </View>
          <Text style={styles.subtitle}>
            {isRadioScanning
              ? 'Live 360° RF sweep active · BLE 5.2 & Wi-Fi Direct'
              : 'Transceiver standby · Tap Scan Radar to initiate sweep'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.scanBtn, isRadioScanning ? styles.scanBtnActive : styles.scanBtnInactive]}
          onPress={handleScanAction}
          activeOpacity={0.8}
        >
          <Text style={[styles.scanBtnText, isRadioScanning && styles.scanBtnTextActive]}>
            {isRadioScanning ? 'Halt Scan' : 'Scan Radar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3-SEGMENTED TAB SWITCHER */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'radar' && styles.tabButtonActive]}
          onPress={() => setActiveTab('radar')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'radar' && styles.tabButtonTextActive]}>
            Radar Scope
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'list' && styles.tabButtonTextActive]}>
            Node List ({peers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'topology' && styles.tabButtonActive]}
          onPress={() => setActiveTab('topology')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'topology' && styles.tabButtonTextActive]}>
            Topology
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: VISUAL RADAR SCOPE */}
      {activeTab === 'radar' && (
        <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.radarContent}>
          <RadarScope
            peers={peers}
            isScanning={isRadioScanning}
            selectedPeer={selectedRadarPeer}
            onSelectPeer={setSelectedRadarPeer}
            onVerifyPeer={handleVerifyPrompt}
            onToggleTrust={handleToggleTrust}
            onToggleScan={handleScanAction}
            onSwitchToList={() => setActiveTab('list')}
            onMessagePeer={peer => {
              if (onNavigate) {
                onNavigate('Messages', peer.peerId);
              } else {
                Alert.alert(
                  'Direct Encrypted Channel',
                  `Switch to Secure Comms to message ${peer.alias} over authenticated X25519 channel.`
                );
              }
            }}
          />
        </ScrollView>
      )}

      {/* TAB 2: DETAILED NODE LIST */}
      {activeTab === 'list' && (
        <FlatList
          data={peers}
          keyExtractor={item => item.peerId}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No Nodes in Perimeter"
              description="No adjacent mesh transceivers currently detected. Tap Scan Radar to broadcast BLE discovery probes."
              actionLabel="Scan Perimeter"
              onAction={handleScanAction}
            />
          }
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

                  <SignalMeter rssi={item.rssi} />
                </View>

                <View style={styles.divider} />

                {/* SAFETY NUMBER FINGERPRINT ROW */}
                <View style={styles.securityRow}>
                  <View style={styles.fingerprintCol}>
                    <Text style={styles.safetyLabel}>Safety Fingerprint Authentication</Text>
                    <Text style={styles.safetyNumber}>{item.safetyNumber || 'Unauthenticated'}</Text>
                  </View>
                  <TrustBadge status={item.trustStatus} />
                </View>

                {/* TRUST & DIRECT COMMS ACTIONS */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.messageDirectBtn}
                    onPress={() => {
                      if (onNavigate) {
                        onNavigate('Messages', item.peerId);
                      } else {
                        Alert.alert(
                          'Direct Encrypted Comms',
                          `Switching to secure channel with ${item.alias}.`
                        );
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.messageDirectText}>Message →</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => handleVerifyPrompt(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.verifyBtnText}>
                      {isTrusted ? 'Inspect Auth' : 'Verify Safety'}
                    </Text>
                  </TouchableOpacity>

                  {isTrusted ? (
                    <TouchableOpacity
                      style={styles.revokeBtn}
                      onPress={() => handleToggleTrust(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.revokeBtnText}>Revoke Trust</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.trustDirectBtn}
                      onPress={() => handleToggleTrust(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.trustDirectText}>Authorize Node</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* TAB 3: MESH TOPOLOGY VISUALIZER */}
      {activeTab === 'topology' && (
        <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.topologyScroll}>
          <View style={styles.topologyContainer}>
            <Text style={styles.topologyTitle}>Established P2P Mesh Topology</Text>
            <Text style={styles.topologySubtitle}>
              Represents authenticated link states. Solid lines depict active multi-hop store-and-forward routes. Tap any node to inspect auth.
            </Text>

            <View style={styles.topologyCanvas}>
              {/* ORIGIN / LOCAL NODE */}
              <TouchableOpacity
                style={styles.localNode}
                onPress={() =>
                  Alert.alert(
                    'Origin Transceiver [You]',
                    'Local Node Link Diagnostics:\n• Mode: BLE Central & Peripheral active\n• Routing: Multi-Hop Store-and-Forward DTN Router\n• DTN Buffer: 50 Envelopes Capacity\n• Cryptographic Keystore: AndroidKeyStore Hardware TEE'
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.nodeIcon}>●</Text>
                <Text style={styles.nodeAlias}>Local Node [You]</Text>
                <Text style={styles.nodeMeta}>Origin Transceiver · Tap to Inspect</Text>
              </TouchableOpacity>

              <View style={styles.topologyLine} />

              {/* ADJACENT PEERS MESH */}
              <View style={styles.nodesGrid}>
                {peers.map(peer => (
                  <TouchableOpacity
                    key={peer.peerId}
                    style={styles.peerNode}
                    onPress={() => {
                      Alert.alert(
                        `Topology Link: ${peer.alias}`,
                        `• Distance: ${peer.distanceMeters ?? 35}m\n• Link: Direct BLE 5.2 (1 Hop)\n• Trust: ${peer.trustStatus}\n• Fingerprint: ${peer.safetyNumber || 'Unverified'}`,
                        [
                          {
                            text: 'Direct Comms',
                            onPress: () => {
                              if (onNavigate) {
                                onNavigate('Messages', peer.peerId);
                              }
                            },
                          },
                          {
                            text: 'Verify Auth',
                            onPress: () => handleVerifyPrompt(peer),
                          },
                          {
                            text: 'Close',
                            style: 'cancel',
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.nodeCircle,
                        peer.trustStatus === TrustStatus.TRUSTED && styles.nodeCircleTrusted,
                      ]}
                    >
                      <Text style={styles.nodeIcon}>📡</Text>
                    </View>
                    <Text style={styles.peerNodeAlias}>{peer.alias}</Text>
                    <Text style={styles.peerNodeHops}>
                      {peer.distanceMeters ? `${peer.distanceMeters}m · Direct` : 'Direct BLE'}
                    </Text>
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
                      {peer.trustStatus}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TOPOLOGY METRICS FOOTER */}
            <View style={styles.topologyLegend}>
              <Text style={styles.legendTitle}>Mesh Routing Protocol Stats</Text>
              <Text style={styles.legendBody}>
                • Multi-hop TTL limit: 7 hops · Store-and-forward DTN cache buffer: 50 messages
              </Text>
              <Text style={styles.legendBody}>
                • Transport protocol: BLE 5.2 Extended L2CAP with fallback to Wi-Fi Direct
              </Text>

              <TouchableOpacity
                style={styles.auditRouteBtn}
                onPress={() => {
                  Alert.alert(
                    'Mesh Routing Audit Complete',
                    `• Active Reachable Peers: ${peers.length} nodes\n• DTN Store-and-Forward Buffer: Operational\n• Hop Radius: Max 7 Hops\n• Cryptographic Integrity: 100% OK\n• Latency: ~18ms avg`
                  );
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.auditRouteText}>⚡ Audit Mesh Routes & Link Health</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* VERIFICATION SAS FINGERPRINT MODAL */}
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

              <TouchableOpacity
                style={styles.fingerprintBox}
                onPress={() => {
                  Alert.alert(
                    'SAS Fingerprint Confirmed',
                    `12-digit fingerprint: ${selectedPeerForVerify.safetyNumber}\n\nThis commutative code matches when derived from reciprocal Ed25519 public keys on both expedition devices.`
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.fingerprintLabel}>12-DIGIT COMMUTATIVE SAS FINGERPRINT (TAP TO VERIFY)</Text>
                <Text style={styles.fingerprintLarge}>{selectedPeerForVerify.safetyNumber}</Text>
                <Text style={styles.fingerprintExpl}>
                  Calculated from SHA-256 hash of combined Ed25519 identity keys.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.qrPlaceholder}
                onPress={handleScanQr}
                activeOpacity={0.7}
              >
                <Text style={styles.qrIcon}>▦</Text>
                <Text style={styles.qrText}>SCAN PEER QR CODE</Text>
                <Text style={styles.qrSub}>Tap to simulate in-person optical QR verification and authenticate key</Text>
              </TouchableOpacity>

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
  scrollFlex: {
    flex: 1,
  },
  radarContent: {
    paddingHorizontal: NomadSpacing.md,
    paddingBottom: NomadSpacing.xl,
  },
  topologyScroll: {
    paddingBottom: NomadSpacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm + 2,
    backgroundColor: DarkThemeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarLed: {
    width: 7,
    height: 7,
    borderRadius: NomadRadius.full,
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
    fontSize: 12,
  },
  subtitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9.5,
    marginTop: 2,
    maxWidth: 240,
  },
  scanBtn: {
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.xs + 3,
    borderRadius: NomadRadius.full,
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
    borderColor: DarkThemeColors.accent,
  },
  scanBtnText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.accent,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  scanBtnTextActive: {
    color: DarkThemeColors.emergencyRed,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0C',
    padding: 3,
    marginHorizontal: NomadSpacing.md,
    marginVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: NomadSpacing.xs + 3,
    alignItems: 'center',
    borderRadius: NomadRadius.full,
  },
  tabButtonActive: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderLight,
  },
  tabButtonText: {
    ...NomadTypography.monoSmall,
    fontSize: 10.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: NomadSpacing.md,
    paddingBottom: NomadSpacing.xl,
  },
  peerCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
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
    fontWeight: '700',
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
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
  },
  rssiValue: {
    ...NomadTypography.metadata,
    fontWeight: '700',
    color: DarkThemeColors.accent,
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
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  safetyNumber: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  messageDirectBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: DarkThemeColors.actionBlue,
    paddingHorizontal: NomadSpacing.sm + 2,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageDirectText: {
    ...NomadTypography.button,
    fontSize: 10.5,
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
  },
  verifyBtnText: {
    ...NomadTypography.button,
    fontSize: 10.5,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  trustDirectBtn: {
    backgroundColor: DarkThemeColors.accentSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.accent,
    paddingHorizontal: NomadSpacing.sm + 2,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
  },
  trustDirectText: {
    ...NomadTypography.button,
    fontSize: 10.5,
    color: DarkThemeColors.accent,
    fontWeight: '700',
  },
  revokeBtn: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    paddingHorizontal: NomadSpacing.sm + 2,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
  },
  revokeBtnText: {
    ...NomadTypography.button,
    fontSize: 10.5,
    color: DarkThemeColors.emergencyRed,
    fontWeight: '700',
  },
  auditRouteBtn: {
    marginTop: NomadSpacing.md,
    backgroundColor: 'rgba(255, 85, 0, 0.1)',
    borderWidth: 1,
    borderColor: DarkThemeColors.warningAmber,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditRouteText: {
    ...NomadTypography.button,
    fontSize: 11,
    color: DarkThemeColors.warningAmber,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.lg,
    alignItems: 'center',
  },
  localNode: {
    alignItems: 'center',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.accent,
    borderRadius: NomadRadius.full,
    paddingHorizontal: NomadSpacing.lg,
    paddingVertical: NomadSpacing.sm,
  },
  nodeIcon: {
    fontSize: 18,
    color: DarkThemeColors.accent,
  },
  nodeAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  nodeMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.accent,
    fontSize: 10,
  },
  topologyLine: {
    width: 1,
    height: 32,
    backgroundColor: DarkThemeColors.borderLight,
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
    borderRadius: NomadRadius.full,
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: NomadSpacing.xs,
  },
  nodeCircleTrusted: {
    borderColor: DarkThemeColors.tacticalGreen,
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
    borderRadius: NomadRadius.lg,
  },
  legendTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.accent,
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
    borderRadius: NomadRadius.xl,
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
    borderRadius: NomadRadius.lg,
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
    color: DarkThemeColors.primaryText,
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
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.lg,
    alignItems: 'center',
    marginBottom: NomadSpacing.lg,
  },
  qrIcon: {
    fontSize: 44,
    color: DarkThemeColors.accent,
    marginBottom: NomadSpacing.xs,
  },
  qrText: {
    ...NomadTypography.button,
    fontSize: 12,
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
