"use client";

import { Menu, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function ChatHeader({
  title,
  settingsOpen,
  onOpenSidebar,
  onToggleSettings,
}: {
  title: string;
  settingsOpen: boolean;
  onOpenSidebar: () => void;
  onToggleSettings: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </Button>
        <div className="truncate text-sm font-medium">{title}</div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button
          size="icon"
          onClick={onToggleSettings}
          aria-label="Settings"
          className={cn(settingsOpen && "bg-[var(--muted)]")}
        >
          <Settings size={18} />
        </Button>
      </div>
    </header>
  );
}
