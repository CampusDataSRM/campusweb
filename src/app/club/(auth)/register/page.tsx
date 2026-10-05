import type { Metadata } from "next";
import Link from "next/link";

import { ClubAuthCard } from "@/components/club/club-auth-card";
import { ClubRegisterForm } from "@/components/club/club-register-form";

export const metadata: Metadata = { title: "Register your club" };

export default function ClubRegisterPage() {
  return (
    <ClubAuthCard wide title="Register your club" description="Three quick steps. Your club goes live once it's verified." footer={<p className="text-on-surface-muted">Already registered? <Link href="/club/login" className="font-semibold text-primary-accent hover:underline">Sign in</Link></p>}>
      <ClubRegisterForm />
    </ClubAuthCard>
  );
}
