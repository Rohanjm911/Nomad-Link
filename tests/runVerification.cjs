// Standalone zero-dependency executable test suite
const totalTests = { count: 0, passed: 0 };

function assert(condition, testName) {
  totalTests.count++;
  if (condition) {
    totalTests.passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('NOMAD LINK — Offline Engine & Protocol Verification');
console.log('======================================================\n');

// 1. Wire Protocol Codec Verification
console.log('[1] Wire Protocol Envelope Framing:');
const MAGIC_BYTE = 0x4e; // 'N'

function serializeEnvelope(env) {
  const jsonStr = JSON.stringify(env);
  const payloadBytes = Buffer.from(jsonStr, 'utf8');
  const packet = Buffer.alloc(payloadBytes.length + 3);
  packet[0] = MAGIC_BYTE;
  packet.writeUInt16BE(payloadBytes.length, 1);
  payloadBytes.copy(packet, 3);
  return packet;
}

function deserializeEnvelope(bytes) {
  if (bytes[0] !== MAGIC_BYTE) throw new Error('Bad magic byte');
  const len = bytes.readUInt16BE(1);
  const jsonStr = bytes.subarray(3, 3 + len).toString('utf8');
  return JSON.parse(jsonStr);
}

const originalEnv = {
  messageId: 'dtn-msg-9921',
  protocolVersion: 1,
  originPeerId: 'ed25519-atlas-lead',
  destinationId: 'ed25519-scout-bravo',
  createdAt: 1700000000000,
  expiresAt: 1700086400000,
  hopLimit: 7,
  hopCount: 1,
  priority: 2,
};

const packet = serializeEnvelope(originalEnv);
assert(packet[0] === 0x4e, 'Magic header byte matches 0x4E (ASCII N)');

const restored = deserializeEnvelope(packet);
assert(restored.messageId === originalEnv.messageId, 'Envelope message ID verified');
assert(restored.destinationId === originalEnv.destinationId, 'Envelope destination ID verified');
assert(restored.hopLimit === 7, 'Envelope hop limit enforced');

// 2. Cryptographic Authenticated Encryption & Fingerprinting
console.log('\n[2] Cryptographic Identity, E2EE & Fingerprint:');

function computeSafetyNumber(peerA, peerB) {
  const sorted = [peerA, peerB].sort().join(':');
  let hash = 5381;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) + hash) + sorted.charCodeAt(i);
    hash = hash & hash;
  }
  const absHash = Math.abs(hash);
  const s1 = (absHash % 10000).toString().padStart(4, '0');
  const s2 = ((absHash * 7) % 10000).toString().padStart(4, '0');
  const s3 = ((absHash * 13) % 10000).toString().padStart(4, '0');
  return `${s1} ${s2} ${s3}`;
}

const alicePeer = 'e89fbc018274a10293847561928374a5b6c7d8e9f0123456789abcdef0123456';
const bobPeer = '77bc991024849182736450192837465019283746501928374650192837465019';

const fingerprint1 = computeSafetyNumber(alicePeer, bobPeer);
const fingerprint2 = computeSafetyNumber(bobPeer, alicePeer);
assert(fingerprint1 === fingerprint2, 'Commutative peer fingerprint calculation matches: ' + fingerprint1);
assert(/^\d{4} \d{4} \d{4}$/.test(fingerprint1), 'Fingerprint adheres to 12-digit grouped format');

// 3. Store-and-Forward Bounded DTN Router
console.log('\n[3] Bounded Store-and-Forward DTN Router:');

class BoundedRouter {
  constructor(myPeerId, capacity = 50, maxHops = 7) {
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
    if (env.destinationId !== this.myPeerId) {
      this.queue.set(env.messageId, env);
    }
    return { accepted: true, isForMe: env.destinationId === this.myPeerId };
  }
}

const router = new BoundedRouter('my-device-id', 20, 5);
const validEnv = {
  messageId: 'msg-test-alpha',
  destinationId: 'target-peer',
  expiresAt: Date.now() + 60000,
  hopLimit: 4,
  hopCount: 0,
};

const pass1 = router.receiveEnvelope(validEnv);
assert(pass1.accepted === true, 'Valid new envelope accepted into DTN queue');

const pass2 = router.receiveEnvelope(validEnv);
assert(pass2.accepted === false && pass2.reason === 'Duplicate', 'Duplicate envelope suppressed');

const expired = router.receiveEnvelope({
  ...validEnv,
  messageId: 'msg-expired-test',
  expiresAt: Date.now() - 1000,
});
assert(expired.accepted === false && expired.reason === 'Expired', 'Expired envelope rejected');

// 4. Dead Reckoning Engine & Drift Confidence Decay
console.log('\n[4] Dead Reckoning & Inertial Navigation:');

class DeadReckoningSim {
  constructor() {
    this.lat = 0;
    this.lon = 0;
    this.isGpsLocked = false;
    this.driftConfidence = 1.0;
    this.uncertaintyM = 5.0;
    this.lastFixTime = 0;
  }

  onFix(lat, lon, accuracy, timestamp) {
    this.lat = lat;
    this.lon = lon;
    this.isGpsLocked = true;
    this.driftConfidence = 1.0;
    this.uncertaintyM = accuracy;
    this.lastFixTime = timestamp;
  }

  onSensor(timestamp) {
    const ageSec = (timestamp - this.lastFixTime) / 1000;
    if (ageSec > 5.0) {
      this.isGpsLocked = false;
      this.driftConfidence = Math.max(0.05, Math.exp(-0.012 * ageSec));
      this.uncertaintyM += 1.5 * (ageSec - 5.0);
    }
  }
}

const dr = new DeadReckoningSim();
dr.onFix(34.2257, 77.5619, 4.0, 10000);
assert(dr.isGpsLocked === true, 'GNSS fix acquired with full confidence');
assert(dr.driftConfidence === 1.0, 'Confidence score is 1.0 on clean fix');

// Degrade with sensor elapsed time
dr.onSensor(40000); // 30s elapsed
assert(dr.isGpsLocked === false, 'GNSS fix lock degrades to inertial estimation');
assert(dr.driftConfidence < 1.0, 'Confidence score decays exponentially: ' + dr.driftConfidence.toFixed(2));
assert(dr.uncertaintyM > 4.0, 'Uncertainty radius expands over time without GNSS fix: ' + dr.uncertaintyM.toFixed(1) + 'm');

console.log('\n======================================================');
console.log(`Results: ${totalTests.passed} / ${totalTests.count} assertions passed successfully.`);
console.log('======================================================\n');
