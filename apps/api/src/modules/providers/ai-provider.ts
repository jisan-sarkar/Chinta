import { type MessagePart, type Model, type Provider } from "@chinta/shared";

export type ProviderChatMessage = {
  role: "system" | "user" | "assistant";
  parts: MessagePart[];
};

export type StreamChatInput = {
  modelId: string;
  apiKey: string;
  messages: ProviderChatMessage[];
  signal?: AbortSignal;
};

export type StreamChatChunk =
  | { type: "delta"; text: string }
  | { type: "usage"; usage: Record<string, unknown> }
  | { type: "done" };

export interface AiProvider {
  readonly provider: Provider;
  listModels(apiKey?: string): Promise<Model[]>;
  validateCredential(apiKey: string): Promise<boolean>;
  streamChatCompletion(input: StreamChatInput): AsyncIterable<StreamChatChunk>;
}
