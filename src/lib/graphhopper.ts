import type { UserLevel } from "@/lib/supabase/types";

const GRAPHHOPPER_URL = "https://graphhopper.com/api/1/route";

export type GeneratedRoute = {
  coordinates: [number, number][]; // [lon, lat]
  /** Altitude in metres of each coordinate (same length as `coordinates`). */
  elevations: number[];
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
};

// Errors carry a code (translated where shown); "serviceFailed" may also
// carry the provider's own message in `detail`.
export type GraphHopperErrorCode = "keyMissing" | "serviceFailed" | "noRoute";
export class GraphHopperError extends Error {
  constructor(
    public code: GraphHopperErrorCode,
    public detail?: string
  ) {
    super(detail ?? code);
    this.name = "GraphHopperError";
  }
}

async function callRoute(searchParams: [string, string][]): Promise<GeneratedRoute> {
  const apiKey = process.env.GRAPHHOPPER_API_KEY;
  if (!apiKey) {
    throw new GraphHopperError("keyMissing");
  }

  const url = new URL(GRAPHHOPPER_URL);
  for (const [key, value] of searchParams) url.searchParams.append(key, value);
  url.searchParams.set("vehicle", "foot");
  url.searchParams.set("points_encoded", "false");
  // Without this GraphHopper returns neither altitudes nor `ascend`.
  url.searchParams.set("elevation", "true");
  url.searchParams.set("locale", "fr");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json();

  if (!res.ok) {
    throw new GraphHopperError("serviceFailed", body?.message || undefined);
  }

  const path = body?.paths?.[0];
  const points = path?.points?.coordinates as [number, number, number?][] | undefined;
  if (!points?.length) {
    throw new GraphHopperError("noRoute");
  }

  return {
    // Altitudes are split off so the 2D track keeps the shape every other
    // part of the app (map, create_route RPC, GPX export) expects.
    coordinates: points.map(([lon, lat]) => [lon, lat] as [number, number]),
    elevations: points.map((p) => Math.round(p[2] ?? 0)),
    distanceKm: Math.round((path.distance / 1000) * 100) / 100,
    elevationGainM: Math.round(path.ascend ?? 0),
    elevationLossM: Math.round(path.descend ?? 0),
  };
}

// GraphHopper's round_trip algorithm builds a walking loop of roughly the
// requested distance from a single starting point — it already covers the
// "distance souhaitée -> boucle praticable" use case from §5 of the cahier
// des charges, no custom pathfinding needed on our side.
export function generateRoundTripRoute(params: {
  lat: number;
  lon: number;
  distanceKm: number;
  seed: number;
}): Promise<GeneratedRoute> {
  return callRoute([
    ["point", `${params.lat},${params.lon}`],
    ["algorithm", "round_trip"],
    ["round_trip.distance", String(Math.round(params.distanceKm * 1000))],
    ["round_trip.seed", String(params.seed)],
  ]);
}

const EARTH_RADIUS_KM = 6371;

/** Point `distanceKm` away from (lat, lon) along `bearingDeg` (0 = north). */
export function destinationPoint(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceKm: number
): { lat: number; lon: number } {
  const rad = Math.PI / 180;
  const angular = distanceKm / EARTH_RADIUS_KM;
  const bearing = bearingDeg * rad;
  const lat1 = lat * rad;
  const lon1 = lon * rad;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: lat2 / rad, lon: lon2 / rad };
}

// A one-way hike has no built-in "go about N km" mode, so the destination is
// picked on a bearing at a guessed straight-line distance, then corrected
// once from the distance the router actually found (trails are rarely
// straight, so the first guess is usually short).
const ONE_WAY_FIRST_GUESS = 0.75;

export async function generateOneWayRoute(params: {
  lat: number;
  lon: number;
  distanceKm: number;
  bearingDeg: number;
}): Promise<GeneratedRoute> {
  const attempt = (crowKm: number) => {
    const to = destinationPoint(params.lat, params.lon, params.bearingDeg, crowKm);
    return callRoute([
      ["point", `${params.lat},${params.lon}`],
      ["point", `${to.lat},${to.lon}`],
    ]);
  };

  const firstCrow = params.distanceKm * ONE_WAY_FIRST_GUESS;
  const first = await attempt(firstCrow);
  const error = Math.abs(first.distanceKm - params.distanceKm) / params.distanceKm;
  if (error <= 0.15) return first;

  const ratio = Math.min(1.6, Math.max(0.5, params.distanceKm / first.distanceKm));
  try {
    const second = await attempt(firstCrow * ratio);
    const secondError = Math.abs(second.distanceKm - params.distanceKm);
    return secondError < Math.abs(first.distanceKm - params.distanceKm) ? second : first;
  } catch {
    return first;
  }
}

// Route difficulty (distinct from the hiker's own progression level, §2.7):
// derived purely from this single route's distance + elevation gain.
export function classifyRouteLevel(distanceKm: number, elevationGainM: number): UserLevel {
  if (distanceKm <= 8 && elevationGainM <= 300) return "debutant";
  if (distanceKm <= 15 && elevationGainM <= 700) return "amateur";
  return "avance";
}
