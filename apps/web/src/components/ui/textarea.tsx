import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "max-h-52 min-h-14 w-full min-w-0 resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm leading-6 outline-none transition-[background-color,border-color,box-shadow] duration-150",
        "placeholder:text-[var(--muted-foreground)] focus:border-transparent focus:ring-2 focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
});
