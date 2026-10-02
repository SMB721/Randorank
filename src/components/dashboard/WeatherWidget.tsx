"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/app/client";
import { describeWeatherCode, fetchWeather, isGoodHikingDay, type WeatherNow } from "@/lib/weather";

type Status = "loading" | "ready" | "denied" | "error";

export default function WeatherWidget() {
  const { t, locale } = useT();
  const [status, setStatus] = useState<Status>(() =>
    typeof navigator === "undefined" || !("geolocation" in navigator) ? "error" : "loading"
  );
  const [weather, setWeather] = useState<WeatherNow | null>(null);

  useEffect(() => {
    if (status !== "loading") return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
          setWeather(data);
          setStatus("ready");
        } catch {
          setStatus("error");
        }
      },
      (geoError) => {
        setStatus(geoError.code === geoError.PERMISSION_DENIED ? "denied" : "error");
      },
      { maximumAge: 15 * 60 * 1000, timeout: 10000 }
    );
  }, [status]);

  if (status === "loading") {
    return (
      <div className="mt-6 animate-fade-in-up rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{t("weather.title")}</p>
        <p className="mt-2 text-sm text-white/60">{t("weather.locating")}</p>
      </div>
    );
  }

  if (status === "denied" || status === "error" || !weather) {
    return (
      <div className="mt-6 animate-fade-in-up rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{t("weather.title")}</p>
        <p className="mt-2 text-sm text-white/60">
          {status === "denied" ? t("weather.denied") : t("weather.unavailable")}
        </p>
      </div>
    );
  }

  const now = describeWeatherCode(weather.code);

  return (
    <div className="mt-6 animate-fade-in-up rounded-2xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{t("weather.title")}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl" aria-hidden="true">
              {now.emoji}
            </span>
            <span className="font-display text-3xl tracking-wide">{weather.tempC}°C</span>
          </div>
          <p className="mt-1 text-sm text-white/60">
            {t("weather.summary", { label: t(now.label), kmh: weather.windKmh })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex">
          {weather.daily.slice(1, 4).map((day, i) => {
            const desc = describeWeatherCode(day.code);
            const good = isGoodHikingDay(day);
            return (
              <div
                key={day.date}
                className={`min-w-0 rounded-xl border px-2 py-2 text-center sm:w-16 ${
                  good
                    ? "border-summit-400/40 bg-summit-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="truncate text-[10px] uppercase tracking-widest text-white/50">
                  {i === 0
                    ? t("weather.tomorrow")
                    : new Date(day.date).toLocaleDateString(locale, { weekday: "short" })}
                </p>
                <p className="mt-1 text-lg" aria-hidden="true">
                  {desc.emoji}
                </p>
                <p className="text-xs text-white/70">
                  {day.tempMaxC}°<span className="text-white/40">/{day.tempMinC}°</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-white/40">
        {t("weather.disclaimer")}
      </p>
    </div>
  );
}
