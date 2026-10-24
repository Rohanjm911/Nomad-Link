import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { DarkThemeColors, NomadSpacing, NomadRadius, NomadTypography } from '../theme/NomadTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'subtle' | 'tactical';

interface BaseButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export const PrimaryButton: React.FC<BaseButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const getButtonStyles = (): ViewStyle[] => {
    const list: ViewStyle[] = [styles.buttonBase];
    switch (variant) {
      case 'primary':
        list.push(styles.btnPrimary);
        break;
      case 'tactical':
        list.push(styles.btnTactical);
        break;
      case 'secondary':
        list.push(styles.btnSecondary);
        break;
      case 'danger':
        list.push(styles.btnDanger);
        break;
      case 'outline':
        list.push(styles.btnOutline);
        break;
      case 'subtle':
        list.push(styles.btnSubtle);
        break;
    }
    if (disabled) {
      list.push(styles.btnDisabled);
    }
    if (style) {
      list.push(style);
    }
    return list;
  };

  const getTextStyles = (): TextStyle[] => {
    const list: TextStyle[] = [styles.textBase];
    switch (variant) {
      case 'primary':
      case 'danger':
        list.push(styles.textLight);
        break;
      case 'tactical':
        list.push(styles.textTactical);
        break;
      case 'secondary':
        list.push(styles.textSecondary);
        break;
      case 'outline':
        list.push(styles.textOutline);
        break;
      case 'subtle':
        list.push(styles.textSubtle);
        break;
    }
    if (disabled) {
      list.push(styles.textDisabled);
    }
    if (textStyle) {
      list.push(textStyle);
    }
    return list;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyles()}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : DarkThemeColors.tacticalCyan}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <Text style={styles.iconStyle}>{icon}</Text> : null}
          <Text style={getTextStyles()}>{label.toUpperCase()}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const SecondaryButton: React.FC<Omit<BaseButtonProps, 'variant'>> = (props) => (
  <PrimaryButton {...props} variant="secondary" />
);

export const DangerButton: React.FC<Omit<BaseButtonProps, 'variant'>> = (props) => (
  <PrimaryButton {...props} variant="danger" />
);

export const TacticalActionButton: React.FC<{
  label: string;
  icon?: string;
  onPress: () => void;
  accent?: 'cyan' | 'green' | 'amber' | 'red';
  disabled?: boolean;
  style?: ViewStyle;
}> = ({ label, icon, onPress, accent = 'cyan', disabled, style }) => {
  let borderColor = DarkThemeColors.tacticalCyan;
  let textColor = DarkThemeColors.tacticalCyan;
  let bgColor = DarkThemeColors.surfaceSubtle;

  if (accent === 'green') {
    borderColor = DarkThemeColors.tacticalGreen;
    textColor = DarkThemeColors.tacticalGreen;
  } else if (accent === 'amber') {
    borderColor = DarkThemeColors.tacticalAmber;
    textColor = DarkThemeColors.tacticalAmber;
  } else if (accent === 'red') {
    borderColor = DarkThemeColors.emergencyRed;
    textColor = DarkThemeColors.emergencyRed;
    bgColor = DarkThemeColors.emergencyRedSubtle;
  }

  return (
    <TouchableOpacity
      style={[styles.tacticalActionBtn, { borderColor, backgroundColor: bgColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon ? <Text style={[styles.tacticalActionIcon, { color: textColor }]}>{icon}</Text> : null}
      <Text style={[styles.tacticalActionText, { color: textColor }]}>[{label.toUpperCase()}]</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 44,
    borderRadius: NomadRadius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    marginRight: NomadSpacing.xs + 2,
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: DarkThemeColors.surfaceElevated,
    borderColor: DarkThemeColors.tacticalCyan,
    borderWidth: 1,
  },
  btnTactical: {
    backgroundColor: DarkThemeColors.tacticalPanel,
    borderColor: DarkThemeColors.tacticalGreen,
    borderWidth: 1,
  },
  btnSecondary: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.border,
  },
  btnDanger: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderColor: DarkThemeColors.emergencyRed,
    borderWidth: 1,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderColor: DarkThemeColors.border,
  },
  btnSubtle: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  btnDisabled: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.borderSubtle,
    opacity: 0.5,
  },
  textBase: {
    ...NomadTypography.button,
  },
  textLight: {
    color: DarkThemeColors.primaryText,
  },
  textTactical: {
    color: DarkThemeColors.tacticalGreen,
  },
  textSecondary: {
    color: DarkThemeColors.primaryText,
  },
  textOutline: {
    color: DarkThemeColors.tacticalCyan,
  },
  textSubtle: {
    color: DarkThemeColors.secondaryText,
  },
  textDisabled: {
    color: DarkThemeColors.mutedText,
  },
  tacticalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: NomadSpacing.xs + 2,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    gap: 4,
  },
  tacticalActionIcon: {
    fontSize: 12,
  },
  tacticalActionText: {
    ...NomadTypography.monoSmall,
    fontWeight: '800',
    letterSpacing: 1.0,
  },
});
