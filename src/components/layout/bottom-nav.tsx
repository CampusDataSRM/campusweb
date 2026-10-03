"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AccountSummary } from "@/components/layout/account-summary";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { NavItem } from "@/constants/navigation";
import { useNavigation } from "@/hooks/use-navigation";
import { cn } from "@/lib/utils";

function BarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="group flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-bold"
    >
      <span
        className={cn(
          "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-(--duration-short)",
          active ? "bg-primary-container text-on-primary-container" : "text-on-surface-muted group-hover:text-on-surface",
        )}
      >
        <Icon aria-hidden className="size-5" />
      </span>
      <span className={active ? "text-on-surface" : "text-on-surface-muted"}>
        {item.shortLabel ?? item.label}
      </span>
    </Link>
  );
}

/**
 * Phone navigation: the most-used destinations in a bar at the bottom (in
 * thumb reach), everything else in a "More" sheet. Sits above the home
 * indicator via the safe-area inset.
 */
export function BottomNav() {
  const { items, primary, utility, isActive } = useNavigation();
  const [moreOpen, setMoreOpen] = useState(false);
  const overflow = [...items.filter((item) => !primary.includes(item)), ...utility];
  const overflowActive = overflow.some((item) => isActive(item.href));

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant bg-surface-modal/80 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch">
          {primary.slice(0, Math.ceil(primary.length / 2)).map((item) => (
            <BarLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
          {overflow.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className="group flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-bold"
            >
              <span
                className="flex size-11 -translate-y-1 items-center justify-center rounded-full bg-cta text-on-primary shadow-lg shadow-black/40"
              >
                <Ellipsis aria-hidden className="size-5" />
              </span>
              <span className={overflowActive ? "text-on-surface" : "text-on-surface-muted"}>More</span>
            </button>
          )}
          {primary.slice(Math.ceil(primary.length / 2)).map((item) => (
            <BarLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-outline-variant bg-surface-modal pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="pb-2">
            <SheetTitle className="font-heading text-h3 text-on-surface">More</SheetTitle>
            <SheetDescription className="text-on-surface-muted">Everything else on Campus Web.</SheetDescription>
          </SheetHeader>
          <ul className="grid grid-cols-3 gap-2 px-4">
            {overflow.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center text-xs font-bold transition-colors",
                      active
                        ? "border-primary/50 bg-primary-container text-on-primary-container"
                        : "border-outline-variant bg-surface-high text-on-surface-muted hover:text-on-surface",
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mx-4 mt-4 rounded-2xl border border-outline-variant bg-surface-high p-3">
            <AccountSummary />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
