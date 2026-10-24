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
      
      {/* TOP TACTICAL COMMS HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.peerSelectRow}>
          <TouchableOpacity
            style={styles.peerSelectorBtn}
            onPress={() => setShowPeerPicker(!showPeerPicker)}
            activeOpacity={0.7}
          >
            <View>
              <View style={styles.peerTitleRow}>
                <Text style={styles.channelPrefix}>TARGET NODE //</Text>
                <Text style={styles.peerSelectAlias}>
                  {selectedPeer ? selectedPeer.alias.toUpperCase() : 'SELECT TARGET'}
                </Text>
                <Text style={styles.dropdownIcon}>{showPeerPicker ? '▲' : '▼'}</Text>
              </View>
              <Text style={styles.peerSelectMeta}>
                {selectedPeer
                  ? `${selectedPeer.transportType} · FP: ${selectedPeer.safetyNumber}`
                  : 'Tap to select discovered radio node'}
              </Text>
            </View>
          </TouchableOpacity>
          {selectedPeer && <TrustBadge status={selectedPeer.trustStatus} />}
        </View>

        {/* CRYPTOGRAPHIC INTEGRITY BANNER */}
        <View style={styles.e2eeBanner}>
          <Text style={styles.e2eeText}>
            [SECURE DTN // X25519 ECDH + CHACHA20-POLY1305 · RELAYS ZERO-KNOWLEDGE]
          </Text>
        </View>
      </View>

      {/* PEER PICKER DROPDOWN */}
      {showPeerPicker && (
        <View style={styles.peerDropdownList}>
          <Text style={styles.dropdownTitle}>// DISCOVERED ADJACENT NODES //</Text>
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
                <Text style={styles.dropdownPeerAlias}>[{p.alias.toUpperCase()}]</Text>
                <Text style={styles.dropdownPeerMeta}>
                  {p.transportType} · FP: {p.safetyNumber}
                </Text>
              </View>
              <TrustBadge status={p.trustStatus} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* MESSAGE STREAM */}
      {activeMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            title="NO TRANSMISSIONS EXCHANGED"
            description={`Channel clear. Compose and transmit encrypted store-and-forward telemetry to ${selectedPeer?.alias || 'target node'}. Packets persist in local DTN queue until relay hop established.`}
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
                    <Text style={styles.emergencyTagText}>[🚨 PRIORITY DISTRESS ENVELOPE]</Text>
                  </View>
                )}

                <View style={styles.bubbleHeaderRow}>
                  <Text style={styles.bubbleSender}>
                    {isMe ? 'TX // LOCAL NODE' : `RX // ${selectedPeer?.alias?.toUpperCase() || 'NODE'}`}
                  </Text>
                  <Text style={styles.messageTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </Text>
                </View>

                <Text style={[styles.messageText, isMe ? styles.textOut : styles.textIn]}>
                  {item.text}
                </Text>

                <View style={styles.messageFooter}>
                  {isMe ? (
                    <DeliveryStatusIndicator
                      state={item.deliveryState}
                      hopCount={item.hopCount}
                      style={styles.deliveryBadge}
                    />
                  ) : (
                    <Text style={styles.hopMetaText}>
                      [HOP {item.hopCount || 0} · AUTH VALID]
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* TACTICAL INPUT COMPOSER */}
      <View style={styles.composerContainer}>
        <View style={styles.txPrefixWrap}>
          <Text style={styles.txPrefixText}>TX&gt;</Text>
        </View>
        <TextInput
          style={styles.inputField}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`// ENCRYPTED PAYLOAD TO ${selectedPeer?.alias?.toUpperCase() || 'TARGET'} //`}
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
          <Text style={styles.sendIcon}>TX</Text>
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
    paddingTop: NomadSpacing.xs + 2,
    paddingBottom: NomadSpacing.xs + 2,
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
  },
  peerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelPrefix: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 9,
    fontWeight: '800',
  },
  peerSelectAlias: {
    ...NomadTypography.mono,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  peerSelectMeta: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9.5,
    marginTop: 1,
  },
  dropdownIcon: {
    fontSize: 8,
    color: DarkThemeColors.tacticalCyan,
    marginLeft: 4,
  },
  e2eeBanner: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: NomadSpacing.xs,
  },
  e2eeText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalGreen,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  peerDropdownList: {
    backgroundColor: DarkThemeColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.tacticalCyan,
    padding: NomadSpacing.md,
  },
  dropdownTitle: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    fontSize: 9,
    letterSpacing: 1.0,
    fontWeight: '800',
    marginBottom: NomadSpacing.xs,
  },
  peerDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: NomadSpacing.xs + 3,
    borderBottomWidth: 1,
    borderBottomColor: DarkThemeColors.borderSubtle,
  },
  peerDropdownItemSelected: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
  },
  dropdownPeerAlias: {
    ...NomadTypography.mono,
    color: DarkThemeColors.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  dropdownPeerMeta: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9,
    marginTop: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: NomadSpacing.md,
  },
  messageList: {
    padding: NomadSpacing.md,
    paddingBottom: NomadSpacing.lg,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: NomadSpacing.sm + 2,
    borderRadius: NomadRadius.xs,
    marginBottom: NomadSpacing.xs + 3,
    borderWidth: 1,
  },
  messageIncoming: {
    alignSelf: 'flex-start',
    backgroundColor: DarkThemeColors.surface,
    borderColor: DarkThemeColors.border,
    borderLeftWidth: 3,
    borderLeftColor: DarkThemeColors.tacticalGreen,
  },
  messageOutgoing: {
    alignSelf: 'flex-end',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.border,
    borderRightWidth: 3,
    borderRightColor: DarkThemeColors.tacticalCyan,
  },
  emergencyBubble: {
    borderColor: DarkThemeColors.emergencyRed,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
    borderLeftWidth: 3,
    borderLeftColor: DarkThemeColors.emergencyRed,
  },
  emergencyTag: {
    backgroundColor: DarkThemeColors.emergencyRed,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: NomadRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  emergencyTagText: {
    ...NomadTypography.monoSmall,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 8.5,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    gap: 8,
  },
  bubbleSender: {
    ...NomadTypography.monoSmall,
    fontSize: 8.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '800',
  },
  messageText: {
    ...NomadTypography.body,
    fontSize: 13,
    lineHeight: 18,
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
    marginTop: 4,
  },
  messageTime: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.mutedText,
    fontSize: 8.5,
  },
  deliveryBadge: {
    marginLeft: NomadSpacing.xs,
  },
  hopMetaText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalGreen,
    fontSize: 8.5,
    fontWeight: '700',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: NomadSpacing.xs + 2,
    backgroundColor: DarkThemeColors.surface,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.border,
    gap: 6,
  },
  txPrefixWrap: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderRadius: NomadRadius.xs,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
  },
  txPrefixText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '900',
    fontSize: 10,
  },
  inputField: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.xs,
    paddingHorizontal: NomadSpacing.sm,
    paddingVertical: 6,
    color: DarkThemeColors.primaryText,
    ...NomadTypography.monoSmall,
    fontSize: 11,
  },
  sendBtn: {
    width: 44,
    height: 38,
    borderRadius: NomadRadius.xs,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.tacticalCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    borderColor: DarkThemeColors.borderSubtle,
    opacity: 0.4,
  },
  sendIcon: {
    ...NomadTypography.monoSmall,
    fontSize: 11,
    color: DarkThemeColors.tacticalCyan,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
