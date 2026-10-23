"use client";

import { useCallback } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GeoLocation } from "@/types/weather";

const MAX_FAVORITES = 8;

/** Small localStorage-backed list of pinned locations. */
export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<GeoLocation[]>(
    "mahtab:favorites",
    [],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (location: GeoLocation) => {
      setFavorites((previous) => {
        if (previous.some((f) => f.id === location.id)) {
          return previous.filter((f) => f.id !== location.id);
        }
        return [location, ...previous].slice(0, MAX_FAVORITES);
      });
    },
    [setFavorites],
  );

  return { favorites, isFavorite, toggleFavorite };
}
