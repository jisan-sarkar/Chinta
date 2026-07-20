"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const credentialSchema = z.object({
  apiKey: z.string().min(8, "Enter a valid OpenRouter API key."),
});

type CredentialForm = z.infer<typeof credentialSchema>;

export function ProviderSettingsPanel() {
  const queryClient = useQueryClient();
  const form = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema),
    defaultValues: { apiKey: "" },
  });

  const saveCredential = useMutation({
    mutationFn: (values: CredentialForm) =>
      api.credentials.save({
        provider: "openrouter",
        label: "OpenRouter",
        apiKey: values.apiKey,
      }),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ["provider-credentials"] });
      await queryClient.invalidateQueries({ queryKey: ["models"] });
    },
  });

  return (
    <aside className="fixed inset-x-3 bottom-3 top-16 z-50 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl lg:static lg:block lg:w-80 lg:shrink-0 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:shadow-none">
      <h2 className="text-sm font-semibold">Provider settings</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={form.handleSubmit((values) => saveCredential.mutate(values))}
      >
        <Input
          type="password"
          placeholder="OpenRouter API key"
          {...form.register("apiKey")}
        />
        {form.formState.errors.apiKey ? (
          <p className="text-sm text-red-500">
            {form.formState.errors.apiKey.message}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={saveCredential.isPending}>
          <Check size={16} />
          Save key
        </Button>
      </form>
    </aside>
  );
}
