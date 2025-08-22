"use client";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import WeatherPill from '@/components/WeatherPill';
const WindControls = dynamic(() => import('@/components/WindControls'), { ssr: false });
const OutputPanel = dynamic(() => import('@/components/OutputPanel'), { ssr: false });
const ReticleSelectors = dynamic(() => import('@/components/ReticleSelectors'), { ssr: false });

export default function Page() {
  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <WeatherPill />
        <div className="space-x-2 shrink-0">
          <Link className="btn" href="/reticle">Reticle View</Link>
          <Link className="btn" href="/true">Truing</Link>
          <Link className="btn" href="/dope">DOPE Card</Link>
        </div>
      </div>

      <ReticleSelectors />

      <WindControls />

      <OutputPanel />
    </main>
  );
}
