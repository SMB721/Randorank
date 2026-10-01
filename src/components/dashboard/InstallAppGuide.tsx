"use client";

import { useEffect, useState } from "react";
import { dismissInstallPromptAction } from "@/app/(site)/dashboard/installer/actions";

type Platform = "iphone" | "android";

// Non-standard event, not yet in lib.dom.d.ts — Chromium-only (Android
// Chrome, desktop Chrome/Edge). Safari never fires it; there is no
// programmatic install prompt on iOS, only the manual Share-sheet flow.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectDefaultPlatform(): Platform {
  if (typeof navigator === "undefined") return "android";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "iphone" : "android";
}

const androidSteps = [
  { icon: "⋮", text: "Ouvrez le menu de votre navigateur (en haut à droite)." },
  { icon: "⬇️", text: "Choisissez « Installer l'application » (ou « Ajouter à l'écran d'accueil »)." },
  { icon: "✓", text: "Validez avec « Installer »." },
];

const iphoneSteps = [
  { icon: "⬆️", text: "Appuyez sur le bouton Partager, en bas de Safari." },
  { icon: "➕", text: "Faites défiler et choisissez « Sur l'écran d'accueil »." },
  { icon: "✓", text: "Appuyez sur « Ajouter », en haut à droite." },
];

export default function InstallAppGuide() {
  const [platform, setPlatform] = useState<Platform>("android");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Deliberately deferred to an effect: the initial "android" state has to
    // match on server and client to avoid a hydration mismatch, since
    // detectDefaultPlatform() depends on navigator.userAgent (unavailable
    // during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(detectDefaultPlatform());

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (installed) {
    return (
      <div className="rounded-2xl border border-trail-200 bg-trail-50 p-6 text-center">
        <p className="font-display text-2xl tracking-wide text-trail-900">
          RandoRank est installé 🎉
        </p>
        <p className="mt-2 text-sm text-trail-600">
          Retrouvez l&apos;icône sur votre écran d&apos;accueil.
        </p>
        <form action={dismissInstallPromptAction}>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
          >
            Continuer
          </button>
        </form>
      </div>
    );
  }

  const steps = platform === "iphone" ? iphoneSteps : androidSteps;

  return (
    <div>
      <div className="flex rounded-full bg-trail-100 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setPlatform("iphone")}
          className={`flex-1 rounded-full py-2 transition ${
            platform === "iphone" ? "bg-trail-900 text-white" : "text-trail-600"
          }`}
        >
          iPhone
        </button>
        <button
          type="button"
          onClick={() => setPlatform("android")}
          className={`flex-1 rounded-full py-2 transition ${
            platform === "android" ? "bg-trail-900 text-white" : "text-trail-600"
          }`}
        >
          Android
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.text}
            className="flex items-center gap-4 rounded-xl border border-trail-200 bg-white px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-summit-500 font-display text-sm text-white">
              {index + 1}
            </span>
            <span aria-hidden="true" className="text-lg">
              {step.icon}
            </span>
            <span className="text-sm text-trail-700">{step.text}</span>
          </div>
        ))}
      </div>

      {platform === "android" && deferredPrompt && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="mt-6 w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          Installer RandoRank maintenant
        </button>
      )}

      <form action={dismissInstallPromptAction}>
        <button
          type="submit"
          className="mt-4 w-full rounded-xl border-2 border-trail-200 py-3 text-center text-sm font-semibold text-trail-700 transition hover:border-trail-400"
        >
          Plus tard, continuer
        </button>
      </form>
    </div>
  );
}
