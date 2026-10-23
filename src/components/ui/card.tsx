import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-line bg-surface",
        className,
      )}
      {...props}
    />
  );
}
