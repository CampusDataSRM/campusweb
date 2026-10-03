import type { Metadata } from "next";

import {
  INSTAGRAM_URL,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_DIAL,
  TRADE_NAME,
  WEBSITE_URL,
} from "@/constants/legal";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Contact ${LEGAL_NAME}, operator of The Campus Web.`,
};

const CONTACTS = [
  { label: "Email", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}?subject=The%20Campus%20Web%20support` },
  { label: "Phone", value: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE_DIAL}` },
  { label: "Website", value: "campusweb.in", href: WEBSITE_URL },
  { label: "Instagram", value: "@thecampusweb", href: INSTAGRAM_URL },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 font-extrabold text-on-surface">Contact us</h1>
        <p className="text-on-surface-muted">
          We read every message. For anything about events, clubs, payments, access or refunds, email us and we will reply within 2 business days.
        </p>
      </header>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-5 sm:col-span-2">
          <dt className="text-xs font-bold tracking-widest text-on-surface-subtle uppercase">Operator</dt>
          <dd className="mt-1 font-bold text-on-surface">{LEGAL_NAME}, trading as {TRADE_NAME}</dd>
        </div>
        {CONTACTS.map((contact) => (
          <div key={contact.label} className="rounded-2xl border border-outline-variant bg-surface-container p-5">
            <dt className="text-xs font-bold tracking-widest text-on-surface-subtle uppercase">{contact.label}</dt>
            <dd className="mt-1">
              <a href={contact.href} className="font-semibold break-all text-primary-accent hover:underline">{contact.value}</a>
            </dd>
          </div>
        ))}
      </dl>
      <section className="flex flex-col gap-2 rounded-2xl border border-outline-variant bg-surface-container p-5">
        <h2 className="font-heading font-bold text-on-surface">Before you write in</h2>
        <p className="text-sm text-on-surface-muted">
          For a payment issue, include your registration number and the order reference shown on the payment screen. Grievances are acknowledged within 2 business days and resolved within 30 days. Grievance officer: {LEGAL_NAME}.
        </p>
      </section>
    </div>
  );
}
