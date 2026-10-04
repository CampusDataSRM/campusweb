import type { ReactNode } from "react";
import { BadgeCheck, Heart, Megaphone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ClubAuthLive } from "@/components/club/club-auth-live";

/** What the portal does, in the stage's own words. */
const PROMISES = [
  { icon: Megaphone, text: "Publish events the moment they're ready." },
  { icon: BadgeCheck, text: "Verified clubs appear to every student." },
  { icon: Heart, text: "Watch interest come in, event by event." },
] as const;

/**
 * Every public club screen: a split stage. The left panel carries the club
 * story with live campus numbers; the right column is the form card. Below
 * the stage's breakpoint it collapses to the brand over the card.
 */
export function ClubAuthCard({
  title,
  description,
  children,
  footer,
  wide,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="sign-in-page">
      <header className="sign-in-header">
        <Logo priority className="h-6 w-fit" />
        <Link href="/">For students ↗</Link>
      </header>
      <div className={`sign-in-layout ${wide ? 'xl:!grid-cols-[minmax(0,1fr)_576px] lg:!grid-cols-[minmax(0,1fr)_480px]' : 'lg:!grid-cols-[minmax(0,1fr)_448px]'}`}>
        <section className="sign-in-pitch" aria-labelledby="welcome-title">
          <div className="sign-in-eyebrow text-primary-accent">
            <span aria-hidden /> Club portal
          </div>
          <h1 id="welcome-title">
            Your club.
            <br />
            In front of every student.
          </h1>
          <p>
            Publish events the moment they&apos;re ready. Verified clubs appear to every student, so you can watch interest come in, event by event.
          </p>
        </section>
        <section className="sign-in-wall-area" aria-label="On campus now">
          <ClubAuthLive />
        </section>
        <section aria-labelledby="sign-in-title" className="sign-in-card">
          <div>
            <h2 id="sign-in-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          {children}
          {footer && (
            <div className="relative mt-2 flex flex-col items-center gap-2 text-sm">
              {footer}
            </div>
          )}
        </section>
      </div>
      <footer className="sign-in-footer">
        <span>Your campus. Your people.</span>
      </footer>
    </main>
  );
}
