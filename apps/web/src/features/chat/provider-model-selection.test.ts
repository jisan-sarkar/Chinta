import { describe, expect, it } from "vitest";
import { type Model } from "@chinta/shared";

import {
  composerAddMenuItems,
  getComposerPrimaryAction,
} from "./composer-actions";
import { getSelectableModels } from "./model-picker";
import { getProviderOption, providerOptions } from "./provider-catalog";
import { isProviderConnected } from "./provider-picker";
import { type ProviderCredentialStatus } from "@/lib/api";

const connectedCredential: ProviderCredentialStatus = {
  id: "credential-1",
  provider: "openrouter",
  label: "OpenRouter",
  connected: true,
  keyFingerprint: "abcd1234",
  verifiedAt: "2026-07-20T00:00:00.000Z",
  updatedAt: "2026-07-20T00:00:00.000Z",
};

describe("provider metadata", () => {
  it("keeps OpenRouter live and direct OpenAI/Gemini disabled for now", () => {
    expect(getProviderOption("openrouter").live).toBe(true);
    expect(getProviderOption("openai").live).toBe(false);
    expect(getProviderOption("gemini").live).toBe(false);
    expect(providerOptions.map((provider) => provider.id)).toEqual([
      "openrouter",
      "openai",
      "gemini",
    ]);
  });

  it("only treats verified OpenRouter credentials as connected", () => {
    expect(isProviderConnected("openrouter", [connectedCredential])).toBe(true);
    expect(
      isProviderConnected("openrouter", [
        { ...connectedCredential, connected: false },
      ]),
    ).toBe(false);
    expect(isProviderConnected("openai", [connectedCredential])).toBe(false);
    expect(isProviderConnected("gemini", [connectedCredential])).toBe(false);
  });
});

describe("model selection", () => {
  it("lists OpenRouter models and ignores non-OpenRouter models", () => {
    const models: Model[] = [
      {
        id: "anthropic/claude-sonnet-4",
        provider: "openrouter",
        name: "Claude Sonnet 4",
        description: null,
        contextWindow: 200000,
        capabilities: ["text-input"],
        inputTokenPrice: null,
        outputTokenPrice: null,
      },
      {
        id: "gemini-2.5-pro",
        provider: "gemini",
        name: "Gemini 2.5 Pro",
        description: null,
        contextWindow: 1000000,
        capabilities: ["text-input"],
        inputTokenPrice: null,
        outputTokenPrice: null,
      } as unknown as Model,
    ];

    expect(getSelectableModels(models).map((model) => model.provider)).toEqual([
      "openrouter",
      "openrouter",
    ]);
  });

  it("adds the default OpenRouter route when the catalog is empty", () => {
    expect(getSelectableModels([])[0]?.id).toBe("openai/gpt-4.1");
  });
});

describe("composer controls", () => {
  it("shows voice chat as the primary action while the prompt is empty", () => {
    expect(
      getComposerPrimaryAction({
        prompt: "   ",
        canSend: false,
        isStreaming: false,
      }),
    ).toEqual({
      type: "voice",
      disabled: false,
      label: "Start voice chat",
    });
  });

  it("switches to send and disables it until send requirements are met", () => {
    expect(
      getComposerPrimaryAction({
        prompt: "Hello",
        canSend: false,
        isStreaming: false,
      }),
    ).toEqual({
      type: "send",
      disabled: true,
      label: "Send message",
    });

    expect(
      getComposerPrimaryAction({
        prompt: "Hello",
        canSend: true,
        isStreaming: false,
      }),
    ).toEqual({
      type: "send",
      disabled: false,
      label: "Send message",
    });
  });

  it("keeps all plus menu actions as disabled placeholders", () => {
    expect(composerAddMenuItems.map((item) => item.label)).toEqual([
      "Add photos & files",
      "Create image",
      "Web search",
      "Deep research",
      "Notion",
      "OpenAI Platform",
      "Visualize",
      "Atlassian Rovo",
    ]);
    expect(composerAddMenuItems.every((item) => item.disabled)).toBe(true);
  });
});
