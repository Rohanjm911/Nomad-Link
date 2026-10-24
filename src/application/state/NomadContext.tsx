import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NomadDeviceIdentity,
  CryptoEngine,
} from '../../infrastructure/cryptography/CryptoEngine';
import {
  PeerRecord,
  MessageModel,
  ConvoyModel,
  ConvoyMemberModel,
  DeadReckoningState,
  TrustStatus,
  TransportType,
  DeliveryState,
} from '../../domain/models/DomainModels';
import { BoundedMeshRouter } from '../../infrastructure/networking/BoundedMeshRouter';
import { DeadReckoningEngine } from '../../infrastructure/location/DeadReckoningEngine';
import {
  WireProtocolSerializer,
  PayloadType,
  PriorityLevel,
  EmergencySeverity,
} from '../../../protocol/WireProtocol';

interface NomadContextType {
  identity: NomadDeviceIdentity;
  peers: PeerRecord[];
  messages: MessageModel[];
  convoy: ConvoyModel;
  deadReckoning: DeadReckoningState;
  isRadioScanning: boolean;
  isBleAdvertising: boolean;
  isBackgroundServiceActive: boolean;
  batteryEcoMode: boolean;
  setBatteryEcoMode: (val: boolean) => void;
  startDiscovery: () => Promise<void>;
  stopDiscovery: () => Promise<void>;
  toggleBackgroundService: () => Promise<void>;
  sendDirectMessage: (targetPeerId: string, text: string) => Promise<void>;
  sendEmergencySos: (severity: EmergencySeverity, note: string) => Promise<void>;
  updatePeerTrust: (peerId: string, trust: TrustStatus) => void;
  sendConvoyRegroup: () => Promise<void>;
}

const NomadContext = createContext<NomadContextType | null>(null);

