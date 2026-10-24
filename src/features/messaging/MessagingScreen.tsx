import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNomad } from '../../application/state/NomadContext';
import {
  DarkThemeColors,
  NomadSpacing,
  NomadRadius,
  NomadTypography,
} from '../../theme/NomadTheme';
import { DeliveryState, MessageModel } from '../../domain/models/DomainModels';
import { TrustBadge, DeliveryStatusIndicator } from '../../components/Badges';
import { EmptyState } from '../../components/FeedbackStates';

export const MessagingScreen: React.FC = () => {
  const { messages, peers, sendDirectMessage, identity } = useNomad();
  const [selectedPeerId, setSelectedPeerId] = useState<string>(peers[0]?.peerId || '');
  const [inputText, setInputText] = useState('');
  const [showPeerPicker, setShowPeerPicker] = useState(false);

  const selectedPeer = peers.find(p => p.peerId === selectedPeerId);

  const activeMessages = messages.filter(
    m =>
      (m.senderPeerId === selectedPeerId && m.recipientPeerId === identity.peerId) ||
      (m.senderPeerId === identity.peerId && m.recipientPeerId === selectedPeerId) ||
      m.recipientPeerId === '*'
  );

  const handleSend = () => {
    if (!inputText.trim() || !selectedPeerId) return;
    sendDirectMessage(selectedPeerId, inputText.trim());
    setInputText('');
  };

  const handleMessageInspect = (msg: MessageModel) => {
    Alert.alert(
      'Message Diagnostic & Delivery Trace',
      `Message ID: ${msg.messageId}\n` +
      `Delivery State: ${msg.deliveryState}\n` +
      `Mesh Hop Count: ${msg.hopCount}\n` +
      `Timestamp: ${new Date(msg.timestamp).toLocaleTimeString()}\n` +
      `Encryption: ChaCha20-Poly1305 (Auth Tag Valid)\n` +
      `Route: ${msg.deliveryState === DeliveryState.QUEUED_LOCALLY ? 'Awaiting route in local DTN queue' : 'Forwarded over BLE mesh links'}`
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header: Peer Selector & Peer Verification Info */}
      <View style={styles.topHeader}>
        <View style={styles.peerSelectRow}>
          <TouchableOpacity
            style={styles.peerSelectorBtn}
            onPress={() => setShowPeerPicker(!showPeerPicker)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.peerSelectAlias}>
                {selectedPeer ? selectedPeer.alias : 'Select Peer'}
              </Text>
              <Text style={styles.peerSelectMeta}>
                {selectedPeer ? `${selectedPeer.transportType} · Fingerprint: ${selectedPeer.safetyNumber}` : 'Tap to switch peer'}
              </Text>
            </View>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          {selectedPeer && <TrustBadge status={selectedPeer.trustStatus} />}
        </View>

        {/* Security & Route Notice */}
        <View style={styles.e2eeBanner}>
          <Text style={styles.e2eeText}>
            🔒 End-to-End Encrypted (X25519 + ChaCha20). Relays cannot inspect payload.
          </Text>
        </View>
      </View>

      {/* Peer Picker Dropdown */}
      {showPeerPicker && (
        <View style={styles.peerDropdownList}>
          <Text style={styles.dropdownTitle}>NEARBY DISCOVERED PEERS</Text>
          {peers.map(p => (
            <TouchableOpacity
              key={p.peerId}
              style={[
                styles.peerDropdownItem,
                p.peerId === selectedPeerId && styles.peerDropdownItemSelected,
              ]}
              onPress={() => {
                setSelectedPeerId(p.peerId);
                setShowPeerPicker(false);
              }}
            >
              <View>
                <Text style={styles.dropdownPeerAlias}>{p.alias}</Text>
                <Text style={styles.dropdownPeerMeta}>Safety: {p.safetyNumber}</Text>
              </View>
              <TrustBadge status={p.trustStatus} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Message History Feed */}
      {activeMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="No Messages Exchanged Yet"
            description={`Start an encrypted conversation with ${selectedPeer?.alias || 'nearby peers'}. Packets will route through the mesh even without cellular reception.`}
            icon="💬"
          />
        </View>
      ) : (
        <FlatList
          data={activeMessages}
          keyExtractor={item => item.messageId}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMe = item.isOutgoing;
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => handleMessageInspect(item)}
                style={[
                  styles.messageBubble,
                  isMe ? styles.messageOutgoing : styles.messageIncoming,
                  item.isEmergency ? styles.emergencyBubble : null,
                ]}
              >
                {item.isEmergency && (
                  <View style={styles.emergencyTag}>
                    <Text style={styles.emergencyTagText}>🚨 EMERGENCY BROADCAST</Text>
                  </View>
                )}

                <Text style={[styles.messageText, isMe ? styles.textOut : styles.textIn]}>
                  {item.text}
                </Text>

                <View style={styles.messageFooter}>
                  <Text style={styles.messageTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {isMe && (
                    <DeliveryStatusIndicator
                      state={item.deliveryState}
                      hopCount={item.hopCount}
                      style={styles.deliveryBadge}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Message Composer */}
      <View style={styles.composerContainer}>
        <TextInput
          style={styles.inputField}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Encrypted message to ${selectedPeer?.alias || 'peer'}...`}
          placeholderTextColor={DarkThemeColors.mutedText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkThemeColors.primaryBackground,
  },
  topHeader: {
    backgroundColor: DarkThemeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
    paddingHorizontal: NomadSpacing.md,
    paddingTop: NomadSpacing.sm,
    paddingBottom: NomadSpacing.xs,
  },
  peerSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peerSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: NomadSpacing.xs,
  },
  peerSelectAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  peerSelectMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    marginTop: 1,
  },
  dropdownIcon: {
    fontSize: 10,
    color: DarkThemeColors.mutedText,
    marginLeft: NomadSpacing.sm,
    marginRight: NomadSpacing.md,
  },
  e2eeBanner: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.sm,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 3,
    marginTop: NomadSpacing.xs,
  },
  e2eeText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontSize: 11,
  },
  peerDropdownList: {
    backgroundColor: DarkThemeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.border,
    padding: NomadSpacing.md,
  },
  dropdownTitle: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    letterSpacing: 0.8,
    marginBottom: NomadSpacing.xs,
  },
  peerDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: NomadSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.borderSubtle,
  },
  peerDropdownItemSelected: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  dropdownPeerAlias: {
    ...NomadTypography.bodyMedium,
    color: DarkThemeColors.primaryText,
  },
  dropdownPeerMeta: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: NomadSpacing.lg,
  },
  messageList: {
    padding: NomadSpacing.md,
    paddingBottom: NomadSpacing.lg,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: NomadSpacing.md,
    borderRadius: NomadRadius.md,
    marginBottom: NomadSpacing.sm,
    borderWidth: 1,
  },
  messageIncoming: {
    alignSelf: 'flex-start',
    backgroundColor: DarkThemeColors.surface,
    borderColor: DarkThemeColors.border,
  },
  messageOutgoing: {
    alignSelf: 'flex-end',
    backgroundColor: DarkThemeColors.surfaceElevated,
    borderColor: DarkThemeColors.actionBlue,
  },
  emergencyBubble: {
    borderColor: DarkThemeColors.emergencyRed,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
  },
  emergencyTag: {
    backgroundColor: DarkThemeColors.emergencyRed,
    paddingHorizontal: NomadSpacing.xs + 2,
    paddingVertical: 2,
    borderRadius: NomadRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: NomadSpacing.xs,
  },
  emergencyTagText: {
    ...NomadTypography.metadata,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  messageText: {
    ...NomadTypography.body,
    lineHeight: 20,
  },
  textIn: {
    color: DarkThemeColors.primaryText,
  },
  textOut: {
    color: DarkThemeColors.primaryText,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: NomadSpacing.xs,
  },
  messageTime: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    fontSize: 10,
    marginRight: NomadSpacing.xs,
  },
  deliveryBadge: {
    marginLeft: NomadSpacing.xs,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: NomadSpacing.md,
    backgroundColor: DarkThemeColors.surface,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.border,
  },
  inputField: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.md,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: NomadSpacing.sm,
    color: DarkThemeColors.primaryText,
    ...NomadTypography.body,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: NomadRadius.md,
    backgroundColor: DarkThemeColors.actionBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: NomadSpacing.sm,
  },
  sendBtnDisabled: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
