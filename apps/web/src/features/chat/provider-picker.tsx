"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, Lock } from "lucide-react";

import { cn } from "@/lib/cn";
import { type ProviderCredentialStatus } from "@/lib/api";
import { type PlannedProvider, useChatStore } from "./chat-store";
import {
  getProviderOption,
  ProviderIcon,
  providerOptions,
} from "./provider-catalog";

export function ProviderPicker({
  credentials,
  compact = false,
}: {
  credentials: ProviderCredentialStatus[];
  compact?: boolean;
}) {
  const selectedProvider = useChatStore((state) => state.selectedProvider);
  const setSelectedProvider = useChatStore((state) => state.setSelectedProvider);
  const selected = getProviderOption(selectedProvider);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-full text-sm transition hover:bg-[var(--muted)]",
            compact
              ? "border border-transparent bg-transparent px-2"
              : "border border-[var(--border)] bg-[var(--card)] px-3",
          )}
          type="button"
          aria-label={`Provider: ${selected.label}`}
        >
          <ProviderIcon provider={selected.id} className="size-4" />
          <span className={cn(compact && "hidden sm:inline")}>
            {selected.label}
          </span>
          <ChevronDown size={15} className={cn(compact && "hidden sm:block")} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-50 w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl"
        >
          {providerOptions.map((provider) => {
            const connected = isProviderConnected(provider.id, credentials);
            const disabled = !provider.live;

            return (
              <DropdownMenu.Item
                key={provider.id}
                disabled={disabled}
                onSelect={() => setSelectedProvider(provider.id)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none transition",
                  "data-[highlighted]:bg-[var(--muted)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-55",
                )}
              >
                <ProviderIcon provider={provider.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{provider.label}</span>
                    {selectedProvider === provider.id ? <Check size={14} /> : null}
                  </div>
                  <p className="line-clamp-1 text-xs text-[var(--muted-foreground)]">
                    {provider.live
                      ? connected
                        ? "Connected"
                        : "Add API key in settings"
                      : provider.description}
                  </p>
                </div>
                {!provider.live ? <Lock size={14} /> : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function isProviderConnected(
  provider: PlannedProvider,
  credentials: ProviderCredentialStatus[],
) {
  return credentials.some(
    (credential) => credential.provider === provider && credential.connected,
  );
}
