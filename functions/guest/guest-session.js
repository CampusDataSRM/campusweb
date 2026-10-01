import Cookies from "js-cookie";
import { clearDemoSession } from "@/functions/demo/student-demo";

// A credential-free browsing session, as in Campus App.
//
// Guests see only what The Campus Web owns and already serves publicly -
// campus clubs and events, from /api/users/allclub and /api/users/allevent,
// neither of which needs a session - and the legal pages. Everything sourced
// from a student's own institution account stays behind a real sign-in.
const GUEST_FLAG_KEY = "campuswebGuest";

export const isGuestSession = () => {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(GUEST_FLAG_KEY) !== "true") return false;
    // A real or demo session always wins; a leftover flag heals itself.
    if (Cookies.get("X-CSRF-Token")) {
      localStorage.removeItem(GUEST_FLAG_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Guest, demo and student sessions are mutually exclusive.
export const startGuestSession = () => {
  clearDemoSession();
  Cookies.remove("X-CSRF-Token");
  localStorage.setItem(GUEST_FLAG_KEY, "true");
};

export const clearGuestSession = () => {
  try {
    localStorage.removeItem(GUEST_FLAG_KEY);
  } catch {
    // A guest session carries nothing worth recovering.
  }
};
