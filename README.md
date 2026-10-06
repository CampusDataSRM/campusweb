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

The public checkout origin defaults to `https://payment.campusweb.in`. For a
different preview/deployment domain, set `PAYMENT_SITE_URL` to its exact origin.
Origin validation and Cashfree return URLs use this public origin even when the
hosting proxy gives Next.js an internal request URL.

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

## Campus App browser checkout

Android uses an in-app browser; iOS retains its existing native Cashfree SDK.
The Flutter app creates its order through CampusAPI's authenticated
`/auth/payment/cashfree/order` endpoint, then opens `/app` in an in-app browser.
The URL fragment carries only `order_id`, `payment_session_id`, and `amount`
(10, 12, 15, or 20 INR). The page clears that fragment from history after loading.
There is no student credential, account identifier, or merchant secret in the URL.

The browser reuses that order; it never creates a standalone `web_` payment.
`/api/payment/app/verify` verifies Cashfree's receipt for display. The Flutter app
independently calls CampusAPI's authenticated verify endpoint for the exact
order before unlocking access. Existing CampusAPI webhooks fulfill these
account-bound `cf_` orders normally. Keep the same Cashfree merchant keys on
both services. Closing the browser returns to the payment dialog; bounded
confirmation polling and the app-resume check handle delayed payments.

Deploy this branch with `/app` before distributing the updated Flutter app.
Existing standalone checkout at `/` remains available.

## Verify

```sh
npm test
npm run lint
npm run build
```

Tests use mocked provider responses; no money is transferred by them. Verify a
real payment on the configured deployment separately.

[Cashfree integration reference](https://www.cashfree.com/docs/payments/online/web/redirect)
