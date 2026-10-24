import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { DarkThemeColors, NomadSpacing, NomadRadius, NomadTypography } from '../theme/NomadTheme';
import { PrimaryButton, SecondaryButton } from './Buttons';

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}> = ({ title, description, icon = '📡', actionLabel, onAction, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.radarRing}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <PrimaryButton label={actionLabel} onPress={onAction} variant="tactical" />
        </View>
      ) : null}
    </View>
  );
};

export const ErrorState: React.FC<{
  title: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ title, message, retryLabel = 'Retry Transmission', onRetry, style }) => {
  return (
    <View style={[styles.container, styles.errorContainer, style]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={[styles.title, { color: DarkThemeColors.emergencyRed }]}>
        Alert: {title}
      </Text>
      <Text style={styles.description}>{message}</Text>
      {onRetry ? (
        <View style={styles.actionWrap}>
          <SecondaryButton label={retryLabel} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
};

export const SectionHeader: React.FC<{
  title: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
}> = ({ title, actionText, onAction, style }) => {
  return (
    <View style={[styles.sectionHeaderRow, style]}>
      <View style={styles.titleWrap}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {actionText && onAction ? (
        <Text style={styles.sectionAction} onPress={onAction}>
          {actionText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: NomadSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DarkThemeColors.surface,
    borderRadius: NomadRadius.md,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.md,
  },
  radarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: NomadSpacing.md,
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  errorContainer: {
    borderColor: DarkThemeColors.emergencyRed,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
  },
  icon: {
    fontSize: 24,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: NomadSpacing.sm,
    color: DarkThemeColors.emergencyRed,
  },
  title: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    textAlign: 'center',
    marginBottom: NomadSpacing.xs,
  },
  description: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  actionWrap: {
    marginTop: NomadSpacing.md,
    width: '100%',
    maxWidth: 220,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NomadSpacing.lg,
    marginBottom: NomadSpacing.xs + 2,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.borderSubtle,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionDot: {
    width: 6,
    height: 6,
    backgroundColor: DarkThemeColors.warningAmber, // Laser orange dot
    borderRadius: 3,
  },
  sectionTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionAction: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.warningAmber,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
