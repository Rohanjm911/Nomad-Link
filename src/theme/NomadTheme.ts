

export interface ThemeColors {
  
  primaryBackground: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;

  
  primaryText: string;
  secondaryText: string;
  mutedText: string;
  inverseText: string;

  
  brandNavy: string;
  actionBlue: string;
  actionBlueHover: string;
  actionBlueSubtle: string;
  successGreen: string;
  successGreenSubtle: string;
  warningAmber: string;
  warningAmberSubtle: string;
  emergencyRed: string;
  emergencyRedSubtle: string;

  
  rssiStrong: string;
  rssiMedium: string;
  rssiWeak: string;
}

export const LightThemeColors: ThemeColors = {
  primaryBackground: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSubtle: '#EEF2F6',
  surfaceElevated: '#FFFFFF',
  border: '#D9E1EA',
  borderSubtle: '#E2E8F0',
  borderFocus: '#2563EB',

  primaryText: '#172033',
  secondaryText: '#64748B',
  mutedText: '#94A3B8',
  inverseText: '#FFFFFF',

  brandNavy: '#183B56',
  actionBlue: '#2563EB',
  actionBlueHover: '#1D4ED8',
  actionBlueSubtle: '#EFF6FF',
  successGreen: '#15803D',
  successGreenSubtle: '#F0FDF4',
  warningAmber: '#B45309',
  warningAmberSubtle: '#FFFBEB',
  emergencyRed: '#B91C1C',
  emergencyRedSubtle: '#FEF2F2',

  rssiStrong: '#15803D',
  rssiMedium: '#B45309',
  rssiWeak: '#B91C1C',
};

export const DarkThemeColors: ThemeColors = {
  primaryBackground: '#101820',
  surface: '#18232D',
  surfaceSubtle: '#1F2C38',
  surfaceElevated: '#243442',
  border: '#344250',
  borderSubtle: '#263442',
  borderFocus: '#3B82F6',

  primaryText: '#F1F5F9',
  secondaryText: '#A7B4C2',
  mutedText: '#6B7C8E',
  inverseText: '#101820',

  brandNavy: '#1E3A5F',
  actionBlue: '#3B82F6',
  actionBlueHover: '#2563EB',
  actionBlueSubtle: '#1E293B',
  successGreen: '#22C55E',
  successGreenSubtle: '#142E1F',
  warningAmber: '#F59E0B',
  warningAmberSubtle: '#2D2311',
  emergencyRed: '#EF4444',
  emergencyRedSubtle: '#381617',

  rssiStrong: '#22C55E',
  rssiMedium: '#F59E0B',
  rssiWeak: '#EF4444',
};

export const NomadSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const NomadRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const NomadTypography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  screenHeading: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  supporting: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  supportingMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  metadata: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  mono: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'monospace',
    fontWeight: '500' as const,
  },
};

export const NomadTheme = {
  colors: {
    
    background: DarkThemeColors.primaryBackground,
    surface: DarkThemeColors.surface,
    surfaceElevated: DarkThemeColors.surfaceElevated,
    surfaceBorder: DarkThemeColors.border,

    
    brandNavy: DarkThemeColors.brandNavy,
    actionBlue: DarkThemeColors.actionBlue,
    accent: DarkThemeColors.actionBlue,
    accentLight: '#60A5FA',
    accentDark: '#1D4ED8',
    accentDim: DarkThemeColors.actionBlueSubtle,

    
    emergencyRed: DarkThemeColors.emergencyRed,
    emergencyRedDim: DarkThemeColors.emergencyRedSubtle,
    successGreen: DarkThemeColors.successGreen,
    successGreenDim: DarkThemeColors.successGreenSubtle,
    warningAmber: DarkThemeColors.warningAmber,
    warningAmberDim: DarkThemeColors.warningAmberSubtle,
    infoBlue: DarkThemeColors.actionBlue,
    infoBlueDim: DarkThemeColors.actionBlueSubtle,

    
    textPrimary: DarkThemeColors.primaryText,
    textSecondary: DarkThemeColors.secondaryText,
    textMuted: DarkThemeColors.mutedText,
    textInverse: DarkThemeColors.inverseText,

    
    rssiStrong: DarkThemeColors.rssiStrong,
    rssiMedium: DarkThemeColors.rssiMedium,
    rssiWeak: DarkThemeColors.rssiWeak,
  },
  spacing: {
    xs: NomadSpacing.xs,
    sm: NomadSpacing.sm,
    md: NomadSpacing.md,
    lg: NomadSpacing.lg,
    xl: NomadSpacing.xl,
  },
  borderRadius: {
    sm: NomadRadius.sm,
    md: NomadRadius.md,
    lg: NomadRadius.lg,
    full: NomadRadius.full,
  },
  typography: {
    headerSize: NomadTypography.screenHeading.fontSize,
    subHeaderSize: NomadTypography.sectionHeading.fontSize,
    bodySize: NomadTypography.body.fontSize,
    captionSize: NomadTypography.metadata.fontSize,
    monoSize: NomadTypography.mono.fontSize,
  },
};
