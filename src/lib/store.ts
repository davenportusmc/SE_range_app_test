import { create } from 'zustand';
import type { CombinedProfile, Environment, LoadProfile, RifleProfile } from './types';
import { DEFAULT_LAT, DEFAULT_LON, PLATES_YDS } from './constants';

export interface AppState {
  rifles: RifleProfile[];
  loads: LoadProfile[];
  combinedProfiles: CombinedProfile[];
  selectedRifleId?: string;
  selectedLoadId?: string;
  selectedProfileId?: string;
  platesYds: number[];
  currentDistanceYds: number;
  env?: Environment;
  weatherFetchedAt?: number;
  windGustMph?: number;
  setRifles: (r: RifleProfile[]) => void;
  setLoads: (l: LoadProfile[]) => void;
  updateRifle: (r: RifleProfile) => void;
  updateLoad: (l: LoadProfile) => void;
  setCombinedProfiles: (p: CombinedProfile[]) => void;
  selectRifle: (id: string) => void;
  selectLoad: (id: string) => void;
  selectProfile: (id: string) => void;
  setDistance: (yds: number) => void;
  setEnv: (e: Environment) => void;
  setWind: (mph: number, dirDeg: number) => void;
  setWindGust: (mph?: number) => void;
  updateSelectedLoadMv: (mv: number) => void;
  createProfile: (p: Omit<CombinedProfile, 'id'>) => CombinedProfile;
  updateProfile: (p: CombinedProfile) => void;
  deleteProfile: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  rifles: [],
  loads: [],
  combinedProfiles: [],
  selectedRifleId: undefined,
  selectedLoadId: undefined,
  selectedProfileId: undefined,
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
  setRifles: (r) => set(() => {
    let rifles = r.map(it => ({
      ...it,
      zeroRangeYds: it.zeroRangeYds ?? 100,
      sightHeightIn: it.sightHeightIn ?? 1.9,
      clickUnit: it.clickUnit ?? 'MIL',
      clickValue: it.clickValue ?? 0.1,
    }));
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('custom_rifles');
        if (raw) {
          const custom = JSON.parse(raw) as RifleProfile[];
          const map = new Map(rifles.map(x => [x.id, x]));
          for (const cr of custom) map.set(cr.id, cr);
          rifles = Array.from(map.values()).map(it => ({
            ...it,
            zeroRangeYds: it.zeroRangeYds ?? 100,
            sightHeightIn: it.sightHeightIn ?? 1.9,
            clickUnit: it.clickUnit ?? 'MIL',
            clickValue: it.clickValue ?? 0.1,
          }));
        }
      } catch {}
    }
    return { rifles, selectedRifleId: rifles[0]?.id };
  }),
  setLoads: (l) => set(() => {
    let loads = l.map(it => ({
      ...it,
      bc: { model: it.bc?.model ?? 'G7', value: it.bc?.value ?? it.bc?.value ?? 0.3 },
    }));
    if (typeof window !== 'undefined') {
      try {
        // apply MV overrides
        const raw = window.localStorage.getItem('mv_overrides');
        if (raw) {
          const map = JSON.parse(raw) as Record<string, number>;
          loads = loads.map((it) => (map[it.id] ? { ...it, muzzleVelocityFps: map[it.id] } : it));
        }
        // merge custom loads
        const rawLoads = window.localStorage.getItem('custom_loads');
        if (rawLoads) {
          const custom = JSON.parse(rawLoads) as LoadProfile[];
          const map2 = new Map(loads.map(x => [x.id, x]));
          for (const cl of custom) map2.set(cl.id, cl);
          loads = Array.from(map2.values()).map(it => ({
            ...it,
            bc: { model: it.bc?.model ?? 'G7', value: it.bc?.value ?? 0.3 },
          }));
        }
      } catch {}
    }
    return { loads, selectedLoadId: loads[0]?.id };
  }),
  updateRifle: (r) => set((state) => {
    const rifles = state.rifles.map((x) => x.id === r.id ? r : x);
    if (typeof window !== 'undefined') {
      try {
        // persist only changed/custom records
        const raw = window.localStorage.getItem('custom_rifles');
        const list = raw ? (JSON.parse(raw) as RifleProfile[]) : [];
        const idx = list.findIndex(x => x.id === r.id);
        if (idx >= 0) list[idx] = r; else list.push(r);
        window.localStorage.setItem('custom_rifles', JSON.stringify(list));
      } catch {}
    }
    return { rifles } as Partial<AppState>;
  }),
  updateLoad: (l) => set((state) => {
    const loads = state.loads.map((x) => x.id === l.id ? l : x);
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('custom_loads');
        const list = raw ? (JSON.parse(raw) as LoadProfile[]) : [];
        const idx = list.findIndex(x => x.id === l.id);
        if (idx >= 0) list[idx] = l; else list.push(l);
        window.localStorage.setItem('custom_loads', JSON.stringify(list));
      } catch {}
    }
    return { loads } as Partial<AppState>;
  }),
  setCombinedProfiles: (p) => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('combined_profiles', JSON.stringify(p)); } catch {}
    }
    set({ combinedProfiles: p });
  },
  selectRifle: (id) => set({ selectedRifleId: id }),
  selectLoad: (id) => set({ selectedLoadId: id }),
  selectProfile: (id) => set((state) => {
    const p = state.combinedProfiles.find((x) => x.id === id);
    if (!p) return { selectedProfileId: undefined } as any;
    return { selectedProfileId: id, selectedRifleId: p.rifleId, selectedLoadId: p.loadId } as Partial<AppState>;
  }),
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
  createProfile: (p) => {
    const id = `cp_${Math.random().toString(36).slice(2, 9)}`;
    const item: CombinedProfile = { id, ...p } as CombinedProfile;
    const next = [...get().combinedProfiles, item];
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('combined_profiles', JSON.stringify(next)); } catch {}
    }
    set({ combinedProfiles: next, selectedProfileId: id, selectedRifleId: item.rifleId, selectedLoadId: item.loadId });
    return item;
  },
  updateProfile: (p) => {
    const next = get().combinedProfiles.map((x) => x.id === p.id ? p : x);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('combined_profiles', JSON.stringify(next)); } catch {}
    }
    set({ combinedProfiles: next });
  },
  deleteProfile: (id) => {
    const next = get().combinedProfiles.filter((x) => x.id !== id);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('combined_profiles', JSON.stringify(next)); } catch {}
    }
    set((state) => ({ combinedProfiles: next, selectedProfileId: state.selectedProfileId === id ? undefined : state.selectedProfileId }));
  },
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

// Load combined profiles from localStorage on client
export function loadCombinedProfilesFromStorage() {
  if (typeof window === 'undefined') return [] as CombinedProfile[];
  try {
    const raw = window.localStorage.getItem('combined_profiles');
    return raw ? (JSON.parse(raw) as CombinedProfile[]) : [];
  } catch {
    return [];
  }
}
