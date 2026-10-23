import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  buildForecastUrl,
  normalizeForecast,
  type OMForecast,
} from "@/lib/open-meteo";
import type { GeoLocation } from "@/types/weather";

export const dynamic = "force-dynamic";

function parseCoordinate(
  value: string | null,
  min: number,
  max: number,
): number | null {
  if (value === null) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) return null;
  return num;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseCoordinate(params.get("lat"), -90, 90);
  const lon = parseCoordinate(params.get("lon"), -180, 180);

  if (lat === null || lon === null) {
    return NextResponse.json(
      { error: "Valid latitude and longitude query parameters are required." },
      { status: 400 },
    );
  }

  const name = params.get("name")?.trim() || "Selected location";
  const location: GeoLocation = {
    id: params.get("id") || `coord:${lat.toFixed(3)},${lon.toFixed(3)}`,
    name,
    latitude: lat,
    longitude: lon,
    ...(params.get("country") ? { country: params.get("country") as string } : {}),
    ...(params.get("region") ? { region: params.get("region") as string } : {}),
  };

  try {
    const res = await fetch(buildForecastUrl(lat, lon), {
      // Cache identical upstream requests for 10 minutes (Open-Meteo updates
      // forecasts roughly hourly; this keeps refreshes cheap).
      next: { revalidate: 600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `The weather service responded with status ${res.status}. Try again shortly.` },
        { status: 502 },
      );
    }

    const raw = (await res.json()) as OMForecast;
    const data = normalizeForecast(raw, location);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("unexpected response")
        ? error.message
        : "The weather service is unavailable right now. Try again shortly.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
