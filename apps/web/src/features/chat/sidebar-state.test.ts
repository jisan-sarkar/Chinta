import { describe, expect, it } from "vitest";
import { type Conversation } from "@chinta/shared";

import {
  collapsedSidebarTargets,
  readSidebarExpandedPreference,
  sidebarExpandedStorageKey,
  splitConversationsByPinned,
  writeSidebarExpandedPreference,
} from "./sidebar-state";

const baseConversation = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Conversation",
  modelId: null,
  archivedAt: null,
  updatedAt: "2026-07-20T00:00:00.000Z",
  createdAt: "2026-07-20T00:00:00.000Z",
} satisfies Omit<Conversation, "pinnedAt">;

function memoryStorage(initialValue?: string): Storage {
  const values = new Map<string, string>();

  if (initialValue !== undefined) {
    values.set(sidebarExpandedStorageKey, initialValue);
  }

  return {
    length: values.size,
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("sidebar state", () => {
  it("splits conversations into pinned and recent groups", () => {
    const conversations: Conversation[] = [
      {
        ...baseConversation,
        id: "22222222-2222-4222-8222-222222222222",
        title: "Pinned chat",
        pinnedAt: "2026-07-20T01:00:00.000Z",
      },
      {
        ...baseConversation,
        id: "33333333-3333-4333-8333-333333333333",
        title: "Recent chat",
        pinnedAt: null,
      },
    ];

    expect(splitConversationsByPinned(conversations)).toEqual({
      pinned: [conversations[0]],
      recent: [conversations[1]],
    });
  });

  it("defaults the persisted sidebar state to expanded", () => {
    expect(readSidebarExpandedPreference(undefined)).toBe(true);
    expect(readSidebarExpandedPreference(memoryStorage())).toBe(true);
  });

  it("reads and writes collapsed sidebar state", () => {
    const storage = memoryStorage();

    writeSidebarExpandedPreference(storage, false);
    expect(storage.getItem(sidebarExpandedStorageKey)).toBe("false");
    expect(readSidebarExpandedPreference(storage)).toBe(false);

    writeSidebarExpandedPreference(storage, true);
    expect(storage.getItem(sidebarExpandedStorageKey)).toBe("true");
    expect(readSidebarExpandedPreference(storage)).toBe(true);
  });

  it("defines the collapsed rail actions", () => {
    expect(collapsedSidebarTargets).toEqual([
      "new-chat",
      "search",
      "pinned",
      "recent",
    ]);
  });
});
