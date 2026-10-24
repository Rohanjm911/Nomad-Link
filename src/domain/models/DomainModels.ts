/**
 * NOMAD LINK - Core Domain Models
 * Strictly typed entities across Identity, Discovery, Messaging, Convoy, and Routing.
 */

export enum TrustStatus {
  DISCOVERED = 'DISCOVERED',
  VERIFICATION_PENDING = 'VERIFICATION_PENDING',
  TRUSTED = 'TRUSTED',
  BLOCKED = 'BLOCKED',
}

export enum TransportType {
  BLE = 'BLE',
  WIFI_DIRECT = 'WIFI_DIRECT',
  OFFLINE_QUEUE = 'OFFLINE_QUEUE',
}

export enum DeliveryState {
  ACCEPTED_LOCALLY = 'ACCEPTED_LOCALLY',
  QUEUED_LOCALLY = 'QUEUED_LOCALLY',
  FORWARDED_TO_RELAY = 'FORWARDED_TO_RELAY',
  DELIVERED_TO_DESTINATION = 'DELIVERED_TO_DESTINATION',
  READ_BY_RECIPIENT = 'READ_BY_RECIPIENT',
  FAILED = 'FAILED',
}

export interface PeerRecord {
  peerId: string;
  alias: string;
  trustStatus: TrustStatus;
  lastSeenTimestamp: number;
  rssi?: number;
  transportType: TransportType;
  exchangePublicKeyHex: string;
  signingPublicKeyHex: string;
  safetyNumber: string;
}

export interface ConversationModel {
  conversationId: string;
  peerId: string;
  peerAlias: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: number;
  unreadCount: number;
  isGroup: boolean;
}

export interface MessageModel {
  messageId: string;
  conversationId: string;
  senderPeerId: string;
  recipientPeerId: string;
  text: string;
  timestamp: number;
  deliveryState: DeliveryState;
  hopCount: number;
  isOutgoing: boolean;
  expiresAt: number;
  isEmergency?: boolean;
}

export interface ConvoyMemberModel {
  peerId: string;
  alias: string;
  isLeader: boolean;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  speedKmh: number;
  headingDegrees: number;
  lastFixTimestamp: number;
  isDeadReckoning: boolean;
  driftConfidence: number; // 0.0 to 1.0
  status: 'MOVING' | 'STOPPED' | 'REGROUPING' | 'ASSISTANCE_REQUESTED' | 'OFFLINE';
}

export interface ConvoyModel {
  convoyId: string;
  convoyName: string;
  leaderPeerId: string;
  createdTimestamp: number;
  activeWaypoints: SavedWaypointModel[];
  members: ConvoyMemberModel[];
}

export interface SavedWaypointModel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  notes?: string;
  createdAt: number;
}

export interface DeadReckoningState {
  isGpsActive: boolean;
  lastGpsFixTimestamp: number;
  latitude: number;
  longitude: number;
  estimatedSpeedMps: number;
  headingDegrees: number;
  uncertaintyRadiusMeters: number;
  driftConfidence: number; // 1.0 = perfect GPS, 0.0 = completely lost fix
}
