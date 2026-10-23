"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchWeatherFor, reverseLookup, WeatherApiError } from "@/lib/weather-api";
import { isFiniteNumber } from "@/lib/utils";
import type { GeoLocation, WeatherData } from "@/types/weather";

export const DEFAULT_LOCATION: GeoLocation = {
  id: "geo:112931",
  name: "Tehran",
  region: "Tehran",
  country: "Iran",
  latitude: 35.6944,
  longitude: 51.4215,
};

const STORAGE_KEY = "mahtab:last-location";

function isGeoLocation(value: unknown): value is GeoLocation {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    isFiniteNumber(v.latitude) &&
    isFiniteNumber(v.longitude)
  );
}

function readStoredLocation(): GeoLocation | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGeoLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persistLocation(location: GeoLocation) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

function describeError(error: unknown): string {
  if (error instanceof WeatherApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong while loading the weather.";
}

export type WeatherStatus = "loading" | "ready" | "error";

export interface WeatherState {
  location: GeoLocation;
  data: WeatherData | null;
  status: WeatherStatus;
  /** Blocking error — shown full-page when no data is available. */
  error: string | null;
  /** Non-blocking error while refreshing with existing data on screen. */
  refreshError: string | null;
  isRefreshing: boolean;
  lastUpdated: number | null;
  isLocating: boolean;
  geoError: string | null;
}

const initialState: WeatherState = {
  location: DEFAULT_LOCATION,
  data: null,
  status: "loading",
  error: null,
  refreshError: null,
  isRefreshing: false,
  lastUpdated: null,
  isLocating: false,
  geoError: null,
};

export function useWeather() {
  const [state, setState] = useState<WeatherState>(initialState);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (location: GeoLocation, options: { background?: boolean } = {}) => {
      const seq = ++requestSeq.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((s) => ({
        ...s,
        location,
        status: options.background && s.data ? s.status : "loading",
        error: options.background && s.data ? s.error : null,
        refreshError: null,
        isRefreshing: true,
      }));

      try {
        const data = await fetchWeatherFor(location, controller.signal);
        if (seq !== requestSeq.current) return;
        setState((s) => ({
          ...s,
          data,
          status: "ready",
          error: null,
          refreshError: null,
          isRefreshing: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        if (seq !== requestSeq.current) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        const message = describeError(error);
        setState((s) => ({
          ...s,
          status: s.data ? s.status : "error",
          error: s.data ? null : message,
          refreshError: s.data ? message : null,
          isRefreshing: false,
        }));
      }
    },
    [],
  );

  const selectLocation = useCallback(
    (location: GeoLocation) => {
      persistLocation(location);
      void load(location);
    },
    [load],
  );

  const refresh = useCallback(() => {
    void load(state.location, { background: true });
  }, [load, state.location]);

  // Initial load: restore the last selected location when available.
  // Deferred one frame so the effect body performs no synchronous state updates.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readStoredLocation();
      void load(stored ?? DEFAULT_LOCATION);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      abortRef.current?.abort();
    };
  }, [load]);

  const locateMe = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((s) => ({
        ...s,
        geoError: "Geolocation is not supported by this browser.",
      }));
      return;
    }

    setState((s) => ({ ...s, isLocating: true, geoError: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const location = await reverseLookup(
            position.coords.latitude,
            position.coords.longitude,
          );
          setState((s) => ({ ...s, isLocating: false }));
          selectLocation(location);
        } catch {
          setState((s) => ({
            ...s,
            isLocating: false,
            geoError: "Could not resolve your location name. Try searching instead.",
          }));
        }
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow access or search for a city."
            : "Your position could not be determined. Try searching for a city.";
        setState((s) => ({ ...s, isLocating: false, geoError: message }));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, [selectLocation]);

  const dismissGeoError = useCallback(() => {
    setState((s) => ({ ...s, geoError: null }));
  }, []);

  return {
    ...state,
    selectLocation,
    refresh,
    locateMe,
    dismissGeoError,
  };
}
