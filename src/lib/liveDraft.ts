import type { TrackPoint } from "@/lib/gpx";

// A live recording is kept on the phone while it runs, so a reload, a crash
// or the browser killing the page while the screen is locked does not lose
// the hike. It stays in this browser only until the hike is saved or dropped.
const KEY = "rr_live_draft_v1";
const MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type LiveDraft = {
  startedAtMs: number;
  savedAtMs: number;
  points: TrackPoint[];
};

function isPoint(p: unknown): p is TrackPoint {
  const o = p as TrackPoint;
  return (
    !!o &&
    typeof o.lat === "number" &&
    typeof o.lon === "number" &&
    Number.isFinite(o.lat) &&
    Number.isFinite(o.lon)
  );
}

export function loadDraft(now = Date.now()): LiveDraft | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as LiveDraft;
    if (
      !draft ||
      typeof draft.startedAtMs !== "number" ||
      typeof draft.savedAtMs !== "number" ||
      !Array.isArray(draft.points) ||
      draft.points.length < 1 ||
      !draft.points.every(isPoint) ||
      now - draft.savedAtMs > MAX_AGE_MS
    ) {
      window.localStorage.removeItem(KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: LiveDraft): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked (private mode): recording still works, it just
    // cannot be resumed after an interruption.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
