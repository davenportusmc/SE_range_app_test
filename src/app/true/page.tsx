"use client";
import dynamic from 'next/dynamic';
import WeatherPill from '@/components/WeatherPill';
const WindControls = dynamic(() => import('@/components/WindControls'), { ssr: false });
const TruingPanel = dynamic(() => import('@/components/TruingPanel'), { ssr: false });
const ReticleSelectors = dynamic(() => import('@/components/ReticleSelectors'), { ssr: false });

export default function TruePage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <WeatherPill />
      </div>
      <ReticleSelectors />
      <WindControls />
      <TruingPanel />
    </main>
  );
}
