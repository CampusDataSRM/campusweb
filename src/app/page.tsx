import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CampusWall, WallEyebrow } from "@/components/auth/campus-wall";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/brand/logo";
import { STORE_LINKS } from "@/constants/site";
import { ROUTES, SESSION_COOKIE } from "@/constants/auth";
import { isSignedIn, parseSession } from "@/lib/auth/session";

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
    <main className="sign-in-page">
      <header className="sign-in-header">
        <Logo priority className="h-6 w-fit" />
        <Link href="/club/login">For campus clubs ↗</Link>
      </header>
      <div className="sign-in-layout">
        <section className="sign-in-pitch" aria-labelledby="welcome-title">
          <WallEyebrow />
          <h1 id="welcome-title">
            Your campus.
            <br />
            What&apos;s on.
          </h1>
          <p>
            Every club, every event and the people behind them. One place to see
            what&apos;s happening around campus this week, and where to be.
          </p>
        </section>
        <section className="sign-in-wall-area" aria-label="On campus now">
          <CampusWall />
        </section>
        <section aria-labelledby="sign-in-title" className="sign-in-card">
          <div>
            <h2 id="sign-in-title">Welcome back.</h2>
            <p>Sign in with your student account.</p>
          </div>
          <SignInForm />
        </section>
      </div>
      <footer className="sign-in-footer">
        <span>Your campus. Your people.</span>
        <span>
          Take it with you.{" "}
          <a href={STORE_LINKS.playStore} target="_blank" rel="noreferrer">
            Android
          </a>{" "}
          ·{" "}
          <a href={STORE_LINKS.appStore} target="_blank" rel="noreferrer">
            iPhone
          </a>
        </span>
      </footer>
    </main>
  );
}
