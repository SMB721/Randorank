// Sunset time for a position, from the standard sunrise equation (accurate to
// a couple of minutes, which is all a hiker needs). Returns null during polar
// day/night, when the sun doesn't set.
export function sunsetAt(lat: number, lon: number, now: Date = new Date()): Date | null {
  const rad = Math.PI / 180;
  const julian = now.getTime() / 86_400_000 + 2_440_587.5;
  const n = Math.round(julian - 2_451_545);
  const meanSolarTime = n - lon / 360;
  const anomaly = (357.5291 + 0.98560028 * meanSolarTime) % 360;
  const center =
    1.9148 * Math.sin(anomaly * rad) +
    0.02 * Math.sin(2 * anomaly * rad) +
    0.0003 * Math.sin(3 * anomaly * rad);
  const longitude = (anomaly + center + 180 + 102.9372) % 360;
  const transit =
    2_451_545 + meanSolarTime + 0.0053 * Math.sin(anomaly * rad) - 0.0069 * Math.sin(2 * longitude * rad);
  const declination = Math.asin(Math.sin(longitude * rad) * Math.sin(23.4397 * rad));
  const cosHourAngle =
    (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(declination)) /
    (Math.cos(lat * rad) * Math.cos(declination));
  if (cosHourAngle < -1 || cosHourAngle > 1) return null;
  const hourAngle = Math.acos(cosHourAngle) / rad;
  return new Date((transit + hourAngle / 360 - 2_440_587.5) * 86_400_000);
}
