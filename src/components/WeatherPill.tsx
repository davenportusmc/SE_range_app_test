"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAppStore, fetchInitialWeather } from '@/lib/store';
import { densityAltitude, speedOfSound } from '@/lib/ballistics/atmosphere';

export default function WeatherPill() {
  const env = useAppStore((s) => s.env);
  const setEnv = useAppStore((s) => s.setEnv);
  const fetchedAt = useAppStore((s) => s.weatherFetchedAt);
  const [loading, setLoading] = useState(false);

  const stale = fetchedAt ? Date.now() - fetchedAt > 15 * 60 * 1000 : true;

  useEffect(() => {
    if (!env || stale) {
      setLoading(true);
      fetchInitialWeather()
        .then((data) => setEnv(data))
        .finally(() => setLoading(false));
    }
  }, []);

  const daFt = useMemo(() => env ? Math.round(densityAltitude(env.stationPressureHpa, env.temperatureC)) : undefined, [env]);
  const sosFps = useMemo(() => env ? Math.round(speedOfSound(env.temperatureC)) : undefined, [env]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="chip-eq flex-col">
        <span className="leading-tight">Temp</span>
        <span className="leading-tight font-semibold">{loading ? '…' : `${env?.temperatureC ?? '-'}°C`}</span>
      </span>
      <span className="chip-eq flex-col">
        <span className="leading-tight">RH</span>
        <span className="leading-tight font-semibold">{env?.relativeHumidity ?? '-'}%</span>
      </span>
      <span className={`chip-eq flex-col ${stale ? 'border-yellow-600 text-yellow-400' : ''}`}>
        <span className="leading-tight">DA</span>
        <span className="leading-tight font-semibold">{daFt ?? '-'} ft</span>
      </span>
      <span className="chip-eq flex-col">
        <span className="leading-tight">SoS</span>
        <span className="leading-tight font-semibold">{sosFps ?? '-'} fps</span>
      </span>
      <button className="btn" onClick={() => {
        setLoading(true);
        fetchInitialWeather().then((data) => setEnv(data)).finally(() => setLoading(false));
      }}>Refresh</button>
    </div>
  );
}
