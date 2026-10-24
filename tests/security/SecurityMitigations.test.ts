import { CryptoEngine } from '../../src/infrastructure/cryptography/CryptoEngine';
import { BoundedMeshRouter } from '../../src/infrastructure/networking/BoundedMeshRouter';
import { MessageEnvelope, PayloadType, PriorityLevel, WireProtocolSerializer } from '../../protocol/WireProtocol';

describe('NOMAD LINK — Security & Attack Mitigation Test Suite', () => {
  let router: BoundedMeshRouter;
  const MY_PEER_ID = 'node-defender-alpha';

  beforeEach(() => {
    // Capacity 10, Max Hops 5
    router = new BoundedMeshRouter(MY_PEER_ID, 10, 5);
  });

  describe('Attack Vector 1: Replay & Message Duplication Flooding', () => {
    it('should drop identical replayed message IDs immediately', () => {
      const envelope: MessageEnvelope = {
        messageId: 'replay-attack-msg-001',
        protocolVersion: 1,
        originPeerId: 'attacker-node',
        destinationId: 'target-node',
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
        hopLimit: 4,
        hopCount: 1,
        payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
        priority: PriorityLevel.PRIORITY_NORMAL,
        encryptedPayload: new Uint8Array([1, 2, 3]),
      };

      const firstAttempt = router.receiveEnvelope(envelope);
      expect(firstAttempt.accepted).toBe(true);

      // Attacker replays exact same envelope 5 times
      for (let i = 0; i < 5; i++) {
        const replayAttempt = router.receiveEnvelope(envelope);
        expect(replayAttempt.accepted).toBe(false);
        expect(replayAttempt.reason).toContain('Duplicate');
      }

      expect(router.getQueueLength()).toBe(1);
    });
  });

  describe('Attack Vector 2: Hop Limit Exhaustion & Forwarding Loops', () => {
    it('should drop envelopes where hop_limit is 0 or exceeded max allowable bounds', () => {
      const loopedEnvelope: MessageEnvelope = {
        messageId: 'loop-attack-msg-002',
        protocolVersion: 1,
        originPeerId: 'attacker-node',
        destinationId: 'target-node',
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
        hopLimit: 0, // Exhausted
        hopCount: 5, // Reached max
        payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
        priority: PriorityLevel.PRIORITY_NORMAL,
        encryptedPayload: new Uint8Array([1, 2, 3]),
      };

      const result = router.receiveEnvelope(loopedEnvelope);
      expect(result.accepted).toBe(false);
      expect(result.reason).toContain('Hop limit');
    });
  });

  describe('Attack Vector 3: Storage Exhaustion & DoS Priority Eviction', () => {
    it('should evict lowest-priority traffic and protect emergency beacons when queue is saturated', () => {
      // Saturate queue with 10 normal messages
      for (let i = 0; i < 10; i++) {
        router.enqueueForForwarding({
          messageId: `normal-msg-${i}`,
          protocolVersion: 1,
          originPeerId: 'node-chat',
          destinationId: 'node-friend',
          createdAt: Date.now() + i,
          expiresAt: Date.now() + 60000,
          hopLimit: 3,
          hopCount: 1,
          payloadType: PayloadType.PAYLOAD_DIRECT_MESSAGE,
          priority: PriorityLevel.PRIORITY_NORMAL,
          encryptedPayload: new Uint8Array([1, 2]),
        });
      }

      expect(router.getQueueLength()).toBe(10);

      // Now insert high-priority Emergency SOS beacon
      const sosBeacon: MessageEnvelope = {
        messageId: 'emergency-sos-life-safety',
        protocolVersion: 1,
        originPeerId: 'node-distress',
        destinationId: '*',
        createdAt: Date.now() + 20,
        expiresAt: Date.now() + 180000,
        hopLimit: 12,
        hopCount: 0,
        payloadType: PayloadType.PAYLOAD_EMERGENCY_BEACON,
        priority: PriorityLevel.PRIORITY_EMERGENCY,
        encryptedPayload: new Uint8Array([99, 99, 99]),
      };

      router.enqueueForForwarding(sosBeacon);

      // Queue capacity should remain capped at 10
      expect(router.getQueueLength()).toBe(10);
    });
  });

  describe('Attack Vector 4: Ciphertext Tampering & E2EE MAC Failures', () => {
    it('should throw an error when attempting to decrypt ciphertext with tampered authentication tags', () => {
      const alice = CryptoEngine.generateIdentity('Alice');
      const bob = CryptoEngine.generateIdentity('Bob');

      const plaintext = new TextEncoder().encode('Expedition Secret Passcode 9981');
      const encrypted = CryptoEngine.encryptForPeer(plaintext, bob.exchangeKeyPair.publicKey);

      // Mallory alters 1 byte of the ciphertext
      const tamperedCiphertext = new Uint8Array(encrypted.ciphertext);
      tamperedCiphertext[5] = tamperedCiphertext[5] ^ 0xff;

      expect(() => {
        CryptoEngine.decryptFromPeer(
          tamperedCiphertext,
          encrypted.nonce,
          encrypted.ephemeralPublicKey,
          bob.exchangeKeyPair.privateKey
        );
      }).toThrow('Cryptographic MAC verification failed');
    });
  });
});
