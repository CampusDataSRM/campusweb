"use client";

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
                  className="h-10 rounded-xl font-semibold text-on-surface-muted data-active:bg-primary-container data-active:text-on-primary-container [&_svg]:size-[1.125rem]"
                >
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
    <Sidebar collapsible="icon" className="border-r border-outline-variant">
      <SidebarHeader className="px-3 pt-5 pb-3">
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
      <SidebarFooter className="border-t border-outline-variant p-3">
        <AccountSummary compact={collapsed} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
