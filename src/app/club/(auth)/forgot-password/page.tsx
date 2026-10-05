import type { Metadata } from "next";
import Link from "next/link";

import { ClubAuthCard } from "@/components/club/club-auth-card";
import { ForgotPasswordForm } from "@/components/club/password-reset-forms";

export const metadata: Metadata = { title: "Reset club password" };

export default function ForgotPasswordPage() {
  return (
    <ClubAuthCard title="Forgot your password?" description="We'll email your club a link to set a new one." footer={<Link href="/club/login" className="font-semibold text-primary-accent hover:underline">Back to sign in</Link>}>
      <ForgotPasswordForm />
    </ClubAuthCard>
  );
}
