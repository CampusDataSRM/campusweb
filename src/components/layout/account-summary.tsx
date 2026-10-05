"use client";

import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/constants/routes";
import { ROUTES } from "@/constants/auth";
import { useSession } from "@/context/session-context";
import { useSignOut } from "@/hooks/use-auth-actions";
import { useProfile } from "@/hooks/use-student-data";
import { initials, titleCase } from "@/lib/student/profile";
import { cn } from "@/lib/utils";

/**
 * Who is signed in, and the way out - the sidebar footer and the phone
 * "More" sheet both use it. Guests get "Sign in" instead.
 */
export function AccountSummary({
  compact = false,
  variant = "default",
}: {
  compact?: boolean;
  variant?: "default" | "sidebar";
}) {
  const { session, hydrated } = useSession();
  const profile = useProfile();
  const signOut = useSignOut();
  const isGuest = !session || session.kind === "guest";

  if (!hydrated) return <Skeleton className="h-11 w-full rounded-xl" />;

  if (isGuest) {
    return (
      <Button
        size="touch"
        aria-label="Sign in"
        className="w-full"
        render={<Link href={ROUTES.home} />}
        nativeButton={false}
      >
        <LogIn aria-hidden />
        {!compact && "Sign in to unlock everything"}
      </Button>
    );
  }

  const name = titleCase(profile.data?.name) || session.netId.toUpperCase();
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        compact && "justify-center",
        variant === "sidebar" && "sidebar-account-summary",
      )}
    >
      <Link
        href={STUDENT_ROUTES.settings}
        aria-label="Account settings"
        className="account-avatar-link"
      >
        <Avatar className="size-10 rounded-xl">
          <AvatarFallback className="rounded-xl bg-primary-container font-bold text-on-primary-container">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </Link>
      {!compact && (
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-bold text-on-surface"
            title={name}
          >
            {name}
          </p>
          <p className="truncate text-xs text-on-surface-muted">
            {profile.data?.registrationNumber ?? session.netId}
          </p>
        </div>
      )}
      {!compact && (
        <Button
          variant="ghost"
          size="icon-touch"
          onClick={() => void signOut()}
          aria-label="Sign out"
          className="text-on-surface-muted hover:text-danger-accent"
        >
          <LogOut />
        </Button>
      )}
    </div>
  );
}
