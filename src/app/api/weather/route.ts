import { NextResponse } from 'next/server';

// Simple in-memory cache per server instance
let cache: { key: string; timestamp: number; payload: any } | null = null;
const TTL_MS = 15 * 60 * 1000;

const DEFAULT_LAT = Number(process.env.DEFAULT_LAT ?? 35.626458);
const DEFAULT_LON = Number(process.env.DEFAULT_LON ?? -86.693331);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get('lat') ?? DEFAULT_LAT);
  const lon = Number(searchParams.get('lon') ?? DEFAULT_LON);
  const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  if (cache && cache.key === key && Date.now() - cache.timestamp < TTL_MS) {
    return NextResponse.json({ ...cache.payload, cached: true });
  }

  // Open-Meteo: get surface pressure, temperature, relative humidity, wind
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) {
    return NextResponse.json({ error: 'Weather provider error' }, { status: 502 });
  }
  const data = await res.json();
  const cur = data.current;
  // Approximate station pressure from MSL pressure: for demo only
  const stationPressureHpa = Number(cur.pressure_msl);
  const payload = {
    stationPressureHpa,
    temperatureC: Number(cur.temperature_2m),
    relativeHumidity: Number(cur.relative_humidity_2m),
    windSpeedMph: Number(cur.wind_speed_10m) * 0.621371,
    windDirectionDeg: Number(cur.wind_direction_10m),
    timestamp: Date.now(),
    provider: 'open-meteo',
  };
  cache = { key, timestamp: Date.now(), payload };
  return NextResponse.json(payload);
}
