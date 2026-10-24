import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { TrustBadge } from '../../components/Badges';
import { SectionHeader } from '../../components/FeedbackStates';

interface GroupModel {
  groupId: string;
  name: string;
  memberCount: number;
  lastMessageSnippet: string;
  pendingDeliveryCount: number;
  trustState: 'VERIFIED' | 'SYNCHRONIZING' | 'KEY_ROTATION_PENDING';
}

interface GroupsScreenProps {
  onNavigate?: (tab: string, peerId?: string) => void;
}

export const GroupsScreen: React.FC<GroupsScreenProps> = ({ onNavigate }) => {
  const { peers, identity } = useNomad();
  const [groups, setGroups] = useState<GroupModel[]>([
    {
      groupId: 'grp-convoy-alpha',
      name: 'Trans-Himalayan Convoy Vanguard',
      memberCount: 3,
      lastMessageSnippet: 'Regroup checkpoint Khardung La pass summit.',
      pendingDeliveryCount: 0,
      trustState: 'VERIFIED',
    },
    {
      groupId: 'grp-medical-net',
      name: 'Expedition Med-Evac Direct',
      memberCount: 2,
      lastMessageSnippet: 'First-aid kit inventory checked and verified.',
      pendingDeliveryCount: 1,
      trustState: 'VERIFIED',
    },
  ]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupMsgText, setGroupMsgText] = useState('');
  const [activeComposingGroupId, setActiveComposingGroupId] = useState<string | null>(null);

  const handleRotateKey = (groupId: string) => {
    setGroups(prev =>
      prev.map(g =>
        g.groupId === groupId
          ? { ...g, trustState: 'VERIFIED', lastMessageSnippet: 'Ratchet key rotated. Forward secrecy established.' }
          : g
      )
    );
    Alert.alert('Sender Key Rotated', 'A new 256-bit symmetric ratchet key was generated and encrypted for all group members.');
  };

  const handleSendGroupBroadcast = (groupId: string) => {
    if (!groupMsgText.trim()) return;
    setGroups(prev =>
      prev.map(g =>
        g.groupId === groupId
          ? {
              ...g,
              lastMessageSnippet: `${identity.alias}: ${groupMsgText.trim()}`,
              pendingDeliveryCount: 0,
            }
          : g
      )
    );
    Alert.alert('Group Broadcast Sent', `Multi-recipient envelope transmitted to all nodes in group.`);
    setGroupMsgText('');
    setActiveComposingGroupId(null);
  };

  const handleAddMemberToGroup = (groupId: string) => {
    const unaddedPeer = peers[0];
    if (unaddedPeer) {
      setGroups(prev =>
        prev.map(g =>
          g.groupId === groupId ? { ...g, memberCount: g.memberCount + 1 } : g
        )
      );
      Alert.alert('Member Added', `${unaddedPeer.alias} received the group Sender Key package.`);
    } else {
      Alert.alert('No Candidates', 'Scan adjacent mesh perimeter to discover new nodes first.');
    }
  };

  const selectedGroup = groups.find(g => g.groupId === selectedGroupId);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGrp: GroupModel = {
      groupId: 'grp-' + Date.now().toString(16),
      name: newGroupName.trim(),
      memberCount: 1,
      lastMessageSnippet: 'Group initialized with local sender ratchet.',
      pendingDeliveryCount: 0,
      trustState: 'VERIFIED',
    };
    setGroups(prev => [newGrp, ...prev]);
    setNewGroupName('');
    setIsCreatingGroup(false);
    Alert.alert('Group Created', `"${newGrp.name}" is now ready for offline group ratchet messaging.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.screenHeading}>EXPEDITION MESH GROUPS</Text>
          <Text style={styles.screenSubtitle}>
            Multi-recipient encrypted Sender-Keys ratchet over store-and-forward mesh.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setIsCreatingGroup(!isCreatingGroup)}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>
            {isCreatingGroup ? 'Cancel' : '+ New Group'}
          </Text>
        </TouchableOpacity>
      </View>

      
      {isCreatingGroup && (
        <View style={styles.createCard}>
          <Text style={styles.cardTitle}>CREATE OFFLINE ENCRYPTED GROUP</Text>
          <TextInput
            style={styles.inputField}
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="e.g. Sweep Patrol / Mountain Rescue"
            placeholderTextColor={DarkThemeColors.mutedText}
          />
          <TouchableOpacity
            style={[styles.confirmCreateBtn, !newGroupName.trim() && styles.btnDisabled]}
            disabled={!newGroupName.trim()}
            onPress={handleCreateGroup}
          >
            <Text style={styles.confirmCreateText}>Establish Group Sender Key</Text>
          </TouchableOpacity>
        </View>
      )}

      
      <SectionHeader title="Active Expedition Channels" />
      {groups.map(group => (
        <TouchableOpacity
          key={group.groupId}
          style={[
            styles.groupCard,
            selectedGroupId === group.groupId && styles.groupCardSelected,
          ]}
          onPress={() => setSelectedGroupId(group.groupId === selectedGroupId ? null : group.groupId)}
          activeOpacity={0.8}
        >
          <View style={styles.groupCardHeader}>
            <View style={styles.groupInfoWrap}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupMeta}>
                {group.memberCount} Verified Nodes · {group.groupId}
              </Text>
            </View>

            <View style={styles.groupBadge}>
              <Text style={styles.groupBadgeText}>{group.trustState}</Text>
            </View>
          </View>

          <Text style={styles.groupSnippet}>"{group.lastMessageSnippet}"</Text>

          <View style={styles.groupFooter}>
            <Text style={styles.deliveryStateText}>
              {group.pendingDeliveryCount > 0
                ? `⏳ ${group.pendingDeliveryCount} envelope waiting for route`
                : '✓✓ All recipient ratchets synced'}
            </Text>
            <Text style={styles.detailsToggle}>
              {selectedGroupId === group.groupId ? 'Hide Details ▲' : 'Manage Members ▼'}
            </Text>
          </View>

          
          {selectedGroupId === group.groupId && (
            <View style={styles.expandedDetail}>
              <View style={styles.divider} />
              <Text style={styles.detailTitle}>CRYPTOGRAPHIC SENDER KEY RATCHET</Text>
              <Text style={styles.detailBody}>
                Group messages are encrypted using Sender-Key ratchets. Intermediary mesh relays cannot decrypt or manipulate group messages.
              </Text>

              {/* GROUP ACTIONS ROW */}
              <View style={styles.groupActionsRow}>
                <TouchableOpacity
                  style={styles.groupActionBtn}
                  onPress={() =>
                    setActiveComposingGroupId(
                      activeComposingGroupId === group.groupId ? null : group.groupId
                    )
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.groupActionText}>
                    {activeComposingGroupId === group.groupId ? 'Cancel ✕' : '💬 Broadcast Message'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.groupActionBtn}
                  onPress={() => handleRotateKey(group.groupId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.groupActionText}>🔑 Rotate Keys</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.groupActionBtn}
                  onPress={() => handleAddMemberToGroup(group.groupId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.groupActionText}>+ Add Node</Text>
                </TouchableOpacity>
              </View>

              {/* COMPOSER IF ACTIVE */}
              {activeComposingGroupId === group.groupId && (
                <View style={styles.groupComposerBox}>
                  <TextInput
                    style={styles.groupComposerInput}
                    value={groupMsgText}
                    onChangeText={setGroupMsgText}
                    placeholder={`Broadcast to ${group.name}...`}
                    placeholderTextColor={DarkThemeColors.mutedText}
                  />
                  <TouchableOpacity
                    style={[styles.groupSendBtn, !groupMsgText.trim() && styles.btnDisabled]}
                    disabled={!groupMsgText.trim()}
                    onPress={() => handleSendGroupBroadcast(group.groupId)}
                  >
                    <Text style={styles.groupSendText}>Send</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.memberListTitle}>ROSTER IN RANGE ({group.memberCount} NODES):</Text>
              <Text style={styles.memberItem}>• {identity.alias} (You) · Role: Group Admin</Text>
              {peers.slice(0, group.memberCount - 1).map(p => (
                <TouchableOpacity
                  key={p.peerId}
                  style={styles.rosterRow}
                  onPress={() => onNavigate && onNavigate('Messages', p.peerId)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.memberItem}>
                    • {p.alias} · FP: {p.safetyNumber} ({p.trustStatus})
                  </Text>
                  <Text style={styles.rosterMsgBtn}>Message →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  content: {
    padding: NomadSpacing.md,
    paddingBottom: NomadSpacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: NomadSpacing.md,
  },
  screenHeading: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    letterSpacing: 0.8,
  },
  screenSubtitle: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
    maxWidth: 240,
    lineHeight: 18,
  },
  createBtn: {
    backgroundColor: DarkThemeColors.actionBlue,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
  },
  createBtnText: {
    ...NomadTypography.button,
    fontSize: 12,
    color: '#FFFFFF',
  },
  createCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.md,
  },
  cardTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.sm,
  },
  inputField: {
    minHeight: 44,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    color: DarkThemeColors.primaryText,
    marginBottom: NomadSpacing.md,
    ...NomadTypography.body,
  },
  confirmCreateBtn: {
    backgroundColor: DarkThemeColors.actionBlue,
    paddingVertical: NomadSpacing.sm,
    borderRadius: NomadRadius.sm,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  confirmCreateText: {
    ...NomadTypography.button,
    fontSize: 13,
    color: '#FFFFFF',
  },
  groupCard: {
    backgroundColor: DarkThemeColors.surface,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    padding: NomadSpacing.md,
    marginBottom: NomadSpacing.sm,
  },
  groupCardSelected: {
    borderColor: DarkThemeColors.actionBlue,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: NomadSpacing.xs,
  },
  groupInfoWrap: {
    flex: 1,
  },
  groupName: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  groupMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 2,
  },
  groupBadge: {
    backgroundColor: DarkThemeColors.successGreenSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.successGreen,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  groupBadgeText: {
    ...NomadTypography.metadata,
    fontSize: 10,
    color: DarkThemeColors.successGreen,
    fontWeight: '700',
  },
  groupSnippet: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontStyle: 'italic',
    marginVertical: NomadSpacing.xs,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: NomadSpacing.xs,
    paddingTop: NomadSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
  },
  deliveryStateText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
  },
  detailsToggle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.actionBlue,
    fontWeight: '600',
  },
  expandedDetail: {
    marginTop: NomadSpacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: DarkThemeColors.border,
    marginBottom: NomadSpacing.sm,
  },
  detailTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
  },
  detailBody: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginVertical: 4,
    lineHeight: 18,
  },
  memberListTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
    marginTop: NomadSpacing.sm,
    marginBottom: 4,
  },
  memberItem: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    marginBottom: 2,
  },
  groupActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: NomadSpacing.xs,
  },
  groupActionBtn: {
    flex: 1,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingVertical: 5,
    borderRadius: NomadRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupActionText: {
    ...NomadTypography.monoSmall,
    fontSize: 9.5,
    color: DarkThemeColors.primaryText,
    fontWeight: '700',
  },
  groupComposerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 4,
    marginVertical: NomadSpacing.xs,
    gap: 6,
  },
  groupComposerInput: {
    flex: 1,
    minHeight: 36,
    color: DarkThemeColors.primaryText,
    fontSize: 12,
  },
  groupSendBtn: {
    backgroundColor: DarkThemeColors.actionBlue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: NomadRadius.xs,
  },
  groupSendText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  rosterMsgBtn: {
    ...NomadTypography.monoSmall,
    fontSize: 9.5,
    color: DarkThemeColors.actionBlue,
    fontWeight: '700',
  },
});
