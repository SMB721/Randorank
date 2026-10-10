"use client";

import { useCallback, useSyncExternalStore } from "react";
import { clampWeight, DEFAULT_WEIGHT_KG } from "@/lib/energy";

// The weight only feeds the on-screen calorie estimate. It lives in this
// browser's localStorage and is never sent to a server: body weight is health
// data, and the estimate doesn't need it stored.
const KEY = "rr_weight_kg";
const CHANGE_EVENT = "rr-weight-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function useWeightKg() {
  // The server snapshot is null so the first client render matches the
  // server's, then the stored value takes over.
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const weight = raw === null ? DEFAULT_WEIGHT_KG : clampWeight(Number(raw));

  const setWeight = useCallback((value: number) => {
    try {
      localStorage.setItem(KEY, String(clampWeight(value)));
    } catch {
      // Storage blocked: the estimate just keeps using the default weight.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { weight, setWeight };
}
