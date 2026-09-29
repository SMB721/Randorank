const EARTH_RADIUS_M = 6371000;

function distanceMeters([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

// Wide enough to obscure which building a route starts or ends at, narrow
// enough that the rest of the route stays meaningful — the same order of
// magnitude other hiking/running apps use for a "privacy zone".
export const BLUR_RADIUS_M = 300;

// Trims the start and end of a track so no point within radiusMeters of the
// actual start/finish is ever rendered — used to keep a trace from pointing
// straight at someone's front door. Only affects display; the real
// coordinates are untouched in the database.
export function blurEndpoints(
  coordinates: [number, number][],
  radiusMeters: number = BLUR_RADIUS_M
): [number, number][] {
  if (coordinates.length < 2) return coordinates;

  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];

  let startIdx = 0;
  while (
    startIdx < coordinates.length - 1 &&
    distanceMeters(start, coordinates[startIdx]) < radiusMeters
  ) {
    startIdx++;
  }

  let endIdx = coordinates.length - 1;
  while (endIdx > startIdx && distanceMeters(end, coordinates[endIdx]) < radiusMeters) {
    endIdx--;
  }

  if (startIdx >= endIdx) {
    // The whole track sits inside the blur radius (a very short loop) —
    // keep just the two raw endpoints rather than returning an empty path.
    return [coordinates[0], coordinates[coordinates.length - 1]];
  }

  return coordinates.slice(startIdx, endIdx + 1);
}
