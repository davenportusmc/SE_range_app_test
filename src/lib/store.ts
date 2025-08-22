import { create } from 'zustand';
import type { Environment, LoadProfile, RifleProfile } from './types';
import { DEFAULT_LAT, DEFAULT_LON, PLATES_YDS } from './constants';

export interface AppState {
  rifles: RifleProfile[];
  loads: LoadProfile[];
  selectedRifleId?: string;
  selectedLoadId?: string;
  platesYds: number[];
  currentDistanceYds: number;
  env?: Environment;
  weatherFetchedAt?: number;
  windGustMph?: number;
  setRifles: (r: RifleProfile[]) => void;
  setLoads: (l: LoadProfile[]) => void;
  selectRifle: (id: string) => void;
  selectLoad: (id: string) => void;
  setDistance: (yds: number) => void;
  setEnv: (e: Environment) => void;
  setWind: (mph: number, dirDeg: number) => void;
  setWindGust: (mph?: number) => void;
  updateSelectedLoadMv: (mv: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  rifles: [],
  loads: [],
  selectedRifleId: undefined,
  selectedLoadId: undefined,
  platesYds: PLATES_YDS,
  currentDistanceYds: PLATES_YDS[0],
  env: {
    stationPressureHpa: 1013.25,
    temperatureC: 15,
    relativeHumidity: 50,
    windSpeedMph: 8,
    windDirectionDeg: 90,
    latitude: undefined,
    azimuthDeg: 0,
  },
  weatherFetchedAt: undefined,
  windGustMph: undefined,
  setRifles: (r) => set({ rifles: r, selectedRifleId: r[0]?.id }),
  setLoads: (l) => set(() => {
    let loads = l;
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('mv_overrides');
        if (raw) {
          const map = JSON.parse(raw) as Record<string, number>;
          loads = l.map((it) => (map[it.id] ? { ...it, muzzleVelocityFps: map[it.id] } : it));
        }
      } catch {}
    }
    return { loads, selectedLoadId: loads[0]?.id };
  }),
  selectRifle: (id) => set({ selectedRifleId: id }),
  selectLoad: (id) => set({ selectedLoadId: id }),
  setDistance: (yds) => set({ currentDistanceYds: Math.max(1, Math.round(yds)) }),
  setEnv: (e) => set({ env: e, weatherFetchedAt: Date.now() }),
  setWind: (mph, dirDeg) => set({ env: { ...(get().env as any), windSpeedMph: mph, windDirectionDeg: dirDeg } }),
  setWindGust: (mph) => set({ windGustMph: mph }),
  updateSelectedLoadMv: (mv) => set((state) => {
    const id = state.selectedLoadId;
    if (!id) return {} as any;
    const loads = state.loads.map((l) => l.id === id ? { ...l, muzzleVelocityFps: mv } : l);
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('mv_overrides');
        const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
        map[id] = mv;
        window.localStorage.setItem('mv_overrides', JSON.stringify(map));
      } catch {}
    }
    return { loads } as Partial<AppState>;
  }),
}));

export async function fetchInitialWeather() {
  const url = `/api/weather?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather');
  const data = await res.json();
  return data as Environment & { timestamp: number };
}

export async function fetchProfiles() {
  const res = await fetch('/api/profiles');
  if (!res.ok) throw new Error('profiles');
  return (await res.json()) as { rifles: RifleProfile[]; loads: LoadProfile[] };
}
