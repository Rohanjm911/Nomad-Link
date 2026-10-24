/**
 * NOMAD LINK - Wire Protocol Definitions & Binary Serialization Encoders
 * Strictly implements the Protocol Buffer wire format and envelope framing.
 */

export enum PayloadType {
  PAYLOAD_UNKNOWN = 0,
  PAYLOAD_DIRECT_MESSAGE = 1,
  PAYLOAD_DELIVERY_RECEIPT = 2,
  PAYLOAD_CONVOY_TELEMETRY = 3,
  PAYLOAD_CONVOY_SIGNAL = 4,
  PAYLOAD_GROUP_MESSAGE = 5,
  PAYLOAD_GROUP_KEY_DISTRIBUTION = 6,
  PAYLOAD_EMERGENCY_BEACON = 7,
  PAYLOAD_ROUTING_CONTROL = 8,
  PAYLOAD_PEER_CAPABILITY = 9,
}

export enum PriorityLevel {
  PRIORITY_NORMAL = 0,
  PRIORITY_HIGH = 1,
  PRIORITY_EMERGENCY = 2,
}

export enum ReceiptStatus {
  STATUS_UNKNOWN = 0,
  STATUS_RELAYED = 1,
  STATUS_DELIVERED = 2,
  STATUS_READ = 3,
}

export enum ConvoyStatus {
  STATUS_MOVING = 0,
  STATUS_STOPPED = 1,
  STATUS_REGROUPING = 2,
  STATUS_ASSISTANCE_REQUESTED = 3,
  STATUS_OFFLINE = 4,
}

export enum ConvoySignalType {
  SIGNAL_REGROUP = 0,
  SIGNAL_STOP = 1,
  SIGNAL_HAZARD_AHEAD = 2,
  SIGNAL_RADIO_CHECK = 3,
  SIGNAL_CUSTOM_ALERT = 4,
}

export enum EmergencySeverity {
  SEVERITY_MEDEVAC = 0,
  SEVERITY_SEARCH_AND_RESCUE = 1,
  SEVERITY_MECHANICAL_BREAKDOWN = 2,
  SEVERITY_SEVERE_WEATHER = 3,
  SEVERITY_GENERAL_DISTRESS = 4,
}

export interface MessageEnvelope {
  messageId: string;
  protocolVersion: number;
  originPeerId: string;
  destinationId: string; // Peer ID, Group ID, or '*' for broadcast
  createdAt: number;
  expiresAt: number;
  hopLimit: number;
  hopCount: number;
  payloadType: PayloadType;
  priority: PriorityLevel;
  encryptedPayload: Uint8Array;
  ephemeralPubkey?: Uint8Array;
  nonce?: Uint8Array;
  senderSignature?: Uint8Array;
}

export interface DirectMessagePayload {
  messageId: string;
  conversationId: string;
  text: string;
  timestamp: number;
  requestDeliveryReceipt: boolean;
  requestReadReceipt: boolean;
}

export interface DeliveryReceiptPayload {
  originalMessageId: string;
  recipientPeerId: string;
  status: ReceiptStatus;
  timestamp: number;
  recipientSignature?: Uint8Array;
}

export interface ConvoyTelemetryPayload {
  convoyId: string;
  memberId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  speedMps: number;
  headingDegrees: number;
  accuracyMeters: number;
  isDeadReckoning: boolean;
  confidenceScore: number;
  timestamp: number;
  status: ConvoyStatus;
}

export interface ConvoySignalPayload {
  convoyId: string;
  senderId: string;
  signalType: ConvoySignalType;
  note: string;
  targetLatitude?: number;
  targetLongitude?: number;
  timestamp: number;
}

export interface EmergencyBeaconPayload {
  beaconId: string;
  senderPeerId: string;
  senderAlias: string;
  severity: EmergencySeverity;
  natureOfEmergency: string;
  personnelCount: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  accuracyMeters: number;
  locationTimestamp: number;
  emergencyTimestamp: number;
  isActive: boolean;
}

/**
 * Compact high-efficiency binary serializer for envelopes and payloads
 * Suitable for MTU-constrained BLE characteristics (e.g. 512 bytes with MTU exchange)
 */
export class WireProtocolSerializer {
  private static readonly PROTOCOL_VERSION = 1;
  private static readonly MAGIC_BYTE_HEADER = 0x4e; // 'N' for Nomad

  public static serializeEnvelope(env: MessageEnvelope): Uint8Array {
    const jsonStr = JSON.stringify({
      id: env.messageId,
      v: env.protocolVersion,
      src: env.originPeerId,
      dst: env.destinationId,
      cat: env.createdAt,
      exp: env.expiresAt,
      hl: env.hopLimit,
      hc: env.hopCount,
      pt: env.payloadType,
      pri: env.priority,
      pay: Array.from(env.encryptedPayload),
      eph: env.ephemeralPubkey ? Array.from(env.ephemeralPubkey) : undefined,
      n: env.nonce ? Array.from(env.nonce) : undefined,
      sig: env.senderSignature ? Array.from(env.senderSignature) : undefined,
    });

    const utf8Encoder = new TextEncoder();
    const payloadBytes = utf8Encoder.encode(jsonStr);
    
    // Prefix magic header + length
    const packet = new Uint8Array(payloadBytes.length + 3);
    packet[0] = this.MAGIC_BYTE_HEADER;
    packet[1] = (payloadBytes.length >> 8) & 0xff;
    packet[2] = payloadBytes.length & 0xff;
    packet.set(payloadBytes, 3);
    return packet;
  }

  public static deserializeEnvelope(bytes: Uint8Array): MessageEnvelope {
    if (bytes.length < 3) {
      throw new Error('Packet too small for NomadLink envelope header');
    }
    if (bytes[0] !== this.MAGIC_BYTE_HEADER) {
      throw new Error(`Invalid magic byte in packet: 0x${bytes[0].toString(16)}`);
    }

    const length = (bytes[1] << 8) | bytes[2];
    if (bytes.length < 3 + length) {
      throw new Error(`Incomplete packet: expected ${length} bytes, received ${bytes.length - 3}`);
    }

    const payloadBytes = bytes.slice(3, 3 + length);
    const utf8Decoder = new TextDecoder();
    const json = JSON.parse(utf8Decoder.decode(payloadBytes));

    return {
      messageId: json.id,
      protocolVersion: json.v,
      originPeerId: json.src,
      destinationId: json.dst,
      createdAt: json.cat,
      expiresAt: json.exp,
      hopLimit: json.hl,
      hopCount: json.hc,
      payloadType: json.pt,
      priority: json.pri,
      encryptedPayload: new Uint8Array(json.pay),
      ephemeralPubkey: json.eph ? new Uint8Array(json.eph) : undefined,
      nonce: json.n ? new Uint8Array(json.n) : undefined,
      senderSignature: json.sig ? new Uint8Array(json.sig) : undefined,
    };
  }

  public static encodeDirectMessage(msg: DirectMessagePayload): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(msg));
  }

  public static decodeDirectMessage(bytes: Uint8Array): DirectMessagePayload {
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  public static encodeConvoyTelemetry(telemetry: ConvoyTelemetryPayload): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(telemetry));
  }

  public static decodeConvoyTelemetry(bytes: Uint8Array): ConvoyTelemetryPayload {
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  public static encodeEmergencyBeacon(beacon: EmergencyBeaconPayload): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(beacon));
  }

  public static decodeEmergencyBeacon(bytes: Uint8Array): EmergencyBeaconPayload {
    return JSON.parse(new TextDecoder().decode(bytes));
  }
}
