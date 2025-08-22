"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { solveDope } from '@/lib/api';
import type { Solution } from '@/lib/types';

function roundMil(x: number) { return Math.round(x * 10) / 10; }
function roundMoa(x: number) { return Math.round(x * 4) / 4; }

export default function ReticleVisualizer() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const rifleId = useAppStore((s) => s.selectedRifleId);
  const loadId = useAppStore((s) => s.selectedLoadId);
  const env = useAppStore((s) => s.env)!;
  const distance = useAppStore((s) => s.currentDistanceYds);

  const rifle = useMemo(() => rifles.find((r) => r.id === rifleId), [rifles, rifleId]);
  const load = useMemo(() => loads.find((l) => l.id === loadId), [loads, loadId]);

  const [sol, setSol] = useState<Solution | null>(null);
  const [s5, setS5] = useState<Solution | null>(null);
  const [s10, setS10] = useState<Solution | null>(null);
  const [s15, setS15] = useState<Solution | null>(null);

  useEffect(() => {
    let canceled = false;
    async function run() {
      if (!rifle || !load || !env) return;
      const [main] = await solveDope(rifle, load, env, [distance]);
      if (canceled) return;
      setSol(main);
      const [sv5] = await solveDope(rifle, load, { ...env, windSpeedMph: 5 }, [distance]); if (canceled) return; setS5(sv5);
      const [sv10] = await solveDope(rifle, load, { ...env, windSpeedMph: 10 }, [distance]); if (canceled) return; setS10(sv10);
      const [sv15] = await solveDope(rifle, load, { ...env, windSpeedMph: 15 }, [distance]); if (canceled) return; setS15(sv15);
    }
    run();
    return () => { canceled = true; };
  }, [rifle, load, env.windSpeedMph, env.windDirectionDeg, distance]);

  const unit = rifle?.clickUnit ?? 'MIL';
  const gridUnit = unit; // draw grid in selected unit
  const ppu = 60; // pixels per unit (mil or moa)
  const halfUnits = gridUnit === 'MIL' ? 6 : 20; // show +/- range
  const size = ppu * halfUnits * 2;
  const mid = size / 2;

  const elev = unit === 'MIL' ? sol?.elevation.mil ?? 0 : sol?.elevation.moa ?? 0;
  const wind = unit === 'MIL' ? sol?.wind.mil ?? 0 : sol?.wind.moa ?? 0;

  const w5 = unit === 'MIL' ? s5?.wind.mil ?? 0 : s5?.wind.moa ?? 0;
  const w10 = unit === 'MIL' ? s10?.wind.mil ?? 0 : s10?.wind.moa ?? 0;
  const w15 = unit === 'MIL' ? s15?.wind.mil ?? 0 : s15?.wind.moa ?? 0;

  const elevLabel = unit === 'MIL' ? `${roundMil(elev)} MIL` : `${roundMoa(elev)} MOA`;
  const windLabel = unit === 'MIL' ? `${roundMil(wind)} MIL` : `${roundMoa(wind)} MOA`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">Distance: <span className="text-neutral-200 font-medium">{distance} yds</span></div>
        <div className="text-sm text-neutral-400">Hold: <span className="text-neutral-200 font-medium">{elevLabel} / {windLabel}</span></div>
      </div>
      <div className="w-full overflow-auto rounded-md border border-neutral-800 bg-neutral-950">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block mx-auto">
          <rect x={0} y={0} width={size} height={size} fill="#0a0a0a" />
          {/* Grid */}
          {Array.from({ length: halfUnits * 2 + 1 }).map((_, i) => {
            const x = i * ppu;
            const y = i * ppu;
            const isAxis = i === halfUnits;
            const major = (i - halfUnits) % (gridUnit === 'MIL' ? 1 : 5) === 0;
            const stroke = isAxis ? '#e5e5e5' : major ? '#666' : '#333';
            const w = isAxis ? 1.5 : major ? 1 : 0.5;
            return (
              <g key={i}>
                <line x1={x} y1={0} x2={x} y2={size} stroke={stroke} strokeWidth={w} />
                <line x1={0} y1={y} x2={size} y2={y} stroke={stroke} strokeWidth={w} />
              </g>
            );
          })}

          {/* Wind brackets: visualize width at 5/10/15 mph around center at elevation */}
          {sol && (
            <g>
              {[
                { w: Math.abs(w5), color: 'rgba(59,130,246,0.20)' },
                { w: Math.abs(w10), color: 'rgba(59,130,246,0.25)' },
                { w: Math.abs(w15), color: 'rgba(59,130,246,0.30)' },
              ].map((b, idx) => (
                b.w > 0 ? (
                  <rect key={idx}
                    x={mid - b.w * ppu}
                    y={mid - elev * ppu - (ppu * 0.25)}
                    width={b.w * 2 * ppu}
                    height={ppu * 0.5}
                    fill={b.color}
                  />
                ) : null
              ))}
            </g>
          )}

          {/* Current aim point: wind positive to right, up positive */}
          <g>
            <line x1={mid} y1={mid} x2={mid + wind * ppu} y2={mid - elev * ppu} stroke="#22d3ee" strokeWidth={1} strokeDasharray="4 4" />
            <circle cx={mid + wind * ppu} cy={mid - elev * ppu} r={5} fill="#22d3ee" />
          </g>

          {/* Labels */}
          <g>
            <text x={mid + 8} y={mid - elev * ppu - 8} fill="#e5e5e5" fontSize={12}>{unit}</text>
          </g>
        </svg>
      </div>
      {sol?.transonic && <div className="text-xs text-yellow-400">Note: near transonic band</div>}
    </div>
  );
}
