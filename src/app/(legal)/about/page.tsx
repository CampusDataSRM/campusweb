import type { Metadata } from "next";
import Image from "next/image";

import { LegalDocument } from "@/components/legal/legal-document";
import { aboutUs, LEGAL_NAME } from "@/constants/legal";
import { TEAM, teamPhoto } from "@/constants/team";

export const metadata: Metadata = {
  title: "About us",
  description: `The Campus Web brings campus events and student life into one place. Operated by ${LEGAL_NAME}.`,
};

export default function AboutPage() {
  return (
    <LegalDocument document={aboutUs}>
      <section className="flex flex-col gap-4">
        <h2 className="text-h3 font-bold text-on-surface">The team</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TEAM.map((member) => (
            <li key={member.name} className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container p-4">
              <Image src={teamPhoto(member.name)} alt="" width={64} height={64} className="size-16 rounded-2xl object-cover" />
              <div>
                <p className="font-bold text-on-surface">{member.name}</p>
                <p className="text-sm text-on-surface-muted">{member.caption}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </LegalDocument>
  );
}
