import { describe, expect, it } from "vitest";

import { getWeatherInfo } from "./weather-codes";
import {
  celsiusToFahrenheit,
  compassDirection,
  convertTemp,
  formatTemp,
  uvIndexInfo,
} from "./utils";
import {
  normalizeForecast,
  normalizeGeocoding,
  type OMForecast,
} from "./open-meteo";
import type { GeoLocation } from "../types/weather";

describe("weather code mapping", () => {
  it("maps known WMO codes to labels and kinds", () => {
    expect(getWeatherInfo(0)).toMatchObject({ label: "Clear sky", kind: "clear" });
    expect(getWeatherInfo(3).kind).toBe("cloudy");
    expect(getWeatherInfo(61).kind).toBe("rain");
    expect(getWeatherInfo(95)).toMatchObject({ label: "Thunderstorm", kind: "storm" });
  });

  it("returns a graceful fallback for unknown codes", () => {
    const info = getWeatherInfo(9999);
    expect(info.kind).toBe("cloudy");
    expect(info.label).toBe("Unknown conditions");
  });
});

describe("temperature conversion", () => {
  it("converts Celsius to Fahrenheit", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it("respects the requested unit", () => {
    expect(convertTemp(20, "celsius")).toBe(20);
    expect(convertTemp(20, "fahrenheit")).toBeCloseTo(68);
    expect(formatTemp(20.4, "celsius")).toBe("20°");
    expect(formatTemp(0, "fahrenheit", { withUnit: true })).toBe("32°F");
  });
});

describe("direction and UV helpers", () => {
  it("maps degrees to compass points", () => {
    expect(compassDirection(0)).toBe("N");
    expect(compassDirection(90)).toBe("E");
    expect(compassDirection(225)).toBe("SW");
    expect(compassDirection(359)).toBe("N");
    expect(compassDirection(-45)).toBe("NW");
  });

  it("classifies UV index", () => {
    expect(uvIndexInfo(1).label).toBe("Low");
    expect(uvIndexInfo(5).label).toBe("Moderate");
    expect(uvIndexInfo(7).label).toBe("High");
    expect(uvIndexInfo(9).label).toBe("Very high");
    expect(uvIndexInfo(12).label).toBe("Extreme");
  });
});

describe("forecast normalization", () => {
  const location: GeoLocation = {
    id: "geo:1",
    name: "Test City",
    latitude: 52.5,
    longitude: 13.4,
  };

  function makeRaw(hourCount = 48, dayCount = 7): OMForecast {
    const day = "2024-05-05";
    return {
      timezone: "Europe/Berlin",
      current: {
        time: `${day}T14:30`,
        temperature_2m: 18.2,
        relative_humidity_2m: 55,
        apparent_temperature: 17.1,
        is_day: 1,
        precipitation: 0,
        weather_code: 2,
        pressure_msl: 1015,
        wind_speed_10m: 12.4,
        wind_direction_10m: 180,
        wind_gusts_10m: 24.1,
      },
      hourly: {
        time: Array.from(
          { length: hourCount },
          (_, i) => `2024-05-0${5 + Math.floor(i / 24)}T${String(i % 24).padStart(2, "0")}:00`,
        ),
        temperature_2m: Array.from({ length: hourCount }, (_, i) => 10 + i),
        weather_code: Array.from({ length: hourCount }, () => 2),
        precipitation_probability: Array.from({ length: hourCount }, () => 10),
        is_day: Array.from({ length: hourCount }, () => 1),
        uv_index: Array.from({ length: hourCount }, () => 4),
      },
      daily: {
        time: Array.from({ length: dayCount }, (_, i) => `2024-05-${String(5 + i).padStart(2, "0")}`),
        weather_code: Array.from({ length: dayCount }, () => 61),
        temperature_2m_max: Array.from({ length: dayCount }, (_, i) => 20 + i),
        temperature_2m_min: Array.from({ length: dayCount }, (_, i) => 10 + i),
        precipitation_probability_max: Array.from({ length: dayCount }, () => 30),
        uv_index_max: Array.from({ length: dayCount }, () => 5),
        sunrise: Array.from({ length: dayCount }, () => `${day}T05:58`),
        sunset: Array.from({ length: dayCount }, () => `${day}T20:35`),
      },
    };
  }

  it("slices 24 hourly points starting at the current hour", () => {
    const data = normalizeForecast(makeRaw(), location, 1_700_000_000_000);
    expect(data.hourly).toHaveLength(24);
    expect(data.hourly[0]?.time).toBe("2024-05-05T14:00");
    expect(data.hourly[0]?.isNow).toBe(true);
    expect(data.hourly[1]?.isNow).toBe(false);
  });

  it("maps current conditions with today's summary", () => {
    const data = normalizeForecast(makeRaw(), location);
    expect(data.current.temperature).toBeCloseTo(18.2);
    expect(data.current.todayMax).toBe(20);
    expect(data.current.todayMin).toBe(10);
    expect(data.current.uvIndex).toBe(4);
    expect(data.current.sunrise).toBe("2024-05-05T05:58");
    expect(data.daily).toHaveLength(7);
  });

  it("throws on malformed payloads", () => {
    expect(() => normalizeForecast({}, location)).toThrow();
    expect(() =>
      normalizeForecast({ current: undefined, hourly: undefined, daily: undefined }, location),
    ).toThrow("unexpected response");
  });

  it("normalizes geocoding results and drops invalid entries", () => {
    const results = normalizeGeocoding({
      results: [
        { id: 7, name: "Berlin", latitude: 52.5, longitude: 13.4, country: "Germany", admin1: "Berlin" },
        { id: 8, name: "Broken" },
        { name: "NoCoords" },
      ],
    });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "geo:7",
      name: "Berlin",
      country: "Germany",
      region: "Berlin",
    });
  });
});
