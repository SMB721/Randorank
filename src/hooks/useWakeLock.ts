"use client";

import { useCallback, useRef, useState } from "react";

// Prevents the screen from auto-locking while a live recording is running —
// the same trick MotoRank uses. It cannot survive the user manually locking
// the phone or switching apps; callers must say so up front.
export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const [active, setActive] = useState(false);
  const supported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  const request = useCallback(async () => {
    if (!supported) return;
    try {
      sentinelRef.current = await navigator.wakeLock.request("screen");
      setActive(true);
      sentinelRef.current.addEventListener("release", () => setActive(false));
    } catch {
      setActive(false);
    }
  }, [supported]);

  const release = useCallback(async () => {
    try {
      await sentinelRef.current?.release();
    } catch {
      // Already released (e.g. tab was hidden) — nothing to do.
    }
    sentinelRef.current = null;
    setActive(false);
  }, []);

  return { supported, active, request, release };
}
