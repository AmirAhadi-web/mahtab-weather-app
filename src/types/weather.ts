export type TemperatureUnit = "celsius" | "fahrenheit";

/** A resolved, displayable location (from geocoding, reverse geocoding, or defaults). */
export interface GeoLocation {
  id: string;
  name: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
}

export type WeatherKind =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

export interface CurrentConditions {
  /** Local ISO timestamp at the selected location (no offset, timezone is applied by the API). */
  time: string;
  isDay: boolean;
  weatherCode: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressure: number;
  precipitation: number;
  precipitationProbability: number | null;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number | null;
  todayMax: number;
  todayMin: number;
  todayPrecipProbability: number | null;
  sunrise: string | null;
  sunset: string | null;
}

export interface HourlyForecastPoint {
  /** Local ISO timestamp. */
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number | null;
  isDay: boolean;
  isNow: boolean;
}

export interface DailyForecastPoint {
  /** Local ISO date (YYYY-MM-DD). */
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number | null;
  uvIndexMax: number | null;
  sunrise: string | null;
  sunset: string | null;
}

/** Everything the dashboard needs, already normalized for the UI. */
export interface WeatherData {
  location: GeoLocation;
  timezone: string;
  /** Browser/server epoch ms of when the payload was assembled. */
  fetchedAt: number;
  current: CurrentConditions;
  /** Next ~24 hours starting from the current local hour. */
  hourly: HourlyForecastPoint[];
  /** Up to 7 days starting today. */
  daily: DailyForecastPoint[];
}
