"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HikeMapLoader from "@/components/dashboard/HikeMapLoader";
import ElevationProfile from "@/components/dashboard/ElevationProfile";
import UpsellCard from "@/components/dashboard/UpsellCard";
import {
  generateRouteAction,
  saveRouteAction,
  type GeneratedRouteResult,
  type RouteMode,
  type RouteQuota,
  type VariantTag,
} from "@/app/(site)/dashboard/(app)/generateur/actions";
import { routeToGpx } from "@/lib/gpxExport";
import { USER_LEVELS, type UserLevel } from "@/lib/supabase/types";
import { useT } from "@/lib/i18n/app/client";
import { levelKey } from "@/lib/i18n/app/labels";
import type { DictKey } from "@/lib/i18n/app";

const TAG_KEYS: Record<VariantTag, DictKey> = {
  flat: "gen.tag.flat",
  steep: "gen.tag.steep",
  exact: "gen.tag.exact",
};

type GeoStatus = "idle" | "loading" | "ready" | "error";

// A guest who taps "download" is sent to create an account; the route they
// just generated waits in sessionStorage so it is still on screen when they
// come back (the free quota was already spent on it).
const PENDING_ROUTE_KEY = "rr_pending_route";

type Props = {
  isGuest: boolean;
  canSave: boolean;
  /** Premium: variants, elevation cap and one-way routes. */
  advanced: boolean;
  initialQuota: RouteQuota;
};

