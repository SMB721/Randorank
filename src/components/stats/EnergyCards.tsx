"use client";

import { useWeightKg } from "@/hooks/useWeightKg";
import { estimateKcal, estimateSteps, MAX_WEIGHT_KG, MIN_WEIGHT_KG } from "@/lib/energy";
import { useT } from "@/lib/i18n/app/client";

// Estimated calories and steps for a distance/climb (one hike or a total).
export default function EnergyCards({
  distanceKm,
  elevationGainM,
}: {
  distanceKm: number;
  elevationGainM: number;
}) {
  const { t, locale } = useT();
  const { weight, setWeight } = useWeightKg();
  const number = new Intl.NumberFormat(locale);

  return (
    <div className="rounded-2xl border border-trail-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl tracking-wide text-trail-900">{t("stats.energy.title")}</h3>
        <label className="flex items-center gap-2 text-sm text-trail-600">
          {t("stats.energy.weight")}
          <input
            // Remount when the stored value arrives so the field shows it.
            key={weight}
            type="number"
            inputMode="numeric"
            min={MIN_WEIGHT_KG}
            max={MAX_WEIGHT_KG}
            defaultValue={weight}
            onBlur={(e) => setWeight(Number(e.target.value))}
            className="w-20 rounded-lg border border-trail-200 px-2 py-1 text-right text-sm text-trail-900 outline-none focus:border-summit-400"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl bg-trail-50 p-3">
          <p className="font-display text-2xl text-trail-900">
            {number.format(estimateKcal(weight, distanceKm, elevationGainM))}
          </p>
          <p className="text-xs uppercase tracking-widest text-trail-500">{t("stats.energy.kcal")}</p>
        </div>
        <div className="rounded-xl bg-trail-50 p-3">
          <p className="font-display text-2xl text-trail-900">
            {number.format(estimateSteps(distanceKm))}
          </p>
          <p className="text-xs uppercase tracking-widest text-trail-500">{t("stats.energy.steps")}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-trail-400">
        {t("stats.energy.weightNote")} {t("stats.energy.disclaimer")}
      </p>
    </div>
  );
}
