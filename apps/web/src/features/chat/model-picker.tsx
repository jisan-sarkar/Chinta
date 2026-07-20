"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Cpu } from "lucide-react";
import { type Model } from "@chinta/shared";

import { cn } from "@/lib/cn";
import { type ProviderCredentialStatus } from "@/lib/api";
import { useChatStore } from "./chat-store";
import { getProviderOption } from "./provider-catalog";
import { isProviderConnected } from "./provider-picker";

const fallbackOpenRouterModel: Model = {
  id: "openai/gpt-4.1",
  provider: "openrouter",
  name: "GPT-4.1",
  description: "OpenAI model routed through OpenRouter",
  contextWindow: null,
  capabilities: ["text-input"],
  inputTokenPrice: null,
  outputTokenPrice: null,
};

export function getSelectableModels(models: Model[]) {
  const openRouterModels = models.filter((model) => model.provider === "openrouter");
  const hasFallback = openRouterModels.some(
    (model) => model.id === fallbackOpenRouterModel.id,
  );

  return hasFallback
    ? openRouterModels
    : [fallbackOpenRouterModel, ...openRouterModels];
}

export function ModelPicker({
  models,
  credentials,
  compact = false,
}: {
  models: Model[];
  credentials: ProviderCredentialStatus[];
  compact?: boolean;
}) {
  const selectedProvider = useChatStore((state) => state.selectedProvider);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const provider = getProviderOption(selectedProvider);
  const connected = provider.live && isProviderConnected(selectedProvider, credentials);
  const selectableModels =
    selectedProvider === "openrouter" ? getSelectableModels(models) : [];
  const activeModel =
    selectableModels.find((model) => model.id === selectedModel) ??
    selectableModels[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          disabled={!connected}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-full text-sm transition hover:bg-[var(--muted)]",
            compact
              ? "max-w-48 border border-transparent bg-transparent px-2"
              : "max-w-64 border border-[var(--border)] bg-[var(--card)] px-3",
            "disabled:cursor-not-allowed disabled:opacity-55",
          )}
          aria-label={
            connected
              ? `Model: ${activeModel?.name ?? "Select model"}`
              : "Connect provider"
          }
        >
          <Cpu size={15} />
          <span className={cn("truncate", compact && "hidden sm:inline")}>
            {connected ? activeModel?.name ?? "Select model" : "Connect provider"}
          </span>
          <ChevronDown size={15} className={cn(compact && "hidden sm:block")} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 max-h-96 w-96 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl"
        >
          {selectableModels.map((model) => (
            <DropdownMenu.Item
              key={model.id}
              onSelect={() => setSelectedModel(model.id)}
              className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition data-[highlighted]:bg-[var(--muted)]"
            >
              <div className="mt-0.5 grid size-7 place-items-center rounded-md bg-[var(--muted)]">
                <Cpu size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{model.name}</span>
                  {selectedModel === model.id ? <Check size={14} /> : null}
                </div>
                <p className="truncate text-xs text-[var(--muted-foreground)]">
                  {model.id}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {model.contextWindow ? (
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                      {Intl.NumberFormat().format(model.contextWindow)} context
                    </span>
                  ) : null}
                  {model.capabilities.slice(0, 2).map((capability) => (
                    <span
                      key={capability}
                      className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]"
                    >
                      {capability.replace("-", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
