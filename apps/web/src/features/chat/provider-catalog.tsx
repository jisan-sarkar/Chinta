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
};

const defaultProviderOption: ProviderOption = {
  id: "openrouter",
  label: "OpenRouter",
  description: "Live provider for this version",
  live: true,
};

export const providerOptions: ProviderOption[] = [
  defaultProviderOption,
  {
    id: "openai",
    label: "OpenAI",
    description: "Direct provider support coming later",
    live: false,
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Direct provider support coming later",
    live: false,
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
