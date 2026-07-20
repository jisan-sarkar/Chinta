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
        "max-h-52 min-h-14 w-full resize-none rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-3 text-sm leading-6 outline-none transition",
        "placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
});
