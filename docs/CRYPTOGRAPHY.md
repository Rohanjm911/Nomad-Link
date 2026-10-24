# NOMAD LINK Cryptography & Key Lifecycle

---

## 1. Cryptographic Primitive Selection

NOMAD LINK avoids rolling custom cryptography, relying on vetted modern primitives:

| Function | Algorithm / Primitive | Purpose |
|---|---|---|
| **Identity Authentication** | Ed25519 (EdDSA) | High-speed, deterministic signatures resisting side-channel timing attacks. |
| **Key Agreement** | X25519 (Curve25519 ECDH) | Forward secrecy key agreement for 1-to-1 secure channels. |
| **Key Derivation** | HKDF-SHA256 | Derives symmetric encryption keys and authentication tags from shared secrets. |
| **Authenticated Encryption** | ChaCha20-Poly1305 / AES-256-GCM | Authenticated cipher preventing plaintext disclosure and ciphertext manipulation. |
| **Entropy Source** | Android `SecureRandom` | Cryptographically secure pseudo-random number generator (CSPRNG). |

---

## 2. Key Lifecycle & Storage

### 2.1 Identity Generation
During initial setup (or onboarding):
1. A 32-byte private seed is sampled from the system CSPRNG.
2. The Ed25519 signing keypair is derived. The public key forms the persistent `peerId`.
3. A separate X25519 keypair is generated for Diffie-Hellman key exchange.

### 2.2 Keystore Hardware Backing
On Android devices with TEE (Trusted Execution Environment) or StrongBox Keymaster:
1. An AES-256 key is created inside `AndroidKeyStore` with `PURPOSE_ENCRYPT | PURPOSE_DECRYPT` and `BLOCK_MODE_GCM`.
2. The device's private identity keys are encrypted with this hardware-backed key before writing to disk.
3. Plaintext private keys are never stored in `SharedPreferences` or database tables.

---

## 3. End-to-End Encryption (E2EE) Flow

When User A sends a private message to User B:
```
1. Ephemeral Keypair (ephPriv, ephPub) generated for User A.
2. SharedSecret = X25519(ephPriv, BobExchangePubKey)
3. DerivedKey = HKDF(SharedSecret, salt=nonce, info="NomadLink-E2EE-v1")
4. Ciphertext, Tag = ChaCha20-Poly1305(DerivedKey, Nonce, MessagePlaintext)
5. Envelope packaged with: ephPub, Nonce, Ciphertext+Tag
6. User A signs Envelope header with Ed25519 private key.
```

When User B receives the envelope:
```
1. User B verifies User A's Ed25519 signature over envelope metadata.
2. SharedSecret = X25519(BobExchangePrivKey, ephPub)
3. DerivedKey = HKDF(SharedSecret, salt=nonce, info="NomadLink-E2EE-v1")
4. Plaintext = Decrypt-ChaCha20-Poly1305(DerivedKey, Nonce, Ciphertext+Tag)
5. If authentication tag fails, message is rejected and flagged as tampered.
```

---

## 4. Peer Verification & Safety Numbers

To prevent Man-in-the-Middle (MITM) attacks during initial discovery:
- Devices compute a deterministic 12-digit safety number:
  $$\text{SafetyNumber} = \text{Hash}(\text{Sort}(\text{PeerA}_{\text{pub}}, \text{PeerB}_{\text{pub}})) \pmod{10^{12}}$$
- Formatted into three 4-digit blocks (e.g. `4821 9043 1184`).
- Users compare these numbers verbally or scan a verification QR code.
- Trust states progress: `DISCOVERED` $\rightarrow$ `VERIFICATION_PENDING` $\rightarrow$ `TRUSTED`.
