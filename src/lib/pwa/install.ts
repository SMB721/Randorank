"use client";

import { useSyncExternalStore } from "react";

// Chromium fires "beforeinstallprompt" once, early, on whichever page loads
// first. The listener therefore has to live in the app shell (see
// InstallPromptListener); otherwise the event is lost before the install
// banner or the guide page can use it. Safari/iOS never fires it.
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type State = { deferred: BeforeInstallPromptEvent | null; installed: boolean };

let state: State = { deferred: null, installed: false };
const listeners = new Set<() => void>();
let started = false;

function emit(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function startInstallListener() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    emit({ deferred: e as BeforeInstallPromptEvent });
  });
  window.addEventListener("appinstalled", () => emit({ deferred: null, installed: true }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const getServerSnapshot = (): State => ({ deferred: null, installed: false });

export function useInstallPrompt() {
  const { deferred, installed } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  async function prompt() {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    emit({ deferred: null });
    return outcome === "accepted";
  }
  return { canPrompt: deferred !== null, installed, prompt };
}

export type InstallContext = "standalone" | "android-app" | "in-app-browser" | "ios" | "other";

// TikTok, Instagram, Facebook and Snapchat open links in their own WebView,
// where a site cannot be added to the home screen: the visitor has to open
// the page in Safari or Chrome first. Most of our organic traffic comes
// from exactly those apps.
const IN_APP_BROWSER = /TikTok|musical_ly|Bytedance|Instagram|FBAN|FBAV|FB_IAB|Snapchat|Line\/|LinkedInApp/i;

export function detectInstallContext(): InstallContext {
  const ua = navigator.userAgent;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "standalone";
  if (ua.includes("RandoRankApp")) return "android-app";
  if (IN_APP_BROWSER.test(ua)) return "in-app-browser";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "other";
}
