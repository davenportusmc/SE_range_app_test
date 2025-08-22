import { describe, it, expect } from 'vitest';
import { speedOfSound, densityAltitude } from './atmosphere';

describe('atmosphere', () => {
  it('speed of sound increases with temperature', () => {
    const a1 = speedOfSound(0);
    const a2 = speedOfSound(30);
    expect(a2).toBeGreaterThan(a1);
  });

  it('density altitude increases with temperature (holding pressure)', () => {
    const da1 = densityAltitude(1013.25, 0);
    const da2 = densityAltitude(1013.25, 30);
    expect(da2).toBeGreaterThan(da1);
  });
});
