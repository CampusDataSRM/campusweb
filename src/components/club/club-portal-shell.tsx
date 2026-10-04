"use client";

import { CalendarPlus, LayoutDashboard, LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/auth";
import { useClubSignOut } from "@/hooks/use-club";
import { cn } from "@/lib/utils";

const NAV = [
  { href: ROUTES.club, label: "Events", icon: LayoutDashboard },
  { href: `${ROUTES.club}/events/new`, label: "New event", icon: CalendarPlus },
  { href: `${ROUTES.club}/profile`, label: "Profile", icon: UserCog },
] as const;

/** Club portal frame: brand, three destinations, sign out. Same on every width. */
export function ClubPortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const signOut = useClubSignOut();
  return (
    <div className="club-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-content items-center gap-3 px-page">
          <Link
            href={ROUTES.club}
            className="flex items-center gap-2"
            aria-label="Club portal home"
          >
            <Logo className="h-5" />
            <span className="hidden rounded-full bg-secondary-container px-2 py-0.5 text-xs font-bold text-on-secondary-container sm:inline">
              Club portal
            </span>
          </Link>
          <nav
            aria-label="Club portal"
            className="ml-auto flex items-center gap-1"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-muted hover:bg-surface-high hover:text-on-surface",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="icon-touch"
              aria-label="Sign out"
              onClick={() => void signOut()}
              className="text-on-surface-muted hover:text-danger-accent"
            >
              <LogOut />
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-content flex-1 px-page py-8">
        {children}
      </main>
    </div>
  );
}
