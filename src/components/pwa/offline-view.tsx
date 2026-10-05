"use client";

import { ArrowUpRight, RotateCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { navigationFor } from "@/constants/navigation";
import { useOnline } from "@/hooks/use-pwa";
import { cachedPagePaths } from "@/lib/pwa/sw-client";

const LABELS = (() => {
  const { items, utility } = navigationFor("academia");
  return new Map([...items, ...utility].map((item) => [item.href, item]));
})();

/**
 * What the service worker shows when a page can't be reached and has no
 * saved copy: the pages that do work offline, and a reload the moment the
 * connection is back.
 */
export function OfflineView() {
  const online = useOnline();
  const [saved, setSaved] = useState<string[] | null>(null);

  useEffect(() => {
    void cachedPagePaths().then((paths) =>
      setSaved(paths.filter((p) => LABELS.has(p))),
    );
  }, []);

  // The page that was asked for (the service worker passes it as ?from=).
  const [from] = useState(() => {
    if (typeof window === "undefined") return "/";
    const wanted =
      new URLSearchParams(window.location.search).get("from") ?? "";
    return wanted.startsWith("/") && !wanted.startsWith("//") ? wanted : "/";
  });
  const retry = () => window.location.replace(from);

  // Back online: go where the reader was heading.
  useEffect(() => {
    if (online && saved !== null && from !== "/offline") retry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, saved]);

  return (
    <main className="offline-page">
      <div className="offline-card panel">
        <Image
          unoptimized
          src="/manifest/icon-96x96.png"
          alt=""
          width={44}
          height={44}
          className="rounded-xl"
        />
        <p className="offline-kicker">
          <WifiOff aria-hidden className="size-3.5" />
          {online ? "Back online" : "You're offline"}
        </p>
        <h1>This page needs a connection.</h1>
        <p className="offline-body">
          Campus Web will pick up again on its own. Your attendance, marks and
          timetable were saved on this device, so the pages below still open.
        </p>
        <Button size="touch" onClick={retry}>
          <RotateCw aria-hidden /> Try again
        </Button>
        {saved && saved.length > 0 && (
          <nav aria-label="Saved pages" className="offline-saved">
            <h2>Available offline</h2>
            <ul>
              {saved.map((path) => {
                const item = LABELS.get(path)!;
                const Icon = item.icon;
                return (
                  <li key={path}>
                    <a href={path}>
                      <Icon aria-hidden className="size-4" />
                      {item.label}
                      <ArrowUpRight aria-hidden className="ml-auto size-4" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </main>
  );
}
