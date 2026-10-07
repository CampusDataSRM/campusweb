"use client";

import { useEffect } from "react";

import { useSession } from "@/context/session-context";
import { useNavigation } from "@/hooks/use-navigation";
import { registerServiceWorker, warmPages } from "@/lib/pwa/sw-client";

/**
 * Registers the service worker once, then - when the browser is idle -
 * warms every page this session can reach into its cache, so the whole app
 * opens offline after the first visit, not only the pages already seen.
 */
export function ServiceWorker() {
  const { session, hydrated } = useSession();
  const { items, utility } = useNavigation();
  const signedIn = hydrated && session !== null && session.kind !== "guest";
  const urls = signedIn
    ? [...items, ...utility].map((item) => item.href).join("|")
    : "";

  useEffect(() => {
    void registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!urls) return;
    const idle =
      window.requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1));
    const timer = window.setTimeout(
      () => idle(() => void warmPages(urls.split("|"))),
      4000,
    );
    return () => window.clearTimeout(timer);
  }, [urls]);

  return null;
}
