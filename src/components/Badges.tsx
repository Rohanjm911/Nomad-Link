import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DarkThemeColors, NomadSpacing, NomadRadius, NomadTypography } from '../theme/NomadTheme';
import { TrustStatus, DeliveryState, TransportType } from '../domain/models/DomainModels';

export const TrustBadge: React.FC<{ status: TrustStatus; style?: ViewStyle }> = ({ status, style }) => {
  let bgColor = DarkThemeColors.surfaceSubtle;
  let textColor = DarkThemeColors.secondaryText;
  let label = 'Unknown';
  let icon = '○';

  switch (status) {
    case TrustStatus.TRUSTED:
      bgColor = DarkThemeColors.successGreenSubtle;
      textColor = DarkThemeColors.successGreen;
      label = 'Verified Identity';
      icon = '✓';
      break;
    case TrustStatus.VERIFICATION_PENDING:
      bgColor = DarkThemeColors.warningAmberSubtle;
      textColor = DarkThemeColors.warningAmber;
      label = 'Verify Fingerprint';
      icon = '▲';
      break;
    case TrustStatus.DISCOVERED:
      bgColor = DarkThemeColors.surfaceSubtle;
      textColor = DarkThemeColors.secondaryText;
      label = 'Discovered';
      icon = '◎';
      break;
    case TrustStatus.BLOCKED:
      bgColor = DarkThemeColors.emergencyRedSubtle;
      textColor = DarkThemeColors.emergencyRed;
      label = 'Blocked';
      icon = '✕';
      break;
  }

  return (
    <View style={[styles.badgeBase, { backgroundColor: bgColor, borderColor: textColor }, style]}>
      <Text style={[styles.badgeIcon, { color: textColor }]}>{icon}</Text>
      <Text style={[styles.badgeLabel, { color: textColor }]}>{label}</Text>
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
  let icon = '⏳';

  switch (state) {
    case DeliveryState.QUEUED_LOCALLY:
      label = 'Queued Locally';
      color = DarkThemeColors.warningAmber;
      icon = '⏳';
      break;
    case DeliveryState.FORWARDED_TO_RELAY:
      label = hopCount > 0 ? `Relayed via Mesh (Hop ${hopCount})` : 'Relayed via Mesh';
      color = DarkThemeColors.actionBlue;
      icon = '⇄';
      break;
    case DeliveryState.DELIVERED_TO_DESTINATION:
      label = 'Delivered';
      color = DarkThemeColors.successGreen;
      icon = '✓✓';
      break;
    case DeliveryState.READ_BY_RECIPIENT:
      label = 'Read';
      color = DarkThemeColors.actionBlue;
      icon = '✓✓';
      break;
    case DeliveryState.FAILED:
      label = 'Delivery Expired / Failed';
      color = DarkThemeColors.emergencyRed;
      icon = '✕';
      break;
    default:
      label = 'Accepted';
      color = DarkThemeColors.mutedText;
      icon = '•';
  }

  return (
    <View style={[styles.deliveryRow, style]}>
      <Text style={[styles.deliveryIcon, { color }]}>{icon}</Text>
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

export const NetworkStatusBanner: React.FC<{
  title: string;
  subtitle: string;
  isOnline: boolean;
  onPressAction?: () => void;
  style?: ViewStyle;
}> = ({ title, subtitle, isOnline, style }) => {
  const borderColor = isOnline ? DarkThemeColors.actionBlue : DarkThemeColors.warningAmber;
  const dotColor = isOnline ? DarkThemeColors.actionBlue : DarkThemeColors.warningAmber;

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
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: NomadSpacing.xxs + 1,
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    fontSize: 10,
    marginRight: NomadSpacing.xs,
    fontWeight: '700',
  },
  badgeLabel: {
    ...NomadTypography.metadata,
    fontWeight: '600',
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIcon: {
    fontSize: 11,
    marginRight: NomadSpacing.xs,
    fontWeight: '700',
  },
  deliveryText: {
    ...NomadTypography.metadata,
  },
  transportBadge: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.xs + 2,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  transportText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontSize: 10,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: NomadSpacing.sm,
  },
  bannerTitle: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.primaryText,
  },
  bannerSubtitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    lineHeight: 16,
  },
});
