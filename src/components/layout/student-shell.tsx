"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenu } from "@/components/layout/command-menu";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { STUDENT_ROUTES } from "@/constants/routes";

/**
 * The frame every student page shares: sidebar from tablet width up, a top
 * bar and bottom navigation on phones. Content is width-capped and padded
 * fluidly; bottom padding keeps it clear of the phone bar.
 */
export function StudentShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 bg-transparent">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-outline-variant bg-surface/30 px-page backdrop-blur-xl md:h-12">
          <SidebarTrigger className="hidden text-on-surface-muted md:inline-flex" />
          <Link href={STUDENT_ROUTES.dashboard} aria-label="Dashboard" className="md:hidden">
            <Logo className="h-5" />
          </Link>
          <div className="ml-auto flex items-center gap-1">
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
        <main
          id="main"
          className="mx-auto w-full max-w-content flex-1 px-page pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12"
        >
          {children}
        </main>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
