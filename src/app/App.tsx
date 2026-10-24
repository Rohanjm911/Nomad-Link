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
  const [isOnboarded, setIsOnboarded] = useState(true); 
  const [activeTab, setActiveTab] = useState<NavDestination>('Home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!isOnboarded) {
    return <OnboardingScreen onComplete={alias => setIsOnboarded(true)} />;
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

      
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <Text style={styles.brandIcon}>⚡</Text>
          <Text style={styles.brandName}>NOMAD LINK</Text>
        </View>

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

      
      <View style={styles.content}>{renderContent()}</View>

      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.tabItemActive]}
          onPress={() => setActiveTab('Home')}
          accessible={true}
          accessibilityLabel="Home Dashboard"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Home' && styles.tabActiveText]}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabActiveText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Messages' && styles.tabItemActive]}
          onPress={() => setActiveTab('Messages')}
          accessible={true}
          accessibilityLabel="Encrypted Messages"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Messages' && styles.tabActiveText]}>💬</Text>
          <Text style={[styles.tabLabel, activeTab === 'Messages' && styles.tabActiveText]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Mesh' && styles.tabItemActive]}
          onPress={() => setActiveTab('Mesh')}
          accessible={true}
          accessibilityLabel="Mesh Radar"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Mesh' && styles.tabActiveText]}>📡</Text>
          <Text style={[styles.tabLabel, activeTab === 'Mesh' && styles.tabActiveText]}>
            Mesh
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Convoy' && styles.tabItemActive]}
          onPress={() => setActiveTab('Convoy')}
          accessible={true}
          accessibilityLabel="Convoy Telemetry"
        >
          <Text style={[styles.tabTextIcon, activeTab === 'Convoy' && styles.tabActiveText]}>🚙</Text>
          <Text style={[styles.tabLabel, activeTab === 'Convoy' && styles.tabActiveText]}>
            Convoy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Emergency' && styles.tabItemActive]}
          onPress={() => setActiveTab('Emergency')}
          accessible={true}
          accessibilityLabel="Emergency SOS Beacon"
        >
          <Text style={[styles.tabTextIcon, styles.emergencyIcon]}>🚨</Text>
          <Text style={[styles.tabLabel, styles.tabLabelSos]}>SOS</Text>
        </TouchableOpacity>
      </View>

      
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
              <Text style={styles.drawerTitle}>EXPEDITION INSTRUMENTS</Text>
              <Text style={styles.drawerSubtitle}>NOMAD LINK · No Signal. No Limits.</Text>
            </View>

            <View style={styles.drawerNavList}>
              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Home' && styles.drawerItemActive]}
                onPress={() => navigateTo('Home')}
              >
                <Text style={styles.drawerItemIcon}>⚡</Text>
                <Text style={styles.drawerItemLabel}>Home Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Messages' && styles.drawerItemActive]}
                onPress={() => navigateTo('Messages')}
              >
                <Text style={styles.drawerItemIcon}>💬</Text>
                <Text style={styles.drawerItemLabel}>Messages & Queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Mesh' && styles.drawerItemActive]}
                onPress={() => navigateTo('Mesh')}
              >
                <Text style={styles.drawerItemIcon}>📡</Text>
                <Text style={styles.drawerItemLabel}>Mesh Radar & Topology</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Convoy' && styles.drawerItemActive]}
                onPress={() => navigateTo('Convoy')}
              >
                <Text style={styles.drawerItemIcon}>🚙</Text>
                <Text style={styles.drawerItemLabel}>Convoy Coordination</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Maps' && styles.drawerItemActive]}
                onPress={() => navigateTo('Maps')}
              >
                <Text style={styles.drawerItemIcon}>🧭</Text>
                <Text style={styles.drawerItemLabel}>Offline Maps & Waypoints</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Groups' && styles.drawerItemActive]}
                onPress={() => navigateTo('Groups')}
              >
                <Text style={styles.drawerItemIcon}>👥</Text>
                <Text style={styles.drawerItemLabel}>Expedition Groups</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Emergency' && styles.drawerItemActive]}
                onPress={() => navigateTo('Emergency')}
              >
                <Text style={styles.drawerItemIcon}>🚨</Text>
                <Text style={[styles.drawerItemLabel, { color: DarkThemeColors.emergencyRed }]}>
                  Emergency Distress Beacon
                </Text>
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={[styles.drawerItem, activeTab === 'Settings' && styles.drawerItemActive]}
                onPress={() => navigateTo('Settings')}
              >
                <Text style={styles.drawerItemIcon}>⚙️</Text>
                <Text style={styles.drawerItemLabel}>Settings & Hardware</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setIsDrawerOpen(false);
                  setIsOnboarded(false);
                }}
              >
                <Text style={styles.drawerItemIcon}>🔄</Text>
                <Text style={styles.drawerItemLabel}>Replay Onboarding Guide</Text>
              </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
  },
  appBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    fontSize: 18,
    color: DarkThemeColors.actionBlue,
    marginRight: NomadSpacing.xs,
  },
  brandName: {
    ...NomadTypography.screenHeading,
    fontSize: 16,
    color: DarkThemeColors.primaryText,
    letterSpacing: 1,
  },
  drawerTrigger: {
    padding: NomadSpacing.xs + 2,
    borderRadius: NomadRadius.sm,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  drawerTriggerIcon: {
    fontSize: 16,
    color: DarkThemeColors.primaryText,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: DarkThemeColors.surface,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.border,
    paddingVertical: 6,
    paddingHorizontal: NomadSpacing.xs,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: NomadRadius.sm,
    minWidth: 54,
  },
  tabItemActive: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  tabTextIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  emergencyIcon: {
    fontSize: 16,
  },
  tabLabel: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.secondaryText,
  },
  tabActiveText: {
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
  },
  tabLabelSos: {
    color: DarkThemeColors.emergencyRed,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    width: '78%',
    backgroundColor: DarkThemeColors.surface,
    borderLeftWidth: 1,
    borderLeftColor: DarkThemeColors.border,
    padding: NomadSpacing.lg,
    paddingTop: NomadSpacing.xl,
  },
  drawerHeader: {
    marginBottom: NomadSpacing.lg,
    paddingBottom: NomadSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
  },
  drawerTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 1,
  },
  drawerSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.actionBlue,
    marginTop: 4,
  },
  drawerNavList: {
    gap: 4,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: NomadSpacing.md,
    paddingHorizontal: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
  },
  drawerItemActive: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  drawerItemIcon: {
    fontSize: 18,
    marginRight: NomadSpacing.md,
  },
  drawerItemLabel: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginVertical: NomadSpacing.md,
  },
});

export default App;
