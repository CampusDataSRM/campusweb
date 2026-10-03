import type { Metadata } from "next";

import { ClubAuthCard } from "@/components/club/club-auth-card";
import { ResetPasswordForm } from "@/components/club/password-reset-forms";

export const metadata: Metadata = { title: "Set a new club password" };

export default async function ResetPasswordPage(props: PageProps<"/club/reset-password/[token]">) {
  const { token } = await props.params;
  return (
    <ClubAuthCard title="Set a new password">
      <ResetPasswordForm token={decodeURIComponent(token)} />
    </ClubAuthCard>
  );
}
