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
  activeTargetPeerId: string | null;
  setActiveTargetPeerId: (id: string | null) => void;
  setIdentityAlias: (alias: string) => void;
  setBatteryEcoMode: (val: boolean) => void;
  startDiscovery: () => Promise<void>;
  stopDiscovery: () => Promise<void>;
  scanForPeers: () => Promise<void>;
  toggleBackgroundService: () => Promise<void>;
  toggleBleAdvertising: () => Promise<void>;
  toggleRadioScanning: () => Promise<void>;
  sendDirectMessage: (targetPeerId: string, text: string) => Promise<void>;
  sendEmergencySos: (severity: EmergencySeverity, note: string) => Promise<void>;
  cancelEmergencySos: () => Promise<void>;
  updatePeerTrust: (peerId: string, trust: TrustStatus) => void;
  sendConvoyRegroup: () => Promise<void>;
  updateConvoyMemberStatus: (peerId: string, status: 'MOVING' | 'STOPPED' | 'REGROUPING' | 'ASSISTANCE_REQUESTED') => void;
  addWaypoint: (wp: { name: string; latitude: number; longitude: number; altitudeMeters?: number; notes?: string }) => void;
  removeWaypoint: (wpId: string) => void;
  purgeCache: () => void;
}

const DISCOVERY_CANDIDATES: PeerRecord[] = [
  {
    peerId: 'c1d2e3f4a5b67890123456789abcdef0123456789abcdef0123456789abcdef0',
    alias: 'Vanguard-Delta',
    trustStatus: TrustStatus.DISCOVERED,
    lastSeenTimestamp: Date.now(),
    rssi: -66,
    bearingDeg: 305,
    distanceMeters: 38,
    transportType: TransportType.BLE,
    exchangePublicKeyHex: 'f4a5b67890123456789abcdef0123456789abcdef0123456789abcdef0c1d2e3',
    signingPublicKeyHex: 'c1d2e3f4a5b67890123456789abcdef0123456789abcdef0123456789abcdef0',
    safetyNumber: '3319 7720 4401',
  },
  {
    peerId: 'd4e5f6a7b8c90123456789abcdef0123456789abcdef0123456789abcdef0123',
    alias: 'Nomad-Recon-9',
    trustStatus: TrustStatus.DISCOVERED,
    lastSeenTimestamp: Date.now(),
    rssi: -74,
    bearingDeg: 82,
    distanceMeters: 56,
    transportType: TransportType.WIFI_DIRECT,
    exchangePublicKeyHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123d4e5f6a7b8c9',
    signingPublicKeyHex: 'd4e5f6a7b8c90123456789abcdef0123456789abcdef0123456789abcdef0123',
    safetyNumber: '8841 1290 6632',
  },
  {
    peerId: 'e5f6a7b8c9d0123456789abcdef0123456789abcdef0123456789abcdef01234',
    alias: 'Sierra-Sentry',
    trustStatus: TrustStatus.VERIFICATION_PENDING,
    lastSeenTimestamp: Date.now(),
    rssi: -82,
    bearingDeg: 168,
    distanceMeters: 74,
    transportType: TransportType.BLE,
    exchangePublicKeyHex: 'abcdef0123456789abcdef0123456789abcdef01234e5f6a7b8c9d0123456789',
    signingPublicKeyHex: 'e5f6a7b8c9d0123456789abcdef0123456789abcdef0123456789abcdef01234',
    safetyNumber: '5501 8839 2210',
  },
];

const NomadContext = createContext<NomadContextType | null>(null);

