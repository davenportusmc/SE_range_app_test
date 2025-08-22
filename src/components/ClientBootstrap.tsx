"use client";
import { useEffect } from 'react';

export default function ClientBootstrap() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const url = '/sw.js';
      navigator.serviceWorker.register(url).catch(() => {});
    }
  }, []);
  return null;
}
