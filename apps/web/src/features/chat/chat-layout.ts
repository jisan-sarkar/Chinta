import { type LocalMessage } from "./chat-store";

export type ComposerPlacement = "center" | "bottom";

export function getComposerPlacement({
  messages,
  streamingText,
}: {
  messages: LocalMessage[];
  streamingText: string;
}): ComposerPlacement {
  return messages.length === 0 && !streamingText ? "center" : "bottom";
}
