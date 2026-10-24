

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

  // Mil-Spec Tactical Accents
  tacticalGreen: string;
  tacticalAmber: string;
  tacticalCyan: string;
  tacticalGrid: string;
  tacticalDark: string;
  tacticalPanel: string;
}

export const LightThemeColors: ThemeColors = {
  primaryBackground: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceSubtle: '#EDF2F7',
  surfaceElevated: '#FFFFFF',
  border: '#CFD9E3',
  borderSubtle: '#E2E8F0',
  borderFocus: '#00838F',

  primaryText: '#0F172A',
  secondaryText: '#475569',
  mutedText: '#64748B',
  inverseText: '#FFFFFF',

  brandNavy: '#0F2942',
  actionBlue: '#00838F',
  actionBlueHover: '#006064',
  actionBlueSubtle: '#E0F7FA',
  successGreen: '#008736',
  successGreenSubtle: '#E8F5E9',
  warningAmber: '#D97706',
  warningAmberSubtle: '#FEF3C7',
  emergencyRed: '#DC2626',
  emergencyRedSubtle: '#FEE2E2',

  rssiStrong: '#008736',
  rssiMedium: '#D97706',
  rssiWeak: '#DC2626',

  tacticalGreen: '#008736',
  tacticalAmber: '#D97706',
  tacticalCyan: '#00838F',
  tacticalGrid: '#E2E8F0',
  tacticalDark: '#F4F6F8',
  tacticalPanel: '#FFFFFF',
};

export const DarkThemeColors: ThemeColors = {
  // Rugged Matte Black & Gunmetal
  primaryBackground: '#080C10',
  surface: '#0F1620',
  surfaceSubtle: '#151F2C',
  surfaceElevated: '#1B2737',
  border: '#233446',
  borderSubtle: '#182432',
  borderFocus: '#00E5FF',

  // High Contrast Text
  primaryText: '#E6EDF3',
  secondaryText: '#8B9EB0',
  mutedText: '#5A6C7E',
  inverseText: '#080C10',

  brandNavy: '#102235',
  actionBlue: '#00E5FF',
  actionBlueHover: '#00B4D8',
  actionBlueSubtle: '#092535',
  successGreen: '#00FF66',
  successGreenSubtle: '#062916',
  warningAmber: '#FFB000',
  warningAmberSubtle: '#2E2004',
  emergencyRed: '#FF2A2A',
  emergencyRedSubtle: '#380909',

  rssiStrong: '#00FF66',
  rssiMedium: '#FFB000',
  rssiWeak: '#FF2A2A',

  tacticalGreen: '#00FF66',
  tacticalAmber: '#FFB000',
  tacticalCyan: '#00E5FF',
  tacticalGrid: '#182535',
  tacticalDark: '#080C10',
  tacticalPanel: '#0F1620',
};

export const NomadSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const NomadRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  full: 9999,
};

export const NomadTypography = {
  display: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
  screenHeading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  sectionHeading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as const,
    letterSpacing: 1.0,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  supporting: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400' as const,
  },
  supportingMedium: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600' as const,
  },
  metadata: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
  },
  button: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
  },
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  monoSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'monospace',
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  hudLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800' as const,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
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

    tacticalGreen: DarkThemeColors.tacticalGreen,
    tacticalAmber: DarkThemeColors.tacticalAmber,
    tacticalCyan: DarkThemeColors.tacticalCyan,
    tacticalGrid: DarkThemeColors.tacticalGrid,
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
