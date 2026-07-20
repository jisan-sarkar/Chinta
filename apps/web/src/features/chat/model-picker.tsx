"use client";

import { Cpu } from "lucide-react";
import { type Model } from "@chinta/shared";

import { cn } from "@/lib/cn";
import { type ProviderCredentialStatus } from "@/lib/api";
import { useChatStore } from "./chat-store";
import { getProviderOption } from "./provider-catalog";
import { isProviderConnected } from "./provider-picker";

export const reasoningOptions = ["low", "medium", "high"] as const;

export function getSelectableModels(models: Model[]) {
  return models.filter((model) => model.provider === "openrouter");
}

export function filterModels(models: Model[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const openRouterModels = getSelectableModels(models);

  if (!normalizedQuery) {
    return openRouterModels;
  }

  return openRouterModels.filter((model) => {
    const haystack = `${model.name} ${model.id}`.toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function formatModelLabel(model: Model) {
  return `OpenRouter / ${model.name}`;
}

export function supportsReasoning(model: Model) {
  const haystack = `${model.id} ${model.name}`.toLowerCase();
  const reasoningPatterns = [
    "o1",
    "o3",
    "o4",
    "gpt-5",
    "deepseek-r1",
    "qwen",
    "reasoning",
  ];

  return reasoningPatterns.some((pattern) => haystack.includes(pattern));
}

export function getModelModalState({
  selectedProvider,
  credentials,
  models,
}: {
  selectedProvider: ReturnType<typeof useChatStore.getState>["selectedProvider"];
  credentials: ProviderCredentialStatus[];
  models: Model[];
}) {
  if (!isModelPickerEnabled({ selectedProvider, credentials })) {
    return "disconnected" as const;
  }

  return getSelectableModels(models).length > 0 ? ("ready" as const) : ("empty" as const);
}

export function isModelPickerEnabled({
  selectedProvider,
  credentials,
}: {
  selectedProvider: ReturnType<typeof useChatStore.getState>["selectedProvider"];
  credentials: ProviderCredentialStatus[];
}) {
  const provider = getProviderOption(selectedProvider);

  return provider.live && isProviderConnected(selectedProvider, credentials);
}

export function ModelPicker({
  credentials,
  onOpen,
}: {
  credentials: ProviderCredentialStatus[];
  onOpen: () => void;
}) {
  const selectedProvider = useChatStore((state) => state.selectedProvider);
  const enabled = isModelPickerEnabled({ selectedProvider, credentials });

  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm transition hover:bg-[var(--muted)]",
        !enabled && "opacity-55",
      )}
      aria-label="Models"
      title="Models"
      onClick={onOpen}
    >
      <Cpu size={16} />
    </button>
  );
}
