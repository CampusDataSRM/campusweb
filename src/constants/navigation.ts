/**
 * Navigation, per session kind - mirroring Campus App.
 *
 * - student: everything. Phones get a bottom bar of the four most-used
 *   destinations plus "More"; wider screens a sidebar with all of them.
 * - demo (evaluator): an events programme, worded as the app does -
 *   Home, Check-in, Events, Scores, Clubs, Legal.
 * - guest: only what Campus Web serves publicly - Events, Clubs, Legal.
 */

import {
  BarChart3,
  Calculator,
  CalendarDays,
  CalendarCheck2,
  Clock3,
  LayoutDashboard,
  Percent,
  Scale,
  Settings2,
  Trophy,
  UsersRound,
  UtensilsCrossed,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { LEGAL_ROUTES, STUDENT_ROUTES } from "@/constants/routes";
import type { SessionKind } from "@/lib/auth/session";

export interface NavItem {
  href: string;
  label: string;
  /** Short label for the phone bar (fits under the icon). */
  shortLabel?: string;
  icon: LucideIcon;
}

const LEGAL_ITEM: NavItem = {
  href: LEGAL_ROUTES.center,
  label: "Legal",
  icon: Scale,
};

const STUDENT_NAV: NavItem[] = [
  { href: STUDENT_ROUTES.dashboard, label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: STUDENT_ROUTES.attendance, label: "Attendance", icon: Percent },
  { href: STUDENT_ROUTES.planner, label: "Planner", icon: CalendarDays },
  { href: STUDENT_ROUTES.marks, label: "Marks", icon: BarChart3 },
  { href: STUDENT_ROUTES.timetable, label: "Timetable", icon: Clock3 },
  { href: STUDENT_ROUTES.events, label: "Events", icon: Sparkles },
  { href: STUDENT_ROUTES.clubs, label: "Clubs", icon: UsersRound },
  { href: STUDENT_ROUTES.mess, label: "Mess", icon: UtensilsCrossed },
  { href: STUDENT_ROUTES.cgpa, label: "CGPA", icon: Calculator },
];

const DEMO_NAV: NavItem[] = [
  { href: STUDENT_ROUTES.dashboard, label: "Home", icon: LayoutDashboard },
  { href: STUDENT_ROUTES.attendance, label: "Check-ins", shortLabel: "Check-in", icon: CalendarCheck2 },
  { href: STUDENT_ROUTES.events, label: "Events", icon: Sparkles },
  { href: STUDENT_ROUTES.marks, label: "Scores", icon: Trophy },
  { href: STUDENT_ROUTES.clubs, label: "Clubs", icon: UsersRound },
  LEGAL_ITEM,
];

const GUEST_NAV: NavItem[] = [
  { href: STUDENT_ROUTES.events, label: "Events", icon: Sparkles },
  { href: STUDENT_ROUTES.clubs, label: "Clubs", icon: UsersRound },
  LEGAL_ITEM,
];

export const SETTINGS_ITEM: NavItem = {
  href: STUDENT_ROUTES.settings,
  label: "Settings",
  icon: Settings2,
};

export interface NavigationModel {
  /** Every destination, in sidebar order. */
  items: NavItem[];
  /** Destinations pinned to the phone bar; the rest go under "More". */
  primary: NavItem[];
  /** Settings and legal - the sidebar footer and the end of "More". */
  utility: NavItem[];
}

/** How many destinations fit on the phone bar beside "More". */
const PHONE_BAR_SLOTS = 4;

export function navigationFor(kind: SessionKind): NavigationModel {
  switch (kind) {
    case "demo":
      return { items: DEMO_NAV, primary: DEMO_NAV.slice(0, PHONE_BAR_SLOTS), utility: [SETTINGS_ITEM] };
    case "guest":
      return { items: GUEST_NAV, primary: GUEST_NAV, utility: [SETTINGS_ITEM] };
    default:
      return {
        items: STUDENT_NAV,
        primary: STUDENT_NAV.slice(0, PHONE_BAR_SLOTS),
        utility: [SETTINGS_ITEM, LEGAL_ITEM],
      };
  }
}
