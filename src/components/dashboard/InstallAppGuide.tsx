"use client";

import { useEffect, useState } from "react";
import { dismissInstallPromptAction } from "@/app/(site)/dashboard/installer/actions";
import { useT } from "@/lib/i18n/app/client";
import type { DictKey } from "@/lib/i18n/app";
import { useInstallPrompt } from "@/lib/pwa/install";

type Platform = "iphone" | "android";

function detectDefaultPlatform(): Platform {
  if (typeof navigator === "undefined") return "android";
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ? "iphone" : "android";
}

const androidSteps: { icon: string; text: DictKey }[] = [
  { icon: "⋮", text: "guide.android.1" },
  { icon: "⬇️", text: "guide.android.2" },
  { icon: "✓", text: "guide.android.3" },
];

const iphoneSteps: { icon: string; text: DictKey }[] = [
  { icon: "⬆️", text: "guide.iphone.1" },
  { icon: "➕", text: "guide.iphone.2" },
  { icon: "✓", text: "guide.iphone.3" },
];

export default function InstallAppGuide() {
  const { t } = useT();
  const [platform, setPlatform] = useState<Platform>("android");
  const { canPrompt, installed, prompt } = useInstallPrompt();

  useEffect(() => {
    // Deliberately deferred to an effect: the initial "android" state has to
    // match on server and client to avoid a hydration mismatch, since
    // detectDefaultPlatform() depends on navigator.userAgent (unavailable
    // during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(detectDefaultPlatform());
  }, []);

  async function handleInstallClick() {
    await prompt();
  }

  if (installed) {
    return (
      <div className="rounded-2xl border border-trail-200 bg-trail-50 p-6 text-center">
        <p className="font-display text-2xl tracking-wide text-trail-900">
          {t("guide.installed")}
        </p>
        <p className="mt-2 text-sm text-trail-600">
          {t("guide.installedText")}
        </p>
        <form action={dismissInstallPromptAction}>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
          >
            {t("guide.continue")}
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
            <span className="text-sm text-trail-700">{t(step.text)}</span>
          </div>
        ))}
      </div>

      {platform === "android" && canPrompt && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="mt-6 w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
        >
          {t("guide.installNow")}
        </button>
      )}

      <form action={dismissInstallPromptAction}>
        <button
          type="submit"
          className="mt-4 w-full rounded-xl border-2 border-trail-200 py-3 text-center text-sm font-semibold text-trail-700 transition hover:border-trail-400"
        >
          {t("guide.later")}
        </button>
      </form>
    </div>
  );
}
