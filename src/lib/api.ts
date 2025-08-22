import type { Environment, LoadProfile, RifleProfile, Solution } from './types';

export async function solveDope(
  rifle: RifleProfile,
  load: LoadProfile,
  env: Environment,
  distances: number[],
) {
  const res = await fetch('/api/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rifle, load, env, distances }),
  });
  if (!res.ok) throw new Error('solve');
  return (await res.json()) as Solution[];
}
