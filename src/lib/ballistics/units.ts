export function inchesToMil(inches: number, distanceYds: number): number {
  const inchesPerMil = (distanceYds * 36) / 1000;
  return inches / inchesPerMil;
}

export function inchesToMoa(inches: number, distanceYds: number): number {
  // 1 MOA ~ 1.047 in at 100 yds
  const inchesPerMoa = 1.047 * (distanceYds / 100);
  return inches / inchesPerMoa;
}

export function milToInches(mil: number, distanceYds: number): number {
  const inchesPerMil = (distanceYds * 36) / 1000;
  return mil * inchesPerMil;
}

export function moaToInches(moa: number, distanceYds: number): number {
  const inchesPerMoa = 1.047 * (distanceYds / 100);
  return moa * inchesPerMoa;
}

export function energyFtlb(velocityFps: number, bulletWeightGr: number): number {
  // E(ft·lb) = (w(grains) * v^2) / 450240
  return (bulletWeightGr * velocityFps * velocityFps) / 450240;
}
