"use client";

import { Droplets } from "lucide-react";

import { Card } from "@/components/ui/card";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { cn, convertTemp, formatLocalHour } from "@/lib/utils";
import { getWeatherInfo } from "@/lib/weather-codes";
import type { HourlyForecastPoint, TemperatureUnit } from "@/types/weather";

export interface HourlyForecastProps {
  hourly: HourlyForecastPoint[];
  unit: TemperatureUnit;
}

export function HourlyForecast({ hourly, unit }: HourlyForecastProps) {
  return (
    <Card aria-labelledby="hourly-heading" className="overflow-hidden">
      <div className="flex items-baseline justify-between px-5 pb-3 pt-5 sm:px-6">
        <h2 id="hourly-heading" className="text-[15px] font-semibold text-ink">
          Hourly forecast
        </h2>
        <span className="text-xs text-faint">Next 24 hours</span>
      </div>

      <div className="scroll-fade-x overflow-x-auto px-3 pb-4 sm:px-4">
        <ol className="flex gap-1" aria-label="Hourly forecast">
          {hourly.map((hour) => {
            const precip = hour.precipitationProbability;
            const showPrecip = precip !== null && precip >= 20;
            return (
              <li
                key={hour.time}
                aria-label={`${hour.isNow ? "Now" : formatLocalHour(hour.time)}: ${
                  getWeatherInfo(hour.weatherCode).label
                }, ${Math.round(convertTemp(hour.temperature, unit))} degrees${
                  showPrecip ? `, ${Math.round(precip)} percent chance of precipitation` : ""
                }`}
                className={cn(
                  "flex min-w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition-colors",
                  hour.isNow
                    ? "bg-accent-soft ring-1 ring-inset ring-accent/40"
                    : "hover:bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "text-xs",
                    hour.isNow ? "font-semibold text-accent" : "text-faint",
                  )}
                >
                  {hour.isNow ? "Now" : formatLocalHour(hour.time)}
                </span>
                <WeatherIcon
                  code={hour.weatherCode}
                  isDay={hour.isDay}
                  colored
                  className="h-[22px] w-[22px]"
                />
                <span className="tabular text-[15px] font-semibold text-ink">
                  {Math.round(convertTemp(hour.temperature, unit))}°
                </span>
                <span
                  className={cn(
                    "flex h-3.5 items-center gap-0.5 text-[10px] font-medium text-[var(--rain-drop)]",
                    showPrecip ? "" : "invisible",
                  )}
                >
                  <Droplets aria-hidden="true" className="h-2.5 w-2.5" />
                  {showPrecip ? `${Math.round(precip)}%` : "0%"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}
