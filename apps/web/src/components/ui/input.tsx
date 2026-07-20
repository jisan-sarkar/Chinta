import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none transition",
          "placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);
