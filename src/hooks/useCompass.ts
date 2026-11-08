"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Compass heading (degrees clockwise from magnetic north) from the phone's
// orientation sensor. Needs no network and no GPS, but like the GPS it only
// runs while the page is visible.
//
// - iOS Safari reports `webkitCompassHeading`, and only after an explicit
//   permission that can be requested solely from a tap: call start() from a
//   click handler.
// - Android Chrome fires `deviceorientationabsolute`; `alpha` is the angle
//   anticlockwise from north. Relative events (absolute === false) are
//   ignored: their zero is arbitrary, not north.
// Screen rotation is not compensated: the recorder is meant to be held upright.

export type CompassState = "idle" | "granted" | "denied";

type OrientationReading = DeviceOrientationEvent & { webkitCompassHeading?: number };
type PermissionApi = { requestPermission?: () => Promise<"granted" | "denied"> };

// Share of the new reading mixed into the displayed heading: the raw sensor
// jitters by several degrees, which makes a needle unreadable.
const SMOOTHING = 0.25;
const MIN_EMIT_INTERVAL_MS = 100;

export function useCompass() {
  const supported = typeof window !== "undefined" && "DeviceOrientationEvent" in window;
  const [state, setState] = useState<CompassState>("idle");
  const [heading, setHeading] = useState<number | null>(null);

  const listeningRef = useRef(false);
  const smoothedRef = useRef<number | null>(null);
  const lastEmitRef = useRef(0);

  const onOrientation = useCallback((event: Event) => {
    const reading = event as OrientationReading;
    let raw: number | null = null;
    if (typeof reading.webkitCompassHeading === "number") {
      raw = reading.webkitCompassHeading;
    } else if (reading.absolute && typeof reading.alpha === "number") {
      raw = (360 - reading.alpha) % 360;
    }
    if (raw === null || Number.isNaN(raw)) return;

    // Move along the shortest arc so 359° -> 1° does not swing the long way.
    const current = smoothedRef.current;
    const next =
      current === null
        ? raw
        : (current + SMOOTHING * (((raw - current + 540) % 360) - 180) + 360) % 360;
    smoothedRef.current = next;

    const now = Date.now();
    if (now - lastEmitRef.current < MIN_EMIT_INTERVAL_MS) return;
    lastEmitRef.current = now;
    setHeading(Math.round(next) % 360);
  }, []);

  const detach = useCallback(() => {
    window.removeEventListener("deviceorientationabsolute", onOrientation);
    window.removeEventListener("deviceorientation", onOrientation);
    listeningRef.current = false;
    smoothedRef.current = null;
  }, [onOrientation]);

  const start = useCallback(async () => {
    if (!supported || listeningRef.current) return;

    // Must be the first thing awaited: the permission prompt is only allowed
    // while the tap that triggered start() is still fresh.
    const requestPermission = (DeviceOrientationEvent as unknown as PermissionApi).requestPermission;
    if (typeof requestPermission === "function") {
      try {
        if ((await requestPermission.call(DeviceOrientationEvent)) !== "granted") {
          setState("denied");
          return;
        }
      } catch {
        setState("denied");
        return;
      }
    }

    window.addEventListener("deviceorientationabsolute", onOrientation);
    window.addEventListener("deviceorientation", onOrientation);
    listeningRef.current = true;
    setState("granted");
  }, [supported, onOrientation]);

  const stop = useCallback(() => {
    detach();
    setHeading(null);
    setState("idle");
  }, [detach]);

  useEffect(() => detach, [detach]);

  return { supported, state, heading, start, stop };
}
