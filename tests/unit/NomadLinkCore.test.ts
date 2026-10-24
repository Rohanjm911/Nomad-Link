import {
  WireProtocolSerializer,
  MessageEnvelope,
  PayloadType,
  PriorityLevel,
} from '../../protocol/WireProtocol';
import { CryptoEngine } from '../../src/infrastructure/cryptography/CryptoEngine';
import { BoundedMeshRouter } from '../../src/infrastructure/networking/BoundedMeshRouter';
import { DeadReckoningEngine } from '../../src/infrastructure/location/DeadReckoningEngine';

describe('NOMAD LINK — Core Systems & Protocol Unit Tests', () => {
  describe('Wire Protocol Serialization & Framing', () => {
    it('should serialize and deserialize message envelope accurately with magic bytes', () => {
      const originalEnvelope: MessageEnvelope = {
        messageId: 'test-msg-001',
        protocolVersion: 1,
        originPeerId: 'peer-alpha-001',
        destinationId: 'peer-bravo-002',
        createdAt: 1700000000000,
        expiresAt: 1700086400000,
        hopLimit: 5,
        hopCount: 1,
        payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
        priority: PriorityLevel.PRIORITY_NORMAL,
        encryptedPayload: new Uint8Array([10, 20, 30, 40, 50]),
      };

      const packet = WireProtocolSerializer.serializeEnvelope(originalEnvelope);
      expect(packet.length).toBeGreaterThan(3);
      expect(packet[0]).toBe(0x4e); // 'N'

      const restored = WireProtocolSerializer.deserializeEnvelope(packet);
      expect(restored.messageId).toBe(originalEnvelope.messageId);
      expect(restored.destinationId).toBe(originalEnvelope.destinationId);
      expect(restored.hopLimit).toBe(originalEnvelope.hopLimit);
      expect(Array.from(restored.encryptedPayload)).toEqual([10, 20, 30, 40, 50]);
    });
  });

  describe('Cryptographic Identity & Authenticated Encryption (Module A & E)', () => {
    it('should generate valid identity and verify signatures', () => {
      const identity = CryptoEngine.generateIdentity('Scout-Unit');
      expect(identity.peerId).toBeDefined();
      expect(identity.signingKeyPair.publicKey.length).toBe(32);

      const testData = new Uint8Array([1, 2, 3, 4, 5, 6]);
      const signature = CryptoEngine.sign(testData, identity.signingKeyPair.privateKey);
      expect(signature.length).toBe(64);

      const isValid = CryptoEngine.verify(testData, signature, identity.signingKeyPair.publicKey);
      expect(isValid).toBe(true);

      const corruptedSignature = new Uint8Array(signature);
      corruptedSignature[0] = corruptedSignature[0] ^ 0xff;
      const isCorruptedValid = CryptoEngine.verify(testData, corruptedSignature, identity.signingKeyPair.publicKey);
      expect(isCorruptedValid).toBe(false);
    });

    it('should perform authenticated E2EE encryption and decryption between peers', () => {
      const alice = CryptoEngine.generateIdentity('Alice');
      const bob = CryptoEngine.generateIdentity('Bob');

      const plaintext = new TextEncoder().encode('Rendezvous at waypoint Bravo 1400 hours');
      const encrypted = CryptoEngine.encryptForPeer(plaintext, bob.exchangeKeyPair.publicKey);

      const decrypted = CryptoEngine.decryptFromPeer(
        encrypted.ciphertext,
        encrypted.nonce,
        encrypted.ephemeralPublicKey,
        bob.exchangeKeyPair.privateKey
      );

      const decryptedString = new TextDecoder().decode(decrypted);
      expect(decryptedString).toBe('Rendezvous at waypoint Bravo 1400 hours');
    });

    it('should compute consistent 12-digit safety numbers regardless of peer order', () => {
      const peerA = 'aaaa1111222233334444555566667777888899990000aaaabbbbccccddddeeee';
      const peerB = 'bbbb222233334444555566667777888899990000aaaabbbbccccddddeeeeffff';

      const code1 = CryptoEngine.computeSafetyNumber(peerA, peerB);
      const code2 = CryptoEngine.computeSafetyNumber(peerB, peerA);

      expect(code1).toBe(code2);
      expect(code1).toMatch(/^\d{4} \d{4} \d{4}$/);
    });
  });

  describe('Bounded DTN Mesh Router (Module D)', () => {
    it('should enforce duplicate message suppression', () => {
      const router = new BoundedMeshRouter('my-peer-id', 50, 5);

      const envelope: MessageEnvelope = {
        messageId: 'msg-unique-99',
        protocolVersion: 1,
        originPeerId: 'peer-sender',
        destinationId: 'peer-receiver',
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
        hopLimit: 4,
        hopCount: 1,
        payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
        priority: PriorityLevel.PRIORITY_NORMAL,
        encryptedPayload: new Uint8Array([1, 2, 3]),
      };

      const firstPass = router.receiveEnvelope(envelope);
      expect(firstPass.accepted).toBe(true);

      const secondPass = router.receiveEnvelope(envelope);
      expect(secondPass.accepted).toBe(false);
      expect(secondPass.reason).toContain('Duplicate');
    });

    it('should drop expired envelopes', () => {
      const router = new BoundedMeshRouter('my-peer-id', 50, 5);

      const expiredEnvelope: MessageEnvelope = {
        messageId: 'msg-expired-01',
        protocolVersion: 1,
        originPeerId: 'peer-sender',
        destinationId: 'peer-receiver',
        createdAt: Date.now() - 10000,
        expiresAt: Date.now() - 1000, // Expired
        hopLimit: 4,
        hopCount: 1,
        payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
        priority: PriorityLevel.PRIORITY_NORMAL,
        encryptedPayload: new Uint8Array([1, 2, 3]),
      };

      const res = router.receiveEnvelope(expiredEnvelope);
      expect(res.accepted).toBe(false);
      expect(res.reason).toContain('expired');
    });
  });

  describe('Inertial Navigation & Dead Reckoning (Module I)', () => {
    it('should lock GPS fix and degrade confidence when fixes stop', () => {
      const engine = new DeadReckoningEngine();

      const initial = engine.onGpsFix({
        timestamp: 10000,
        latitude: 34.0,
        longitude: 77.0,
        altitudeMeters: 4000,
        accuracyMeters: 5.0,
        speedMps: 10.0,
        bearingDeg: 90.0,
      });

      expect(initial.isGpsActive).toBe(true);
      expect(initial.driftConfidence).toBe(1.0);

      // Simulate inertial updates 20 seconds later without GPS
      const degraded = engine.onSensorUpdate({
        timestamp: 30000,
        accelX: 0.0,
        accelY: 0.0,
        accelZ: 9.81,
        gyroX: 0.0,
        gyroY: 0.0,
        gyroZ: 0.0,
        azimuthDeg: 90.0,
      });

      expect(degraded.isGpsActive).toBe(false);
      expect(degraded.driftConfidence).toBeLessThan(1.0);
      expect(degraded.uncertaintyRadiusMeters).toBeGreaterThan(5.0);
    });
  });
});
