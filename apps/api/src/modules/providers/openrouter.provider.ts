import { Injectable, Logger } from "@nestjs/common";
import { createParser, type EventSourceMessage } from "eventsource-parser";
import { type MessagePart, type Model } from "@chinta/shared";

import {
  type AiProvider,
  type CredentialValidationResult,
  type StreamChatChunk,
  type StreamChatInput,
} from "./ai-provider";

type OpenRouterModel = {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  architecture?: {
    input_modalities?: string[];
  };
};

@Injectable()
export class OpenRouterProvider implements AiProvider {
  readonly provider = "openrouter" as const;
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly baseUrl = "https://openrouter.ai/api/v1";

  async listModels(apiKey?: string): Promise<Model[]> {
    const init: RequestInit = {};

    if (apiKey) {
      init.headers = this.authHeaders(apiKey);
    }

    const response = await fetch(`${this.baseUrl}/models`, init);

    if (!response.ok) {
      throw new Error(`OpenRouter models request failed: ${response.status}`);
    }

    const payload = (await response.json()) as { data?: OpenRouterModel[] };

    return (payload.data ?? []).map((model) => ({
      id: model.id,
      provider: "openrouter",
      name: model.name ?? model.id,
      description: model.description ?? null,
      contextWindow: model.context_length ?? null,
      capabilities: this.capabilitiesFor(model),
      inputTokenPrice: model.pricing?.prompt ?? null,
      outputTokenPrice: model.pricing?.completion ?? null,
    }));
  }

  async validateCredential(apiKey: string): Promise<CredentialValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/key`, {
        headers: this.authHeaders(apiKey),
      });

      if (response.ok) {
        return { valid: true };
      }

      this.logger.warn(
        `OpenRouter credential validation failed with status ${response.status}`,
      );

      return {
        valid: false,
        message: this.validationMessageForStatus(response.status),
      };
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `OpenRouter credential validation request failed: ${error.message}`
          : "OpenRouter credential validation request failed",
      );

      return {
        valid: false,
        message: "Could not reach OpenRouter from the API server.",
      };
    }
  }

  async *streamChatCompletion(
    input: StreamChatInput,
  ): AsyncIterable<StreamChatChunk> {
    const init: RequestInit = {
      method: "POST",
      headers: {
        ...this.authHeaders(input.apiKey),
        "content-type": "application/json",
        "http-referer": "https://chinta.app",
        "x-title": "Chinta",
      },
      body: JSON.stringify({
        model: input.modelId,
        stream: true,
        messages: input.messages.map((message) => ({
          role: message.role,
          content: this.toOpenRouterContent(message.parts),
        })),
      }),
    };

    if (input.signal) {
      init.signal = input.signal;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, init);

    if (!response.ok || !response.body) {
      const message = await response.text();
      throw new Error(
        `OpenRouter chat request failed: ${response.status} ${message}`,
      );
    }

    const queue: StreamChatChunk[] = [];
    const parser = createParser({
      onEvent: (event: EventSourceMessage) => {
        if (event.data === "[DONE]") {
          queue.push({ type: "done" });
          return;
        }

        const payload = JSON.parse(event.data) as {
          choices?: Array<{ delta?: { content?: string } }>;
          usage?: Record<string, unknown>;
        };
        const text = payload.choices?.[0]?.delta?.content;

        if (text) {
          queue.push({ type: "delta", text });
        }

        if (payload.usage) {
          queue.push({ type: "usage", usage: payload.usage });
        }
      },
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    for (;;) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      parser.feed(decoder.decode(value, { stream: true }));

      while (queue.length > 0) {
        const chunk = queue.shift();
        if (chunk) {
          yield chunk;
        }
      }
    }

    yield { type: "done" };
  }

  private authHeaders(apiKey: string): Record<string, string> {
    return { authorization: `Bearer ${apiKey}` };
  }

  private validationMessageForStatus(status: number): string {
    if (status === 401) {
      return "OpenRouter rejected this key. Create a new key and try again.";
    }

    if (status === 403) {
      return "OpenRouter denied access for this key.";
    }

    if (status === 429) {
      return "OpenRouter rate-limited key validation. Try again shortly.";
    }

    if (status >= 500) {
      return "OpenRouter is currently failing validation requests.";
    }

    return `OpenRouter key validation failed with status ${status}.`;
  }

  private capabilitiesFor(model: OpenRouterModel): Model["capabilities"] {
    const modalities = model.architecture?.input_modalities ?? [];
    const capabilities: Model["capabilities"] = ["text-input"];

    if (modalities.includes("image")) {
      capabilities.push("image-input");
    }

    return capabilities;
  }

  private toOpenRouterContent(parts: MessagePart[]) {
    if (parts.length === 1 && parts[0]?.type === "text") {
      return parts[0].text;
    }

    return parts.map((part) => {
      if (part.type === "text") {
        return { type: "text", text: part.text };
      }

      if (part.type === "image" && part.url) {
        return { type: "image_url", image_url: { url: part.url } };
      }

      return {
        type: "text",
        text: `[Attached ${part.type}: ${part.type === "file" ? part.fileName : part.mimeType}]`,
      };
    });
  }
}
