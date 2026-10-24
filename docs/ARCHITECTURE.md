# NOMAD LINK Architecture & System Design
**Tagline:** No Signal. No Limits.

## 1. System Overview
NOMAD LINK is an offline-first peer-to-peer communication and convoy coordination platform engineered for mountain expeditions, off-grid exploration, and disaster response.

### Architectural Principles
- **Zero Internet Requirement:** Core communication works entirely over device-to-device wireless links.
- **Store-and-Forward DTN:** Messages are preserved in bounded persistent storage and routed opportunistically as peers encounter one another.
- **End-to-End Cryptography:** 1-to-1 messages are encrypted using X25519 authenticated key exchange. Relays route envelopes blindly without plaintext exposure.
- **Honest Delivery States:** Explicitly differentiates between:
  1. `ACCEPTED_LOCALLY`
  2. `QUEUED_LOCALLY`
  3. `FORWARDED_TO_RELAY` (with hop count)
  4. `DELIVERED_TO_DESTINATION`
  5. `READ_BY_RECIPIENT`

---

## 2. Layer Architecture
```
+--------------------------------------------------------+
|                   Presentation Layer                   |
| (Tactical Dark UI: Home, Chat, Mesh Radar, SOS, Convoy)|
+--------------------------------------------------------+
                           |
+--------------------------------------------------------+
|                   Application Layer                    |
| (NomadContext, State Machine, Use-Case Orchestration)  |
+--------------------------------------------------------+
                           |
+--------------------------------------------------------+
|                     Domain Layer                       |
|   (Identity, Peers, Messages, Waypoints, Telemetry)    |
+--------------------------------------------------------+
                           |
+--------------------------------------------------------+
|                 Infrastructure Layer                   |
| - BoundedMeshRouter (Store & Forward, De-duplication)  |
| - CryptoEngine (Ed25519, X25519, HKDF, ChaCha20/GCM)   |
| - DeadReckoningEngine (Kalman filter, sensor fusion)   |
| - Local SQLite Database & Migrations                   |
+--------------------------------------------------------+
                           |
+--------------------------------------------------------+
|              Android Native Kotlin Subsystem           |
| - NomadBleModule (Advertising & Scanning)              |
| - NomadWifiDirectModule (High-bandwidth P2P sockets)   |
| - NomadSensorModule (Accelerometer, Gyro, Compass)     |
| - NomadForegroundService (Continuous background relay) |
| - NomadNativeBridgeModule (Android Keystore hardware)  |
+--------------------------------------------------------+
```

---

## 3. Threat Model & Security Controls
- **Relay Eavesdropping:** Prevented via X25519 ECDH + authenticated encryption. Intermediate relays only read envelope routing metadata (TTL, message ID, hop limits).
- **Message Tampering:** Prevented via Ed25519 digital signatures and MAC authentication tags.
- **Replay Attacks:** Mitigated with message ID deduplication cache and expiry timestamps.
- **Denial-of-Service / Storage Exhaustion:** Bounded queues (e.g. 200 envelopes max) with priority-based eviction (dropping expired/normal priority items first and preserving high-priority SOS beacons).
- **Hardware Protection:** Cryptographic keys protected in Android Keystore with AES-256-GCM.
