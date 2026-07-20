"use client";

import { AudioLines, Mic, Send } from "lucide-react";
import { type Model } from "@chinta/shared";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import { type ProviderCredentialStatus } from "@/lib/api";
import { ComposerAddMenu } from "./composer-add-menu";
import { getComposerPrimaryAction } from "./composer-actions";
import { ModelPicker } from "./model-picker";
import { ProviderPicker } from "./provider-picker";

export function ChatComposer({
  prompt,
  isStreaming,
  canSend,
  models,
  credentials,
  onPromptChange,
  onSend,
}: {
  prompt: string;
  isStreaming: boolean;
  canSend: boolean;
  models: Model[];
  credentials: ProviderCredentialStatus[];
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
}) {
  const primaryAction = getComposerPrimaryAction({
    prompt,
    canSend,
    isStreaming,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-3 pb-4 sm:px-4">
      <div className="flex min-h-16 items-end gap-2 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-2 shadow-sm">
        <ComposerAddMenu />
        <Textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask anything"
          rows={1}
          className="max-h-32 min-h-10 flex-1 border-0 bg-transparent px-0 py-2 text-base focus:ring-0"
        />
        <div className="flex shrink-0 items-center gap-1 pb-0.5">
          <ProviderPicker credentials={credentials} compact />
          <ModelPicker models={models} credentials={credentials} compact />
          <Button
            size="icon"
            aria-label="Voice input"
            aria-disabled="true"
            className="hidden rounded-full sm:inline-flex"
            type="button"
          >
            <Mic size={18} />
          </Button>
          <Button
            variant={primaryAction.type === "send" ? "primary" : "ghost"}
            size="icon"
            onClick={primaryAction.type === "send" ? onSend : undefined}
            disabled={primaryAction.disabled}
            aria-label={primaryAction.label}
            aria-disabled={primaryAction.type === "voice" ? "true" : undefined}
            className={cn(
              "rounded-full",
              primaryAction.type === "voice" &&
                "bg-[var(--foreground)] text-[var(--background)] hover:brightness-95",
            )}
            type="button"
          >
            {primaryAction.type === "send" ? (
              <Send size={18} />
            ) : (
              <AudioLines size={19} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
