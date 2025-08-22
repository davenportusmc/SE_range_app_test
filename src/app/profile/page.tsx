"use client";
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore, fetchProfiles, loadCombinedProfilesFromStorage } from '@/lib/store';

// Defer any heavy client features if added later
const ClientBootstrap = dynamic(() => import('@/components/ClientBootstrap'), { ssr: false });

export default function ProfilePage() {
  const rifles = useAppStore((s) => s.rifles);
  const loads = useAppStore((s) => s.loads);
  const combined = useAppStore((s) => s.combinedProfiles);
  const setRifles = useAppStore((s) => s.setRifles);
  const setLoads = useAppStore((s) => s.setLoads);
  const setCombined = useAppStore((s) => s.setCombinedProfiles);
  const createProfile = useAppStore((s) => s.createProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const deleteProfile = useAppStore((s) => s.deleteProfile);
  const selectProfile = useAppStore((s) => s.selectProfile);
  const updateRifle = useAppStore((s) => s.updateRifle);
  const updateLoad = useAppStore((s) => s.updateLoad);

  const [name, setName] = useState("");
  const [rifleId, setRifleId] = useState<string>("");
  const [loadId, setLoadId] = useState<string>("");
  const [editingRifle, setEditingRifle] = useState<any>(null);
  const [editingLoad, setEditingLoad] = useState<any>(null);

  useEffect(() => {
    // seed base rifles/loads
    if (rifles.length === 0 || loads.length === 0) {
      fetchProfiles().then(({ rifles, loads }) => { setRifles(rifles); setLoads(loads); });
    }
    // bring in saved combined profiles
    if (combined.length === 0 && typeof window !== 'undefined') {
      const saved = loadCombinedProfilesFromStorage();
      if (saved.length) setCombined(saved);
    }
  }, []);

  useEffect(() => {
    // set defaults for the form
    if (!rifleId && rifles[0]) setRifleId(rifles[0].id);
    if (!loadId && loads[0]) setLoadId(loads[0].id);
    if (!name && rifles[0] && loads[0]) setName(`${rifles[0].name} — ${loads[0].cartridge} ${loads[0].bulletName}`);
    // hydrate editing objects
    const r = rifles.find(x => x.id === rifleId) || rifles[0];
    const l = loads.find(x => x.id === loadId) || loads[0];
    if (r) setEditingRifle(r);
    if (l) setEditingLoad(l);
  }, [rifles, loads]);

  const rifleMap = useMemo(() => Object.fromEntries(rifles.map(r => [r.id, r])), [rifles]);
  const loadMap = useMemo(() => Object.fromEntries(loads.map(l => [l.id, l])), [loads]);

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !rifleId || !loadId) return;
    const p = createProfile({ name, rifleId, loadId });
    selectProfile(p.id);
    setName("");
  }

  function onChangeRifleField<K extends keyof typeof editingRifle>(key: K, val: any) {
    setEditingRifle((prev: any) => ({ ...prev, [key]: val }));
  }

  function onSaveRifle(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRifle) return;
    updateRifle(editingRifle);
  }

  function onChangeLoadField<K extends keyof typeof editingLoad>(key: K, val: any) {
    setEditingLoad((prev: any) => ({ ...prev, [key]: val }));
  }

  function onSaveLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLoad) return;
    updateLoad(editingLoad);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <ClientBootstrap />
      <h1 className="text-xl font-semibold">Profiles</h1>

      <form onSubmit={onCreate} className="space-y-3 rounded-md border border-neutral-800 p-4 bg-neutral-950">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-neutral-400">Name</label>
            <input className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 6.5CM — 140 ELD-M (Rifle A)" />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Rifle</label>
            <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={rifleId} onChange={(e) => { setRifleId(e.target.value); const r = rifleMap[e.target.value]; if (r) setEditingRifle(r); }}>
              {rifles.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-neutral-400">Load</label>
            <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={loadId} onChange={(e) => { setLoadId(e.target.value); const l = loadMap[e.target.value]; if (l) setEditingLoad(l); }}>
              {loads.map(l => (<option key={l.id} value={l.id}>{l.cartridge} — {l.bulletName}</option>))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" type="submit">Create</button>
          <a className="btn" href="/">Back</a>
        </div>
      </form>

      {/* Rifle editor */}
      {editingRifle && (
        <form onSubmit={onSaveRifle} className="space-y-3 rounded-md border border-neutral-800 p-4 bg-neutral-950">
          <div className="text-sm text-neutral-400">Rifle</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Rifle Name</label>
              <input className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingRifle.name || ''} onChange={(e) => onChangeRifleField('name', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Click Unit</label>
              <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingRifle.clickUnit} onChange={(e) => onChangeRifleField('clickUnit', e.target.value)}>
                <option value="MIL">MIL</option>
                <option value="MOA">MOA</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400">Click Value</label>
              <input type="number" step="0.01" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingRifle.clickValue ?? 0.1} onChange={(e) => onChangeRifleField('clickValue', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Zero Range (yds)</label>
              <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingRifle.zeroRangeYds ?? 100} onChange={(e) => onChangeRifleField('zeroRangeYds', parseInt(e.target.value, 10))} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Sight Height (in)</label>
              <input type="number" step="0.01" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingRifle.sightHeightIn ?? 1.9} onChange={(e) => onChangeRifleField('sightHeightIn', parseFloat(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn" type="submit">Save Rifle</button>
          </div>
        </form>
      )}

      {/* Load editor */}
      {editingLoad && (
        <form onSubmit={onSaveLoad} className="space-y-3 rounded-md border border-neutral-800 p-4 bg-neutral-950">
          <div className="text-sm text-neutral-400">Load</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Cartridge</label>
              <input className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.cartridge || ''} onChange={(e) => onChangeLoadField('cartridge', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Bullet Name</label>
              <input className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.bulletName || ''} onChange={(e) => onChangeLoadField('bulletName', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Bullet Weight (gr)</label>
              <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.bulletWeightGr ?? 0} onChange={(e) => onChangeLoadField('bulletWeightGr', parseInt(e.target.value, 10))} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">BC Model</label>
              <select className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.bc?.model || 'G7'} onChange={(e) => onChangeLoadField('bc', { ...editingLoad.bc, model: e.target.value })}>
                <option value="G7">G7</option>
                <option value="G1">G1</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400">BC Value</label>
              <input type="number" step="0.001" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.bc?.value ?? 0} onChange={(e) => onChangeLoadField('bc', { ...editingLoad.bc, value: parseFloat(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Muzzle Velocity (fps)</label>
              <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.muzzleVelocityFps ?? 0} onChange={(e) => onChangeLoadField('muzzleVelocityFps', parseInt(e.target.value, 10))} />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Temp Sensitivity (fps / +10°F)</label>
              <input type="number" className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2" value={editingLoad.tempSensitivityFpsPer10F ?? 0} onChange={(e) => onChangeLoadField('tempSensitivityFpsPer10F', parseInt(e.target.value, 10))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn" type="submit">Save Load</button>
          </div>
        </form>
      )}
      <div className="rounded-md border border-neutral-800">
        <div className="px-4 py-2 border-b border-neutral-800 text-sm text-neutral-400">Saved Profiles</div>
        <div className="divide-y divide-neutral-800">
          {combined.length === 0 ? (
            <div className="p-4 text-neutral-500 text-sm">No profiles yet. Create one above.</div>
          ) : combined.map((p) => (
            <div key={p.id} className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="text-neutral-200 font-medium">{p.name}</div>
                <div className="text-neutral-500 text-xs">
                  Rifle: {rifleMap[p.rifleId]?.name ?? p.rifleId} · Load: {loadMap[p.loadId]?.cartridge} — {loadMap[p.loadId]?.bulletName}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={() => selectProfile(p.id)}>Use</button>
                <button className="btn" onClick={() => updateProfile({ ...p, name: prompt('Rename profile', p.name) || p.name })}>Rename</button>
                <button className="btn bg-red-800 hover:bg-red-700" onClick={() => deleteProfile(p.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
