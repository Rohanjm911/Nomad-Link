import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { PrimaryButton, SecondaryButton } from '../../components/Buttons';

const NOMAD_LOGO = require('../../assets/images/logo.png');

interface OnboardingScreenProps {
  onComplete: (alias: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'how_it_works' | 'identity' | 'permissions' | 'ready'>('welcome');
  const [deviceAlias, setDeviceAlias] = useState('Nomad-Scout');
  const [blePermGranted, setBlePermGranted] = useState(true);
  const [locPermGranted, setLocPermGranted] = useState(true);
  const [battPermGranted, setBattPermGranted] = useState(false);

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.brandIconContainer}>
        <Image source={NOMAD_LOGO} style={styles.brandLogoImage} />
      </View>
      <Text style={styles.brandTitle}>NOMAD LINK</Text>
      <Text style={styles.brandTagline}>No Signal. No Limits.</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>EXPEDITION-GRADE MESH NETWORKING</Text>
        <Text style={styles.cardBody}>
          NOMAD LINK is an Android-first, offline-first peer-to-peer communication and convoy coordination platform.
          Communicate with nearby travellers, vehicles, and explorers directly over BLE and Wi-Fi Direct without cellular reception or internet.
        </Text>
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton label="Get Started" onPress={() => setStep('how_it_works')} />
      </View>
    </View>
  );

  const renderHowItWorks = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.screenHeading}>How It Works</Text>
      <Text style={styles.screenSubheading}>
        Real P2P networking for beyond-cellular environments.
      </Text>

      <ScrollView style={styles.scrollArea}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📡</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Nearby Device Discovery</Text>
            <Text style={styles.featureBody}>
              Scans for compatible BLE GATT radios. Effective range spans direct line of sight (~30-100m).
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⇄</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Store-and-Forward Routing</Text>
            <Text style={styles.featureBody}>
              Messages hop peer-to-peer across intermediary nodes until reaching the destination.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Authenticated Encryption</Text>
            <Text style={styles.featureBody}>
              ChaCha20-Poly1305 ensures intermediary relay nodes cannot inspect or modify your messages.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🧭</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Offline Navigation & Dead Reckoning</Text>
            <Text style={styles.featureBody}>
              Sensor fusion keeps estimating position when deep valleys, canopies, or tunnels block GNSS lock.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <PrimaryButton label="Continue to Identity" onPress={() => setStep('identity')} />
      </View>
    </View>
  );

  const renderIdentity = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.screenHeading}>Device Identity</Text>
      <Text style={styles.screenSubheading}>
        Choose your expedition call-sign. An Ed25519 identity key will be bound to your device.
      </Text>

      <View style={styles.card}>
        <Text style={styles.inputLabel}>EXPEDITION CALL-SIGN / ALIAS</Text>
        <TextInput
          style={styles.textInput}
          value={deviceAlias}
          onChangeText={setDeviceAlias}
          placeholder="e.g. Atlas-Leader"
          placeholderTextColor={DarkThemeColors.mutedText}
          maxLength={24}
        />
        <Text style={styles.inputNote}>
          This alias is broadcast to nearby peers during discovery. You can change this later in settings.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.inputLabel}>LOCAL HARDWARE FINGERPRINT</Text>
        <Text style={styles.fingerprintPreview}>2120 4840 7560 9912</Text>
        <Text style={styles.inputNote}>
          Peers can verify this 12-digit safety number in person to guarantee tamper-proof trust.
        </Text>
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton
          label="Next: Review Permissions"
          onPress={() => setStep('permissions')}
          disabled={!deviceAlias.trim()}
        />
      </View>
    </View>
  );

  const renderPermissions = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.screenHeading}>Permissions</Text>
      <Text style={styles.screenSubheading}>
        NOMAD LINK requires specific hardware access to discover and coordinate offline.
      </Text>

      <ScrollView style={styles.scrollArea}>
        <View style={styles.permCard}>
          <View style={styles.permRow}>
            <Text style={styles.permIcon}>📡</Text>
            <View style={styles.permTextWrap}>
              <Text style={styles.permTitle}>Bluetooth & Nearby Devices</Text>
              <Text style={styles.permDesc}>
                Required for BLE peripheral advertising and central discovery between convoy members.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.permStatusBtn, blePermGranted && styles.permGrantedBtn]}
            onPress={() => setBlePermGranted(!blePermGranted)}
          >
            <Text style={[styles.permStatusText, blePermGranted && styles.permGrantedText]}>
              {blePermGranted ? '✓ GRANTED' : 'GRANT ACCESS'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permCard}>
          <View style={styles.permRow}>
            <Text style={styles.permIcon}>🧭</Text>
            <View style={styles.permTextWrap}>
              <Text style={styles.permTitle}>Precise Location (GPS)</Text>
              <Text style={styles.permDesc}>
                Required by Android for BLE beacon scanning, convoy telemetry, and dead reckoning tracking.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.permStatusBtn, locPermGranted && styles.permGrantedBtn]}
            onPress={() => setLocPermGranted(!locPermGranted)}
          >
            <Text style={[styles.permStatusText, locPermGranted && styles.permGrantedText]}>
              {locPermGranted ? '✓ GRANTED' : 'GRANT ACCESS'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permCard}>
          <View style={styles.permRow}>
            <Text style={styles.permIcon}>🔋</Text>
            <View style={styles.permTextWrap}>
              <Text style={styles.permTitle}>Battery Optimization Exemption</Text>
              <Text style={styles.permDesc}>
                Optional. Allows background relay store-and-forward when your phone screen is switched off.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.permStatusBtn, battPermGranted && styles.permGrantedBtn]}
            onPress={() => setBattPermGranted(!battPermGranted)}
          >
            <Text style={[styles.permStatusText, battPermGranted && styles.permGrantedText]}>
              {battPermGranted ? '✓ GRANTED' : 'OPTIONAL'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <PrimaryButton label="Proceed to Final Setup" onPress={() => setStep('ready')} />
      </View>
    </View>
  );

  const renderReady = () => (
    <View style={styles.stepContainer}>
      <View style={styles.readyCircle}>
        <Text style={styles.readyCheck}>✓</Text>
      </View>
      <Text style={styles.screenHeading}>Ready for the Expedition</Text>
      <Text style={styles.screenSubheading}>
        Your identity "{deviceAlias}" is configured. The offline mesh radio is primed and ready.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>OPERATIONAL DIRECTIVES</Text>
        <Text style={styles.readyPoint}>• No cellular reception or SIM required.</Text>
        <Text style={styles.readyPoint}>• Always verify peer safety numbers in person.</Text>
        <Text style={styles.readyPoint}>• Emergency SOS broadcasts to all nodes within range.</Text>
        <Text style={styles.readyPoint}>• Keep Bluetooth enabled to maintain mesh relay continuity.</Text>
      </View>

      <View style={styles.bottomActions}>
        <PrimaryButton
          label="Enter NOMAD LINK"
          onPress={() => onComplete(deviceAlias)}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {step === 'welcome' && renderWelcome()}
        {step === 'how_it_works' && renderHowItWorks()}
        {step === 'identity' && renderIdentity()}
        {step === 'permissions' && renderPermissions()}
        {step === 'ready' && renderReady()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  container: {
    flex: 1,
    padding: NomadSpacing.lg,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandIconContainer: {
    width: 80,
    height: 80,
    borderRadius: NomadRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: NomadSpacing.xl,
    marginBottom: NomadSpacing.md,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  brandLogoImage: {
    width: 68,
    height: 68,
    resizeMode: 'contain',
  },
  brandSymbol: {
    fontSize: 32,
    color: DarkThemeColors.actionBlue,
  },
  brandTitle: {
    ...NomadTypography.display,
    color: DarkThemeColors.primaryText,
    letterSpacing: 2,
  },
  brandTagline: {
    ...NomadTypography.supportingMedium,
    color: DarkThemeColors.actionBlue,
    letterSpacing: 1.2,
    marginBottom: NomadSpacing.xl,
  },
  screenHeading: {
    ...NomadTypography.display,
    color: DarkThemeColors.primaryText,
    marginTop: NomadSpacing.md,
  },
  screenSubheading: {
    ...NomadTypography.body,
    color: DarkThemeColors.secondaryText,
    marginTop: NomadSpacing.xs,
    marginBottom: NomadSpacing.lg,
  },
  card: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.lg,
    marginVertical: NomadSpacing.md,
  },
  cardHeader: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 1,
    marginBottom: NomadSpacing.sm,
  },
  cardBody: {
    ...NomadTypography.body,
    color: DarkThemeColors.secondaryText,
    lineHeight: 22,
  },
  scrollArea: {
    flex: 1,
    marginVertical: NomadSpacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: NomadSpacing.md,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
    marginBottom: 4,
  },
  featureBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    lineHeight: 18,
  },
  inputLabel: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.sm,
  },
  textInput: {
    minHeight: 48,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    color: DarkThemeColors.primaryText,
    ...NomadTypography.bodyMedium,
  },
  inputNote: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    marginTop: NomadSpacing.xs,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.lg,
  },
  fingerprintPreview: {
    ...NomadTypography.mono,
    color: DarkThemeColors.actionBlue,
    fontSize: 16,
    letterSpacing: 2,
    marginVertical: NomadSpacing.xs,
  },
  permCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: NomadSpacing.md,
  },
  permIcon: {
    fontSize: 24,
    marginRight: NomadSpacing.md,
    marginTop: 2,
  },
  permTextWrap: {
    flex: 1,
  },
  permTitle: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  permDesc: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  permStatusBtn: {
    minHeight: 40,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permGrantedBtn: {
    backgroundColor: DarkThemeColors.successGreenSubtle,
    borderColor: DarkThemeColors.successGreen,
  },
  permStatusText: {
    ...NomadTypography.button,
    fontSize: 13,
    color: DarkThemeColors.secondaryText,
  },
  permGrantedText: {
    color: DarkThemeColors.successGreen,
    fontWeight: '700',
  },
  readyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DarkThemeColors.successGreenSubtle,
    borderWidth: 2,
    borderColor: DarkThemeColors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: NomadSpacing.xl,
    marginBottom: NomadSpacing.md,
  },
  readyCheck: {
    fontSize: 32,
    color: DarkThemeColors.successGreen,
    fontWeight: '700',
  },
  readyPoint: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginBottom: NomadSpacing.sm,
    lineHeight: 20,
  },
  bottomActions: {
    paddingVertical: NomadSpacing.md,
  },
});
