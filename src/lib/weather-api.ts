import type { GeoLocation, WeatherData } from "@/types/weather";

/**
 * Client-side data access. Requests go through the app's own route handlers,
 * which proxy Open-Meteo and normalize the payloads for the UI.
 */

export class WeatherApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "WeatherApiError";
    this.status = status;
  }
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new WeatherApiError(
      "Network connection failed. Check your connection and try again.",
      0,
    );
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON body handled below */
  }

  if (!res.ok) {
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed with status ${res.status}.`;
    throw new WeatherApiError(message, res.status);
  }

  return body as T;
}

export function fetchWeatherFor(
  location: GeoLocation,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    lat: String(location.latitude),
    lon: String(location.longitude),
    name: location.name,
  });
  if (location.country) params.set("country", location.country);
  if (location.region) params.set("region", location.region);
  if (location.id) params.set("id", location.id);
  return requestJson<WeatherData>(`/api/weather?${params}`, signal);
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<GeoLocation[]> {
  const params = new URLSearchParams({ q: query });
  const data = await requestJson<{ results: GeoLocation[] }>(
    `/api/geocode?${params}`,
    signal,
  );
  return Array.isArray(data.results) ? data.results : [];
}

export async function reverseLookup(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<GeoLocation> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });
  const data = await requestJson<{ location: GeoLocation }>(
    `/api/reverse-geocode?${params}`,
    signal,
  );
  return data.location;
}
