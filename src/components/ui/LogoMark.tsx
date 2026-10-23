"use client";

import { useId } from "react";

/**
 * Mahtab logo mark — a crescent moon with a companion star, drawn with a mask
 * so the crescent is a true cut-out that works on any background.
 */
export function LogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const maskId = `mahtab-moon-${uid}`;

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <mask id={maskId}>
          <circle cx="12" cy="13" r="8" fill="white" />
          <circle cx="16.4" cy="9.3" r="6.9" fill="black" />
        </mask>
      </defs>
      <circle cx="12" cy="13" r="8" fill="currentColor" mask={`url(#${maskId})`} />
      <circle cx="18.8" cy="5.4" r="1.25" fill="var(--sun-hi)" />
    </svg>
  );
}
