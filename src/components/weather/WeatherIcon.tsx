import { createElement } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { getWeatherInfo } from "@/lib/weather-codes";

function pickIcon(code: number, isDay: boolean): LucideIcon {
  const { kind } = getWeatherInfo(code);
  switch (kind) {
    case "clear":
      return isDay ? Sun : Moon;
    case "partly":
      return isDay ? CloudSun : CloudMoon;
    case "cloudy":
      return Cloud;
    case "fog":
      return CloudFog;
    case "drizzle":
      return CloudDrizzle;
    case "rain":
      return CloudRain;
    case "snow":
      return CloudSnow;
    case "storm":
      return code === 96 || code === 99 ? CloudHail : CloudLightning;
  }
}

export interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  strokeWidth?: number;
  /** Tint the glyph with the palette's per-condition colors (sunny/rain/…). */
  colored?: boolean;
}

/** Decorative weather glyph — provide nearby text or aria-label for meaning. */
export function WeatherIcon({
  code,
  isDay = true,
  className,
  strokeWidth = 1.75,
  colored = false,
}: WeatherIconProps) {
  const { kind } = getWeatherInfo(code);
  return createElement(pickIcon(code, isDay), {
    "aria-hidden": true,
    className,
    strokeWidth,
    style: colored ? { color: `var(--wx-${kind})` } : undefined,
  });
}
