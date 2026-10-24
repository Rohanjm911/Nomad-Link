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

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'subtle';

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
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : DarkThemeColors.actionBlue}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <Text style={styles.iconStyle}>{icon}</Text> : null}
          <Text style={getTextStyles()}>{label}</Text>
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

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 48, 
    borderRadius: NomadRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.lg,
    paddingVertical: NomadSpacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    marginRight: NomadSpacing.sm,
    fontSize: 16,
  },
  btnPrimary: {
    backgroundColor: DarkThemeColors.actionBlue,
    borderColor: DarkThemeColors.actionBlue,
  },
  btnSecondary: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.border,
  },
  btnDanger: {
    backgroundColor: DarkThemeColors.emergencyRed,
    borderColor: DarkThemeColors.emergencyRed,
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
    opacity: 0.6,
  },
  textBase: {
    ...NomadTypography.button,
  },
  textLight: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: DarkThemeColors.primaryText,
  },
  textOutline: {
    color: DarkThemeColors.actionBlue,
  },
  textSubtle: {
    color: DarkThemeColors.secondaryText,
  },
  textDisabled: {
    color: DarkThemeColors.mutedText,
  },
});
