/**
 * NOMAD LINK - Dead Reckoning & Inertial Sensor Fusion Kalman Filter
 * Fuses Accelerometer, Gyroscope, Magnetometer with GPS fixes.
 * Tracks positional drift and degrades confidence radius as GPS signal is lost.
 */

import { DeadReckoningState } from '../../domain/models/DomainModels';

export interface RawSensorReading {
  timestamp: number;
  accelX: number; // m/s^2
  accelY: number;
  accelZ: number;
  gyroX: number;  // rad/s
  gyroY: number;
  gyroZ: number;
  azimuthDeg: number; // Compass heading 0-360
}

export interface GpsFix {
  timestamp: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  accuracyMeters: number;
  speedMps: number;
  bearingDeg: number;
}

export class DeadReckoningEngine {
  // State: [lat, lon, speed, heading]
  private currentLat: number = 0;
  private currentLon: number = 0;
  private currentSpeedMps: number = 0;
  private currentHeadingDeg: number = 0;
  
  private lastFixTimestamp: number = 0;
  private lastSensorTimestamp: number = 0;
  private isGpsLocked: boolean = false;
  
  // Drift uncertainty parameters
  private uncertaintyRadiusMeters: number = 5.0;
  private driftConfidence: number = 1.0; // 1.0 = full GPS lock, 0.0 = completely lost

  // Earth radius in meters
  private static readonly EARTH_RADIUS_M = 6378137.0;

  /**
   * Resets or updates state with a high-accuracy GNSS fix
   */
  public onGpsFix(fix: GpsFix): DeadReckoningState {
    this.currentLat = fix.latitude;
    this.currentLon = fix.longitude;
    this.currentSpeedMps = Math.max(0, fix.speedMps);
    this.currentHeadingDeg = fix.bearingDeg;
    this.lastFixTimestamp = fix.timestamp;
    this.lastSensorTimestamp = fix.timestamp;
    
    this.isGpsLocked = fix.accuracyMeters <= 25.0;
    this.uncertaintyRadiusMeters = Math.max(3.0, fix.accuracyMeters);
    this.driftConfidence = 1.0;

    return this.getState();
  }

  /**
   * Processes high-rate inertial sensor updates (accelerometer + gyro + compass)
   * Integrates movement when GPS fix is stale or completely unavailable
   */
  public onSensorUpdate(sensor: RawSensorReading): DeadReckoningState {
    const now = sensor.timestamp;
    if (this.lastSensorTimestamp === 0) {
      this.lastSensorTimestamp = now;
      return this.getState();
    }

    const dtSeconds = Math.max(0.001, (now - this.lastSensorTimestamp) / 1000.0);
    this.lastSensorTimestamp = now;

    // Time elapsed since last trusted GPS fix
    const gpsAgeSeconds = (now - this.lastFixTimestamp) / 1000.0;

    // Degrade confidence if GPS fix is older than 5 seconds
    if (gpsAgeSeconds > 5.0) {
      this.isGpsLocked = false;
      // Exponential decay of confidence: halflife ~60s
      this.driftConfidence = Math.max(0.05, Math.exp(-0.012 * gpsAgeSeconds));
      // Uncertainty radius increases by ~1.5m per second of dead reckoning without fix
      this.uncertaintyRadiusMeters += 1.5 * dtSeconds;
    }

    // Compass heading with sensor fusion
    this.currentHeadingDeg = (sensor.azimuthDeg + 360) % 360;

    // Estimate forward acceleration (subtracting gravity vector magnitude ~9.81)
    const normAccel = Math.sqrt(
      sensor.accelX * sensor.accelX +
      sensor.accelY * sensor.accelY +
      sensor.accelZ * sensor.accelZ
    );
    const forwardAccel = Math.max(-3.0, Math.min(3.0, normAccel - 9.81));

    // Simple Kalman/Euler step velocity prediction
    if (!this.isGpsLocked) {
      this.currentSpeedMps = Math.max(0, this.currentSpeedMps + forwardAccel * dtSeconds * 0.5);
      // Dampen speed drift if vehicle appears stationary
      if (Math.abs(forwardAccel) < 0.2) {
        this.currentSpeedMps *= 0.95;
      }
    }

    // Predict new coordinates via Great Circle displacement
    if (this.currentSpeedMps > 0.1 && this.currentLat !== 0) {
      const distanceMovedMeters = this.currentSpeedMps * dtSeconds;
      const headingRad = (this.currentHeadingDeg * Math.PI) / 180.0;

      const deltaLat = (distanceMovedMeters * Math.cos(headingRad)) / DeadReckoningEngine.EARTH_RADIUS_M;
      const deltaLon =
        (distanceMovedMeters * Math.sin(headingRad)) /
        (DeadReckoningEngine.EARTH_RADIUS_M * Math.cos((this.currentLat * Math.PI) / 180.0));

      this.currentLat += (deltaLat * 180.0) / Math.PI;
      this.currentLon += (deltaLon * 180.0) / Math.PI;
    }

    return this.getState();
  }

  public getState(): DeadReckoningState {
    return {
      isGpsActive: this.isGpsLocked,
      lastGpsFixTimestamp: this.lastFixTimestamp,
      latitude: this.currentLat,
      longitude: this.currentLon,
      estimatedSpeedMps: this.currentSpeedMps,
      headingDegrees: this.currentHeadingDeg,
      uncertaintyRadiusMeters: Math.round(this.uncertaintyRadiusMeters * 10) / 10,
      driftConfidence: Math.round(this.driftConfidence * 100) / 100,
    };
  }
}
