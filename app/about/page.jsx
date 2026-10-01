import LegalDocument from "@/components/legal/legal-document";
import SectionTitle from "@/components/global/section-title";
import TeamCard from "@/components/global/team/card";
import { teamData } from "@/components/global/team/data";
import { LEGAL_NAME, aboutUs } from "@/constants/legal";

export const metadata = {
  title: "About Us · The Campus Web",
  description: `The Campus Web is a platform for campus events and student life, operated by ${LEGAL_NAME}.`,
};

export default function AboutPage() {
  return (
    <LegalDocument document={aboutUs}>
      <div className="mt-1">
        <SectionTitle title="The team" icon="/icons/team/secondary.svg" />
        <div className="flex flex-col gap-3 -mt-2">
          {teamData.map((item) => (
            <TeamCard key={item.name} {...item} />
          ))}
        </div>
      </div>
    </LegalDocument>
  );
}
