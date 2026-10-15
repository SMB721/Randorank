"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/app/client";
import { detectInstallContext, useInstallPrompt, type InstallContext } from "@/lib/pwa/install";

const DISMISS_KEY = "randorank-install-banner";
const VISITS_KEY = "randorank-visit-days";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DISMISSALS = 3;
const MIN_VISIT_DAYS = 3;

type Dismissal = { count: number; at: number };

function readDismissal(): Dismissal {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "null");
    if (raw && typeof raw.count === "number" && typeof raw.at === "number") return raw;
  } catch {
    // Blocked or corrupted storage: behave as if never dismissed.
  }
  return { count: 0, at: 0 };
}

// Distinct days the member opened the app, so the banner waits until they
// have come back at least once, not on the very first visit.
function recordVisitDay(): number {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const days: string[] = JSON.parse(localStorage.getItem(VISITS_KEY) ?? "[]");
    if (!days.includes(today)) days.push(today);
    const kept = days.slice(-10);
    localStorage.setItem(VISITS_KEY, JSON.stringify(kept));
    return kept.length;
  } catch {
    return 0;
  }
}

/**
 * Invites the member to put RandoRank on their home screen, once the app has
 * proved useful: after a first hike, or after a few distinct days of use.
 * Android Chrome gets a one-tap install; iPhone gets the guide; visitors
 * inside TikTok/Instagram/Facebook are told to open the page in a browser.
 */
export default function InstallBanner({ hikeCount }: { hikeCount: number }) {
  const { t } = useT();
  const { canPrompt, prompt } = useInstallPrompt();
  const [context, setContext] = useState<InstallContext | null>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = detectInstallContext();
    const visitDays = recordVisitDay();
    const dismissal = readDismissal();
    const worthIt = hikeCount >= 1 || visitDays >= MIN_VISIT_DAYS;
    const coolingDown = Date.now() - dismissal.at < COOLDOWN_MS;
    const eligible =
      ctx !== "standalone" &&
      ctx !== "android-app" &&
      worthIt &&
      dismissal.count < MAX_DISMISSALS &&
      !coolingDown;
    /* eslint-disable react-hooks/set-state-in-effect */
    setContext(ctx);
    setVisible(eligible);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [hikeCount]);

  function handleDismiss() {
    setVisible(false);
    const { count } = readDismissal();
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify({ count: count + 1, at: Date.now() }));
    } catch {
      // Hiding it for this session is enough.
    }
  }

  async function handleInstall() {
    const accepted = await prompt();
    if (accepted) setVisible(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.origin + "/dashboard");
      setCopied(true);
    } catch {
      // Clipboard can be blocked inside in-app browsers; the text still explains what to do.
    }
  }

  if (!visible || !context) return null;

  const inAppBrowser = context === "in-app-browser";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
      <span className="text-xl" aria-hidden="true">
        📲
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{t("installBanner.title")}</p>
        <p className="text-xs text-white/60">
          {inAppBrowser ? t("installBanner.inapp") : t("installBanner.subtitleValue")}
        </p>
      </div>
      {inAppBrowser ? (
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-summit-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-summit-600"
        >
          {copied ? t("installBanner.copied") : t("installBanner.copyLink")}
        </button>
      ) : canPrompt ? (
        <button
          type="button"
          onClick={handleInstall}
          className="rounded-lg bg-summit-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-summit-600"
        >
          {t("installBanner.cta")}
        </button>
      ) : (
        <Link
          href="/dashboard/installer"
          className="rounded-lg bg-summit-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-summit-600"
        >
          {t("installBanner.how")}
        </Link>
      )}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t("installBanner.dismiss")}
        className="text-white/40 transition hover:text-white/70"
      >
        ✕
      </button>
    </div>
  );
}
