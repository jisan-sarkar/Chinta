import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "icon";
};

export function Button({
  asChild,
  className,
  variant = "ghost",
  size = "md",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-transparent font-medium outline-none transition disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        variant === "primary" &&
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95",
        variant === "ghost" && "hover:bg-[var(--muted)]",
        variant === "outline" &&
          "border-[var(--border)] bg-transparent hover:bg-[var(--muted)]",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "icon" && "h-9 w-9",
        className,
      )}
      {...props}
    />
  );
}
