import { NextResponse } from 'next/server';
import { solveOne } from '@/lib/ballistics/solver';
import type { Environment, LoadProfile, RifleProfile, SolveOptions } from '@/lib/types';

export async function POST(req: Request) {
  const body = await req.json();
  const rifle = body.rifle as RifleProfile;
  const load = body.load as LoadProfile;
  const env = body.env as Environment;
  const distances = (body.distances as number[]) ?? [];
  const options = (body.options as SolveOptions) ?? {};

  if (!rifle || !load || !env || distances.length === 0) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const res = distances.map((d) =>
    solveOne({ rifle, load, env, distanceYds: d, options })
  );

  return NextResponse.json(res);
}
