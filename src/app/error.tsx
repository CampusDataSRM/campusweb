"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/auth";

/**
 * A render crash. Never signs anyone out: "Try again" re-renders the segment,
 * and the dashboard link starts fresh. The error is logged for debugging;
 * nothing technical is shown to students.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-6 px-page text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-danger-container text-danger-accent">
        <TriangleAlert aria-hidden className="size-8" />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-h2 font-extrabold text-on-surface">Something went wrong</h1>
        <p className="text-on-surface-muted">This page hit a problem. You&apos;re still signed in - try again, or head back to your dashboard.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button size="touch" onClick={reset}>
          <RotateCw aria-hidden /> Try again
        </Button>
        <Button variant="outline" size="touch" render={<Link href={ROUTES.student} />} nativeButton={false}>
          Go to dashboard
        </Button>
      </div>
    </main>
  );
}
