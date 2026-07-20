"use client";

import { Bot } from "lucide-react";
import { siGooglegemini, siOpenrouter, type SimpleIcon } from "simple-icons";

import { cn } from "@/lib/cn";
import { type PlannedProvider } from "./chat-store";

export type ProviderOption = {
  id: PlannedProvider;
  label: string;
  description: string;
  live: boolean;
  connectable: boolean;
};

const defaultProviderOption: ProviderOption = {
  id: "openrouter",
  label: "OpenRouter",
  description: "Live provider for this version",
  live: true,
  connectable: true,
};

export const providerOptions: ProviderOption[] = [
  defaultProviderOption,
  {
    id: "openai",
    label: "OpenAI",
    description: "Direct provider support coming later",
    live: false,
    connectable: false,
  },
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Direct provider support coming later",
    live: false,
    connectable: false,
  },
  {
    id: "gemini",
    label: "Google Gemini",
    description: "Direct provider support coming later",
    live: false,
    connectable: false,
  },
  {
    id: "groq",
    label: "Groq",
    description: "Direct provider support coming later",
    live: false,
    connectable: false,
  },
  {
    id: "together",
    label: "Together AI",
    description: "Direct provider support coming later",
    live: false,
    connectable: false,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    description: "Direct provider support coming later",
    live: false,
    connectable: false,
  },
  {
    id: "ollama",
    label: "Ollama",
    description: "Local provider support coming later",
    live: false,
    connectable: false,
  },
];

export function getProviderOption(provider: PlannedProvider): ProviderOption {
  return (
    providerOptions.find((option) => option.id === provider) ??
    defaultProviderOption
  );
}

export function ProviderIcon({
  provider,
  className,
}: {
  provider: PlannedProvider;
  className?: string;
}) {
  if (provider === "openrouter") {
    return <SimpleIconView icon={siOpenrouter} className={className} />;
  }

  if (provider === "gemini") {
    return <SimpleIconView icon={siGooglegemini} className={className} />;
  }

  return (
    <span
      className={cn(
        "grid size-5 place-items-center rounded-full border border-current",
        className,
      )}
      aria-hidden="true"
    >
      <Bot size={13} strokeWidth={2} />
    </span>
  );
}

function SimpleIconView({
  icon,
  className,
}: {
  icon: SimpleIcon;
  className?: string | undefined;
}) {
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      className={cn("size-5 fill-current", className)}
    >
      <path d={icon.path} />
    </svg>
  );
}
