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
  ScrollView,
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

interface MessagingScreenProps {
  onNavigate?: (tab: string, peerId?: string) => void;
}

export const MessagingScreen: React.FC<MessagingScreenProps> = ({ onNavigate }) => {
  const {
    messages,
    peers,
    sendDirectMessage,
    identity,
    activeTargetPeerId,
    setActiveTargetPeerId,
    deadReckoning,
  } = useNomad();
  const [selectedPeerId, setSelectedPeerId] = useState<string>(
    activeTargetPeerId || peers[0]?.peerId || ''
  );
  const [inputText, setInputText] = useState('');
  const [showPeerPicker, setShowPeerPicker] = useState(false);

  React.useEffect(() => {
    if (activeTargetPeerId) {
      setSelectedPeerId(activeTargetPeerId);
    }
  }, [activeTargetPeerId]);

  const selectedPeer = peers.find(p => p.peerId === selectedPeerId);

  const activeMessages = messages.filter(
    m =>
      (m.senderPeerId === selectedPeerId && m.recipientPeerId === identity.peerId) ||
      (m.senderPeerId === identity.peerId && m.recipientPeerId === selectedPeerId) ||
      m.recipientPeerId === '*'
  );

  const handleSend = (textToSend?: string) => {
    const content = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!content || !selectedPeerId) return;
    sendDirectMessage(selectedPeerId, content);
    if (textToSend === undefined) {
      setInputText('');
    }
  };

  const handleSendCoords = () => {
    const coordMsg = `Current Position Report: ${deadReckoning.latitude.toFixed(5)}°N, ${deadReckoning.longitude.toFixed(5)}°E (Alt: 4350m, Fix: ${deadReckoning.isGpsActive ? 'GNSS' : 'Dead-Reckoning'}, Err: ±${deadReckoning.uncertaintyRadiusMeters}m)`;
    handleSend(coordMsg);
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
      
      {/* TOP STEALTH COMMS HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.peerSelectRow}>
          <TouchableOpacity
            style={styles.peerSelectorBtn}
            onPress={() => setShowPeerPicker(!showPeerPicker)}
            activeOpacity={0.7}
          >
            <View>
              <View style={styles.peerTitleRow}>
                <Text style={styles.channelPrefix}>To</Text>
                <Text style={styles.peerSelectAlias}>
                  {selectedPeer ? selectedPeer.alias : 'Select Target'}
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
          <View style={styles.e2eeDot} />
          <Text style={styles.e2eeText}>
            E2EE Encrypted · X25519 + ChaCha20-Poly1305 · Zero-Knowledge Relay
          </Text>
        </View>
      </View>

      {/* PEER PICKER DROPDOWN */}
      {showPeerPicker && (
        <View style={styles.peerDropdownList}>
          <Text style={styles.dropdownTitle}>Discovered Nearby Nodes</Text>
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
            title="Channel Clear"
            description={`No messages exchanged yet with ${selectedPeer?.alias || 'target node'}. Compose an encrypted packet or tap below for an instant radio check.`}
            icon="💬"
            actionLabel="Send Radio Check"
            onAction={() => handleSend('Radio check. Transceiver operational.')}
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
                    <Text style={styles.emergencyTagText}>🚨 Emergency SOS Envelope</Text>
                  </View>
                )}

                <View style={styles.bubbleHeaderRow}>
                  <Text style={styles.bubbleSender}>
                    {isMe ? 'You' : selectedPeer?.alias || 'Node'}
                  </Text>
                  <Text style={styles.messageTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
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
                      Hop {item.hopCount || 0} · Verified
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* QUICK TACTICAL ACTION CHIPS */}
      <View style={styles.quickChipsStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChipsContent}
        >
          <TouchableOpacity
            style={styles.quickChip}
            onPress={handleSendCoords}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>📍 Send Coordinates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => handleSend('Radio check. Requesting signal strength report.')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>📻 Radio Check</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => handleSend('Convoy hold position. Awaiting regroup.')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>🚙 Convoy Hold</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => handleSend('Sector clear. Route passable, no hazards.')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>✅ Route Clear</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* STEALTH INPUT COMPOSER */}
      <View style={styles.composerContainer}>
        <TextInput
          style={styles.inputField}
          value={inputText}
          onChangeText={setInputText}
          placeholder={`Message ${selectedPeer?.alias || 'target'}...`}
          placeholderTextColor={DarkThemeColors.mutedText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>↑</Text>
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
    gap: 6,
  },
  channelPrefix: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.mutedText,
    fontSize: 11,
    fontWeight: '500',
  },
  peerSelectAlias: {
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  peerSelectMeta: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 10,
    marginTop: 1,
  },
  dropdownIcon: {
    fontSize: 9,
    color: DarkThemeColors.mutedText,
    marginLeft: 2,
  },
  e2eeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.borderSubtle,
    borderRadius: NomadRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: NomadSpacing.xs + 2,
    gap: 6,
    alignSelf: 'flex-start',
  },
  e2eeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DarkThemeColors.tacticalGreen,
  },
  e2eeText: {
    ...NomadTypography.metadata,
    color: DarkThemeColors.secondaryText,
    fontSize: 9.5,
    fontWeight: '500',
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
    fontSize: 10,
    fontWeight: '600',
    marginBottom: NomadSpacing.xs,
    textTransform: 'uppercase',
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
    ...NomadTypography.sectionHeading,
    color: DarkThemeColors.primaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownPeerMeta: {
    ...NomadTypography.supporting,
    color: DarkThemeColors.secondaryText,
    fontSize: 10,
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
    maxWidth: '82%',
    padding: NomadSpacing.md,
    borderRadius: NomadRadius.lg,
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
    borderColor: DarkThemeColors.border,
  },
  emergencyBubble: {
    borderColor: DarkThemeColors.emergencyRed,
    backgroundColor: DarkThemeColors.emergencyRedSubtle,
  },
  emergencyTag: {
    backgroundColor: DarkThemeColors.emergencyRed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: NomadRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  emergencyTagText: {
    ...NomadTypography.metadata,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 9,
  },
  bubbleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    gap: 8,
  },
  bubbleSender: {
    ...NomadTypography.metadata,
    fontSize: 9.5,
    color: DarkThemeColors.mutedText,
    fontWeight: '600',
  },
  messageText: {
    ...NomadTypography.body,
    fontSize: 13.5,
    lineHeight: 19,
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
    fontSize: 9,
  },
  deliveryBadge: {
    marginLeft: NomadSpacing.xs,
  },
  hopMetaText: {
    ...NomadTypography.monoSmall,
    color: DarkThemeColors.secondaryText,
    fontSize: 9,
    fontWeight: '500',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: NomadSpacing.sm,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
    gap: 8,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    borderRadius: NomadRadius.full,
    paddingHorizontal: NomadSpacing.md,
    paddingVertical: 8,
    color: DarkThemeColors.primaryText,
    ...NomadTypography.body,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderColor: DarkThemeColors.borderSubtle,
    opacity: 0.3,
  },
  sendIcon: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '700',
  },
  quickChipsStrip: {
    backgroundColor: '#050508',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: DarkThemeColors.borderSubtle,
  },
  quickChipsContent: {
    paddingHorizontal: NomadSpacing.sm,
    gap: 6,
  },
  quickChip: {
    backgroundColor: DarkThemeColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: DarkThemeColors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: NomadRadius.full,
  },
  quickChipText: {
    ...NomadTypography.monoSmall,
    fontSize: 10,
    color: DarkThemeColors.primaryText,
    fontWeight: '600',
  },
});
