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
  const stepYds = 2; // small fixed step
  const g = 32.174; // ft/s^2
  const bulletArea = 1; // folded into BC; we treat drag via BC scaling

  let v = load.muzzleVelocityFps; // fps
  let x = 0; // yds
  let t = 0; // s
  let dropIn = 0; // inches, relative to bore line
  const rho = 1.225; // kg/m^3 placeholder; we could use airDensity but keep simple
  const sos = speedOfSound(env.temperatureC);

  while (x < distanceYds) {
    const stepFt = Math.min(stepYds, distanceYds - x) * 3; // yards to feet
    const mach = v / sos;
    const cd = cdForMach(load.bc.model, Math.max(0.3, Math.min(3.0, mach)));
    // Very simplified deceleration: dv/dx proportional to cd/(BC)
    const k = 0.00004; // tuned constant to keep results sane for demo
    const dv = -k * (cd / Math.max(0.05, load.bc.value)) * v * (stepFt / 3);
    v = Math.max(300, v + dv);
    // time step ~ dx / v
    const dt = stepFt / v;
    t += dt;
    // vertical drop under gravity (ignoring drag lift): y += 0.5 g dt^2
    dropIn += 0.5 * g * dt * dt * 12; // ft->in
    x += stepYds;
  }

  // Zeroing correction: bring drop to be relative to zero at zeroRange
  // For demo, approximate zero effect as linear near muzzle; real solver would integrate line of sight geometry
  const zeroRange = rifle.zeroRangeYds;
  if (distanceYds >= zeroRange) {
    // remove portion of gravitational drop before zero
    dropIn -= dropIn * (zeroRange / Math.max(distanceYds, 1));
  }

  // Wind drift simple: crosswind in mph -> inches proportional to TOF
  const xwind = crosswindComponentMph(env.windSpeedMph, env.windDirectionDeg, env.azimuthDeg ?? 0);
  const windIn = xwind * t * 0.8; // tuned demo coefficient

  const mil = inchesToMil(dropIn, distanceYds);
  const moa = inchesToMoa(dropIn, distanceYds);
  const windMil = inchesToMil(windIn, distanceYds);
  const windMoa = inchesToMoa(windIn, distanceYds);

  const energy = energyFtlb(v, load.bulletWeightGr);
  const transonic = v < 1.2 * sos && v > 0.8 * sos;

  return {
    distanceYds,
    elevation: { mil, moa, inches: dropIn },
    wind: { mil: windMil, moa: windMoa, inches: windIn },
    tofSec: t,
    velocityFps: v,
    energyFtlb: energy,
    transonic,
  };
}
