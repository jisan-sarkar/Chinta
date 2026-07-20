"use client";

import { AudioLines, Mic, Send } from "lucide-react";

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
  credentials,
  centered = false,
  onPromptChange,
  onSend,
  onOpenProviderModal,
  onOpenModelModal,
}: {
  prompt: string;
  isStreaming: boolean;
  canSend: boolean;
  credentials: ProviderCredentialStatus[];
  centered?: boolean;
  onPromptChange: (prompt: string) => void;
  onSend: () => void;
  onOpenProviderModal: () => void;
  onOpenModelModal: () => void;
}) {
  const primaryAction = getComposerPrimaryAction({
    prompt,
    canSend,
    isStreaming,
  });

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-4xl px-3 sm:px-5",
        centered ? "" : "pb-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <div className="flex min-h-14 items-center gap-1.5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-[var(--shadow-soft)] transition-[border-color,box-shadow] duration-200 focus-within:border-[color-mix(in_srgb,var(--accent),var(--border)_55%)] sm:min-h-16 sm:gap-2 sm:rounded-[2rem] sm:p-2">
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
          className="max-h-32 min-h-10 flex-1 self-center border-0 bg-transparent px-1 py-2 text-[15px] leading-6 focus:ring-0 sm:px-0 sm:text-base"
        />
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ProviderPicker
            credentials={credentials}
            onOpen={onOpenProviderModal}
          />
          <ModelPicker
            credentials={credentials}
            onOpen={onOpenModelModal}
          />
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
