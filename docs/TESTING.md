# NOMAD LINK — Verification & Testing Guide

---

## 1. Automated Test Suite

### Running Unit & Cryptographic Tests
```bash
npm test
```
- **NomadLinkCore.test.ts:** Validates wire serialization, 0x4E framing, DTN routing queues, hop-count enforcement, and Kalman filter dead reckoning.
- **SecurityMitigations.test.ts:** Validates replay flood suppression, expired TTL rejections, storage exhaustion protections, emergency priority eviction immunity, and AEAD MAC tampering detection.

### Running Protocol & Security Runners
```bash
npm run test:verify
```
Executes `tests/runVerification.cjs` (14 assertions) and `tests/runSecurityVerification.cjs` (8 mitigations) with zero external test runners.

---

## 2. Physical Multi-Device Hardware Testing Procedure

### Requirements
- 3 physical Android smartphones running Android 9+ (API 28+).
- All devices in Airplane Mode with Bluetooth & Location enabled.

### Procedure
1. **Device A (Base Camp):** Compose a message destined for Device C. Note that Device C is out of radio range (>100m).
2. **Observe Queue:** Message status on Device A displays `QUEUED_LOCALLY`.
3. **Device B (Courier):** Walk Device B within 20m of Device A.
4. **Relay Hop:** Device B discovers Device A via BLE advertising. The message envelope is securely forwarded. Device A's status updates to `FORWARDED_TO_RELAY (Hop 1)`.
5. **Physical Transit:** Device B walks toward Device C, leaving Device A's range.
6. **Delivery:** Device B establishes P2P connection with Device C. The envelope is delivered and decrypted. Device C verifies MAC and displays message.
7. **Receipt Loop:** When Device B returns to Device A, cryptographic delivery receipt is forwarded, promoting Device A's status to `DELIVERED_TO_DESTINATION`.
