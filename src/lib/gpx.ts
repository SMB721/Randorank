import { XMLParser } from "fast-xml-parser";
import type { Translator } from "@/lib/i18n/app";

// Parsing errors carry a code, translated where they are shown.
export type GpxErrorCode = "invalid" | "noTrack" | "tooFewPoints";
export class GpxError extends Error {
  constructor(public code: GpxErrorCode) {
    super(code);
    this.name = "GpxError";
  }
}

export type TrackPoint = {
  lat: number;
  lon: number;
  ele: number | null;
  time: string | null;
};

export type ParsedGpx = {
  points: TrackPoint[];
  name: string | null;
};

export type GpxStats = {
  distanceKm: number;
  elevationGainM: number;
  durationSeconds: number;
  avgSpeedKmh: number;
  startedAt: string | null;
  isValid: boolean;
  validationNotes: string | null;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseGpx(xml: string): ParsedGpx {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch {
    throw new GpxError("invalid");
  }

  const gpx = (doc as { gpx?: Record<string, unknown> })?.gpx;
  if (!gpx) {
    throw new GpxError("invalid");
  }

  const tracks = asArray(gpx.trk as Record<string, unknown> | Record<string, unknown>[]);
  if (tracks.length === 0) {
    throw new GpxError("noTrack");
  }

  const points: TrackPoint[] = [];
  let name: string | null = null;

  for (const trk of tracks) {
    if (!name && trk.name) name = String(trk.name);
    const segments = asArray(
      trk.trkseg as Record<string, unknown> | Record<string, unknown>[]
    );
    for (const seg of segments) {
      const trkpts = asArray(
        seg.trkpt as Record<string, unknown> | Record<string, unknown>[]
      );
      for (const pt of trkpts) {
        const lat = parseFloat(String(pt["@_lat"]));
        const lon = parseFloat(String(pt["@_lon"]));
        if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
        const ele = pt.ele !== undefined ? parseFloat(String(pt.ele)) : null;
        points.push({
          lat,
          lon,
          ele: ele !== null && !Number.isNaN(ele) ? ele : null,
          time: pt.time ? String(pt.time) : null,
        });
      }
    }
  }

  if (points.length < 2) {
    throw new GpxError("tooFewPoints");
  }

  return { points, name };
}

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: TrackPoint, b: TrackPoint): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Sustained speed ceiling for a hiker (generous, covers fast descents and
// light trail running). A segment faster than this is excluded from the
// distance/elevation totals — most often it's GPS noise (weak indoor
// signal, multipath), not a real hike, so it's dropped rather than
// counted.
const NOISE_SPEED_KMH = 15;
// No hiker crosses this between two consecutive fixes — a genuinely
// fabricated or teleported trace, always invalidates the hike outright,
// regardless of how the rest of the trace looks.
const IMPOSSIBLE_SPEED_KMH = 60;
// A handful of noisy segments is normal (weak signal for a few seconds).
// If more than this share of the whole trace is noisy, the signal was
// unreliable throughout and the hike isn't counted.
const MAX_NOISE_RATIO = 0.25;

export function computeStats(points: TrackPoint[]): GpxStats {
  let distanceKm = 0;
  let elevationGainM = 0;
  const notes: string[] = [];
  let hardViolation = false;
  let noisySegments = 0;
  let totalSegments = 0;
  const hasTimestamps = points.every((p) => p.time !== null);

  // Walk from a "reference" point rather than strictly point[i-1], so a
  // single bad fix doesn't cascade into every segment after it.
  let reference = points[0];

  for (let i = 1; i < points.length; i++) {
    const curr = points[i];

    if (hasTimestamps) {
      const dtSeconds =
        (new Date(curr.time as string).getTime() -
          new Date(reference.time as string).getTime()) /
        1000;

      if (dtSeconds <= 0) {
        // A duplicate or out-of-order timestamp is a common, benign GPS/
        // browser quirk (cached fix, weak indoor signal) — skip this point
        // rather than invalidating the whole hike over it. Skipping can
        // only ever reduce the computed distance, never inflate it, so
        // it's not a cheating vector.
        continue;
      }

      totalSegments++;
      const segmentKm = haversineKm(reference, curr);
      const speedKmh = segmentKm / (dtSeconds / 3600);

      if (speedKmh > IMPOSSIBLE_SPEED_KMH) {
        // This is the real anti-cheat signal (§8): a genuinely fabricated
        // or teleported trace needs impossible speed to cover ground.
        hardViolation = true;
        if (notes.length < 5) {
          notes.push(`impossible_speed:${speedKmh.toFixed(1)}`);
        }
        reference = curr;
        continue;
      }

      if (speedKmh > NOISE_SPEED_KMH) {
        // Likely GPS noise, not tampering — exclude the segment but don't
        // sink the whole hike over it (unless it keeps happening, checked
        // below).
        noisySegments++;
        reference = curr;
        continue;
      }

      distanceKm += segmentKm;
      if (reference.ele !== null && curr.ele !== null && curr.ele > reference.ele) {
        elevationGainM += curr.ele - reference.ele;
      }
      reference = curr;
    } else {
      const segmentKm = haversineKm(reference, curr);
      distanceKm += segmentKm;
      if (reference.ele !== null && curr.ele !== null && curr.ele > reference.ele) {
        elevationGainM += curr.ele - reference.ele;
      }
      reference = curr;
    }
  }

  const noiseRatio = totalSegments > 0 ? noisySegments / totalSegments : 0;
  if (!hardViolation && noiseRatio > MAX_NOISE_RATIO) {
    notes.push(`unstable_signal:${Math.round(noiseRatio * 100)}`);
  }

  const first = points[0];
  const last = points[points.length - 1];
  const durationSeconds =
    hasTimestamps && first.time && last.time
      ? Math.max(
          0,
          (new Date(last.time).getTime() - new Date(first.time).getTime()) / 1000
        )
      : 0;

  const avgSpeedKmh = durationSeconds > 0 ? distanceKm / (durationSeconds / 3600) : 0;

  return {
    distanceKm: Number(distanceKm.toFixed(2)),
    elevationGainM: Number(elevationGainM.toFixed(1)),
    durationSeconds: Math.round(durationSeconds),
    avgSpeedKmh: Number(avgSpeedKmh.toFixed(2)),
    startedAt: hasTimestamps ? first.time : null,
    isValid: notes.length === 0,
    validationNotes: notes.length > 0 ? notes.join("|") : null,
  };
}

/**
 * Validation notes are stored as codes ("impossible_speed:72.3|unstable_signal:30")
 * so they can be shown in the reader's language. Notes saved before this
 * change are plain French sentences and are returned unchanged.
 */
export function formatValidationNotes(
  raw: string | null,
  tr: Pick<Translator, "t">
): string | null {
  if (!raw) return null;
  return raw
    .split("|")
    .map((part) => {
      const m = /^(impossible_speed|unstable_signal):(.+)$/.exec(part);
      if (!m) return part;
      return m[1] === "impossible_speed"
        ? tr.t("gpx.note.impossibleSpeed", { speed: m[2] })
        : tr.t("gpx.note.unstableSignal", { percent: m[2] });
    })
    .join(" ");
}

/** Message for a parsing failure, in the reader's language. */
export function gpxErrorMessage(err: unknown, tr: Pick<Translator, "t">): string {
  if (err instanceof GpxError) {
    return err.code === "invalid"
      ? tr.t("gpx.error.invalid")
      : err.code === "noTrack"
        ? tr.t("gpx.error.noTrack")
        : tr.t("gpx.error.tooFewPoints");
  }
  return tr.t("gpx.unreadable");
}
