import { ClubPortalShell } from "@/components/club/club-portal-shell";

export default function ClubPortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClubPortalShell>{children}</ClubPortalShell>;
}
