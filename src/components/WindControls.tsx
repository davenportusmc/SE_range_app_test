"use client";
import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';

function degToCardinal(deg: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const ix = Math.round(((deg % 360) / 45)) % 8;
  return dirs[ix];
}

export default function WindControls() {
  const env = useAppStore((s) => s.env)!;
  const setWind = useAppStore((s) => s.setWind);
  const gust = useAppStore((s) => s.windGustMph);
  const setGust = useAppStore((s) => s.setWindGust);

  const label = useMemo(() => `${env.windSpeedMph.toFixed(0)} mph ${degToCardinal(env.windDirectionDeg)} (${env.windDirectionDeg}°)`, [env]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">Wind: {label}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-neutral-400">Speed (mph)</label>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={env.windSpeedMph}
            onChange={(e) => setWind(parseInt(e.target.value, 10), env.windDirectionDeg)}
            className="w-full"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-neutral-500">Gust</span>
            <input type="range" min={0} max={40} step={1} value={gust ?? env.windSpeedMph} onChange={(e) => setGust(parseInt(e.target.value, 10))} className="w-full" />
            <span className="text-xs text-neutral-400">{gust ?? env.windSpeedMph} mph</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-neutral-400">Direction (from, degrees)</label>
          <input
            type="range"
            min={0}
            max={359}
            step={1}
            value={env.windDirectionDeg}
            onChange={(e) => setWind(env.windSpeedMph, parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