export const NomadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const [identity] = useState<NomadDeviceIdentity>(() => {
    return CryptoEngine.generateIdentity('Ranger-Alpha');
  });

  
  const [meshRouter] = useState<BoundedMeshRouter>(() => {
    return new BoundedMeshRouter(identity.peerId, 250, 7);
  });

  const [sensorEngine] = useState<DeadReckoningEngine>(() => {
    const engine = new DeadReckoningEngine();
    
    engine.onGpsFix({
      timestamp: Date.now(),
      latitude: 34.2257,
      longitude: 77.5619,
      altitudeMeters: 4350,
      accuracyMeters: 6.2,
      speedMps: 12.5,
      bearingDeg: 68.0,
    });
    return engine;
  });

  
  const [peers, setPeers] = useState<PeerRecord[]>([
    {
      peerId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
      alias: 'Atlas-Leader',
      trustStatus: TrustStatus.TRUSTED,
      lastSeenTimestamp: Date.now() - 15000,
      rssi: -62,
      transportType: TransportType.BLE,
      exchangePublicKeyHex: 'a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef01234',
      signingPublicKeyHex: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
      safetyNumber: '4821 9043 1184',
    },
    {
      peerId: '77bc991024849182736450192837465019283746501928374650192837465019',
      alias: 'Scout-Bravo',
      trustStatus: TrustStatus.VERIFICATION_PENDING,
      lastSeenTimestamp: Date.now() - 42000,
      rssi: -78,
      transportType: TransportType.BLE,
      exchangePublicKeyHex: '3746501928374650192837465019283746501928374650192837465019283746',
      signingPublicKeyHex: '77bc991024849182736450192837465019283746501928374650192837465019',
      safetyNumber: '1092 3847 8820',
    },
    {
      peerId: '44aa8822001199338844775566112233445566778899aabbccddeeff00112233',
      alias: 'Echo-Relay-1',
      trustStatus: TrustStatus.DISCOVERED,
      lastSeenTimestamp: Date.now() - 120000,
      rssi: -86,
      transportType: TransportType.WIFI_DIRECT,
      exchangePublicKeyHex: '8844775566112233445566778899aabbccddeeff0011223344aa882200119933',
      signingPublicKeyHex: '44aa8822001199338844775566112233445566778899aabbccddeeff00112233',
      safetyNumber: '9281 7401 5521',
    },
  ]);

  const [messages, setMessages] = useState<MessageModel[]>([
    {
      messageId: 'msg-001',
      conversationId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
      senderPeerId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
      recipientPeerId: identity.peerId,
      text: 'Pass summit reached. Visibility dropping due to high elevation cloud cover. Keep convoy distance at 80m.',
      timestamp: Date.now() - 360000,
      deliveryState: DeliveryState.READ_BY_RECIPIENT,
      hopCount: 1,
      isOutgoing: false,
      expiresAt: Date.now() + 86400000,
    },
    {
      messageId: 'msg-002',
      conversationId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
      senderPeerId: identity.peerId,
      recipientPeerId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
      text: 'Copy that Atlas. Vehicle 2 trailing at 75m. Dead-reckoning active, heading 068° magnetic.',
      timestamp: Date.now() - 180000,
      deliveryState: DeliveryState.DELIVERED_TO_DESTINATION,
      hopCount: 1,
      isOutgoing: true,
      expiresAt: Date.now() + 86400000,
    },
  ]);

  const [convoy, setConvoy] = useState<ConvoyModel>({
    convoyId: 'convoy-khardung-expedition',
    convoyName: 'Himalayan High Pass Convoy',
    leaderPeerId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
    createdTimestamp: Date.now() - 7200000,
    activeWaypoints: [
      {
        id: 'wp-1',
        name: 'South Pullu Checkpost',
        latitude: 34.2014,
        longitude: 77.5843,
        altitudeMeters: 4690,
        notes: 'Mandatory regroup point. Radio check required.',
        createdAt: Date.now() - 7200000,
      },
      {
        id: 'wp-2',
        name: 'Pass Summit (17,982 ft)',
        latitude: 34.2789,
        longitude: 77.6047,
        altitudeMeters: 5359,
        notes: 'Extreme cold, oxygen thin. 15-minute maximum stop.',
        createdAt: Date.now() - 7200000,
      },
    ],
    members: [
      {
        peerId: 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456',
        alias: 'Atlas (Leader)',
        isLeader: true,
        latitude: 34.2268,
        longitude: 77.5632,
        altitudeMeters: 4362,
        speedKmh: 42,
        headingDegrees: 68,
        lastFixTimestamp: Date.now() - 12000,
        isDeadReckoning: false,
        driftConfidence: 1.0,
        status: 'MOVING',
      },
      {
        peerId: identity.peerId,
        alias: 'Ranger-Alpha (You)',
        isLeader: false,
        latitude: 34.2257,
        longitude: 77.5619,
        altitudeMeters: 4350,
        speedKmh: 39,
        headingDegrees: 68,
        lastFixTimestamp: Date.now() - 4000,
        isDeadReckoning: false,
        driftConfidence: 0.98,
        status: 'MOVING',
      },
      {
        peerId: '77bc991024849182736450192837465019283746501928374650192837465019',
        alias: 'Scout-Bravo (Sweep)',
        isLeader: false,
        latitude: 34.2239,
        longitude: 77.5598,
        altitudeMeters: 4338,
        speedKmh: 35,
        headingDegrees: 70,
        lastFixTimestamp: Date.now() - 32000,
        isDeadReckoning: true,
        driftConfidence: 0.72,
        status: 'MOVING',
      },
    ],
  });

  const [deadReckoning, setDeadReckoning] = useState<DeadReckoningState>(() => sensorEngine.getState());
  const [isRadioScanning, setIsRadioScanning] = useState(true);
  const [isBleAdvertising, setIsBleAdvertising] = useState(true);
  const [isBackgroundServiceActive, setIsBackgroundServiceActive] = useState(true);
  const [batteryEcoMode, setBatteryEcoMode] = useState(false);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const reading = {
        timestamp: Date.now(),
        accelX: 0.12,
        accelY: 0.85,
        accelZ: 9.80,
        gyroX: 0.01,
        gyroY: 0.02,
        gyroZ: 0.01,
        azimuthDeg: 68 + (Math.sin(Date.now() / 5000) * 3),
      };
      const updated = sensorEngine.onSensorUpdate(reading);
      setDeadReckoning({ ...updated });
    }, 1500);

    return () => clearInterval(interval);
  }, [sensorEngine]);

  const startDiscovery = async () => {
    setIsRadioScanning(true);
    setIsBleAdvertising(true);
  };

  const stopDiscovery = async () => {
    setIsRadioScanning(false);
    setIsBleAdvertising(false);
  };

  const toggleBackgroundService = async () => {
    setIsBackgroundServiceActive(prev => !prev);
  };

  const updatePeerTrust = (peerId: string, trust: TrustStatus) => {
    setPeers(prev =>
      prev.map(p => (p.peerId === peerId ? { ...p, trustStatus: trust } : p))
    );
  };

  const sendDirectMessage = async (targetPeerId: string, text: string) => {
    const targetPeer = peers.find(p => p.peerId === targetPeerId);
    const msgId = 'msg-' + Date.now().toString(16);

    const newMsg: MessageModel = {
      messageId: msgId,
      conversationId: targetPeerId,
      senderPeerId: identity.peerId,
      recipientPeerId: targetPeerId,
      text,
      timestamp: Date.now(),
      deliveryState: DeliveryState.QUEUED_LOCALLY,
      hopCount: 0,
      isOutgoing: true,
      expiresAt: Date.now() + 86400000,
    };

    setMessages(prev => [...prev, newMsg]);

    
    const rawPlaintext = WireProtocolSerializer.encodeDirectMessage({
      messageId: msgId,
      conversationId: targetPeerId,
      text,
      timestamp: Date.now(),
      requestDeliveryReceipt: true,
      requestReadReceipt: true,
    });

    const recipientPubKey = targetPeer
      ? CryptoEngine.hexToBytes(targetPeer.exchangePublicKeyHex)
      : new Uint8Array(32);

    const encryptedPackage = CryptoEngine.encryptForPeer(rawPlaintext, recipientPubKey);

    
    const envelope = {
      messageId: msgId,
      protocolVersion: 1,
      originPeerId: identity.peerId,
      destinationId: targetPeerId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      hopLimit: 7,
      hopCount: 0,
      payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
      priority: PriorityLevel.PRIORITY_NORMAL,
      encryptedPayload: encryptedPackage.ciphertext,
      ephemeralPubkey: encryptedPackage.ephemeralPublicKey,
      nonce: encryptedPackage.nonce,
    };

    
    meshRouter.enqueueForForwarding(envelope);

    
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.messageId === msgId ? { ...m, deliveryState: DeliveryState.DELIVERED_TO_DESTINATION, hopCount: 1 } : m
        )
      );
    }, 1200);
  };

  const sendEmergencySos = async (severity: EmergencySeverity, note: string) => {
    const beaconId = 'sos-' + Date.now().toString(16);
    const beaconPayload = {
      beaconId,
      senderPeerId: identity.peerId,
      senderAlias: identity.alias,
      severity,
      natureOfEmergency: note,
      personnelCount: 2,
      latitude: deadReckoning.latitude,
      longitude: deadReckoning.longitude,
      altitudeMeters: 4350,
      accuracyMeters: deadReckoning.uncertaintyRadiusMeters,
      locationTimestamp: Date.now(),
      emergencyTimestamp: Date.now(),
      isActive: true,
    };

    const envelope = {
      messageId: beaconId,
      protocolVersion: 1,
      originPeerId: identity.peerId,
      destinationId: '*', 
      createdAt: Date.now(),
      expiresAt: Date.now() + 172800000, 
      hopLimit: 12,
      hopCount: 0,
      payloadType: PayloadType.PAYLOAD_EMERGENCY_BEACON,
      priority: PriorityLevel.PRIORITY_EMERGENCY,
      encryptedPayload: WireProtocolSerializer.encodeEmergencyBeacon(beaconPayload),
    };

    meshRouter.enqueueForForwarding(envelope);

    
    setMessages(prev => [
      ...prev,
      {
        messageId: beaconId,
        conversationId: 'EMERGENCY_BROADCAST',
        senderPeerId: identity.peerId,
        recipientPeerId: '*',
        text: `[TACTICAL SOS DISTRESS BEACON ACTIVATED]: ${note} | Coordinates: ${deadReckoning.latitude.toFixed(4)}°N, ${deadReckoning.longitude.toFixed(4)}°E`,
        timestamp: Date.now(),
        deliveryState: DeliveryState.FORWARDED_TO_RELAY,
        hopCount: 0,
        isOutgoing: true,
        expiresAt: Date.now() + 172800000,
        isEmergency: true,
      },
    ]);
  };

  const sendConvoyRegroup = async () => {
    setConvoy((prev: ConvoyModel) => ({
      ...prev,
      members: prev.members.map((m: ConvoyMemberModel) =>
        m.peerId === identity.peerId ? { ...m, status: 'REGROUPING' as const } : m
      ),
    }));
  };

  return (
    <NomadContext.Provider
      value={{
        identity,
        peers,
        messages,
        convoy,
        deadReckoning,
        isRadioScanning,
        isBleAdvertising,
        isBackgroundServiceActive,
        batteryEcoMode,
        setBatteryEcoMode,
        startDiscovery,
        stopDiscovery,
        toggleBackgroundService,
        sendDirectMessage,
        sendEmergencySos,
        updatePeerTrust,
        sendConvoyRegroup,
      }}
    >
      {children}
    </NomadContext.Provider>
  );
};

export const useNomad = () => {
  const context = useContext(NomadContext);
  if (!context) {
    throw new Error('useNomad must be used within a NomadProvider');
  }
  return context;
};
