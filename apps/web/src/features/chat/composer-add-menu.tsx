"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus } from "lucide-react";

import { cn } from "@/lib/cn";
import { composerAddMenuItems } from "./composer-actions";

export function ComposerAddMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-[var(--foreground)] transition hover:brightness-95"
          aria-label="Add files and more"
        >
          <Plus size={22} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          className="z-50 w-[min(calc(100vw-2rem),48rem)] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl"
        >
          {composerAddMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenu.Item
                key={item.id}
                disabled={item.disabled}
                className={cn(
                  "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none",
                  "data-[disabled]:opacity-70",
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className="shrink-0 font-medium">{item.label}</span>
                <span className="truncate text-[var(--muted-foreground)]">
                  {item.description}
                </span>
              </DropdownMenu.Item>
            );
          })}
          <div className="px-3 pb-2 pt-3 text-sm text-[var(--muted-foreground)]">
            Type to search plugins, files, folders & skills
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