export const NomadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<NomadDeviceIdentity>(() => {
    return CryptoEngine.generateIdentity('Ranger-Alpha');
  });
  const [activeTargetPeerId, setActiveTargetPeerId] = useState<string | null>(null);

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
      bearingDeg: 38,
      distanceMeters: 28,
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
      bearingDeg: 215,
      distanceMeters: 64,
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
      bearingDeg: 125,
      distanceMeters: 88,
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

  // Periodic passive RF sweep effect when scanning is active
  useEffect(() => {
    if (!isRadioScanning) return;

    const rfInterval = setInterval(() => {
      setPeers(prev => {
        return prev.map(p => {
          // Slight natural RSSI jitter simulating radio wave propagation
          const delta = Math.floor(Math.random() * 5) - 2;
          const newRssi = Math.min(-50, Math.max(-95, (p.rssi || -70) + delta));
          return {
            ...p,
            rssi: newRssi,
            lastSeenTimestamp: Date.now(),
          };
        });
      });
    }, 4000);

    return () => clearInterval(rfInterval);
  }, [isRadioScanning]);

  const scanForPeers = async () => {
    setIsRadioScanning(true);
    setIsBleAdvertising(true);

    // Actively probe radio perimeter and discover next peer from candidates if available
    setPeers(prev => {
      const existingIds = new Set(prev.map(p => p.peerId));
      const nextCandidate = DISCOVERY_CANDIDATES.find(c => !existingIds.has(c.peerId));

      const updated = prev.map(p => ({
        ...p,
        lastSeenTimestamp: Date.now(),
        rssi: Math.min(-48, Math.max(-92, (p.rssi || -70) + (Math.floor(Math.random() * 5) - 2))),
      }));

      if (nextCandidate) {
        return [...updated, { ...nextCandidate, lastSeenTimestamp: Date.now() }];
      }
      return updated;
    });
  };

  const startDiscovery = async () => {
    setIsRadioScanning(true);
    setIsBleAdvertising(true);
    await scanForPeers();
  };

  const stopDiscovery = async () => {
    setIsRadioScanning(false);
    setIsBleAdvertising(false);
  };

  const toggleBackgroundService = async () => {
    setIsBackgroundServiceActive(prev => !prev);
  };

  const toggleBleAdvertising = async () => {
    setIsBleAdvertising(prev => !prev);
  };

  const toggleRadioScanning = async () => {
    setIsRadioScanning(prev => !prev);
  };

  const setIdentityAlias = (newAlias: string) => {
    if (!newAlias.trim()) return;
    setIdentity(prev => ({
      ...prev,
      alias: newAlias.trim(),
    }));
    setConvoy(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.peerId === identity.peerId ? { ...m, alias: `${newAlias.trim()} (You)` } : m
      ),
    }));
  };

  const updatePeerTrust = (peerId: string, trust: TrustStatus) => {
    setPeers(prev =>
      prev.map(p => (p.peerId === peerId ? { ...p, trustStatus: trust } : p))
    );
  };

  const addWaypoint = (wp: {
    name: string;
    latitude: number;
    longitude: number;
    altitudeMeters?: number;
    notes?: string;
  }) => {
    const newWp = {
      id: 'wp-' + Date.now().toString(16),
      name: wp.name,
      latitude: wp.latitude,
      longitude: wp.longitude,
      altitudeMeters: wp.altitudeMeters || 4350,
      notes: wp.notes || 'Recorded on trail',
      createdAt: Date.now(),
    };
    setConvoy(prev => ({
      ...prev,
      activeWaypoints: [newWp, ...prev.activeWaypoints],
    }));
  };

  const removeWaypoint = (wpId: string) => {
    setConvoy(prev => ({
      ...prev,
      activeWaypoints: prev.activeWaypoints.filter(w => w.id !== wpId),
    }));
  };

  const updateConvoyMemberStatus = (
    peerId: string,
    status: 'MOVING' | 'STOPPED' | 'REGROUPING' | 'ASSISTANCE_REQUESTED'
  ) => {
    setConvoy(prev => ({
      ...prev,
      members: prev.members.map(m =>
        m.peerId === peerId
          ? { ...m, status, lastFixTimestamp: Date.now() }
          : m
      ),
    }));
  };

  const purgeCache = () => {
    setMessages([
      {
        messageId: 'msg-init-' + Date.now(),
        conversationId: 'SYSTEM',
        senderPeerId: 'SYSTEM',
        recipientPeerId: identity.peerId,
        text: 'Local DTN cache purged. Mesh routing buffers and message logs cleared.',
        timestamp: Date.now(),
        deliveryState: DeliveryState.DELIVERED_TO_DESTINATION,
        hopCount: 0,
        isOutgoing: false,
        expiresAt: Date.now() + 86400000,
      },
    ]);
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
          m.messageId === msgId
            ? { ...m, deliveryState: DeliveryState.DELIVERED_TO_DESTINATION, hopCount: 1 }
            : m
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

  const cancelEmergencySos = async () => {
    const clearId = 'sos-clear-' + Date.now().toString(16);
    setMessages(prev => [
      ...prev,
      {
        messageId: clearId,
        conversationId: 'EMERGENCY_BROADCAST',
        senderPeerId: identity.peerId,
        recipientPeerId: '*',
        text: `[EMERGENCY STAND DOWN / ALL CLEAR]: Distress condition cancelled by ${identity.alias}. Threat mitigated.`,
        timestamp: Date.now(),
        deliveryState: DeliveryState.DELIVERED_TO_DESTINATION,
        hopCount: 0,
        isOutgoing: true,
        expiresAt: Date.now() + 86400000,
        isEmergency: false,
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
        activeTargetPeerId,
        setActiveTargetPeerId,
        setIdentityAlias,
        setBatteryEcoMode,
        startDiscovery,
        stopDiscovery,
        scanForPeers,
        toggleBackgroundService,
        toggleBleAdvertising,
        toggleRadioScanning,
        sendDirectMessage,
        sendEmergencySos,
        cancelEmergencySos,
        updatePeerTrust,
        sendConvoyRegroup,
        updateConvoyMemberStatus,
        addWaypoint,
        removeWaypoint,
        purgeCache,
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
