"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { OfflinePill } from "@/components/pwa/offline-pill";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useNavigation } from "@/hooks/use-navigation";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";

/**
 * The frame every student page shares: sidebar from tablet width up, a top
 * bar and bottom navigation on phones. Content is width-capped and padded
 * fluidly; bottom padding keeps it clear of the phone bar.
 */
function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export function StudentShell({ children }: { children: ReactNode }) {
  const scrolled = useScrolled();
  const pathname = usePathname();
  const { items, utility } = useNavigation();
  const { session } = useSession();
  const current =
    [...items, ...utility].find((item) => item.href === pathname)?.label ??
    "Campus";
  return (
    <SidebarProvider className="campus-shell">
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-transparent">
        <header
          data-scrolled={scrolled}
          className="app-header sticky top-0 z-30 flex h-14 items-center gap-2 px-page md:h-16"
        >
          <SidebarTrigger className="hidden text-on-surface-muted md:inline-flex" />
          <Link
            href={STUDENT_ROUTES.dashboard}
            aria-label="Dashboard"
            className="md:hidden"
          >
            <Logo className="h-5" />
          </Link>
          <span className="campus-breadcrumb hidden md:flex">
            <span>Campus</span>
            <span aria-hidden>/</span>
            <span>{current}</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            {(session?.kind === "academia" ||
              session?.kind === "student-portal") && (
              <Button
                variant="tonal"
                size="touch"
                render={<Link href={STUDENT_ROUTES.payment} />}
                nativeButton={false}
              >
                Pay ₹10
              </Button>
            )}
            <OfflinePill />
            <CommandMenu />
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon-touch"
              aria-label="Settings"
              render={<Link href={STUDENT_ROUTES.settings} />}
              nativeButton={false}
              className="text-on-surface-muted"
            >
              <Settings2 />
            </Button>
          </div>
        </header>
        <section
          id="main"
          className="mx-auto w-full max-w-content flex-1 px-page pt-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-12"
        >
          {children}
        </section>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
