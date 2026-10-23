"use client";

import { CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
}

/** Blocking error state with a retry action. */
export function ErrorState({
  title = "Weather unavailable",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Card
      role="alert"
      className="flex flex-col items-center gap-4 px-6 py-16 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface-2">
        <CloudOff aria-hidden="true" className="h-6 w-6 text-muted" />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted">
          {message}
        </p>
      </div>
      <Button onClick={onRetry} variant="subtle" className="mt-1">
        <RefreshCw aria-hidden="true" className="h-4 w-4" />
        Try again
      </Button>
    </Card>
  );
}
