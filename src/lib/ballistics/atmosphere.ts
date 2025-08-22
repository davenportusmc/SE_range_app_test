// Atmosphere utilities: simplified, demo-accuracy.
// References: ISA, standard psychrometrics approximations.

export function speedOfSound(temperatureC: number): number {
  // a = sqrt(gamma * R * T)
  // Approximate via linear around 20C: ~343 m/s; Convert to fps
  const tempK = temperatureC + 273.15;
  const a_ms = Math.sqrt(1.4 * 287.05 * tempK);
  return a_ms * 3.28084; // fps
}

export function airDensity(stationPressureHpa: number, temperatureC: number, relativeHumidity: number): number {
  // Compute density using partial pressures; RH used as a small correction
  // Convert hPa to Pa
  const p = stationPressureHpa * 100;
  const T = temperatureC + 273.15;
  const RH = Math.max(0, Math.min(100, relativeHumidity)) / 100;
  // Saturation vapor pressure over water (Tetens) in Pa
  const es = 6.112 * Math.exp((17.67 * temperatureC) / (temperatureC + 243.5)) * 100;
  const e = RH * es;
  const pd = p - e; // dry air partial pressure
  const Rd = 287.05; // J/(kg·K)
  const Rv = 461.495;
  const rho = pd / (Rd * T) + e / (Rv * T);
  return rho; // kg/m^3
}

export function densityAltitude(stationPressureHpa: number, temperatureC: number): number {
  // Use barometric formula and ISA lapse rate approximation
  // Convert to feet
  const p = stationPressureHpa * 100; // Pa
  const T = temperatureC + 273.15;
  const p0 = 101325; // sea-level standard
  const L = 0.0065; // K/m
  const g = 9.80665;
  const R = 287.05;
  // Pressure altitude (approx)
  const h_pa_m = (T / L) * (1 - Math.pow(p / p0, (R * L) / g));
  // Temperature deviation adjustment to density altitude
  // ISA temp at altitude:
  const T_isa = 288.15 - L * h_pa_m;
  const deltaT = (T - T_isa);
  const da_m = h_pa_m + (deltaT / L) * 0.1; // small correction factor for demo
  return da_m * 3.28084; // feet
}
