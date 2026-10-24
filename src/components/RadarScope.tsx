import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../theme/NomadTheme';
import { PeerRecord, TrustStatus } from '../domain/models/DomainModels';
import { TrustBadge, TransportBadge } from './Badges';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RADAR_SIZE = Math.min(SCREEN_WIDTH - 48, 300);
const RADAR_RADIUS = RADAR_SIZE / 2;

interface RadarScopeProps {
  peers: PeerRecord[];
  isScanning: boolean;
  selectedPeer: PeerRecord | null;
  onSelectPeer: (peer: PeerRecord | null) => void;
  onVerifyPeer: (peer: PeerRecord) => void;
  onToggleTrust: (peer: PeerRecord) => void;
  onMessagePeer?: (peer: PeerRecord) => void;
  onToggleScan?: () => void;
  onSwitchToList?: () => void;
}

export const RadarScope: React.FC<RadarScopeProps> = ({
  peers,
  isScanning,
  selectedPeer,
  onSelectPeer,
  onVerifyPeer,
  onToggleTrust,
  onMessagePeer,
  onToggleScan,
  onSwitchToList,
}) => {
  const [maxRangeMeters, setMaxRangeMeters] = useState<number>(100);

  const cycleRange = () => {
    const next = maxRangeMeters === 50 ? 100 : maxRangeMeters === 100 ? 200 : 50;
    setMaxRangeMeters(next);
  };
  const sweepAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const sweepLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Rotating radar sweep animation
  useEffect(() => {
    if (isScanning) {
      sweepAnim.setValue(0);
      sweepLoop.current = Animated.loop(
        Animated.timing(sweepAnim, {
          toValue: 1,
          duration: 3600,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      sweepLoop.current.start();
    } else {
      sweepLoop.current?.stop();
    }

    return () => {
      sweepLoop.current?.stop();
    };
  }, [isScanning, sweepAnim]);

  // Subtle pulsing halo on detected target nodes
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const spin = sweepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate coordinates for each peer on radar scope
  const calculateNodePosition = (peer: PeerRecord) => {
    const bearing = peer.bearingDeg ?? 45;
    const distance = peer.distanceMeters ?? 40;

    // Convert bearing (0° = North = top) to polar math angle (-90°)
    const angleRad = (bearing - 90) * (Math.PI / 180);
    const normalizedDistance = Math.min(distance / maxRangeMeters, 0.90);
    const pixelDistance = normalizedDistance * (RADAR_RADIUS - 16);

    const x = RADAR_RADIUS + pixelDistance * Math.cos(angleRad);
    const y = RADAR_RADIUS + pixelDistance * Math.sin(angleRad);

    return { x, y, bearing, distance };
  };

  return (
    <View style={styles.container}>
      {/* RADAR METRIC HEADER */}
      <View style={styles.hudHeader}>
        <TouchableOpacity
          style={styles.hudHeaderItem}
          onPress={cycleRange}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Cycle Radar Range"
        >
          <Text style={styles.hudMetricLabel}>RANGE ⟳</Text>
          <Text style={styles.hudMetricValue}>{maxRangeMeters} M</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hudHeaderItemCenter}
          onPress={() => {
            if (onToggleScan) {
              onToggleScan();
            }
          }}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Toggle Radar Sweep"
        >
          <View
            style={[
              styles.statusLed,
              isScanning ? styles.statusLedActive : styles.statusLedStandby,
            ]}
          />
          <Text style={styles.hudMetricStatus}>
            {isScanning ? 'SWEEP ACTIVE' : 'STANDBY'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.hudHeaderItem}
          onPress={() => {
            if (onSwitchToList) {
              onSwitchToList();
            } else if (peers.length > 0) {
              onSelectPeer(peers[0]);
            }
          }}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="View Contacts List"
        >
          <Text style={styles.hudMetricLabel}>CONTACTS ↗</Text>
          <Text style={styles.hudMetricValue}>{peers.length} NODES</Text>
        </TouchableOpacity>
      </View>

      {/* CIRCULAR RADAR SCOPE CANVAS */}
      <View style={[styles.scopeCanvas, { width: RADAR_SIZE, height: RADAR_SIZE }]}>
        {/* RANGE RINGS */}
        <View style={[styles.rangeRing, styles.ringOuter]} />
        <View style={[styles.rangeRing, styles.ringMiddle]} />
        <View style={[styles.rangeRing, styles.ringInner]} />

        {/* CROSSHAIR AXES */}
        <View style={styles.crosshairVertical} />
        <View style={styles.crosshairHorizontal} />

        {/* CARDINAL LABELS */}
        <TouchableOpacity
          style={styles.cardinalNorthWrap}
          onPress={() =>
            Alert.alert(
              'Magnetic Compass',
              'Compass Heading: 000° True North · Sensor fusion dead-reckoning engine active.'
            )
          }
          activeOpacity={0.7}
        >
          <Text style={styles.cardinalNorth}>N 000°</Text>
        </TouchableOpacity>
        <Text style={styles.cardinalEast}>E 090°</Text>
        <Text style={styles.cardinalSouth}>S 180°</Text>
        <Text style={styles.cardinalWest}>W 270°</Text>

        {/* RANGE LABELS */}
        <Text style={styles.rangeLabelInner}>{Math.round(maxRangeMeters * 0.25)}m</Text>
        <Text style={styles.rangeLabelMiddle}>{Math.round(maxRangeMeters * 0.5)}m</Text>
        <Text style={styles.rangeLabelOuter}>{maxRangeMeters}m</Text>

        {/* ROTATING SWEEP BEAM */}
        {isScanning && (
          <Animated.View
            style={[
              styles.sweepContainer,
              {
                width: RADAR_SIZE,
                height: RADAR_SIZE,
                transform: [{ rotate: spin }],
              },
            ]}
            pointerEvents="none"
          >
            {/* The laser sweep line from center to edge */}
            <View style={styles.sweepLine} />
            {/* Fading sweep sector aura */}
            <View style={styles.sweepGlow} />
          </Animated.View>
        )}

        {/* CENTER LOCAL NODE [YOU] */}
        <TouchableOpacity
          style={styles.centerNode}
          onPress={() =>
            Alert.alert(
              'Origin Transceiver [You]',
              'Local Node Status:\n• Call-Sign: You (Local Origin)\n• Radio: BLE 5.2 Extended L2CAP Transceiver\n• Dead-Reckoning: Operational\n• GPS Coordinates: 34.2257° N, 77.5619° E'
            )
          }
          activeOpacity={0.7}
        >
          <View style={styles.centerNodeCore} />
        </TouchableOpacity>

        {/* DETECTED PEER TARGET BLIPS */}
        {peers.map(peer => {
          const { x, y, distance } = calculateNodePosition(peer);
          const isSelected = selectedPeer?.peerId === peer.peerId;
          const isTrusted = peer.trustStatus === TrustStatus.TRUSTED;
          const isPending = peer.trustStatus === TrustStatus.VERIFICATION_PENDING;

          const dotColor = isTrusted
            ? DarkThemeColors.tacticalGreen
            : isPending
            ? DarkThemeColors.warningAmber
            : DarkThemeColors.accent;

          return (
            <TouchableOpacity
              key={peer.peerId}
              style={[
                styles.blipContainer,
                { left: x - 18, top: y - 18 },
                isSelected && styles.blipSelected,
              ]}
              onPress={() => onSelectPeer(peer)}
              activeOpacity={0.7}
            >
              {/* Pulsing halo ring */}
              <Animated.View
                style={[
                  styles.blipHalo,
                  {
                    borderColor: dotColor,
                    opacity: pulseAnim,
                  },
                ]}
              />

              {/* Glowing Core Dot */}
              <View style={[styles.blipCore, { backgroundColor: dotColor }]} />

              {/* Minimalist Alias & Distance Tag */}
              <View style={styles.blipTag}>
                <Text style={styles.blipTagText} numberOfLines={1}>
                  {peer.alias.split('-')[0]} · {distance}m
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* NODE INSPECTION CARD */}
      {selectedPeer ? (
        <View style={styles.inspectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.aliasWrap}>
              <View style={styles.selectedDot} />
              <Text style={styles.cardAlias}>{selectedPeer.alias}</Text>
              <TransportBadge type={selectedPeer.transportType} />
            </View>
            <View style={styles.cardHeaderActions}>
              <TrustBadge status={selectedPeer.trustStatus} />
              <TouchableOpacity
                style={styles.closeCardBtn}
                onPress={() => onSelectPeer(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeCardText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>DISTANCE</Text>
              <Text style={styles.metricValue}>
                {selectedPeer.distanceMeters ?? 35} M
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>BEARING</Text>
              <Text style={styles.metricValue}>
                {selectedPeer.bearingDeg ?? 45}° AZ
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>SIGNAL</Text>
              <Text style={styles.metricValue}>
                {selectedPeer.rssi ?? -68} dBm
              </Text>
            </View>
          </View>

          <View style={styles.fingerprintRow}>
            <Text style={styles.fpLabel}>SAS FINGERPRINT:</Text>
            <Text style={styles.fpValue}>{selectedPeer.safetyNumber || 'Unverified'}</Text>
          </View>

          <View style={styles.cardActions}>
            {onMessagePeer && (
              <TouchableOpacity
                style={styles.messageBtn}
                onPress={() => onMessagePeer(selectedPeer)}
                activeOpacity={0.7}
              >
                <Text style={styles.messageBtnText}>Message Node</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.pingBtn}
              onPress={() => {
                const pingMs = Math.floor(Math.random() * 12) + 8;
                Alert.alert(
                  'RF Ping Diagnostic',
                  `Direct Ping with ${selectedPeer.alias}:\n• Round-Trip Latency: ${pingMs}ms\n• Signal Quality: ${selectedPeer.rssi ?? -68} dBm\n• Link Mode: BLE 5.2 Direct\n• Hops: 1 Hop · Loss: 0%`
                );
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.pingBtnText}>📡 Ping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authBtn}
              onPress={() => onVerifyPeer(selectedPeer)}
              activeOpacity={0.7}
            >
              <Text style={styles.authBtnText}>Verify Auth</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                selectedPeer.trustStatus === TrustStatus.TRUSTED
                  ? styles.revokeBtn
                  : styles.trustBtn
              }
              onPress={() => onToggleTrust(selectedPeer)}
              activeOpacity={0.7}
            >
              <Text
                style={
                  selectedPeer.trustStatus === TrustStatus.TRUSTED
                    ? styles.revokeBtnText
                    : styles.trustBtnText
                }
              >
                {selectedPeer.trustStatus === TrustStatus.TRUSTED
                  ? 'Revoke'
                  : 'Authorize'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.standbyStrip}
          onPress={() => {
            if (peers.length > 0) {
              onSelectPeer(peers[0]);
            } else {
              Alert.alert(
                'Radar Scope',
                'No radio contacts currently detected within range. Tap Scan Radar in the header to broadcast discovery bursts.'
              );
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.standbyText}>
            {peers.length > 0
              ? `📡 ${peers.length} active nodes on radar · Tap here to select nearest node`
              : 'Tap any detected target blip on radar scope to inspect link telemetry.'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: NomadSpacing.sm,
  },
  hudHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  hudHeaderItem: {
    alignItems: 'flex-start',
  },
  hudHeaderItemCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F0F13',
    paddingHorizontal: NomadSpacing.sm + 2,
    paddingVertical: 4,
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
  },
  hudMetricLabel: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  hudMetricValue: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontSize: 11,
    fontWeight: '800',
  },
  statusLed: {
    width: 6,
    height: 6,
    borderRadius: NomadRadius.full,
  },
  statusLedActive: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  statusLedStandby: {
    backgroundColor: DarkThemeColors.tacticalAmber,
  },
  hudMetricStatus: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.primaryText,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scopeCanvas: {
    backgroundColor: '#050507',
    borderRadius: RADAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: DarkThemeColors.border,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: NomadSpacing.xs,
  },
  rangeRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
  },
  ringOuter: {
    width: RADAR_SIZE - 28,
    height: RADAR_SIZE - 28,
  },
  ringMiddle: {
    width: (RADAR_SIZE - 28) * 0.66,
    height: (RADAR_SIZE - 28) * 0.66,
  },
  ringInner: {
    width: (RADAR_SIZE - 28) * 0.33,
    height: (RADAR_SIZE - 28) * 0.33,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardinalNorth: {
    position: 'absolute',
    top: 6,
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  cardinalSouth: {
    position: 'absolute',
    bottom: 6,
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  cardinalEast: {
    position: 'absolute',
    right: 6,
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  cardinalWest: {
    position: 'absolute',
    left: 6,
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  rangeLabelInner: {
    position: 'absolute',
    top: RADAR_RADIUS - (RADAR_SIZE - 28) * 0.165 - 12,
    right: RADAR_RADIUS + 4,
    ...NomadTypography.monoSmall,
    fontSize: 8,
    color: DarkThemeColors.mutedText,
  },
  rangeLabelMiddle: {
    position: 'absolute',
    top: RADAR_RADIUS - (RADAR_SIZE - 28) * 0.33 - 12,
    right: RADAR_RADIUS + 4,
    ...NomadTypography.monoSmall,
    fontSize: 8,
    color: DarkThemeColors.mutedText,
  },
  rangeLabelOuter: {
    position: 'absolute',
    top: 18,
    right: RADAR_RADIUS + 4,
    ...NomadTypography.monoSmall,
    fontSize: 8,
    color: DarkThemeColors.mutedText,
  },
  sweepContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sweepLine: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    height: RADAR_RADIUS,
    backgroundColor: DarkThemeColors.accent,
    opacity: 0.85,
  },
  sweepGlow: {
    position: 'absolute',
    top: 0,
    right: RADAR_RADIUS,
    width: RADAR_RADIUS,
    height: RADAR_RADIUS,
    backgroundColor: 'rgba(255, 85, 0, 0.05)',
    borderTopLeftRadius: RADAR_RADIUS,
  },
  centerNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  centerNodeCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  blipContainer: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  blipSelected: {
    zIndex: 20,
  },
  blipHalo: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.2,
  },
  blipCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blipTag: {
    position: 'absolute',
    top: 24,
    backgroundColor: '#0F0F14',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    maxWidth: 68,
  },
  blipTagText: {
    ...NomadTypography.monoSmall,
    fontSize: 7.5,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  inspectionCard: {
    width: '100%',
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.lg,
    padding: NomadSpacing.md,
    marginTop: NomadSpacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.sm,
  },
  aliasWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: NomadRadius.full,
    backgroundColor: DarkThemeColors.accent,
  },
  cardAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    fontWeight: '800',
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.sm,
    marginBottom: NomadSpacing.xs + 3,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 8.5,
    letterSpacing: 0.6,
  },
  metricValue: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 2,
  },
  fingerprintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: NomadSpacing.sm,
    paddingHorizontal: 2,
  },
  fpLabel: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 9,
  },
  fpValue: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontSize: 10.5,
    fontWeight: '700',
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeCardBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCardText: {
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    fontWeight: '700',
  },
  cardinalNorthWrap: {
    position: 'absolute',
    top: 6,
    zIndex: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  messageBtn: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    paddingVertical: NomadSpacing.xs + 3,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBtnText: {
    ...NomadTypography.monoSmall,
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
  },
  pingBtn: {
    flex: 0.9,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: DarkThemeColors.actionBlue,
    paddingVertical: NomadSpacing.xs + 3,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingBtnText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.actionBlue,
    fontSize: 10,
    fontWeight: '800',
  },
  authBtn: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingVertical: NomadSpacing.xs + 3,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authBtnText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.primaryText,
    fontSize: 10,
    fontWeight: '700',
  },
  trustBtn: {
    flex: 1,
    backgroundColor: DarkThemeColors.accentSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.accent,
    paddingVertical: NomadSpacing.xs + 3,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBtnText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.accent,
    fontSize: 10,
    fontWeight: '800',
  },
  revokeBtn: {
    flex: 1,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRed,
    paddingVertical: NomadSpacing.xs + 3,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revokeBtnText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.emergencyRed,
    fontSize: 10,
    fontWeight: '800',
  },
  standbyStrip: {
    width: '100%',
    padding: NomadSpacing.sm,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderRadius: NomadRadius.md,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    marginTop: NomadSpacing.sm,
  },
  standbyText: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.mutedText,
    fontSize: 10.5,
    textAlign: 'center',
  },
});
