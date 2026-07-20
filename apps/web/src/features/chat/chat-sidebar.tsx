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
  onOpenChange,
}: {
  conversations: Conversation[];
  activeConversationId: string | undefined;
  query: string;
  open: boolean;
  onQueryChange: (query: string) => void;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/45 opacity-0 transition-opacity duration-200 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[min(19rem,calc(100vw-2rem))] -translate-x-full flex-col border-r border-[var(--border)] bg-[var(--muted)] shadow-2xl transition-transform duration-200 ease-out lg:static lg:w-72 lg:translate-x-0 lg:shadow-none",
          open && "translate-x-0",
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 px-3">
          <Button
            size="icon"
            onClick={() => {
              onNewChat();
              onOpenChange(false);
            }}
            aria-label="New chat"
            className="rounded-xl"
          >
            <Plus size={18} />
          </Button>
          <div className="min-w-0 flex-1 truncate font-semibold">Chinta</div>
        </div>

        <div className="px-3 pb-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              size={16}
            />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search chats"
              className="h-10 rounded-xl bg-[var(--card)] pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => {
                onLoadConversation(conversation.id);
                onOpenChange(false);
              }}
              className={cn(
                "mb-1 flex h-10 w-full min-w-0 items-center rounded-xl px-3 text-left text-sm transition-[background-color,color,box-shadow] duration-150 hover:bg-[var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                activeConversationId === conversation.id &&
                  "bg-[var(--card)] font-medium shadow-sm",
              )}
            >
              <span className="line-clamp-1 min-w-0">{conversation.title}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
