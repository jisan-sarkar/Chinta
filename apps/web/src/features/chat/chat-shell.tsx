"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { api, streamChat } from "@/lib/api";
import { getSelectableModels } from "./model-picker";
import { useChatStore } from "./chat-store";
import { ChatComposer } from "./chat-composer";
import { ChatHeader } from "./chat-header";
import { getComposerPlacement } from "./chat-layout";
import { ChatSidebar } from "./chat-sidebar";
import { MessageList } from "./message-list";
import { ModelModal } from "./model-modal";
import { ProviderModal } from "./provider-modal";
import { getProviderOption } from "./provider-catalog";
import { isProviderConnected } from "./provider-picker";

export function ChatShell() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chat = useChatStore();

  const conversations = useQuery({
    queryKey: ["conversations", query],
    queryFn: () => api.conversations.list(query),
  });

  const models = useQuery({
    queryKey: ["models"],
    queryFn: api.models.list,
  });

  const credentials = useQuery({
    queryKey: ["provider-credentials"],
    queryFn: api.credentials.list,
  });

  const activeTitle = useMemo(() => {
    return (
      conversations.data?.find(
        (conversation) => conversation.id === chat.activeConversationId,
      )?.title ?? "New chat"
    );
  }, [chat.activeConversationId, conversations.data]);

  const selectableModels = useMemo(
    () => getSelectableModels(models.data ?? []),
    [models.data],
  );
  const selectedProvider = getProviderOption(chat.selectedProvider);
  const providerConnected =
    selectedProvider.live &&
    isProviderConnected(chat.selectedProvider, credentials.data ?? []);
  const selectedModelExists =
    chat.selectedProvider === "openrouter" &&
    selectableModels.some((model) => model.id === chat.selectedModel);
  const canSend =
    prompt.trim().length > 0 &&
    providerConnected &&
    selectedModelExists &&
    !isStreaming;
  const composerPlacement = getComposerPlacement({
    messages: chat.messages,
    streamingText: chat.streamingText,
  });

  async function loadConversation(id: string) {
    chat.setActiveConversationId(id);
    const messages = await api.conversations.messages(id);
    chat.setMessages(
      messages.map((message) => ({
        id: message.id,
        role: message.role.toLowerCase() as "user" | "assistant",
        parts: message.parts.map((part) => part.content),
      })),
    );
    setSidebarOpen(false);
  }

  async function sendMessage() {
    const text = prompt.trim();

    if (!canSend) {
      return;
    }

    setPrompt("");
    chat.appendMessage({
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
    });
    chat.setStreamingText("");
    setIsStreaming(true);

    try {
      await streamChat(
        {
          conversationId: chat.activeConversationId,
          modelId: chat.selectedModel,
          parts: [{ type: "text", text }],
        },
        {
          onConversation: (conversationId) =>
            chat.setActiveConversationId(conversationId),
          onDelta: (delta) =>
            chat.setStreamingText(useChatStore.getState().streamingText + delta),
          onDone: () => {
            const current = useChatStore.getState();
            current.appendMessage({
              id: crypto.randomUUID(),
              role: "assistant",
              parts: [{ type: "text", text: current.streamingText }],
            });
            current.setStreamingText("");
          },
        },
      );
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex min-h-dvh overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <ChatSidebar
        conversations={conversations.data ?? []}
        activeConversationId={chat.activeConversationId}
        query={query}
        open={sidebarOpen}
        onQueryChange={setQuery}
        onNewChat={chat.reset}
        onLoadConversation={(id) => void loadConversation(id)}
        onOpenChange={setSidebarOpen}
      />

      <main className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <ChatHeader
          title={activeTitle}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <section className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            {composerPlacement === "center" ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 px-3 pb-[max(5rem,env(safe-area-inset-bottom))] pt-8 sm:gap-8 sm:px-6">
                <h1 className="max-w-[min(42rem,calc(100vw-2rem))] text-center text-[clamp(1.55rem,4.2vw,2rem)] font-semibold leading-tight tracking-normal">
                  Good to see you, Zisan Sarker.
                </h1>
                <ChatComposer
                  prompt={prompt}
                  isStreaming={isStreaming}
                  canSend={canSend}
                  credentials={credentials.data ?? []}
                  centered
                  onPromptChange={setPrompt}
                  onSend={() => void sendMessage()}
                  onOpenProviderModal={() => setProviderModalOpen(true)}
                  onOpenModelModal={() => setModelModalOpen(true)}
                />
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <MessageList
                    messages={chat.messages}
                    streamingText={chat.streamingText}
                  />
                </div>
                <ChatComposer
                  prompt={prompt}
                  isStreaming={isStreaming}
                  canSend={canSend}
                  credentials={credentials.data ?? []}
                  onPromptChange={setPrompt}
                  onSend={() => void sendMessage()}
                  onOpenProviderModal={() => setProviderModalOpen(true)}
                  onOpenModelModal={() => setModelModalOpen(true)}
                />
              </>
            )}
          </div>

          <ProviderModal
            open={providerModalOpen}
            onOpenChange={setProviderModalOpen}
            credentials={credentials.data ?? []}
          />
          <ModelModal
            open={modelModalOpen}
            onOpenChange={setModelModalOpen}
            models={models.data ?? []}
            credentials={credentials.data ?? []}
          />
        </section>
      </main>
    </div>
  );
}
