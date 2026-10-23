import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { GeoLocation } from "@/types/weather";

export const dynamic = "force-dynamic";

interface BigDataCloudResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

/**
 * Reverse geocodes browser geolocation coordinates into a readable place name.
 * Uses BigDataCloud's free client endpoint (no API key required).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { error: "Valid latitude and longitude query parameters are required." },
      { status: 400 },
    );
  }

  const fallback: GeoLocation = {
    id: `coord:${lat.toFixed(3)},${lon.toFixed(3)}`,
    name: "Current location",
    latitude: lat,
    longitude: lon,
  };

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(
      5,
    )}&longitude=${lon.toFixed(5)}&localityLanguage=en`;
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ location: fallback });
    }

    const raw = (await res.json()) as BigDataCloudResponse;
    const name =
      raw.city?.trim() ||
      raw.locality?.trim() ||
      raw.principalSubdivision?.trim() ||
      fallback.name;

    const location: GeoLocation = { ...fallback, name };
    if (raw.countryName) location.country = raw.countryName;
    if (raw.principalSubdivision) location.region = raw.principalSubdivision;

    return NextResponse.json({ location });
  } catch {
    // Reverse geocoding is best-effort: fall back to coordinates display.
    return NextResponse.json({ location: fallback });
  }
}
