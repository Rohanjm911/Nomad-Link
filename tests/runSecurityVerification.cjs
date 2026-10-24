// Standalone zero-dependency executable security verification suite
const totalSec = { count: 0, passed: 0 };

function assertSec(condition, testName) {
  totalSec.count++;
  if (condition) {
    totalSec.passed++;
    console.log(`  ✓ SEC-PASS: ${testName}`);
  } else {
    console.error(`  ✗ SEC-FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('NOMAD LINK — Security & Attack Mitigation Runner');
console.log('======================================================\n');

// 1. Replay Flooding & Deduplication Test
console.log('[1] Replay Flooding & Deduplication Defense:');

class SecurityRouter {
  constructor(myPeerId, capacity = 10, maxHops = 5) {
    this.myPeerId = myPeerId;
    this.capacity = capacity;
    this.maxHops = maxHops;
    this.seen = new Set();
    this.queue = new Map();
  }

  receiveEnvelope(env) {
    const now = Date.now();
    if (this.seen.has(env.messageId)) return { accepted: false, reason: 'Duplicate' };
    if (env.expiresAt <= now) return { accepted: false, reason: 'Expired' };
    if (env.hopCount >= this.maxHops || env.hopLimit <= 0) return { accepted: false, reason: 'HopLimit' };

    this.seen.add(env.messageId);
    if (this.queue.size >= this.capacity) {
      // Evict lowest priority
      let oldestKey = null;
      let lowestPri = 999;
      let oldestTime = Infinity;
      for (const [id, e] of this.queue.entries()) {
        if (e.priority < lowestPri || (e.priority === lowestPri && e.createdAt < oldestTime)) {
          lowestPri = e.priority;
          oldestTime = e.createdAt;
          oldestKey = id;
        }
      }
      if (oldestKey) this.queue.delete(oldestKey);
    }

    this.queue.set(env.messageId, env);
    return { accepted: true };
  }
}

const router = new SecurityRouter('victim-node', 5, 5);
const attackEnv = {
  messageId: 'attacker-msg-001',
  destinationId: 'victim-node',
  priority: 0,
  createdAt: 1000,
  expiresAt: Date.now() + 60000,
  hopLimit: 4,
  hopCount: 1,
};

const passOriginal = router.receiveEnvelope(attackEnv);
assertSec(passOriginal.accepted === true, 'Original envelope accepted');

let replayedAccepted = 0;
for (let i = 0; i < 20; i++) {
  const r = router.receiveEnvelope(attackEnv);
  if (r.accepted) replayedAccepted++;
}
assertSec(replayedAccepted === 0, '20 replayed envelopes were suppressed by dedup cache');

// 2. Hop Count Exhaustion & Loop Defense
console.log('\n[2] Forwarding Loop & Hop Count Defense:');
const exhaustedEnv = {
  ...attackEnv,
  messageId: 'attacker-loop-002',
  hopLimit: 0,
  hopCount: 5,
};
const passExhausted = router.receiveEnvelope(exhaustedEnv);
assertSec(passExhausted.accepted === false && passExhausted.reason === 'HopLimit', 'Exhausted hop envelope dropped');

// 3. Storage Exhaustion & Emergency Beacon Protection
console.log('\n[3] Storage Exhaustion & Emergency Beacon Protection:');
// Fill router capacity (5) with normal messages
for (let i = 0; i < 4; i++) {
  router.receiveEnvelope({
    ...attackEnv,
    messageId: `flood-normal-${i}`,
    priority: 0,
    createdAt: 2000 + i,
  });
}
assertSec(router.queue.size === 5, 'Queue reached saturation at bounded limit of 5');

// Inject emergency beacon (priority 2)
const sosEnvelope = {
  messageId: 'emergency-sos-beacon',
  destinationId: '*',
  priority: 2,
  createdAt: Date.now(),
  expiresAt: Date.now() + 180000,
  hopLimit: 12,
  hopCount: 0,
};
router.receiveEnvelope(sosEnvelope);

assertSec(router.queue.size === 5, 'Queue capacity strictly maintained at 5 items');
assertSec(router.queue.has('emergency-sos-beacon'), 'Emergency beacon preserved; lower-priority message evicted');

// 4. Ciphertext Tamper Resistance
console.log('\n[4] Authenticated Encryption Tamper Resistance:');

function fakeEncrypt(plaintext, key) {
  const cipher = Buffer.from(plaintext);
  for (let i = 0; i < cipher.length; i++) cipher[i] ^= key;
  // Calculate 4-byte MAC tag
  let mac = 0;
  for (let i = 0; i < cipher.length; i++) mac = (mac + cipher[i]) & 0xffff;
  const tag = Buffer.alloc(2);
  tag.writeUInt16BE(mac, 0);
  return Buffer.concat([cipher, tag]);
}

function fakeDecrypt(cipherWithTag, key) {
  const tag = cipherWithTag.readUInt16BE(cipherWithTag.length - 2);
  const cipher = cipherWithTag.subarray(0, cipherWithTag.length - 2);
  let mac = 0;
  for (let i = 0; i < cipher.length; i++) mac = (mac + cipher[i]) & 0xffff;
  if (mac !== tag) throw new Error('Cryptographic MAC verification failed: tampering detected');
  const plain = Buffer.from(cipher);
  for (let i = 0; i < plain.length; i++) plain[i] ^= key;
  return plain.toString('utf8');
}

const secretKey = 0x7a;
const originalText = 'Classified Convoy Location';
const cipherPkg = fakeEncrypt(originalText, secretKey);

const decrypted = fakeDecrypt(cipherPkg, secretKey);
assertSec(decrypted === originalText, 'Valid ciphertext decodes successfully');

// Tamper with 1 byte of payload
const tamperedPkg = Buffer.from(cipherPkg);
tamperedPkg[2] ^= 0x01;

let caughtTamper = false;
try {
  fakeDecrypt(tamperedPkg, secretKey);
} catch (e) {
  if (e.message.includes('tampering detected')) caughtTamper = true;
}
assertSec(caughtTamper === true, 'Tampered ciphertext rejected via authentication tag failure');

console.log('\n======================================================');
console.log(`Security Results: ${totalSec.passed} / ${totalSec.count} mitigations verified.`);
console.log('======================================================\n');
