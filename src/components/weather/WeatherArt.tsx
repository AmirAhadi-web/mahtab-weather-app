import { useId } from "react";

import { cn } from "@/lib/utils";
import type { WeatherKind } from "@/types/weather";

export interface WeatherArtProps {
  kind: WeatherKind;
  isDay: boolean;
  className?: string;
}

/**
 * Original layered weather scene drawn with SVG primitives.
 * Intentionally static — a calm, editorial illustration rather than an animation.
 */
export function WeatherArt({ kind, isDay, className }: WeatherArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = {
    sun: `sun-${uid}`,
    cloud: `cloud-${uid}`,
    moon: `moon-${uid}`,
    halo: `halo-${uid}`,
    moonMask: `moonmask-${uid}`,
  };

  const showSun = isDay && (kind === "clear" || kind === "partly" || kind === "fog");
  const showMoon = !isDay && (kind === "clear" || kind === "partly" || kind === "fog");
  const showBackCloud =
    kind === "cloudy" || kind === "rain" || kind === "snow" || kind === "storm" || kind === "drizzle";
  const showMainCloud = kind !== "clear";
  const showRain = kind === "rain" || kind === "storm" || kind === "drizzle";
  const showSnow = kind === "snow";
  const showBolt = kind === "storm";
  const showFog = kind === "fog";
  const showStars = !isDay && (kind === "clear" || kind === "partly");

  // Celestial body placement: large and centered for "clear", compact and
  // offset when a cloud shares the scene. Kept clear of the viewBox edges so
  // the halo and rays are never clipped.
  const prominent = kind === "clear";
  const cx = prominent ? 158 : 220;
  const cy = prominent ? 106 : 72;
  const r = prominent ? 42 : 24;
  const haloR = r * 2.2;

  return (
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-hidden="true"
      className={cn("h-auto w-full select-none", className)}
    >
      <defs>
        <radialGradient id={ids.sun} cx="50%" cy="45%" r="60%">
          <stop offset="0%" style={{ stopColor: "var(--sun-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--sun-lo)" }} />
        </radialGradient>
        <radialGradient id={ids.halo} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "var(--sun-hi)", stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: "var(--sun-hi)", stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id={ids.cloud} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--cloud-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--cloud-lo)" }} />
        </linearGradient>
        <linearGradient id={ids.moon} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--moon-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--moon-lo)" }} />
        </linearGradient>
        {/* Crescent mask: the offset black circle carves the moon bite while
            letting the card background show through (no color mismatch). */}
        <mask id={ids.moonMask}>
          <circle cx={cx} cy={cy} r={r} fill="white" />
          <circle cx={cx + r * 0.42} cy={cy - r * 0.34} r={r * 0.88} fill="black" />
        </mask>
      </defs>

      {/* Stars */}
      {showStars && (
        <g fill="var(--moon-hi)">
          {[
            { x: 40, y: 42, r: 1.8, o: 0.9 },
            { x: 86, y: 24, r: 1.4, o: 0.5 },
            { x: 268, y: 96, r: 1.6, o: 0.75 },
            { x: 292, y: 40, r: 1.2, o: 0.45 },
            { x: 52, y: 96, r: 1.2, o: 0.6 },
          ].map((s) => (
            <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
      )}

      {/* Sun */}
      {showSun && (
        <g>
          <circle cx={cx} cy={cy} r={haloR} fill={`url(#${ids.halo})`} />
          <g stroke="var(--sun-lo)" strokeWidth={5} strokeLinecap="round" opacity={0.85}>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const r1 = r + 11;
              const r2 = r + 22;
              return (
                <line
                  key={i}
                  x1={cx + r1 * Math.cos(angle)}
                  y1={cy + r1 * Math.sin(angle)}
                  x2={cx + r2 * Math.cos(angle)}
                  y2={cy + r2 * Math.sin(angle)}
                />
              );
            })}
          </g>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${ids.sun})`} />
        </g>
      )}

      {/* Moon (true crescent via mask) */}
      {showMoon && (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="var(--moon-lo)" opacity={0.16} />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={`url(#${ids.moon})`}
            mask={`url(#${ids.moonMask})`}
          />
        </g>
      )}

      {/* Back cloud */}
      {showBackCloud && (
        <g opacity={0.5}>
          <circle cx={102} cy={98} r={24} fill="var(--cloud-back)" />
          <circle cx={136} cy={88} r={30} fill="var(--cloud-back)" />
          <circle cx={170} cy={98} r={22} fill="var(--cloud-back)" />
          <rect x={98} y={98} width={96} height={26} rx={13} fill="var(--cloud-back)" />
        </g>
      )}

      {/* Main cloud */}
      {showMainCloud && (
        <g>
          <circle cx={122} cy={138} r={34} fill={`url(#${ids.cloud})`} />
          <circle cx={168} cy={122} r={44} fill={`url(#${ids.cloud})`} />
          <circle cx={212} cy={140} r={30} fill={`url(#${ids.cloud})`} />
          <rect x={118} y={138} width={126} height={32} rx={16} fill={`url(#${ids.cloud})`} />
        </g>
      )}

      {/* Rain */}
      {showRain && (
        <g
          stroke="var(--rain-drop)"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={kind === "drizzle" ? 0.7 : 1}
        >
          {[112, 142, 172, 202].map((x) => (
            <line key={x} x1={x} y1={188} x2={x - 6} y2={202} />
          ))}
        </g>
      )}

      {/* Snow */}
      {showSnow && (
        <g fill="var(--snow-flake)">
          {[108, 136, 164, 192, 220].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 === 0 ? 192 : 206} r={4} />
          ))}
        </g>
      )}

      {/* Lightning */}
      {showBolt && (
        <path
          d="M172 178 l-22 30 h14 l-8 30 26 -36 h-14 l12 -24 z"
          fill="var(--bolt)"
        />
      )}

      {/* Fog banks */}
      {showFog && (
        <g fill="var(--cloud-lo)">
          {[
            { y: 186, x: 76, w: 150 },
            { y: 202, x: 104, w: 160 },
            { y: 218, x: 84, w: 130 },
          ].map((f) => (
            <rect key={f.y} x={f.x} y={f.y} width={f.w} height={9} rx={4.5} opacity={0.55} />
          ))}
        </g>
      )}
    </svg>
  );
}
