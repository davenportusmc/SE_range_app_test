import { describe, it, expect } from 'vitest';
import { bisectMvForElevation } from '../truing';
import type { ClickUnit } from '../types';

function approxElevationFactory(a: number, b: number) {
  // elevation(mv) = a - b*mv (monotonic decreasing in mv)
  return (mv: number) => a - b * mv;
}

describe('bisectMvForElevation', () => {
  it('finds MV matching target elevation in MIL within 0.01 MIL', async () => {
    const unit: ClickUnit = 'MIL';
    const elevFor = approxElevationFactory(6, 0.002); // y = 6 - 0.002*mv
    const target = 4; // target elevation MIL
    const lo = 700; // bracket contains solution around 1000
    const hi = 1300;
    const mv = await bisectMvForElevation({ elevFor, targetClicks: target, lo, hi, unit });
    const residual = elevFor(mv) - target;
    expect(Math.abs(residual)).toBeLessThanOrEqual(0.01);
  });

  it('finds MV matching target elevation in MOA within 0.25 MOA', async () => {
    const unit: ClickUnit = 'MOA';
    const elevFor = approxElevationFactory(20, 0.006); // y = 20 - 0.006*mv
    const target = 15; // target MOA
    const lo = 400;
    const hi = 1100;
    const mv = await bisectMvForElevation({ elevFor, targetClicks: target, lo, hi, unit });
    const residual = elevFor(mv) - target;
    expect(Math.abs(residual)).toBeLessThanOrEqual(0.25);
  });

  it('widens bracket once if not initially bracketed and still converges', async () => {
    const unit: ClickUnit = 'MIL';
    const elevFor = approxElevationFactory(5, 0.0015); // y = 5 - 0.0015*mv
    const target = 3.2;
    // Choose a bracket that does not bracket the root initially
    const lo = 1000;
    const hi = 1100; // both give elevation above target; function will widen
    const mv = await bisectMvForElevation({ elevFor, targetClicks: target, lo, hi, unit, maxIter: 30 });
    const residual = elevFor(mv) - target;
    expect(Math.abs(residual)).toBeLessThanOrEqual(0.01);
  });
});
