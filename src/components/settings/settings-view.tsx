"use client";

import { ChevronRight, ExternalLink, Scale, Laptop } from "lucide-react";
import Link from "next/link";

import { AccountSummary } from "@/components/layout/account-summary";
import { PageHeader, Section } from "@/components/layout/page-header";
import { AppInstall } from "@/components/pwa/app-install";
import { ThemePicker } from "@/components/theme/theme-picker";
import { LEGAL_ROUTES, STUDENT_ROUTES } from "@/constants/routes";
import { SOCIAL_LINKS, STORE_LINKS } from "@/constants/site";

const LINKS = [
  { label: "Campus App on Android", href: STORE_LINKS.playStore },
  { label: "Campus App on iPhone", href: STORE_LINKS.appStore },
  { label: "Instagram @thecampusweb", href: SOCIAL_LINKS.instagram },
  {
    label: "Student community on WhatsApp",
    href: SOCIAL_LINKS.whatsappCommunity,
  },
];

export function SettingsView() {
  return (
    <div className="campus-view settings-page flex flex-col gap-8">
      <PageHeader title="Settings" description="Make Campus Web yours." />
      <div className="settings-layout">
        <Section title="Appearance">
          <ThemePicker />
        </Section>
        <aside className="settings-side" aria-label="Account and links">
          <Section title="App">
            <AppInstall />
          </Section>
          <Section title="Account">
            <div className="rounded-2xl panel p-4">
              <AccountSummary />
              <Link
                href={STUDENT_ROUTES.devices}
                className="mt-4 flex min-h-12 items-center gap-3 border-t border-outline-variant pt-4 font-semibold text-on-surface hover:text-primary-accent"
              >
                <Laptop aria-hidden className="size-5 text-primary-accent" />
                Devices
                <ChevronRight aria-hidden className="ml-auto size-5" />
              </Link>
            </div>
          </Section>
          <Section title="More">
            <ul className="divide-y divide-outline-variant overflow-hidden rounded-2xl panel">
              <li>
                <Link
                  href={LEGAL_ROUTES.center}
                  className="flex min-h-14 items-center gap-3 px-4 font-semibold text-on-surface hover:bg-surface-high"
                >
                  <Scale aria-hidden className="size-5 text-primary-accent" />
                  Legal &amp; policies
                  <ChevronRight
                    aria-hidden
                    className="ml-auto size-5 text-on-surface-subtle"
                  />
                </Link>
              </li>
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-14 items-center gap-3 px-4 font-semibold text-on-surface hover:bg-surface-high"
                  >
                    {link.label}
                    <ExternalLink
                      aria-hidden
                      className="ml-auto size-4 text-on-surface-subtle"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        </aside>
      </div>
    </div>
  );
}
