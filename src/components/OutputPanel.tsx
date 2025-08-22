"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { solveDope } from '@/lib/api';
import type { Solution } from '@/lib/types';

function roundMil(x: number) { return Math.round(x * 10) / 10; }
function roundMoa(x: number) { return Math.round(x * 4) / 4; }

export default function OutputPanel() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const rifleId = useAppStore((s) => s.selectedRifleId);
  const loadId = useAppStore((s) => s.selectedLoadId);
  const env = useAppStore((s) => s.env)!;
  const gust = useAppStore((s) => s.windGustMph);
  const distance = useAppStore((s) => s.currentDistanceYds);

  const rifle = useMemo(() => rifles.find((r) => r.id === rifleId), [rifles, rifleId]);
  const load = useMemo(() => loads.find((l) => l.id === loadId), [loads, loadId]);

  const [sol, setSol] = useState<Solution | null>(null);
  const [sol5, setSol5] = useState<Solution | null>(null);
  const [sol10, setSol10] = useState<Solution | null>(null);
  const [sol15, setSol15] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let canceled = false;
    async function run() {
      if (!rifle || !load || !env) return;
      setLoading(true);
      try {
        const [main] = await solveDope(rifle, load, env, [distance]);
        if (canceled) return;
        setSol(main);
        const env5 = { ...env, windSpeedMph: 5 };
        const env10 = { ...env, windSpeedMph: 10 };
        const env15 = { ...env, windSpeedMph: 15 };
        const [s5] = await solveDope(rifle, load, env5, [distance]); if (canceled) return; setSol5(s5);
        const [s10] = await solveDope(rifle, load, env10, [distance]); if (canceled) return; setSol10(s10);
        const [s15] = await solveDope(rifle, load, env15, [distance]); if (canceled) return; setSol15(s15);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    run();
    return () => { canceled = true; };
  }, [rifle, load, env.windSpeedMph, env.windDirectionDeg, distance]);

  const unit = rifle?.clickUnit ?? 'MIL';
  const elevStr = useMemo(() => {
    if (!rifle || !sol) return '-';
    return unit === 'MIL' ? `${roundMil(sol.elevation.mil)} MIL` : `${roundMoa(sol.elevation.moa)} MOA`;
  }, [rifle, sol]);

  const windStr = useMemo(() => {
    if (!rifle || !sol) return '-';
    return unit === 'MIL' ? `${roundMil(sol.wind.mil)} MIL` : `${roundMoa(sol.wind.moa)} MOA`;
  }, [rifle, sol]);

  const gustStr = useMemo(() => {
    if (!rifle || gust == null || !sol) return '';
    // Recompute with gust speed
    const g = gust;
    const baseline = unit === 'MIL' ? sol.wind.mil : sol.wind.moa;
    return ` • Gust ${g} mph`;
  }, [rifle, gust, sol, unit]);

  return (
    <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">Distance</div>
          <div className="text-lg font-semibold">{distance} yds</div>
        </div>
        <div>
          <div className="text-xs text-neutral-400">TOF</div>
          <div className="text-lg font-semibold">{sol ? sol.tofSec.toFixed(2) + ' s' : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-400">Velocity</div>
          <div className="text-lg font-semibold">{sol ? Math.round(sol.velocityFps) + ' fps' : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-400">Energy</div>
          <div className="text-lg font-semibold">{sol ? Math.round(sol.energyFtlb) + ' ft·lb' : '-'}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-neutral-900/40 rounded-md p-3">
          <div className="text-xs text-neutral-400">Elevation</div>
          <div className="text-2xl font-semibold">{elevStr}</div>
        </div>
        <div className="bg-neutral-900/40 rounded-md p-3">
          <div className="text-xs text-neutral-400">Wind</div>
          <div className="text-2xl font-semibold">{windStr}<span className="text-sm font-normal text-neutral-500">{gustStr}</span></div>
        </div>
      </div>
      <div>
        <div className="text-xs text-neutral-400 mb-1">Wind quick chips</div>
        <div className="flex gap-2">
          <span className="chip">5 mph: {rifle && sol5 ? (rifle.clickUnit === 'MIL' ? `${roundMil(sol5.wind.mil)} MIL` : `${roundMoa(sol5.wind.moa)} MOA`) : '-'}</span>
          <span className="chip">10 mph: {rifle && sol10 ? (rifle.clickUnit === 'MIL' ? `${roundMil(sol10.wind.mil)} MIL` : `${roundMoa(sol10.wind.moa)} MOA`) : '-'}</span>
          <span className="chip">15 mph: {rifle && sol15 ? (rifle.clickUnit === 'MIL' ? `${roundMil(sol15.wind.mil)} MIL` : `${roundMoa(sol15.wind.moa)} MOA`) : '-'}</span>
        </div>
      </div>
      {sol?.transonic && <div className="text-xs text-yellow-400">Note: near transonic band</div>}
      {loading && <div className="text-xs text-neutral-500">Computing…</div>}
    </div>
  );
}
