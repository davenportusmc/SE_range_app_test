import type { ClickUnit } from './types';

export interface BisectOptions {
  elevFor: (mv: number) => Promise<number> | number;
  targetClicks: number;
  lo: number;
  hi: number;
  unit: ClickUnit;
  maxIter?: number;
  tolMil?: number;
  tolMoa?: number;
}

/**
 * Bisection on MV to match elevation. Assumes elevation is monotonic in MV (higher MV = lower elevation).
 * Returns the best MV found within tolerance or the narrowest bracket.
 */
export async function bisectMvForElevation(opts: BisectOptions): Promise<number> {
  const { elevFor, targetClicks, unit } = opts;
  let lo = Math.max(300, Math.min(opts.lo, opts.hi));
  let hi = Math.max(opts.lo, opts.hi);
  const maxIter = opts.maxIter ?? 24;
  const tol = unit === 'MIL' ? (opts.tolMil ?? 0.01) : (opts.tolMoa ?? 0.25);

  async function f(mv: number): Promise<number> {
    const y = await elevFor(mv);
    return y - targetClicks;
  }

  let fLo = await f(lo);
  let fHi = await f(hi);

  // If not bracketed, widen once toward smaller |f|
  if (Math.sign(fLo) === Math.sign(fHi)) {
    if (Math.abs(fLo) < Math.abs(fHi)) {
      hi = Math.min(4500, hi * 1.15);
      fHi = await f(hi);
    } else {
      lo = Math.max(300, lo * 0.85);
      fLo = await f(lo);
    }
  }

  let bestMv = 0.5 * (lo + hi);
  let bestErr = Number.POSITIVE_INFINITY;

  for (let i = 0; i < maxIter; i++) {
    const mid = 0.5 * (lo + hi);
    const fMid = await f(mid);
    const err = Math.abs(fMid);
    if (err < bestErr) { bestErr = err; bestMv = mid; }
    if (err <= tol || Math.abs(hi - lo) < 5) return bestMv;
    if (Math.sign(fMid) === Math.sign(fLo)) { lo = mid; fLo = fMid; } else { hi = mid; fHi = fMid; }
  }
  return bestMv;
}
