"use client";

import { useMemo } from "react";
import { Droplets } from "lucide-react";

import { Card } from "@/components/ui/card";
import { WeatherIcon } from "@/components/weather/WeatherIcon";
import { cn, convertTemp, formatDayName } from "@/lib/utils";
import { getWeatherInfo } from "@/lib/weather-codes";
import type { DailyForecastPoint, TemperatureUnit } from "@/types/weather";

export interface DailyForecastProps {
  daily: DailyForecastPoint[];
  unit: TemperatureUnit;
}

export function DailyForecast({ daily, unit }: DailyForecastProps) {
  const [weekMin, weekMax] = useMemo(() => {
    const mins = daily.map((d) => d.tempMin);
    const maxs = daily.map((d) => d.tempMax);
    return [Math.min(...mins), Math.max(...maxs)] as const;
  }, [daily]);

  const span = Math.max(weekMax - weekMin, 1);

  return (
    <Card
      aria-labelledby="daily-heading"
      className="flex h-full flex-col overflow-hidden"
    >
      <div className="px-5 pb-1 pt-5 sm:px-6">
        <h2 id="daily-heading" className="text-[15px] font-semibold text-ink">
          7-day forecast
        </h2>
      </div>

      <ul className="flex-1 divide-y divide-line px-2 py-2">
        {daily.map((day, index) => {
          const info = getWeatherInfo(day.weatherCode);
          const min = Math.round(convertTemp(day.tempMin, unit));
          const max = Math.round(convertTemp(day.tempMax, unit));
          const left = ((day.tempMin - weekMin) / span) * 100;
          const right = ((weekMax - day.tempMax) / span) * 100;
          const precip = day.precipitationProbability;

          return (
            <li
              key={day.date}
              aria-label={`${index === 0 ? "Today" : formatDayName(day.date, "long")}: ${
                info.label
              }, high ${max} degrees, low ${min} degrees${
                precip !== null && precip >= 5
                  ? `, ${Math.round(precip)} percent chance of precipitation`
                  : ""
              }`}
              className="grid grid-cols-[3.25rem_1.5rem_1fr] items-center gap-x-2.5 rounded-xl px-3 py-[13px] transition-colors hover:bg-surface-2 sm:gap-x-3"
            >
              <span
                className={cn(
                  "text-sm",
                  index === 0 ? "font-semibold text-ink" : "text-muted",
                )}
              >
                {index === 0 ? "Today" : formatDayName(day.date)}
              </span>

              <WeatherIcon
                code={day.weatherCode}
                isDay
                colored
                className="h-5 w-5"
              />

              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <span
                  className={cn(
                    "flex w-9 shrink-0 items-center gap-0.5 text-[11px] font-medium text-[var(--rain-drop)]",
                    precip !== null && precip >= 5 ? "" : "invisible",
                  )}
                >
                  <Droplets aria-hidden="true" className="h-2.5 w-2.5" />
                  {precip !== null ? `${Math.round(precip)}%` : ""}
                </span>

                <span className="tabular w-7 shrink-0 text-right text-sm text-muted">
                  {min}°
                </span>

                <span
                  aria-hidden="true"
                  className="relative h-1.5 min-w-6 flex-1 rounded-full bg-surface-2"
                >
                  <span
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      left: `${left}%`,
                      right: `${right}%`,
                      background:
                        "linear-gradient(to right, var(--range-lo), var(--range-hi))",
                      opacity: 0.9,
                    }}
                  />
                </span>

                <span className="tabular w-7 shrink-0 text-right text-sm font-semibold text-ink">
                  {max}°
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
