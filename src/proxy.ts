/**
 * Routing on the session, before anything renders - so a signed-out visitor
 * never sees a protected page flash, and pages never redirect while their
 * session context hydrates.
 *
 * - `/`              sign-in; a signed-in student goes straight to /student.
 * - `/student/*`     needs a session. Guests may open only the public pages
 *                    (events, clubs); anything else sends them to events.
 * - `/club/*`        needs a usable club token, except the sign-in, sign-up
 *                    and password-reset pages.
 * Legal pages and assets are not matched at all.
 *
 * This is routing, not security: every API call is authorised by the
 * backend, which verifies the session itself.
 */

import { NextResponse, type NextRequest } from "next/server";

import { CLUB_SESSION_COOKIE, ROUTES, SESSION_COOKIE } from "@/constants/auth";
import { GUEST_STUDENT_PATHS, PUBLIC_CLUB_PATHS } from "@/constants/routes";
import { isClubTokenUsable } from "@/lib/auth/club-session";
import { parseSession } from "@/lib/auth/session";

const startsWithAny = (pathname: string, prefixes: readonly string[]) =>
  prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

function redirect(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSession(request.cookies.get(SESSION_COOKIE)?.value);
  const signedIn = session !== null && session.kind !== "guest";

  if (pathname === ROUTES.home) {
    return signedIn ? redirect(request, ROUTES.student) : NextResponse.next();
  }

  if (startsWithAny(pathname, [ROUTES.student])) {
    if (!session) return redirect(request, ROUTES.home);
    if (session.kind === "guest" && !startsWithAny(pathname, GUEST_STUDENT_PATHS)) {
      return redirect(request, GUEST_STUDENT_PATHS[0]);
    }
    return NextResponse.next();
  }

  if (startsWithAny(pathname, [ROUTES.club])) {
    const clubSignedIn = isClubTokenUsable(
      request.cookies.get(CLUB_SESSION_COOKIE)?.value,
    );
    const publicPage = startsWithAny(pathname, PUBLIC_CLUB_PATHS);
    if (!clubSignedIn && !publicPage) return redirect(request, ROUTES.clubLogin);
    if (clubSignedIn && publicPage) return redirect(request, ROUTES.club);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/student/:path*", "/club/:path*"],
};
