"use client";

import {
  Clock3,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Search,
  SquarePen,
  type LucideIcon,
} from "lucide-react";
import { type Conversation } from "@chinta/shared";
import { type RefObject, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  type SidebarFocusTarget,
  splitConversationsByPinned,
} from "./sidebar-state";

export function ChatSidebar({
  conversations,
  activeConversationId,
  query,
  open,
  expanded,
  focusTarget,
  onQueryChange,
  onNewChat,
  onLoadConversation,
  onOpenChange,
  onExpandedChange,
  onFocusTargetChange,
}: {
  conversations: Conversation[];
  activeConversationId: string | undefined;
  query: string;
  open: boolean;
  expanded: boolean;
  focusTarget: SidebarFocusTarget | undefined;
  onQueryChange: (query: string) => void;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
  onOpenChange: (open: boolean) => void;
  onExpandedChange: (expanded: boolean) => void;
  onFocusTargetChange: (target: SidebarFocusTarget | undefined) => void;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pinnedSectionRef = useRef<HTMLDivElement>(null);
  const recentSectionRef = useRef<HTMLDivElement>(null);
  const { pinned, recent } = splitConversationsByPinned(conversations);

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    window.requestAnimationFrame(() => {
      if (focusTarget === "search") {
        searchInputRef.current?.focus();
      }

      if (focusTarget === "pinned") {
        pinnedSectionRef.current?.scrollIntoView({ block: "start" });
      }

      if (focusTarget === "recent") {
        recentSectionRef.current?.scrollIntoView({ block: "start" });
      }

      onFocusTargetChange(undefined);
    });
  }, [focusTarget, onFocusTargetChange]);

  function startNewChat() {
    onNewChat();
    onOpenChange(false);
  }

  function openFocused(target: SidebarFocusTarget) {
    onExpandedChange(true);
    onOpenChange(true);
    onFocusTargetChange(target);
  }

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
          "fixed inset-y-0 left-0 z-40 flex w-[min(19rem,calc(100vw-2rem))] -translate-x-full flex-col border-r border-[var(--border)] bg-[var(--muted)] shadow-2xl transition-[transform,width] duration-200 ease-out lg:static lg:translate-x-0 lg:shadow-none",
          open && "translate-x-0",
          expanded ? "lg:!w-72" : "lg:!w-14",
        )}
      >
        <div
          className={cn(
            "flex h-full min-w-0 flex-col",
            !expanded && "lg:!hidden",
          )}
        >
          <ExpandedSidebarContent
            activeConversationId={activeConversationId}
            query={query}
            pinned={pinned}
            recent={recent}
            searchInputRef={searchInputRef}
            pinnedSectionRef={pinnedSectionRef}
            recentSectionRef={recentSectionRef}
            onQueryChange={onQueryChange}
            onNewChat={startNewChat}
            onLoadConversation={(id) => {
              onLoadConversation(id);
              onOpenChange(false);
            }}
            onFocusSearch={() => openFocused("search")}
            onToggleExpanded={() => onExpandedChange(false)}
          />
        </div>

        <div
          className={cn(
            "hidden h-full flex-col items-center justify-between py-3 lg:flex",
            expanded && "lg:!hidden",
          )}
        >
          <CollapsedRail
            onToggleExpanded={() => onExpandedChange(true)}
            onNewChat={startNewChat}
            onFocusSearch={() => openFocused("search")}
            onFocusPinned={() => openFocused("pinned")}
            onFocusRecent={() => openFocused("recent")}
          />
        </div>
      </aside>
    </>
  );
}

