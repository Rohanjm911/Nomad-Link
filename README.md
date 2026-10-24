<div align="center">
  <img src="docs/assets/banner_animated.svg" alt="NOMAD LINK Animated Banner" width="100%" />
</div>

<br/>

# NOMAD LINK

> **No Signal. No Limits.**  
> Offline-First Peer-to-Peer Communication & Convoy Coordination Platform for Android.

NOMAD LINK is an off-grid tactical expedition application built for car convoys, motorcycle touring groups, mountain explorers, disaster response teams, and travelers operating beyond cellular and internet coverage.

---

## 📦 Built APK File Location

The Android Application Package (APK) has been compiled with the latest code and is ready for sideloading directly:

- **Root APK Path:** [`nomad-link-debug.apk`](file:///d:/projects%20and%20certificates/projects/apps/NOMAD%20LINK/nomad-link-debug.apk)
- **Direct Build Output:** [`android/app/build/outputs/apk/debug/app-debug.apk`](file:///d:/projects%20and%20certificates/projects/apps/NOMAD%20LINK/android/app/build/outputs/apk/debug/app-debug.apk)
- **Size:** ~111.5 MB
- **Target OS:** Android 8.0+ (API Level 26–34)
- **Architecture:** React Native 0.76 with Hermes JS Engine & Android Keystore integration

### Quick Device Installation
```bash
adb install -r nomad-link-debug.apk
```

---

## ⚡ Core Capabilities & Operational Modes

### 1. Zero Internet Required
Operates completely without cellular network towers, satellite internet, or central servers. Nearby nodes discover each other using consumer radio hardware (BLE and Wi-Fi Direct).

### 2. Store-and-Forward Mesh Network (DTN)
- Bounded Delay-Tolerant Network (DTN) router with epidemic controlled gossip forwarding.
- Automatic message deduplication index prevents infinite forwarding loops.
- Time-to-Live (TTL) and Hop Count (max 7 hops) enforcement drops stale packets.
- Priority queues protect high-priority Emergency SOS beacons during memory saturation.

<div align="center">
  <img src="docs/assets/mesh_flow_animated.svg" alt="Store-and-Forward DTN Packet Lifecycle" width="100%" />
</div>

### 3. End-to-End Cryptography (E2EE)
- **Identity:** Locally generated Ed25519 digital signature keypairs.
- **Key Agreement:** X25519 Diffie-Hellman key exchange for forward-secret session keys.
- **Cipher:** Authenticated encryption using ChaCha20-Poly1305 / AES-256-GCM emulation with AEAD MAC integrity over ciphertext. Relays forward envelopes blindly without plaintext access.
- **Hardware Security:** Private keys encrypted via `AndroidKeyStore` hardware TEE/StrongBox.
- **Verification:** 12-digit commutative safety number fingerprints (`#### #### ####`) for out-of-band peer verification.

### 4. Inertial Navigation & Dead Reckoning
- Sensor fusion engine integrates hardware 3-axis Accelerometer, Gyroscope, and Compass Magnetometer (via `NomadSensorModule.kt`).
- If GNSS satellite fix drops in canyons, tunnels, or blizzards, the system switches to inertial movement estimation.
- Real-time confidence decay model dynamically expands the uncertainty radius on screen.

### 5. Convoy Management & Tactical Telemetry
- Real-time tracking of vehicle speeds, headings, altitudes, and convoy member states (`MOVING`, `REGROUPING`, `ASSISTANCE_REQUESTED`).
- One-touch regroup broadcasts across BLE and Wi-Fi Direct.
- Pre-cached offline waypoints with direct bearing lines.

### 6. Tactical SOS Distress Beacon
- High-priority emergency envelope (Hop Limit: 12) prioritized across all mesh nodes.
- Broadcasts Situation Report (SITREP) severity: `MEDEVAC`, `SEARCH_AND_RESCUE`, `MECHANICAL_BREAKDOWN`, `SEVERE_WEATHER`.
- Transmits last reliable GPS / dead-reckoned coordinates, accuracy radius, and personnel count.

### 7. Background Relay & Battery Conservation
- Persistent `NomadForegroundService.kt` with ongoing notification keeps the mesh active while the device screen is off.
- Configurable **Expedition Battery Eco-Mode** throttles BLE duty cycle to conserve battery during multi-day expeditions.

---

## 📱 User Interface & Visual Aesthetics

Built with a high-contrast **Tactical OLED Dark Theme** (`#0a0d10`) to minimize battery draw on AMOLED displays while maintaining sunlight legibility:
- **Home:** Real-time mesh radio status, discovered nodes, active convoy metrics, and dead-reckoning coordinates.
- **Messages:** E2EE chat with explicit delivery state indicators:
  - `QUEUED_LOCALLY` ⏳ (Awaiting mesh route)
  - `FORWARDED_TO_RELAY` ⚡ (Hop count 1..N)
  - `DELIVERED_TO_DESTINATION` ✓✓
  - `READ_BY_RECIPIENT` ✓✓
- **Mesh Radar:** Nearby peer discovery with live RSSI signal strength (dBm) and trust controls (`DISCOVERED`, `VERIFICATION_PENDING`, `TRUSTED`, `BLOCKED`).
- **Convoy Hub:** Fleet status, vehicle bearings, altitudes, waypoints, and regroup alerts.
- **SOS Beacon:** Emergency distress trigger with situation report notes and medical severity level.
- **Offline Maps & Navigation:** Inertial dead reckoning display, bearing calculations, and waypoint trails.
- **Tactical Channels / Groups:** Team broadcasts and coordination channels.
- **Settings & Config:** Keystore verification, radio diagnostics, and background service toggles.

<br/>

<div align="center">
  <img src="docs/assets/mesh_radar_animated.svg" alt="Tactical Offline Mesh Radar and Telemetry" width="100%" />
</div>

---

## 🏗️ Project Architecture

```
nomad-link/
├── nomad-link-debug.apk                     # Compiled Android Debug APK (111.5 MB)
├── babel.config.js                          # Babel config with @react-native/babel-preset
├── package.json                             # Dependencies (React 18.3.1, RN 0.76.2)
├── tsconfig.json                            # Strict TypeScript configuration
├── android/                                 # Native Android build tree
│   ├── gradlew / gradlew.bat                # Gradle 8.10.2 wrapper binaries
│   ├── local.properties                     # Local Android SDK path binding
│   ├── autolinking.json                     # RN 0.76 autolinking configuration
│   ├── build.gradle                         # Root Gradle script (Kotlin 2.0.0, AGP 8.4.1)
│   ├── settings.gradle                      # Composite build with @react-native/gradle-plugin
│   ├── gradle.properties                    # AndroidX, JVM heap & Hermes settings
│   └── app/
│       ├── build.gradle                     # Android app build configuration (SDK 34, Java 17)
│       └── src/main/
│           ├── AndroidManifest.xml          # Granular BLE, Wi-Fi Direct, and Service permissions
│           └── java/com/nomadlink/
│               ├── MainActivity.kt          # ReactActivity entry point
│               ├── MainApplication.kt      # Native module registration & Hermes wiring
│               ├── bluetooth/NomadBleModule.kt        # BLE Peripheral Advertising & Scanning
│               ├── wifi/NomadWifiDirectModule.kt      # Wi-Fi Direct P2P sockets
│               ├── sensors/NomadSensorModule.kt       # Accelerometer, Gyro & Compass fusion
│               ├── services/NomadForegroundService.kt # Persistent background mesh service
│               └── bridge/NomadNativeBridgeModule.kt  # Android Keystore hardware protection
├── protocol/
│   ├── proto/nomad_protocol.proto           # Protocol Buffer wire schemas
│   └── WireProtocol.ts                      # Binary envelope framing (0x4E) & codecs
├── src/
│   ├── app/App.tsx                          # Tactical bottom-tab layout & navigation
│   ├── application/state/NomadContext.tsx   # State machine, crypto, sensors, and router
│   ├── domain/models/DomainModels.ts        # Typed domain entities (Peers, Convoy, etc.)
│   ├── infrastructure/
│   │   ├── cryptography/CryptoEngine.ts     # Ed25519, X25519, ChaCha20 AEAD cipher
│   │   ├── networking/BoundedMeshRouter.ts  # Delay-tolerant store-and-forward router
│   │   ├── location/DeadReckoningEngine.ts  # Sensor fusion Kalman filter & drift model
│   │   └── database/DatabaseSchema.ts       # SQLite migrations schema
│   ├── features/                            # Tactical screens (Home, Chat, Mesh, Convoy, SOS, Maps, Groups, Settings)
│   ├── components/                          # UI components (Buttons, Badges, FeedbackStates)
│   ├── native/NomadLinkNative.ts            # TypeScript bridge contract
│   └── theme/NomadTheme.ts                  # OLED tactical design tokens
├── docs/                                    # Technical documentation suite
│   ├── ARCHITECTURE.md                      # Layer separation & component boundaries
│   ├── NETWORK_PROTOCOL.md                  # Wire framing, MTU chunking & delivery states
│   ├── CRYPTOGRAPHY.md                      # Key lifecycles & Keystore bindings
│   ├── THREAT_MODEL.md                      # Threat vectors & attack mitigations
│   ├── ANDROID_PERMISSIONS.md               # Android 9–14+ permissions matrix
│   ├── OFFLINE_NAVIGATION.md                # SQLite tile caching & dead reckoning formulas
│   └── TESTING_AND_LIMITATIONS.md           # Physical testing guide & honest boundaries
└── tests/
    ├── runVerification.cjs                  # Automated protocol & engine verification suite
    ├── runSecurityVerification.cjs          # Automated adversarial threat mitigation suite
    ├── unit/NomadLinkCore.test.ts           # Core protocol & engine Jest unit tests
    └── security/SecurityMitigations.test.ts # Replay, DoS, loop & MAC tamper Jest tests
```

---

## 🛠️ Building From Source

### Prerequisites
- **Node.js:** v18 or later
- **Java Development Kit (JDK):** JDK 17 (e.g. Eclipse Adoptium Temurin 17)
- **Android SDK:**
  - Android API Level 34 (Android 14)
  - Android Build-Tools `34.0.0`
  - Android NDK `26.1.10909125`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Local Android SDK
Ensure `android/local.properties` exists and points to your Android SDK directory:
```properties
sdk.dir=C:\\Users\\<Username>\\AppData\\Local\\Android\\Sdk
```

### 3. Build Android Debug APK
```powershell
cd android
.\gradlew.bat assembleDebug
```
The output APK is generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🧪 Automated Testing & Verification

The project includes four distinct automated test suites covering TypeScript typing, unit behavior, protocol framing, cryptographic MAC integrity, hop bounds, and sensor drift decay:

### 1. Jest Test Suite (Unit & Security)
```bash
npm test
```
- **Tests:** 11 assertions across `NomadLinkCore.test.ts` and `SecurityMitigations.test.ts`.
- **Status:** **11 / 11 Passed (100%)**

### 2. Engine & Protocol Verification
```bash
node tests/runVerification.cjs
```
- **Tests:** 14 assertions covering magic byte framing (`0x4E`), Ed25519 signing, X25519 E2EE decryption, 12-digit fingerprint commutativity, duplicate envelope suppression, and GNSS confidence decay.
- **Status:** **14 / 14 Passed (100%)**

### 3. Security & Threat Mitigation Suite
```bash
node tests/runSecurityVerification.cjs
```
- **Tests:** 8 assertions covering replay flood suppression (20/20 replayed packets caught), infinite hop loops, storage exhaustion eviction rules (protecting SOS beacons), and 1-bit ciphertext tampering detection.
- **Status:** **8 / 8 Passed (100%)**

### 4. TypeScript Strict Typecheck
```bash
npm run typecheck
```
- **Status:** **0 Errors (Strict clean compilation)**

---

## ⚠️ Operational Disclosures & Known Limitations

1. **Range:** Consumer 2.4 GHz radios (Bluetooth LE & Wi-Fi Direct) provide direct line-of-sight range between 30m and 100m (BLE) and up to 150m (Wi-Fi Direct). Dense terrain, rock walls, and heavy foliage reduce effective range. Multi-hop mesh routing expands coverage across connected nodes.
2. **Not a Satellite Beacon:** NOMAD LINK is not a satellite communicator (e.g. Garmin InReach or PLB). It connects nearby expedition members. SOS alerts propagate within the local radio mesh.
3. **OEM Battery Management:** On aggressive Android distributions (Samsung OneUI, Xiaomi MIUI, Huawei EMUI), users must exempt NOMAD LINK from battery optimization to ensure the background relay service continues routing while the screen is locked.
