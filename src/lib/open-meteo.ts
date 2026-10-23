import type {
  CurrentConditions,
  DailyForecastPoint,
  GeoLocation,
  HourlyForecastPoint,
  WeatherData,
} from "@/types/weather";
import { isFiniteNumber, isoHourKey, locationKey } from "./utils";

/* ------------------------------------------------------------------------- */
/* Raw payloads returned by the Open-Meteo APIs (only the fields we request) */
/* ------------------------------------------------------------------------- */

export interface OMCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface OMHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability: Array<number | null>;
  is_day: number[];
  uv_index: Array<number | null>;
}

export interface OMDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: Array<number | null>;
  uv_index_max: Array<number | null>;
  sunrise: string[];
  sunset: string[];
}

export interface OMForecast {
  timezone?: string;
  current?: OMCurrent;
  hourly?: OMHourly;
  daily?: OMDaily;
}

export interface OMGeocodingResult {
  id?: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  admin1?: string;
}

export interface OMGeocodingResponse {
  results?: OMGeocodingResult[];
}

/* ------------------------------ URL builders ------------------------------ */

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export function buildForecastUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly:
      "temperature_2m,weather_code,precipitation_probability,is_day,uv_index",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });
  return `${FORECAST_ENDPOINT}?${params.toString()}`;
}

export function buildGeocodingUrl(query: string): string {
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "en",
    format: "json",
  });
  return `${GEOCODING_ENDPOINT}?${params.toString()}`;
}

/* ---------------------------- response guards ----------------------------- */

function assertForecastShape(raw: OMForecast): asserts raw is Required<OMForecast> {
  const { current, hourly, daily } = raw;
  const ok =
    current &&
    isFiniteNumber(current.temperature_2m) &&
    isFiniteNumber(current.weather_code) &&
    Array.isArray(hourly?.time) &&
    Array.isArray(hourly?.temperature_2m) &&
    hourly.time.length === hourly.temperature_2m.length &&
    hourly.time.length > 0 &&
    Array.isArray(daily?.time) &&
    Array.isArray(daily?.temperature_2m_max) &&
    Array.isArray(daily?.temperature_2m_min) &&
    daily.time.length > 0;
  if (!ok) {
    throw new Error("The weather service returned an unexpected response.");
  }
}

/* ----------------------------- normalisation ------------------------------ */

export function normalizeForecast(
  raw: OMForecast,
  location: GeoLocation,
  fetchedAt: number = Date.now(),
): WeatherData {
  assertForecastShape(raw);
  const { current, hourly, daily } = raw;

  // Index of the hourly slot matching the current local hour.
  const nowKey = isoHourKey(current.time);
  let start = hourly.time.findIndex((t) => isoHourKey(t) === nowKey);
  if (start === -1) {
    start = hourly.time.findIndex((t) => t >= current.time);
  }
  if (start === -1) start = 0;

  const hourlyPoints: HourlyForecastPoint[] = [];
  for (let i = start; i < Math.min(start + 24, hourly.time.length); i += 1) {
    hourlyPoints.push({
      time: hourly.time[i],
      temperature: hourly.temperature_2m[i] ?? NaN,
      weatherCode: hourly.weather_code[i] ?? 3,
      precipitationProbability: hourly.precipitation_probability?.[i] ?? null,
      isDay: hourly.is_day?.[i] === 1,
      isNow: i === start,
    });
  }

  const dailyPoints: DailyForecastPoint[] = daily.time.map((date, i) => ({
    date,
    weatherCode: daily.weather_code[i] ?? 3,
    tempMax: daily.temperature_2m_max[i] ?? NaN,
    tempMin: daily.temperature_2m_min[i] ?? NaN,
    precipitationProbability: daily.precipitation_probability_max?.[i] ?? null,
    uvIndexMax: daily.uv_index_max?.[i] ?? null,
    sunrise: daily.sunrise?.[i] ?? null,
    sunset: daily.sunset?.[i] ?? null,
  }));

  const today = dailyPoints[0];
  const currentConditions: CurrentConditions = {
    time: current.time,
    isDay: current.is_day === 1,
    weatherCode: current.weather_code,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    pressure: current.pressure_msl,
    precipitation: current.precipitation,
    precipitationProbability: hourly.precipitation_probability?.[start] ?? null,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    windGusts: current.wind_gusts_10m,
    uvIndex: hourly.uv_index?.[start] ?? null,
    todayMax: today.tempMax,
    todayMin: today.tempMin,
    todayPrecipProbability: today.precipitationProbability,
    sunrise: today.sunrise,
    sunset: today.sunset,
  };

  return {
    location,
    timezone: raw.timezone ?? "auto",
    fetchedAt,
    current: currentConditions,
    hourly: hourlyPoints,
    daily: dailyPoints.slice(0, 7),
  };
}

export function normalizeGeocoding(raw: OMGeocodingResponse): GeoLocation[] {
  if (!Array.isArray(raw.results)) return [];
  return raw.results
    .filter(
      (r): r is OMGeocodingResult & { name: string; latitude: number; longitude: number } =>
        typeof r.name === "string" &&
        isFiniteNumber(r.latitude) &&
        isFiniteNumber(r.longitude),
    )
    .map((r) => {
      const base: GeoLocation = {
        id: r.id != null ? `geo:${r.id}` : `coord:${locationKey(r)}`,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
      };
      if (typeof r.country === "string" && r.country) base.country = r.country;
      if (typeof r.admin1 === "string" && r.admin1) base.region = r.admin1;
      return base;
    });
}
