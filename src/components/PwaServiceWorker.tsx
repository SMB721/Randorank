"use client";

import { useEffect } from "react";

// Registering a service worker (even a no-op one) is one of the conditions
// Chrome/Android checks before it treats the site as installable.
export default function PwaServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability is a nice-to-have — a failed registration
        // shouldn't be treated as an app error anywhere else.
      });
    }
  }, []);

  return null;
}
