# Range Dope Assistant

A Next.js 14 + TypeScript + Tailwind app to get from zero to DOPE quickly, with a simple but consistent ballistics solver, reticle visualizer, and fast truing workflow.

## Quick Start
1) Install Node.js LTS (if not installed)
- Windows: https://nodejs.org/en (LTS). After install, restart your terminal.
- Verify:
  - node -v
  - npm -v

2) Install deps
```bash
npm install
```

3) Dev server
```bash
npm run dev
```
App will run at http://localhost:3000

4) Tests
```bash
npm test
```

5) Production
```bash
npm run build && npm run start
```

## Environment (optional)
Create `.env.local` to override defaults:
```
DEFAULT_LAT=35.626458
DEFAULT_LON=-86.693331
DEFAULT_TIMEZONE=America/Chicago
RANGE_NAME=Strategic Edge Gun Range
```

## Features
- Reticle Visualizer (`/reticle`)
  - Component: `src/components/ReticleVisualizer.tsx`
  - Plots current elevation and wind from `/api/solve`, with wind brackets and grid in MIL/MOA.
- Truing (`/true`)
  - Component: `src/components/TruingPanel.tsx`
  - Computes proposed `muzzleVelocityFps` via bisection to match observed elevation at a known distance.
  - Zero Offset input (observed − zeroOffset) and residual display with tolerances.
  - Transonic warning and MV bounds clamp (70–130% of current MV).
  - Persists MV overrides in localStorage; reloaded into the store on app start.

## API
- POST `/api/solve` — returns per-distance solutions (elevation, wind, TOF, velocity, energy, transonic).
- GET `/api/weather?lat=&lon=` — Open-Meteo proxy, cached briefly.
- GET `/api/range` — Range metadata.
- GET `/api/profiles` — Rifle and load profiles.

## Tech
- Next.js App Router, React 18, TypeScript, TailwindCSS.
- State: `zustand` store in `src/lib/store.ts`.
- Solver: `src/lib/ballistics/solver.ts` (demo-grade, consistent and monotonic for UX).
- Tests: Vitest + jsdom (unit tests in `src/lib/__tests__/`).

## PWA
- Manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js` (caches static assets and weather for short offline use).
- Install to Home Screen on mobile; Wake Lock button available when supported.

## Troubleshooting (Windows)
- "npm is not recognized": install Node.js LTS and reopen your terminal.
- Port in use: change port with `PORT=3001 npm run dev` (PowerShell: `$env:PORT=3001; npm run dev`).
- Type errors: ensure we use `muzzleVelocityFps` (see `src/lib/types.ts`).

## Scripts
- `npm run dev` — start dev server.
- `npm run build` — production build.
- `npm run start` — start production server.
- `npm test` — run unit tests.
- `npm run lint` — run ESLint.

## License
Demo code for educational purposes.
If you can read this, the push worked.
