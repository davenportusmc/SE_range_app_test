import { NextResponse } from 'next/server';
import { PLATES_YDS } from '@/lib/constants';

export async function GET() {
  const plates = PLATES_YDS.map((d) => ({ id: `p-${d}`, distanceYds: d }));
  return NextResponse.json({ name: 'Strategic Edge Gun Range', plates });
}
