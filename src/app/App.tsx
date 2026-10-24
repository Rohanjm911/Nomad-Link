import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Modal,
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
  const { identity, isRadioScanning, peers } = useNomad();
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [activeTab, setActiveTab] = useState<NavDestination>('Home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!isOnboarded) {
    return <OnboardingScreen onComplete={_alias => setIsOnboarded(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen onNavigate={tab => setActiveTab(tab as NavDestination)} />;
      case 'Messages':
        return <MessagingScreen />;
      case 'Mesh':
        return <MeshScreen />;
      case 'Convoy':
        return <ConvoyScreen />;
      case 'Maps':
        return <OfflineMapsScreen />;
      case 'Groups':
        return <GroupsScreen />;
      case 'Emergency':
        return <EmergencyScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen onNavigate={tab => setActiveTab(tab as NavDestination)} />;
    }
  };

  const navigateTo = (dest: NavDestination) => {
    setActiveTab(dest);
    setIsDrawerOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DarkThemeColors.primaryBackground}
      />

      {/* MIL-SPEC TACTICAL TOP HUD BAR */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <View style={styles.brandIconBox}>
            <Text style={styles.brandIcon}>⬢</Text>
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandName}>NOMAD LINK</Text>
              <View style={styles.rfStatusPill}>
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
                  {isRadioScanning ? 'RF: ACTIVE' : 'RF: STANDBY'}
                </Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>OFFLINE MESH INSTRUMENT BUS</Text>
          </View>
        </View>

        <View style={styles.appBarActions}>
          <TouchableOpacity
            style={styles.nodeBadge}
            onPress={() => navigateTo('Settings')}
            activeOpacity={0.7}
          >
            <Text style={styles.nodePrefix}>NODE</Text>
            <Text style={styles.nodeAlias} numberOfLines={1}>
              {identity.alias || 'UNSET'}
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

      {/* TACTICAL CYAN SUB-BEZEL WIRE */}
      <View style={styles.bezelWire} />

      {/* MAIN SCREEN VIEWPORT */}
      <View style={styles.content}>{renderContent()}</View>

      {/* TACTICAL INSTRUMENT BOTTOM BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.tabItemActive]}
          onPress={() => setActiveTab('Home')}
          accessible={true}
          accessibilityLabel="Home Dashboard"
        >
          {activeTab === 'Home' && <View style={styles.activeIndicator} />}
          <Text style={[styles.tabTextIcon, activeTab === 'Home' && styles.tabActiveText]}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabActiveText]}>HUD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Messages' && styles.tabItemActive]}
          onPress={() => setActiveTab('Messages')}
          accessible={true}
          accessibilityLabel="Encrypted Messages"
        >
          {activeTab === 'Messages' && <View style={styles.activeIndicator} />}
          <Text style={[styles.tabTextIcon, activeTab === 'Messages' && styles.tabActiveText]}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'Messages' && styles.tabActiveText]}>COMMS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Mesh' && styles.tabItemActive]}
          onPress={() => setActiveTab('Mesh')}
          accessible={true}
          accessibilityLabel="Mesh Radar"
        >
          {activeTab === 'Mesh' && <View style={styles.activeIndicator} />}
          <Text style={[styles.tabTextIcon, activeTab === 'Mesh' && styles.tabActiveText]}>📡</Text>
          <Text style={[styles.tabLabel, activeTab === 'Mesh' && styles.tabActiveText]}>RADAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Convoy' && styles.tabItemActive]}
          onPress={() => setActiveTab('Convoy')}
          accessible={true}
          accessibilityLabel="Convoy Telemetry"
        >
          {activeTab === 'Convoy' && <View style={styles.activeIndicator} />}
          <Text style={[styles.tabTextIcon, activeTab === 'Convoy' && styles.tabActiveText]}>🚙</Text>
          <Text style={[styles.tabLabel, activeTab === 'Convoy' && styles.tabActiveText]}>CONVOY</Text>
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
          {activeTab === 'Emergency' && <View style={styles.activeSosIndicator} />}
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={[styles.tabLabel, styles.tabLabelSos]}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* MILITARY HARDWARE INSTRUMENT DRAWER */}
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
                <Text style={styles.drawerTitle}>// INSTRUMENT BUS & SUBSYSTEMS //</Text>
                <TouchableOpacity
                  style={styles.drawerCloseBtn}
                  onPress={() => setIsDrawerOpen(false)}
                >
                  <Text style={styles.drawerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.drawerSubtitle}>NOMAD-LINK MIL-STD ARCHITECTURE</Text>
            </View>

            <View style={styles.drawerNavList}>
              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Home' && styles.drawerItemActive]}
                onPress={() => navigateTo('Home')}
              >
                <Text style={styles.drawerItemIndex}>[01]</Text>
                <Text style={styles.drawerItemIcon}>⚡</Text>
                <Text style={styles.drawerItemLabel}>Tactical HUD Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Messages' && styles.drawerItemActive]}
                onPress={() => navigateTo('Messages')}
              >
                <Text style={styles.drawerItemIndex}>[02]</Text>
                <Text style={styles.drawerItemIcon}>💬</Text>
                <Text style={styles.drawerItemLabel}>Encrypted Packets & Comms</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Mesh' && styles.drawerItemActive]}
                onPress={() => navigateTo('Mesh')}
              >
                <Text style={styles.drawerItemIndex}>[03]</Text>
                <Text style={styles.drawerItemIcon}>📡</Text>
                <Text style={styles.drawerItemLabel}>Mesh Radar & Topology Bus</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Convoy' && styles.drawerItemActive]}
                onPress={() => navigateTo('Convoy')}
              >
                <Text style={styles.drawerItemIndex}>[04]</Text>
                <Text style={styles.drawerItemIcon}>🚙</Text>
                <Text style={styles.drawerItemLabel}>Convoy Operations Telemetry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Maps' && styles.drawerItemActive]}
                onPress={() => navigateTo('Maps')}
              >
                <Text style={styles.drawerItemIndex}>[05]</Text>
                <Text style={styles.drawerItemIcon}>🧭</Text>
                <Text style={styles.drawerItemLabel}>Tactical Offline Maps & DR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Groups' && styles.drawerItemActive]}
                onPress={() => navigateTo('Groups')}
              >
                <Text style={styles.drawerItemIndex}>[06]</Text>
                <Text style={styles.drawerItemIcon}>👥</Text>
                <Text style={styles.drawerItemLabel}>Expedition Squads & Groups</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, styles.drawerItemSos, activeTab === 'Emergency' && styles.drawerItemActive]}
                onPress={() => navigateTo('Emergency')}
              >
                <Text style={[styles.drawerItemIndex, { color: DarkThemeColors.emergencyRed }]}>[07]</Text>
                <Text style={styles.drawerItemIcon}>🚨</Text>
                <Text style={[styles.drawerItemLabel, { color: DarkThemeColors.emergencyRed }]}>
                  Tactical SOS Distress Beacon
                </Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Settings' && styles.drawerItemActive]}
                onPress={() => navigateTo('Settings')}
              >
                <Text style={styles.drawerItemIndex}>[08]</Text>
                <Text style={styles.drawerItemIcon}>⚙️</Text>
                <Text style={styles.drawerItemLabel}>Hardware & RF Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setIsDrawerOpen(false);
                  setIsOnboarded(false);
                }}
              >
                <Text style={styles.drawerItemIndex}>[09]</Text>
                <Text style={styles.drawerItemIcon}>🔄</Text>
                <Text style={styles.drawerItemLabel}>Re-initialize System Guide</Text>
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
    width: 28,
    height: 28,
    borderRadius: NomadRadius.xs,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.tacticalCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: 16,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '800',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    ...NomadTypography.screenHeading,
    fontSize: 14,
    color: DarkThemeColors.primaryText,
    letterSpacing: 1.5,
  },
  rfStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: NomadRadius.xs,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    gap: 4,
  },
  rfStatusDot: {
    width: 5,
    height: 5,
    borderRadius: 1,
  },
  rfDotActive: {
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  rfDotIdle: {
    backgroundColor: DarkThemeColors.mutedText,
  },
  rfStatusText: {
    ...NomadTypography.monoSmall,
    fontSize: 8,
    fontWeight: '800',
  },
  rfTextActive: {
    color: DarkThemeColors.tacticalGreen,
  },
  rfTextIdle: {
    color: DarkThemeColors.mutedText,
  },
  brandTagline: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nodeBadge: {
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 4,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    alignItems: 'flex-end',
    maxWidth: 100,
  },
  nodePrefix: {
    ...NomadTypography.monoSmall,
    fontSize: 7,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '800',
  },
  nodeAlias: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  drawerTrigger: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  drawerTriggerIcon: {
    fontSize: 14,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '700',
  },
  bezelWire: {
    height: 1,
    backgroundColor: DarkThemeColors.tacticalCyan,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: DarkThemeColors.surface,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.border,
    paddingVertical: 4,
    paddingHorizontal: NomadSpacing.xs,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: NomadRadius.xs,
    minWidth: 56,
    position: 'relative',
  },
  tabItemActive: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  tabItemSos: {
    borderWidth: 1,
    borderColor: DarkThemeColors.emergencyRedSubtle,
  },
  tabItemSosActive: {
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderColor: DarkThemeColors.emergencyRed,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: DarkThemeColors.tacticalCyan,
  },
  activeSosIndicator: {
    position: 'absolute',
    top: -4,
    left: '15%',
    right: '15%',
    height: 2,
    backgroundColor: DarkThemeColors.emergencyRed,
  },
  tabTextIcon: {
    fontSize: 14,
    marginBottom: 1,
  },
  emergencyIcon: {
    fontSize: 14,
    marginBottom: 1,
  },
  tabLabel: {
    ...NomadTypography.monoSmall,
    fontSize: 9,
    color: DarkThemeColors.secondaryText,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  tabActiveText: {
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '800',
  },
  tabLabelSos: {
    color: DarkThemeColors.emergencyRed,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 12, 0.85)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: '82%',
    backgroundColor: DarkThemeColors.surface,
    borderLeftWidth: 1,
    borderLeftColor: DarkThemeColors.border,
    padding: NomadSpacing.md,
    paddingTop: NomadSpacing.lg,
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
