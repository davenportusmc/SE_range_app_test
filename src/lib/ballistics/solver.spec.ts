import { describe, it, expect } from 'vitest';
import { solveOne } from './solver';

const rifle = { id: 'r', name: 'test', zeroRangeYds: 100, sightHeightIn: 1.8, clickUnit: 'MIL', clickValue: 0.1 };
const load = { id: 'l', cartridge: 'test', bulletName: 'test', bulletWeightGr: 140, bc: { model: 'G7', value: 0.3 }, muzzleVelocityFps: 2700 };
const env = { stationPressureHpa: 1013.25, temperatureC: 15, relativeHumidity: 50, windSpeedMph: 10, windDirectionDeg: 90 };

describe('solver monotonicity (demo)', () => {
  it('drop increases with distance', () => {
    const s1 = solveOne({ rifle, load, env, distanceYds: 300 });
    const s2 = solveOne({ rifle, load, env, distanceYds: 600 });
    expect(Math.abs(s2.elevation.inches)).toBeGreaterThan(Math.abs(s1.elevation.inches));
  });

  it('wind drift increases with crosswind', () => {
    const sLow = solveOne({ rifle, load, env: { ...env, windSpeedMph: 5 }, distanceYds: 600 });
    const sHigh = solveOne({ rifle, load, env: { ...env, windSpeedMph: 15 }, distanceYds: 600 });
    expect(Math.abs(sHigh.wind.inches)).toBeGreaterThan(Math.abs(sLow.wind.inches));
  });
});
