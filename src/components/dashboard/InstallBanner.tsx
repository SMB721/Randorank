"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const DISMISS_KEY = "randorank-install-banner-dismissed";

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari's own flag — not covered by the standard media query.
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // Private browsing or blocked storage — just show the banner.
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!isStandalone && !dismissed);
  }, []);

  function handleDismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Nothing to persist to, but hiding it for this session is enough.
    }
  }

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
      <span className="text-xl" aria-hidden="true">
        📲
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">Installez RandoRank</p>
        <p className="text-xs text-white/60">Accès plus rapide · plein écran</p>
      </div>
      <Link
        href="/dashboard/installer"
        className="rounded-lg bg-summit-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-summit-600"
      >
        Installer
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Ignorer"
        className="text-white/40 transition hover:text-white/70"
      >
        ✕
      </button>
    </div>
  );
}
