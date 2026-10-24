import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DarkThemeColors, NomadSpacing, NomadRadius, NomadTypography } from '../theme/NomadTheme';
import { TrustStatus, DeliveryState, TransportType } from '../domain/models/DomainModels';

export const TrustBadge: React.FC<{ status: TrustStatus; style?: ViewStyle }> = ({ status, style }) => {
  let bgColor = DarkThemeColors.surfaceSubtle;
  let borderColor = DarkThemeColors.border;
  let textColor = DarkThemeColors.secondaryText;
  let dotColor = DarkThemeColors.mutedText;
  let label = 'Unknown';

  switch (status) {
    case TrustStatus.TRUSTED:
      bgColor = DarkThemeColors.successGreenSubtle;
      borderColor = DarkThemeColors.tacticalGreen;
      textColor = DarkThemeColors.tacticalGreen;
      dotColor = DarkThemeColors.tacticalGreen;
      label = 'Verified';
      break;
    case TrustStatus.VERIFICATION_PENDING:
      bgColor = DarkThemeColors.warningAmberSubtle;
      borderColor = DarkThemeColors.tacticalAmber;
      textColor = DarkThemeColors.tacticalAmber;
      dotColor = DarkThemeColors.tacticalAmber;
      label = 'Pending Auth';
      break;
    case TrustStatus.DISCOVERED:
      bgColor = DarkThemeColors.surfaceSubtle;
      borderColor = DarkThemeColors.border;
      textColor = DarkThemeColors.secondaryText;
      dotColor = DarkThemeColors.secondaryText;
      label = 'Discovered';
      break;
    case TrustStatus.BLOCKED:
      bgColor = DarkThemeColors.emergencyRedSubtle;
      borderColor = DarkThemeColors.emergencyRed;
      textColor = DarkThemeColors.emergencyRed;
      dotColor = DarkThemeColors.emergencyRed;
      label = 'Blocked';
      break;
  }

  return (
    <View style={[styles.tacticalBadgeBase, { backgroundColor: bgColor, borderColor }, style]}>
      <View style={[styles.badgeDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.tacticalBadgeText, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
};

export const DeliveryStatusIndicator: React.FC<{
  state: DeliveryState;
  hopCount?: number;
  style?: ViewStyle;
}> = ({ state, hopCount = 0, style }) => {
  let label = 'Processing';
  let color = DarkThemeColors.mutedText;

  switch (state) {
    case DeliveryState.QUEUED_LOCALLY:
      label = 'DTN Queued';
      color = DarkThemeColors.tacticalAmber;
      break;
    case DeliveryState.FORWARDED_TO_RELAY:
      label = hopCount > 0 ? `Relay (Hop ${hopCount})` : 'Relay';
      color = DarkThemeColors.tacticalCyan;
      break;
    case DeliveryState.DELIVERED_TO_DESTINATION:
      label = 'Delivered';
      color = DarkThemeColors.tacticalGreen;
      break;
    case DeliveryState.READ_BY_RECIPIENT:
      label = 'Read';
      color = DarkThemeColors.tacticalCyan;
      break;
    case DeliveryState.FAILED:
      label = 'Failed';
      color = DarkThemeColors.emergencyRed;
      break;
    default:
      label = 'Sent';
      color = DarkThemeColors.mutedText;
  }

  return (
    <View style={[styles.deliveryRow, style]}>
      <View style={[styles.tacticalLed, { backgroundColor: color }]} />
      <Text style={[styles.deliveryText, { color }]}>{label}</Text>
    </View>
  );
};

export const TransportBadge: React.FC<{ type: TransportType; style?: ViewStyle }> = ({ type, style }) => {
  return (
    <View style={[styles.transportBadge, style]}>
      <Text style={styles.transportText}>{type}</Text>
    </View>
  );
};

export const SignalMeter: React.FC<{ rssi?: number; style?: ViewStyle }> = ({ rssi, style }) => {
  if (rssi === undefined || rssi === null) {
    return (
      <View style={[styles.signalRow, style]}>
        <Text style={styles.signalMonoText}>Direct P2P</Text>
      </View>
    );
  }

  let bars = 1;
  let color = DarkThemeColors.rssiWeak;
  if (rssi > -65) {
    bars = 4;
    color = DarkThemeColors.rssiStrong;
  } else if (rssi > -75) {
    bars = 3;
    color = DarkThemeColors.rssiStrong;
  } else if (rssi > -85) {
    bars = 2;
    color = DarkThemeColors.rssiMedium;
  }

  return (
    <View style={[styles.signalRow, style]}>
      <View style={styles.signalBarsWrap}>
        <View style={[styles.signalBar, { height: 4 }, bars >= 1 ? { backgroundColor: color } : styles.barOff]} />
        <View style={[styles.signalBar, { height: 7 }, bars >= 2 ? { backgroundColor: color } : styles.barOff]} />
        <View style={[styles.signalBar, { height: 10 }, bars >= 3 ? { backgroundColor: color } : styles.barOff]} />
        <View style={[styles.signalBar, { height: 13 }, bars >= 4 ? { backgroundColor: color } : styles.barOff]} />
      </View>
      <Text style={[styles.signalMonoText, { color }]}>{rssi} dBm</Text>
    </View>
  );
};

export const TacticalStatusPill: React.FC<{
  label: string;
  variant?: 'green' | 'amber' | 'cyan' | 'red' | 'muted';
  style?: ViewStyle;
}> = ({ label, variant = 'cyan', style }) => {
  let color = DarkThemeColors.tacticalCyan;
  let bg = DarkThemeColors.actionBlueSubtle;

  if (variant === 'green') {
    color = DarkThemeColors.tacticalGreen;
    bg = DarkThemeColors.successGreenSubtle;
  } else if (variant === 'amber') {
    color = DarkThemeColors.tacticalAmber;
    bg = DarkThemeColors.warningAmberSubtle;
  } else if (variant === 'red') {
    color = DarkThemeColors.emergencyRed;
    bg = DarkThemeColors.emergencyRedSubtle;
  } else if (variant === 'muted') {
    color = DarkThemeColors.mutedText;
    bg = DarkThemeColors.surfaceSubtle;
  }

  return (
    <View style={[styles.tacticalPill, { backgroundColor: bg, borderColor: color }, style]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.tacticalPillText, { color }]}>{label}</Text>
    </View>
  );
};

export const NetworkStatusBanner: React.FC<{
  title: string;
  subtitle: string;
  isOnline: boolean;
  onPressAction?: () => void;
  style?: ViewStyle;
}> = ({ title, subtitle, isOnline, style }) => {
  const borderColor = isOnline ? DarkThemeColors.tacticalGreen : DarkThemeColors.tacticalAmber;
  const dotColor = isOnline ? DarkThemeColors.tacticalGreen : DarkThemeColors.tacticalAmber;

  return (
    <View style={[styles.bannerContainer, { borderColor }, style]}>
      <View style={styles.bannerRow}>
        <View style={[styles.bannerDot, { backgroundColor: dotColor }]} />
        <Text style={styles.bannerTitle}>{title}</Text>
      </View>
      <Text style={styles.bannerSubtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tacticalBadgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 3,
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tacticalBadgeText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    fontWeight: '600',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tacticalLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deliveryText: {
    ...NomadTypography.monoSmall,
    fontWeight: '600',
  },
  transportBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.full,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  transportText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9,
    fontWeight: '600',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalBarsWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  signalBar: {
    width: 3,
    borderRadius: 1.5,
  },
  barOff: {
    backgroundColor: DarkThemeColors.borderSubtle,
  },
  signalMonoText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontWeight: '600',
  },
  tacticalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 3,
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  tacticalPillText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    fontWeight: '600',
  },
  bannerContainer: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: NomadSpacing.xs,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: NomadSpacing.sm,
  },
  bannerTitle: {
    ...NomadTypography.sectionHeading,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
  bannerSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 16,
  },
});
