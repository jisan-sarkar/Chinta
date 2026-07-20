"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Cpu, Search, X } from "lucide-react";
import { type Model } from "@chinta/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ProviderCredentialStatus } from "@/lib/api";
import { cn } from "@/lib/cn";
import { type ReasoningEffort, useChatStore } from "./chat-store";
import {
  filterModels,
  formatModelLabel,
  getModelModalState,
  reasoningOptions,
  supportsReasoning,
} from "./model-picker";

export function ModelModal({
  open,
  onOpenChange,
  models,
  credentials,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models: Model[];
  credentials: ProviderCredentialStatus[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedProvider = useChatStore((state) => state.selectedProvider);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const selectedReasoning = useChatStore((state) => state.selectedReasoning);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const setSelectedReasoning = useChatStore(
    (state) => state.setSelectedReasoning,
  );
  const modalState = getModelModalState({
    selectedProvider,
    credentials,
    models,
  });
  const selectableModels =
    modalState === "ready" ? filterModels(models, searchQuery) : [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed inset-x-2 bottom-2 z-50 flex max-h-[min(44rem,calc(100dvh-1rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(44rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border)] p-4">
            <div className="min-w-0">
              <Dialog.Title className="text-sm font-semibold">Models</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--muted-foreground)]">
                Choose an OpenRouter model for this chat.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" aria-label="Close models" className="rounded-xl">
                <X size={17} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="shrink-0 border-b border-[var(--border)]/70 p-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                size={16}
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search models"
                className="h-10 rounded-xl pl-9"
                disabled={modalState !== "ready"}
              />
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-2 py-3 sm:px-3">
            {modalState === "disconnected" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                Connect OpenRouter before selecting a model.
              </div>
            ) : modalState === "empty" ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                No OpenRouter models are available yet.
              </div>
            ) : selectableModels.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                No models match your search.
              </div>
            ) : (
              selectableModels.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "mb-1 flex w-full min-w-0 items-start gap-3 rounded-xl px-3 py-3 text-left text-sm transition-[background-color,box-shadow] duration-150 hover:bg-[var(--muted)]",
                    selectedModel === model.id && "bg-[var(--muted)] shadow-sm",
                  )}
                >
                  <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--card)]">
                    <Cpu size={16} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedModel(model.id)}
                    className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="min-w-0 truncate font-medium">
                        {formatModelLabel(model)}
                      </span>
                      {selectedModel === model.id ? (
                        <Check size={14} className="shrink-0 text-[var(--accent)]" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                      {model.id}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {model.contextWindow ? (
                        <span className="rounded-full bg-[var(--card)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                          {Intl.NumberFormat().format(model.contextWindow)} context
                        </span>
                      ) : null}
                      {model.capabilities.slice(0, 2).map((capability) => (
                        <span
                          key={capability}
                          className="rounded-full bg-[var(--card)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]"
                        >
                          {capability.replace("-", " ")}
                        </span>
                      ))}
                    </div>
                  </button>
                  {selectedModel === model.id && supportsReasoning(model) ? (
                    <div className="shrink-0">
                      <ReasoningDropdown
                        value={selectedReasoning}
                        onChange={setSelectedReasoning}
                      />
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReasoningDropdown({
  value,
  onChange,
}: {
  value: ReasoningEffort;
  onChange: (value: ReasoningEffort) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-2 text-xs capitalize outline-none transition hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          aria-label="Reasoning effort"
        >
          {value}
          <ChevronDown size={13} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-[60] w-36 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-xl"
        >
          {reasoningOptions.map((option) => (
            <DropdownMenu.Item
              key={option}
              onSelect={() => onChange(option)}
              className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm capitalize outline-none data-[highlighted]:bg-[var(--muted)]"
            >
              {option}
              {value === option ? <Check size={14} /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
