"use client";
import Link from 'next/link';
import WakeLockToggle from '@/components/WakeLockToggle';

export default function MobileActions() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 border-t border-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70">
      <div className="mx-auto max-w-6xl px-4 py-2 grid grid-cols-4 gap-2">
        <Link href="/reticle" className="btn">Reticle</Link>
        <Link href="/true" className="btn">True</Link>
        <Link href="/dope" className="btn">Print</Link>
        <WakeLockToggle />
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
