import type { DictKey } from "@/lib/i18n/app";

// Open-Meteo (open-meteo.com) — free, no API key, generous rate limits.
// Called directly from the client; nothing here touches the server.
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export type DailyForecast = {
  date: string; // ISO date
  code: number;
  tempMaxC: number;
  tempMinC: number;
  precipitationProbability: number;
};

export type WeatherNow = {
  tempC: number;
  code: number;
  windKmh: number;
  daily: DailyForecast[];
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherNow> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "4");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Service météo indisponible.");
  }
  const body = await res.json();

  const daily: DailyForecast[] = (body.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    code: body.daily.weather_code[i],
    tempMaxC: Math.round(body.daily.temperature_2m_max[i]),
    tempMinC: Math.round(body.daily.temperature_2m_min[i]),
    precipitationProbability: body.daily.precipitation_probability_max[i],
  }));

  return {
    tempC: Math.round(body.current.temperature_2m),
    code: body.current.weather_code,
    windKmh: Math.round(body.current.wind_speed_10m),
    daily,
  };
}

// WMO weather codes (open-meteo.com/en/docs#weathervariables), condensed to
// the buckets that matter for a hiking summary.
const WEATHER_CODES: Record<number, { emoji: string; label: DictKey }> = {
  0: { emoji: "☀️", label: "weather.clear" },
  1: { emoji: "🌤️", label: "weather.mostlyClear" },
  2: { emoji: "⛅", label: "weather.partlyCloudy" },
  3: { emoji: "☁️", label: "weather.overcast" },
  45: { emoji: "🌫️", label: "weather.fog" },
  48: { emoji: "🌫️", label: "weather.rimeFog" },
  51: { emoji: "🌦️", label: "weather.drizzleLight" },
  53: { emoji: "🌦️", label: "weather.drizzle" },
  55: { emoji: "🌦️", label: "weather.drizzleDense" },
  56: { emoji: "🌧️", label: "weather.freezingDrizzle" },
  57: { emoji: "🌧️", label: "weather.freezingDrizzle" },
  61: { emoji: "🌧️", label: "weather.rainLight" },
  63: { emoji: "🌧️", label: "weather.rain" },
  65: { emoji: "🌧️", label: "weather.rainHeavy" },
  66: { emoji: "🌧️", label: "weather.freezingRain" },
  67: { emoji: "🌧️", label: "weather.freezingRain" },
  71: { emoji: "❄️", label: "weather.snowLight" },
  73: { emoji: "❄️", label: "weather.snow" },
  75: { emoji: "❄️", label: "weather.snowHeavy" },
  77: { emoji: "❄️", label: "weather.snowGrains" },
  80: { emoji: "🌦️", label: "weather.showers" },
  81: { emoji: "🌦️", label: "weather.showers" },
  82: { emoji: "🌧️", label: "weather.showersHeavy" },
  85: { emoji: "🌨️", label: "weather.snowShowers" },
  86: { emoji: "🌨️", label: "weather.snowShowersHeavy" },
  95: { emoji: "⛈️", label: "weather.thunder" },
  96: { emoji: "⛈️", label: "weather.thunderHail" },
  99: { emoji: "⛈️", label: "weather.thunderHail" },
};

/** Emoji plus the dictionary key of the label (translated by the caller). */
export function describeWeatherCode(code: number): { emoji: string; label: DictKey } {
  return WEATHER_CODES[code] ?? { emoji: "🌡️", label: "weather.unknown" };
}

// A rough, non-authoritative "good day to hike" signal — never a safety
// instruction (the mentions légales already tell users to check the real
// forecast themselves), just a quick visual cue.
export function isGoodHikingDay(day: DailyForecast): boolean {
  return day.precipitationProbability < 40 && day.code < 80;
}
