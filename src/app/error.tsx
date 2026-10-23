"use client";

import { CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[76rem] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface">
        <CloudOff aria-hidden="true" className="h-6 w-6 text-muted" />
      </span>
      <h1 className="mt-4 text-lg font-semibold text-ink">
        Something went wrong
      </h1>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
        {error.message ||
          "Mahtab hit an unexpected problem. Reloading usually fixes it."}
      </p>
      <Button onClick={reset} variant="subtle" className="mt-5">
        <RefreshCw aria-hidden="true" className="h-4 w-4" />
        Reload
      </Button>
    </main>
  );
}
