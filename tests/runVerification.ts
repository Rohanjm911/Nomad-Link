import {
  WireProtocolSerializer,
  MessageEnvelope,
  PayloadType,
  PriorityLevel,
} from '../protocol/WireProtocol';
import { CryptoEngine } from '../src/infrastructure/cryptography/CryptoEngine';
import { BoundedMeshRouter } from '../src/infrastructure/networking/BoundedMeshRouter';
import { DeadReckoningEngine } from '../src/infrastructure/location/DeadReckoningEngine';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n========================================');
console.log('NOMAD LINK — Core Verification Runner');
console.log('========================================\n');

// 1. Protocol Tests
console.log('[1] Wire Protocol & Serialization:');
const envelope: MessageEnvelope = {
  messageId: 'test-envelope-01',
  protocolVersion: 1,
  originPeerId: 'origin-ranger',
  destinationId: 'dest-scout',
  createdAt: 1700000000000,
  expiresAt: 1700086400000,
  hopLimit: 5,
  hopCount: 1,
  payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
  priority: PriorityLevel.PRIORITY_NORMAL,
  encryptedPayload: new Uint8Array([11, 22, 33, 44, 55]),
};

const packet = WireProtocolSerializer.serializeEnvelope(envelope);
assert(packet[0] === 0x4e, 'Magic header byte is 0x4E (N)');

const deserialized = WireProtocolSerializer.deserializeEnvelope(packet);
assert(deserialized.messageId === envelope.messageId, 'Envelope message ID restored accurately');
assert(deserialized.destinationId === envelope.destinationId, 'Destination ID restored accurately');
assert(deserialized.hopLimit === envelope.hopLimit, 'Hop limit matches wire specification');

// 2. Cryptography Tests
console.log('\n[2] Cryptography & Identity:');
const alice = CryptoEngine.generateIdentity('Alice-Unit');
const bob = CryptoEngine.generateIdentity('Bob-Unit');

assert(alice.signingKeyPair.publicKey.length === 32, 'Ed25519 signing public key is 32 bytes');
assert(bob.exchangeKeyPair.publicKey.length === 32, 'X25519 exchange public key is 32 bytes');

const testPayload = new TextEncoder().encode('Expedition rendezvous point 34.2257N, 77.5619E');
const encrypted = CryptoEngine.encryptForPeer(testPayload, bob.exchangeKeyPair.publicKey);
const decrypted = CryptoEngine.decryptFromPeer(
  encrypted.ciphertext,
  encrypted.nonce,
  encrypted.ephemeralPublicKey,
  bob.exchangeKeyPair.privateKey
);

const decryptedStr = new TextDecoder().decode(decrypted);
assert(decryptedStr === 'Expedition rendezvous point 34.2257N, 77.5619E', 'Authenticated E2EE decryption matches original plaintext');

const safetyNum = CryptoEngine.computeSafetyNumber(alice.peerId, bob.peerId);
assert(/^\d{4} \d{4} \d{4}$/.test(safetyNum), '12-digit safety number fingerprint matches format: ' + safetyNum);

// 3. Mesh Router Tests
console.log('\n[3] Bounded DTN Mesh Router:');
const router = new BoundedMeshRouter('my-peer-id', 20, 5);
const env1: MessageEnvelope = {
  ...envelope,
  messageId: 'msg-dedup-01',
  expiresAt: Date.now() + 60000,
};

const pass1 = router.receiveEnvelope(env1);
assert(pass1.accepted === true, 'First envelope receipt is accepted');

const pass2 = router.receiveEnvelope(env1);
assert(pass2.accepted === false, 'Duplicate envelope receipt is suppressed');

const expiredEnv: MessageEnvelope = {
  ...envelope,
  messageId: 'msg-expired-99',
  expiresAt: Date.now() - 5000,
};
const passExpired = router.receiveEnvelope(expiredEnv);
assert(passExpired.accepted === false, 'Expired envelope is rejected');

// 4. Dead Reckoning Tests
console.log('\n[4] Dead Reckoning & Sensor Fusion:');
const drEngine = new DeadReckoningEngine();
const initialFix = drEngine.onGpsFix({
  timestamp: 1000,
  latitude: 34.22,
  longitude: 77.56,
  altitudeMeters: 4200,
  accuracyMeters: 4.5,
  speedMps: 10.0,
  bearingDeg: 70.0,
});
assert(initialFix.isGpsActive === true, 'GNSS fix active with 100% confidence');

const sensorUpdate = drEngine.onSensorUpdate({
  timestamp: 25000, // 24 seconds later without GPS
  accelX: 0.1,
  accelY: 0.8,
  accelZ: 9.8,
  gyroX: 0.0,
  gyroY: 0.0,
  gyroZ: 0.0,
  azimuthDeg: 72.0,
});
assert(sensorUpdate.isGpsActive === false, 'GNSS lock degraded gracefully to inertial dead reckoning');
assert(sensorUpdate.driftConfidence < 1.0, 'Drift confidence score decayed appropriately: ' + sensorUpdate.driftConfidence);
assert(sensorUpdate.uncertaintyRadiusMeters > initialFix.uncertaintyRadiusMeters, 'Uncertainty radius expanded dynamically: ' + sensorUpdate.uncertaintyRadiusMeters + 'm');

console.log('\n----------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} assertions passed successfully.`);
console.log('----------------------------------------\n');
