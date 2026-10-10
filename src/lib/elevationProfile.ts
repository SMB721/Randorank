const EARTH_RADIUS_M = 6_371_000;

function haversineM(a: [number, number], b: [number, number]): number {
  const rad = Math.PI / 180;
  const dLat = (b[1] - a[1]) * rad;
  const dLon = (b[0] - a[0]) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export type ProfilePoint = { km: number; alt: number };

/**
 * Altitude against distance walked, from the track ([lon, lat] pairs) and its
 * per-point altitudes. Long tracks are thinned to `maxPoints` so the chart
 * stays light without losing its shape.
 */
export function buildProfile(
  coordinates: [number, number][],
  elevations: number[],
  maxPoints = 200
): ProfilePoint[] {
  const n = Math.min(coordinates.length, elevations.length);
  if (n < 2) return [];

  const cumulative: number[] = [0];
  for (let i = 1; i < n; i++) {
    cumulative.push(cumulative[i - 1] + haversineM(coordinates[i - 1], coordinates[i]));
  }

  const step = Math.max(1, Math.ceil(n / maxPoints));
  const points: ProfilePoint[] = [];
  for (let i = 0; i < n; i += step) {
    points.push({ km: cumulative[i] / 1000, alt: elevations[i] });
  }
  const last = n - 1;
  if ((n - 1) % step !== 0) points.push({ km: cumulative[last] / 1000, alt: elevations[last] });
  return points;
}

const MAX_STORED_SAMPLES = 300;
const SMOOTHING_RADIUS = 2;
// Below this share of points carrying an altitude the profile would be mostly
// invented, so none is stored.
const MIN_ALTITUDE_COVERAGE = 0.8;

/**
 * Altitudes of a recorded/imported track, ready to store: gaps filled from the
 * previous known value, lightly smoothed (raw GPS altitude is jittery), and
 * thinned to at most MAX_STORED_SAMPLES evenly spaced samples. Returns null
 * when too few points have an altitude to draw an honest profile.
 */
export function sampleElevations(raw: (number | null)[]): number[] | null {
  const n = raw.length;
  if (n < 2) return null;
  const known = raw.filter((v): v is number => v !== null).length;
  if (known / n < MIN_ALTITUDE_COVERAGE) return null;

  const filled: number[] = [];
  let previous = raw.find((v): v is number => v !== null) as number;
  for (const value of raw) {
    previous = value ?? previous;
    filled.push(previous);
  }

  const smoothed = filled.map((_, i) => {
    const from = Math.max(0, i - SMOOTHING_RADIUS);
    const to = Math.min(n - 1, i + SMOOTHING_RADIUS);
    let sum = 0;
    for (let j = from; j <= to; j++) sum += filled[j];
    return sum / (to - from + 1);
  });

  const m = Math.min(n, MAX_STORED_SAMPLES);
  return Array.from({ length: m }, (_, k) =>
    Math.round(smoothed[Math.round((k * (n - 1)) / (m - 1))])
  );
}

/** Track points at the indices a stored profile of `m` samples refers to. */
export function sampleCoordinates(
  coordinates: [number, number][],
  m: number
): [number, number][] {
  const n = coordinates.length;
  if (m < 2 || n < 2) return [];
  return Array.from({ length: m }, (_, k) => coordinates[Math.round((k * (n - 1)) / (m - 1))]);
}
