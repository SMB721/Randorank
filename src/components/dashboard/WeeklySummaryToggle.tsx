"use client";

import { useState, useTransition } from "react";
import { setWeeklySummaryAction, type WeeklySummaryState } from "@/app/actions/weekly-summary";
import { useT } from "@/lib/i18n/app/client";

type Shown = "off" | "pending" | "on";

export default function WeeklySummaryToggle({ initial }: { initial: Shown }) {
  const { t } = useT();
  const [state, setState] = useState<Shown>(initial);
  const [problem, setProblem] = useState<"unavailable" | "error" | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    const enable = state === "off";
    setProblem(null);
    startTransition(async () => {
      const result: WeeklySummaryState = await setWeeklySummaryAction(enable);
      if (result === "pending") setState("pending");
      else if (result === "off") setState("off");
      else setProblem(result);
    });
  }

  const checked = state !== "off";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-trail-900">
            {t("profil.weeklyTitle")}
          </h2>
          <p className="mt-1 text-sm text-trail-500">{t("profil.weeklyText")}</p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          role="switch"
          aria-checked={checked}
          aria-label={t("profil.weeklyAria")}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-60 ${
            checked ? "bg-summit-500" : "bg-trail-200"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
              checked ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      {state === "pending" && (
        <p className="mt-3 rounded-lg bg-trail-100 px-3 py-2 text-sm text-trail-700">
          {t("profil.weeklyPending")}
        </p>
      )}
      {state === "on" && (
        <p className="mt-3 rounded-lg bg-summit-50 px-3 py-2 text-sm text-summit-700">
          {t("profil.weeklyOn")}
        </p>
      )}
      {problem && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {problem === "unavailable" ? t("profil.weeklyUnavailable") : t("profil.weeklyError")}
        </p>
      )}
    </div>
  );
}
