# Unified session verification

Verified on 8 October 2026 IST, using the `loop/cashfree-pay-10` worktree.

## Request audit

Both `studentRequestConfig` and `studentPortalRequestConfig` carry the unified
`X-Session-Token` when present. The portal builder also keeps `withCredentials`.
Both preserve the legacy `X-CSRF-Token` and `X-Net-ID` headers. No active student
API endpoint was found missing the unified header.

| Feature                      | Authenticated calls / source                                                  |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Dashboard, attendance, marks | `/auth/user` through `LiveStudentDataApi`                                     |
| Timetable                    | `/auth/timetable/{batch}` through `LiveStudentDataApi`                        |
| Planner                      | `/auth/planner` or cached planner through `LiveStudentDataApi`                |
| Events, clubs                | `/users/allevent`, `/users/allclub` through `LiveStudentDataApi`              |
| Event/club likes             | `/users/eventaction`, `/users/clubaction` through shared student config       |
| Portal unlock                | `/student-portal/login`, `/student-portal/attendance` through portal config   |
| Portal marks fetcher         | `/student-portal/marks` accepts the portal config; no active UI caller        |
| Devices                      | GET/DELETE `/sessions`, DELETE `/sessions/{id}` through shared student config |
| Sign out                     | `/auth/logoutuser` through shared student config                              |
| CGPA                         | Seeded from the authenticated profile; calculation is local                   |
| Mess                         | Local menu constants; no authenticated backend request                        |

Batch, feedback and force-refresh fetchers also preserve their supplied request
config; they have no active UI callers in this branch. Public catalogue assets,
club JWT requests and standalone Cashfree checkout are separate from student auth.
QR login uses only POST `/qr/create` and polling GET `/qr/status`; there is no SSE.

## Repairs in this verification pass

- Student Portal reauthentication now saves a rotated unified token before
  attendance/profile calls. An Academia session linking the portal retains its
  Academia token. A failed portal response no longer proceeds to attendance.
- Remote revocation still clears `cw-session` in the central Axios error path.
  Concurrent failures trigger one redirect. A public hash marker carries the
  sign-out reason through the full reload, displays the toast, and is removed
  from the URL. No auth material is placed in this marker.
- Device last activity is relative and updates while the page is open.
- Axios's fetch adapter adds `User-Agent: axios/...`; Firefox sends that custom
  header in its CORS preflight. Locking this header off lets browsers use their
  natural user agent without the unexpected preflight header.

## Verified evidence

- 35 automated tests passed, covering QR lifecycle/provider metadata, friendly
  device labels, cookie parsing, both request builders, and legacy compatibility.
- Production build/TypeScript and focused ESLint passed.
- Browser fixtures passed password and QR provider selection, reload persistence,
  per-device and other-device revocation, ordinary-401 preservation, legacy-cookie
  compatibility, relative activity and remote-sign-out message after reload.
- Portal-unlock browser fixtures confirmed rotation/persistence, immediate use of
  the new token, preservation of an Academia token, and no attendance on failure.
- Firefox fixtures confirmed no explicit User-Agent header and unified headers on
  profile and device requests.
- Live `payment.campusweb.in`: QR create/status returned 200, phone approval reached
  `/student`, `cw-session` contained a unified token, and GET `/sessions` returned
  200 with a current web session. Live profile/devices requests carried the token.
- Live CORS allows the origin and all required unified/device headers.

## Remaining live acceptance

The two-browser revoke sequence and first-year sequence require phone approvals
and deployment of this repair commit. They are not claimed complete here.

The live API recorded the approved QR session as `Web (QR login)` with an empty
platform. The browser sends friendly `X-Device-Name` and `X-Device-Platform: web`
on both QR create/status requests (confirmed in Firefox). Correct stored device
metadata still needs backend verification; changing frontend display labels would
not prove the backend captured it.
