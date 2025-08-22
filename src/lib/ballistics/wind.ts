export function crosswindComponentMph(windSpeedMph: number, windDirectionDeg: number, azimuthDeg: number = 0): number {
  // windDirectionDeg = direction from which wind blows (meteorological)
  // Convert to math: wind vector heading = from where; bullet azimuth is direction of fire.
  const rel = ((windDirectionDeg - azimuthDeg + 360) % 360);
  const angleRad = (rel * Math.PI) / 180;
  // Crosswind magnitude is sin(relative angle)
  return Math.abs(Math.sin(angleRad)) * windSpeedMph;
}
