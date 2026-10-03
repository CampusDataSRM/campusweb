import { Check } from "lucide-react";
import type { Metadata } from "next";

import {
  ACCESS_DAYS,
  CURRENCY_CODE,
  LEGAL_NAME,
  PAYMENT_PROCESSOR,
  PLAN_AMOUNTS_INR,
  PLAN_INCLUSIONS,
  TRADE_NAME,
} from "@/constants/legal";

export const metadata: Metadata = {
  title: "Plans & pricing",
  description: `${ACCESS_DAYS} days of full access to The Campus Web, operated by ${LEGAL_NAME}.`,
};

/** A price list only - nothing here takes a payment. */
export default function PricingPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-h1 font-extrabold text-on-surface">Plans &amp; pricing</h1>
        <p className="text-on-surface-muted">
          {TRADE_NAME} sells one product: {ACCESS_DAYS} days of full access. Choose any amount - every tier unlocks exactly the same features. The higher amounts simply let you support development.
        </p>
      </header>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLAN_AMOUNTS_INR.map((amount) => (
          <li key={amount} className="flex items-end justify-between rounded-2xl panel p-5">
            <div>
              <p className="font-bold text-on-surface">{ACCESS_DAYS} days full access</p>
              <p className="text-sm text-on-surface-muted">One-time payment, never renews</p>
            </div>
            <p className="font-heading text-h1 font-extrabold text-on-surface tabular">₹{amount}</p>
          </li>
        ))}
      </ul>
      <section className="flex flex-col gap-3 rounded-2xl panel p-5">
        <h2 className="font-heading font-bold text-on-surface">Every plan includes</h2>
        <ul className="flex flex-col gap-2">
          {PLAN_INCLUSIONS.map((item) => (
            <li key={item} className="flex gap-2 text-on-surface-muted">
              <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-success-accent" /> {item}
            </li>
          ))}
        </ul>
        <p className="text-sm text-on-surface-muted">
          All prices are inclusive and charged in Indian Rupees ({CURRENCY_CODE}). Payments are processed by {PAYMENT_PROCESSOR}, which supports UPI, cards, net banking and wallets.
        </p>
      </section>
    </div>
  );
}
