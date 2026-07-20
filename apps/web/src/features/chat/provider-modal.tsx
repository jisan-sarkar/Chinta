"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, KeyRound, Lock, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, api, type ProviderCredentialStatus } from "@/lib/api";
import { cn } from "@/lib/cn";
import { type PlannedProvider, useChatStore } from "./chat-store";
import { getProviderOption, ProviderIcon, providerOptions } from "./provider-catalog";
import { isProviderConnected } from "./provider-picker";

const credentialSchema = z.object({
  apiKey: z.string().min(8, "Enter a valid OpenRouter API key."),
});

type CredentialForm = z.infer<typeof credentialSchema>;

export function ProviderModal({
  open,
  onOpenChange,
  credentials,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: ProviderCredentialStatus[];
}) {
  const queryClient = useQueryClient();
  const [activeProviderId, setActiveProviderId] = useState<PlannedProvider>();
  const selectedProvider = useChatStore((state) => state.selectedProvider);
  const setSelectedProvider = useChatStore((state) => state.setSelectedProvider);
  const openRouterCredential = credentials.find(
    (credential) => credential.provider === "openrouter",
  );
  const form = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { apiKey: "" },
  });
  const activeProvider = activeProviderId
    ? getProviderOption(activeProviderId)
    : undefined;

  const saveCredential = useMutation({
    mutationFn: (values: CredentialForm) =>
      api.credentials.save({
        provider: "openrouter",
        label: "OpenRouter",
        apiKey: values.apiKey,
      }),
    onSuccess: async () => {
      setSelectedProvider("openrouter");
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["provider-credentials"] });
      await queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });
  const saveErrorMessage =
    saveCredential.error instanceof ApiError
      ? saveCredential.error.message
      : "OpenRouter key validation failed.";

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setActiveProviderId(undefined);
      form.reset();
      saveCredential.reset();
    }
  }

  function selectProvider(providerId: PlannedProvider) {
    if (providerId === "openrouter") {
      setSelectedProvider("openrouter");
      setActiveProviderId("openrouter");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[min(42rem,calc(100vh-2rem))] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl outline-none">
          {activeProvider ? (
            <OpenRouterSetup
              credential={openRouterCredential}
              isSaving={saveCredential.isPending}
              hasSaveError={saveCredential.isError}
              saveErrorMessage={saveErrorMessage}
              onBack={() => setActiveProviderId(undefined)}
              onSubmit={form.handleSubmit((values) =>
                saveCredential.mutate(values),
              )}
              registerApiKey={form.register("apiKey")}
              apiKeyError={form.formState.errors.apiKey?.message}
            />
          ) : (
            <ProviderList
              credentials={credentials}
              selectedProvider={selectedProvider}
              onSelectProvider={selectProvider}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProviderList({
  credentials,
  selectedProvider,
  onSelectProvider,
}: {
  credentials: ProviderCredentialStatus[];
  selectedProvider: PlannedProvider;
  onSelectProvider: (provider: PlannedProvider) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <Dialog.Title className="text-sm font-semibold">Providers</Dialog.Title>
        <Dialog.Close asChild>
          <Button size="icon" aria-label="Close providers">
            <X size={17} />
          </Button>
        </Dialog.Close>
      </div>
      <div className="max-h-[32rem] overflow-y-auto p-3">
        {providerOptions.map((provider) => {
          const connected = isProviderConnected(provider.id, credentials);
          const disabled = !provider.connectable;

          return (
            <button
              key={provider.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectProvider(provider.id)}
              className={cn(
                "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition hover:bg-[var(--muted)]",
                selectedProvider === provider.id && "bg-[var(--muted)]",
                disabled && "cursor-not-allowed opacity-55",
              )}
            >
              <ProviderIcon provider={provider.id} className="size-4" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{provider.label}</div>
                <div className="truncate text-xs text-[var(--muted-foreground)]">
                  {provider.connectable
                    ? connected
                      ? "Connected"
                      : "Connect with API key"
                    : "Coming soon"}
                </div>
              </div>
              {connected ? <Check size={15} /> : null}
              {disabled ? <Lock size={15} /> : null}
            </button>
          );
        })}
      </div>
    </>
  );
}

function OpenRouterSetup({
  credential,
  isSaving,
  hasSaveError,
  saveErrorMessage,
  onBack,
  onSubmit,
  registerApiKey,
  apiKeyError,
}: {
  credential: ProviderCredentialStatus | undefined;
  isSaving: boolean;
  hasSaveError: boolean;
  saveErrorMessage: string;
  onBack: () => void;
  onSubmit: () => void;
  registerApiKey: ReturnType<typeof useForm<CredentialForm>>["register"] extends (
    name: "apiKey",
  ) => infer T
    ? T
    : never;
  apiKeyError: string | undefined;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <Button size="icon" aria-label="Back to providers" onClick={onBack}>
            <ArrowLeft size={17} />
          </Button>
          <Dialog.Title className="text-sm font-semibold">OpenRouter</Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <Button size="icon" aria-label="Close providers">
            <X size={17} />
          </Button>
        </Dialog.Close>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--muted)]">
            <ProviderIcon provider="openrouter" className="size-5" />
          </div>
          <Dialog.Description asChild>
            <div>
              <div className="text-base font-semibold text-[var(--foreground)]">
                OpenRouter
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Connect OpenRouter to unlock available models in Chinta.
              </p>
            </div>
          </Dialog.Description>
        </div>

        {credential ? (
          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <Check size={15} />
              Connected
            </div>
            <p className="mt-1 text-[var(--muted-foreground)]">
              Fingerprint: {credential.keyFingerprint}
            </p>
          </div>
        ) : null}

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm font-medium" htmlFor="openrouter-key">
            API key
          </label>
          <Input
            id="openrouter-key"
            type="password"
            placeholder="sk-or-..."
            {...registerApiKey}
          />
          {apiKeyError ? <p className="text-sm text-red-500">{apiKeyError}</p> : null}
          {hasSaveError ? (
            <p className="text-sm text-red-500">
              {saveErrorMessage}
            </p>
          ) : null}
          <Button type="submit" variant="primary" disabled={isSaving}>
            <KeyRound size={16} />
            Save OpenRouter key
          </Button>
        </form>
      </div>
    </>
  );
}
