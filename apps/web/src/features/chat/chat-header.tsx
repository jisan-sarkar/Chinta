"use client";

import { Menu, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ChatHeader({
  title,
  guestMode = false,
  onOpenSidebar,
  onOpenAuth,
}: {
  title: string;
  guestMode?: boolean;
  onOpenSidebar: () => void;
  onOpenAuth?: (mode: "login" | "signup") => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-[var(--background)]/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          size="icon"
          className="rounded-xl lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </Button>
        <div className="truncate text-sm font-medium text-[var(--muted-foreground)] sm:text-[var(--foreground)]">
          {title}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {guestMode ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenAuth?.("login")}
              className="rounded-full bg-[var(--card)]"
            >
              Log in
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onOpenAuth?.("signup")}
              className="rounded-full"
            >
              Sign up
            </Button>
          </div>
        ) : null}
        <Button
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className="rounded-xl"
        >
          <SunMoon size={18} />
        </Button>
      </div>
    </header>
  );
}
