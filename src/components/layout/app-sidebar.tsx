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
import { LEGAL_ROUTES, STUDENT_ROUTES } from "@/constants/routes";
import { useNavigation } from "@/hooks/use-navigation";

function NavGroup({
  label,
  items,
  utility = false,
}: {
  label?: string;
  items: NavItem[];
  utility?: boolean;
}) {
  const { isActive } = useNavigation();
  if (!items.length) return null;
  return (
    <SidebarGroup
      className={
        utility ? "campus-nav-group campus-nav-utility" : "campus-nav-group"
      }
    >
      {label && (
        <SidebarGroupLabel className="campus-nav-label">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="campus-nav-list">
          {items.map(({ href, label: itemLabel, icon: Icon }) => {
            const active = isActive(href);
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={itemLabel}
                  render={
                    <Link
                      href={href}
                      aria-label={itemLabel}
                      aria-current={active ? "page" : undefined}
                    />
                  }
                  className="campus-nav-link group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:p-0!"
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-pill"
                      aria-hidden
                      className="campus-nav-selection"
                      transition={{
                        type: "spring",
                        stiffness: 480,
                        damping: 38,
                      }}
                    />
                  )}
                  <span className="campus-nav-icon">
                    <Icon aria-hidden />
                  </span>
                  <span className="campus-nav-text">{itemLabel}</span>
                  {active && (
                    <span className="campus-nav-indicator" aria-hidden />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const campusDestinations = new Set<string>([
  STUDENT_ROUTES.events,
  STUDENT_ROUTES.mess,
  STUDENT_ROUTES.clubs,
]);

/** Session-aware destinations, grouped for scanning; tooltips remain in icon mode. */
export function AppSidebar() {
  const { items, utility } = useNavigation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const utilityItems = [
    ...utility,
    ...items.filter((item) => item.href === LEGAL_ROUTES.center),
  ];
  const dashboard = items.filter(
    (item) => item.href === STUDENT_ROUTES.dashboard,
  );
  const campus = items.filter((item) => campusDestinations.has(item.href));
  const studies = items.filter(
    (item) =>
      item.href !== STUDENT_ROUTES.dashboard &&
      item.href !== LEGAL_ROUTES.center &&
      !campusDestinations.has(item.href),
  );

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="campus-sidebar p-3 pr-0"
    >
      <SidebarHeader className="campus-sidebar-brand">
        <Link
          href={STUDENT_ROUTES.dashboard}
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
        <NavGroup items={dashboard} />
        <NavGroup
          label={
            items.some((item) => item.href === STUDENT_ROUTES.cgpa)
              ? "Your studies"
              : "Your programme"
          }
          items={studies}
        />
        <NavGroup label="Campus life" items={campus} />
      </SidebarContent>
      <SidebarFooter className="campus-sidebar-footer">
        <NavGroup items={utilityItems} utility />
        <div className="campus-sidebar-account">
          <AccountSummary compact={collapsed} variant="sidebar" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
