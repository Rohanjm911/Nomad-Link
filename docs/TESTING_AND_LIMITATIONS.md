# NOMAD LINK Physical Device Testing Guide & Known Limitations

---

## 1. Physical Device Testing Matrix

Because hardware radios (BLE chipsets, Wi-Fi antennas, and GNSS receivers) behave differently across devices, multi-hop mesh verification requires physical testing.

### Test Case 1: Two-Device Direct Discovery & E2EE Message Exchange
1. Take Device A (e.g. Pixel 8) and Device B (e.g. Galaxy S23).
2. Place both devices into **Airplane Mode** and re-enable Bluetooth and Location.
3. Open NOMAD LINK on both devices.
4. Verify both devices appear in `Mesh Radar` within 5–15 seconds.
5. Tap **Verify & Trust** on Device A, match the 12-digit safety number with Device B.
6. Send a direct message from Device A.
7. **Expected Result:** Message transitions from `QUEUED_LOCALLY` $\rightarrow$ `DELIVERED_TO_DESTINATION` on Device A, and appears decrypted on Device B.

### Test Case 2: Three-Device Multi-Hop Store-and-Forward Relay
1. Position Device A (Base Camp) out of radio range from Device C (High Camp) (>150m or obstructed terrain).
2. Device A composes a message destined for Device C. Message enters `QUEUED_LOCALLY`.
3. Device B (Mobile Scout) walks within range of Device A.
4. Device B's `BoundedMeshRouter` receives the envelope. Delivery indicator on Device A updates to `FORWARDED_TO_RELAY (Hop 1)`.
5. Device B travels out of range of Device A and walks toward Device C.
6. Once Device B establishes BLE link with Device C, envelope is delivered.
7. Device C displays message; reverse route transmits delivery receipt back through Device B when paths re-cross.

### Test Case 3: GPS Loss & Inertial Dead-Reckoning
1. Enter a mountain pass tunnel or underground parking facility where GPS fixes drop.
2. Observe `HomeScreen` and `ConvoyScreen`.
3. **Expected Result:**
   - Geolocation status shifts from `GNSS 3D LOCK` to `INERTIAL ESTIMATE`.
   - Heading tracks device orientation using fused compass/gyroscope.
   - Fix Confidence begins exponential decay.
   - Uncertainty radius dynamically increases (e.g. from $\pm 5\text{m}$ to $\pm 35\text{m}$).

---

## 2. Known Limitations & Honest Disclosures

1. **Not a Satellite Messenger Replacement:**
   - NOMAD LINK operates over terrestrial UHF/2.4 GHz consumer frequencies (BLE and Wi-Fi Direct).
   - Maximum point-to-point range in open line-of-sight is approximately 30m–100m for BLE, and up to 150m for Wi-Fi Direct.
   - It cannot reach external emergency services (SAR / 911) unless an expedition member reaches an area with cellular or satellite uplink.

2. **Opportunistic Delay-Tolerant Delivery:**
   - In sparse networks with few nodes, message delivery latency depends on physical node mobility (data mules).
   - Delivery is not guaranteed if no physical path or courier ever connects the partition.

3. **Android Background Radio Limitations:**
   - Some aggressive OEM power managers may pause BLE scanning after extended screen-off periods despite active foreground services. Users must disable aggressive battery optimization for NOMAD LINK.
