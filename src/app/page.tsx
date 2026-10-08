import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Users,
  BookOpen,
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
    "Every club and every event on campus, in one place. Sign in or browse as a guest.",
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
            <span aria-hidden /> THE STUDENT SIDE OF CAMPUS
          </p>
          <h1 id="welcome-title" className={styles.headline}>
            Campus life.
            <br />
            <span>Minus the chaos.</span>
          </h1>
          <p className={styles.intro}>
            Your classes, attendance, marks and everything after.
            <br className={styles.desktopBreak} /> One place to keep up with it
            all.
          </p>
          <div className={styles.poster}>
            <div className={styles.posterTop}>
              <span>THE EVERYDAY, SORTED.</span>
              <ArrowUpRight aria-hidden size={18} />
            </div>
            <ul className={styles.features}>
              <li>
                <CalendarDays aria-hidden />
                <span>
                  Your next class.<small>Timetable &amp; planner</small>
                </span>
              </li>
              <li>
                <ChartNoAxesColumnIncreasing aria-hidden />
                <span>
                  Your progress.<small>Attendance &amp; marks</small>
                </span>
              </li>
              <li>
                <Users aria-hidden />
                <span>
                  Your people.<small>Events &amp; clubs</small>
                </span>
              </li>
            </ul>
            <div className={styles.orbit} aria-hidden>
              <svg viewBox="0 0 280 280" className={styles.orbitText}>
                <defs>
                  <path
                    id="campus-orbit"
                    d="M140,140 m-114,0 a114,114 0 1,1 228,0 a114,114 0 1,1 -228,0"
                  />
                </defs>
                <text>
                  <textPath href="#campus-orbit" textLength="716">
                    YOUR CLASSES · YOUR PEOPLE · YOUR CAMPUS ·{" "}
                  </textPath>
                </text>
              </svg>
              <div className={styles.orbitDisc}>
                <Image src="/logo-mark.svg" alt="" width={112} height={112} />
              </div>
              <span className={styles.orbitAxis} />
              <span className={styles.orbitDot} />
            </div>
            <p className={styles.posterBottom}>
              <BookOpen aria-hidden size={14} /> For the 9am. And everything
              after.
            </p>
          </div>
          <p className={styles.heroNote}>
            Built for students. Made for the whole campus.
          </p>
        </section>
        <section aria-label="Student sign in" className={styles.loginPanel}>
          <div className={styles.passLabel}>
            <span>
              <span className={styles.passDot} aria-hidden /> STUDENT ACCESS
            </span>
            <span aria-hidden>↗</span>
          </div>
          <SignInForm />
        </section>
      </div>
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>
          A little more campus, wherever you are.
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
