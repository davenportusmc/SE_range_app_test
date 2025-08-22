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
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2">
        <span className="chip-eq flex-col w-full">
          <span className="leading-tight">Temp</span>
          <span className="leading-tight font-semibold text-orange-400">{loading ? '…' : `${env?.temperatureC ?? '-'}°C`}</span>
        </span>
        <span className="chip-eq flex-col w-full">
          <span className="leading-tight">RH</span>
          <span className="leading-tight font-semibold text-orange-400">{env?.relativeHumidity ?? '-'}%</span>
        </span>
        <span className={`chip-eq flex-col w-full ${stale ? 'border-yellow-600 text-yellow-400' : ''}`}> 
          <span className="leading-tight">DA</span>
          <span className="leading-tight font-semibold text-orange-400">{daFt ?? '-'} ft</span>
        </span>
        <span className="chip-eq flex-col w-full">
          <span className="leading-tight">SoS</span>
          <span className="leading-tight font-semibold text-orange-400">{sosFps ?? '-'} fps</span>
        </span>
      </div>
      <button className="btn w-full sm:w-auto sm:ml-auto mt-2" onClick={() => {
        setLoading(true);
        fetchInitialWeather().then((data) => setEnv(data)).finally(() => setLoading(false));
      }}>Refresh</button>
    </div>
  );
}
