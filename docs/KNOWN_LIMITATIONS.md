# NOMAD LINK — Known Limitations & Honest Disclosures

> **Principle 10:** No fake functionality, simulated connections presented as real, or misleading delivery indicators.

---

## 1. Radio Range & Propagation Limits
- **Physical Frequencies:** NOMAD LINK operates over standard consumer 2.4 GHz frequencies (Bluetooth Low Energy and Wi-Fi Direct).
- **Line-of-Sight Range:** Open terrain range typically spans 30m–80m for BLE, and up to 150m for Wi-Fi Direct.
- **Topographic Obstacles:** Dense alpine tree cover, granite boulders, vehicle chassis, and ridgelines attenuate 2.4 GHz RF rapidly.
- **Not a Satellite Beacon Replacement:** NOMAD LINK is an off-grid terrestrial ad-hoc platform. It does NOT communicate with Iridium, InReach, or COSPAS-SARSAT emergency satellites. An emergency SOS beacon in NOMAD LINK alerts nearby mesh nodes within radio/relay reach, but cannot reach 911/emergency dispatch without an external gateway.

---

## 2. Opportunistic Delay-Tolerant Routing (DTN)
- **Data Mule Dependent:** In sparse expedition formations, message transit times depend entirely on the physical movement of intermediary nodes (scouts, runners, or vehicles).
- **Partitioned Networks:** If two groups are isolated with no mutual courier bridging the gap, messages will remain in `QUEUED_LOCALLY` until the TTL (Time-To-Live) expires or a node travels between them.
- **Unconfirmed Delivery:** Until an explicit cryptographic delivery receipt travels back through the mesh, messages are designated `FORWARDED_TO_RELAY` and never falsely reported as `DELIVERED_TO_DESTINATION`.

---

## 3. Smartphone Inertial Dead-Reckoning Drift
- **Consumer IMU Noise:** Smartphones contain consumer-grade MEMS accelerometers and gyroscopes with inherent thermal drift and sensor bias.
- **Drift Over Time:** Without periodic GNSS (GPS/GLONASS) absolute fix corrections, dead-reckoned positions accumulate positional error at an exponential rate ($\approx 5\text{m}$ to $50\text{m}$ within minutes).
- **Honest UI Representation:** NOMAD LINK visibly displays the expanding uncertainty circle and fix confidence degradation percentage, warning users when dead reckoning has decayed beyond navigation reliability.

---

## 4. Android OEM Power Management & Background Limits
- **Manufacturer Restrictions:** Aggressive vendor battery optimizers (e.g., Xiaomi MIUI/HyperOS, Huawei, Samsung OneUI) may throttle BLE advertisement scanning in deep sleep even with `FOREGROUND_SERVICE_CONNECTED_DEVICE` active.
- **Mitigation Requirement:** Users must manually select **"Unrestricted Battery Usage"** in Android Settings for NOMAD LINK to ensure unthrottled 24/7 background relaying during multi-day expeditions.
