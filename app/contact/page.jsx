import LegalShell from "@/components/legal/legal-shell";
import {
  INSTAGRAM_URL,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DIAL,
  TRADE_NAME,
  WEBSITE_URL,
} from "@/constants/legal";

export const metadata = {
  title: "Contact Us · The Campus Web",
  description: `Contact ${LEGAL_NAME}, operator of The Campus Web.`,
};

const CONTACTS = [
  {
    label: "Email",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}?subject=The%20Campus%20Web%20support`,
  },
  { label: "Phone", value: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE_DIAL}` },
  { label: "Website", value: "campusweb.in", href: WEBSITE_URL },
  { label: "Instagram", value: "@thecampusweb", href: INSTAGRAM_URL, external: true },
];

export default function ContactPage() {
  return (
    <LegalShell
      title="Contact Us"
      summary="We read every message. For anything about events, clubs, payments, access or refunds, email us and we will reply within 2 business days."
    >
      <div className="flex flex-col gap-3">
        <section className="theme_box_bg p-5">
          <h2 className="text-base font-semibold text-theme_text_primary mb-1">
            Operator
          </h2>
          <p className="text-theme_text_normal text-sm leading-relaxed">
            {LEGAL_NAME}, trading as {TRADE_NAME}
          </p>
        </section>
        {CONTACTS.map((contact) => (
          <a
            key={contact.label}
            href={contact.href}
            {...(contact.external && { target: "_blank", rel: "noopener noreferrer" })}
            className="theme_box_bg p-5 flex flex-col gap-1 hover:bg-[#0C4DA2]/30 transition-colors"
          >
            <span className="text-theme_text_normal/70 text-xs uppercase tracking-widest">
              {contact.label}
            </span>
            <span className="text-theme_text_primary font-medium break-all">
              {contact.value}
            </span>
          </a>
        ))}
        <section className="theme_box_bg p-5">
          <h2 className="text-base font-semibold text-theme_text_primary mb-2">
            Before you write in
          </h2>
          <p className="text-theme_text_normal text-sm leading-relaxed">
            For a payment issue, include your registration number and the
            order reference shown on the payment screen. That lets us find the
            transaction straight away.
          </p>
        </section>
        <section className="theme_box_bg p-5">
          <h2 className="text-base font-semibold text-theme_text_primary mb-2">
            Grievance officer
          </h2>
          <p className="text-theme_text_normal text-sm leading-relaxed">
            {LEGAL_NAME} - {SUPPORT_EMAIL}. Grievances are acknowledged within
            2 business days and resolved within 30 days.
          </p>
        </section>
      </div>
    </LegalShell>
  );
}
