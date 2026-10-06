# Campus Web payment

This branch contains only a public ₹10 Cashfree checkout at `/`. There is no
student login, dashboard, club portal, academic data, or new subscription.
Old `/student/*`, `/club/*`, and `/payment` URLs redirect to checkout.

## Run

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Use the same production merchant settings as CampusAPI, configured as **server
environment variables** on the payment deployment:

- `CASHFREE_ENV=production`
- `CASHFREE_CLIENT_ID`
- `CASHFREE_CLIENT_SECRET`

Do not prefix these with `NEXT_PUBLIC_` or commit their values. Whitelist
`payment.campusweb.in` in Cashfree. This app needs a Next.js server, not a static
export. No CampusAPI URL or university credentials are required.

Orders are fixed to ₹10 INR on the server. A random browser request ID maps to
a stable merchant order ID for retries. Confirmation requires a PAID order and
a matching SUCCESS transaction fetched from Cashfree, never an SDK callback.
Pending payments can be checked again; expired orders can be restarted.

These standalone `web_` orders are payment tests/receipts. They do not grant
student access or create CampusAPI payment records. The existing CampusAPI
webhook configuration is not changed by this branch; it does not fulfill these
standalone orders. Cashfree's order/payment API is the source of confirmation.

## Verify

```sh
npm test
npm run lint
npm run build
```

Tests use mocked provider responses; no money is transferred by them. Verify a
real payment on the configured deployment separately.

[Cashfree integration reference](https://www.cashfree.com/docs/payments/online/web/redirect)
