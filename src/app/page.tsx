import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarDays,
  QrCode,
  Users,
  Ticket,
} from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/brand/logo";
import { STORE_LINKS } from "@/constants/site";
import { ROUTES, SESSION_COOKIE } from "@/constants/auth";
import { isSignedIn, parseSession } from "@/lib/auth/session";
import { LEGAL_ROUTES } from "@/constants/routes";
import styles from "@/components/auth/sign-in.module.css";

export const metadata: Metadata = {
  title: { absolute: "The Campus Web - Sign in" },
  description:
    "Discover clubs and upcoming events, manage your plans, and keep track of event check-ins and check-outs. Sign in or explore as a guest.",
};

export default async function SignInPage() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (isSignedIn(session)) redirect(ROUTES.student);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Logo priority className={styles.logo} />
        <Link href={ROUTES.clubLogin} className={styles.clubLink}>
          Club portal <ArrowUpRight aria-hidden size={16} />
        </Link>
      </header>
      <div className={styles.layout}>
        <section className={styles.hero} aria-labelledby="welcome-title">
          <p className={styles.eyebrow}>
            <span aria-hidden /> CLUBS, EVENTS & GOOD COMPANY
          </p>
          <h1 id="welcome-title" className={styles.headline}>
            Your people.
            <br />
            <span>Your plans.</span>
          </h1>
          <p className={styles.intro}>
            Discover your next event, find a club that feels like you,
            <br className={styles.desktopBreak} /> and keep all your plans in
            one place.
          </p>
          <div className={styles.poster}>
            <div className={styles.posterTop}>
              <span>GOOD PLANS START HERE.</span>
              <ArrowUpRight aria-hidden size={18} />
            </div>
            <ul className={styles.features}>
              <li>
                <CalendarDays aria-hidden />
                <span>
                  What’s happening.<small>Upcoming events</small>
                </span>
              </li>
              <li>
                <Users aria-hidden />
                <span>
                  Find your people.<small>Clubs &amp; communities</small>
                </span>
              </li>
              <li>
                <QrCode aria-hidden />
                <span>
                  You’re on the list.
                  <small>Event check-ins &amp; check-outs</small>
                </span>
              </li>
            </ul>
            <div className={styles.posterMark} aria-hidden>
              <Image src="/logo-mark.svg" alt="" width={132} height={132} />
            </div>
            <p className={styles.posterBottom}>
              <Ticket aria-hidden size={14} /> From the first check-in to the
              last goodbye.
            </p>
          </div>
          <p className={styles.heroNote}>
            Discover an event. Join a club. Be part of it.
          </p>
        </section>
        <section aria-label="Account sign in" className={styles.loginPanel}>
          <div className={styles.passLabel}>
            <span>
              <span className={styles.passDot} aria-hidden /> MEMBER ACCESS
            </span>
            <span aria-hidden>↗</span>
          </div>
          <SignInForm />
        </section>
      </div>
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>
          Good plans, wherever you are.
        </span>
        <nav aria-label="CampusApp and policies">
          <a href={STORE_LINKS.playStore} target="_blank" rel="noreferrer">
            Android <ArrowUpRight aria-hidden size={12} />
          </a>
          <a href={STORE_LINKS.appStore} target="_blank" rel="noreferrer">
            iPhone <ArrowUpRight aria-hidden size={12} />
          </a>
          <Link href={LEGAL_ROUTES.center}>Legal &amp; policies</Link>
        </nav>
      </footer>
    </main>
  );
}
