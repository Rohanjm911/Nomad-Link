# NOMAD LINK Offline Navigation & Map Region Architecture

---

## 1. Overview & Constraints

In remote mountain expeditions (e.g. Karakoram, Ladakh, Andes), cellular towers and online map tile servers are completely inaccessible. NOMAD LINK's navigation architecture operates on three key principles:
1. **Pre-Cached Vector Tiles:** Map regions must be downloaded and stored locally in SQLite tile databases prior to departing base camp.
2. **Deterministic Offline Waypoints:** Coordinates are stored as WGS84 decimal degrees with altitude and notes. Never depend on online geocoding.
3. **Honest Turn-by-Turn Disclosures:** If offline vector routing data (e.g. OSRM or Valhalla offline graph) is not pre-packaged for a remote valley, NOMAD LINK explicitly displays **Direct Bearing Line & Distance** rather than fabricating turn-by-turn road navigation.

---

## 2. Offline Map Region Storage Model

Map regions are stored in SQLite as standard MBTiles / vector tiles:

```sql
CREATE TABLE IF NOT EXISTS offline_map_regions (
  region_id TEXT PRIMARY KEY,
  region_name TEXT NOT NULL,
  min_lat REAL NOT NULL,
  max_lat REAL NOT NULL,
  min_lon REAL NOT NULL,
  max_lon REAL NOT NULL,
  min_zoom INTEGER DEFAULT 6,
  max_zoom INTEGER DEFAULT 14,
  file_path TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  downloaded_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_waypoints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  altitude REAL,
  notes TEXT,
  created_at INTEGER NOT NULL
);
```

---

## 3. Inertial Dead Reckoning Integration

When satellite GNSS signals are obstructed (canyons, tunnels, blizzards):
1. **Kalman Fusion:** The native sensor module (`NomadSensorModule.kt`) samples 3-axis accelerometer, gyroscope, and compass magnetometer at 50 Hz.
2. **Displacement Estimation:** The dead-reckoning engine calculates velocity and integrates Great Circle displacement:
   $$\Delta \text{lat} = \frac{v \cdot \Delta t \cdot \cos(\theta)}{R_{\text{earth}}}, \quad \Delta \text{lon} = \frac{v \cdot \Delta t \cdot \sin(\theta)}{R_{\text{earth}} \cdot \cos(\text{lat})}$$
3. **Drift Uncertainty Visualizer:** The UI renders an expanding semi-transparent circular uncertainty perimeter around the estimated vehicle position, reflecting increasing drift over time without GNSS correction.
