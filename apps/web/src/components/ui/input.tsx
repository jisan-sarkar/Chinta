import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none transition-[background-color,border-color,box-shadow] duration-150",
          "placeholder:text-[var(--muted-foreground)] focus:border-transparent focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-55",
          className,
        )}
        {...props}
      />
    );
  },
);
