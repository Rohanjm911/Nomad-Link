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
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
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
}> = ({ title, message, retryLabel = 'Try Again', onRetry, style }) => {
  return (
    <View style={[styles.container, styles.errorContainer, style]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={[styles.title, { color: DarkThemeColors.emergencyRed }]}>{title}</Text>
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
      <Text style={styles.sectionTitle}>{title}</Text>
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
  errorContainer: {
    borderColor: DarkThemeColors.emergencyRedSubtle,
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  icon: {
    fontSize: 32,
    marginBottom: NomadSpacing.md,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: NomadSpacing.md,
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
    lineHeight: 20,
    maxWidth: 320,
  },
  actionWrap: {
    marginTop: NomadSpacing.lg,
    width: '100%',
    maxWidth: 240,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NomadSpacing.lg,
    marginBottom: NomadSpacing.sm,
  },
  sectionTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionAction: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontWeight: '600',
  },
});
