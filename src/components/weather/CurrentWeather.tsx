"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CloudRainWind,
  Droplets,
  RefreshCw,
  Star,
  Thermometer,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { WeatherArt } from "@/components/weather/WeatherArt";
import { getWeatherInfo, KIND_GLOW } from "@/lib/weather-codes";
import {
  cn,
  convertTemp,
  formatClock,
  formatLongDate,
  tempUnitSymbol,
} from "@/lib/utils";
import type { TemperatureUnit, WeatherData } from "@/types/weather";

export interface CurrentWeatherProps {
  data: WeatherData;
  unit: TemperatureUnit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: number | null;
}

/** Ticking clock showing the selected location's local wall time. */
function useLocalClock(localIsoTime: string, fetchedAt: number) {
  const offsetMs = useMemo(
    () => new Date(localIsoTime).getTime() - fetchedAt,
    [localIsoTime, fetchedAt],
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(timer);
  }, []);

  const shifted = new Date(now + offsetMs);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(shifted);
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-faint" />
      <span className="tabular text-sm font-semibold text-ink">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export function CurrentWeather({
  data,
  unit,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: CurrentWeatherProps) {
  const { current, location } = data;
  const info = getWeatherInfo(current.weatherCode);
  const time = useLocalClock(current.time, data.fetchedAt);

  const glow = KIND_GLOW[info.kind][current.isDay ? "day" : "night"];
  const subtitle = [location.region, location.country]
    .filter((part, index, arr): part is string => Boolean(part) && arr.indexOf(part) === index)
    .join(" · ");
  const precipChance =
    current.todayPrecipProbability ?? current.precipitationProbability;

  return (
    <Card className="relative overflow-hidden" aria-label="Current weather">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(460px 250px at 50% 42%, ${glow}, transparent 70%)`,
        }}
      />

      <div className="absolute right-4 top-4 z-10 flex items-center gap-3 sm:right-6 sm:top-5">
        {lastUpdated !== null && (
          <span className="hidden text-xs text-faint sm:inline">
            Updated {formatClock(lastUpdated)}
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh weather data"
          title="Refresh"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-bg/40 text-muted transition-colors hover:text-ink"
        >
          <RefreshCw
            aria-hidden="true"
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
        </button>
      </div>

      <div className="relative p-5 sm:p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-[22px] font-semibold tracking-tight text-ink">
              {location.name}
            </h1>
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remove ${location.name} from saved locations`
                  : `Save ${location.name} to saved locations`
              }
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:text-accent"
            >
              <Star
                aria-hidden="true"
                className={cn(
                  "h-[17px] w-[17px] transition-colors",
                  isFavorite && "fill-accent text-accent",
                )}
              />
            </button>
          </div>

          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 py-1 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-x-6">
            <p className="text-[15px] font-medium text-accent sm:min-w-0 sm:justify-self-end sm:text-right">
              {info.label}
              {current.isDay ? "" : " · Night"}
            </p>
            <p className="flex items-start sm:justify-self-center">
              <span className="tabular text-[84px] font-extralight leading-[0.85] tracking-[-0.04em] text-ink sm:text-[96px]">
                {Math.round(convertTemp(current.temperature, unit))}
              </span>
              <span className="mt-2 text-2xl font-light text-muted">
                {tempUnitSymbol(unit)}
              </span>
            </p>
            <WeatherArt
              kind={info.kind}
              isDay={current.isDay}
              className="w-[104px] shrink-0 sm:w-[124px] sm:justify-self-start"
            />
          </div>

          <p className="mt-2 text-center text-[13px] text-faint">
            {formatLongDate(current.time)} · <span className="tabular">{time}</span> local
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
            <HeroStat
              icon={Thermometer}
              label="Feels like"
              value={`${Math.round(convertTemp(current.apparentTemperature, unit))}°`}
            />
            <HeroStat
              icon={ArrowUp}
              label="High"
              value={`${Math.round(convertTemp(current.todayMax, unit))}°`}
            />
            <HeroStat
              icon={ArrowDown}
              label="Low"
              value={`${Math.round(convertTemp(current.todayMin, unit))}°`}
            />
            <HeroStat
              icon={Droplets}
              label="Humidity"
              value={`${Math.round(current.humidity)}%`}
            />
            <HeroStat
              icon={Wind}
              label="Wind"
              value={`${Math.round(current.windSpeed)} km/h`}
            />
            <HeroStat
              icon={CloudRainWind}
              label="Precipitation"
              value={precipChance !== null ? `${Math.round(precipChance)}%` : "—"}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
