"use client";

import Image from "next/image";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  appCheckoutReceiptKey,
  appCheckoutReturnPath,
  appPaymentReturnUrl,
  parseAppCheckout,
  parseAppCheckoutReceipt,
  parseAppCheckoutReturn,
  serializeAppCheckoutReceipt,
  type AppCheckout,
  type AppCheckoutReceipt,
} from "@/lib/app-checkout";

// Browser values only select checkout/receipt. The signed-in Flutter app must
// verify this exact order with CampusAPI before activating student access.
declare global {
  interface Window {
    CampusCheckout?: { postMessage(message: string): void };
  }
}

export function AppPaymentCheckout({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [checkout, setCheckout] = useState<
    AppCheckout | AppCheckoutReceipt | null
  >(null);
  const [checkingReturn, setCheckingReturn] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState("Preparing your payment…");
  const lock = useRef(false);
  const autoOpened = useRef(false);
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const hasHandoff = !!window.location.hash;
        let savedReceipt = window.history.state?.appCheckoutReceipt ?? null;
        try {
          savedReceipt =
            window.sessionStorage.getItem(appCheckoutReceiptKey) ??
            savedReceipt;
        } catch {
          /* History remains available. */
        }
        const data = hasHandoff
          ? parseAppCheckout(window.location.hash)
          : (parseAppCheckoutReturn(window.location.search) ??
            parseAppCheckoutReceipt(savedReceipt));
        const receipt = serializeAppCheckoutReceipt(data);
        try {
          window.sessionStorage.setItem(appCheckoutReceiptKey, receipt);
        } catch {
          /* History is the fallback. */
        }
        // Keep the payment session out of browser history and future referrers.
        window.history.replaceState(
          { appCheckoutReceipt: receipt },
          "",
          appCheckoutReturnPath(data, embedded),
        );
        setCheckout(data);
        setCheckingReturn(!hasHandoff);
        setMessage("");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not open app checkout.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [embedded]);

  const pay = useCallback(
    async (checkOnly = false) => {
      if (!checkout || paid || lock.current) return;
      lock.current = true;
      setBusy(true);
      setMessage("");
      try {
        if (!navigator.onLine)
          throw new Error("Connect to the internet to continue.");
        if (!checkOnly) {
          if (!("sessionId" in checkout))
            throw new Error("Return to Campus App to start a new checkout.");
          if (!window.Cashfree)
            throw new Error("Cashfree is still loading. Please retry.");
          await window.Cashfree({ mode: "production" }).checkout({
            paymentSessionId: checkout.sessionId,
            redirectTarget: "_modal",
          });
        }
        // Native completion is a hint only; CampusAPI verifies before closing.
        window.CampusCheckout?.postMessage("completed");
        const response = await fetch("/api/payment/app/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: checkout.orderId,
            amount: checkout.amount,
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(40_000),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message ?? "Could not confirm payment.");
        if (
          result.status === "paid" &&
          result.order_id === checkout.orderId &&
          result.amount === checkout.amount
        ) {
          setPaid(true);
          setMessage("Payment confirmed. Returning to Campus App…");
          // This is only a return hint; the signed-in app verifies its own saved order.
          window.location.assign(appPaymentReturnUrl(checkout));
        } else if (result.status === "expired") {
          setMessage(
            embedded
              ? "This checkout expired. Return and start a fresh payment."
              : "This checkout expired. Close this browser and start a fresh payment in Campus App.",
          );
        } else {
          setMessage(
            embedded
              ? "Payment is still being confirmed. You can return and check status."
              : "Payment is still being confirmed. Check again, or close this browser and check status in Campus App.",
          );
        }
      } catch (error) {
        setMessage(
          (error instanceof Error
            ? error.message
            : "Could not confirm payment.") +
            (embedded
              ? " Return and check status if you already paid."
              : " You can also close this browser and check status in Campus App."),
        );
      } finally {
        lock.current = false;
        setBusy(false);
      }
    },
    [checkout, paid, embedded],
  );

  useEffect(() => {
    if ((!ready && !checkingReturn) || !checkout || autoOpened.current) return;
    autoOpened.current = true;
    // Cashfree modal checkout embeds its window; no second user click is needed.
    void Promise.resolve().then(() => pay(checkingReturn));
  }, [ready, checkout, checkingReturn, pay]);

  const sdk = (
    <Script
      src="https://sdk.cashfree.com/js/v3/cashfree.js"
      onReady={() => setReady(true)}
      onError={() =>
        setMessage(
          "Could not load Cashfree. Close this browser and try again from Campus App.",
        )
      }
    />
  );
  if (embedded)
    return (
      <main className="embedded-checkout">
        {sdk}
        <div role="status" aria-live="polite">
          <span className="checkout-spinner" aria-hidden />
          <p>
            {message ||
              (paid ? "Confirming your payment…" : "Opening secure checkout…")}
          </p>
          {checkout && (
            <a className="embedded-retry" href={appPaymentReturnUrl(checkout)}>
              Return to Campus App
            </a>
          )}
          {message && checkout && !busy && !paid && (
            <button className="embedded-retry" onClick={() => void pay(true)}>
              Check payment status
            </button>
          )}
        </div>
      </main>
    );

  return (
    <main className="payment-page">
      {sdk}
      <header className="brand">
        <Image src="/logo_png.png" alt="" width={32} height={32} priority />
        Campus App
      </header>
      <section className="checkout" aria-label="Campus App payment">
        <div className="eyebrow">
          <span aria-hidden>◇</span> Secure payment
        </div>
        <h1>
          {paid
            ? "Payment confirmed"
            : checkout
              ? "Opening Cashfree…"
              : "Campus App payment"}
        </h1>
        <p className="description">
          {paid
            ? "Thank you for supporting Campus."
            : "Complete your payment in the Cashfree window."}
        </p>
        {checkout && !paid && (
          <>
            <div className="amount">
              <span>Total to pay</span>
              <strong>
                ₹{checkout.amount}.00 <small>INR</small>
              </strong>
            </div>
            {message && !busy && "sessionId" in checkout && (
              <button
                className="pay-button"
                disabled={!ready || busy}
                onClick={() => void pay()}
              >
                Open Cashfree again
                <span aria-hidden>↗</span>
              </button>
            )}
            <button
              className="check-button"
              disabled={busy}
              onClick={() => void pay(true)}
            >
              Already paid? Check status
            </button>
          </>
        )}
        <p className="status" role="status" aria-live="polite">
          {message}
        </p>
        {checkout && (
          <a className="check-button" href={appPaymentReturnUrl(checkout)}>
            Return to Campus App
          </a>
        )}
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
      </footer>
    </main>
  );
}
