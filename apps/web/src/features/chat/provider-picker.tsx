"use client";

import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { type ProviderCredentialStatus } from "@/lib/api";
import { type PlannedProvider, useChatStore } from "./chat-store";
import { getProviderOption, ProviderIcon } from "./provider-catalog";

export function ProviderPicker({
  credentials,
  onOpen,
}: {
  credentials: ProviderCredentialStatus[];
  onOpen: () => void;
}) {
  const selectedProvider = useChatStore((state) => state.selectedProvider);
  const selected = getProviderOption(selectedProvider);
  const connected = isProviderConnected(selectedProvider, credentials);

  return (
    <button
      className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm transition hover:bg-[var(--muted)]"
      type="button"
      aria-label="Providers"
      title="Providers"
      onClick={onOpen}
    >
      <ProviderIcon provider={selected.id} className="size-4" />
      {connected ? (
        <CheckCircle2
          size={12}
          className={cn(
            "absolute bottom-1 right-1 rounded-full bg-[var(--card)] text-[var(--accent)]",
          )}
          aria-hidden="true"
        />
      ) : null}
    </button>
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
