export type ClickUnit = 'MIL' | 'MOA';

export interface RifleProfile {
  id: string;
  name: string;
  zeroRangeYds: number;
  sightHeightIn: number;
  clickUnit: ClickUnit;
  clickValue: number;
  barrelLengthIn?: number;
  twistRate?: string;
  reticleId?: string;
}

export interface LoadProfile {
  id: string;
  cartridge: string;
  bulletName: string;
  bulletWeightGr: number;
  bc: { model: 'G7' | 'G1'; value: number };
  muzzleVelocityFps: number;
  tempSensitivityFpsPer10F?: number;
}

export interface Environment {
  stationPressureHpa: number;
  temperatureC: number;
  relativeHumidity: number;
  windSpeedMph: number;
  windDirectionDeg: number;
  latitude?: number;
  azimuthDeg?: number;
}

export interface Plate {
  id: string;
  distanceYds: number;
  widthIn?: number;
  heightIn?: number;
  elevationAngleDeg?: number;
}

export interface SolveOptions {
  useSpinDrift?: boolean;
  useCoriolis?: boolean;
  useIncline?: boolean;
}

export interface Solution {
  distanceYds: number;
  elevation: { mil: number; moa: number; inches: number };
  wind: { mil: number; moa: number; inches: number };
  tofSec: number;
  velocityFps: number;
  energyFtlb: number;
  transonic: boolean;
}
