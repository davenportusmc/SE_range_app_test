import Link from 'next/link';
import WeatherPill from '@/components/WeatherPill';
import ProfileChips from '@/components/ProfileChips';
import PlateChips from '@/components/PlateChips';
import WindControls from '@/components/WindControls';
import OutputPanel from '@/components/OutputPanel';

export default function Page() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <WeatherPill />
        <div className="space-x-2">
          <Link className="btn" href="/reticle">Reticle View</Link>
          <Link className="btn" href="/true">Truing</Link>
          <Link className="btn" href="/dope">DOPE Card</Link>
        </div>
      </div>

      <ProfileChips />

      <section className="space-y-3">
        <div className="text-sm text-neutral-400">Targets</div>
        <PlateChips />
      </section>

      <WindControls />

      <OutputPanel />
    </main>
  );
}
