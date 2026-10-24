# NOMAD LINK Threat Model & Security Architecture

**Security Document Version:** 1.0  
**Evaluator Role:** Cybersecurity Engineer & Systems Architect

---

## 1. System Assumptions & Threat Environment

NOMAD LINK operates in an **inherently untrusted RF mesh environment**. Unlike traditional networks protected by firewalls, TLS proxies, and cloud authentication servers:
1. **Physical Exposure:** Any device in 2.4 GHz RF range can listen to BLE advertisements and Wi-Fi Direct beacons.
2. **Untrusted Relays:** Intermediate nodes may be rogue, modified, or adversarial.
3. **No Central Certificate Authority:** Internet-based OCSP and CRL revocation lookups are impossible during expeditions.
4. **Denial of Service Risks:** Malicious nodes can flood envelopes, forge high-hop counts, or attempt to exhaust node storage.

---

## 2. Threat Vector Mitigation Matrix

| Threat Vector | Attack Description | NOMAD LINK Architectural Countermeasure | Verification Status |
|---|---|---|---|
| **Message Tampering** | Adversary intercepts and alters route metadata or message content. | **Ed25519 & Authenticated Tag (Poly1305/GCM):** Any bit flip fails MAC validation and is dropped immediately. | **Verified** (`runSecurityVerification.cjs`) |
| **Replay Flooding** | Attacker captures a valid packet and re-transmits it hundreds of times to drain battery/storage. | **In-Memory & SQLite Deduplication Index:** Identical `message_id`s are recognized and suppressed with zero relay. | **Verified** (`runSecurityVerification.cjs`) |
| **Forwarding Loops & Storms** | Envelopes cycle infinitely between adjacent nodes. | **Hop Count & TTL Bounds:** Every hop decrements `hop_limit` and increments `hop_count`. Max hops strictly capped at 7. | **Verified** (`runSecurityVerification.cjs`) |
| **Storage Exhaustion (DoS)** | Rogue node floods garbage envelopes to evict valid convoy traffic. | **Bounded Queue & Priority Eviction:** Storage capacity is hard-bounded. Lowest-priority/oldest messages are evicted first; Emergency SOS beacons are **never evicted**. | **Verified** (`runSecurityVerification.cjs`) |
| **Relay Plaintext Snooping** | An intermediate device reads private 1-to-1 chats. | **End-to-End Encryption (E2EE):** Relays only inspect the outer envelope; payload is encrypted with recipient's X25519 public key. | **Verified** (`runVerification.cjs`) |
| **Impersonation / MITM** | Attacker claims an alias like "Expedition Leader". | **Cryptographic Identities & Safety Numbers:** Device identities are bound to Ed25519 public keys. Commutative 12-digit fingerprints (`#### #### ####`) verify authenticity out-of-band. | **Verified** (`runVerification.cjs`) |
| **Hardware Theft** | Lost or captured phone inspected for private keys. | **Android Keystore Hardware TEE/StrongBox:** Long-term identity keys are encrypted with Keystore AES-GCM keys. | **Verified** (`NomadNativeBridgeModule.kt`) |
| **Battery Drain Attacks** | Continuous connection requests to drain transceiver power. | **Adaptive Duty Cycling & Eco-Mode:** BLE discovery intervals throttle dynamically under low-battery conditions. | **Verified** (`NomadBleModule.kt`) |

---

## 3. Residual Risks & Known Non-Mitigations

1. **Selective Dropping (Blackhole Attack):** A malicious relay can accept an envelope and silently discard it instead of forwarding. *Mitigation:* Multipath epidemic forwarding ensures envelopes propagate through alternative nodes when multiple paths exist.
2. **RF Jamming:** High-powered physical RF jamming at 2.4 GHz will disrupt consumer BLE and Wi-Fi transceivers. *Mitigation:* Physical distance separation and delay-tolerant queuing until jamming zone is exited.
3. **Traffic Analysis:** An attacker can observe when two devices are exchanging packets, even if payloads are encrypted. *Mitigation:* Ephemeral discovery identifiers and rotating BLE MAC addresses on supported hardware.
