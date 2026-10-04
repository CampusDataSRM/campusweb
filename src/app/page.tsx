import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/brand/logo";
import { STORE_LINKS } from "@/constants/site";

export const metadata: Metadata = {
  title: { absolute: "The Campus Web - Sign in" },
  description:
    "Every club and every event on campus, in one place. Sign in or browse as a guest.",
};

export default function SignInPage() {
  return (
    <main className="sign-in-page">
      <header className="sign-in-header">
        <Logo priority className="h-6 w-fit" />
        <Link href="/club/login">For campus clubs ↗</Link>
      </header>
      <div className="sign-in-layout">
        <section className="sign-in-pitch" aria-labelledby="welcome-title">
          <div className="sign-in-eyebrow">
            <span aria-hidden /> Clubs and events, in one place
          </div>
          <h1 id="welcome-title">
            Your campus.
            <br />
            What&apos;s on.
          </h1>
          <p>
            Every club, every event and the people behind them. One place to see
            what&apos;s happening around campus this week, and where to be.
          </p>
          <ol className="sign-in-features">
            <li>
              <span aria-hidden>01</span>
              <div>
                <strong>See what&apos;s on.</strong>
                <p>
                  Workshops, fests, talks and meetups across campus, in one
                  planner.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden>02</span>
              <div>
                <strong>Find your clubs.</strong>
                <p>
                  Browse every club, what they&apos;re up to and how to join.
                </p>
              </div>
            </li>
            <li>
              <span aria-hidden>03</span>
              <div>
                <strong>Never miss out.</strong>
                <p>
                  Like events, follow clubs and keep up with what&apos;s coming.
                </p>
              </div>
            </li>
          </ol>
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
