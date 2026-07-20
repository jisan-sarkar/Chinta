"use client";

import { create } from "zustand";
import { type MessagePart, type Provider } from "@chinta/shared";

export type PlannedProvider =
  | Provider
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "together"
  | "deepseek"
  | "ollama";

export type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  parts: MessagePart[];
};

export type ReasoningEffort = "low" | "medium" | "high";

type ChatState = {
  activeConversationId: string | undefined;
  selectedProvider: PlannedProvider;
  selectedModel: string;
  selectedReasoning: ReasoningEffort;
  messages: LocalMessage[];
  streamingText: string;
  setActiveConversationId: (id?: string) => void;
  setSelectedProvider: (provider: PlannedProvider) => void;
  setSelectedModel: (modelId: string) => void;
  setSelectedReasoning: (reasoning: ReasoningEffort) => void;
  setMessages: (messages: LocalMessage[]) => void;
  appendMessage: (message: LocalMessage) => void;
  setStreamingText: (value: string) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: undefined,
  selectedProvider: "openrouter",
  selectedModel: "openai/gpt-4.1",
  selectedReasoning: "medium",
  messages: [],
  streamingText: "",
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setSelectedModel: (modelId) => set({ selectedModel: modelId }),
  setSelectedReasoning: (reasoning) => set({ selectedReasoning: reasoning }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setStreamingText: (value) => set({ streamingText: value }),
  reset: () =>
    set({
      activeConversationId: undefined,
      selectedProvider: "openrouter",
      selectedModel: "openai/gpt-4.1",
      selectedReasoning: "medium",
      messages: [],
      streamingText: "",
    }),
}));
