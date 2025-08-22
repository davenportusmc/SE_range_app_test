import { describe, it, expect } from 'vitest';
import { solveOne } from '../ballistics/solver';
import type { RifleProfile, LoadProfile, Environment } from '../types';

const rifle: RifleProfile = {
  id: 'r1',
  name: 'Test Rifle',
  clickUnit: 'MIL',
  zeroRangeYds: 100,
  sightHeightIn: 1.5,
  clickValue: 0.1,
};

const load: LoadProfile = {
  id: 'l1',
  bulletName: 'Test 140gr',
  bulletWeightGr: 140,
  muzzleVelocityFps: 2700,
  bc: { model: 'G7', value: 0.28 },
  cartridge: '6.5 Creedmoor',
};

const env: Environment = {
  stationPressureHpa: 1013.25,
  temperatureC: 15,
  relativeHumidity: 50,
  windSpeedMph: 10,
  windDirectionDeg: 90,
  azimuthDeg: 0,
  latitude: 35,
};

describe('solveOne', () => {
  it('produces monotonic elevation increase with distance', () => {
    const s200 = solveOne({ rifle, load, env, distanceYds: 200 });
    const s400 = solveOne({ rifle, load, env, distanceYds: 400 });
    expect(s400.elevation.mil).toBeGreaterThan(s200.elevation.mil);
  });

  it('higher MV reduces elevation at fixed distance', () => {
    const sBase = solveOne({ rifle, load, env, distanceYds: 600 });
    const sFaster = solveOne({ rifle, load: { ...load, muzzleVelocityFps: 2900 }, env, distanceYds: 600 });
    expect(sFaster.elevation.mil).toBeLessThan(sBase.elevation.mil);
  });

  it('zeroing correction: near zero range elevation ~ 0', () => {
    const s100 = solveOne({ rifle, load, env, distanceYds: 100 });
    expect(Math.abs(s100.elevation.mil)).toBeLessThan(0.05);
  });

  it('wind increases with wind speed', () => {
    const s5 = solveOne({ rifle, load, env: { ...env, windSpeedMph: 5 }, distanceYds: 800 });
    const s15 = solveOne({ rifle, load, env: { ...env, windSpeedMph: 15 }, distanceYds: 800 });
    expect(Math.abs(s15.wind.mil)).toBeGreaterThan(Math.abs(s5.wind.mil));
  });
});
