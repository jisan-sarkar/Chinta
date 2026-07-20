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
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-[var(--foreground)] outline-none transition-[filter,box-shadow,transform] duration-150 hover:brightness-95 focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:scale-[0.98]"
          aria-label="Add files and more"
        >
          <Plus size={22} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={10}
          collisionPadding={12}
          className="z-50 max-h-[min(28rem,calc(100dvh-7rem))] w-[min(calc(100vw-1rem),46rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl"
        >
          {composerAddMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenu.Item
                key={item.id}
                disabled={item.disabled}
                className={cn(
                  "grid cursor-not-allowed grid-cols-[1.25rem_minmax(0,auto)_minmax(0,1fr)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors sm:flex",
                  "data-[disabled]:opacity-70 data-[highlighted]:bg-[var(--muted)]",
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span className="min-w-0 truncate font-medium">{item.label}</span>
                <span className="col-span-3 min-w-0 truncate text-[var(--muted-foreground)] sm:col-auto">
                  {item.description}
                </span>
              </DropdownMenu.Item>
            );
          })}
          <div className="truncate px-3 pb-2 pt-3 text-sm text-[var(--muted-foreground)]">
            Type to search plugins, files, folders & skills
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
