"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * useState backed by localStorage. The first client render matches the server
 * render (initial value); stored values hydrate one frame later in an effect
 * callback to avoid hydration mismatches and cascading renders.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) {
          setValue(JSON.parse(raw) as T);
        }
      } catch {
        // Corrupted or unavailable storage — keep the initial value.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [key]);

  const set = useCallback(
    (next: T | ((previous: T) => T)) => {
      setValue((previous) => {
        const resolved =
          typeof next === "function"
            ? (next as (p: T) => T)(previous)
            : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Storage may be unavailable (private mode) — state still updates.
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
