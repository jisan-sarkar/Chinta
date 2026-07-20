import {
  type Conversation,
  type CreateConversationRequest,
  type MessagePart,
  type Model,
  type SaveProviderCredentialRequest,
  type StreamChatRequest,
  type UpdateConversationRequest,
} from "@chinta/shared";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export type ProviderCredentialStatus = {
  id: string;
  provider: "openrouter";
  label: string;
  connected: boolean;
  keyFingerprint: string;
  verifiedAt: string | null;
  updatedAt: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? "GET",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
  };

  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${apiUrl}/api/v1${path}`, init);

  if (!response.ok) {
    const text = await response.text();
    let message = text || "Request failed.";
    let code: string | undefined;

    try {
      const payload = JSON.parse(text) as { message?: string; code?: string };
      message = payload.message ?? message;
      code = payload.code;
    } catch {
      // Preserve the raw response body when it is not JSON.
    }

    throw new ApiError(message, response.status, code);
  }

  return (await response.json()) as T;
}

export const api = {
  conversations: {
    list: (query?: string) =>
      request<Conversation[]>(
        `/conversations${query ? `?q=${encodeURIComponent(query)}` : ""}`,
      ),
    create: (body: CreateConversationRequest) =>
      request<Conversation>("/conversations", { method: "POST", body }),
    update: (id: string, body: UpdateConversationRequest) =>
      request<Conversation>(`/conversations/${id}`, {
        method: "PATCH",
        body,
      }),
    remove: (id: string) =>
      request<Conversation>(`/conversations/${id}`, { method: "DELETE" }),
    messages: (id: string) =>
      request<Array<{ id: string; role: string; parts: Array<{ content: MessagePart }> }>>(
        `/conversations/${id}/messages`,
      ),
  },
  models: {
    list: () => request<Model[]>("/models"),
  },
  credentials: {
    list: () => request<ProviderCredentialStatus[]>("/provider-credentials"),
    save: (body: SaveProviderCredentialRequest) =>
      request("/provider-credentials", { method: "POST", body }),
  },
};

export async function streamChat(
  body: StreamChatRequest,
  handlers: {
    onConversation?: (conversationId: string) => void;
    onDelta: (text: string) => void;
    onDone?: (payload: { conversationId: string; messageId: string }) => void;
  },
): Promise<void> {
  const response = await fetch(`${apiUrl}/api/v1/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const eventName = rawEvent
        .split("\n")
        .find((line) => line.startsWith("event: "))
        ?.slice(7);
      const data = rawEvent
        .split("\n")
        .find((line) => line.startsWith("data: "))
        ?.slice(6);

      if (!eventName || !data) {
        continue;
      }

      const payload = JSON.parse(data) as Record<string, string>;

      if (eventName === "conversation" && payload.conversationId) {
        handlers.onConversation?.(payload.conversationId);
      }

      if (eventName === "delta" && payload.text) {
        handlers.onDelta(payload.text);
      }

      if (
        eventName === "done" &&
        payload.conversationId &&
        payload.messageId
      ) {
        handlers.onDone?.({
          conversationId: payload.conversationId,
          messageId: payload.messageId,
        });
      }
    }
  }
}
