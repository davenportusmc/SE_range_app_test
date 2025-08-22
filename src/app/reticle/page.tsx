import WeatherPill from '@/components/WeatherPill';
import ProfileChips from '@/components/ProfileChips';
import PlateChips from '@/components/PlateChips';
import WindControls from '@/components/WindControls';
import ReticleVisualizer from '@/components/ReticleVisualizer';

export default function ReticlePage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <WeatherPill />
      </div>
      <ProfileChips />
      <section className="space-y-3">
        <div className="text-sm text-neutral-400">Targets</div>
        <PlateChips />
      </section>
      <WindControls />
      <ReticleVisualizer />
    </main>
  );
}
