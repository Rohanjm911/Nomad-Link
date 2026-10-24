# NOMAD LINK Network & Wire Protocol Specification

**Document Version:** 1.0  
**Protocol Version:** 1 (Binary Magic Byte: `0x4E` / ASCII `'N'`)

---

## 1. Design Philosophy

NOMAD LINK is designed for **Delay-Tolerant, Partition-Prone Ad-Hoc Networks (DTN)**. Conventional mobile messaging protocols (HTTP/REST, WebSockets, MQTT) assume continuous infrastructure and centralized brokers. In mountain expeditions, desert trails, and disaster regions, devices encounter each other opportunistically, exchange messages, and part ways.

### Key Tenets
1. **Zero Central Broker:** No servers, no STUN/TURN, no internet reliance for core functions.
2. **Blind Relay Privacy:** Intermediate hops route messages using only envelope metadata; encrypted payloads are completely opaque to forwarders.
3. **Loop & Storm Prevention:** Bounded hop count, strict deduplication, time-to-live expiration, and per-peer queue quotas.
4. **Honest Delivery Semantics:** The system never indicates "Delivered" when an envelope is merely forwarded to an intermediate node.

---

## 2. Protocol Buffer Schemas

Wire schemas are defined in [`protocol/proto/nomad_protocol.proto`](file:///d:/projects%20and%20certificates/projects/apps/NOMAD%20LINK/protocol/proto/nomad_protocol.proto).

### 2.1 The Message Envelope (`MessageEnvelope`)

Every data packet transmitted across radio (BLE or Wi-Fi Direct) is encapsulated in an envelope:

| Field | Type | Description |
|---|---|---|
| `message_id` | `string` | Unique envelope ID (UUIDv4 or SHA-256 hash). |
| `protocol_version` | `uint32` | Wire protocol version (`1`). |
| `origin_peer_id` | `string` | Ed25519 public key hex of the originating device. |
| `destination_id` | `string` | Ed25519 public key hex of recipient, Group ID, or `'*'` for broadcast. |
| `created_at` | `int64` | Unix timestamp (ms) of creation. |
| `expires_at` | `int64` | Unix timestamp (ms) after which relays must drop the packet. |
| `hop_limit` | `uint32` | Max remaining hops allowed (decremented on each forwarding relay). |
| `hop_count` | `uint32` | Total hops traversed so far (incremented on each relay). |
| `payload_type` | `PayloadType` | Enum indicating payload type (DirectMessage, Telemetry, SOS, etc.). |
| `priority` | `PriorityLevel` | `NORMAL` (0), `HIGH` (1), `EMERGENCY` (2). |
| `encrypted_payload` | `bytes` | Authenticated ciphertext or serialized payload bytes. |
| `ephemeral_pubkey` | `bytes` | Ephemeral X25519 public key for E2EE key agreement. |
| `nonce` | `bytes` | 12-byte initialization vector. |
| `sender_signature` | `bytes` | 64-byte Ed25519 signature over envelope metadata and payload. |

---

## 3. Physical Framing & BLE MTU Handling

Bluetooth Low Energy characteristics have a default MTU of 23 bytes (20 payload bytes). With MTU exchange (`requestMtu(517)`), effective payload capacity expands up to 512 bytes.

### Frame Layout:
```
+---------------+-------------------+------------------------+
| Magic (1 Byte)| Length (2 Bytes)  | Serialized UTF-8 JSON  |
|     0x4E      | Big-Endian Uint16 | Protocol Buffer Envelop|
+---------------+-------------------+------------------------+
```

When an envelope exceeds the link MTU, the native BLE transport splits the frame into chunks with a 4-byte chunk header:
`[SeqNum: 1B][TotalChunks: 1B][ChunkData: N bytes]`. The receiver reassembles chunks before passing the envelope to `BoundedMeshRouter`.

---

## 4. Store-and-Forward Routing Strategy

NOMAD LINK utilizes a **Bounded Controlled Gossip & Epidemic Routing** model:

```
[Device A: Ranger]
      │
      │ BLE Advertisement / Scan (Discovered)
      ▼
[Device B: Relay Node]
      │ - Checks Seen Message Cache (dedup)
      │ - Validates expires_at > now
      │ - Validates hop_count < maxHops
      │ - Enqueues in Priority Queue
      │
      │ Traverses 5 km to next camp...
      ▼
[Device C: Expedition Leader]
      │ - Direct delivery achieved
      │ - Dispatches DeliveryReceipt back to mesh
```

### 4.1 Deduplication
The router maintains an in-memory & SQLite-backed `seenMessageIds` index. If an envelope's `message_id` has already been processed or relayed, it is immediately discarded without processing or retransmission.

### 4.2 Queue Quota & Eviction Policy
When the router's queue reaches capacity (e.g. 200 envelopes):
1. Expired envelopes (`expires_at <= now`) are pruned first.
2. Low-priority (`NORMAL`) messages with the oldest `created_at` are evicted.
3. High-priority Emergency SOS beacons (`PRIORITY_EMERGENCY`) are **never evicted** for regular traffic.

---

## 5. Delivery Semantics & State Machine

```
[User Transmits]
      │
      ▼
ACCEPTED_LOCALLY ──► QUEUED_LOCALLY
                          │
                          │ Radio connection to peer
                          ▼
                  FORWARDED_TO_RELAY (Hop count: 1..N)
                          │
                          │ Reaches intended recipient
                          ▼
               DELIVERED_TO_DESTINATION
                          │
                          │ Recipient opens conversation
                          ▼
                 READ_BY_RECIPIENT
```
