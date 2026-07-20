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
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent font-medium leading-none outline-none transition-[background-color,border-color,color,box-shadow,opacity,transform,filter] duration-150",
        "disabled:pointer-events-none disabled:opacity-45 focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98]",
        variant === "primary" &&
          "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm hover:brightness-95",
        variant === "ghost" && "hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        variant === "outline" &&
          "border-[var(--border)] bg-transparent hover:bg-[var(--muted)]",
        size === "sm" && "h-8 min-w-8 px-3 text-sm",
        size === "md" && "h-10 min-w-10 px-4 text-sm",
        size === "icon" && "size-9",
        className,
      )}
      {...props}
    />
  );
}
