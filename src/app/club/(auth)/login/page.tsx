import type { Metadata } from "next";
import Link from "next/link";

import { ClubAuthCard } from "@/components/club/club-auth-card";
import { ClubSignInForm } from "@/components/club/club-sign-in-form";

export const metadata: Metadata = { title: "Club sign in" };

export default function ClubLoginPage() {
  return (
    <ClubAuthCard
      title="Sign in to your club"
      description="Publish events and keep your club's profile up to date."
      footer={
        <>
          <Link href="/club/forgot-password" className="font-semibold text-primary-accent hover:underline">Forgot password?</Link>
          <p className="text-on-surface-muted">
            New club? <Link href="/club/register" className="font-semibold text-primary-accent hover:underline">Register it</Link>
            {" · "}
            <Link href="/" className="font-semibold text-primary-accent hover:underline">Student sign in</Link>
          </p>
        </>
      }
    >
      <ClubSignInForm />
    </ClubAuthCard>
  );
}
