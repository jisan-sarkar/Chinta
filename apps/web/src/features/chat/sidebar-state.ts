import { type Conversation } from "@chinta/shared";

export type SidebarFocusTarget = "search" | "pinned" | "recent";

export const sidebarExpandedStorageKey = "chinta:sidebar-expanded";
export const sidebarExpandedChangedEvent = "chinta:sidebar-expanded-changed";
export const collapsedSidebarTargets = [
  "new-chat",
  "search",
  "pinned",
  "recent",
] as const;

export function splitConversationsByPinned(conversations: Conversation[]) {
  return {
    pinned: conversations.filter((conversation) => Boolean(conversation.pinnedAt)),
    recent: conversations.filter((conversation) => !conversation.pinnedAt),
  };
}

export function readSidebarExpandedPreference(storage: Storage | undefined) {
  if (!storage) {
    return true;
  }

  try {
    return storage.getItem(sidebarExpandedStorageKey) !== "false";
  } catch {
    return true;
  }
}

export function writeSidebarExpandedPreference(
  storage: Storage | undefined,
  expanded: boolean,
) {
  try {
    storage?.setItem(sidebarExpandedStorageKey, String(expanded));
  } catch {
    // Ignore storage failures so layout controls keep working.
  }
}

export function notifySidebarExpandedPreferenceChanged() {
  window.dispatchEvent(new Event(sidebarExpandedChangedEvent));
}
