"use client";
import { useEffect } from 'react';
import { useAppStore, fetchProfiles, loadCombinedProfilesFromStorage } from '@/lib/store';

export default function ReticleSelectors() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const combined = useAppStore((s) => s.combinedProfiles);
  const plates = useAppStore((s) => s.platesYds);
  const rifleId = useAppStore((s) => s.selectedRifleId);
  const loadId = useAppStore((s) => s.selectedLoadId);
  const profileId = useAppStore((s) => s.selectedProfileId);
  const distance = useAppStore((s) => s.currentDistanceYds);
  const setRifles = useAppStore((s) => s.setRifles);
  const setLoads = useAppStore((s) => s.setLoads);
  const setCombinedProfiles = useAppStore((s) => s.setCombinedProfiles);
  const selectRifle = useAppStore((s) => s.selectRifle);
  const selectLoad = useAppStore((s) => s.selectLoad);
  const selectProfile = useAppStore((s) => s.selectProfile);
  const setDistance = useAppStore((s) => s.setDistance);

  useEffect(() => {
    if (rifles.length === 0 || loads.length === 0) {
      fetchProfiles().then(({ rifles, loads }) => { setRifles(rifles); setLoads(loads); });
    }
    // load combined profiles from storage on first mount
    if (combined.length === 0 && typeof window !== 'undefined') {
      const saved = loadCombinedProfilesFromStorage();
      if (saved.length) setCombinedProfiles(saved);
    }
  }, []);

  const hasCombined = combined.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {hasCombined ? (
        <div>
          <label className="text-xs text-neutral-400">Profile</label>
          <div className="flex gap-2">
            <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
              value={profileId ?? ''}
              onChange={(e) => selectProfile(e.target.value)}>
              {combined.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <a className="btn whitespace-nowrap" href="/profile">Manage</a>
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="text-xs text-neutral-400">Rifle</label>
            <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
              value={rifleId ?? ''}
              onChange={(e) => selectRifle(e.target.value)}>
              {rifles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400">Load</label>
            <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
              value={loadId ?? ''}
              onChange={(e) => selectLoad(e.target.value)}>
              {loads.map(l => (
                <option key={l.id} value={l.id}>{l.cartridge} — {l.bulletName}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <a className="btn w-full" href="/profile">Create Profile</a>
          </div>
        </>
      )}
      <div>
        <label className="text-xs text-neutral-400">Target Distance (yds)</label>
        <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value, 10))}>
          {plates.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
