"use client";

import { Check, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ACCESS_DAYS, SUPPORT_EMAIL } from "@/constants/legal";
import { LEGAL_ROUTES, STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { ApiError } from "@/lib/api/axios-client";
import {
  createCashfreeOrder,
  paymentErrorMessage,
  verifyCashfreePayment,
  type VerifiedPayment,
} from "@/network-calls/cashfree-payment";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "production" }) => {
      checkout(options: {
        paymentSessionId: string;
        redirectTarget: "_modal";
      }): Promise<{
        error?: { message?: string };
        paymentDetails?: unknown;
      }>;
    };
  }
}

interface Attempt {
  requestId: string;
  orderId?: string;
}

function readAttempt(key: string): Attempt | null {
  try {
    const attempt = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      attempt &&
      /^[a-f0-9]{32}$/.test(attempt.requestId) &&
      (!attempt.orderId || /^cf_[a-f0-9]{40}$/.test(attempt.orderId))
    )
      return attempt;
  } catch {
    /* An unavailable store is handled before creating an order. */
  }
  return null;
}

export function PaymentView() {
  const { session, hydrated } = useSession();
  // Remount account-specific state when the signed-in account changes.
  if (!hydrated) return <p role="status">Loading your account…</p>;
  if (
    !session ||
    (session.kind !== "academia" && session.kind !== "student-portal")
  ) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Campus access"
          description="Sign in with your student account to pay ₹10."
        />
        <Link href="/" className="text-primary-accent underline">
          Go to sign in
        </Link>
      </div>
    );
  }
  return (
    <StudentPayment
      key={`${session.kind}:${session.netId}`}
      session={session}
    />
  );
}

function StudentPayment({
  session,
}: {
  session: NonNullable<ReturnType<typeof useSession>["session"]>;
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [hasAttempt, setHasAttempt] = useState(false);
  const [payment, setPayment] = useState<VerifiedPayment | null>(null);
  const locked = useRef(false);
  const mounted = useRef(true);
  const key = `cw-cashfree:${session.kind}:${session.netId.toLowerCase()}`;

  useEffect(() => {
    mounted.current = true;
    const attempt = readAttempt(key);
    if (attempt) {
      locked.current = true;
      void (async () => {
        if (mounted.current) {
          setHasAttempt(true);
          setBusy(true);
        }
        try {
          if (attempt.orderId) {
            const verified = await verifyCashfreePayment(
              session,
              attempt.orderId,
            );
            if (mounted.current) setPayment(verified);
          }
        } catch (error) {
          if (mounted.current) setMessage(paymentErrorMessage(error));
        } finally {
          locked.current = false;
          if (mounted.current) setBusy(false);
        }
      })();
    }
    return () => {
      mounted.current = false;
    };
  }, [key, session]);

  async function run(checkOnly = false) {
    if (locked.current || payment) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (!navigator.onLine)
        throw new Error(
          "Connect to the internet before paying or checking your payment.",
        );
      let attempt = readAttempt(key);
      if (attempt?.orderId) {
        try {
          const verified = await verifyCashfreePayment(
            session,
            attempt.orderId,
          );
          if (mounted.current) setPayment(verified);
          return;
        } catch (error) {
          if (checkOnly || !(error instanceof ApiError && error.status === 409))
            throw error;
        }
      }
      if (checkOnly)
        throw new Error("No checkout to check yet. Tap Pay ₹10 to start.");
      if (!window.Cashfree)
        throw new Error(
          "Checkout is still loading. Please try again in a moment.",
        );
      attempt ??= { requestId: crypto.randomUUID().replaceAll("-", "") };
      // Persist before the request: a timeout/reload retries the same idempotent order.
      localStorage.setItem(key, JSON.stringify(attempt));
      let order = await createCashfreeOrder(session, attempt.requestId);
      if (
        ["EXPIRED", "TERMINATED", "TERMINATION_REQUESTED"].includes(
          order.order_status,
        )
      ) {
        attempt = { requestId: crypto.randomUUID().replaceAll("-", "") };
        localStorage.setItem(key, JSON.stringify(attempt));
        order = await createCashfreeOrder(session, attempt.requestId);
      }
      attempt.orderId = order.order_id;
      localStorage.setItem(key, JSON.stringify(attempt));
      if (!mounted.current) return;
      setHasAttempt(true);
      if (order.order_status === "ACTIVE") {
        await window.Cashfree({ mode: "production" }).checkout({
          paymentSessionId: order.payment_session_id,
          redirectTarget: "_modal",
        });
      } else if (order.order_status !== "PAID") {
        throw new Error(
          "This checkout is unavailable. Please contact support.",
        );
      }
      // SDK completion (including closing the modal) is never proof of payment.
      const verified = await verifyCashfreePayment(session, order.order_id);
      if (mounted.current) setPayment(verified);
    } catch (error) {
      if (mounted.current) setMessage(paymentErrorMessage(error));
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <div className="campus-view flex flex-col gap-8">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        onReady={() => setSdkReady(true)}
        onError={() =>
          setMessage(
            "Could not load secure checkout. Refresh the page to try again.",
          )
        }
      />
      <PageHeader
        title="Campus access"
        description="One small payment. Your campus, sorted."
      />
      <section
        className="panel mx-auto w-full max-w-xl rounded-3xl p-6 sm:p-8"
        aria-label="Campus access payment"
      >
        <div className="mb-6 flex items-center gap-3 text-primary-accent">
          <ShieldCheck className="size-6" aria-hidden />
          <span className="text-sm font-semibold">
            Secure checkout with Cashfree
          </span>
        </div>
        {payment ? (
          <>
            <h2 className="flex items-center gap-2 text-h2 font-semibold">
              <Check aria-hidden /> Payment confirmed
            </h2>
            <p className="mt-3 text-on-surface-muted">
              Your ₹10 payment is confirmed. Campus access is active.
            </p>
            <Button
              className="mt-6 w-full"
              size="touch"
              render={<Link href={STUDENT_ROUTES.dashboard} />}
              nativeButton={false}
            >
              Back to dashboard
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-h2 font-semibold">All of Campus</h2>
            <p className="mt-3 text-5xl font-semibold tracking-tight">
              ₹10{" "}
              <span className="text-base font-normal tracking-normal text-on-surface-muted">
                / {ACCESS_DAYS} days
              </span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-muted">
              Attendance, marks, timetable and more. One-time payment. No
              automatic renewal.
            </p>
            <Button
              className="mt-7 w-full"
              size="touch"
              disabled={busy || !sdkReady}
              onClick={() => void run()}
            >
              {busy ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <CreditCard aria-hidden />
              )}
              {busy ? "Checking payment…" : "Pay ₹10"}
            </Button>
            {hasAttempt && (
              <Button
                className="mt-2 w-full"
                size="touch"
                variant="ghost"
                disabled={busy}
                onClick={() => void run(true)}
              >
                Already paid? Check status
              </Button>
            )}
            <p className="mt-4 text-center text-xs leading-relaxed text-on-surface-subtle">
              By paying, you agree to our{" "}
              <Link className="underline" href={LEGAL_ROUTES.terms}>
                terms
              </Link>{" "}
              and{" "}
              <Link className="underline" href={LEGAL_ROUTES.refunds}>
                refund policy
              </Link>
              .
            </p>
          </>
        )}
        <p
          role="status"
          aria-live="polite"
          className="mt-4 text-sm leading-relaxed text-on-surface-muted"
        >
          {message}
        </p>
      </section>
      <p className="text-center text-sm text-on-surface-muted">
        Need help?{" "}
        <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
          Contact support
        </a>
      </p>
    </div>
  );
}
