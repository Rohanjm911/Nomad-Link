

export interface ThemeColors {
  primaryBackground: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  borderFocus: string;
  borderLight: string;

  primaryText: string;
  secondaryText: string;
  mutedText: string;
  inverseText: string;

  accent: string;
  accentSubtle: string;
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
  borderLight: '#CBD5E1',

  primaryText: '#0F172A',
  secondaryText: '#475569',
  mutedText: '#64748B',
  inverseText: '#FFFFFF',

  accent: '#00838F',
  accentSubtle: '#E0F7FA',
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
  // Pure Pitch Black OLED & Minimalist Graphite
  primaryBackground: '#000000',
  surface: '#0A0A0C',
  surfaceSubtle: '#121215',
  surfaceElevated: '#18181D',
  border: '#24242A',
  borderSubtle: '#18181C',
  borderFocus: '#FF5500', // Laser Safety Orange
  borderLight: '#33333C',

  // Stark High-Contrast Typography
  primaryText: '#FFFFFF',
  secondaryText: '#A1A1AA',
  mutedText: '#71717A',
  inverseText: '#000000',

  accent: '#FF5500', // Laser Safety Orange
  accentSubtle: '#260E02',
  brandNavy: '#0A0A0C',
  actionBlue: '#FFFFFF',
  actionBlueHover: '#E4E4E7',
  actionBlueSubtle: '#18181D',
  successGreen: '#10B981',
  successGreenSubtle: '#06231A',
  warningAmber: '#FF5500',
  warningAmberSubtle: '#260E02',
  emergencyRed: '#FF3B30',
  emergencyRedSubtle: '#240807',

  rssiStrong: '#10B981',
  rssiMedium: '#FF5500',
  rssiWeak: '#FF3B30',

  tacticalGreen: '#10B981',
  tacticalAmber: '#FF5500',
  tacticalCyan: '#38BDF8',
  tacticalGrid: '#18181C',
  tacticalDark: '#000000',
  tacticalPanel: '#0A0A0C',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const NomadTypography = {
  display: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  screenHeading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  sectionHeading: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  supporting: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '400' as const,
  },
  supportingMedium: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500' as const,
  },
  metadata: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  button: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.4,
  },
  mono: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  monoSmall: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'monospace',
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  hudLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
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
    accent: DarkThemeColors.warningAmber, // Laser Orange
    accentLight: '#FF8844',
    accentDark: '#CC4400',
    accentDim: DarkThemeColors.warningAmberSubtle,

    emergencyRed: DarkThemeColors.emergencyRed,
    emergencyRedDim: DarkThemeColors.emergencyRedSubtle,
    successGreen: DarkThemeColors.successGreen,
    successGreenDim: DarkThemeColors.successGreenSubtle,
    warningAmber: DarkThemeColors.warningAmber,
    warningAmberDim: DarkThemeColors.warningAmberSubtle,
    infoBlue: DarkThemeColors.tacticalCyan,
    infoBlueDim: '#0C202F',

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
