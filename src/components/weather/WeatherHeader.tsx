"use client";

import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Loader2, LocateFixed, Moon, Sun } from "lucide-react";

import { CitySearch } from "@/components/weather/CitySearch";
import { LogoMark } from "@/components/ui/LogoMark";
import { cn } from "@/lib/utils";
import type { GeoLocation, TemperatureUnit } from "@/types/weather";

function UnitToggle({
  unit,
  onChange,
}: {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Temperature unit"
      className="flex h-10 items-center rounded-xl border border-line bg-surface p-1"
    >
      {(["celsius", "fahrenheit"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={unit === option}
          aria-label={option === "celsius" ? "Show temperatures in Celsius" : "Show temperatures in Fahrenheit"}
          onClick={() => onChange(option)}
          className={cn(
            "h-8 min-w-9 rounded-lg px-2 text-sm font-semibold transition-all duration-150",
            unit === option
              ? "bg-accent text-accent-ink"
              : "text-muted hover:text-ink",
          )}
        >
          {option === "celsius" ? "°C" : "°F"}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Mounted detection without cascading renders: server snapshot reads false.
  const subscribe = useCallback(() => () => {}, []);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {mounted && !isDark ? (
        <Moon aria-hidden="true" className="h-[18px] w-[18px]" />
      ) : (
        <Sun aria-hidden="true" className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}

export interface WeatherHeaderProps {
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
  onSelectLocation: (location: GeoLocation) => void;
  onUseLocation: () => void;
  isLocating: boolean;
  favorites: GeoLocation[];
}

export function WeatherHeader({
  unit,
  onUnitChange,
  onSelectLocation,
  onUseLocation,
  isLocating,
  favorites,
}: WeatherHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-center gap-x-3 px-4 pt-3 sm:h-[68px] sm:flex-nowrap sm:gap-4 sm:px-6 sm:pt-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
          aria-label="Mahtab home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[11px] border border-line-strong bg-accent-soft">
            <LogoMark className="h-[19px] w-[19px] text-accent" />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            Mahtab
          </span>
        </Link>

        <div className="order-3 w-full pb-3 pt-3 sm:order-2 sm:mx-1 sm:w-auto sm:max-w-md sm:flex-1 sm:py-0">
          <CitySearch onSelect={onSelectLocation} favorites={favorites} />
        </div>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-2 sm:order-3">
          <button
            type="button"
            aria-label="Use my current location"
            title="Use my current location"
            onClick={onUseLocation}
            disabled={isLocating}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 aria-hidden="true" className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <LocateFixed aria-hidden="true" className="h-[18px] w-[18px]" />
            )}
          </button>
          <UnitToggle unit={unit} onChange={onUnitChange} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
