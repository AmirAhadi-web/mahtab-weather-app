import type { WeatherKind } from "@/types/weather";

export interface WeatherInfo {
  code: number;
  /** Human readable condition, e.g. "Partly cloudy". */
  label: string;
  /** Coarse condition group used for icons, artwork and ambient colors. */
  kind: WeatherKind;
}

/**
 * Mapping of the WMO weather interpretation codes used by Open-Meteo.
 * Reference: https://open-meteo.com/en/docs (weathermode "weather_code").
 */
const CODE_TABLE: Record<number, { label: string; kind: WeatherKind }> = {
  0: { label: "Clear sky", kind: "clear" },
  1: { label: "Mainly clear", kind: "clear" },
  2: { label: "Partly cloudy", kind: "partly" },
  3: { label: "Overcast", kind: "cloudy" },
  45: { label: "Fog", kind: "fog" },
  48: { label: "Freezing fog", kind: "fog" },
  51: { label: "Light drizzle", kind: "drizzle" },
  53: { label: "Drizzle", kind: "drizzle" },
  55: { label: "Dense drizzle", kind: "drizzle" },
  56: { label: "Freezing drizzle", kind: "drizzle" },
  57: { label: "Freezing drizzle", kind: "drizzle" },
  61: { label: "Light rain", kind: "rain" },
  63: { label: "Rain", kind: "rain" },
  65: { label: "Heavy rain", kind: "rain" },
  66: { label: "Freezing rain", kind: "rain" },
  67: { label: "Freezing rain", kind: "rain" },
  71: { label: "Light snow", kind: "snow" },
  73: { label: "Snow", kind: "snow" },
  75: { label: "Heavy snow", kind: "snow" },
  77: { label: "Snow grains", kind: "snow" },
  80: { label: "Light showers", kind: "rain" },
  81: { label: "Rain showers", kind: "rain" },
  82: { label: "Heavy showers", kind: "rain" },
  85: { label: "Snow showers", kind: "snow" },
  86: { label: "Snow showers", kind: "snow" },
  95: { label: "Thunderstorm", kind: "storm" },
  96: { label: "Storm with hail", kind: "storm" },
  99: { label: "Storm with hail", kind: "storm" },
};

const FALLBACK: { label: string; kind: WeatherKind } = {
  label: "Unknown conditions",
  kind: "cloudy",
};

export function getWeatherInfo(code: number): WeatherInfo {
  const entry = CODE_TABLE[code] ?? FALLBACK;
  return { code, label: entry.label, kind: entry.kind };
}

/** Ambient glow colors per condition, tuned for the Mahtab dark surface. */
export const KIND_GLOW: Record<WeatherKind, { day: string; night: string }> = {
  clear: { day: "rgba(255, 180, 84, 0.18)", night: "rgba(168, 178, 191, 0.13)" },
  partly: { day: "rgba(255, 180, 84, 0.14)", night: "rgba(168, 178, 191, 0.11)" },
  cloudy: { day: "rgba(168, 178, 191, 0.14)", night: "rgba(140, 150, 163, 0.12)" },
  fog: { day: "rgba(178, 186, 196, 0.13)", night: "rgba(142, 150, 160, 0.12)" },
  drizzle: { day: "rgba(120, 185, 242, 0.15)", night: "rgba(110, 165, 220, 0.13)" },
  rain: { day: "rgba(120, 185, 242, 0.17)", night: "rgba(105, 160, 215, 0.14)" },
  snow: { day: "rgba(185, 229, 255, 0.16)", night: "rgba(160, 205, 240, 0.13)" },
  storm: { day: "rgba(138, 155, 255, 0.16)", night: "rgba(120, 138, 235, 0.14)" },
};
