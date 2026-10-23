import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  buildGeocodingUrl,
  normalizeGeocoding,
  type OMGeocodingResponse,
} from "@/lib/open-meteo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(buildGeocodingUrl(query), {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Search is temporarily unavailable. Try again shortly." },
        { status: 502 },
      );
    }

    const raw = (await res.json()) as OMGeocodingResponse;
    return NextResponse.json({ results: normalizeGeocoding(raw) });
  } catch {
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Try again shortly." },
      { status: 502 },
    );
  }
}
