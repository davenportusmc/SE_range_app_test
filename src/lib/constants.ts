export const RANGE_NAME = 'Strategic Edge Gun Range';
export const DEFAULT_LAT = 35.626458;
export const DEFAULT_LON = -86.693331;
export const DEFAULT_TIMEZONE = 'America/Chicago';

export const PLATES_YDS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1250,
];

export const RETICLES = [
  { id: 'mil-generic', name: 'Generic MIL Hash', unit: 'MIL' as const, subtensionMil: 0.2 },
  { id: 'moa-generic', name: 'Generic MOA Hash', unit: 'MOA' as const, subtensionMoa: 1.0 },
];

export const DEFAULT_RETICLE_ID = 'mil-generic';
