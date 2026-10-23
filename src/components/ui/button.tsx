import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "subtle" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-strong active:bg-accent-pressed active:scale-[0.98]",
  subtle:
    "border border-line bg-surface-2 text-ink hover:border-line-strong hover:bg-surface-3 active:scale-[0.98]",
  ghost: "text-muted hover:bg-surface-2 hover:text-ink active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 rounded-xl px-3.5 text-sm",
  md: "h-10 rounded-xl px-4 text-sm",
  icon: "h-10 w-10 rounded-xl",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
