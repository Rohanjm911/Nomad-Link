import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import { NomadProvider } from '../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../theme/NomadTheme';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { HomeScreen } from '../features/dashboard/HomeScreen';
import { MessagingScreen } from '../features/messaging/MessagingScreen';
import { MeshScreen } from '../features/discovery/MeshScreen';
import { ConvoyScreen } from '../features/convoy/ConvoyScreen';
import { OfflineMapsScreen } from '../features/maps/OfflineMapsScreen';
import { EmergencyScreen } from '../features/emergency/EmergencyScreen';
import { GroupsScreen } from '../features/groups/GroupsScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';

import { useNomad } from '../application/state/NomadContext';

const NOMAD_LOGO = require('../assets/images/logo.png');

type NavDestination =
  | 'Home'
  | 'Messages'
  | 'Mesh'
  | 'Convoy'
  | 'Maps'
  | 'Groups'
  | 'Emergency'
  | 'Settings';

export const AppContent: React.FC = () => {
  const {
    identity,
    isRadioScanning,
    peers,
    setActiveTargetPeerId,
    setIdentityAlias,
    toggleRadioScanning,
  } = useNomad();
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [activeTab, setActiveTab] = useState<NavDestination>('Home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!isOnboarded) {
    return (
      <OnboardingScreen
        onComplete={alias => {
          if (alias) setIdentityAlias(alias);
          setIsOnboarded(true);
        }}
      />
    );
  }

  const navigateTo = (dest: NavDestination, peerId?: string) => {
    if (peerId) {
      setActiveTargetPeerId(peerId);
    }
    setActiveTab(dest);
    setIsDrawerOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen
            onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)}
          />
        );
      case 'Messages':
        return <MessagingScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      case 'Mesh':
        return <MeshScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      case 'Convoy':
        return <ConvoyScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      case 'Maps':
        return <OfflineMapsScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      case 'Groups':
        return <GroupsScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      case 'Emergency':
        return <EmergencyScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      case 'Settings':
        return <SettingsScreen onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)} />;
      default:
        return (
          <HomeScreen
            onNavigate={(tab, peerId) => navigateTo(tab as NavDestination, peerId)}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DarkThemeColors.primaryBackground}
      />

      {/* STEALTH MINIMALIST TOP BAR */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <TouchableOpacity
            style={styles.brandIconBox}
            onPress={() => navigateTo('Home')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Nomad Link Home"
          >
            <Image source={NOMAD_LOGO} style={styles.brandLogoImage} />
          </TouchableOpacity>
          <View>
            <View style={styles.brandTitleRow}>
              <TouchableOpacity onPress={() => navigateTo('Home')} activeOpacity={0.8}>
                <Text style={styles.brandName}>
                  NOMAD <Text style={styles.brandNameAccent}>LINK</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rfStatusPill}
                onPress={() => toggleRadioScanning()}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Toggle Radio Scanning"
              >
                <View
                  style={[
                    styles.rfStatusDot,
                    isRadioScanning ? styles.rfDotActive : styles.rfDotIdle,
                  ]}
                />
                <Text
                  style={[
                    styles.rfStatusText,
                    isRadioScanning ? styles.rfTextActive : styles.rfTextIdle,
                  ]}
                >
                  {isRadioScanning ? 'Active' : 'Standby'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.brandTagline}>Offline P2P Mesh</Text>
          </View>
        </View>

        <View style={styles.appBarActions}>
          <TouchableOpacity
            style={styles.nodeBadge}
            onPress={() => navigateTo('Settings')}
            activeOpacity={0.7}
          >
            <View style={styles.nodeDot} />
            <Text style={styles.nodeAlias} numberOfLines={1}>
              {identity.alias || 'Unset'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerTrigger}
            onPress={() => setIsDrawerOpen(true)}
            accessible={true}
            accessibilityLabel="Open Navigation Menu"
            accessibilityRole="button"
          >
            <Text style={styles.drawerTriggerIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HAIRLINE DIVIDER */}
      <View style={styles.bezelWire} />

      {/* MAIN SCREEN VIEWPORT */}
      <View style={styles.content}>{renderContent()}</View>

      {/* STEALTH MINIMALIST BOTTOM TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.tabItemActive]}
          onPress={() => setActiveTab('Home')}
          accessible={true}
          accessibilityLabel="Home Dashboard"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Home' && styles.tabActiveText]}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabActiveText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Messages' && styles.tabItemActive]}
          onPress={() => setActiveTab('Messages')}
          accessible={true}
          accessibilityLabel="Encrypted Messages"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Messages' && styles.tabActiveText]}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'Messages' && styles.tabActiveText]}>Comms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Mesh' && styles.tabItemActive]}
          onPress={() => setActiveTab('Mesh')}
          accessible={true}
          accessibilityLabel="Mesh Radar"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Mesh' && styles.tabActiveText]}>📡</Text>
          <Text style={[styles.tabLabel, activeTab === 'Mesh' && styles.tabActiveText]}>Radar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Convoy' && styles.tabItemActive]}
          onPress={() => setActiveTab('Convoy')}
          accessible={true}
          accessibilityLabel="Convoy Telemetry"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Convoy' && styles.tabActiveText]}>🚙</Text>
          <Text style={[styles.tabLabel, activeTab === 'Convoy' && styles.tabActiveText]}>Convoy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            styles.tabItemSos,
            activeTab === 'Emergency' && styles.tabItemSosActive,
          ]}
          onPress={() => setActiveTab('Emergency')}
          accessible={true}
          accessibilityLabel="Emergency SOS Beacon"
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={[styles.tabLabel, styles.tabLabelSos]}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* STEALTH NAVIGATION DRAWER */}
      <Modal
        visible={isDrawerOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsDrawerOpen(false)}
        >
          <View style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderTop}>
                <View style={styles.drawerHeaderBrand}>
                  <Image source={NOMAD_LOGO} style={styles.drawerLogoImage} />
                  <Text style={styles.drawerTitle}>Modules & Systems</Text>
                </View>
                <TouchableOpacity
                  style={styles.drawerCloseBtn}
                  onPress={() => setIsDrawerOpen(false)}
                >
                  <Text style={styles.drawerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.drawerSubtitle}>Nomad Link Decentralized Mesh</Text>
            </View>

            <View style={styles.drawerNavList}>
              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Home' && styles.drawerItemActive]}
                onPress={() => navigateTo('Home')}
              >
                <Text style={styles.drawerItemIndex}>01</Text>
                <Text style={styles.drawerItemIcon}>⚡</Text>
                <Text style={styles.drawerItemLabel}>Dashboard Overview</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Messages' && styles.drawerItemActive]}
                onPress={() => navigateTo('Messages')}
              >
                <Text style={styles.drawerItemIndex}>02</Text>
                <Text style={styles.drawerItemIcon}>💬</Text>
                <Text style={styles.drawerItemLabel}>Encrypted Comms</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Mesh' && styles.drawerItemActive]}
                onPress={() => navigateTo('Mesh')}
              >
                <Text style={styles.drawerItemIndex}>03</Text>
                <Text style={styles.drawerItemIcon}>📡</Text>
                <Text style={styles.drawerItemLabel}>Mesh Radar & Peers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Convoy' && styles.drawerItemActive]}
                onPress={() => navigateTo('Convoy')}
              >
                <Text style={styles.drawerItemIndex}>04</Text>
                <Text style={styles.drawerItemIcon}>🚙</Text>
                <Text style={styles.drawerItemLabel}>Convoy Coordination</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Maps' && styles.drawerItemActive]}
                onPress={() => navigateTo('Maps')}
              >
                <Text style={styles.drawerItemIndex}>05</Text>
                <Text style={styles.drawerItemIcon}>🧭</Text>
                <Text style={styles.drawerItemLabel}>Offline Maps & Dead Reckoning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Groups' && styles.drawerItemActive]}
                onPress={() => navigateTo('Groups')}
              >
                <Text style={styles.drawerItemIndex}>06</Text>
                <Text style={styles.drawerItemIcon}>👥</Text>
                <Text style={styles.drawerItemLabel}>Expedition Squads</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, styles.drawerItemSos, activeTab === 'Emergency' && styles.drawerItemActive]}
                onPress={() => navigateTo('Emergency')}
              >
                <Text style={[styles.drawerItemIndex, { color: DarkThemeColors.emergencyRed }]}>07</Text>
                <Text style={styles.drawerItemIcon}>🚨</Text>
                <Text style={[styles.drawerItemLabel, { color: DarkThemeColors.emergencyRed }]}>
                  Emergency SOS Beacon
                </Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Settings' && styles.drawerItemActive]}
                onPress={() => navigateTo('Settings')}
              >
                <Text style={styles.drawerItemIndex}>08</Text>
                <Text style={styles.drawerItemIcon}>⚙️</Text>
                <Text style={styles.drawerItemLabel}>Settings & Radios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setIsDrawerOpen(false);
                  setIsOnboarded(false);
                }}
              >
                <Text style={styles.drawerItemIndex}>09</Text>
                <Text style={styles.drawerItemIcon}>🔄</Text>
                <Text style={styles.drawerItemLabel}>Re-initialize Setup</Text>
              </TouchableOpacity>
            </View>

            {/* DRAWER FOOTER HARDWARE STATUS */}
            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterText}>
                PEERS: {peers.length} NODES · PROTOCOL: BLE 5.2 L2CAP
              </Text>
              <Text style={styles.drawerFooterSub}>
                FINGERPRINT: {identity.peerId ? identity.peerId.slice(0, 12) : 'STANDALONE'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export const App: React.FC = () => {
  return (
    <NomadProvider>
      <AppContent />
    </NomadProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    backgroundColor: DarkThemeColors.surface,
  },
  appBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogoImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  drawerHeaderBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerLogoImage: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    ...NomadTypography.screenHeading,
    fontSize: 14,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.5,
  },
  brandNameAccent: {
    color: DarkThemeColors.warningAmber,
    fontWeight: '700',
  },
  rfStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: NomadRadius.full,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    gap: 5,
  },
  rfStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  rfDotActive: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  rfDotIdle: {
    backgroundColor: DarkThemeColors.mutedText,
  },
  rfStatusText: {
    ...NomadTypography.metadata,
    fontSize: 9,
    fontWeight: '600',
  },
  rfTextActive: {
    color: DarkThemeColors.tacticalGreen,
  },
  rfTextIdle: {
    color: DarkThemeColors.mutedText,
  },
  brandTagline: {
    ...NomadTypography.supporting,
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.2,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: 5,
    borderRadius: NomadRadius.full,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    gap: 6,
    maxWidth: 120,
  },
  nodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  nodeAlias: {
    ...NomadTypography.metadata,
    fontSize: 11,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
  drawerTrigger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTriggerIcon: {
    fontSize: 14,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
  bezelWire: {
    height: 1,
    backgroundColor: DarkThemeColors.borderSubtle,
  },
  content: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
    paddingVertical: 6,
    paddingHorizontal: NomadSpacing.sm,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: NomadRadius.full,
    minWidth: 58,
  },
  tabItemActive: {
    backgroundColor: DarkThemeColors.surfaceElevated,
  },
  tabItemSos: {
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRedSubtle,
    borderRadius: NomadRadius.full,
  },
  tabItemSosActive: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderColor: DarkThemeColors.emergencyRed,
  },
  activeIndicator: {
    display: 'none',
  },
  activeSosIndicator: {
    display: 'none',
  },
  tabTextIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  emergencyIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  tabLabel: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.secondaryText,
    fontWeight: '600',
  },
  tabActiveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabLabelSos: {
    color: DarkThemeColors.emergencyRed,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: '82%',
    backgroundColor: DarkThemeColors.surface,
    borderLeftWidth: 1,
    borderLeftColor: DarkThemeColors.border,
    padding: NomadSpacing.lg,
    paddingTop: NomadSpacing.xl,
    justifyContent: 'space-between',
  },
  drawerHeader: {
    marginBottom: NomadSpacing.md,
    paddingBottom: NomadSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    letterSpacing: 1,
    fontWeight: '800',
  },
  drawerCloseBtn: {
    padding: 4,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.xs,
  },
  drawerCloseText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
  },
  drawerSubtitle: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.mutedText,
    marginTop: 3,
  },
  drawerNavList: {
    gap: 3,
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: NomadSpacing.sm + 1,
    paddingHorizontal: NomadSpacing.sm,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  drawerItemActive: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.tacticalCyan,
  },
  drawerItemSos: {
    borderColor: DarkThemeColors.emergencyRedSubtle,
  },
  drawerItemIndex: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 10,
    marginRight: 6,
    fontWeight: '700',
  },
  drawerItemIcon: {
    fontSize: 14,
    marginRight: NomadSpacing.sm,
  },
  drawerItemLabel: {
    ...NomadTypography.bodyMedium,
    fontSize: 13,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.5,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.sm,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.border,
    paddingTop: NomadSpacing.sm,
    marginTop: NomadSpacing.sm,
  },
  drawerFooterText: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.tacticalGreen,
    fontWeight: '700',
  },
  drawerFooterSub: {
    ...NomadTypography.monoSmall,
    fontSize: 8,
    color: DarkThemeColors.mutedText,
    marginTop: 2,
  },
});

export default App;
