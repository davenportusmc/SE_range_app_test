"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { solveDope } from '@/lib/api';
import type { LoadProfile, RifleProfile } from '@/lib/types';

function toUnit(val: { mil: number; moa: number }, unit: 'MIL' | 'MOA') {
  return unit === 'MIL' ? val.mil : val.moa;
}

export default function TruingPanel() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const rifleId = useAppStore((s) => s.selectedRifleId);
  const loadId = useAppStore((s) => s.selectedLoadId);
  const env = useAppStore((s) => s.env)!;
  const plates = useAppStore((s) => s.platesYds);
  const updateMv = useAppStore((s) => s.updateSelectedLoadMv);

  const rifle = useMemo(() => rifles.find((r) => r.id === rifleId), [rifles, rifleId]);
  const load = useMemo(() => loads.find((l) => l.id === loadId), [loads, loadId]);

  const [distance, setLocalDistance] = useState<number>(
    () => {
      const fromLs = typeof window !== 'undefined' ? Number(localStorage.getItem('truing.distance') ?? 'NaN') : NaN;
      return isFinite(fromLs) && fromLs > 0 ? fromLs : (plates.includes(600) ? 600 : plates[0] ?? 100);
    }
  );
  const [observed, setObserved] = useState<number>(0);
  const [zeroOffset, setZeroOffset] = useState<number>(() => {
    const fromLs = typeof window !== 'undefined' ? Number(localStorage.getItem('truing.zeroOffset') ?? 'NaN') : NaN;
    return isFinite(fromLs) ? fromLs : 0;
  });
  const [computing, setComputing] = useState(false);
  const [proposal, setProposal] = useState<{ mvFps: number; delta: number; predicted: number; residual: number; transonic: boolean } | null>(null);
  const [baseline, setBaseline] = useState<{ predicted: number } | null>(null);
  const unit = rifle?.clickUnit ?? 'MIL';
  const tol = unit === 'MIL' ? 0.01 : 0.25;
  const mvBounds = useMemo(() => {
    const base = load?.muzzleVelocityFps ?? 2500;
    const min = Math.max(800, Math.round(base * 0.7));
    const max = Math.min(4500, Math.round(base * 1.3));
    return { min, max };
  }, [load]);
  const [appliedNote, setAppliedNote] = useState<string | null>(null);

  useEffect(() => {
    // Compute baseline predicted elevation at current MV
    let canceled = false;
    async function run() {
      if (!rifle || !load) return;
      const [s] = await solveDope(rifle, load, env, [distance]);
      if (canceled) return;
      setBaseline({ predicted: toUnit(s.elevation, unit) });
    }
    run();
    return () => { canceled = true; };
  }, [rifle, load, env, distance, unit]);

  // persist distance and zeroOffset
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('truing.distance', String(distance));
  }, [distance]);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('truing.zeroOffset', String(zeroOffset));
  }, [zeroOffset]);

  const bisectSolve = useCallback(async (rifle: RifleProfile, load: LoadProfile, targetClicks: number, distance: number) => {
    const mv0 = Math.max(800, load.muzzleVelocityFps * 0.7);
    const mv1 = Math.min(4000, load.muzzleVelocityFps * 1.3);
    let lo = mv0, hi = mv1;

    const maxIter = 24;
    const tol = unit === 'MIL' ? 0.01 : 0.25; // 0.01 mil or 1/4 MOA

    async function elevFor(mv: number): Promise<number> {
      const tmpLoad = { ...load, muzzleVelocityFps: mv } as LoadProfile;
      const [s] = await solveDope(rifle, tmpLoad, env, [distance]);
      return toUnit(s.elevation, unit);
    }

    // Ensure bracketing: find f(lo) and f(hi)
    let fLo = (await elevFor(lo)) - targetClicks;
    let fHi = (await elevFor(hi)) - targetClicks;

    // If signs equal, widen once on the side of smaller |f|
    if (Math.sign(fLo) === Math.sign(fHi)) {
      if (Math.abs(fLo) < Math.abs(fHi)) {
        // push hi further
        hi = Math.min(4500, hi * 1.15);
        fHi = (await elevFor(hi)) - targetClicks;
      } else {
        lo = Math.max(500, lo * 0.85);
        fLo = (await elevFor(lo)) - targetClicks;
      }
    }

    let bestMv = load.muzzleVelocityFps;
    let bestErr = Number.POSITIVE_INFINITY;

    for (let i = 0; i < maxIter; i++) {
      const mid = 0.5 * (lo + hi);
      const fMid = (await elevFor(mid)) - targetClicks;
      const err = Math.abs(fMid);
      if (err < bestErr) { bestErr = err; bestMv = mid; }
      if (Math.abs(fMid) <= tol || Math.abs(hi - lo) < 5) {
        return bestMv;
      }
      // Bisection step
      if (Math.sign(fMid) === Math.sign(fLo)) {
        lo = mid; fLo = fMid;
      } else {
        hi = mid; fHi = fMid;
      }
    }
    return bestMv;
  }, [env, unit]);

  const compute = useCallback(async () => {
    if (!rifle || !load) return;
    setComputing(true);
    try {
      const target = observed - (isFinite(zeroOffset) ? zeroOffset : 0);
      let mv = await bisectSolve(rifle, load, target, distance);
      let clamped = false;
      if (mv < mvBounds.min) { mv = mvBounds.min; clamped = true; }
      if (mv > mvBounds.max) { mv = mvBounds.max; clamped = true; }
      const [pred] = await solveDope(rifle, { ...load, muzzleVelocityFps: mv } as LoadProfile, env, [distance]);
      const predicted = toUnit(pred.elevation, unit);
      const residual = predicted - target;
      setProposal({ mvFps: Math.round(mv), delta: Math.round(mv - load.muzzleVelocityFps), predicted, residual, transonic: !!pred.transonic });
      if (clamped) {
        setAppliedNote(`MV was clamped to bounds ${mvBounds.min}-${mvBounds.max} fps`);
        setTimeout(() => setAppliedNote(null), 4000);
      }
    } finally {
      setComputing(false);
    }
  }, [bisectSolve, rifle, load, observed, zeroOffset, distance, env, unit]);

  const apply = useCallback(() => {
    if (proposal) updateMv(proposal.mvFps);
    setAppliedNote(`Applied ${proposal?.mvFps} fps. Residual: ${proposal?.residual.toFixed(3)} ${unit}`);
    setTimeout(() => setAppliedNote(null), 4000);
    setProposal(null);
    // re-solve baseline immediately to reflect new MV
    (async () => {
      if (!rifle || !load) return;
      const [s] = await solveDope(rifle, { ...load, muzzleVelocityFps: proposal?.mvFps ?? load.muzzleVelocityFps } as LoadProfile, env, [distance]);
      setBaseline({ predicted: toUnit(s.elevation, unit) });
    })();
  }, [proposal, updateMv]);

  if (!rifle || !load) return <div className="text-sm text-neutral-400">Select a rifle and load first.</div>;

  return (
    <div className="space-y-4 border border-neutral-800 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-neutral-400">Known Distance (yds)</label>
          <input type="number" inputMode="numeric" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
            value={distance} onChange={(e) => setLocalDistance(parseInt(e.target.value || '0', 10))} min={25} step={25} />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Observed Elevation ({unit})</label>
          <input type="number" inputMode="decimal" step={unit === 'MIL' ? 0.1 : 0.25} className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
            placeholder={unit === 'MIL' ? 'e.g. 4.2' : 'e.g. 14.5'} value={observed}
            onChange={(e) => setObserved(parseFloat(e.target.value))} />
        </div>
        <div className="flex items-end">
          <button className="btn w-full" onClick={compute} disabled={computing || !isFinite(observed)}>
            {computing ? 'Computing…' : 'Compute MV'}
          </button>
        </div>

        <div className="md:col-span-3">
          <details className="bg-neutral-900/40 border border-neutral-800 rounded-md">
            <summary className="cursor-pointer select-none list-none px-3 py-2 text-sm text-neutral-300 flex items-center justify-between">
              <span>Options</span>
              <span className="text-xs text-neutral-500">Zero offset, bounds, tolerance</span>
            </summary>
            <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-neutral-400">Zero Offset ({unit})</label>
                <input type="number" inputMode="decimal" step={unit === 'MIL' ? 0.1 : 0.25} className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
                  placeholder={unit === 'MIL' ? 'e.g. 0.1' : 'e.g. 0.5'} value={zeroOffset}
                  onChange={(e) => setZeroOffset(parseFloat(e.target.value))} />
              </div>
              <div className="text-xs text-neutral-400 flex items-end">MV bounds: <span className="ml-1 text-neutral-200">{mvBounds.min}-{mvBounds.max} fps</span></div>
              <div className="text-xs text-neutral-400 flex items-end">Tolerance: <span className="ml-1 text-neutral-200">{tol} {unit}</span></div>
            </div>
          </details>
        </div>
      </div>

      <div className="text-sm text-neutral-400">
        Baseline predicted at current MV {load.muzzleVelocityFps} fps: <span className="text-neutral-200">{baseline ? baseline.predicted.toFixed(2) : '—'} {unit}</span>
      </div>

      {proposal && (
        <div className="bg-neutral-900/50 rounded-md p-3 space-y-2">
          <div className="text-sm">Proposed MV: <span className="font-semibold">{proposal.mvFps} fps</span> ({proposal.delta >= 0 ? '+' : ''}{proposal.delta} fps)</div>
          <div className="text-xs text-neutral-400">Predicted elevation at {distance} yds with proposed MV: {proposal.predicted.toFixed(2)} {unit}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border ${Math.abs(proposal.residual) <= tol ? 'border-green-500 text-green-400' : 'border-amber-500 text-amber-400'}`}>
              {Math.abs(proposal.residual) <= tol ? 'Within tolerance' : 'Outside tolerance'} ({tol} {unit})
            </span>
            <span className="text-neutral-400">Residual: {proposal.residual.toFixed(3)} {unit}</span>
          </div>
          {proposal.transonic && (
            <div className="text-xs text-red-400">Warning: Solution is transonic at this distance. Truing at transonic can be unstable.</div>
          )}
          <div className="flex gap-2">
            <button className="btn" onClick={apply} disabled={Math.abs(proposal.residual) > tol}>Apply to Load</button>
            <button className="btn" onClick={() => setProposal(null)}>Discard</button>
          </div>
        </div>
      )}

      {appliedNote && (
        <div className="text-xs text-amber-300">{appliedNote}</div>
      )}

      <div className="text-xs text-neutral-500">Tip: True at mid-long distance and steady wind. Ensure zero is correct.</div>
    </div>
  );
}
