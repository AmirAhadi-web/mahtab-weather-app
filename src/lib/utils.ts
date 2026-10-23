import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { GeoLocation, TemperatureUnit } from "@/types/weather";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ---------------------------------- units ---------------------------------- */

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/** All API data is stored in Celsius; convert only for display. */
export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? celsiusToFahrenheit(celsius) : celsius;
}

export function formatTemp(
  celsius: number,
  unit: TemperatureUnit,
  options: { withUnit?: boolean } = {},
): string {
  const value = Math.round(convertTemp(celsius, unit));
  return `${value}°${options.withUnit ? (unit === "celsius" ? "C" : "F") : ""}`;
}

export function tempUnitSymbol(unit: TemperatureUnit): "°C" | "°F" {
  return unit === "celsius" ? "°C" : "°F";
}

/* --------------------------- naive local ISO dates -------------------------- */
/* Open-Meteo returns local times as "YYYY-MM-DDTHH:MM" with timezone=auto.    */
/* We intentionally treat these as plain local timestamps without shifting.    */

export function isoHourKey(iso: string): string {
  return iso.slice(0, 13);
}

/** "2024-05-05T14:00" -> "14:00" */
export function formatLocalTime(iso: string): string {
  return iso.slice(11, 16);
}

/** "2024-05-05T14:00" -> "14:00" (hour label for forecast rows) */
export function formatLocalHour(iso: string): string {
  return `${iso.slice(11, 13)}:00`;
}

function dateFromIsoDay(iso: string): Date {
  const [year = 1970, month = 1, day = 1] = iso
    .slice(0, 10)
    .split("-")
    .map(Number);
  return new Date(year, month - 1, day);
}

/** "2024-05-05" -> "Sun" / "Sunday" */
export function formatDayName(
  iso: string,
  style: "short" | "long" = "short",
): string {
  return new Intl.DateTimeFormat("en-US", { weekday: style }).format(
    dateFromIsoDay(iso),
  );
}

/** "2024-05-05T14:00" -> "Sunday, 5 May" */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateFromIsoDay(iso));
}

/** Epoch ms -> "14:05" (browser-local time, used for "updated at" labels). */
export function formatClock(epochMs: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(epochMs));
}

/* ------------------------------- meteorology ------------------------------- */

const COMPASS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

export function compassDirection(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return COMPASS[Math.round(normalized / 22.5) % 16];
}

export type UvTone = "low" | "moderate" | "high" | "very-high" | "extreme";

export function uvIndexInfo(uv: number): { label: string; tone: UvTone } {
  if (uv < 3) return { label: "Low", tone: "low" };
  if (uv < 6) return { label: "Moderate", tone: "moderate" };
  if (uv < 8) return { label: "High", tone: "high" };
  if (uv < 11) return { label: "Very high", tone: "very-high" };
  return { label: "Extreme", tone: "extreme" };
}

export function humidityLabel(humidity: number): string {
  if (humidity < 30) return "Dry air";
  if (humidity <= 60) return "Comfortable";
  if (humidity <= 75) return "Slightly humid";
  return "Very humid";
}

/* --------------------------------- miscellany ------------------------------ */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function locationKey(
  location: Pick<GeoLocation, "latitude" | "longitude">,
): string {
  return `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
