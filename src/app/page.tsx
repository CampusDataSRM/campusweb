import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Logo } from "@/components/brand/logo";
import { STORE_LINKS } from "@/constants/site";

export const metadata: Metadata = {
  title: { absolute: "The Campus Web - Sign in" },
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
            <span aria-hidden /> Made for campus life
          </div>
          <h1 id="welcome-title">
            Your campus.
            <br />A little less chaos.
          </h1>
          <p>
            Classes, attendance, notes and everything happening around you. One
            place to keep up with your day.
          </p>
          <ol className="sign-in-features">
            <li>
              <span aria-hidden>01</span>
              <div>
                <strong>Know where you need to be.</strong>
                <p>Your timetable and day orders, always close.</p>
              </div>
            </li>
            <li>
              <span aria-hidden>02</span>
              <div>
                <strong>Keep your attendance in check.</strong>
                <p>See your margins and plan ahead.</p>
              </div>
            </li>
            <li>
              <span aria-hidden>03</span>
              <div>
                <strong>Find your people.</strong>
                <p>Discover clubs, events and life beyond class.</p>
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
        <span>Your campus. Your pace.</span>
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