export default function GenerateurForm({ isGuest, canSave, advanced, initialQuota }: Props) {
  const { t, tn } = useT();
  const router = useRouter();
  const [quota, setQuota] = useState<RouteQuota>(initialQuota);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const [distanceKm, setDistanceKm] = useState(10);
  const [niveau, setNiveau] = useState<UserLevel | "">("");
  const [mode, setMode] = useState<RouteMode>("loop");
  const [maxElevation, setMaxElevation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<GeneratedRouteResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [capRelaxed, setCapRelaxed] = useState(false);
  const route: GeneratedRouteResult | null = routes[selected] ?? null;

  const [routeName, setRouteName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRouteId, setSavedRouteId] = useState<string | null>(null);

  useEffect(() => {
    if (isGuest) return;
    try {
      const raw = sessionStorage.getItem(PENDING_ROUTE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_ROUTE_KEY);
      const pending = JSON.parse(raw) as { route: GeneratedRouteResult; name: string };
      // Browser-only storage can't be read during render without a hydration
      // mismatch, so restoring after mount is the intended use of an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoutes([pending.route]);
      setSelected(0);
      setRouteName(pending.name);
    } catch {
      // Storage unavailable or corrupt: the user just generates again.
    }
  }, [isGuest]);

  function handleDownload() {
    if (!route) return;
    if (isGuest) {
      try {
        sessionStorage.setItem(PENDING_ROUTE_KEY, JSON.stringify({ route, name: routeName }));
      } catch {
        // Not fatal: they will regenerate after signing up.
      }
      router.push("/auth?mode=signup&next=/dashboard/generateur");
      return;
    }
    const name = routeName.trim() || t("gen.savedName");
    const blob = new Blob([routeToGpx(name, route.coordinates, route.elevations)], {
      type: "application/gpx+xml",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/[^\w-]+/g, "-").toLowerCase() || "route"}.gpx`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const quotaLeft = quota.limit === null ? null : Math.max(0, quota.limit - quota.used);

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

    const cap = advanced && maxElevation.trim() !== "" ? Number(maxElevation) : null;
    const result = await generateRouteAction({
      lat: position.lat,
      lon: position.lon,
      distanceKm,
      niveau: niveau || null,
      mode: advanced ? mode : "loop",
      maxElevationM: cap,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      setRoutes([]);
      return;
    }

    setQuota(result.quota);
    setRoutes(result.routes);
    setSelected(0);
    setCapRelaxed(result.elevationCapRelaxed);
    setRouteName(t("gen.defaultName", { km: result.routes[0].distanceKm }));
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-trail-800">{t("gen.mode.label")}</p>
            <div className="flex rounded-xl border border-trail-200 bg-trail-50 p-1 text-sm font-semibold">
              {(["loop", "oneway"] as const).map((m) => {
                const locked = m === "oneway" && !advanced;
                const active = mode === m && !locked;
                return locked ? (
                  <Link
                    key={m}
                    href="/bienvenue/paywall"
                    className="flex-1 rounded-lg py-1.5 text-center text-trail-400 hover:text-summit-700"
                  >
                    🔒 {t("gen.mode.oneway")}
                  </Link>
                ) : (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-lg py-1.5 transition ${
                      active ? "bg-white text-trail-900 shadow" : "text-trail-500"
                    }`}
                  >
                    {m === "loop" ? t("gen.mode.loop") : t("gen.mode.oneway")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="maxElevation" className="text-sm font-medium text-trail-800">
              {t("gen.maxElev.label")}
            </label>
            {advanced ? (
              <input
                id="maxElevation"
                type="number"
                min={50}
                max={3000}
                step={50}
                value={maxElevation}
                onChange={(e) => setMaxElevation(e.target.value)}
                placeholder={t("gen.maxElev.placeholder")}
                className="w-full rounded-xl border border-trail-200 bg-white px-4 py-2.5 text-sm text-trail-700 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-100"
              />
            ) : (
              <Link
                href="/bienvenue/paywall"
                className="block w-full rounded-xl border border-dashed border-trail-300 bg-trail-50 px-4 py-2.5 text-sm text-trail-400 transition hover:border-summit-400 hover:text-summit-700"
              >
                🔒 {t("gen.maxElev.locked")}
              </Link>
            )}
          </div>
        </div>

        {quotaLeft !== null && (
          <p className="text-xs font-semibold text-trail-500">
            {quotaLeft > 0 ? tn("gen.quota.left", quotaLeft) : t("gen.quota.none")}
          </p>
        )}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!position || loading || quotaLeft === 0}
          className="rounded-xl bg-summit-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? t("gen.generating")
            : route
              ? t("gen.regenerate")
              : advanced
                ? t("gen.generateVariants")
                : t("gen.generate")}
        </button>
      </div>

      {route && (
        <div className="space-y-4 rounded-2xl border border-trail-200 bg-white p-6">
          {capRelaxed && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {t("gen.notice.capRelaxed", { n: maxElevation })}
            </p>
          )}

          {routes.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-trail-500">
                {t("gen.variants.title", { n: routes.length })}
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {routes.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelected(i);
                      setSavedRouteId(null);
                    }}
                    aria-pressed={i === selected}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      i === selected
                        ? "border-summit-500 bg-summit-50"
                        : "border-trail-200 bg-white hover:border-trail-300"
                    }`}
                  >
                    <span className="font-display text-lg tracking-wide text-trail-900">
                      {t("gen.variant.name", { letter: String.fromCharCode(65 + i) })}
                    </span>
                    {r.tag && (
                      <span className="mt-0.5 block text-xs font-semibold text-summit-700">
                        {t(TAG_KEYS[r.tag])}
                      </span>
                    )}
                    <span className="mt-1 block text-xs text-trail-600">
                      {r.distanceKm} km · +{r.elevationGainM} m
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-72 overflow-hidden rounded-xl">
            <HikeMapLoader
              coordinates={route.coordinates}
              others={routes.filter((_, i) => i !== selected).map((r) => r.coordinates)}
            />
          </div>

          <ElevationProfile coordinates={route.coordinates} elevations={route.elevations} />

          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <div className="rounded-xl bg-trail-50 p-3">
              <p className="font-display text-xl text-trail-900">{route.distanceKm} km</p>
              <p className="text-xs uppercase tracking-widest text-trail-500">{t("gen.statDistance")}</p>
            </div>
            <div className="rounded-xl bg-trail-50 p-3">
              <p className="font-display text-xl text-trail-900">{route.elevationGainM} m</p>
              <p className="text-xs uppercase tracking-widest text-trail-500">{t("gen.statElevation")}</p>
            </div>
            <div className="rounded-xl bg-trail-50 p-3">
              <p className="font-display text-xl text-trail-900">{route.elevationLossM} m</p>
              <p className="text-xs uppercase tracking-widest text-trail-500">{t("gen.statDescent")}</p>
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
            {canSave ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || Boolean(savedRouteId)}
                className="rounded-xl border border-trail-900 px-5 py-2 text-sm font-semibold text-trail-900 transition hover:bg-trail-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savedRouteId ? t("gen.saved") : saving ? t("gen.saving") : t("gen.save")}
              </button>
            ) : (
              <Link
                href="/bienvenue/paywall"
                className="rounded-xl border border-trail-300 px-5 py-2 text-sm font-semibold text-trail-500 transition hover:border-summit-400 hover:text-summit-700"
              >
                {t("gen.save.locked")}
              </Link>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl bg-trail-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-trail-800"
            >
              {isGuest ? t("gen.download.guest") : t("gen.download")}
            </button>
          </div>
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <p className="text-xs text-trail-400">{t("gen.footnote")}</p>
        </div>
      )}

      {route && !advanced && (
        <UpsellCard
          icon="🧭"
          title={t("gen.variants.locked.title")}
          text={t("gen.variants.locked.text")}
          cta={t("gen.upsell.cta")}
          href="/bienvenue/paywall"
        />
      )}

      {quotaLeft === 0 && (
        <UpsellCard
          icon="♾️"
          title={t("gen.upsell.title")}
          text={t("gen.upsell.text")}
          cta={t("gen.upsell.cta")}
          href="/bienvenue/paywall"
        />
      )}
    </div>
  );
}
