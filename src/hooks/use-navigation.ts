"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

import { navigationFor, type NavigationModel } from "@/constants/navigation";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";

/**
 * Navigation for the current session, and whether a destination is active.
 * The dashboard matches exactly; every other destination matches its
 * subtree (so a club's page keeps "Clubs" active).
 */
export function useNavigation(): NavigationModel & {
  isActive: (href: string) => boolean;
} {
  const pathname = usePathname();
  const { session } = useSession();
  const model = useMemo(() => navigationFor(session?.kind ?? "academia"), [session?.kind]);

  const isActive = useCallback(
    (href: string) =>
      href === STUDENT_ROUTES.dashboard
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  return { ...model, isActive };
}
