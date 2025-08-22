"use client";
import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';

const DIR_POINTS: Array<{ deg: number; label: string }> = [
  { deg: 0, label: 'N' },
  { deg: 22.5, label: 'NNE' },
  { deg: 45, label: 'NE' },
  { deg: 67.5, label: 'ENE' },
  { deg: 90, label: 'E' },
  { deg: 112.5, label: 'ESE' },
  { deg: 135, label: 'SE' },
  { deg: 157.5, label: 'SSE' },
  { deg: 180, label: 'S' },
  { deg: 202.5, label: 'SSW' },
  { deg: 225, label: 'SW' },
  { deg: 247.5, label: 'WSW' },
  { deg: 270, label: 'W' },
  { deg: 292.5, label: 'WNW' },
  { deg: 315, label: 'NW' },
  { deg: 337.5, label: 'NNW' },
];

function nearestDirLabel(deg: number) {
  let best = DIR_POINTS[0];
  let bestDiff = 360;
  for (const p of DIR_POINTS) {
    const d = Math.abs(((deg - p.deg + 540) % 360) - 180);
    if (d < bestDiff) { best = p; bestDiff = d; }
  }
  return `${best.label} (${Math.round(deg)}°)`;
}

export default function WindControls() {
  const env = useAppStore((s) => s.env)!;
  const setWind = useAppStore((s) => s.setWind);
  const gust = useAppStore((s) => s.windGustMph);
  const setGust = useAppStore((s) => s.setWindGust);

  const label = useMemo(() => `${Math.round(env.windSpeedMph)} mph ${nearestDirLabel(env.windDirectionDeg)}`, [env]);

  const speeds = useMemo(() => Array.from({ length: 31 }, (_, i) => i), []); // 0..30 mph
  const gusts = useMemo(() => Array.from({ length: 41 }, (_, i) => i), []); // 0..40 mph

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">Wind: {label}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-neutral-400">Speed (mph)</label>
          <select
            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
            value={Math.round(env.windSpeedMph)}
            onChange={(e) => setWind(parseInt(e.target.value, 10), env.windDirectionDeg)}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-400">Direction (from)</label>
          <select
            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
            value={Math.round(env.windDirectionDeg)}
            onChange={(e) => setWind(env.windSpeedMph, parseInt(e.target.value, 10))}
          >
            {DIR_POINTS.map((p) => (
              <option key={p.deg} value={Math.round(p.deg)}>{p.label} ({Math.round(p.deg)}°)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-neutral-400">Gust (mph)</label>
          <select
            className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
            value={typeof gust === 'number' ? gust : Math.round(env.windSpeedMph)}
            onChange={(e) => setGust(parseInt(e.target.value, 10))}
          >
            {gusts.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
