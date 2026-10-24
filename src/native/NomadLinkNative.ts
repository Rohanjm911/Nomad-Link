/**
 * NOMAD LINK - Native Android Bridge Specification
 * Typesafe interface mirroring the native Kotlin modules.
 */

export interface NativePeerDiscoveryEvent {
  peerId: string;
  alias: string;
  rssi: number;
  exchangePublicKeyHex: string;
  signingPublicKeyHex: string;
  transportType: 'BLE' | 'WIFI_DIRECT';
  lastSeenMs: number;
}

export interface NativeBleState {
  isScanning: boolean;
  isAdvertising: boolean;
  isBluetoothEnabled: boolean;
}

export interface NativeWifiDirectState {
  isP2pEnabled: boolean;
  isGroupOwner: boolean;
  groupOwnerAddress?: string;
  connectedPeersCount: number;
}

export interface NativeSensorEvent {
  timestamp: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  azimuthDeg: number;
}

export interface NomadLinkNativeBridge {
  // BLE Operations
  startBleAdvertising(alias: string, serviceUuid: string): Promise<boolean>;
  stopBleAdvertising(): Promise<boolean>;
  startBleScanning(serviceUuid: string): Promise<boolean>;
  stopBleScanning(): Promise<boolean>;
  sendBlePacket(targetPeerId: string, packetBytesHex: string): Promise<boolean>;

  // Wi-Fi Direct Operations
  discoverWifiDirectPeers(): Promise<boolean>;
  connectWifiDirectPeer(deviceAddress: string): Promise<boolean>;
  sendWifiDirectData(packetBytesHex: string): Promise<boolean>;

  // Foreground Service Lifecycle
  startExpeditionForegroundService(notificationTitle: string, notificationText: string): Promise<boolean>;
  stopExpeditionForegroundService(): Promise<boolean>;

  // Sensors
  startSensorStream(): Promise<boolean>;
  stopSensorStream(): Promise<boolean>;

  // Keystore Cryptographic Seed Storage
  storeKeyInKeystore(alias: string, secretHex: string): Promise<boolean>;
  getKeyFromKeystore(alias: string): Promise<string | null>;
}
