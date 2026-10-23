"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, MapPin, Search, Star, X } from "lucide-react";

import { searchLocations } from "@/lib/weather-api";
import { cn } from "@/lib/utils";
import type { GeoLocation } from "@/types/weather";

type SearchStatus = "idle" | "loading" | "ready" | "error";

interface SearchResponse {
  query: string;
  status: SearchStatus;
  results: GeoLocation[];
}

export interface CitySearchProps {
  onSelect: (location: GeoLocation) => void;
  favorites: GeoLocation[];
}

function locationSubtitle(location: GeoLocation): string {
  return [location.region, location.country]
    .filter((part, index, arr): part is string => Boolean(part) && arr.indexOf(part) === index)
    .join(" · ");
}

export function CitySearch({ onSelect, favorites }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [response, setResponse] = useState<SearchResponse>({
    query: "",
    status: "idle",
    results: [],
  });

  const listId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  // Derived view of the latest response for the *current* query — while the
  // debounce is pending or the query changed, we are effectively "loading".
  const status: SearchStatus =
    trimmed.length < 2
      ? "idle"
      : response.query === trimmed
        ? response.status
        : "loading";
  const results = status === "ready" ? response.results : [];

  // Debounced geocoding search with cancellation of obsolete requests.
  useEffect(() => {
    abortRef.current?.abort();
    if (trimmed.length < 2) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = window.setTimeout(() => {
      setResponse((prev) => ({ ...prev, query: trimmed, status: "loading" }));
      searchLocations(trimmed, controller.signal)
        .then((locations) => {
          setResponse({ query: trimmed, status: "ready", results: locations });
          setActiveIndex(locations.length > 0 ? 0 : -1);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResponse({ query: trimmed, status: "error", results: [] });
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const choose = (location: GeoLocation) => {
    onSelect(location);
    setQuery("");
    setActiveIndex(-1);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      const target = activeIndex >= 0 ? results[activeIndex] : undefined;
      if (target) {
        event.preventDefault();
        choose(target);
      }
    } else if (event.key === "Escape") {
      close();
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 transition-colors",
          "focus-within:border-line-strong focus-within:bg-surface-2",
        )}
      >
        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-faint" />
        <label htmlFor="city-search" className="sr-only">
          Search for a city
        </label>
        <input
          id="city-search"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search city…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => close()}
          onKeyDown={handleKeyDown}
          className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
        />
        {status === "loading" && (
          <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin text-faint" />
        )}
        {query && status !== "loading" && (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-md p-0.5 text-faint transition-colors hover:text-ink"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 animate-fade overflow-hidden rounded-2xl border border-line bg-surface shadow-xl shadow-[var(--shadow)]">
          {trimmed.length < 2 ? (
            <div className="p-2">
              <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-faint">
                Saved locations
              </p>
              {favorites.length === 0 ? (
                <p className="px-2 pb-2 text-sm text-muted">
                  No saved locations yet. Search for a city and star it to pin it here.
                </p>
              ) : (
                <ul role="listbox" aria-label="Saved locations" id={listId}>
                  {favorites.map((location) => (
                    <li key={location.id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => choose(location)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink transition-colors hover:bg-surface-2"
                      >
                        <Star aria-hidden="true" className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" />
                        <span className="min-w-0 truncate">{location.name}</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-faint">
                          {locationSubtitle(location)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : status === "loading" ? (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Searching locations…
            </p>
          ) : status === "error" ? (
            <p className="px-4 py-3 text-sm text-muted" role="alert">
              Search failed. Check your connection and try again.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">
              {"No places match “"}
              {trimmed}
              {"”. Try another spelling."}
            </p>
          ) : (
            <ul role="listbox" id={listId} aria-label="Matching locations" className="p-1.5">
              {results.map((location, index) => (
                <li
                  key={location.id}
                  role="option"
                  id={`${listId}-${index}`}
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(location)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      index === activeIndex ? "bg-surface-2" : "",
                    )}
                  >
                    <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {location.name}
                      </span>
                      <span className="block truncate text-xs text-faint">
                        {locationSubtitle(location) || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
