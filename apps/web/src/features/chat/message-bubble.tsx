"use client";

import { cn } from "@/lib/cn";
import { MarkdownMessage } from "./markdown-message";

export type DisplayMessage = {
  id?: string;
  role: "user" | "assistant";
  parts: Array<{ type: string; text?: string }>;
};

export function MessageBubble({ message }: { message: DisplayMessage }) {
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return (
    <div
      className={cn(
        "flex w-full",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[min(85%,42rem)] rounded-2xl px-4 py-3 text-[15px] leading-7",
          message.role === "user"
            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-transparent px-0",
        )}
      >
        {message.role === "assistant" ? (
          <MarkdownMessage content={text} />
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  );
}
