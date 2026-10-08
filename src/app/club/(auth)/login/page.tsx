import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ClubAuthCard } from "@/components/club/club-auth-card";
import { ClubSignInForm } from "@/components/club/club-sign-in-form";
import { CLUB_SESSION_COOKIE, ROUTES } from "@/constants/auth";
import { isClubTokenUsable } from "@/lib/auth/club-session";

export const metadata: Metadata = { title: "Club sign in" };

export default async function ClubLoginPage() {
  const cookieStore = await cookies();
  if (isClubTokenUsable(cookieStore.get(CLUB_SESSION_COOKIE)?.value)) {
    redirect(ROUTES.club);
  }

  return (
    <ClubAuthCard
      title="Sign in to your club"
      description="Publish events and keep your club's profile up to date."
      footer={
        <>
          <Link href="/club/forgot-password" className="font-semibold text-primary-accent hover:underline">Forgot password?</Link>
          <p className="text-on-surface-muted">
            New club? <Link href="/club/register" className="font-semibold text-primary-accent hover:underline">Register it</Link>
          </p>
          <Link href="/" className="text-on-surface-muted hover:text-on-surface">I&apos;m a student</Link>
        </>
      }
    >
      <ClubSignInForm />
    </ClubAuthCard>
  );
}
