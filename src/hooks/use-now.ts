"use client";

import { useEffect, useState } from "react";

/**
 * The current time, re-rendering on the minute boundary (not every second):
 * enough for "now / next class" and meal switching, cheap on low-end phones.
 * Null until mounted, so server and client first renders agree.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = new Date();
      setNow(current);
      timer = setTimeout(tick, 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds()));
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return now;
}
