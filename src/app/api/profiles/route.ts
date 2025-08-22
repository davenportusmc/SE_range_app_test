import { NextResponse } from 'next/server';
import { demoRifles, demoLoads } from '@/lib/seeds';

export async function GET() {
  return NextResponse.json({ rifles: demoRifles, loads: demoLoads });
}
