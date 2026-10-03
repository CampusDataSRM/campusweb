/** Authentication constants shared by sign-in, session storage and routing. */

/** Appended to a bare username (`ab1234`) to make the institution login id. */
export const LOGIN_ID_DOMAIN = "@srmist.edu.in";

/** The evaluator/demo account: signs in against the demo endpoints only. */
export const DEMO_NET_ID = "campusdemo";

/**
 * When Academia answers first, how long to wait for the Student Portal before
 * committing - so a first-year account still lands on its Student Portal
 * session (the app's 750ms rule).
 */
export const STUDENT_PORTAL_GRACE_MS = 750;

/**
 * Stored in place of a token for Student Portal sessions: the real session is
 * an HttpOnly cookie on the API origin, sent with `withCredentials`.
 */
export const STUDENT_PORTAL_SESSION_MARKER = "sp_session=http_only";

/** Session cookie on the frontend origin - read by proxy.ts for routing. */
export const SESSION_COOKIE = "cw-session";
/** Club portal JWT cookie. */
export const CLUB_SESSION_COOKIE = "cw-club";
/** Thirty days - the same lifetime the backend gives a session. */
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const ROUTES = {
  home: "/",
  student: "/student",
  club: "/club",
  clubLogin: "/club/login",
  legal: "/legal",
} as const;
