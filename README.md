This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Phone QR login

Set `NEXT_PUBLIC_SERVE=https://api.campusweb.in/api` at **build time** (the Docker
build already accepts this argument). Serve the frontend over HTTPS. On the login
page, choose **Log in with phone**, scan in the signed-in CampusApp, and approve.
The browser uses the existing Academia session cookie and authenticated request
headers, then opens `/student`. No credentials or captcha are entered on the web.

QR channels and their secrets are ephemeral: nothing is saved in web storage,
URLs used for navigation, or query caches. The QR contains only the channel ID.
The status endpoint requires the secret as a query parameter over HTTPS; these
requests use no-store and no-referrer. Backend/access-log operators should redact
that parameter. Denied, expired, consumed, and failed channels stop polling and
allow **Refresh code**. Switching back to password login cancels the channel.

The full v2 site is restored on this branch; the existing standalone Cashfree
checkout lives at `/payment`, and the CampusApp checkout handoff stays at `/app`.
Configure `CASHFREE_ENV=production`, `CASHFREE_CLIENT_ID`, and
`CASHFREE_CLIENT_SECRET` on the server for those routes.

Run `npm test` for QR lifecycle and payment tests, and `npm run build` for the
production build and TypeScript checks. A real CampusApp scan/approval remains a
deployment/device acceptance check.

## Unified sessions and devices

New password logins capture the backend's unified session token; QR approvals
also select the Academia or Student Portal provider. The optional `sessionToken`
rides in `cw-session`, alongside the existing token and NetID. Authenticated calls
send `X-Session-Token` when available and retain their existing auth headers and
Student Portal credentials. Older sessions remain usable; sign in again to enable
device management.

Password-login and QR requests identify the browser with `X-Client: web`,
`X-Device-Platform: web`, and a browser/OS label in `X-Device-Name`. The API's CORS
configuration must allow these three headers plus `X-Session-Token` and the
frontend origin. On a 401 with `code: session_revoked`, the frontend clears its
session cookie and navigates back to login; other 401 codes keep existing error
handling.

Open **Settings → Devices** (`/student/settings/devices`) to list sessions, sign
out another device, or sign out everywhere else. Requests use `/sessions` under
the configured API base (which already includes `/api`). The current device has
no individual revoke action. The list refreshes after mutations, on window focus,
and every 30 seconds while the page is open.
