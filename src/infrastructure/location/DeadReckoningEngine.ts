

import { DeadReckoningState } from '../../domain/models/DomainModels';

export interface RawSensorReading {
  timestamp: number;
  accelX: number; 
  accelY: number;
  accelZ: number;
  gyroX: number;  
  gyroY: number;
  gyroZ: number;
  azimuthDeg: number; 
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
  
  private currentLat: number = 0;
  private currentLon: number = 0;
  private currentSpeedMps: number = 0;
  private currentHeadingDeg: number = 0;
  
  private lastFixTimestamp: number = 0;
  private lastSensorTimestamp: number = 0;
  private isGpsLocked: boolean = false;
  
  
  private uncertaintyRadiusMeters: number = 5.0;
  private driftConfidence: number = 1.0; 

  
  private static readonly EARTH_RADIUS_M = 6378137.0;

  
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

  
  public onSensorUpdate(sensor: RawSensorReading): DeadReckoningState {
    const now = sensor.timestamp;
    if (this.lastSensorTimestamp === 0) {
      this.lastSensorTimestamp = now;
      return this.getState();
    }

    const dtSeconds = Math.max(0.001, (now - this.lastSensorTimestamp) / 1000.0);
    this.lastSensorTimestamp = now;

    
    const gpsAgeSeconds = (now - this.lastFixTimestamp) / 1000.0;

    
    if (gpsAgeSeconds > 5.0) {
      this.isGpsLocked = false;
      
      this.driftConfidence = Math.max(0.05, Math.exp(-0.012 * gpsAgeSeconds));
      
      this.uncertaintyRadiusMeters += 1.5 * dtSeconds;
    }

    
    this.currentHeadingDeg = (sensor.azimuthDeg + 360) % 360;

    
    const normAccel = Math.sqrt(
      sensor.accelX * sensor.accelX +
      sensor.accelY * sensor.accelY +
      sensor.accelZ * sensor.accelZ
    );
    const forwardAccel = Math.max(-3.0, Math.min(3.0, normAccel - 9.81));

    
    if (!this.isGpsLocked) {
      this.currentSpeedMps = Math.max(0, this.currentSpeedMps + forwardAccel * dtSeconds * 0.5);
      
      if (Math.abs(forwardAccel) < 0.2) {
        this.currentSpeedMps *= 0.95;
      }
    }

    
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