function ExpandedSidebarContent({
  activeConversationId,
  query,
  pinned,
  recent,
  searchInputRef,
  pinnedSectionRef,
  recentSectionRef,
  onQueryChange,
  onNewChat,
  onLoadConversation,
  onFocusSearch,
  onToggleExpanded,
}: {
  activeConversationId: string | undefined;
  query: string;
  pinned: Conversation[];
  recent: Conversation[];
  searchInputRef: RefObject<HTMLInputElement | null>;
  pinnedSectionRef: RefObject<HTMLDivElement | null>;
  recentSectionRef: RefObject<HTMLDivElement | null>;
  onQueryChange: (query: string) => void;
  onNewChat: () => void;
  onLoadConversation: (id: string) => void;
  onFocusSearch: () => void;
  onToggleExpanded: () => void;
}) {
  return (
    <>
      <div className="shrink-0 px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewChat}
            className="grid h-9 w-16 shrink-0 place-items-center rounded-xl outline-none transition-[background-color,box-shadow] duration-200 hover:bg-[var(--card)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label="Go home"
            title="Chinta"
          >
            <LogoImage className="h-7 w-14 shrink-0" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              size={16}
            />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search chats"
              className="h-9 rounded-xl bg-[var(--card)] pl-9"
            />
          </div>

          <Button
            size="icon"
            onClick={onToggleExpanded}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="rounded-xl"
          >
            <PanelLeftClose size={18} />
          </Button>
        </div>
      </div>

      <nav className="shrink-0 px-2 pb-2">
        <SidebarAction icon={SquarePen} label="New chat" onClick={onNewChat} />
        <SidebarAction icon={Search} label="Search chats" onClick={onFocusSearch} />
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <ConversationSection
          sectionRef={pinnedSectionRef}
          title="Pinned"
          icon={Pin}
          conversations={pinned}
          activeConversationId={activeConversationId}
          emptyText="No pinned chats yet"
          onLoadConversation={onLoadConversation}
        />
        <ConversationSection
          sectionRef={recentSectionRef}
          title="Recents"
          icon={Clock3}
          conversations={recent}
          activeConversationId={activeConversationId}
          onLoadConversation={onLoadConversation}
        />
      </div>
    </>
  );
}

function CollapsedRail({
  onToggleExpanded,
  onNewChat,
  onFocusSearch,
  onFocusPinned,
  onFocusRecent,
}: {
  onToggleExpanded: () => void;
  onNewChat: () => void;
  onFocusSearch: () => void;
  onFocusPinned: () => void;
  onFocusRecent: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="group grid size-9 place-items-center rounded-xl outline-none transition hover:bg-[var(--card)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <LogoImage className="h-5 w-8 transition group-hover:hidden" />
          <PanelLeftOpen
            size={18}
            className="hidden transition group-hover:block"
            aria-hidden="true"
          />
        </button>

        <RailButton icon={SquarePen} label="New chat" onClick={onNewChat} />
        <RailButton icon={Search} label="Search chats" onClick={onFocusSearch} />
        <RailButton icon={Pin} label="Pinned chats" onClick={onFocusPinned} />
        <RailButton icon={Clock3} label="Recent chats" onClick={onFocusRecent} />
      </div>

      <button
        type="button"
        className="grid size-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-medium outline-none transition hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        aria-label="User menu"
        title="Zisan Sarker"
      >
        Z
      </button>
    </>
  );
}

function LogoImage({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block bg-black dark:bg-white",
        className,
      )}
      style={{
        WebkitMaskImage: "url('/chinta_logo.png')",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: "url('/chinta_logo.png')",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}

function SidebarAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex h-10 w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium outline-none transition hover:bg-[var(--card)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <Icon size={17} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function RailButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-xl outline-none transition hover:bg-[var(--card)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <Icon size={18} />
    </button>
  );
}

function ConversationSection({
  title,
  icon: Icon,
  conversations,
  activeConversationId,
  emptyText,
  sectionRef,
  onLoadConversation,
}: {
  title: string;
  icon: LucideIcon;
  conversations: Conversation[];
  activeConversationId: string | undefined;
  emptyText?: string;
  sectionRef: RefObject<HTMLDivElement | null>;
  onLoadConversation: (id: string) => void;
}) {
  return (
    <section ref={sectionRef} className="scroll-mt-3 pb-4">
      <div className="flex h-8 items-center gap-2 px-3 text-xs font-semibold text-[var(--muted-foreground)]">
        <Icon size={14} className="shrink-0" />
        <span className="truncate">{title}</span>
      </div>

      {conversations.length === 0 && emptyText ? (
        <div className="rounded-xl px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {emptyText}
        </div>
      ) : null}

      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          onClick={() => onLoadConversation(conversation.id)}
          className={cn(
            "mb-1 flex h-10 w-full min-w-0 items-center rounded-xl px-3 text-left text-sm outline-none transition-[background-color,color,box-shadow] duration-150 hover:bg-[var(--card)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            activeConversationId === conversation.id &&
              "bg-[var(--card)] font-medium shadow-sm",
          )}
        >
          <span className="line-clamp-1 min-w-0">{conversation.title}</span>
        </button>
      ))}
    </section>
  );
}
