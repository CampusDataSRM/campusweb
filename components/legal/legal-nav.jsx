"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import FloatingNavbar from "@/components/global/floatingNavbar";
import { isGuestSession } from "@/functions/guest/guest-session";

// Legal pages are public. A visitor with a session - student, demo or guest -
// keeps their navigation; anyone else just reads the page.
const LegalNav = () => {
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    setHasSession(Boolean(Cookies.get("X-CSRF-Token")) || isGuestSession());
  }, []);
  return hasSession ? <FloatingNavbar /> : null;
};

export default LegalNav;
