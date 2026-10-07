"use client";

import { motion } from "motion/react";
import {
  BadgeCheck,
  CalendarDays,
  CalendarPlus,
  LayoutDashboard,
  LogIn,
  LogOut,
  Scale,
  Sparkles,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { NavGroup } from "@/components/layout/app-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/auth";
import { LEGAL_ROUTES, STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useNavigation } from "@/hooks/use-navigation";
import { useClubEvents, useClubSignOut } from "@/hooks/use-club";
import { tapHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const NAV = [
  { href: ROUTES.club, label: "Events", icon: CalendarDays },
  { href: `${ROUTES.club}/events/new`, label: "New event", icon: CalendarPlus },
  { href: `${ROUTES.club}/profile`, label: "Profile", icon: UserRound },
] as const;

const spring = { type: "spring" as const, stiffness: 520, damping: 38 };

/** The club's identity block: its logo, name and verification state. */
function ClubIdentity({ compact }: { compact?: boolean }) {
  const events = useClubEvents();
  const club = events.data?.club;

  if (events.isPending) {
    return (
      <div className="flex items-center gap-3 px-2">
        <ShimmerBlock className="size-11 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <ShimmerBlock className="h-4 w-3/4" />
          <ShimmerBlock className="h-3 w-1/2" />
        </div>
      </div>
    );
  }
  return (
    <div className={cn("flex min-w-0 items-center gap-3", compact && "px-0")}>
      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container text-on-surface-muted">
        {club?.logo ? (
          <Image
            src={club.logo}
            alt=""
            width={44}
            height={44}
            unoptimized
            className="size-11 object-cover"
          />
        ) : (
          <span className="font-heading text-lg font-bold text-primary-accent">
            {club?.name?.trim()?.[0]?.toUpperCase() ?? "C"}
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-bold text-on-surface">
          {club?.name ?? "Your club"}
        </p>
        {club ? (
          club.verified ? (
            <p className="flex items-center gap-1 text-xs font-bold text-success-accent">
              <BadgeCheck aria-hidden className="size-3.5" /> Verified
            </p>
          ) : (
            <p className="text-xs font-bold text-warning-accent">
              Awaiting verification
            </p>
          )
        ) : null}
      </div>
    </div>
  );
}

function ClubSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const signOut = useClubSignOut();
  const { session, hydrated } = useSession();

  const isStudentLoggedIn = hydrated && !!session;
  const studentItems = isStudentLoggedIn
    ? [
        { href: STUDENT_ROUTES.dashboard, label: "Student Dashboard", icon: LayoutDashboard },
        { href: STUDENT_ROUTES.events, label: "Campus Events", icon: Sparkles },
      ]
    : [
        { href: ROUTES.home, label: "Student Login", icon: LogIn },
      ];

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="campus-sidebar p-3 pr-0"
    >
      <SidebarHeader className="campus-sidebar-brand">
        <Link
          href={ROUTES.club}
          aria-label="Dashboard"
          className="campus-brand-link"
        >
          {collapsed ? (
            <span className="campus-brand-symbol">
              <Logo />
            </span>
          ) : (
            <Logo className="campus-brand-wordmark" />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="campus-sidebar-content">
        <SidebarGroup className="campus-nav-group">
          <SidebarGroupLabel className="campus-nav-label">Your Club</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={item.href} aria-label={item.label} aria-current={isActive ? "page" : undefined} />}
                      className="campus-nav-link group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0!"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="club-sidebar-pill"
                          aria-hidden
                          className="campus-nav-selection"
                          transition={spring}
                        />
                      )}
                      <span className="campus-nav-icon">
                        <item.icon aria-hidden />
                      </span>
                      <span className="campus-nav-text">{item.label}</span>
                      {isActive && (
                        <span className="campus-nav-indicator" aria-hidden />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavGroup label="Campus Web" items={studentItems} />
      </SidebarContent>
      <SidebarFooter className="campus-sidebar-footer">
        <SidebarGroup className="campus-nav-group campus-nav-utility">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-row gap-2">
              <SidebarMenuItem className="flex-1">
                <SidebarMenuButton
                  isActive={pathname === LEGAL_ROUTES.center}
                  tooltip="Legal"
                  render={<Link href={LEGAL_ROUTES.center} aria-label="Legal" />}
                  className="campus-nav-link w-full group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0!"
                >
                  <span className="campus-nav-icon">
                    <Scale aria-hidden />
                  </span>
                  <span className="campus-nav-text">Legal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex-1">
                <SidebarMenuButton
                  onClick={() => void signOut()}
                  tooltip="Sign out"
                  className="campus-nav-link w-full group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0! text-on-surface-muted hover:text-danger-accent focus-visible:text-danger-accent"
                >
                  <span className="campus-nav-icon">
                    <LogOut aria-hidden />
                  </span>
                  <span className="campus-nav-text">Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="campus-sidebar-account">
          <ClubIdentity compact={collapsed} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function BarLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof CalendarDays;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={tapHaptic}
      className="group flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-bold"
    >
      <span
        className={cn(
          "relative isolate flex h-8 w-14 items-center justify-center rounded-full transition-[color,transform] duration-(--duration-short) group-active:scale-90",
          active ? "text-on-primary-container" : "text-on-surface-muted",
        )}
      >
        {active && (
          <motion.span
            layoutId="club-bar-pill"
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-primary-container"
            transition={spring}
          />
        )}
        <Icon aria-hidden className="size-5" />
      </span>
      <span className={active ? "text-on-surface" : "text-on-surface-muted"}>
        {label}
      </span>
    </Link>
  );
}

/**
 * The club portal frame. Desktop: a fixed rail whose masthead is the club
 * itself. Phone: a slim top bar and the three destinations in a floating
 * bar at the bottom. The shell stays mounted across portal navigation.
 */
export function ClubPortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const signOut = useClubSignOut();

  return (
    <SidebarProvider className="campus-shell">
      <ClubSidebar />
      <SidebarInset className="min-w-0 bg-transparent">
        <header className="app-header sticky top-0 z-30 flex h-14 items-center gap-2 px-page md:h-16">
          <SidebarTrigger className="hidden text-on-surface-muted md:inline-flex" />
          <Link
            href={ROUTES.club}
            aria-label="Dashboard"
            className="md:hidden"
          >
            <Logo className="h-5" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => void signOut()}
              aria-label="Sign out"
              className="pressable ml-auto flex size-10 items-center justify-center rounded-xl text-on-surface-muted transition-colors hover:text-danger-accent"
            >
              <LogOut aria-hidden className="size-4" />
            </button>
          </div>
        </header>
        <section
          id="main"
          className="mx-auto w-full max-w-7xl flex-1 px-page pb-[calc(7.5rem+env(safe-area-inset-bottom))] pt-6 lg:pb-12 lg:pt-10"
        >
          {children}
        </section>
      </SidebarInset>

      {/* Phone bottom bar */}
      <nav
        aria-label="Club portal"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-2xl border border-outline-variant bg-surface-modal/95 px-1.5 py-1 shadow-[0_20px_50px_-12px_color-mix(in_oklab,var(--surface-lowest)_90%,transparent),inset_0_1px_0_color-mix(in_oklab,var(--on-surface)_10%,transparent)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-stretch">
          {NAV.map(({ href, label, icon }) => (
            <BarLink
              key={href}
              href={href}
              label={label}
              icon={icon}
              active={pathname === href}
            />
          ))}
        </div>
      </nav>
    </SidebarProvider>
  );
}
