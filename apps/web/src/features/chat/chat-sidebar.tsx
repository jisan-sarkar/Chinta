"use client";

import { Plus, Search } from "lucide-react";
import { type Conversation } from "@chinta/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export function ChatSidebar({
  conversations,
  activeConversationId,
  query,
  open,
  onQueryChange,
  onNewChat,
  onLoadConversation,
}: {
  conversations: Conversation[];
  activeConversationId: string | undefined;
  query: string;
  open: boolean;
  onQueryChange: (query: string) => void;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[var(--border)] bg-[var(--muted)] transition md:static md:translate-x-0",
        open && "translate-x-0",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <Button size="icon" onClick={onNewChat} aria-label="New chat">
          <Plus size={18} />
        </Button>
        <div className="font-semibold">Chinta</div>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-2.5 text-[var(--muted-foreground)]"
            size={16}
          />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search chats"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onLoadConversation(conversation.id)}
            className={cn(
              "mb-1 flex h-10 w-full items-center rounded-lg px-3 text-left text-sm transition hover:bg-[var(--card)]",
              activeConversationId === conversation.id &&
                "bg-[var(--card)] font-medium",
            )}
          >
            <span className="line-clamp-1">{conversation.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
