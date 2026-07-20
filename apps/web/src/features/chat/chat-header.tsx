"use client";

import { Menu, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ChatHeader({
  title,
  onOpenSidebar,
}: {
  title: string;
  onOpenSidebar: () => void;
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
          <SunMoon size={18} />
        </Button>
      </div>
    </header>
  );
}
