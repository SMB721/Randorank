"use client";

import { useState } from "react";
import HikeMapLoader from "@/components/dashboard/HikeMapLoader";
import { generateRouteAction, saveRouteAction, type GeneratedRouteResult } from "@/app/(site)/dashboard/(premium)/generateur/actions";
import { USER_LEVELS, type UserLevel } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n/app/client";
import { levelKey } from "@/lib/i18n/app/labels";

type GeoStatus = "idle" | "loading" | "ready" | "error";

export default function GenerateurForm() {
  const { t } = useT();
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const [distanceKm, setDistanceKm] = useState(10);
  const [niveau, setNiveau] = useState<UserLevel | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<GeneratedRouteResult | null>(null);

  const [routeName, setRouteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRouteId, setSavedRouteId] = useState<string | null>(null);

  function handleLocate() {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setGeoStatus("ready");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleGenerate() {
    if (!position) return;
    setLoading(true);
    setError(null);
    setSavedRouteId(null);
    setSaveError(null);

    const result = await generateRouteAction({
      lat: position.lat,
      lon: position.lon,
      distanceKm,
      niveau: niveau || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setRoute(null);
      return;
    }

    setRoute(result.route);
    setRouteName(t("gen.defaultName", { km: result.route.distanceKm }));
  }

  async function handleSave() {
    if (!route) return;
    setSaving(true);
    setSaveError(null);

    const result = await saveRouteAction(route, routeName);

    setSaving(false);

    if (!result.success) {
      setSaveError(result.error);
      return;
    }

    setSavedRouteId(result.routeId);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-trail-200 bg-white p-6">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-trail-800">{t("gen.start")}</p>
          <button
            type="button"
            onClick={handleLocate}
            disabled={geoStatus === "loading"}
            className="rounded-xl border border-trail-200 bg-trail-50 px-4 py-2 text-sm font-semibold text-trail-700 transition hover:border-summit-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {geoStatus === "loading" ? t("gen.locating") : t("gen.locate")}
          </button>
          {geoStatus === "ready" && (
            <p className="text-sm text-summit-700">{t("gen.located")}</p>
          )}
          {geoStatus === "error" && (
            <p className="text-sm text-red-600">{t("gen.locError")}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="distance" className="text-sm font-medium text-trail-800">
              {t("gen.distance")}
            </label>
            <input
              id="distance"
              type="number"
              min={2}
              max={40}
              value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              className="w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm text-trail-700 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="niveau" className="text-sm font-medium text-trail-800">
              {t("gen.level")}
            </label>
            <select
              id="niveau"
              value={niveau}
              onChange={(e) => setNiveau(e.target.value as UserLevel | "")}
              className="w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm text-trail-700 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
            >
              <option value="">{t("gen.anyLevel")}</option>
              {USER_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {t(levelKey(lvl))}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!position || loading}
          className="rounded-xl bg-summit-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("gen.generating") : route ? t("gen.regenerate") : t("gen.generate")}
        </button>
      </div>

      {route && (
        <div className="space-y-4 rounded-2xl border border-trail-200 bg-white p-6">
          <div className="h-72 overflow-hidden rounded-xl">
            <HikeMapLoader coordinates={route.coordinates} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-trail-50 p-3">
              <p className="font-display text-xl text-trail-900">{route.distanceKm} km</p>
              <p className="text-xs uppercase tracking-widest text-trail-500">{t("gen.statDistance")}</p>
            </div>
            <div className="rounded-xl bg-trail-50 p-3">
              <p className="font-display text-xl text-trail-900">{route.elevationGainM} m</p>
              <p className="text-xs uppercase tracking-widest text-trail-500">{t("gen.statElevation")}</p>
            </div>
            <div className="rounded-xl bg-trail-50 p-3">
              <p className="font-display text-xl text-trail-900">
                {t(levelKey(route.niveau))}
              </p>
              <p className="text-xs uppercase tracking-widest text-trail-500">{t("gen.statLevel")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-trail-100 pt-4">
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder={t("gen.namePlaceholder")}
              className="flex-1 rounded-xl border border-trail-200 bg-white px-4 py-2 text-sm text-trail-700 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || Boolean(savedRouteId)}
              className="rounded-xl border border-trail-900 px-5 py-2 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savedRouteId ? t("gen.saved") : saving ? t("gen.saving") : t("gen.save")}
            </button>
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <p className="text-xs text-trail-400">{t("gen.footnote")}</p>
        </div>
      )}
    </div>
  );
}
