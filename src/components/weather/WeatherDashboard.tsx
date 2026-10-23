"use client";

import dynamic from "next/dynamic";
import { MapPinOff, TriangleAlert, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { DeveloperFooter } from "@/components/layout/DeveloperFooter";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { DashboardSkeleton } from "@/components/weather/DashboardSkeleton";
import { ErrorState } from "@/components/weather/ErrorState";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { WeatherDetails } from "@/components/weather/WeatherDetails";
import { WeatherHeader } from "@/components/weather/WeatherHeader";
import { useFavorites } from "@/hooks/use-favorites";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useWeather } from "@/hooks/use-weather";
import type { TemperatureUnit } from "@/types/weather";

// Recharts is heavy and browser-only — load it after the shell paints.
const TemperatureChart = dynamic(
  () => import("@/components/weather/TemperatureChart"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[280px] rounded-[22px] lg:order-5 lg:col-span-2 xl:order-4 xl:col-span-4" />
    ),
  },
);

export function WeatherDashboard() {
  const weather = useWeather();
  const [unit, setUnit] = useLocalStorage<TemperatureUnit>("mahtab:unit", "celsius");
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const { data, status } = weather;
  const showSkeleton = status === "loading" || (status === "error" && !data && !weather.error);
  const showBlockingError = status === "error" && !data && weather.error;

  return (
    <div className="flex min-h-dvh flex-col">
      <WeatherHeader
        unit={unit}
        onUnitChange={setUnit}
        onSelectLocation={weather.selectLocation}
        onUseLocation={weather.locateMe}
        isLocating={weather.isLocating}
        favorites={favorites}
      />

      <main className="mx-auto w-full max-w-[76rem] flex-1 px-4 pb-10 pt-5 sm:px-6">
        {weather.geoError && (
          <div
            role="alert"
            className="animate-enter mb-4 flex items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
          >
            <MapPinOff aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <p className="flex-1 text-sm leading-relaxed text-muted">
              {weather.geoError}
            </p>
            <button
              type="button"
              onClick={weather.dismissGeoError}
              aria-label="Dismiss location error"
              className="rounded-md p-0.5 text-faint transition-colors hover:text-ink"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        )}

        {weather.refreshError && data && (
          <div
            role="alert"
            className="animate-enter mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
          >
            <TriangleAlert aria-hidden="true" className="h-4 w-4 shrink-0 text-warn" />
            <p className="text-sm text-muted">
              Refresh failed — showing the last successful data.{" "}
              <span className="text-faint">{weather.refreshError}</span>
            </p>
          </div>
        )}

        {showSkeleton && <DashboardSkeleton />}

        {showBlockingError && (
          <ErrorState message={weather.error ?? ""} onRetry={weather.refresh} />
        )}

        {data && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12">
            <div className="animate-enter lg:col-span-2 xl:order-1 xl:col-span-8">
              <CurrentWeather
                data={data}
                unit={unit}
                isFavorite={isFavorite(data.location.id)}
                onToggleFavorite={() => toggleFavorite(data.location)}
                onRefresh={weather.refresh}
                isRefreshing={weather.isRefreshing}
                lastUpdated={weather.lastUpdated}
              />
            </div>

            <div
              className="animate-enter lg:order-2 lg:col-span-2 xl:order-5 xl:col-span-12"
              style={{ animationDelay: "80ms" }}
            >
              <HourlyForecast hourly={data.hourly} unit={unit} />
            </div>

            <div
              className="animate-enter lg:order-3 xl:order-3 xl:col-span-8"
              style={{ animationDelay: "140ms" }}
            >
              <h2 className="sr-only">Current conditions</h2>
              <WeatherDetails current={data.current} />
            </div>

            <div
              className="animate-enter lg:order-4 xl:order-2 xl:col-span-4"
              style={{ animationDelay: "200ms" }}
            >
              <DailyForecast daily={data.daily} unit={unit} />
            </div>

            <div
              className="animate-enter min-h-[280px] lg:order-5 lg:col-span-2 xl:order-4 xl:col-span-4"
              style={{ animationDelay: "260ms" }}
            >
              <TemperatureChart hourly={data.hourly} unit={unit} />
            </div>
          </div>
        )}
      </main>

      <DeveloperFooter />
    </div>
  );
}
