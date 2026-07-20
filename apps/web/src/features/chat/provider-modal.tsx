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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed inset-x-2 bottom-2 z-50 flex max-h-[min(42rem,calc(100dvh-1rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-2xl outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(34rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2">
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
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
        <Dialog.Title className="text-sm font-semibold">Providers</Dialog.Title>
        <Dialog.Close asChild>
          <Button size="icon" aria-label="Close providers" className="rounded-xl">
            <X size={17} />
          </Button>
        </Dialog.Close>
      </div>
      <div className="min-h-0 overflow-y-auto p-2 sm:p-3">
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
                "mb-1 flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm outline-none transition-[background-color,box-shadow,opacity] duration-150 hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                selectedProvider === provider.id && "bg-[var(--muted)] shadow-sm",
                disabled && "cursor-not-allowed opacity-55",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--card)]">
                <ProviderIcon provider={provider.id} className="size-4" />
              </span>
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
              {connected ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--accent),transparent_86%)] px-2 py-1 text-[11px] font-medium text-[var(--accent)]">
                  <Check size={13} />
                  <span className="hidden min-[380px]:inline">Connected</span>
                </span>
              ) : null}
              {disabled ? <Lock size={15} className="shrink-0" /> : null}
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
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            aria-label="Back to providers"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft size={17} />
          </Button>
          <Dialog.Title className="text-sm font-semibold">OpenRouter</Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <Button size="icon" aria-label="Close providers" className="rounded-xl">
            <X size={17} />
          </Button>
        </Dialog.Close>
      </div>

      <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
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
            <p className="mt-1 break-all text-[var(--muted-foreground)]">
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
          {apiKeyError ? (
            <p className="text-sm leading-5 text-red-500">{apiKeyError}</p>
          ) : null}
          {hasSaveError ? (
            <p className="text-sm leading-5 text-red-500">
              {saveErrorMessage}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="w-full rounded-xl sm:w-auto"
          >
            <KeyRound size={16} />
            Save OpenRouter key
          </Button>
        </form>
      </div>
    </>
  );
}
