import type { UserLevel } from "@/lib/supabase/types";

const GRAPHHOPPER_URL = "https://graphhopper.com/api/1/route";

export type GeneratedRoute = {
  coordinates: [number, number][]; // [lon, lat]
  distanceKm: number;
  elevationGainM: number;
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

// GraphHopper's round_trip algorithm builds a walking loop of roughly the
// requested distance from a single starting point — it already covers the
// "distance souhaitée -> boucle praticable" use case from §5 of the cahier
// des charges, no custom pathfinding needed on our side.
export async function generateRoundTripRoute(params: {
  lat: number;
  lon: number;
  distanceKm: number;
  seed: number;
}): Promise<GeneratedRoute> {
  const apiKey = process.env.GRAPHHOPPER_API_KEY;
  if (!apiKey) {
    throw new GraphHopperError("keyMissing");
  }

  const url = new URL(GRAPHHOPPER_URL);
  url.searchParams.set("point", `${params.lat},${params.lon}`);
  url.searchParams.set("vehicle", "foot");
  url.searchParams.set("algorithm", "round_trip");
  url.searchParams.set("round_trip.distance", String(Math.round(params.distanceKm * 1000)));
  url.searchParams.set("round_trip.seed", String(params.seed));
  url.searchParams.set("points_encoded", "false");
  url.searchParams.set("locale", "fr");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json();

  if (!res.ok) {
    throw new GraphHopperError("serviceFailed", body?.message || undefined);
  }

  const path = body?.paths?.[0];
  if (!path?.points?.coordinates?.length) {
    throw new GraphHopperError("noRoute");
  }

  return {
    coordinates: path.points.coordinates as [number, number][],
    distanceKm: Math.round((path.distance / 1000) * 100) / 100,
    elevationGainM: Math.round(path.ascend ?? 0),
  };
}

// Route difficulty (distinct from the hiker's own progression level, §2.7):
// derived purely from this single route's distance + elevation gain.
export function classifyRouteLevel(distanceKm: number, elevationGainM: number): UserLevel {
  if (distanceKm <= 8 && elevationGainM <= 300) return "debutant";
  if (distanceKm <= 15 && elevationGainM <= 700) return "amateur";
  return "avance";
}
