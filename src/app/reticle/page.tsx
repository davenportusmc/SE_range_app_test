"use client";
import dynamic from 'next/dynamic';
import WeatherPill from '@/components/WeatherPill';
const WindControls = dynamic(() => import('@/components/WindControls'), { ssr: false });
const ReticleVisualizer = dynamic(() => import('@/components/ReticleVisualizer'), { ssr: false });
const ReticleSelectors = dynamic(() => import('@/components/ReticleSelectors'), { ssr: false });

export default function ReticlePage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <WeatherPill />
      </div>
      <ReticleSelectors />
      <WindControls />
      <ReticleVisualizer />
    </main>
  );
}
