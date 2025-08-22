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
      <span className="chip">{loading ? 'Weather…' : `Temp ${env?.temperatureC ?? '-'}°C`}</span>
      <span className="chip">RH {env?.relativeHumidity ?? '-'}%</span>
      <span className={`chip ${stale ? 'border-yellow-600 text-yellow-400' : ''}`}>DA {daFt ?? '-'} ft</span>
      <span className="chip">SoS {sosFps ?? '-'} fps</span>
      <button className="btn" onClick={() => {
        setLoading(true);
        fetchInitialWeather().then((data) => setEnv(data)).finally(() => setLoading(false));
      }}>Refresh</button>
    </div>
  );
}
