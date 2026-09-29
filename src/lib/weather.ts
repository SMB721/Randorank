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
const WEATHER_CODES: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Ciel dégagé" },
  1: { emoji: "🌤️", label: "Plutôt dégagé" },
  2: { emoji: "⛅", label: "Partiellement nuageux" },
  3: { emoji: "☁️", label: "Couvert" },
  45: { emoji: "🌫️", label: "Brouillard" },
  48: { emoji: "🌫️", label: "Brouillard givrant" },
  51: { emoji: "🌦️", label: "Bruine légère" },
  53: { emoji: "🌦️", label: "Bruine" },
  55: { emoji: "🌦️", label: "Bruine dense" },
  56: { emoji: "🌧️", label: "Bruine verglaçante" },
  57: { emoji: "🌧️", label: "Bruine verglaçante" },
  61: { emoji: "🌧️", label: "Pluie légère" },
  63: { emoji: "🌧️", label: "Pluie" },
  65: { emoji: "🌧️", label: "Forte pluie" },
  66: { emoji: "🌧️", label: "Pluie verglaçante" },
  67: { emoji: "🌧️", label: "Pluie verglaçante" },
  71: { emoji: "❄️", label: "Neige légère" },
  73: { emoji: "❄️", label: "Neige" },
  75: { emoji: "❄️", label: "Forte neige" },
  77: { emoji: "❄️", label: "Grains de neige" },
  80: { emoji: "🌦️", label: "Averses" },
  81: { emoji: "🌦️", label: "Averses" },
  82: { emoji: "🌧️", label: "Fortes averses" },
  85: { emoji: "🌨️", label: "Averses de neige" },
  86: { emoji: "🌨️", label: "Fortes averses de neige" },
  95: { emoji: "⛈️", label: "Orage" },
  96: { emoji: "⛈️", label: "Orage avec grêle" },
  99: { emoji: "⛈️", label: "Orage avec grêle" },
};

export function describeWeatherCode(code: number): { emoji: string; label: string } {
  return WEATHER_CODES[code] ?? { emoji: "🌡️", label: "Conditions inconnues" };
}

// A rough, non-authoritative "good day to hike" signal — never a safety
// instruction (the mentions légales already tell users to check the real
// forecast themselves), just a quick visual cue.
export function isGoodHikingDay(day: DailyForecast): boolean {
  return day.precipitationProbability < 40 && day.code < 80;
}
