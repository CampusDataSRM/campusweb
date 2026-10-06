"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "campus-payment-request";
declare global {
  interface Window {
    Cashfree?: (options: { mode: "production" }) => {
      checkout(options: {
        paymentSessionId: string;
        redirectTarget: "_modal";
      }): Promise<unknown>;
    };
  }
}
interface Result {
  status?: "paid" | "pending" | "expired" | "not_created";
  order_status?: string;
  payment_session_id?: string;
  order_id?: string;
  message?: string;
}
function readId() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && /^[a-f0-9]{32}$/.test(saved) ? saved : null;
}
async function call(
  action: "order" | "verify",
  id: string,
  phone?: string,
): Promise<Result> {
  const response = await fetch("/api/payment/" + action, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request_id: id, ...(phone ? { phone } : {}) }),
    cache: "no-store",
    signal: AbortSignal.timeout(40_000),
  });
  const result: Result = await response.json();
  if (!response.ok)
    throw new Error(result.message ?? "Checkout is unavailable. Please retry.");
  return result;
}
export function PaymentCheckout() {
  const [phone, setPhone] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState("");
  const [hasAttempt, setHasAttempt] = useState(false);
  const lock = useRef(false);
  function showResult(result: Result) {
    if (result.status === "paid") {
      setPaid(true);
      setMessage("Your ₹10 payment is confirmed. Thank you.");
    } else if (result.status === "expired") {
      localStorage.removeItem(STORAGE_KEY);
      setHasAttempt(false);
      setMessage("This checkout expired. You can start a new payment.");
    } else if (result.status === "not_created")
      setMessage("Checkout has not started yet. Tap Pay ₹10 to retry.");
    else
      setMessage(
        "Payment is still being confirmed. If you paid, check status before trying again.",
      );
  }
  useEffect(() => {
    let active = true;
    // Retire the full app's worker so cached login screens cannot reappear.
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker
        .getRegistrations()
        .then((items) => Promise.all(items.map((item) => item.unregister())));
    if ("caches" in window)
      void caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("cw-"))
              .map((key) => caches.delete(key)),
          ),
        );
    void (async () => {
      try {
        const id = readId();
        if (!id) return;
        lock.current = true;
        setBusy(true);
        setHasAttempt(true);
        const result = await call("verify", id);
        if (active) showResult(result);
      } catch (error) {
        if (active)
          setMessage(
            error instanceof Error ? error.message : "Could not check payment.",
          );
      } finally {
        lock.current = false;
        if (active) setBusy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  async function pay(checkOnly = false) {
    if (lock.current || paid) return;
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      if (!navigator.onLine)
        throw new Error("Connect to the internet to continue.");
      let id = readId();
      if (id) {
        const result = await call("verify", id);
        if (result.status === "paid" || checkOnly) {
          showResult(result);
          return;
        }
        if (result.status === "expired") {
          localStorage.removeItem(STORAGE_KEY);
          id = null;
        }
      }
      if (checkOnly) throw new Error("Start a payment first.");
      if (!/^[6-9][0-9]{9}$/.test(phone))
        throw new Error("Enter a valid 10-digit Indian mobile number.");
      if (!window.Cashfree)
        throw new Error("Secure checkout is still loading. Please retry.");
      id ??= crypto.randomUUID().replaceAll("-", "");
      localStorage.setItem(STORAGE_KEY, id);
      setHasAttempt(true);
      const order = await call("order", id, phone);
      if (order.order_status === "ACTIVE" && order.payment_session_id)
        await window
          .Cashfree({ mode: "production" })
          .checkout({
            paymentSessionId: order.payment_session_id,
            redirectTarget: "_modal",
          });
      else if (order.order_status !== "PAID")
        throw new Error(
          "This checkout is unavailable. Check its status and retry.",
        );
      // SDK completion is never proof that money was received.
      showResult(await call("verify", id));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not complete payment. Please retry.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <main className="payment-page">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        onReady={() => setReady(true)}
        onError={() =>
          setMessage("Could not load Cashfree. Refresh the page to retry.")
        }
      />
      <header className="brand">
        <Image src="/logo_png.png" alt="" width={32} height={32} priority />
        The Campus Web
      </header>
      <section className="checkout" aria-label="₹10 payment">
        <div className="eyebrow">
          <span aria-hidden>◇</span> Secure payment
        </div>
        <h1>{paid ? "Payment confirmed" : "Just ₹10."}</h1>
        <p className="description">
          {paid
            ? "You’re all set."
            : "One payment. No sign-in. No subscription."}
        </p>
        {!paid && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void pay();
            }}
          >
            <div className="amount">
              <span>Total to pay</span>
              <strong>
                ₹10.00 <small>INR</small>
              </strong>
            </div>
            <label htmlFor="phone">Mobile number</label>
            <div className="phone-field">
              <span>+91</span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                required
                disabled={busy}
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />
            </div>
            <button
              className="pay-button"
              type="submit"
              disabled={busy || !ready}
            >
              {busy ? "Checking payment…" : "Pay ₹10"}
              <span aria-hidden>↗</span>
            </button>
          </form>
        )}
        {!paid && hasAttempt && (
          <button
            className="check-button"
            disabled={busy}
            onClick={() => void pay(true)}
          >
            Already paid? Check status
          </button>
        )}
        <p className="status" role="status" aria-live="polite">
          {message}
        </p>
        <div className="processor">
          Payments secured by <strong>Cashfree</strong>
        </div>
      </section>
      <footer>
        <div>
          <a href="https://campusweb.in/terms">Terms</a>
          <a href="https://campusweb.in/refund-policy">Refund policy</a>
          <a href="mailto:yourcampusweb@gmail.com">Help</a>
        </div>
        <p>Ashutosh Anand · The Campus Web</p>
      </footer>
    </main>
  );
}
