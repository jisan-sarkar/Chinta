"use client";

import { type LocalMessage } from "./chat-store";
import { MessageBubble } from "./message-bubble";

export function MessageList({
  messages,
  streamingText,
}: {
  messages: LocalMessage[];
  streamingText: string;
}) {
  if (messages.length === 0 && !streamingText) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
          What&apos;s on your mind today?
        </h1>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {streamingText ? (
        <MessageBubble
          message={{
            id: "streaming",
            role: "assistant",
            parts: [{ type: "text", text: streamingText }],
          }}
        />
      ) : null}
    </div>
  );
}
