"use client";

import {
  Gauge,
  Navigation2,
  SunDim,
  Sunrise,
  Sunset,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn, compassDirection, formatLocalTime, uvIndexInfo } from "@/lib/utils";
import type { CurrentConditions } from "@/types/weather";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  sub: ReactNode;
  tone?: "accent" | "success" | "warn" | "danger";
  progress?: number;
  iconExtra?: ReactNode;
}

const toneClasses: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
};

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  sub,
  tone = "accent",
  progress,
  iconExtra,
}: MetricCardProps) {
  return (
    <div className="card-hover rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-faint">
          <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em]">
            {label}
          </h3>
        </div>
        {iconExtra}
      </div>
      <p className="mt-2.5 flex items-baseline gap-1">
        <span className="tabular text-[22px] font-semibold leading-none text-ink">
          {value}
        </span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </p>
      <div className="mt-1.5 text-xs leading-relaxed text-muted">{sub}</div>
      {typeof progress === "number" && (
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-surface-2"
          role="presentation"
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", toneClasses[tone])}
            style={{ width: `${Math.round(Math.min(Math.max(progress, 0), 1) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

const uvTone = {
  low: "success",
  moderate: "accent",
  high: "warn",
  "very-high": "danger",
  extreme: "danger",
} as const;

export function pressureLabel(pressure: number): string {
  if (pressure < 1000) return "Low — changeable conditions";
  if (pressure <= 1020) return "Within the typical range";
  return "High — settled conditions";
}

export interface WeatherDetailsProps {
  current: CurrentConditions;
}

export function WeatherDetails({ current }: WeatherDetailsProps) {
  const uv = current.uvIndex;
  const uvInfo = uv !== null ? uvIndexInfo(uv) : null;

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard
        icon={Wind}
        label="Wind"
        value={String(Math.round(current.windSpeed))}
        suffix="km/h"
        sub={`From ${compassDirection(current.windDirection)} · gusts ${Math.round(
          current.windGusts,
        )} km/h`}
        iconExtra={
          <span
            aria-hidden="true"
            className="grid h-6 w-6 place-items-center rounded-full border border-line bg-surface-2"
          >
            <Navigation2
              className="h-3 w-3 text-accent"
              style={{ transform: `rotate(${(current.windDirection + 180) % 360}deg)` }}
            />
          </span>
        }
      />

      <MetricCard
        icon={SunDim}
        label="UV index"
        value={uv !== null ? String(Math.round(uv)) : "—"}
        sub={uvInfo ? uvInfo.label : "Not available right now"}
        progress={uv !== null ? uv / 11 : 0}
        tone={uvInfo ? uvTone[uvInfo.tone] : "accent"}
      />

      <MetricCard
        icon={Gauge}
        label="Pressure"
        value={String(Math.round(current.pressure))}
        suffix="hPa"
        sub={pressureLabel(current.pressure)}
      />

      <MetricCard
        icon={Sunrise}
        label="Sun"
        value={current.sunrise ? formatLocalTime(current.sunrise) : "—"}
        sub={
          current.sunset ? (
            <span className="inline-flex items-center gap-1.5">
              <Sunset aria-hidden="true" className="h-3 w-3 text-faint" />
              Sunset at {formatLocalTime(current.sunset)}
            </span>
          ) : (
            "Sun times unavailable"
          )
        }
      />
    </div>
  );
}
