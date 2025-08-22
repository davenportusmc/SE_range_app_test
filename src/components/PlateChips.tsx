"use client";
import { useAppStore } from '@/lib/store';

export default function PlateChips() {
  const plates = useAppStore((s) => s.platesYds);
  const current = useAppStore((s) => s.currentDistanceYds);
  const setDistance = useAppStore((s) => s.setDistance);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto whitespace-nowrap no-scrollbar -mx-2 px-2">
        {plates.map((d) => (
          <button
            key={d}
            className={`chip mr-2 mb-2 inline-flex shrink-0 ${current === d ? 'bg-neutral-800' : ''}`}
            onClick={() => setDistance(d)}
          >
            {d} yds
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-400">Other</span>
        <input
          type="number"
          inputMode="numeric"
          className="w-28 rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 text-base"
          value={current}
          onChange={(e) => setDistance(parseInt(e.target.value || '0', 10))}
          min={1}
          step={25}
        />
      </div>
    </div>
  );
}
