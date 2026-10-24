# NOMAD LINK Android Permissions Matrix & Compatibility Guide

---

## 1. Required Permissions by Android Version

NOMAD LINK follows the principle of least privilege, declaring and checking permissions dynamically based on the Android API level of the host device.

| Permission | API Level | Purpose | Graceful Fallback if Denied |
|---|---|---|---|
| `BLUETOOTH_SCAN` | Android 12+ (API 31+) | Discovering nearby expedition nodes via BLE advertisements. | Scanning paused; manual Wi-Fi Direct connection available. |
| `BLUETOOTH_ADVERTISE` | Android 12+ (API 31+) | Broadcasting device availability to nearby mesh peers. | Node operates in passive receive-only mode. |
| `BLUETOOTH_CONNECT` | Android 12+ (API 31+) | Establishing GATT connections to exchange store-and-forward envelopes. | Radio link establishment blocked. |
| `ACCESS_FINE_LOCATION` | All APIs | Precise GPS positioning for convoy tracking and SOS coordinates. | Application relies on approximate location or manual entry. |
| `ACCESS_BACKGROUND_LOCATION` | Android 10+ (API 29+) | Location updates during convoy driving when device screen locks. | Location only updates while application is in foreground. |
| `FOREGROUND_SERVICE` | Android 9+ (API 28+) | Maintaining ongoing BLE mesh relay service with persistent notification. | OS may kill background relaying when screen is locked. |
| `FOREGROUND_SERVICE_CONNECTED_DEVICE` | Android 14+ (API 34+) | System declaration that foreground service manages BLE and Wi-Fi Direct peripherals. | Service cannot start on Android 14+. |
| `POST_NOTIFICATIONS` | Android 13+ (API 33+) | Displaying persistent expedition status notification and emergency alerts. | Status remains visible within app UI only. |
| `WAKE_LOCK` | All APIs | Preventing CPU sleep during critical batch packet forwarding over Wi-Fi Direct. | OS may pause high-throughput transfer. |

---

## 2. Platform Nuances & Manufacturer Optimizations

### Aggressive Battery Killers (MIUI, EMUI, ColorOS, Samsung OneUI)
Many Android OEM distributions forcefully terminate background processes unless explicitly exempted:
- NOMAD LINK displays a **Battery Optimization Exemption Guide** in `SettingsScreen`.
- Directs users to disable "Aggressive App Hibernation" for NOMAD LINK so the background store-and-forward mesh router can relay messages for team members.

### Bluetooth Scanning Limits
Starting in Android 7.0, the operating system limits BLE scans to 5 scans per 30-second window.
- NOMAD LINK implements continuous scanning with `SCAN_MODE_BALANCED` instead of rapid start/stop cycles.
- When `Expedition Eco-Mode` is engaged, scan windows shift to low-power duty cycles to conserve battery.
