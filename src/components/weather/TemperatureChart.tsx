"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  convertTemp,
  formatLocalHour,
  tempUnitSymbol,
} from "@/lib/utils";
import { getWeatherInfo } from "@/lib/weather-codes";
import type { HourlyForecastPoint, TemperatureUnit } from "@/types/weather";

interface ChartPoint {
  time: string;
  label: string;
  temp: number;
  condition: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: ChartPoint }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-xl border border-line bg-surface-2 px-3 py-2 shadow-lg shadow-[var(--shadow)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
        {point.label}
      </p>
      <p className="tabular mt-0.5 text-sm font-semibold text-ink">
        {Math.round(point.temp)}°{" "}
        <span className="font-normal text-muted">{point.condition}</span>
      </p>
    </div>
  );
}

export interface TemperatureChartProps {
  hourly: HourlyForecastPoint[];
  unit: TemperatureUnit;
}

export default function TemperatureChart({ hourly, unit }: TemperatureChartProps) {
  const points = useMemo<ChartPoint[]>(
    () =>
      hourly.map((hour) => ({
        time: hour.time,
        label: hour.isNow ? "Now" : formatLocalHour(hour.time),
        temp: Math.round(convertTemp(hour.temperature, unit) * 10) / 10,
        condition: getWeatherInfo(hour.weatherCode).label,
      })),
    [hourly, unit],
  );

  const temps = points.map((p) => p.temp);
  const chartSummary =
    points.length > 0
      ? `Temperatures for the next ${points.length} hours range from ${Math.round(
          Math.min(...temps),
        )} to ${Math.round(Math.max(...temps))} degrees ${
          unit === "celsius" ? "Celsius" : "Fahrenheit"
        }.`
      : "No temperature data available.";

  return (
    <Card aria-labelledby="chart-heading" className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="chart-heading" className="text-[15px] font-semibold text-ink">
          Temperature trend
        </h2>
        <span className="text-xs text-faint">{tempUnitSymbol(unit)}</span>
      </div>

      <p className="sr-only">{chartSummary}</p>

      <div
        className="mt-3 h-[176px] w-full flex-1"
        role="img"
        aria-label={chartSummary}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="temp-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--chart)", stopOpacity: 0.32 }} />
                <stop offset="100%" style={{ stopColor: "var(--chart)", stopOpacity: 0.02 }} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--line)"
              strokeDasharray="3 6"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              interval={4}
              dy={8}
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              tickFormatter={(value: number) => `${Math.round(value)}°`}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="var(--chart)"
              strokeWidth={2.25}
              fill="url(#temp-area-fill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--chart)",
                stroke: "var(--surface)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-right text-[11px] text-faint">Next 24 hours</p>
    </Card>
  );
}
