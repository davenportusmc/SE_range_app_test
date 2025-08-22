import type { LoadProfile, RifleProfile } from './types';
import { DEFAULT_RETICLE_ID } from './constants';

export const demoRifles: RifleProfile[] = [
  {
    id: 'rifle-65cm',
    name: '6.5 Creedmoor',
    zeroRangeYds: 100,
    sightHeightIn: 1.8,
    clickUnit: 'MIL',
    clickValue: 0.1,
    reticleId: DEFAULT_RETICLE_ID,
  },
  {
    id: 'rifle-308',
    name: '.308 Win',
    zeroRangeYds: 100,
    sightHeightIn: 1.8,
    clickUnit: 'MIL',
    clickValue: 0.1,
    reticleId: DEFAULT_RETICLE_ID,
  },
  {
    id: 'rifle-223',
    name: '5.56/.223',
    zeroRangeYds: 100,
    sightHeightIn: 1.8,
    clickUnit: 'MIL',
    clickValue: 0.1,
    reticleId: DEFAULT_RETICLE_ID,
  },
  {
    id: 'rifle-300wm',
    name: '.300 Win Mag',
    zeroRangeYds: 100,
    sightHeightIn: 1.8,
    clickUnit: 'MIL',
    clickValue: 0.1,
    reticleId: DEFAULT_RETICLE_ID,
  },
];

export const demoLoads: LoadProfile[] = [
  {
    id: 'load-65cm-140',
    cartridge: '6.5 Creedmoor',
    bulletName: '140gr ELD-M',
    bulletWeightGr: 140,
    bc: { model: 'G7', value: 0.315 },
    muzzleVelocityFps: 2700,
  },
  {
    id: 'load-308-175',
    cartridge: '.308 Win',
    bulletName: '175gr SMK',
    bulletWeightGr: 175,
    bc: { model: 'G7', value: 0.26 },
    muzzleVelocityFps: 2600,
  },
  {
    id: 'load-223-77',
    cartridge: '5.56/.223',
    bulletName: '77gr OTM',
    bulletWeightGr: 77,
    bc: { model: 'G7', value: 0.2 },
    muzzleVelocityFps: 2750,
  },
  {
    id: 'load-300wm-190',
    cartridge: '.300 Win Mag',
    bulletName: '190gr LR',
    bulletWeightGr: 190,
    bc: { model: 'G7', value: 0.29 },
    muzzleVelocityFps: 2900,
  },
];
