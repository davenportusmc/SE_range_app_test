import type { Environment, LoadProfile, RifleProfile, SolveOptions, Solution } from '../types';
import { speedOfSound } from './atmosphere';
import { energyFtlb, inchesToMil, inchesToMoa } from './units';
import { crosswindComponentMph } from './wind';
import g1 from './dragTables/g1.json';
import g7 from './dragTables/g7.json';

// Linear interpolation helper
function lerp(x0: number, y0: number, x1: number, y1: number, x: number): number {
  if (x1 === x0) return y0;
  const t = (x - x0) / (x1 - x0);
  return y0 + t * (y1 - y0);
}

function cdForMach(model: 'G1' | 'G7', mach: number): number {
  const tbl = model === 'G1' ? (g1 as any).points : (g7 as any).points;
  for (let i = 0; i < tbl.length - 1; i++) {
    const a = tbl[i];
    const b = tbl[i + 1];
    if (mach >= a.mach && mach <= b.mach) return lerp(a.mach, a.cd, b.mach, b.cd, mach);
  }
  return tbl[tbl.length - 1].cd;
}

export interface SolveInput {
  rifle: RifleProfile;
  load: LoadProfile;
  env: Environment;
  distanceYds: number;
  options?: SolveOptions;
}

export function solveOne(input: SolveInput): Solution {
  const { rifle, load, env, distanceYds } = input;
  const stepYds = 2; // base step
  const g = 32.174; // ft/s^2
  const sos = speedOfSound(env.temperatureC);

  // Adjust MV by temperature sensitivity (baseline 59F)
  const tempF = env.temperatureC * 9/5 + 32;
  const sens = load.tempSensitivityFpsPer10F ?? 0;
  const mvAdjusted = load.muzzleVelocityFps + ((tempF - 59) / 10) * sens;

  function simulate(toYds: number) {
    let v = mvAdjusted; // fps
    let x = 0; // yds
    let t = 0; // s
    while (x < toYds) {
      const dxYds = Math.min(stepYds, toYds - x);
      const stepFt = dxYds * 3; // yards to feet
      const mach = v / sos;
      const cd = cdForMach(load.bc.model, Math.max(0.3, Math.min(3.0, mach)));
      const k = 0.00004; // tuned constant to keep results sane for demo
      const dv = -k * (cd / Math.max(0.05, load.bc.value)) * v * (stepFt / 3);
      v = Math.max(300, v + dv);
      const dt = stepFt / v;
      t += dt;
      x += dxYds;
    }
    // vertical drop assuming zero initial vertical velocity
    const dropIn = 0.5 * g * t * t * 12; // ft->in
    return { v, t, dropIn };
  }

  // Simulate to distance and to zero. Compute elevation relative to the line-of-sight (LOS)
  // modeled as a straight line from (0, sightHeightIn) to (zeroRange, drop_at_zero).
  const main = simulate(distanceYds);
  const zeroRange = Math.max(1, rifle.zeroRangeYds);
  const zero = simulate(zeroRange);
  const losAtDistance = rifle.sightHeightIn + (zero.dropIn - rifle.sightHeightIn) * (distanceYds / zeroRange);
  const relDropIn = main.dropIn - losAtDistance;

  // Wind drift simple: crosswind in mph -> inches proportional to main TOF
  const xwind = crosswindComponentMph(env.windSpeedMph, env.windDirectionDeg, env.azimuthDeg ?? 0);
  const windIn = xwind * main.t * 0.8; // tuned demo coefficient

  const mil = inchesToMil(relDropIn, distanceYds);
  const moa = inchesToMoa(relDropIn, distanceYds);
  const windMil = inchesToMil(windIn, distanceYds);
  const windMoa = inchesToMoa(windIn, distanceYds);

  const energy = energyFtlb(main.v, load.bulletWeightGr);
  const transonic = main.v < 1.2 * sos && main.v > 0.8 * sos;

  return {
    distanceYds,
    elevation: { mil, moa, inches: relDropIn },
    wind: { mil: windMil, moa: windMoa, inches: windIn },
    tofSec: main.t,
    velocityFps: main.v,
    energyFtlb: energy,
    transonic,
  };
}
