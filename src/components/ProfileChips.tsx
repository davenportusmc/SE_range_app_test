"use client";
import { useEffect } from 'react';
import { useAppStore, fetchProfiles } from '@/lib/store';

export default function ProfileChips() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const selectedRifleId = useAppStore((s) => s.selectedRifleId);
  const selectedLoadId = useAppStore((s) => s.selectedLoadId);
  const setRifles = useAppStore((s) => s.setRifles);
  const setLoads = useAppStore((s) => s.setLoads);
  const selectRifle = useAppStore((s) => s.selectRifle);
  const selectLoad = useAppStore((s) => s.selectLoad);

  useEffect(() => {
    if (rifles.length === 0 || loads.length === 0) {
      fetchProfiles().then(({ rifles, loads }) => {
        setRifles(rifles);
        setLoads(loads);
      });
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-neutral-400">Rifle</span>
        {rifles.map((r) => (
          <button key={r.id} className={`chip ${selectedRifleId === r.id ? 'bg-neutral-800' : ''}`} onClick={() => selectRifle(r.id)}>
            {r.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-neutral-400">Load</span>
        {loads.map((l) => (
          <button key={l.id} className={`chip ${selectedLoadId === l.id ? 'bg-neutral-800' : ''}`} onClick={() => selectLoad(l.id)}>
            {l.cartridge} — {l.bulletName}
          </button>
        ))}
      </div>
    </div>
  );
}
