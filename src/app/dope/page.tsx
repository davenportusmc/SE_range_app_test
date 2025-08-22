"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { solveDope } from '@/lib/api';
import type { Solution } from '@/lib/types';

function genDistances(start: number, end: number, step: number) {
  const out: number[] = [];
  for (let d = start; d <= end; d += step) out.push(Math.round(d));
  return out;
}

export default function DopePage() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const rifleId = useAppStore((s) => s.selectedRifleId);
  const loadId = useAppStore((s) => s.selectedLoadId);
  const env = useAppStore((s) => s.env)!;

  const rifle = useMemo(() => rifles.find((r) => r.id === rifleId), [rifles, rifleId]);
  const load = useMemo(() => loads.find((l) => l.id === loadId), [loads, loadId]);

  const [startYds, setStartYds] = useState(100);
  const [endYds, setEndYds] = useState(1000);
  const [stepYds, setStepYds] = useState(50);
  const [distances, setDistances] = useState<number[]>(genDistances(100, 1000, 50));
  const [sols, setSols] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  const [sols10, setSols10] = useState<Solution[]>([]);

  useEffect(() => {
    setDistances(genDistances(startYds, endYds, stepYds));
  }, [startYds, endYds, stepYds]);

  useEffect(() => {
    let canceled = false;
    async function run() {
      if (!rifle || !load || distances.length === 0) return;
      setLoading(true);
      try {
        const rows = await solveDope(rifle, load, env, distances);
        if (canceled) return;
        setSols(rows);
        const rows10 = await solveDope(rifle, load, { ...env, windSpeedMph: 10 }, distances);
        if (canceled) return;
        setSols10(rows10);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    run();
    return () => { canceled = true; };
  }, [rifle, load, env, distances.join(',')]);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-xl font-semibold">DOPE Card</h2>
        <button onClick={() => window.print()} className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm">Print</button>
      </div>

      <div className="grid grid-cols-3 gap-3 print:hidden">
        <label className="text-sm flex flex-col gap-1">
          <span className="text-neutral-400">Start (yds)</span>
          <input type="number" value={startYds} onChange={(e) => setStartYds(parseInt(e.target.value || '0'))} className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1" />
        </label>
        <label className="text-sm flex flex-col gap-1">
          <span className="text-neutral-400">End (yds)</span>
          <input type="number" value={endYds} onChange={(e) => setEndYds(parseInt(e.target.value || '0'))} className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1" />
        </label>
        <label className="text-sm flex flex-col gap-1">
          <span className="text-neutral-400">Step (yds)</span>
          <input type="number" value={stepYds} onChange={(e) => setStepYds(parseInt(e.target.value || '0'))} className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1" />
        </label>
      </div>

      <div className="text-xs text-neutral-400 print:text-black">
        <div className="flex flex-wrap items-center gap-4">
          <div><span className="text-neutral-500">Rifle:</span> <span className="text-neutral-200 print:text-black">{rifle?.name}</span></div>
          <div><span className="text-neutral-500">Load:</span> <span className="text-neutral-200 print:text-black">{load?.bulletName} · {load?.cartridge}</span></div>
          <div><span className="text-neutral-500">MV:</span> <span className="text-neutral-200 print:text-black">{load?.muzzleVelocityFps} fps</span></div>
          <div><span className="text-neutral-500">BC:</span> <span className="text-neutral-200 print:text-black">{load?.bc.model} {load?.bc.value}</span></div>
          <div><span className="text-neutral-500">Zero:</span> <span className="text-neutral-200 print:text-black">{rifle?.zeroRangeYds} yds</span></div>
          <div><span className="text-neutral-500">Env:</span> <span className="text-neutral-200 print:text-black">{env.temperatureC}°C · {(env.stationPressureHpa * 0.02953).toFixed(2)} inHg · {env.relativeHumidity}% RH</span></div>
        </div>
      </div>

      <div className="overflow-auto rounded-md border border-neutral-800 bg-neutral-950 print:bg-white print:border-0">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-300 print:bg-white print:text-black">
            <tr>
              <th className="text-left px-3 py-2">Yds</th>
              <th className="text-right px-3 py-2">Elev (MIL)</th>
              <th className="text-right px-3 py-2">Elev (MOA)</th>
              <th className="text-right px-3 py-2">Wind10 (MIL)</th>
              <th className="text-right px-3 py-2">Wind10 (MOA)</th>
              <th className="text-right px-3 py-2">TOF (s)</th>
              <th className="text-right px-3 py-2">Vel (fps)</th>
              <th className="text-right px-3 py-2">Energy (ft·lb)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 print:divide-black">
            {loading && (
              <tr><td colSpan={8} className="px-3 py-3 text-neutral-400">Calculating…</td></tr>
            )}
            {!loading && sols.map((s, idx) => (
              <tr key={s.distanceYds} className="text-neutral-200 print:text-black">
                <td className="px-3 py-1.5">{s.distanceYds}</td>
                <td className="px-3 py-1.5 text-right">{s.elevation.mil.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{s.elevation.moa.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{(sols10[idx]?.wind.mil ?? s.wind.mil).toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{(sols10[idx]?.wind.moa ?? s.wind.moa).toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{s.tofSec.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-right">{Math.round(s.velocityFps)}</td>
                <td className="px-3 py-1.5 text-right">{Math.round(s.energyFtlb ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: #000 !important; }
          .print\\:bg-white { background: #fff !important; }
          .print\\:border-0 { border: 0 !important; }
        }
      `}</style>
    </main>
  );
}
