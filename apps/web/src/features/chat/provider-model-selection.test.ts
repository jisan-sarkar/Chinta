import { describe, expect, it } from "vitest";
import { type Model } from "@chinta/shared";

import {
  composerAddMenuItems,
  getComposerPrimaryAction,
} from "./composer-actions";
import { getComposerPlacement } from "./chat-layout";
import { useChatStore } from "./chat-store";
import {
  filterModels,
  formatModelLabel,
  getModelModalState,
  getSelectableModels,
  supportsReasoning,
} from "./model-picker";
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

const openRouterModels: Model[] = [
  {
    id: "openai/gpt-4.1",
    provider: "openrouter",
    name: "GPT-4.1",
    description: null,
    contextWindow: 1047576,
    capabilities: ["text-input"],
    inputTokenPrice: null,
    outputTokenPrice: null,
  },
  {
    id: "deepseek/deepseek-r1",
    provider: "openrouter",
    name: "DeepSeek R1",
    description: null,
    contextWindow: 128000,
    capabilities: ["text-input"],
    inputTokenPrice: null,
    outputTokenPrice: null,
  },
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
];

describe("provider metadata", () => {
  it("keeps OpenRouter live and dummy providers disabled for now", () => {
    expect(getProviderOption("openrouter").live).toBe(true);
    expect(getProviderOption("openrouter").connectable).toBe(true);
    expect(getProviderOption("openai").live).toBe(false);
    expect(getProviderOption("anthropic").live).toBe(false);
    expect(getProviderOption("gemini").live).toBe(false);
    expect(providerOptions.map((provider) => provider.id)).toEqual([
      "openrouter",
      "openai",
      "anthropic",
      "gemini",
      "groq",
      "together",
      "deepseek",
      "ollama",
    ]);
    expect(
      providerOptions
        .filter((provider) => provider.connectable)
        .map((provider) => provider.id),
    ).toEqual(["openrouter"]);
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

describe("chat layout", () => {
  it("centers the composer before the first message", () => {
    expect(getComposerPlacement({ messages: [], streamingText: "" })).toBe(
      "center",
    );
  });

  it("pins the composer to the bottom after chat starts", () => {
    expect(
      getComposerPlacement({
        messages: [
          {
            id: "message-1",
            role: "user",
            parts: [{ type: "text", text: "Hello" }],
          },
        ],
        streamingText: "",
      }),
    ).toBe("bottom");
    expect(getComposerPlacement({ messages: [], streamingText: "Hi" })).toBe(
      "bottom",
    );
  });
});

describe("model selection", () => {
  it("lists OpenRouter models and ignores non-OpenRouter models", () => {
    const models: Model[] = [
      openRouterModels[2]!,
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
    ]);
  });

  it("does not add fake models when the catalog is empty", () => {
    expect(getSelectableModels([])).toEqual([]);
  });

  it("filters OpenRouter models by name or id", () => {
    expect(filterModels(openRouterModels, "r1").map((model) => model.id)).toEqual([
      "deepseek/deepseek-r1",
    ]);
    expect(filterModels(openRouterModels, "claude").map((model) => model.id)).toEqual([
      "anthropic/claude-sonnet-4",
    ]);
  });

  it("formats model labels as provider slash model name", () => {
    expect(formatModelLabel(openRouterModels[0]!)).toBe("OpenRouter / GPT-4.1");
  });

  it("detects likely reasoning-capable models", () => {
    expect(supportsReasoning(openRouterModels[0]!)).toBe(false);
    expect(supportsReasoning(openRouterModels[1]!)).toBe(true);
    expect(
      supportsReasoning({
        ...openRouterModels[0]!,
        id: "openai/o3-mini",
        name: "o3-mini",
      }),
    ).toBe(true);
  });

  it("returns disconnected model modal state until OpenRouter is connected", () => {
    expect(
      getModelModalState({
        selectedProvider: "openrouter",
        credentials: [],
        models: openRouterModels,
      }),
    ).toBe("disconnected");
    expect(
      getModelModalState({
        selectedProvider: "openrouter",
        credentials: [connectedCredential],
        models: openRouterModels,
      }),
    ).toBe("ready");
  });

  it("defaults reasoning effort to medium", () => {
    expect(useChatStore.getState().selectedReasoning).toBe("medium");
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
