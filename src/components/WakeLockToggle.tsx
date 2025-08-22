"use client";
import { useCallback, useEffect, useRef, useState } from 'react';

export default function WakeLockToggle() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  const release = useCallback(async () => {
    try {
      await wakeLockRef.current?.release?.();
    } catch {}
    wakeLockRef.current = null;
    setActive(false);
  }, []);

  const acquire = useCallback(async () => {
    if (!supported) return;
    try {
      const navAny = navigator as any;
      const lock = await navAny.wakeLock.request('screen');
      wakeLockRef.current = lock;
      setActive(true);
      lock.addEventListener?.('release', () => setActive(false));
    } catch {
      setActive(false);
    }
  }, [supported]);

  // Re-acquire on tab focus
  useEffect(() => {
    if (!supported) return;
    const onVis = () => {
      if (document.visibilityState === 'visible' && active && !wakeLockRef.current) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [supported, active, acquire]);

  if (!supported) {
    return <button className="btn w-full opacity-60" title="Wake Lock not supported">No Wake Lock</button>;
  }

  return active ? (
    <button className="btn w-full bg-green-800 hover:bg-green-700" onClick={release}>Screen On</button>
  ) : (
    <button className="btn w-full" onClick={acquire}>Keep Awake</button>
  );
}
