"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { AccountSummary } from "@/components/layout/account-summary";
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
} from "@/components/ui/sidebar";
import type { NavItem } from "@/constants/navigation";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useNavigation } from "@/hooks/use-navigation";

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { isActive } = useNavigation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-on-surface-subtle">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = isActive(href);
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={itemLabel}
                  render={<Link href={href} aria-current={active ? "page" : undefined} />}
                  className="relative isolate h-10 rounded-xl font-bold text-on-surface-muted transition-colors hover:bg-transparent hover:text-on-surface data-active:bg-transparent data-active:text-on-surface [&_svg]:size-[1.125rem] data-active:[&_svg]:text-primary-accent"
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-pill"
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-xl border border-outline-variant bg-[linear-gradient(90deg,color-mix(in_oklab,var(--primary)_32%,transparent),color-mix(in_oklab,var(--secondary)_14%,transparent))] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--on-surface)_10%,transparent)]"
                      transition={{ type: "spring", stiffness: 520, damping: 40 }}
                    />
                  )}
                  <Icon aria-hidden />
                  <span>{itemLabel}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/** Desktop navigation: every destination, collapsible to icons. */
export function AppSidebar() {
  const { items, utility } = useNavigation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="floating" className="p-3 pr-0">
      <SidebarHeader className="px-4 pt-5 pb-4">
        <Link href={STUDENT_ROUTES.dashboard} aria-label="Dashboard" className="flex items-center rounded-lg px-1">
          {collapsed ? (
            <Logo variant="stacked" className="w-8" />
          ) : (
            <Logo className="h-6" />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Campus" items={items} />
        <NavGroup label="More" items={utility} />
      </SidebarContent>
      <SidebarFooter className="m-2 rounded-2xl bg-surface-container p-2">
        <AccountSummary compact={collapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
